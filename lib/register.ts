import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:972|0)5\d{8}$/;

type Payload = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  company?: unknown;
};

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  if (digits.startsWith('972')) return digits;
  return digits;
}

/**
 * Builds a registration POST handler for a free workshop.
 * `workshopLabel` is interpolated into the notification email subject.
 */
export function createRegisterHandler(workshopLabel: string) {
  return async function POST(req: Request) {
    let body: Payload;
    try {
      body = (await req.json()) as Payload;
    } catch {
      return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
    }

    if (asString(body.company).length > 0) {
      return NextResponse.json({ ok: true });
    }

    const name = asString(body.name);
    const email = asString(body.email).toLowerCase();
    const phone = normalizePhone(asString(body.phone));

    if (!name || name.length > 80) {
      return NextResponse.json({ ok: false, error: 'invalid_name' }, { status: 400 });
    }
    if (!EMAIL_RE.test(email) || email.length > 200) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }
    if (!PHONE_RE.test(phone)) {
      return NextResponse.json({ ok: false, error: 'invalid_phone' }, { status: 400 });
    }

    const notifyTo = process.env.RESEND_NOTIFY_TO;
    if (!notifyTo) {
      console.error('RESEND_NOTIFY_TO not set');
      return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 500 });
    }

    try {
      const resend = getResend();
      const userAgent = req.headers.get('user-agent') ?? 'unknown';
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: notifyTo,
        subject: `הרשמה חדשה לסדנת ${workshopLabel} — ${name}`,
        text: [
          `שם: ${name}`,
          `אימייל: ${email}`,
          `טלפון: +${phone}`,
          '',
          `התקבל: ${new Date().toISOString()}`,
          `User-Agent: ${userAgent}`,
        ].join('\n'),
      });
      return NextResponse.json({ ok: true });
    } catch (err) {
      console.error('Resend send failed', err);
      return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 500 });
    }
  };
}
