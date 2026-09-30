import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authApiKey, hasScope, rateLimit } from '@/lib/crm-api';
import { enrichEmail } from '@/lib/enrich';
import { scoreContact } from '@/lib/crm-score';
import { STATUS_LEGACY, isContactStatus, statusFromLegacy, type ContactStatus } from '@/lib/crm-status';
import { loadScoreInputs } from '@/lib/crm-rescore';
import { runAutomationsForContact } from '@/lib/automations/engine';
import { normalizeEmail, normalizePhone } from '@/lib/crm-contact-match';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const unauth = () => NextResponse.json({ error: 'unauthorized' }, { status: 401 });
const limited = () => NextResponse.json({ error: 'rate_limited' }, { status: 429 });
const forbidden = (scope: string) => NextResponse.json({ error: 'insufficient_scope', required: scope }, { status: 403 });

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;
const NOTES_MAX = 2000;
const RETURNED = 'id, full_name, email, score, status, lifecycle_stage, lead_status';

/**
 * The workspace's contact with this email, or else this phone (compared on digits,
 * 972… as 0…: lib/crm-contact-match.ts). Phones are stored as they were typed, so
 * they are compared here, a page at a time, only when the email found nobody.
 */
async function findExisting(admin: Admin, workspaceId: string, email: string | null, phone: string | null) {
  const e = normalizeEmail(email);
  if (e) {
    const { data } = await admin.from('crm_contacts').select(RETURNED)
      .eq('workspace_id', workspaceId).eq('email', e).limit(1).maybeSingle();
    if (data) return data;
  }
  const p = normalizePhone(phone);
  if (!p) return null;
  for (let from = 0; ; from += 1000) {
    const { data: page } = await admin.from('crm_contacts').select('id, phone')
      .eq('workspace_id', workspaceId).not('phone', 'is', null)
      .order('created_at', { ascending: true }).range(from, from + 999);
    const hit = (page ?? []).find((r) => normalizePhone(r.phone as string) === p);
    if (hit) {
      const { data } = await admin.from('crm_contacts').select(RETURNED).eq('id', hit.id).maybeSingle();
      return data;
    }
    if (!page || page.length < 1000) return null;
  }
}

/** A form's answers on the contact's timeline: a touch, so last touch and the score move. */
async function logNotes(admin: Admin, workspaceId: string, contactId: string, notes: string) {
  const { error } = await admin.from('crm_activities').insert({
    workspace_id: workspaceId, owner_id: null, contact_id: contactId, type: 'note', body: notes,
  });
  if (error) return;
  const nowIso = new Date().toISOString();
  const row = await loadScoreInputs(admin, workspaceId, contactId);
  if (row) {
    await admin.from('crm_contacts')
      .update({ last_activity_at: nowIso, score: scoreContact({ ...row, last_activity_at: nowIso }) })
      .eq('id', contactId).eq('workspace_id', workspaceId);
  }
}

// GET /api/v1/crm/contacts?limit=50&tier=hot  — לידים לפי ניקוד (גבוה→נמוך)
export async function GET(req: Request) {
  const auth = await authApiKey(req);
  if (!auth) return unauth();
  if (!rateLimit(auth.keyId)) return limited();
  if (!hasScope(auth, 'contacts:read')) return forbidden('contacts:read');

  const admin = createAdminClient()!;
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 50, 1), 200);

  let q = admin
    .from('crm_contacts')
    .select('id, full_name, email, phone, role_title, company_id, status, lifecycle_stage, lead_status, score, is_business, source, last_activity_at, created_at')
    .eq('workspace_id', auth.workspaceId)
    .order('score', { ascending: false })
    .limit(limit);

  const tier = url.searchParams.get('tier');
  if (tier === 'hot') q = q.gte('score', 70);
  else if (tier === 'warm') q = q.gte('score', 40).lt('score', 70);
  else if (tier === 'cold') q = q.lt('score', 40);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: 'query_failed' }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/v1/crm/contacts  — יצירת ליד (מעשירים דומיין + מנקדים אוטומטית)
export async function POST(req: Request) {
  const auth = await authApiKey(req);
  if (!auth) return unauth();
  if (!rateLimit(auth.keyId)) return limited();
  if (!hasScope(auth, 'contacts:write')) return forbidden('contacts:write');

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const full_name = String(body.full_name || '').trim();
  if (!full_name) return NextResponse.json({ error: 'full_name_required' }, { status: 422 });
  // Checked before anything is stored (openspec: crm-connect-google-and-make).
  const notes = body.notes == null ? '' : String(body.notes).trim();
  if (Array.from(notes).length > NOTES_MAX) {
    return NextResponse.json({ error: 'notes_too_long', max: NOTES_MAX }, { status: 422 });
  }
  if (body.match != null && body.match !== 'email_or_phone') {
    return NextResponse.json({ error: 'invalid_match', allowed: ['email_or_phone'] }, { status: 422 });
  }

  const email = body.email ? String(body.email).trim().toLowerCase() : null;
  const enriched = email ? enrichEmail(email) : { isBusiness: false };
  // `status` is what the CRM stores. Integrations written before it existed send
  // lifecycle_stage / lead_status instead, so those are still accepted and mapped.
  // Either way the three fields are normalised to agree with each other.
  let status: ContactStatus;
  if (body.status) {
    const raw = String(body.status);
    if (!isContactStatus(raw)) return NextResponse.json({ error: 'invalid_status' }, { status: 422 });
    status = raw;
  } else {
    status = statusFromLegacy(
      body.lifecycle_stage ? String(body.lifecycle_stage) : 'lead',
      body.lead_status ? String(body.lead_status) : 'new',
    );
  }
  const phone = body.phone ? String(body.phone).trim() : null;
  const company_id = body.company_id ? String(body.company_id) : null;
  const score = scoreContact({ is_business: enriched.isBusiness, company_id, status, phone });

  const admin = createAdminClient()!;

  // Opt-in: someone already in the workspace gets this submission on their timeline
  // instead of a second contact. Without `match`, nothing below changes for a caller.
  if (body.match === 'email_or_phone') {
    const existing = await findExisting(admin, auth.workspaceId, email, phone);
    if (existing) {
      if (notes) await logNotes(admin, auth.workspaceId, existing.id as string, notes);
      return NextResponse.json({ data: existing, matched: true }, { status: 200 });
    }
  }

  const { data, error } = await admin
    .from('crm_contacts')
    .insert({
      workspace_id: auth.workspaceId,
      owner_id: null,
      full_name,
      email,
      phone,
      role_title: body.role_title ? String(body.role_title).trim() : null,
      linkedin_url: body.linkedin_url ? String(body.linkedin_url).trim() : null,
      company_id,
      source: body.source ? String(body.source) : 'api',
      is_business: enriched.isBusiness,
      status,
      ...STATUS_LEGACY[status],
      score,
    })
    .select(RETURNED)
    .single();

  if (error) return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  if (notes) await logNotes(admin, auth.workspaceId, data.id as string, notes);
  // As for a contact typed in the CRM (crmCreateContact): the workspace's "new contact"
  // automations, best-effort. A failure never changes this response.
  try {
    await runAutomationsForContact(admin, auth.workspaceId, 'contact.created', data.id as string);
  } catch { /* automation failures must not fail the API call */ }
  return NextResponse.json({ data }, { status: 201 });
}
