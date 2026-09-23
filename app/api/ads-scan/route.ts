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
import { rateLimited } from '@/lib/rate-limit';
import { notifyLead } from '@/lib/notify-lead';
import { helixAI } from '@/lib/helix-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; payload: Record<string, unknown> }>();
const RATE_MAX = 10;

// includes('@') is enough to unlock the report, and it stays that way: a visitor
// who typed a sloppy address should still see what they were promised. It is NOT
// enough to put an address on an outbound mail. This route is unauthenticated and
// has no login, so "@" alone would let a script pump attacker-written content
// into the notification inbox. The mail is gated on a real address, the unlock is not.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 200;

export async function POST(req: Request) {
  if (rateLimited('ads-scan', clientIp(req), RATE_MAX)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: { url?: unknown; email?: unknown; name?: unknown; phone?: unknown; company?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot, same field the migrated forms use. No human sees it, so anything
  // in it is a bot: do nothing. Unlike the plain forms this route carries a result,
  // and the client renders that result straight away, so a bare ok:true with no
  // payload would white-screen the tool. Answer with an error code the client
  // already maps, reusing the rate-limit shape so a bot cannot tell the trap
  // apart from the limiter above.
  if (typeof body.company === 'string' && body.company.trim().length > 0) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const norm = normalizeUrl(typeof body.url === 'string' ? body.url : '');
  if (!norm) return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 });

  const email = typeof body.email === 'string' && body.email.includes('@') ? body.email : undefined;
  const mailTo = email && email.length <= MAX_EMAIL_LEN && EMAIL_RE.test(email) ? email : undefined;
  const name = typeof body.name === 'string' ? body.name : undefined;
  const phone = typeof body.phone === 'string' ? body.phone : undefined;

  // Compute (cache by host), then gate.
  let result = cache.get(norm.host)?.payload;
  const fresh = !result || Date.now() - (cache.get(norm.host)?.at ?? 0) >= CACHE_TTL_MS;
  if (fresh) {
    const page = await fetchPage(norm.url);
    if (!page) {
      // The gate submit is a SECOND post, and it can land on an instance whose
      // `cache` is cold, so it refetches the site. If that refetch fails the
      // visitor gets an error on a form that already worked once, and without
      // this the lead would vanish with it. A site we could not fetch is still
      // someone worth calling, so capture first and only then report the failure.
      if (email) {
        await recordScan({ url: norm.url, host: norm.host, business_name: norm.host, source: 'ads-scan', has_lead: true, email, name, phone });
        if (mailTo) {
          await notifyLead({
            kind: 'ליד מבדיקת פרסום',
            source: '/free-tools/ads-scan',
            name,
            email: mailTo,
            phone,
            details: {
              'אתר': norm.url,
              'דומיין': norm.host,
              'הערה': 'הסריקה עצמה נכשלה, לא הצלחנו למשוך את האתר. אין תוצאות לליד הזה, אבל הוא השאיר אימייל.',
            },
            req,
          });
        }
      }
      return NextResponse.json({ ok: false, error: 'fetch_failed' }, { status: 422 });
    }
    // Fast (no PageSpeed) — the scan returns in ~1s instead of ~25s. Losing only the two
    // Lighthouse-derived signals (landing-quality / SEO hint), which degrade gracefully.
    const extras = computeExtrasFast(page.html);
    const analysis = analyzeAdReadiness(extras);
    result = { ...analysis } as Record<string, unknown>;
    cache.set(norm.host, { at: Date.now(), payload: result });
  }
  const a = result as unknown as ReturnType<typeof analyzeAdReadiness>;

  // Awaited (Cloud Run CPU-throttles after flush). No-op without Supabase env.
  await recordScan({ url: norm.url, host: norm.host, business_name: norm.host, source: 'ads-scan', has_lead: !!email, email, name, phone });

  // Only an email turns a scan into a lead. The tool runs ungated for anonymous visitors too,
  // and mailing every anonymous scan would bury the real leads. The scan RESULT rides along:
  // the score and the waste band are what the first call back to the lead opens with.
  if (mailTo) {
    await notifyLead({
      kind: 'ליד מבדיקת פרסום',
      source: '/free-tools/ads-scan',
      name,
      email: mailTo,
      phone,
      details: {
        'אתר': norm.url,
        'דומיין': norm.host,
        'ציון': a.score,
        'מריץ מודעות': a.runsAds ? 'כן' : 'לא',
        'רמת בזבוז': a.wasteBand,
        'סיכום': a.summary,
        'סימנים בעייתיים':
          a.signals
            .filter((s) => s.status !== 'ok')
            .map((s) => `${s.label} (${s.status})`)
            .join(' | ')
            .slice(0, 800) || 'אין',
      },
      req,
    });
  }

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
