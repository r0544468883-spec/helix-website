import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authApiKey, hasScope, rateLimit } from '@/lib/crm-api';
import { enrichEmail } from '@/lib/enrich';
import { scoreContact } from '@/lib/crm-score';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const unauth = () => NextResponse.json({ error: 'unauthorized' }, { status: 401 });
const limited = () => NextResponse.json({ error: 'rate_limited' }, { status: 429 });
const forbidden = (scope: string) => NextResponse.json({ error: 'insufficient_scope', required: scope }, { status: 403 });

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
    .select('id, full_name, email, phone, role_title, company_id, lifecycle_stage, lead_status, score, is_business, source, last_activity_at, created_at')
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

  const email = body.email ? String(body.email).trim().toLowerCase() : null;
  const enriched = email ? enrichEmail(email) : { isBusiness: false };
  const lifecycle_stage = body.lifecycle_stage ? String(body.lifecycle_stage) : 'lead';
  const lead_status = body.lead_status ? String(body.lead_status) : 'new';
  const phone = body.phone ? String(body.phone).trim() : null;
  const company_id = body.company_id ? String(body.company_id) : null;
  const score = scoreContact({ is_business: enriched.isBusiness, company_id, lifecycle_stage, lead_status, phone });

  const admin = createAdminClient()!;
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
      lifecycle_stage,
      lead_status,
      score,
    })
    .select('id, full_name, email, score, lifecycle_stage, lead_status')
    .single();

  if (error) return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
