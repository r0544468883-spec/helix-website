import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { authApiKey, hasScope, rateLimit } from '@/lib/crm-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const unauth = () => NextResponse.json({ error: 'unauthorized' }, { status: 401 });
const limited = () => NextResponse.json({ error: 'rate_limited' }, { status: 429 });
const forbidden = (scope: string) => NextResponse.json({ error: 'insufficient_scope', required: scope }, { status: 403 });

// GET /api/v1/crm/deals?status=open  — עסקאות בצינור
export async function GET(req: Request) {
  const auth = await authApiKey(req);
  if (!auth) return unauth();
  if (!rateLimit(auth.keyId)) return limited();
  if (!hasScope(auth, 'deals:read')) return forbidden('deals:read');

  const admin = createAdminClient()!;
  const url = new URL(req.url);
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit')) || 50, 1), 200);

  let q = admin
    .from('crm_deals')
    .select('id, title, value, currency, stage, status, contact_id, company_id, close_date, created_at')
    .eq('workspace_id', auth.workspaceId)
    .order('created_at', { ascending: false })
    .limit(limit);

  const status = url.searchParams.get('status');
  if (status === 'open' || status === 'won' || status === 'lost') q = q.eq('status', status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: 'query_failed' }, { status: 500 });
  return NextResponse.json({ data });
}

// POST /api/v1/crm/deals  — יצירת עסקה
export async function POST(req: Request) {
  const auth = await authApiKey(req);
  if (!auth) return unauth();
  if (!rateLimit(auth.keyId)) return limited();
  if (!hasScope(auth, 'deals:write')) return forbidden('deals:write');

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const title = String(body.title || '').trim();
  if (!title) return NextResponse.json({ error: 'title_required' }, { status: 422 });

  const value = Number(body.value) || 0;
  const stage = body.stage ? String(body.stage) : 'lead';
  const status = stage === 'won' ? 'won' : stage === 'lost' ? 'lost' : 'open';

  const admin = createAdminClient()!;
  const { data, error } = await admin
    .from('crm_deals')
    .insert({
      workspace_id: auth.workspaceId,
      owner_id: null,
      title,
      value,
      contact_id: body.contact_id ? String(body.contact_id) : null,
      company_id: body.company_id ? String(body.company_id) : null,
      stage,
      status,
    })
    .select('id, title, value, stage, status')
    .single();

  if (error) return NextResponse.json({ error: 'insert_failed' }, { status: 500 });
  return NextResponse.json({ data }, { status: 201 });
}
