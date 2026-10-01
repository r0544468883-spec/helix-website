'use server';

import { randomBytes } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrichEmail } from '@/lib/enrich';
import { scoreContact } from '@/lib/crm-score';
import { loadScoreInputs, rescoreContact } from '@/lib/crm-rescore';
import { isIsoDate, todayInIsrael, addMonthsIso, addDaysIso } from '@/lib/crm-dates';
import { whatsAppLink } from '@/lib/phone-il';
import { publicOriginFromHeaders } from '@/lib/public-origin';
import { sendAccessLink, type AccessLinkResult } from '@/lib/crm-access-link';
import { normalizeEmail } from '@/lib/crm-access-rules';
import { inviteErrorCode, inviteReasonText } from '@/lib/crm-invite-state';
import { disconnect as disconnectGoogle, googleAuth, getPeople, listEvents, markLapsed as markGoogleLapsed } from '@/lib/crm-google';
import { pickMeetings, type Meeting } from '@/lib/crm-meetings';
import { toRow as toGoogleRow } from '@/lib/crm-google-map';
import { workspaceMatchKeys } from '@/lib/crm-contact-keys';
import { normalizeEmail as normalizeEmailKey, normalizePhone as normalizePhoneKey } from '@/lib/crm-contact-match';
import {
  validateQuote, quoteProblemText, quoteTotals, formatQuoteNumber, formatMoney, VAT_RATE, SEND_MOVES_FROM,
  DEAL_STAGES_BEFORE_PROPOSAL, type QuoteLineInput, type BusinessSnapshot, type ClientSnapshot,
} from '@/lib/crm-quote';
import {
  STATUS_LEGACY, STALL_DAYS, DECLINE_REASONS, isContactStatus, statusKey, type ContactStatus, type DeclineReason,
} from '@/lib/crm-status';
import {
  getWorkspace, listAccessibleWorkspaces, canWrite, isAdminRole, isAssignableRole,
  canInvite, invitableRoles, canManageInvite,
  ACTIVE_WS_COOKIE, ACTIVE_WS_COOKIE_OPTIONS, type AccessibleWorkspace,
} from '@/lib/crm-workspace';
import { generateKey, API_SCOPES, isScope } from '@/lib/crm-api';
import { resolveMode } from '@/lib/autonomy/resolve';
import { runAutomationsForContact } from '@/lib/automations/engine';
import { validateContactDetails, problemText, type ContactDetailsInput } from '@/lib/crm-contact-fields';
import {
  businessFrom, validateBusiness, businessProblemText, sniffLogoType, LOGO_MAX_BYTES, LOGO_EXT,
  type Business, type BusinessInput,
} from '@/lib/crm-business';
import { getDict } from '@/lib/i18n';

// The four screens that show people, companies, deals and reminders. A write made in
// the drawer over any of them refreshes the screen behind it (crm-sidebar-four-screens).
function rev(locale: string) {
  for (const screen of ['', '/companies', '/deals', '/tasks']) revalidatePath(`/${locale}/dashboard/crm${screen}`);
}

// Role refusals. RLS (migration v20) is what actually stops the write; these run
// first so the user reads a Hebrew sentence instead of a policy error or a silent
// no-op. If a new action forgets its guard, the policy still refuses.
function readonlyRefusal(locale: string) {
  return { ok: false as const, error: 'readonly' as const, message: getDict(locale).crm.errReadonly };
}
function adminRefusal(locale: string) {
  return { ok: false as const, error: 'forbidden' as const, message: getDict(locale).crm.errAdminOnly };
}

// ---- Von's flagship example: "a deal is slipping" → detect + act -------------
// A deal is "stalled" if it is still open and its contact has had no activity
// for >= STALL_DAYS (crmLogActivity refreshes contact.last_activity_at).
// STALL_DAYS lives in lib/crm-status so the home work queue uses the same threshold.

export type StalledDeal = { id: string; title: string; days: number; contactId: string | null };

export async function crmDetectStalledDeals(locale: string): Promise<{ ok: false; error: string } | { ok: true; deals: StalledDeal[] }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const { data } = await c.supabase
    .from('crm_deals')
    .select('id, title, contact_id, crm_contacts(last_activity_at)')
    .eq('workspace_id', c.ws.workspaceId)
    .eq('status', 'open');
  const now = Date.now();
  const deals: StalledDeal[] = [];
  type Row = { id: string; title: string | null; contact_id: string | null; crm_contacts: { last_activity_at: string | null } | { last_activity_at: string | null }[] | null };
  for (const d of (data ?? []) as unknown as Row[]) {
    const contact = Array.isArray(d.crm_contacts) ? d.crm_contacts[0] : d.crm_contacts;
    const last = contact?.last_activity_at ? new Date(contact.last_activity_at).getTime() : 0;
    const days = last ? Math.floor((now - last) / 86_400_000) : 999;
    if (days >= STALL_DAYS) deals.push({ id: d.id, title: d.title ?? '(ללא שם)', days, contactId: d.contact_id });
  }
  return { ok: true, deals };
}

// Sweep stalled deals through the autonomy switch. crm.next_step is 'internal'
// (writes a follow-up activity in our own DB), so autopilot needs no risk_ack.
// advisor: just report; approve: create a review task; autopilot: create the
// concrete next-step activity so the pipeline self-heals.
export async function crmActOnStalledDeals(locale: string): Promise<{ ok: false; error: string } | { ok: true; mode: string; acted: number; found: number }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(locale);
  const found = await crmDetectStalledDeals(locale);
  if (!found.ok) return found;

  const mode = await resolveMode(c.supabase, c.ws.workspaceId, 'crm.next_step');
  if (mode === 'advisor') { rev(locale); return { ok: true, mode, acted: 0, found: found.deals.length }; }

  const type = mode === 'autopilot' ? 'next_step' : 'task';
  let acted = 0;
  for (const d of found.deals) {
    const body = mode === 'autopilot'
      ? `🤖 next step אוטומטי: העסקה "${d.title}" מידרדרת (${d.days} ימים ללא פעילות) — נקבע פולואפ להחייאה.`
      : `⚠️ לאישור: העסקה "${d.title}" מידרדרת (${d.days} ימים) — מומלץ next step.`;
    const { error } = await c.supabase.from('crm_activities').insert({
      workspace_id: c.ws.workspaceId, deal_id: d.id, contact_id: d.contactId, type, body,
    });
    if (!error) acted++;
  }
  rev(locale);
  return { ok: true, mode, acted, found: found.deals.length };
}

export async function crmSetAutonomy(featureKey: string, mode: 'advisor' | 'approve' | 'autopilot', riskAck: boolean, locale = 'he'): Promise<{ ok: boolean; error?: string; message?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  // autopilot הוא מה שמאפשר ל-CHIEF לכתוב עם service_role בלי אישור אנושי.
  // זו החלטה של מנהל workspace, לא של כל חבר. v20 אוכף את זה גם ב-RLS.
  if (!isAdminRole(c.ws.role)) return adminRefusal(locale);
  const { error } = await c.supabase.from('autonomy_settings').upsert(
    { workspace_id: c.ws.workspaceId, feature_key: featureKey, mode, risk_ack: riskAck, updated_at: new Date().toISOString() },
    { onConflict: 'workspace_id,feature_key' },
  );
  return error ? { ok: false, error: error.message } : { ok: true };
}

async function ctx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'auth' };
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) return { ok: false as const, error: 'workspace' };
  return { ok: true as const, supabase, user, ws };
}

// ---- ⌘K record index -------------------------------------------------------
// The palette needs to find people, not just screens. The workspace is resolved
// here from the session, never taken from the caller, so a client cannot ask for
// another tenant's records. Returns the active workspace id so the client can tell
// a workspace switch happened: the cookie that holds it is httpOnly and therefore
// invisible to the browser.
export type CrmSearchContact = { id: string; name: string; company?: string; role?: string; email?: string };
export type CrmSearchDeal = { id: string; title: string; stage: string; value: number; contactId: string | null; contactName?: string };
export type CrmSearchIndex = { workspaceId: string; contacts: CrmSearchContact[]; deals: CrmSearchDeal[] };

export async function crmSearchIndex(): Promise<{ ok: true; index: CrmSearchIndex } | { ok: false; error: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };

  const [contactsRes, dealsRes] = await Promise.all([
    c.supabase
      .from('crm_contacts')
      .select('id, full_name, email, role_title, crm_companies(name)')
      .eq('workspace_id', c.ws.workspaceId)
      .order('score', { ascending: false })
      .limit(500),
    c.supabase
      .from('crm_deals')
      .select('id, title, value, stage, contact_id, crm_contacts(full_name)')
      .eq('workspace_id', c.ws.workspaceId)
      .eq('status', 'open')
      .limit(300),
  ]);
  if (contactsRes.error || dealsRes.error) return { ok: false, error: 'failed' };

  const one = <T,>(v: T | T[] | null): T | undefined => (Array.isArray(v) ? v[0] : v ?? undefined);

  type CRow = { id: string; full_name: string | null; email: string | null; role_title: string | null; crm_companies: { name: string } | { name: string }[] | null };
  type DRow = { id: string; title: string | null; value: number | null; stage: string | null; contact_id: string | null; crm_contacts: { full_name: string } | { full_name: string }[] | null };

  const contacts: CrmSearchContact[] = ((contactsRes.data ?? []) as unknown as CRow[]).map((r) => ({
    id: r.id,
    name: r.full_name ?? '',
    company: one(r.crm_companies)?.name,
    role: r.role_title ?? undefined,
    email: r.email ?? undefined,
  }));

  const deals: CrmSearchDeal[] = ((dealsRes.data ?? []) as unknown as DRow[]).map((r) => ({
    id: r.id,
    title: r.title ?? '',
    stage: r.stage ?? 'lead',
    value: r.value ?? 0,
    contactId: r.contact_id,
    contactName: one(r.crm_contacts)?.full_name,
  }));

  return { ok: true, index: { workspaceId: c.ws.workspaceId, contacts, deals } };
}

