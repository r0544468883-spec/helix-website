import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { recordContentLead } from '@/lib/content-leads';
import { FREE_LIMIT, remainingUses } from '@/lib/content-usage';

// Email gate for /free-tools/content — capturing an email is what unlocks the free tool.
// Validates the email, notifies HELIX (best-effort via Resend), and returns ok. We never
// block the user because our own notification failed — a valid email is enough to unlock.

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(req: Request) {
  let body: { email?: unknown; company?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot — pretend success.
  if (asString(body.company).length > 0) return NextResponse.json({ ok: true });

  const email = asString(body.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }

  // Persist the lead to Supabase (best-effort; no-op if SUPABASE_* env is unset).
  await recordContentLead({ email, source: 'content' });

  // Best-effort notify — don't fail the unlock if it's not configured.
  const notifyTo = process.env.RESEND_NOTIFY_TO;
  if (notifyTo) {
    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: notifyTo,
        subject: `ליד חדש — כלי התוכן החינמי (${email})`,
        text: [`אימייל: ${email}`, '', `התקבל: ${new Date().toISOString()}`, 'מקור: /free-tools/content'].join('\n'),
      });
    } catch (err) {
      console.error('content-lead notify failed', err);
    }
  }

  return NextResponse.json({ ok: true, remaining: await remainingUses(email), limit: FREE_LIMIT });
}
