import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authApiKey, hasScope, rateLimit } from '@/lib/crm-api';
import { scoreContact } from '@/lib/crm-score';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const unauth = () => NextResponse.json({ error: 'unauthorized' }, { status: 401 });
const limited = () => NextResponse.json({ error: 'rate_limited' }, { status: 429 });
const forbidden = (scope: string) => NextResponse.json({ error: 'insufficient_scope', required: scope }, { status: 403 });

// POST /api/v1/crm/activities  — תיעוד פעילות (הליד "מתחמם" ומתעדכן הניקוד)
export async function POST(req: Request) {
  const auth = await authApiKey(req);
  if (!auth) return unauth();
  if (!rateLimit(auth.keyId)) return limited();
  if (!hasScope(auth, 'activities:write')) return forbidden('activities:write');

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const text = String(body.body || '').trim();
  if (!text) return NextResponse.json({ error: 'body_required' }, { status: 422 });
  const contact_id = body.contact_id ? String(body.contact_id) : null;
  const deal_id = body.deal_id ? String(body.deal_id) : null;

  const admin = createAdminClient()!;
  const { data, error } = await admin
    .from('crm_activities')
    .insert({
      workspace_id: auth.workspaceId,
      owner_id: null,
      contact_id,
      deal_id,
      type: body.type ? String(body.type) : 'note',
      body: text,
    })
    .select('id, type, created_at')
    .single();
  if (error) return NextResponse.json({ error: 'insert_failed' }, { status: 500 });

  // רה-חישוב ניקוד + עדכון last_activity (בתוך אותו workspace בלבד)
  if (contact_id) {
    const nowIso = new Date().toISOString();
    const { data: row } = await admin
      .from('crm_contacts')
      .select('is_business, company_id, lifecycle_stage, lead_status, phone, linkedin_url')
      .eq('id', contact_id)
      .eq('workspace_id', auth.workspaceId)
      .maybeSingle();
    if (row) {
      const score = scoreContact({ ...row, last_activity_at: nowIso });
      await admin
        .from('crm_contacts')
        .update({ last_activity_at: nowIso, score })
        .eq('id', contact_id)
        .eq('workspace_id', auth.workspaceId);
    }
  }

  return NextResponse.json({ data }, { status: 201 });
}