export async function crmCreateContact(input: {
  locale: string; full_name: string; email?: string; phone?: string;
  role_title?: string; company_id?: string; status?: string; source?: string;
}) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  if (!input.full_name?.trim()) return { error: 'invalid' };
  // A status outside the nine is a caller bug, not something to silently default away.
  if (input.status !== undefined && !isContactStatus(input.status)) return { error: 'invalid' };
  const status = input.status ?? 'new';
  const enriched = input.email ? enrichEmail(input.email) : { isBusiness: false };
  const score = scoreContact({ is_business: enriched.isBusiness, company_id: input.company_id, status, phone: input.phone });
  const { data: created, error } = await c.supabase.from('crm_contacts').insert({
    owner_id: c.user.id, workspace_id: c.ws.workspaceId,
    full_name: input.full_name.trim(), email: input.email?.trim().toLowerCase() || null,
    phone: input.phone?.trim() || null, role_title: input.role_title?.trim() || null,
    company_id: input.company_id || null, source: input.source || 'manual',
    // the legacy pair is derived, never taken from the caller — see lib/crm-status.ts
    is_business: enriched.isBusiness, status, ...STATUS_LEGACY[status], score,
  }).select('id').single();
  if (error || !created) return { error: 'failed' };
  // fire 'contact.created' automations (best-effort; never blocks the create)
  try {
    const db = createAdminClient();
    if (db) await runAutomationsForContact(db, c.ws.workspaceId, 'contact.created', created.id as string);
  } catch { /* automation failures must not fail the contact create */ }
  rev(input.locale);
  return { ok: true };
}

export async function crmUpdateContact(input: { locale: string; id: string; status?: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  if (input.status !== undefined && !isContactStatus(input.status)) return { error: 'invalid' };
  const row = await loadScoreInputs(c.supabase, c.ws.workspaceId, input.id);
  if (!row) return { error: 'notfound' };
  const previous: ContactStatus = isContactStatus(row.status) ? row.status : 'new';
  const status = input.status ?? previous;
  const score = scoreContact({ ...row, status });
  // status and its legacy mirror move together, in one statement, always.
  const { error: upErr } = await c.supabase.from('crm_contacts')
    .update({ status, ...STATUS_LEGACY[status], score })
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId);
  if (upErr) return { error: 'failed' };
  // This is the one place a status changes after creation, so the history row lives here.
  const activityId = status !== previous
    ? await logStatusChange(c, input.locale, input.id, previous, status)
    : null;
  revalidatePath(`/${input.locale}/dashboard/crm/${input.id}`);
  rev(input.locale);
  return { ok: true as const, activityId, previous };
}

/**
 * Saves a contact's details from the drawer: name, phone, email, company, role,
 * LinkedIn, source and background (the `notes` column). The rules live in
 * lib/crm-contact-fields.ts, which the form already ran; the server decides. Not a
 * touch: no timeline row, and last touch stays. It rescores, because phone, LinkedIn,
 * company and a business email all feed the score. A contact outside the active
 * workspace updates zero rows, which reads as not found.
 */
export async function crmUpdateContactDetails(input: { locale: string; id: string } & ContactDetailsInput) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const checked = validateContactDetails(input);
  if (!checked.ok) {
    const p = checked.problems[0];
    return { error: 'invalid' as const, field: p.field, message: problemText(p, t, input.locale) };
  }
  const v = checked.value;
  // RLS checks the contact's workspace, not the company's, so the company is checked here.
  if (v.company_id) {
    const { data: company } = await c.supabase.from('crm_companies').select('id')
      .eq('id', v.company_id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
    if (!company) return { error: 'invalid' as const, field: 'company_id' as const, message: t.detSaveFailed };
  }
  const row = await loadScoreInputs(c.supabase, c.ws.workspaceId, input.id);
  if (!row) return { error: 'notfound' as const };
  const is_business = v.email ? enrichEmail(v.email).isBusiness : false;
  const score = scoreContact({ ...row, is_business, company_id: v.company_id, phone: v.phone, linkedin_url: v.linkedin_url });
  const { data, error } = await c.supabase.from('crm_contacts')
    .update({ ...v, is_business, score })
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId)
    .select('id');
  if (error) return { error: 'failed' as const };
  if (!data || data.length === 0) return { error: 'notfound' as const };
  revalidatePath(`/${input.locale}/dashboard/crm/${input.id}`);
  rev(input.locale);
  return { ok: true as const, score };
}

type Ctx = Extract<Awaited<ReturnType<typeof ctx>>, { ok: true }>;

/**
 * The timeline row for a status change: "{from} ← {to}" in the actor's language.
 * It is written straight into crm_activities, not through crmLogActivity, because a
 * status change is not a touch: last_activity_at, the needs-a-touch mark and the
 * score's recency part stay as they were (Eran, 2026-09-27). A failure here does not
 * fail the change: the stored status is what matters, so it is logged and the
 * caller gets no row to undo.
 */
async function logStatusChange(c: Ctx, locale: string, contactId: string, from: ContactStatus, to: ContactStatus): Promise<string | null> {
  const t = getDict(locale).crm;
  const body = t.statusMoved.replace('{from}', t[statusKey(from)]).replace('{to}', t[statusKey(to)]);
  const { data, error } = await c.supabase.from('crm_activities').insert({
    owner_id: c.user.id, workspace_id: c.ws.workspaceId, contact_id: contactId, type: 'status', body,
  }).select('id').single();
  if (error || !data) {
    console.error('[status history] not written:', error?.message);
    return null;
  }
  return data.id as string;
}

// The drawer offers undo for 8 seconds. The server allows a minute, so a slow
// network is not what decides whether the row goes.
const UNDO_WINDOW_MS = 60_000;

/**
 * Undoes one status change: restores `previous` (no new history row, not a touch)
 * and removes the row that change wrote. Members cannot delete under v20, so the
 * removal runs on the service-role client with every guard inside the DELETE
 * itself: this row, this workspace (from the session, never the caller), this
 * contact, type status, written by this user, under a minute old. When nothing is
 * removed, a reverse row keeps the timeline true instead.
 */
