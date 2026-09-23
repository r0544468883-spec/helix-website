// GTM Intelligence tool API, powers /free-tools/gtm-intelligence. Runs the GTM intelligence
// analysis (ICP + TAM revenue model + account brief + competitor battlecard) via a maker+critic
// Claude team. Same shape, gate and rate-limit convention as /api/differentiation. Requires
// ANTHROPIC_API_KEY (degrades to `unconfigured`).

import { NextResponse } from 'next/server';
import { runGtmIntelligence, type GtmInput } from '@/lib/gtm-intelligence-engine';
import { FREE_LIMIT, UNKNOWN_USES, countUses, remainingUses, recordUse } from '@/lib/gtm-intelligence-usage';
import { clientIp } from '@/lib/client-ip';
import { rateLimited } from '@/lib/rate-limit';
import { helixAI } from '@/lib/helix-ai';
import { notifyLead } from '@/lib/notify-lead';
import { recordContentLead } from '@/lib/content-leads';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// One spelling of the source, so the Supabase row and the notification can never drift apart.
const SOURCE = '/free-tools/gtm-intelligence';

// The intake reaches us from an anonymous caller, so every field is capped before it
// goes into the notification.
const cap = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

// Only the fields the visitor actually filled. An empty body passes the email gate, so
// without this a probe would mail us a blank intake on every request.
const filled = (bag: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(bag).filter(([, v]) => v));

export async function POST(req: Request) {
  // Unauthenticated endpoint that sends mail and spends Claude tokens, so it is capped per IP.
  if (rateLimited('gtm-intelligence', clientIp(req), 10)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  const declared = Number(req.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > 100_000) {
    return NextResponse.json({ ok: false, error: 'too_large' }, { status: 413 });
  }

  let body: { mode?: string; input?: unknown; leadEmail?: unknown; name?: unknown };
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

  // The form asks for a full name. Read it here so the notification says who this is,
  // not just an address.
  const leadName = cap(body.name, 120);

  // Status probe, how many free runs are left for this email (no generation, no charge).
  if (body.mode === 'status') {
    return NextResponse.json({ ok: true, remaining: await remainingUses(leadEmail), limit: FREE_LIMIT });
  }

  if (body.mode === 'run') {
    // Capture the intake before the quota gate, not after. A 503 quota_unavailable
    // means Supabase is unreachable, which is precisely when we most need the lead
    // to reach a person: the notification is then the only copy that survives.
    const input = (body.input ?? {}) as GtmInput;

    // The intake is captured BEFORE the engine runs. It used to sit behind the success
    // gate, so `unconfigured`, `bad_request` and the 502 that an invalid ANTHROPIC_API_KEY
    // produces all returned first and threw away everything the visitor typed. What was
    // left was the bare address from the client's ping to /api/content-lead, and the run
    // that fails is exactly the lead we owe a phone call.
    const details = filled({
      'מה אתם מוכרים': cap(input.sells, 1200),
      'מי הלקוח היום': cap(input.customer, 1200),
      'השוק במשפט': cap(input.market, 1200),
      'גודל עסקה טיפוסית': cap(input.dealBand, 200),
      'שם החברה או המתחרה לתחקיר': cap(input.target, 200),
    });
    if (Object.keys(details).length) {
      // Persist first, notify second. notifyLead returns false instead of throwing and the
      // sending domain is not verified yet, so the Supabase row is the copy we can count on.
      await recordContentLead({ email: leadEmail, source: SOURCE, name: leadName, details });
      await notifyLead({ kind: 'ליד מכלי GTM', source: SOURCE, name: leadName, email: leadEmail, details, req });
    }

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

    const r = await runGtmIntelligence(input);
    if (r.status === 'unconfigured') return NextResponse.json({ ok: false, error: 'unconfigured' });
    if (r.status === 'bad_request') return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });
    if (r.status !== 'ok' || !r.analysis) return NextResponse.json({ ok: false, error: 'error' }, { status: 502 });
    await recordUse(leadEmail);
    // PIXEL spine: free-tool usage is a lead signal. Guarded + non-blocking.
    helixAI.capture({ event: 'free_tool_used', distinctId: leadEmail, product: 'site', properties: { tool: 'gtm-intelligence', mode: 'run' } });
    return NextResponse.json({
      ok: true,
      analysis: r.analysis,
      remaining: Math.max(0, FREE_LIMIT - (used + 1)),
      limit: FREE_LIMIT,
    });
  }

  return NextResponse.json({ ok: false, error: 'invalid_mode' }, { status: 400 });
}
