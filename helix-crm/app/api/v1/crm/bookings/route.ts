import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authApiKey, hasScope, rateLimit } from '@/lib/crm-api';
import { enrichEmail } from '@/lib/enrich';
import { scoreContact } from '@/lib/crm-score';
import { loadScoreInputs } from '@/lib/crm-rescore';
import { STATUS_LEGACY } from '@/lib/crm-status';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// cal.com booking webhook → CRM. Each self-employed member registers a cal.com
// webhook pointing here with THEIR workspace API key (hxk_…, scope contacts:write),
// so bookings land as a contact + "meeting" activity in their own workspace.
//
// Register at cal.com: Settings → Developer → Webhooks → Subscriber URL =
//   https://crm.helix.co.il/api/v1/crm/bookings
//   Header: Authorization: Bearer hxk_live_…  · Events: BOOKING_CREATED / CANCELLED / RESCHEDULED

const unauth = () => NextResponse.json({ error: 'unauthorized' }, { status: 401 });
const limited = () => NextResponse.json({ error: 'rate_limited' }, { status: 429 });
const forbidden = (scope: string) => NextResponse.json({ error: 'insufficient_scope', required: scope }, { status: 403 });

function fmtWhen(iso?: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('he-IL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Jerusalem' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

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

  const trigger = String(body.triggerEvent || '').toUpperCase();
  const payload = (body.payload && typeof body.payload === 'object' ? body.payload : {}) as Record<string, unknown>;
  const attendees = Array.isArray(payload.attendees) ? (payload.attendees as Record<string, unknown>[]) : [];
  const booker = attendees[0] || {};
  const name = String(booker.name || '').trim();
  const email = booker.email ? String(booker.email).trim().toLowerCase() : null;
  const title = String(payload.title || 'פגישה').trim();
  const when = fmtWhen(typeof payload.startTime === 'string' ? payload.startTime : undefined);

  // Nothing to attach a lead to → just acknowledge (cal.com pings, test events).
  if (!email) return NextResponse.json({ ok: true, skipped: 'no_email' });

  const admin = createAdminClient()!;

  // Find-or-create the contact in THIS workspace (dedup by email).
  let contactId: string | null = null;
  const { data: existing } = await admin
    .from('crm_contacts')
    .select('id')
    .eq('workspace_id', auth.workspaceId)
    .eq('email', email)
    .maybeSingle();

  if (existing) {
    contactId = (existing as { id: string }).id;
    await admin.from('crm_contacts').update({ last_activity_at: new Date().toISOString() }).eq('id', contactId);
  } else if (trigger === 'BOOKING_CREATED') {
    // A booking is high intent → create as 'talking'.
    const enriched = enrichEmail(email);
    const status = 'talking' as const;
    const { data: created } = await admin
      .from('crm_contacts')
      .insert({
        workspace_id: auth.workspaceId,
        owner_id: null,
        full_name: name || email,
        email,
        source: 'cal.com',
        is_business: enriched.isBusiness,
        status,
        ...STATUS_LEGACY[status],
        score: scoreContact({ is_business: enriched.isBusiness, company_id: null, status, phone: null }),
      })
      .select('id')
      .single();
    contactId = (created as { id: string } | null)?.id ?? null;
  }

  if (!contactId) return NextResponse.json({ ok: true, skipped: 'no_contact' });

  // Log the booking as an activity.
  const verb = trigger === 'BOOKING_CANCELLED' ? 'בוטלה' : trigger === 'BOOKING_RESCHEDULED' ? 'שונה מועדה' : 'נקבעה';
  await admin.from('crm_activities').insert({
    workspace_id: auth.workspaceId,
    owner_id: null,
    contact_id: contactId,
    type: 'meeting',
    body: `פגישה ${verb} דרך cal.com: "${title}"${when ? ` · ${when}` : ''}`,
  });

  // Rescore + bump last_activity (same path as the activities endpoint).
  const nowIso = new Date().toISOString();
  const row = await loadScoreInputs(admin, auth.workspaceId, contactId);
  if (row) {
    await admin
      .from('crm_contacts')
      .update({ last_activity_at: nowIso, score: scoreContact({ ...row, last_activity_at: nowIso }) })
      .eq('id', contactId)
      .eq('workspace_id', auth.workspaceId);
  }

  return NextResponse.json({ ok: true, contact_id: contactId }, { status: 201 });
}
