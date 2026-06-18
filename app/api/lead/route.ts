import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';

const PHONE_RE = /^(?:972|0)[\d]{9,10}$/;

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(req: Request) {
  let body: { name?: unknown; phone?: unknown; company?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot
  if (asString(body.company).length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = asString(body.name);
  const phone = asString(body.phone).replace(/\D/g, '');

  if (!name || name.length > 80) {
    return NextResponse.json({ ok: false, error: 'invalid_name' }, { status: 400 });
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
    await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: notifyTo,
      subject: `ליד חדש מ-HELIX — ${name}`,
      text: [
        `שם: ${name}`,
        `טלפון: ${phone}`,
        '',
        `התקבל: ${new Date().toISOString()}`,
        `מקור: HELIX website — lead form`,
      ].join('\n'),
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('Resend send failed', err);
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 500 });
  }
}
