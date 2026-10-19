// Lists and creates developer API keys for the internal admin dashboard (/geo-admin).
// Gated with isAdmin (header or geo_admin cookie). 404 to probes.

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/geo-admin-auth';
import { listApiKeys, createApiKey } from '@/lib/geo-api-keys';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, keys: await listApiKeys() });
}

export async function POST(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  let body: { label?: unknown; maxUsdPerRun?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const label = typeof body.label === 'string' ? body.label.trim() : '';
  if (!label) return NextResponse.json({ ok: false, error: 'label_required' }, { status: 400 });
  const maxUsdPerRun =
    typeof body.maxUsdPerRun === 'number' && body.maxUsdPerRun > 0 ? body.maxUsdPerRun : undefined;

  const created = await createApiKey(label, maxUsdPerRun);
  if (!created) {
    return NextResponse.json({ ok: false, error: 'create_failed' }, { status: 500 });
  }
  // The plaintext key is returned ONCE here and never stored, show it to the admin now.
  return NextResponse.json({ ok: true, key: created.key, id: created.id });
}
