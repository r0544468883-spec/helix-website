'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrichEmail } from '@/lib/enrich';
import { scoreContact } from '@/lib/crm-score';
import { loadScoreInputs, rescoreContact } from '@/lib/crm-rescore';
import { isIsoDate, todayInIsrael, addMonthsIso } from '@/lib/crm-dates';
import {
  STATUS_LEGACY, STALL_DAYS, DECLINE_REASONS, isContactStatus, statusKey, type ContactStatus, type DeclineReason,
} from '@/lib/crm-status';
import {
  getWorkspace, listAccessibleWorkspaces, canWrite, isAdminRole, isAssignableRole,
  ACTIVE_WS_COOKIE, type AccessibleWorkspace,
} from '@/lib/crm-workspace';
import { generateKey, API_SCOPES, isScope } from '@/lib/crm-api';
import { resolveMode } from '@/lib/autonomy/resolve';
import { runAutomationsForContact } from '@/lib/automations/engine';
import { getDict } from '@/lib/i18n';

function rev(locale: string) {
  revalidatePath(`/${locale}/dashboard/crm`);
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
  (await cookies()).set(ACTIVE_WS_COOKIE, workspaceId, {
    httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30,
  });
  return { ok: true };
}

/** Turn the current workspace into an agency + add a client workspace beneath it. Admin only. */
export async function crmCreateClientWorkspace(input: { locale: string; name: string }): Promise<{ ok: boolean; error?: string; id?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
  if (c.ws.role !== 'admin' && c.ws.role !== 'agency_admin') return { ok: false, error: 'forbidden' };
  const name = input.name?.trim();
  if (!name) return { ok: false, error: 'invalid' };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: 'workspace' };
  // mark the parent as an agency (idempotent) + create the client beneath it
  await admin.from('crm_workspaces').update({ plan: 'agency' }).eq('id', c.ws.workspaceId);
  const { data: child, error } = await admin
    .from('crm_workspaces').insert({ name, created_by: c.user.id, parent_workspace_id: c.ws.workspaceId })
    .select('id').single();
  if (error || !child) return { ok: false, error: 'failed' };
  await admin.from('crm_members').insert({ workspace_id: child.id, user_id: c.user.id, role: 'agency_admin' });
  revalidatePath(`/${input.locale}/dashboard/crm`);
  return { ok: true, id: child.id as string };
}

// ---------- ניהול צוות (admin בלבד) ----------

export async function crmInviteMember(input: { locale: string; email: string; role?: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (c.ws.role !== 'admin') return adminRefusal(input.locale);
  const email = input.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'invalid' };
  // Refuse an unknown role rather than collapsing it to 'member' — a typo
  // must not silently hand out write access.
  const role = input.role ?? 'member';
  if (!isAssignableRole(role)) return { error: 'role', message: getDict(input.locale).crm.errInvalidRole };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };

  // סדר הפעולות חשוב: שורת ההזמנה חייבת להיות בטבלה לפני יצירת המשתמש,
  // כי הטריגר handle_new_user בודק מולה ודוחה כל מייל שאין לו הזמנה.
  const { error: invErr } = await admin.from('crm_invites').upsert(
    { workspace_id: c.ws.workspaceId, email, role, invited_by: c.user.id },
    { onConflict: 'workspace_id,email' }
  );
  // Without the invite row the auth trigger rejects the user, so stop here.
  if (invErr) {
    console.error('[crmInviteMember] invite row', invErr.message);
    return { error: 'failed' };
  }

  // יוצר את המשתמש ב-auth ושולח מייל הזמנה. בלי זה, מוזמן חדש תקוע:
  // טופס ה-magic link רץ עם shouldCreateUser:false ולכן מסרב ליצור משתמש
  // שלא קיים, אז המסלול היחיד שנשאר לו היה OAuth.
  // אם המשתמש כבר קיים — Supabase מחזיר שגיאה, וזה בסדר גמור.
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
  const { error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo: `${siteUrl}/auth/callback?next=/${input.locale}`,
  });
  if (inviteErr && !/already|exists|registered/i.test(inviteErr.message)) {
    console.error('[crmInviteMember] inviteUserByEmail', inviteErr.message);
  }

  revalidatePath(`/${input.locale}/dashboard/crm/team`);
  return { ok: true };
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
  if (c.ws.role !== 'admin') return adminRefusal(input.locale);
  const role = input.role;
  if (!isAssignableRole(role)) return { error: 'role', message: getDict(input.locale).crm.errInvalidRole };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  await admin.from('crm_members').update({ role }).eq('workspace_id', c.ws.workspaceId).eq('user_id', input.userId);
  revalidatePath(`/${input.locale}/dashboard/crm/team`);
  return { ok: true };
}

export async function crmRemoveMember(input: { locale: string; userId?: string; email?: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (c.ws.role !== 'admin') return { error: 'forbidden' };
  if (input.userId && input.userId === c.user.id) return { error: 'self' };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  if (input.userId) {
    await admin.from('crm_members').delete().eq('workspace_id', c.ws.workspaceId).eq('user_id', input.userId);
  } else if (input.email) {
    await admin.from('crm_invites').delete().eq('workspace_id', c.ws.workspaceId).ilike('email', input.email);
  }
  revalidatePath(`/${input.locale}/dashboard/crm/team`);
  return { ok: true };
}