export async function crmUndoStatus(input: { locale: string; contact_id: string; activity_id: string | null; previous: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  if (!isContactStatus(input.previous)) return { error: 'invalid' };
  const row = await loadScoreInputs(c.supabase, c.ws.workspaceId, input.contact_id);
  if (!row) return { error: 'notfound' };
  const current: ContactStatus = isContactStatus(row.status) ? row.status : 'new';
  const previous = input.previous;
  const score = scoreContact({ ...row, status: previous });
  const { error: upErr } = await c.supabase.from('crm_contacts')
    .update({ status: previous, ...STATUS_LEGACY[previous], score })
    .eq('id', input.contact_id).eq('workspace_id', c.ws.workspaceId);
  if (upErr) return { error: 'failed' };

  let removed = false;
  const admin = input.activity_id ? createAdminClient() : null;
  if (admin && input.activity_id) {
    const since = new Date(Date.now() - UNDO_WINDOW_MS).toISOString();
    const { data, error } = await admin.from('crm_activities').delete()
      .eq('id', input.activity_id)
      .eq('workspace_id', c.ws.workspaceId)
      .eq('contact_id', input.contact_id)
      .eq('type', 'status')
      .eq('owner_id', c.user.id)
      .gte('created_at', since)
      .select('id');
    if (error) console.error('[status undo] row not removed:', error.message);
    removed = (data?.length ?? 0) > 0;
  }
  if (!removed && current !== previous) await logStatusChange(c, input.locale, input.contact_id, current, previous);
  revalidatePath(`/${input.locale}/dashboard/crm/${input.contact_id}`);
  rev(input.locale);
  return { ok: true as const };
}

/**
 * Adds a decline reason to the status row a change just wrote: "{from} ← נדחה · מחיר".
 * Only the user's own status row. A second pick replaces the first reason rather
 * than stacking them.
 */
export async function crmSetStatusReason(input: { locale: string; activity_id: string; reason: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  if (!(DECLINE_REASONS as readonly string[]).includes(input.reason)) return { error: 'invalid' };
  const { data: act } = await c.supabase.from('crm_activities').select('body')
    .eq('id', input.activity_id).eq('workspace_id', c.ws.workspaceId).eq('type', 'status').eq('owner_id', c.user.id)
    .maybeSingle();
  if (!act) return { error: 'notfound' };
  const t = getDict(input.locale).crm;
  const label = t[`reason_${input.reason as DeclineReason}`];
  const base = String(act.body).split(' · ')[0];
  const { error } = await c.supabase.from('crm_activities').update({ body: `${base} · ${label}` })
    .eq('id', input.activity_id).eq('workspace_id', c.ws.workspaceId).eq('type', 'status').eq('owner_id', c.user.id);
  if (error) return { error: 'failed' };
  rev(input.locale);
  return { ok: true as const };
}

// Deal stages in board order, plus lost. The column has no check constraint, so the
// actions are the gate.
const DEAL_STAGES = ['lead', 'qualified', 'meeting', 'proposal', 'negotiation', 'won', 'lost'] as const;

/** A deal value is shekels: a finite number, zero or more. NaN from "18k" is not zero. */
function isDealValue(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v) && v >= 0;
}

export async function crmCreateDeal(input: { locale: string; title: string; value?: number; contact_id?: string; company_id?: string; stage?: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  if (!input.title?.trim()) return { error: 'invalid' };
  if (input.value !== undefined && !isDealValue(input.value)) return { error: 'invalid' };
  if (input.stage !== undefined && !(DEAL_STAGES as readonly string[]).includes(input.stage)) return { error: 'invalid' };
  const { error } = await c.supabase.from('crm_deals').insert({
    owner_id: c.user.id, workspace_id: c.ws.workspaceId, title: input.title.trim(),
    value: input.value ?? 0, contact_id: input.contact_id || null, company_id: input.company_id || null, stage: input.stage || 'lead',
  });
  if (error) return { error: 'failed' };
  // An open deal is worth 20 points to its person, so the person rescores now.
  if (input.contact_id) {
    await rescoreContact(c.supabase, c.ws.workspaceId, input.contact_id);
    revalidatePath(`/${input.locale}/dashboard/crm/${input.contact_id}`);
  }
  rev(input.locale);
  return { ok: true };
}

export async function crmMoveDeal(dealId: string, stage: string, locale: string) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(locale);
  if (!(DEAL_STAGES as readonly string[]).includes(stage)) return { error: 'invalid' };
  const status = stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'open';
  const { data: moved, error } = await c.supabase.from('crm_deals').update({ stage, status })
    .eq('id', dealId).eq('workspace_id', c.ws.workspaceId).select('contact_id').maybeSingle();
  if (error) return { error: 'failed' };
  // Won or lost closes the deal, which can take the person's open-deal points away.
  if (moved?.contact_id) {
    await rescoreContact(c.supabase, c.ws.workspaceId, moved.contact_id as string);
    revalidatePath(`/${locale}/dashboard/crm/${moved.contact_id}`);
  }
  rev(locale);
  return { ok: true };
}

/** Title and value, edited in place from the person's drawer. Stage goes through crmMoveDeal. */
export async function crmUpdateDeal(input: { locale: string; id: string; title?: string; value?: number }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const patch: { title?: string; value?: number } = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) return { error: 'invalid' };
    patch.title = title;
  }
  if (input.value !== undefined) {
    if (!isDealValue(input.value)) return { error: 'invalid' };
    patch.value = input.value;
  }
  if (patch.title === undefined && patch.value === undefined) return { error: 'invalid' };
  const { data, error } = await c.supabase.from('crm_deals').update(patch)
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId).select('contact_id').maybeSingle();
  if (error) return { error: 'failed' };
  if (!data) return { error: 'notfound' };
  if (data.contact_id) revalidatePath(`/${input.locale}/dashboard/crm/${data.contact_id}`);
  rev(input.locale);
  return { ok: true as const };
}

// ---------- companies: added and renamed from the Companies screen ----------
// crm_companies has no unique index on name (a migration would fail on duplicates
// the Google import may already have made), so the check is here: the same name,
// ignoring case and surrounding spaces, is taken. Compared in code, not with ilike:
// PostgREST turns * in a pattern into a wildcard, and a workspace has few companies.

const COMPANY_NAME_MAX = 80;

function companyNameProblem(raw: string | undefined, t: ReturnType<typeof getDict>['crm']): { name: string } | { message: string } {
  const name = raw?.trim() ?? '';
  if (!name) return { message: t.coNameEmpty };
  if (Array.from(name).length > COMPANY_NAME_MAX) return { message: t.coNameLong };
  return { name };
}

async function companyNameTaken(
  supabase: Awaited<ReturnType<typeof createClient>>, workspaceId: string, name: string, exceptId?: string,
): Promise<boolean | null> {
  const { data, error } = await supabase.from('crm_companies').select('id, name')
    .eq('workspace_id', workspaceId).limit(5000);
  if (error) return null;
  const key = name.toLocaleLowerCase();
  return (data ?? []).some((r) => r.id !== exceptId && String(r.name ?? '').trim().toLocaleLowerCase() === key);
}

export async function crmCreateCompany(input: { locale: string; name: string }) {
  const c = await ctx();
  if (!c.ok) return { ok: false as const, error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const checked = companyNameProblem(input.name, t);
  if ('message' in checked) return { ok: false as const, error: 'invalid' as const, message: checked.message };
  const taken = await companyNameTaken(c.supabase, c.ws.workspaceId, checked.name);
  if (taken === null) return { ok: false as const, error: 'failed' as const, message: t.coCreateFailed };
  if (taken) return { ok: false as const, error: 'taken' as const, message: t.coNameTaken };
  const { data, error } = await c.supabase.from('crm_companies')
    .insert({ workspace_id: c.ws.workspaceId, owner_id: c.user.id, name: checked.name }).select('id').single();
  if (error || !data) return { ok: false as const, error: 'failed' as const, message: t.coCreateFailed };
  rev(input.locale);
  return { ok: true as const, id: data.id as string };
}

export async function crmRenameCompany(input: { locale: string; id: string; name: string }) {
  const c = await ctx();
  if (!c.ok) return { ok: false as const, error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const checked = companyNameProblem(input.name, t);
  if ('message' in checked) return { ok: false as const, error: 'invalid' as const, message: checked.message };
  // Only another company can make a name taken: "nurit ltd." → "Nurit Ltd." is allowed.
  const taken = await companyNameTaken(c.supabase, c.ws.workspaceId, checked.name, input.id);
  if (taken === null) return { ok: false as const, error: 'failed' as const, message: t.coRenameFailed };
  if (taken) return { ok: false as const, error: 'taken' as const, message: t.coNameTaken };
  const { data, error } = await c.supabase.from('crm_companies').update({ name: checked.name })
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId).select('id').maybeSingle();
  if (error) return { ok: false as const, error: 'failed' as const, message: t.coRenameFailed };
  if (!data) return { ok: false as const, error: 'notfound' as const, message: t.coRenameFailed };
  rev(input.locale);
  return { ok: true as const };
}

// ---------- the next step: one open crm_tasks row per person, earliest due first ----------

/**
 * Sets a next step: an open crm_tasks row on this contact. `due_in` is how the
 * freeze question asks for "in a month" / "in 3 months", computed here from the
 * Israeli date rather than trusted from the browser. Not a touch.
 */
export async function crmSetNextStep(input: {
  locale: string; contact_id: string; title: string; due_date?: string | null; due_in?: '1m' | '3m';
}) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const title = input.title?.trim() ?? '';
  if (!title) return { error: 'invalid' };
  let due: string | null = null;
  if (input.due_in) due = addMonthsIso(todayInIsrael(), input.due_in === '3m' ? 3 : 1);
  else if (input.due_date) {
    if (!isIsoDate(input.due_date)) return { error: 'invalid' };
    due = input.due_date;
  }
  // RLS checks the task's workspace, not the contact's, so the contact is checked here.
  const { data: contact } = await c.supabase.from('crm_contacts').select('id')
    .eq('id', input.contact_id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!contact) return { error: 'notfound' };
  const { data, error } = await c.supabase.from('crm_tasks').insert({
    owner_id: c.user.id, workspace_id: c.ws.workspaceId, contact_id: input.contact_id, title, due_date: due,
  }).select('id').single();
  if (error || !data) return { error: 'failed' };
  revalidatePath(`/${input.locale}/dashboard/crm/${input.contact_id}`);
  rev(input.locale);
  return { ok: true as const, id: data.id as string, due_date: due };
}

/**
 * Changes an open next step's title or due date, or marks it done. Done writes a
 * `task` row ("בוצע: …") straight into the timeline: history, not a touch.
 */
export async function crmUpdateTask(input: {
  locale: string; id: string; title?: string; due_date?: string | null; due_in?: '1m' | '3m'; done?: boolean;
}) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const patch: { title?: string; due_date?: string | null; status?: 'done' } = {};
  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) return { error: 'invalid' };
    patch.title = title;
  }
  if (input.due_in) patch.due_date = addMonthsIso(todayInIsrael(), input.due_in === '3m' ? 3 : 1);
  else if (input.due_date !== undefined) {
    if (input.due_date && !isIsoDate(input.due_date)) return { error: 'invalid' };
    patch.due_date = input.due_date || null;
  }
  if (input.done) patch.status = 'done';
  if (Object.keys(patch).length === 0) return { error: 'invalid' };
  const { data: task, error } = await c.supabase.from('crm_tasks').update(patch)
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId).eq('status', 'open')
    .select('contact_id, title').maybeSingle();
  if (error) return { error: 'failed' };
  if (!task) return { error: 'notfound' };
  if (input.done && task.contact_id) {
    const t = getDict(input.locale).crm;
    const { error: logErr } = await c.supabase.from('crm_activities').insert({
      owner_id: c.user.id, workspace_id: c.ws.workspaceId, contact_id: task.contact_id, type: 'task',
      body: t.taskDone.replace('{title}', String(task.title)),
    });
    if (logErr) console.error('[next step] done but not logged:', logErr.message);
  }
  if (task.contact_id) revalidatePath(`/${input.locale}/dashboard/crm/${task.contact_id}`);
  rev(input.locale);
  return { ok: true as const };
}

