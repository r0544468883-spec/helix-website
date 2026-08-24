// Content tool API, powers /free-tools/content. Routes by `mode` to the engine's three
// capabilities (analyze posts / build a post / write+rewrite email). Same shape & rate-limit
// convention as /api/readiness-scan. Requires ANTHROPIC_API_KEY (degrades to `unconfigured`).

import { NextResponse } from 'next/server';
import { analyzePosts, buildPost, handleEmail, type BuildInput, type EmailInput } from '@/lib/content-tool';
import { FREE_LIMIT, ANALYZE_LIMIT, UNKNOWN_USES, countUses, remainingUses, recordUse } from '@/lib/content-usage';
import { clientIp } from '@/lib/client-ip';
import { helixAI } from '@/lib/helix-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const hits = new Map<string, { at: number; count: number }>();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 20;

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
  if (Number.isFinite(declared) && declared > 200_000) {
    return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });
  }

  let body: { mode?: string; posts?: unknown; build?: unknown; email?: unknown; leadEmail?: unknown };
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

  const fail = (status: string) =>
    status === 'unconfigured'
      ? NextResponse.json({ ok: false, error: 'unconfigured' })
      : status === 'bad_request'
        ? NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
        : NextResponse.json({ ok: false, error: 'error' }, { status: 502 });

  // Status probe, how many free uses are left for this email (no generation, no charge).
  if (body.mode === 'status') {
    return NextResponse.json({ ok: true, remaining: await remainingUses(leadEmail), limit: FREE_LIMIT });
  }

  // Analysis is the free hook, generous, but NOT unbounded: it is a paid Claude
  // call reachable by anyone who supplies a syntactically valid email string.
  if (body.mode === 'analyze') {
    const usedAnalyze = await countUses(leadEmail, ['analyze']);
    if (usedAnalyze === UNKNOWN_USES) {
      return NextResponse.json({ ok: false, error: 'quota_unavailable' }, { status: 503 });
    }
    if (usedAnalyze >= ANALYZE_LIMIT) {
      return NextResponse.json({ ok: false, error: 'quota_exceeded', limit: ANALYZE_LIMIT }, { status: 402 });
    }
    const posts = Array.isArray(body.posts) ? (body.posts as string[]) : [];
    const r = await analyzePosts(posts);
    if (r.status !== 'ok') return fail(r.status);
    await recordUse(leadEmail, 'analyze');
    // PIXEL spine: free-tool usage is a lead signal. Guarded + non-blocking.
    helixAI.capture({ event: 'free_tool_used', distinctId: leadEmail, product: 'site', properties: { tool: 'content', mode: 'analyze' } });
    return NextResponse.json({ ok: true, dna: r.dna });
  }

  // Billable modes (build / email), enforce the free quota, then meter on success.
  if (body.mode === 'build' || body.mode === 'email') {
    const used = await countUses(leadEmail, ['build', 'email']);
    if (used === UNKNOWN_USES) {
      return NextResponse.json({ ok: false, error: 'quota_unavailable' }, { status: 503 });
    }
    if (used >= FREE_LIMIT) {
      return NextResponse.json(
        { ok: false, error: 'quota_exceeded', used, limit: FREE_LIMIT, remaining: 0 },
        { status: 402 },
      );
    }
    const r =
      body.mode === 'build'
        ? await buildPost((body.build ?? {}) as BuildInput)
        : await handleEmail((body.email ?? {}) as EmailInput);
    if (r.status !== 'ok') return fail(r.status);
    await recordUse(leadEmail, body.mode);
    // PIXEL spine: free-tool usage is a lead signal. Guarded + non-blocking.
    helixAI.capture({ event: 'free_tool_used', distinctId: leadEmail, product: 'site', properties: { tool: 'content', mode: body.mode } });
    return NextResponse.json({
      ok: true,
      result: r.result,
      remaining: Math.max(0, FREE_LIMIT - (used + 1)),
      limit: FREE_LIMIT,
    });
  }

  return NextResponse.json({ ok: false, error: 'invalid_mode' }, { status: 400 });
}
