// Content tool API — powers /free-tools/content. Routes by `mode` to the engine's three
// capabilities (analyze posts / build a post / write+rewrite email). Same shape & rate-limit
// convention as /api/readiness-scan. Requires ANTHROPIC_API_KEY (degrades to `unconfigured`).

import { NextResponse } from 'next/server';
import { analyzePosts, buildPost, handleEmail, type BuildInput, type EmailInput } from '@/lib/content-tool';

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
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: { mode?: string; posts?: unknown; build?: unknown; email?: unknown; leadEmail?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Email gate — the free tool is unlocked by leaving an email. Enforced here so the
  // endpoint can't be used without one, not just hidden in the UI.
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const leadEmail = typeof body.leadEmail === 'string' ? body.leadEmail.trim() : '';
  if (!EMAIL_RE.test(leadEmail)) {
    return NextResponse.json({ ok: false, error: 'gated' }, { status: 403 });
  }

  const fail = (status: string) =>
    status === 'unconfigured'
      ? NextResponse.json({ ok: false, error: 'unconfigured' })
      : status === 'bad_request'
        ? NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 })
        : NextResponse.json({ ok: false, error: 'error' }, { status: 502 });

  if (body.mode === 'analyze') {
    const posts = Array.isArray(body.posts) ? (body.posts as string[]) : [];
    const r = await analyzePosts(posts);
    return r.status === 'ok' ? NextResponse.json({ ok: true, dna: r.dna }) : fail(r.status);
  }

  if (body.mode === 'build') {
    const r = await buildPost((body.build ?? {}) as BuildInput);
    return r.status === 'ok' ? NextResponse.json({ ok: true, result: r.result }) : fail(r.status);
  }

  if (body.mode === 'email') {
    const r = await handleEmail((body.email ?? {}) as EmailInput);
    return r.status === 'ok' ? NextResponse.json({ ok: true, result: r.result }) : fail(r.status);
  }

  return NextResponse.json({ ok: false, error: 'invalid_mode' }, { status: 400 });
}
