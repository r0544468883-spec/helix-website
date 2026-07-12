// Teaser endpoint for /ai-checker — free, no contact details.
// Runs Layer B (crawlability/structure/corpus) + one minimal Layer A probe for the hook
// (do you appear + competitor COUNT, no names). Detailed fixes, competitor names and the
// actual AI answers are gated behind /api/geo-report.

import { NextResponse } from 'next/server';
import { scanSite, normalizeUrl } from '@/lib/geo-scan';
import { quickProbe } from '@/lib/ai-visibility';
import { recordScan } from '@/lib/supabase-scans';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Best-effort in-memory guards (per serverless instance).
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

  // Record the scan (fire-and-forget; no-op if Supabase env is unset).
  void recordScan({
    url: norm.url,
    host: norm.host,
    ladder: scan.ladder,
    issues: scan.issuesCount,
    business_name: scan.business.name,
    source: 'scan',
  });

  const probe = await quickProbe(scan.business, norm.host);

  // Teaser: category scores + signal status/detail, but NOT the fixes.
  const payload = {
    ok: true,
    ladder: scan.ladder,
    issuesCount: scan.issuesCount,
    business: { name: scan.business.name },
    categories: scan.categories.map((c) => ({
      key: c.key,
      label: c.label,
      score: c.score,
      signals: c.signals.map((s) => ({
        key: s.key,
        label: s.label,
        status: s.status,
        detail: s.detail,
      })),
    })),
    ai: {
      available: probe.available,
      appears: probe.appears,
      competitorCount: probe.competitorCount,
    },
  };

  cache.set(norm.host, { at: Date.now(), payload });
  return NextResponse.json(payload);
}
