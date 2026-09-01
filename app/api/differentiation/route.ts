// Differentiation tool API, powers /free-tools/differentiation. Runs the strategic
// differentiation analysis (Porter / strategic groups / VRINO / SWOT / Blue Ocean /
// strategy statement) via a maker+critic Claude team. Same shape, gate and rate-limit
// convention as /api/content-tool. Requires ANTHROPIC_API_KEY (degrades to `unconfigured`).

import { NextResponse } from 'next/server';
import { runDifferentiation, type DiffInput } from '@/lib/differentiation-engine';
import { FREE_LIMIT, UNKNOWN_USES, countUses, remainingUses, recordUse } from '@/lib/differentiation-usage';
import { clientIp } from '@/lib/client-ip';
import { helixAI } from '@/lib/helix-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > 100_000) {
    return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });
  }

  let body: { mode?: string; input?: unknown; leadEmail?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Email gate, the free tool is unlocked by leaving an email. Enforced here so the
  // endpoint can't be used without one, not just hidden in the UI.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const leadEmail = typeof body.leadEmail === 'string' ? body.leadEmail.trim().slice(0, 200) : '';
  if (!EMAIL_RE.test(leadEmail)) {
    return NextResponse.json({ ok: false, error: 'gated' }, { status: 403 });
  }

  // Status probe, how many free runs are left for this email (no generation, no charge).
  if (body.mode === 'status') {
    return NextResponse.json({ ok: true, remaining: await remainingUses(leadEmail), limit: FREE_LIMIT });
  }

  if (body.mode === 'run') {
    const used = await countUses(leadEmail);
    if (used === UNKNOWN_USES) {
      return NextResponse.json({ ok: false, error: 'quota_unavailable' }, { status: 503 });
    }
    if (used >= FREE_LIMIT) {
      return NextResponse.json(
        { ok: false, error: 'quota_exceeded', used, limit: FREE_LIMIT, remaining: 0 },
        { status: 402 },
      );
    }
    const r = await runDifferentiation((body.input ?? {}) as DiffInput);
    if (r.status === 'unconfigured') return NextResponse.json({ ok: false, error: 'unconfigured' });
    if (r.status === 'bad_request') return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
    if (r.status !== 'ok' || !r.analysis) return NextResponse.json({ ok: false, error: 'error' }, { status: 502 });
    await recordUse(leadEmail);
    // PIXEL spine: free-tool usage is a lead signal. Guarded + non-blocking.
    helixAI.capture({ event: 'free_tool_used', distinctId: leadEmail, product: 'site', properties: { tool: 'differentiation', mode: 'run' } });
    return NextResponse.json({
      ok: true,
      analysis: r.analysis,
      remaining: Math.max(0, FREE_LIMIT - (used + 1)),
      limit: FREE_LIMIT,
    });
  }

  return NextResponse.json({ ok: false, error: 'invalid_mode' }, { status: 400 });
}