// The touches a person logs by hand. `status` and `task` rows are written only by
// their own actions, which is what lets days-in-status trust a status row.
const LOGGED_TYPES = ['note', 'email', 'call', 'meeting', 'whatsapp'] as const;

export async function crmLogActivity(input: { locale: string; contact_id?: string; deal_id?: string; type?: string; body: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  if (!input.body?.trim()) return { error: 'invalid' };
  const type = input.type || 'note';
  if (!(LOGGED_TYPES as readonly string[]).includes(type)) return { error: 'invalid' };
  const { error } = await c.supabase.from('crm_activities').insert({
    owner_id: c.user.id, workspace_id: c.ws.workspaceId, contact_id: input.contact_id || null,
    deal_id: input.deal_id || null, type, body: input.body.trim(),
  });
  // A touch that was not written must not read as saved: the drawer keeps the text.
  if (error) return { error: 'failed' };
  if (input.contact_id) {
    const nowIso = new Date().toISOString();
    const row = await loadScoreInputs(c.supabase, c.ws.workspaceId, input.contact_id);
    if (row) {
      const score = scoreContact({ ...row, last_activity_at: nowIso });
      await c.supabase.from('crm_contacts').update({ last_activity_at: nowIso, score }).eq('id', input.contact_id).eq('workspace_id', c.ws.workspaceId);
    }
  }
  rev(input.locale);
  return { ok: true };
}

// ---------- יצירת קשר: ווטסאפ ומייל 1:1 ----------

// The 1:1 email path must not become a campaign tool: the shared helix.co.il
// sending reputation is the thing at risk. Counted in Postgres and not in memory,
// because App Hosting may run more than one instance and a deploy resets memory.
const EMAIL_HOURLY_CAP = 20;
// Resend has no timeout of its own. Without this a dropped connection leaves the
// drawer spinning with nothing to tell the user.
const EMAIL_SEND_TIMEOUT_MS = 15_000;

/**
 * Records that WhatsApp was OPENED for a contact. Deliberately not "sent": the CRM
 * cannot observe whether Eran pressed send inside WhatsApp, and a timeline that
 * claims delivery it never saw is worse than one that admits the limit.
 * Delegates to crmLogActivity so the touch refreshes last_activity_at and rescores
 * through exactly the same path as a logged call.
 */
export async function crmLogWhatsApp(input: { locale: string; contact_id: string }) {
  const t = getDict(input.locale).crm;
  return crmLogActivity({ locale: input.locale, contact_id: input.contact_id, type: 'whatsapp', body: t.waLogged });
}

/**
 * Sends one email to one contact and records it. The activity row is written only
 * after Resend accepts, so a timeline entry means "accepted for delivery".
 * Send-only: replies land in the mailbox, not here.
 */
export async function crmSendEmail(input: { locale: string; contact_id: string; subject: string; body: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  // Before the send, not at the log: a viewer's email would otherwise go out
  // and only its timeline row would be refused.
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);

  const subject = input.subject?.trim() ?? '';
  const body = input.body?.trim() ?? '';
  if (!subject) return { error: 'subject' };
  if (!body) return { error: 'body' };

  const { data: contact } = await c.supabase
    .from('crm_contacts')
    .select('id, full_name, email')
    .eq('id', input.contact_id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!contact) return { error: 'notfound' };
  if (!contact.email) return { error: 'noemail' };

  // hourly cap, per workspace
  const hourAgo = new Date(Date.now() - 3_600_000).toISOString();
  const { data: recent } = await c.supabase
    .from('crm_activities')
    .select('created_at')
    .eq('workspace_id', c.ws.workspaceId).eq('type', 'email')
    .gte('created_at', hourAgo)
    .order('created_at', { ascending: true });
  if ((recent?.length ?? 0) >= EMAIL_HOURLY_CAP) {
    const oldest = recent?.[0]?.created_at as string | undefined;
    const resetAt = oldest ? new Date(new Date(oldest).getTime() + 3_600_000) : new Date(Date.now() + 3_600_000);
    return { error: 'rate', resetAt: resetAt.toISOString() };
  }

  if (!process.env.RESEND_API_KEY) return { error: 'unavailable' };

  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM ?? 'HELIX <noreply@helix.co.il>';
    const sent = await Promise.race([
      resend.emails.send({ from, to: contact.email as string, subject, text: body }),
      new Promise<{ error: { message: string } }>((resolve) =>
        setTimeout(() => resolve({ error: { message: 'timeout' } }), EMAIL_SEND_TIMEOUT_MS)
      ),
    ]);
    if (sent && 'error' in sent && sent.error) {
      console.error('[crmSendEmail]', sent.error.message);
      return { error: 'failed' };
    }
  } catch (e) {
    console.error('[crmSendEmail]', e instanceof Error ? e.message : 'unknown');
    return { error: 'failed' };
  }

  // Only now is it true that an email went out.
  const logged = await crmLogActivity({
    locale: input.locale, contact_id: input.contact_id, type: 'email',
    body: `${subject}\n\n${body}`,
  });
  if (logged && 'error' in logged && logged.error) {
    // The email is gone; failing to log it must not read as a failed send.
    console.error('[crmSendEmail] sent but not logged:', logged.error);
  }
  return { ok: true };
}

// ---------- סוכנות: ניהול לקוחות + מעבר ביניהם ----------

/** All workspaces the current user can act in (own + agency clients). Powers the switcher. */
export async function crmListWorkspaces(): Promise<{ ok: false; error: string } | { ok: true; workspaces: AccessibleWorkspace[]; activeId: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const workspaces = await listAccessibleWorkspaces({ id: c.user.id });
  return { ok: true, workspaces, activeId: c.ws.workspaceId };
}

/** Switch the active workspace (agency admins operating inside a client). Validated in getWorkspace. */
export async function crmSetActiveWorkspace(workspaceId: string): Promise<{ ok: boolean; error?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  const allowed = await listAccessibleWorkspaces({ id: c.user.id });
  if (!allowed.some((w) => w.id === workspaceId)) return { ok: false, error: 'forbidden' };
  (await cookies()).set(ACTIVE_WS_COOKIE, workspaceId, ACTIVE_WS_COOKIE_OPTIONS);
  return { ok: true };
}

// A client workspace's name: what the Team screen's card allows.
const CLIENT_NAME_MAX = 80;

/**
 * Turn the current workspace into an agency + add a client workspace beneath it,
 * from the Team screen's card. Admin only, and only from a workspace that is not
 * itself a client: listAccessibleWorkspaces resolves one level of agency → client,
 * so a client of a client would surface under the wrong parent.
 */
export async function crmCreateClientWorkspace(input: { locale: string; name: string }): Promise<{ ok: boolean; error?: string; id?: string; message?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  if (!isAdminRole(c.ws.role)) return adminRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const name = input.name?.trim();
  if (!name) return { ok: false, error: 'invalid' };
  if (Array.from(name).length > CLIENT_NAME_MAX) return { ok: false, error: 'invalid', message: t.errClientNameLong };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: 'workspace' };
  const { data: here } = await admin.from('crm_workspaces').select('parent_workspace_id').eq('id', c.ws.workspaceId).maybeSingle();
  if (here?.parent_workspace_id) return { ok: false, error: 'forbidden', message: t.errClientNested };
  // mark the parent as an agency (idempotent) + create the client beneath it
  await admin.from('crm_workspaces').update({ plan: 'agency' }).eq('id', c.ws.workspaceId);
  const { data: child, error } = await admin
    .from('crm_workspaces').insert({ name, created_by: c.user.id, parent_workspace_id: c.ws.workspaceId })
    .select('id').single();
  if (error || !child) return { ok: false, error: 'failed', message: t.errClientFailed };
  await admin.from('crm_members').insert({ workspace_id: child.id, user_id: c.user.id, role: 'agency_admin' });
  revalidatePath(`/${input.locale}/dashboard/crm`);
  revalidatePath(`/${input.locale}/dashboard/crm/team`);
  return { ok: true, id: child.id as string };
}

// ---------- Google: disconnecting (openspec: crm-connect-google-and-make) ----------

/**
 * "ניתוק": revokes the workspace's Google access at Google (best-effort, 5 s) and
 * removes the connection and its stored token. Imported contacts stay. Reports
 * whether Google confirmed the revoke, so the screen can say to finish there.
 */
export async function crmDisconnectGoogle(input: { locale: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!isAdminRole(c.ws.role)) return adminRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' as const, message: t.gDisconnectFailed };
  const r = await disconnectGoogle(admin, c.ws.workspaceId);
  if (!r.removed) return { error: 'failed' as const, message: t.gDisconnectFailed };
  revalidatePath(`/${input.locale}/dashboard/crm/connections`);
  rev(input.locale);
  return { ok: true as const, revoked: r.revoked };
}

// ---------- Google: importing picked contacts (openspec: crm-connect-google-and-make) ----------

const IMPORT_MAX = 500;
const RESOURCE_RE = /^people\/[A-Za-z0-9_-]{1,128}$/;

/**
 * Imports the Google contacts the person picked. The browser sends only Google's
 * resource names; the server re-reads those people from Google, re-checks them
 * against the workspace (email, or phone on digits), links or creates each company
 * by name, and creates the rest as leads (status חדש, source google_contacts)
 * through the user's own session, so RLS still decides. No automation runs: these
 * are existing relationships, not new leads. At most 500 at a time.
 */
