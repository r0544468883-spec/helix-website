// Free Scan "בדיקה A" — Marketing/Ad Readiness scan (URL, zero-friction). Reuses the same
// engine as /api/readiness-scan (one page fetch + computeExtras) but interprets the signals
// through an ADS lens (lib/ads-readiness). Ungated: signals + score + summary. Gated (email):
// the wasteBand + wasteNote money line. Detection only — leads to HELIX OPS.

import { NextResponse } from 'next/server';
import { normalizeUrl } from '@/lib/geo-scan';
import { fetchPage, computeExtrasFast } from '@/lib/readiness-extras';
import { analyzeAdReadiness } from '@/lib/ads-readiness';
import { recordScan } from '@/lib/supabase-scans';
import { clientIp } from '@/lib/client-ip';
import { helixAI } from '@/lib/helix-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; payload: Record<string, unknown> }>();
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
  const ip = clientIp(req);
  if (rateLimited(ip)) return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });

  let body: { url?: unknown; email?: unknown; name?: unknown; phone?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const norm = normalizeUrl(typeof body.url === 'string' ? body.url : '');
  if (!norm) return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 });

  const email = typeof body.email === 'string' && body.email.includes('@') ? body.email : undefined;

  // Compute (cache by host), then gate.
  let result = cache.get(norm.host)?.payload;
  const fresh = !result || Date.now() - (cache.get(norm.host)?.at ?? 0) >= CACHE_TTL_MS;
  if (fresh) {
    const page = await fetchPage(norm.url);
    if (!page) return NextResponse.json({ ok: false, error: 'fetch_failed' }, { status: 422 });
    // Fast (no PageSpeed) — the scan returns in ~1s instead of ~25s. Losing only the two
    // Lighthouse-derived signals (landing-quality / SEO hint), which degrade gracefully.
    const extras = computeExtrasFast(page.html);
    const analysis = analyzeAdReadiness(extras);
    result = { ...analysis } as Record<string, unknown>;
    cache.set(norm.host, { at: Date.now(), payload: result });
  }
  const a = result as unknown as ReturnType<typeof analyzeAdReadiness>;

  // Awaited (Cloud Run CPU-throttles after flush). No-op without Supabase env.
  await recordScan({ url: norm.url, host: norm.host, business_name: norm.host, source: 'ads-scan', has_lead: !!email, email, name: typeof body.name === 'string' ? body.name : undefined, phone: typeof body.phone === 'string' ? body.phone : undefined });

  // Ungated teaser vs full (email unlocks the money line).
  const payload = {
    ok: true,
    runsAds: a.runsAds,
    score: a.score,
    summary: a.summary,
    signals: a.signals,
    // gated:
    wasteBand: email ? a.wasteBand : null,
    wasteNote: email ? a.wasteNote : null,
    gated: !email,
  };
  // PIXEL spine: a scan is an intent signal (feeds OPS cross-sell). Guarded + non-blocking.
  helixAI.capture({ event: 'free_scan', distinctId: email || norm.host, product: 'site', properties: { tool: 'ads-scan', host: norm.host, score: a.score, hasLead: !!email } });
  return NextResponse.json(payload);
}
