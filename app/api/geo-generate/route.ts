// Generates a full GEO report and stores it for the hosted page (/r/<token>).
// Token-gated with the SAME scheme as /api/geo-som (fans out to many LLM calls,
// so it is never public). Guard token is derived from PORTAL_SESSION_SECRET.

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { normalizeUrl } from '@/lib/geo-scan';
import { buildGeoReport } from '@/lib/geo-report-build';
import { saveReport } from '@/lib/geo-report-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function expectedToken(): string | null {
  const s = process.env.PORTAL_SESSION_SECRET;
  if (!s) return null;
  return crypto.createHash('sha256').update(`geo-som:${s}`).digest('hex').slice(0, 24);
}

export async function POST(req: Request) {
  const want = expectedToken();
  const got = req.headers.get('x-som-key') || '';
  // 404 (not 401) so the route is invisible to probes.
  if (!want || got !== want) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  let body: { url?: unknown; category?: unknown; competitors?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const norm = normalizeUrl(typeof body.url === 'string' ? body.url : '');
  if (!norm) return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 });

  const category =
    typeof body.category === 'string' && body.category.trim() ? body.category.trim() : undefined;
  const competitors = Array.isArray(body.competitors)
    ? body.competitors.filter((c): c is string => typeof c === 'string')
    : undefined;

  // Hex only: no '-' or '_' that get dropped when a link is copied/typed.
  const token = crypto.randomBytes(9).toString('hex');

  try {
    const report = await buildGeoReport(norm.url, { token, category, competitors });
    await saveReport(token, report);
    return NextResponse.json({ ok: true, token, url: `/r/${token}` });
  } catch (err) {
    console.error('geo-generate failed', err);
    return NextResponse.json({ ok: false, error: 'generate_failed' }, { status: 500 });
  }
}
