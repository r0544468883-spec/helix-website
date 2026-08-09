// Full readiness scan for /startups/readiness — like /api/geo-scan but UNGATED:
// returns the complete technical result INCLUDING fixes (no email, no lock).
// The business/product analysis (messaging, positioning, competitors) is a
// STAGE-member feature and is NOT computed here. No live LLM probe.

import { NextResponse } from 'next/server';
import { scanSite, normalizeUrl } from '@/lib/geo-scan';
import { recordScan } from '@/lib/supabase-scans';
import { analyzeBusiness } from '@/lib/readiness-business';
import { fetchPage, computeExtras } from '@/lib/readiness-extras';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; payload: unknown }>();
const hits = new Map<string, { at: number; count: number }>();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 10;

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
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: { url?: unknown };
  try {
    body = (await req.json()) as { url?: unknown };
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const raw = typeof body.url === 'string' ? body.url : '';
  const norm = normalizeUrl(raw);
  if (!norm) {
    return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 });
  }

  const cached = cache.get(norm.host);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json(cached.payload);
  }

  const scan = await scanSite(norm.url);
  if (!scan.ok) {
    return NextResponse.json({ ok: false, error: scan.error ?? 'scan_failed' }, { status: 422 });
  }

  // Track the scan (fire-and-forget; no-op if Supabase env is unset).
  void recordScan({
    url: norm.url,
    host: norm.host,
    ladder: scan.ladder,
    issues: scan.issuesCount,
    business_name: scan.business.name,
    source: 'readiness',
  });

  // One page fetch, reused by extras + Layer-2. Extras (pixels/tools/legal/
  // Lighthouse) are FREE and keyless; Layer-2 (Claude) needs ANTHROPIC_API_KEY.
  const page = await fetchPage(norm.url);
  const extras = page ? await computeExtras(page.html, norm.url) : null;
  const business = page
    ? await analyzeBusiness(page.text, scan.business.name)
    : ({ status: 'error' } as const);

  // Full result — categories WITH fixes, ungated + extras + Layer-2 analysis.
  const payload = {
    ok: true,
    ladder: scan.ladder,
    issuesCount: scan.issuesCount,
    business: { name: scan.business.name },
    extras,
    businessAnalysis: business,
    categories: scan.categories.map((c) => ({
      key: c.key,
      label: c.label,
      score: c.score,
      signals: c.signals.map((s) => ({
        key: s.key,
        label: s.label,
        status: s.status,
        detail: s.detail,
        fix: s.fix,
      })),
    })),
  };

  cache.set(norm.host, { at: Date.now(), payload });
  return NextResponse.json(payload);
}