export async function crmImportGoogleContacts(input: { locale: string; resourceNames: string[] }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const names = Array.from(new Set((input.resourceNames ?? []).filter((n) => typeof n === 'string' && RESOURCE_RE.test(n))));
  if (names.length === 0) return { error: 'invalid' as const, message: t.gImpNothing };
  if (names.length > IMPORT_MAX) return { error: 'too_many' as const, message: t.gImpTooMany };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' as const, message: t.gImpFailed };

  const g = await googleAuth(admin, c.ws.workspaceId);
  if (!g.ok) return { error: g.reason, message: g.reason === 'lapsed' ? t.gLapsedNotice : t.gImpFailed };
  const got = await getPeople(g.auth, names);
  if (!got.ok) {
    if (got.lapsed) await markGoogleLapsed(admin, c.ws.workspaceId, 'invalid_grant');
    return { error: got.lapsed ? 'lapsed' as const : 'failed' as const, message: got.lapsed ? t.gLapsedNotice : t.gImpFailed };
  }

  const db = c.supabase;
  const workspaceId = c.ws.workspaceId;
  const userId = c.user.id;
  const keys = await workspaceMatchKeys(db, workspaceId);
  const companies = new Map<string, string | null>();
  async function companyId(name: string | null): Promise<string | null> {
    if (!name) return null;
    const k = name.toLocaleLowerCase();
    if (companies.has(k)) return companies.get(k) ?? null;
    const { data: found } = await db.from('crm_companies').select('id')
      .eq('workspace_id', workspaceId).ilike('name', name.replace(/[%_\\]/g, (m) => `\\${m}`)).limit(1).maybeSingle();
    let id = (found?.id as string | undefined) ?? null;
    if (!id) {
      const { data: made } = await db.from('crm_companies')
        .insert({ workspace_id: workspaceId, owner_id: userId, name }).select('id').single();
      id = (made?.id as string | undefined) ?? null;
    }
    companies.set(k, id);
    return id;
  }

  let created = 0;
  let skipped = 0;
  for (const person of got.people) {
    const row = toGoogleRow(person, keys);
    if (!row) continue;
    if (row.known) { skipped++; continue; }
    const company_id = await companyId(row.company);
    const enriched = row.email ? enrichEmail(row.email) : { isBusiness: false };
    const score = scoreContact({ is_business: enriched.isBusiness, company_id, status: 'new', phone: row.phone });
    const { error } = await c.supabase.from('crm_contacts').insert({
      owner_id: c.user.id, workspace_id: c.ws.workspaceId,
      full_name: row.name, email: row.email, phone: row.phone, role_title: row.title,
      company_id, source: 'google_contacts',
      is_business: enriched.isBusiness, status: 'new', ...STATUS_LEGACY.new, score,
    });
    if (error) continue;
    created++;
    // The same person twice in one batch is created once.
    const e = normalizeEmailKey(row.email);
    const p = normalizePhoneKey(row.phone);
    if (e) keys.emails.add(e);
    if (p) keys.phones.add(p);
  }
  rev(input.locale);
  return { ok: true as const, created, skipped };
}

// ---------- Google: a lead's meetings (openspec: crm-connect-google-and-make) ----------

// One member per state, so a check on `state` narrows the answer in the drawer.
export type MeetingsAnswer =
  | { state: 'ok'; next: Meeting | null; past: Meeting[] }
  | { state: 'none' }
  | { state: 'no_email' }
  | { state: 'lapsed' }
  | { state: 'error' };

const DAY_MS = 86_400_000;

/**
 * The lead's next meeting and last three from the workspace's Google Calendar,
 * matched on attendee or organizer email, 180 days back and ahead. Read live and
 * never stored. The events call gets 4.5 seconds; the drawer's own 5-second limit is
 * what the lead's page keeps to, whatever is still running here.
 */
export async function crmContactMeetings(input: { locale: string; contactId: string }): Promise<MeetingsAnswer> {
  const c = await ctx();
  if (!c.ok) return { state: 'error' };
  const { data: contact } = await c.supabase.from('crm_contacts').select('email')
    .eq('id', input.contactId).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!contact) return { state: 'none' };
  const email = normalizeEmailKey(contact.email as string | null);
  if (!email) return { state: 'no_email' };
  const admin = createAdminClient();
  if (!admin) return { state: 'error' };
  const g = await googleAuth(admin, c.ws.workspaceId);
  if (!g.ok) return { state: g.reason === 'lapsed' ? 'lapsed' : g.reason === 'unavailable' ? 'error' : 'none' };
  const now = new Date();
  const r = await listEvents(g.auth, email, new Date(now.getTime() - 180 * DAY_MS), new Date(now.getTime() + 180 * DAY_MS), 4_500);
  if (!r.ok) {
    if (r.lapsed) {
      await markGoogleLapsed(admin, c.ws.workspaceId, 'invalid_grant');
      return { state: 'lapsed' };
    }
    return { state: 'error' };
  }
  return { state: 'ok', ...pickMeetings(r.events, email, now, input.locale) };
}

// ---------- A workspace of your own (openspec: crm-multi-workspace) ----------

/** A signed-in user, with or without a workspace: creating one needs nothing else. */
async function userCtx() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: 'auth' };
  return { ok: true as const, supabase, user };
}

const OWN_WORKSPACES_MAX = 10;

/**
 * A new workspace owned by the caller: they become its admin, and it becomes the
 * active one. Anyone signed in may create up to 10 (client workspaces don't count).
 * A workspace is never left without its admin: if the membership can't be stored,
 * the workspace is taken back.
 */
export async function crmCreateWorkspace(input: { locale: string; name: string }) {
  const u = await userCtx();
  if (!u.ok) return { ok: false as const, error: u.error };
  const t = getDict(input.locale).crm;
  const name = input.name?.trim() ?? '';
  if (!name) return { ok: false as const, error: 'invalid' as const, message: t.errWorkspaceNameRequired };
  if (Array.from(name).length > CLIENT_NAME_MAX) return { ok: false as const, error: 'invalid' as const, message: t.errWorkspaceNameLong };
  const admin = createAdminClient();
  if (!admin) return { ok: false as const, error: 'workspace' as const, message: t.errWorkspaceCreateFailed };

  const { count, error: countErr } = await admin.from('crm_workspaces')
    .select('id', { count: 'exact', head: true })
    .eq('created_by', u.user.id).is('parent_workspace_id', null);
  if (countErr) return { ok: false as const, error: 'failed' as const, message: t.errWorkspaceCreateFailed };
  if ((count ?? 0) >= OWN_WORKSPACES_MAX) return { ok: false as const, error: 'limit' as const, message: t.errWorkspaceLimit };

  const { data: ws, error } = await admin.from('crm_workspaces')
    .insert({ name, created_by: u.user.id }).select('id').single();
  if (error || !ws) return { ok: false as const, error: 'failed' as const, message: t.errWorkspaceCreateFailed };
  const { error: memErr } = await admin.from('crm_members')
    .insert({ workspace_id: ws.id, user_id: u.user.id, role: 'admin' });
  if (memErr) {
    await admin.from('crm_workspaces').delete().eq('id', ws.id);
    return { ok: false as const, error: 'failed' as const, message: t.errWorkspaceCreateFailed };
  }
  (await cookies()).set(ACTIVE_WS_COOKIE, ws.id as string, ACTIVE_WS_COOKIE_OPTIONS);
  revalidatePath(`/${input.locale}/dashboard/crm`);
  return { ok: true as const, id: ws.id as string };
}

// ---------- פרטי העסק: what a quote carries ----------
// Stored in crm_workspaces.business, read and written with the service role after
// the membership check. The document logo is business.logo_url; branding.logo_url
// stays the top bar's. See DESIGN.md — Business details.

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;
const LOGO_BUCKET = 'crm-business';

async function readBusiness(admin: Admin, workspaceId: string): Promise<Business> {
  const { data } = await admin.from('crm_workspaces').select('business').eq('id', workspaceId).maybeSingle();
  return businessFrom(data?.business);
}

/** A logo this workspace uploaded, removed best-effort. Never a file outside the workspace's folder. */
async function removeLogoFile(admin: Admin, workspaceId: string, url: string | null) {
  const marker = `/object/public/${LOGO_BUCKET}/`;
  const path = url && url.includes(marker) ? decodeURIComponent(url.split(marker)[1]) : null;
  if (!path || !path.startsWith(`${workspaceId}/`)) return;
  const { error } = await admin.storage.from(LOGO_BUCKET).remove([path]);
  if (error) console.error('[business logo] old file not removed:', error.message);
}

export async function crmSaveBusiness(input: { locale: string } & BusinessInput) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!isAdminRole(c.ws.role)) return adminRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const checked = validateBusiness(input);
  if (!checked.ok) {
    const p = checked.problems[0];
    return { error: 'invalid' as const, field: p.field, message: businessProblemText(p, t, input.locale) };
  }
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' as const };
  const current = await readBusiness(admin, c.ws.workspaceId);
  const { error } = await admin.from('crm_workspaces')
    .update({ business: { ...checked.value, logo_url: current.logo_url } })
    .eq('id', c.ws.workspaceId);
  if (error) return { error: 'failed' as const, message: t.bizSaveFailed };
  revalidatePath(`/${input.locale}/dashboard/crm/business`);
  return { ok: true as const };
}

