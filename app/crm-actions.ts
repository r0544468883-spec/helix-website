'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { enrichEmail } from '@/lib/enrich';
import { scoreContact } from '@/lib/crm-score';
import { getWorkspace, listAccessibleWorkspaces, ACTIVE_WS_COOKIE, type AccessibleWorkspace } from '@/lib/crm-workspace';
import { generateKey, API_SCOPES, isScope } from '@/lib/crm-api';
import { resolveMode } from '@/lib/autonomy/resolve';
import { runAutomationsForContact } from '@/lib/automations/engine';

function rev(locale: string) {
  revalidatePath(`/${locale}/dashboard/crm`);
}

// ---- Von's flagship example: "a deal is slipping" → detect + act -------------
// A deal is "stalled" if it is still open and its contact has had no activity
// for >= STALL_DAYS (crmLogActivity refreshes contact.last_activity_at).
const STALL_DAYS = 14;

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

export async function crmSetAutonomy(featureKey: string, mode: 'advisor' | 'approve' | 'autopilot', riskAck: boolean): Promise<{ ok: boolean; error?: string }> {
  const c = await ctx();
  if (!c.ok) return { ok: false, error: c.error };
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

export async function crmCreateContact(input: {
  locale: string; full_name: string; email?: string; phone?: string;
  role_title?: string; company_id?: string; lifecycle_stage?: string; lead_status?: string; source?: string;
}) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!input.full_name?.trim()) return { error: 'invalid' };
  const enriched = input.email ? enrichEmail(input.email) : { isBusiness: false };
  const score = scoreContact({ is_business: enriched.isBusiness, company_id: input.company_id, lifecycle_stage: input.lifecycle_stage, lead_status: input.lead_status, phone: input.phone });
  const { data: created, error } = await c.supabase.from('crm_contacts').insert({
    owner_id: c.user.id, workspace_id: c.ws.workspaceId,
    full_name: input.full_name.trim(), email: input.email?.trim().toLowerCase() || null,
    phone: input.phone?.trim() || null, role_title: input.role_title?.trim() || null,
    company_id: input.company_id || null, source: input.source || 'manual',
    is_business: enriched.isBusiness, lifecycle_stage: input.lifecycle_stage || 'lead',
    lead_status: input.lead_status || 'new', score,
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

export async function crmUpdateContact(input: { locale: string; id: string; lifecycle_stage?: string; lead_status?: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  const { data: row } = await c.supabase
    .from('crm_contacts')
    .select('is_business, company_id, lifecycle_stage, lead_status, phone, linkedin_url, last_activity_at')
    .eq('id', input.id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
  if (!row) return { error: 'notfound' };
  const lifecycle_stage = input.lifecycle_stage ?? row.lifecycle_stage;
  const lead_status = input.lead_status ?? row.lead_status;
  const score = scoreContact({ ...row, lifecycle_stage, lead_status });
  await c.supabase.from('crm_contacts').update({ lifecycle_stage, lead_status, score }).eq('id', input.id).eq('workspace_id', c.ws.workspaceId);
  revalidatePath(`/${input.locale}/dashboard/crm/${input.id}`);
  rev(input.locale);
  return { ok: true };
}

export async function crmCreateDeal(input: { locale: string; title: string; value?: number; contact_id?: string; company_id?: string; stage?: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!input.title?.trim()) return { error: 'invalid' };
  const { error } = await c.supabase.from('crm_deals').insert({
    owner_id: c.user.id, workspace_id: c.ws.workspaceId, title: input.title.trim(),
    value: input.value ?? 0, contact_id: input.contact_id || null, company_id: input.company_id || null, stage: input.stage || 'lead',
  });
  if (error) return { error: 'failed' };
  rev(input.locale);
  return { ok: true };
}

export async function crmMoveDeal(dealId: string, stage: string, locale: string) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  const status = stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'open';
  const { error } = await c.supabase.from('crm_deals').update({ stage, status }).eq('id', dealId).eq('workspace_id', c.ws.workspaceId);
  if (error) return { error: 'failed' };
  rev(locale);
  return { ok: true };
}

export async function crmLogActivity(input: { locale: string; contact_id?: string; deal_id?: string; type?: string; body: string }) {
  const c = await ctx();
  if (!c.ok) return { error: c.error };
  if (!input.body?.trim()) return { error: 'invalid' };
  await c.supabase.from('crm_activities').insert({
    owner_id: c.user.id, workspace_id: c.ws.workspaceId, contact_id: input.contact_id || null,
    deal_id: input.deal_id || null, type: input.type || 'note', body: input.body.trim(),
  });
  if (input.contact_id) {
    const nowIso = new Date().toISOString();
    const { data: row } = await c.supabase.from('crm_contacts').select('is_business, company_id, lifecycle_stage, lead_status, phone, linkedin_url').eq('id', input.contact_id).eq('workspace_id', c.ws.workspaceId).maybeSingle();
    if (row) {
      const score = scoreContact({ ...row, last_activity_at: nowIso });
      await c.supabase.from('crm_contacts').update({ last_activity_at: nowIso, score }).eq('id', input.contact_id).eq('workspace_id', c.ws.workspaceId);
    }
  }
  rev(input.locale);
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
  if (c.ws.role !== 'admin') return { error: 'forbidden' };
  const email = input.email?.trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'invalid' };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  const role = input.role === 'admin' ? 'admin' : 'member';
  await admin.from('crm_invites').upsert(
    { workspace_id: c.ws.workspaceId, email, role, invited_by: c.user.id },
    { onConflict: 'workspace_id,email' }
  );
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
  if (c.ws.role !== 'admin') return { error: 'forbidden' };
  const admin = createAdminClient();
  if (!admin) return { error: 'workspace' };
  const role = input.role === 'admin' ? 'admin' : 'member';
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
