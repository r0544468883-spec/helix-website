// Generates a full GEO report and stores it for the hosted page (/r/<token>).
// Token-gated with the SAME scheme as /api/geo-som (fans out to many LLM calls,
// so it is never public). Guard token is derived from PORTAL_SESSION_SECRET.

import { NextResponse } from 'next/server';
import crypto from 'node:crypto'; // used for randomBytes token generation
import { normalizeUrl } from '@/lib/geo-scan';
import { buildGeoReport } from '@/lib/geo-report-build';
import { saveReport } from '@/lib/geo-report-store';
import { isAdmin } from '@/lib/geo-admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Accepts the x-som-key header OR the geo_admin cookie (via isAdmin).
  // 404 (not 401) so the route is invisible to probes.
  if (!isAdmin(req)) {
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

  // Readable + unguessable: the company's domain label + a short hex suffix,
  // e.g. "reddgrow-a1b2c3". The slug is alphanumeric and the suffix is hex, so the
  // token never starts or ends with '-'/'_' (those get dropped when a link is copied).
  const slug =
    norm.host.replace(/^www\./, '').split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24) ||
    'report';
  const token = `${slug}-${crypto.randomBytes(3).toString('hex')}`;

  try {
    const report = await buildGeoReport(norm.url, { token, category, competitors });
    await saveReport(token, report);
    return NextResponse.json({ ok: true, token, url: `/r/${token}` });
  } catch (err) {
    console.error('geo-generate failed', err);
    return NextResponse.json({ ok: false, error: 'generate_failed' }, { status: 500 });
  }
}
