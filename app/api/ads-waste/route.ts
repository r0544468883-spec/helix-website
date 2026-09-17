// Free Scan "בדיקה B" — Ad Waste scan (paste/upload a Google Ads search-terms CSV). Runs the
// pure auditor (lib/ads-waste). Ungated: totals + top-3 waste teaser. Gated (email): the full
// classified term list. Detection only — the "found ₪X waste" aha, CTA into HELIX OPS.

import { NextResponse } from 'next/server';
import { auditWasteCsv } from '@/lib/ads-waste';
import { recordScan } from '@/lib/supabase-scans';
import { clientIp } from '@/lib/client-ip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const hits = new Map<string, { at: number; count: number }>();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 15;
const MAX_CSV_BYTES = 2 * 1024 * 1024; // 2MB guard

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.at > RATE_WINDOW_MS) {
    hits.set(ip, { at: now, count: 1 });
    return false;
  }
  cur.count += 1;
  return cur.count > RATE_MAX;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  let body: { csv?: unknown; email?: unknown; brandTerms?: unknown; name?: unknown; phone?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const csv = typeof body.csv === 'string' ? body.csv : '';
  if (!csv) return NextResponse.json({ ok: false, error: 'no_csv' }, { status: 400 });
  if (csv.length > MAX_CSV_BYTES) return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });

  const email = typeof body.email === 'string' && body.email.includes('@') ? body.email : undefined;
  const brandTerms = Array.isArray(body.brandTerms) ? body.brandTerms.filter((b): b is string => typeof b === 'string') : [];

  const audit = auditWasteCsv(csv, { brandTerms });
  if (!audit.ok) return NextResponse.json({ ok: false, error: audit.error ?? 'parse_failed' }, { status: 422 });

  await recordScan({ url: 'csv://ads-waste', issues: audit.totals.negativeCandidates, source: 'ads-waste', has_lead: !!email, email, name: typeof body.name === 'string' ? body.name : undefined, phone: typeof body.phone === 'string' ? body.phone : undefined });

  // Ungated: totals + top-3 teaser. Gated (email): full classified rows.
  const payload = {
    ok: true,
    totals: audit.totals,
    teaser: audit.topWaste.slice(0, 3),
    rows: email ? audit.rows : null,
    topWaste: email ? audit.topWaste : audit.topWaste.slice(0, 3),
    gated: !email,
  };
  return NextResponse.json(payload);
}