/**
 * Stores the document logo: PNG, JPEG or WebP by content, 1 MB at most. The new
 * file is uploaded before the old one goes, so a failed upload keeps the old logo.
 */
export async function crmUploadBusinessLogo(form: FormData) {
  const locale = String(form.get('locale') ?? 'he');
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!isAdminRole(c.ws.role)) return adminRefusal(locale);
  const t = getDict(locale).crm;
  const file = form.get('file');
  if (!(file instanceof File)) return { error: 'invalid' as const, message: t.errBizLogoType };
  if (file.size > LOGO_MAX_BYTES) return { error: 'invalid' as const, message: t.errBizLogoSize };
  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffLogoType(bytes);
  if (!type) return { error: 'invalid' as const, message: t.errBizLogoType };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' as const };
  const path = `${c.ws.workspaceId}/logo-${Date.now()}.${LOGO_EXT[type]}`;
  const { error: upErr } = await admin.storage.from(LOGO_BUCKET).upload(path, bytes, { contentType: type, upsert: false });
  if (upErr) return { error: 'failed' as const, message: t.errBizLogoFailed };
  const url = admin.storage.from(LOGO_BUCKET).getPublicUrl(path).data.publicUrl;
  const current = await readBusiness(admin, c.ws.workspaceId);
  const { error } = await admin.from('crm_workspaces')
    .update({ business: { ...current, logo_url: url } })
    .eq('id', c.ws.workspaceId);
  if (error) {
    await admin.storage.from(LOGO_BUCKET).remove([path]);
    return { error: 'failed' as const, message: t.errBizLogoFailed };
  }
  await removeLogoFile(admin, c.ws.workspaceId, current.logo_url);
  revalidatePath(`/${locale}/dashboard/crm/business`);
  return { ok: true as const, url };
}

export async function crmRemoveBusinessLogo(input: { locale: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!isAdminRole(c.ws.role)) return adminRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' as const };
  const current = await readBusiness(admin, c.ws.workspaceId);
  const { error } = await admin.from('crm_workspaces')
    .update({ business: { ...current, logo_url: null } })
    .eq('id', c.ws.workspaceId);
  if (error) return { error: 'failed' as const, message: t.errBizLogoFailed };
  await removeLogoFile(admin, c.ws.workspaceId, current.logo_url);
  revalidatePath(`/${input.locale}/dashboard/crm/business`);
  return { ok: true as const };
}

// ---------- ניהול צוות (admin בלבד) ----------
// The CRM sends the invite itself: Supabase makes the one-time link and Resend
// sends the email (lib/crm-access-link.ts). What happened is stored on the invite
// row and shown on the Team screen. openspec: crm-team-invites.

const INVITE_DAYS = 30;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;
type InviteRow = { id: string; email: string; role: string; locale: string; send_count: number | null };

function roleLabelOf(role: string, t: ReturnType<typeof getDict>['crm']): string {
  return role === 'admin' ? t.roleAdmin
    : role === 'viewer' ? t.roleViewer
    : role === 'agency_admin' ? t.roleAgencyAdmin
    : t.roleMember;
}

const inviteExpiry = () => new Date(Date.now() + INVITE_DAYS * 86_400_000).toISOString();

/**
 * Sends an invite's email and records the outcome on its row. A send the limits
 * refuse changes nothing; any other outcome renews the invite for 30 days (the
 * row must exist before the link: the auth trigger checks it for a new account).
 */
async function sendInviteEmail(admin: AdminClient, c: Ctx, inv: InviteRow): Promise<AccessLinkResult> {
  const locale = inv.locale === 'en' ? 'en' : 'he';
  const t = getDict(locale).crm;
  const [{ data: me }, { data: w }] = await Promise.all([
    admin.from('profiles').select('name, username').eq('id', c.user.id).maybeSingle(),
    admin.from('crm_workspaces').select('name').eq('id', c.ws.workspaceId).maybeSingle(),
  ]);
  const res = await sendAccessLink(admin, {
    kind: 'invite',
    email: inv.email,
    locale,
    origin: await siteOrigin(),
    workspaceId: c.ws.workspaceId,
    inviteId: inv.id,
    invite: {
      inviterName: (me?.name as string | null) ?? (me?.username as string | null) ?? '',
      inviterEmail: c.user.email ?? null,
      workspaceName: (w?.name as string | null) ?? '',
      roleLabel: roleLabelOf(inv.role, t),
    },
  });
  if (!res.ok && (res.error === 'too_soon' || res.error === 'hourly_limit' || res.error === 'ip_limit')) return res;
  const now = new Date().toISOString();
  const { error } = await admin.from('crm_invites').update(res.ok
    ? {
      last_attempt_at: now, last_sent_at: now, send_count: (inv.send_count ?? 0) + 1, last_error: null,
      email_id: res.emailId, delivery: 'sent', delivery_checked_at: null, expires_at: inviteExpiry(),
    }
    : { last_attempt_at: now, last_error: inviteErrorCode(res), expires_at: inviteExpiry() },
  ).eq('id', inv.id);
  if (error) console.error('[invite] outcome not recorded', error.message);
  return res;
}

/** The action's answer for an invite send: sent, saved but not sent, or refused by the limits. */
function inviteSendAnswer(res: AccessLinkResult, email: string, t: ReturnType<typeof getDict>['crm']) {
  if (res.ok) return { ok: true as const, sent: true as const, message: t.inviteSentTo.replace('{email}', email) };
  if (res.error === 'too_soon') {
    return { ok: false as const, error: 'too_soon' as const, message: t.errSendTooSoon.replace('{seconds}', String(res.retryInSeconds)) };
  }
  if (res.error === 'hourly_limit' || res.error === 'ip_limit') {
    return { ok: false as const, error: 'hourly_limit' as const, message: t.errSendHourly };
  }
  const reason = inviteReasonText(inviteErrorCode(res) ?? 'link', t);
  return { ok: false as const, error: 'send_failed' as const, message: t.inviteSavedNotSent.replace('{reason}', reason) };
}

