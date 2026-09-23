import { NextResponse } from 'next/server';
import { notifyLead } from '@/lib/notify-lead';
import { recordContentLead } from '@/lib/content-leads';
import { FREE_LIMIT, remainingUses } from '@/lib/content-usage';
import { clientIp } from '@/lib/client-ip';
import { rateLimited } from '@/lib/rate-limit';

// Lead capture for the free tools. Persists the lead (email + real source + name +
// questionnaire details), notifies HELIX with the FULL lead (best-effort via Resend), and
// returns ok. We never block the user because our own notification failed.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

// Accept a flat {key: value} bag of questionnaire answers, capped so an anonymous caller
// can't stuff the notification email. Keys/values are coerced to strings.
function asDetails(v: unknown): Record<string, string> {
  if (!v || typeof v !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const key = asString(k).slice(0, 60);
    const value = asString(val).slice(0, 600);
    if (key && value) out[key] = value;
    if (Object.keys(out).length >= 25) break;
  }
  return out;
}

export async function POST(req: Request) {
  // Unauthenticated, sends one Resend mail and hits Supabase twice per call, and the
  // newsletter form put it on every article page and /playbook. The honeypot stops
  // nothing here, since a direct POST simply omits `company`, so cap it per IP.
  // 10/min is the same budget /api/lead uses and is far above real traffic: a visitor
  // unlocks once, and the tool clients that fire this alongside their main call fire it
  // once per run, behind an LLM round-trip of several seconds.
  if (rateLimited('content-lead', clientIp(req), 10)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: { email?: unknown; company?: unknown; source?: unknown; name?: unknown; details?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot, pretend success.
  if (asString(body.company).length > 0) return NextResponse.json({ ok: true });

  const email = asString(body.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  const source = asString(body.source).slice(0, 80) || 'content';
  const name = asString(body.name).slice(0, 120);
  const details = asDetails(body.details);

  // Persist the lead (best-effort; no-op if SUPABASE_* env is unset).
  const rec = await recordContentLead({ email, source, name, details });

  // Notify HELIX with the FULL lead through the one path every form uses.
  // Best-effort: never fail the unlock because our own notification failed —
  // notifyLead() does not throw, it reports.
  const notified = await notifyLead({
    kind: 'ליד חדש מהכלים החינמיים',
    source,
    name,
    email,
    details,
    req,
  });
  // Kept from the diagnostic pass: the caller still learns that the mail leg
  // failed even though the unlock succeeded. lib/notify-lead.ts logs the cause.
  const mailError = notified ? undefined : 'notify_failed';

  // A DB outage means "unknown", not "zero".
  let remaining: number | null = null;
  try {
    remaining = await remainingUses(email);
  } catch {
    /* unknown */
  }
  return NextResponse.json({
    ok: true,
    stored: rec.stored,
    storeStatus: rec.status,
    storeError: rec.error,
    mailError,
    remaining,
    limit: FREE_LIMIT,
  });
}