export async function crmInviteMember(input: { locale: string; email: string; role?: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  // Any member may invite (crm-multi-workspace); a viewer may not.
  if (!canInvite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  if (!input.email?.trim()) return { error: 'invalid' as const, message: t.errEmailRequired };
  const email = normalizeEmail(input.email);
  if (!email) return { error: 'invalid' as const, message: t.errEmailInvalid };
  // Refuse an unknown role rather than collapsing it to 'member' — a typo
  // must not silently hand out write access.
  const role = input.role ?? 'member';
  if (!isAssignableRole(role)) return { error: 'role', message: t.errInvalidRole };
  // A member invites below their own power: member or viewer, never an admin.
  if (!invitableRoles(c.ws.role).includes(role)) return { error: 'role' as const, message: t.errMemberInviteRole };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };

  // Someone already on this team: an invite would sit pending forever, because a
  // member never claims one.
  const { data: mem, error: memErr } = await admin.from('crm_members')
    .select('profiles(email)').eq('workspace_id', c.ws.workspaceId);
  if (memErr) return { error: 'failed' as const, message: t.errInviteFailed };
  const onTeam = (mem ?? []).some((r: Record<string, unknown>) => {
    const p = (Array.isArray(r.profiles) ? r.profiles[0] : r.profiles) as { email: string | null } | null;
    return (p?.email ?? '').trim().toLowerCase() === email;
  });
  if (onTeam) return { error: 'member' as const, message: t.errAlreadyOnTeam.replace('{email}', email) };

  // An address already pending: only an admin, or whoever sent that invite, may
  // send it again. The upsert below would otherwise overwrite its role and sender.
  const { data: pending, error: pendErr } = await admin.from('crm_invites')
    .select('invited_by').eq('workspace_id', c.ws.workspaceId).eq('email', email).maybeSingle();
  if (pendErr) return { error: 'failed' as const, message: t.errInviteFailed };
  if (pending && !canManageInvite(c.ws.role, (pending.invited_by as string | null) ?? null, c.user.id)) {
    return { error: 'pending' as const, message: t.errInvitePendingByOther };
  }

  // סדר הפעולות חשוב: שורת ההזמנה חייבת להיות בטבלה לפני יצירת הקישור,
  // כי הטריגר handle_new_user בודק מולה ודוחה כל מייל שאין לו הזמנה.
  const locale = input.locale === 'en' ? 'en' : 'he';
  const { data: inv, error: invErr } = await admin.from('crm_invites').upsert(
    { workspace_id: c.ws.workspaceId, email, role, invited_by: c.user.id, locale, expires_at: inviteExpiry() },
    { onConflict: 'workspace_id,email' },
  ).select('id, email, role, locale, send_count').single();
  // Without the invite row the auth trigger rejects the user, so stop here.
  if (invErr || !inv) {
    console.error('[crmInviteMember] invite row', invErr?.message);
    return { error: 'failed' as const, message: t.errInviteFailed };
  }

  const res = await sendInviteEmail(admin, c, inv as InviteRow);
  revalidatePath(`/${input.locale}/dashboard/crm/team`);
  const answer = inviteSendAnswer(res, email, t);
  // The invite is saved either way; only the email's fate differs.
  return answer.ok ? answer : { ok: true as const, sent: false as const, reason: answer.error, message: answer.message };
}

/** Sends a pending (or expired) invite's email again, with a fresh link. */
export async function crmResendInvite(input: { locale: string; id: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canInvite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  if (!UUID_RE.test(input.id)) return { error: 'notfound' as const, message: t.errInviteNotFound };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  const { data: inv, error } = await admin.from('crm_invites')
    .select('id, email, role, locale, send_count, invited_by')
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (error) return { error: 'failed' as const, message: t.inviteSavedNotSent.replace('{reason}', t.inviteErrUnavailable) };
  if (!inv) return { error: 'notfound' as const, message: t.errInviteNotFound };
  if (!canManageInvite(c.ws.role, (inv.invited_by as string | null) ?? null, c.user.id)) {
    return { error: 'forbidden' as const, message: t.errInviteNotYours };
  }
  const res = await sendInviteEmail(admin, c, inv as InviteRow);
  revalidatePath(`/${input.locale}/dashboard/crm/team`);
  return inviteSendAnswer(res, (inv.email as string), t);
}

/** Cancels one invite, by its id: never by an address pattern. */
export async function crmCancelInvite(input: { locale: string; id: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canInvite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  if (!UUID_RE.test(input.id)) return { error: 'notfound' as const, message: t.errInviteNotFound };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  const { data: inv, error: readErr } = await admin.from('crm_invites')
    .select('invited_by').eq('id', input.id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (readErr) return { error: 'failed' as const, message: t.errCancelInviteFailed };
  if (!inv) return { error: 'notfound' as const, message: t.errInviteNotFound };
  if (!canManageInvite(c.ws.role, (inv.invited_by as string | null) ?? null, c.user.id)) {
    return { error: 'forbidden' as const, message: t.errInviteNotYours };
  }
  const { error } = await admin.from('crm_invites').delete().eq('id', input.id).eq('workspace_id', c.ws.workspaceId);
  if (error) return { error: 'failed' as const, message: t.errCancelInviteFailed };
  revalidatePath(`/${input.locale}/dashboard/crm/team`);
  return { ok: true as const };
}

// ---------- מפתחות API (admin בלבד) ----------

export async function crmCreateApiKey(input: { locale: string; name: string; scopes?: string[] }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (c.ws.role !== 'admin') return { error: 'forbidden' };
  const name = input.name?.trim();
  if (!name) return { error: 'invalid' };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  const scopes = (input.scopes?.length ? input.scopes : [...API_SCOPES]).filter(isScope);
  if (!scopes.length) return { error: 'invalid' };
  const { raw, hash, prefix } = generateKey();
  const { error } = await admin.from('crm_api_keys').insert({
    workspace_id: c.ws.workspaceId, name, key_hash: hash, prefix, scopes, created_by: c.user.id,
  });
  if (error) return { error: 'failed' };
  revalidatePath(`/${input.locale}/dashboard/crm/api`);
  return { ok: true, key: raw }; // מוצג פעם אחת בלבד
}

/** The key the Connections screen makes for Make: adds contacts, nothing else. */
const MAKE_KEY_NAME = 'Make · Facebook Lead Ads';

/**
 * "יצירת מפתח ל-Make" on the Connections screen (openspec: crm-connect-google-and-make):
 * an ordinary API key, admin-made like any other, fixed to one name and to
 * contacts:write, so the Make scenario can add leads and can never read them.
 */
export async function crmCreateMakeKey(input: { locale: string }) {
  const res = await crmCreateApiKey({ locale: input.locale, name: MAKE_KEY_NAME, scopes: ['contacts:write'] });
  if (res.ok) revalidatePath(`/${input.locale}/dashboard/crm/connections`);
  return res;
}

export async function crmRevokeApiKey(input: { locale: string; id: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (c.ws.role !== 'admin') return { error: 'forbidden' };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  await admin.from('crm_api_keys')
    .update({ revoked_at: new Date().toISOString() })
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId);
  revalidatePath(`/${input.locale}/dashboard/crm/api`);
  return { ok: true };
}

export async function crmSetRole(input: { locale: string; userId: string; role: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!isAdminRole(c.ws.role)) return adminRefusal(input.locale);
  const role = input.role;
  if (!isAssignableRole(role)) return { error: 'role', message: getDict(input.locale).crm.errInvalidRole };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  await admin.from('crm_members').update({ role }).eq('workspace_id', c.ws.workspaceId).eq('user_id', input.userId);
  revalidatePath(`/${input.locale}/dashboard/crm/team`);
  return { ok: true };
}

export async function crmRemoveMember(input: { locale: string; userId: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!isAdminRole(c.ws.role)) return adminRefusal(input.locale);
  const t = getDict(input.locale).crm;
  if (input.userId === c.user.id) return { error: 'self' as const, message: t.errRemoveSelf };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  const { error } = await admin.from('crm_members').delete()
    .eq('workspace_id', c.ws.workspaceId).eq('user_id', input.userId);
  if (error) return { error: 'failed' as const, message: t.errRemoveFailed };
  revalidatePath(`/${input.locale}/dashboard/crm/team`);
  return { ok: true as const };
}

// ---------- הצעות מחיר: draft, send, cancel ----------
// A quote is drafted from a lead, numbered and frozen when it is sent, and shown to
// the client at /{locale}/q/{public_token}. Totals, the number, the snapshots and
// what a send moves are decided here, never taken from the browser.
// See DESIGN.md — Quote editor, and openspec crm-quotes.

/** The quote page's code: 32 random bytes, far beyond guessing. */
const newQuoteToken = () => randomBytes(32).toString('base64url');

export type QuoteSaveInput = {
  locale: string;
  id: string;
  subject: string;
  lines: QuoteLineInput[];
  notes: string;
  valid_until: string | null;
  /** An open deal of the quote's lead, or null for "עסקה חדשה". */
  deal_id: string | null;
};

/** The ids of a lead's open deals in this workspace: the only deals a quote may join. */
async function openDealIds(c: Ctx, contactId: string): Promise<string[]> {
  const { data } = await c.supabase.from('crm_deals').select('id')
    .eq('contact_id', contactId).eq('workspace_id', c.ws.workspaceId).eq('status', 'open');
  return ((data ?? []) as { id: string }[]).map((d) => d.id);
}

/**
 * The origin the user is on, so a link made on localhost opens on localhost. The
 * host header is checked against an allowlist first (lib/public-origin.ts).
 */
async function siteOrigin(): Promise<string> {
  return publicOriginFromHeaders(await headers());
}

export async function crmCreateQuote(input: { locale: string; contact_id: string; deal_id?: string | null }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const { data: contact } = await c.supabase.from('crm_contacts').select('id')
    .eq('id', input.contact_id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!contact) return { error: 'notfound' as const };
  const admin = createAdminClient();
  const business = admin ? await readBusiness(admin, c.ws.workspaceId) : businessFrom(null);
  // The deal asked for, or the lead's only open deal. With several and none named,
  // the editor asks; with none, the send creates one.
  const open = await openDealIds(c, input.contact_id);
  const dealId = input.deal_id && open.includes(input.deal_id) ? input.deal_id : open.length === 1 ? open[0] : null;
  const { data, error } = await c.supabase.from('crm_quotes').insert({
    workspace_id: c.ws.workspaceId,
    contact_id: input.contact_id,
    deal_id: dealId,
    status: 'draft',
    locale: input.locale === 'en' ? 'en' : 'he',
    subject: '',
    items: [],
    vat_rate: business.vat_exempt ? 0 : VAT_RATE,
    valid_until: addDaysIso(todayInIsrael(), business.validity_days),
    notes: business.default_notes || null,
    public_token: newQuoteToken(),
    created_by: c.user.id,
  }).select('id').single();
  if (error || !data) return { error: 'failed' as const, message: t.quoteCreateFailed };
  rev(input.locale);
  return { ok: true as const, id: data.id as string };
}

/** Saves a draft as typed. A sent or cancelled quote is never changed here. */
export async function crmSaveQuote(input: QuoteSaveInput) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const checked = validateQuote({ subject: input.subject, lines: input.lines, notes: input.notes }, 'draft');
  if (!checked.ok) {
    const p = checked.problems[0];
    return { error: 'invalid' as const, problem: p, message: quoteProblemText(p, t, input.locale) };
  }
  if (input.valid_until && !isIsoDate(input.valid_until)) return { error: 'invalid' as const, message: t.quoteSaveFailed };
  const { data: q } = await c.supabase.from('crm_quotes').select('contact_id, status')
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!q) return { error: 'notfound' as const };
  if (q.status !== 'draft') return { error: 'locked' as const };
  if (input.deal_id && !(await openDealIds(c, q.contact_id as string)).includes(input.deal_id)) {
    return { error: 'invalid' as const, message: t.quoteSaveFailed };
  }
  const admin = createAdminClient();
  const business = admin ? await readBusiness(admin, c.ws.workspaceId) : businessFrom(null);
  const vatRate = business.vat_exempt ? 0 : VAT_RATE;
  const totals = quoteTotals(checked.value.lines, vatRate);
  const { data, error } = await c.supabase.from('crm_quotes').update({
    subject: checked.value.subject,
    items: checked.value.lines,
    notes: checked.value.notes || null,
    valid_until: input.valid_until || null,
    deal_id: input.deal_id,
    vat_rate: vatRate,
    ...totals,
    updated_at: new Date().toISOString(),
  }).eq('id', input.id).eq('workspace_id', c.ws.workspaceId).eq('status', 'draft').select('id');
  if (error) return { error: 'failed' as const, message: t.quoteSaveFailed };
  if (!data || data.length === 0) return { error: 'locked' as const };
  revalidatePath(`/${input.locale}/dashboard/crm/quotes/${input.id}`);
  rev(input.locale);
  return { ok: true as const, ...totals };
}

/** A new draft with the same subject, lines, notes and deal, a fresh validity and no number. */
export async function crmDuplicateQuote(input: { locale: string; id: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const { data: src } = await c.supabase.from('crm_quotes')
    .select('contact_id, deal_id, locale, subject, items, notes')
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!src) return { error: 'notfound' as const };
  const admin = createAdminClient();
  const business = admin ? await readBusiness(admin, c.ws.workspaceId) : businessFrom(null);
  const open = src.contact_id ? await openDealIds(c, src.contact_id as string) : [];
  const { data, error } = await c.supabase.from('crm_quotes').insert({
    workspace_id: c.ws.workspaceId,
    contact_id: src.contact_id,
    deal_id: src.deal_id && open.includes(src.deal_id as string) ? src.deal_id : null,
    status: 'draft',
    locale: src.locale,
    subject: src.subject,
    items: src.items,
    notes: src.notes,
    vat_rate: business.vat_exempt ? 0 : VAT_RATE,
    valid_until: addDaysIso(todayInIsrael(), business.validity_days),
    public_token: newQuoteToken(),
    created_by: c.user.id,
  }).select('id').single();
  if (error || !data) return { error: 'failed' as const, message: t.quoteCreateFailed };
  rev(input.locale);
  return { ok: true as const, id: data.id as string };
}

/** Cancels a sent quote: its page then says so, and shows no line and no amount. */
export async function crmCancelQuote(input: { locale: string; id: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const { data, error } = await c.supabase.from('crm_quotes')
    .update({ status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId).eq('status', 'sent').select('id');
  if (error) return { error: 'failed' as const, message: t.quoteCancelFailed };
  if (!data || data.length === 0) return { error: 'notfound' as const };
  rev(input.locale);
  return { ok: true as const };
}

/**
 * Sends a draft: saves what the editor holds, numbers it, freezes the business and
 * the client as they are now, then moves the deal and the lead and writes the
 * timeline. It counts as a touch. Everything before the quote's own update can fail
 * with nothing to show for it (a number may be skipped, never repeated); a failure
 * after it still returns the sent quote, with `partial` so the editor can say what
 * didn't update. See design.md decision 6.
 */
export async function crmSendQuote(input: QuoteSaveInput & { via: 'whatsapp' | 'link' }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!canWrite(c.ws.role)) return readonlyRefusal(input.locale);
  const t = getDict(input.locale).crm;
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' as const };

  const checked = validateQuote({ subject: input.subject, lines: input.lines, notes: input.notes }, 'send');
  if (!checked.ok) {
    const p = checked.problems[0];
    return { error: 'invalid' as const, problem: p, message: quoteProblemText(p, t, input.locale) };
  }
  if (input.valid_until && !isIsoDate(input.valid_until)) return { error: 'invalid' as const, message: t.quoteSendFailed };

  const { data: q } = await c.supabase.from('crm_quotes').select('contact_id, status, public_token, locale')
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!q || !q.contact_id) return { error: 'notfound' as const };
  if (q.status !== 'draft') return { error: 'locked' as const };
  const contactId = q.contact_id as string;
  const { data: contact } = await c.supabase.from('crm_contacts').select('full_name, phone, status, crm_companies(name)')
    .eq('id', contactId).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!contact) return { error: 'notfound' as const };

  const business = await readBusiness(admin, c.ws.workspaceId);
  if (!business.name.trim()) return { error: 'business' as const, message: t.quoteNeedsBusiness };
  if (input.via === 'whatsapp' && !whatsAppLink(contact.phone as string | null)) {
    return { error: 'nophone' as const, message: t.quoteNoPhone };
  }
  if (input.deal_id && !(await openDealIds(c, contactId)).includes(input.deal_id)) {
    return { error: 'invalid' as const, message: t.quoteSendFailed };
  }

  const vatRate = business.vat_exempt ? 0 : VAT_RATE;
  const totals = quoteTotals(checked.value.lines, vatRate);
  const year = Number(todayInIsrael().slice(0, 4));
  const { data: n, error: nErr } = await admin.rpc('crm_next_quote_number', { p_ws: c.ws.workspaceId, p_year: year });
  if (nErr || typeof n !== 'number') return { error: 'failed' as const, message: t.quoteSendFailed };
  const number = formatQuoteNumber(year, n);
  const companyRel = contact.crm_companies as unknown;
  const company = (Array.isArray(companyRel) ? (companyRel[0] as { name: string } | undefined)?.name : (companyRel as { name: string } | null)?.name) ?? null;
  const businessSnapshot: BusinessSnapshot = {
    name: business.name, company_number: business.company_number, address: business.address, phone: business.phone,
    email: business.email, website: business.website, vat_exempt: business.vat_exempt, logo_url: business.logo_url,
  };
  const clientSnapshot: ClientSnapshot = { name: contact.full_name as string, company };
  const nowIso = new Date().toISOString();

  const { data: sent, error: sendErr } = await c.supabase.from('crm_quotes').update({
    subject: checked.value.subject,
    items: checked.value.lines,
    notes: checked.value.notes || null,
    valid_until: input.valid_until || null,
    deal_id: input.deal_id,
    vat_rate: vatRate,
    ...totals,
    number,
    status: 'sent',
    sent_at: nowIso,
    business_snapshot: businessSnapshot,
    client_snapshot: clientSnapshot,
    updated_at: nowIso,
  }).eq('id', input.id).eq('workspace_id', c.ws.workspaceId).eq('status', 'draft').select('id');
  if (sendErr) return { error: 'failed' as const, message: t.quoteSendFailed };
  if (!sent || sent.length === 0) return { error: 'locked' as const };

  // From here the quote is sent. What follows is reported, never rolled back.
  let partial = false;

  // The deal: the chosen one moves up to the proposal stage and takes the total
  // before VAT; with none chosen, one is created from the quote.
  let dealId = input.deal_id;
  if (dealId) {
    const { data: deal } = await c.supabase.from('crm_deals').select('stage')
      .eq('id', dealId).eq('workspace_id', c.ws.workspaceId).maybeSingle();
    const before = (DEAL_STAGES_BEFORE_PROPOSAL as readonly string[]).includes(String(deal?.stage));
    const { error } = await c.supabase.from('crm_deals')
      .update({ value: totals.subtotal, ...(before ? { stage: 'proposal' } : {}) })
      .eq('id', dealId).eq('workspace_id', c.ws.workspaceId);
    if (error) partial = true;
  } else {
    const { data: deal, error } = await c.supabase.from('crm_deals').insert({
      owner_id: c.user.id, workspace_id: c.ws.workspaceId, contact_id: contactId,
      title: checked.value.subject, value: totals.subtotal, stage: 'proposal',
    }).select('id').single();
    if (error || !deal) partial = true;
    else {
      dealId = deal.id as string;
      await c.supabase.from('crm_quotes').update({ deal_id: dealId }).eq('id', input.id).eq('workspace_id', c.ws.workspaceId);
    }
  }

  // The lead: forward to "הצעה נשלחה" from before it, and a touch either way. The
  // score is recomputed after the deal, so an open deal's points are in it.
  const previous: ContactStatus = isContactStatus(contact.status as string) ? (contact.status as ContactStatus) : 'new';
  const next: ContactStatus = SEND_MOVES_FROM.includes(previous) ? 'proposal' : previous;
  let activityId: string | null = null;
  const row = await loadScoreInputs(c.supabase, c.ws.workspaceId, contactId);
  if (row) {
    const score = scoreContact({ ...row, status: next, last_activity_at: nowIso });
    const { error } = await c.supabase.from('crm_contacts')
      .update({ status: next, ...STATUS_LEGACY[next], score, last_activity_at: nowIso })
      .eq('id', contactId).eq('workspace_id', c.ws.workspaceId);
    if (error) partial = true;
    else if (next !== previous) activityId = await logStatusChange(c, input.locale, contactId, previous, next);
  } else partial = true;

  const { error: logErr } = await c.supabase.from('crm_activities').insert({
    owner_id: c.user.id, workspace_id: c.ws.workspaceId, contact_id: contactId, deal_id: dealId, type: 'quote',
    body: t.quoteSentBody.replace('{number}', number).replace('{total}', formatMoney(totals.total, input.locale)),
  });
  if (logErr) console.error('[quote] sent but not logged:', logErr.message);

  const link = `${await siteOrigin()}/${q.locale}/q/${q.public_token}`;
  const firstName = String(contact.full_name ?? '').trim().split(/\s+/)[0] ?? '';
  const waUrl = input.via === 'whatsapp'
    ? whatsAppLink(contact.phone as string | null,
        t.quoteWaMessage.replace('{name}', firstName).replace('{business}', business.name).replace('{link}', link))
    : null;

  revalidatePath(`/${input.locale}/dashboard/crm/quotes/${input.id}`);
  revalidatePath(`/${input.locale}/dashboard/crm/${contactId}`);
  rev(input.locale);
  return {
    ok: true as const,
    number,
    link,
    waUrl,
    contactId,
    moved: next !== previous,
    previous: next !== previous ? previous : null,
    activityId,
    partial,
  };
}
