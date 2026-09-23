import { NextResponse } from 'next/server';
import { notifyLead } from '@/lib/notify-lead';
import { recordContentLead } from '@/lib/content-leads';

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

    // Persist first: a registration lost to a Resend outage is a person who
    // shows up to a workshop we never put them on the list for.
    const { stored } = await recordContentLead({
      email,
      source: `workshop:${workshopLabel}`,
      name,
      details: { טלפון: `+${phone}`, סדנה: workshopLabel },
    });

    const sent = await notifyLead({
      kind: `הרשמה לסדנת ${workshopLabel}`,
      source: `workshop:${workshopLabel}`,
      name,
      email,
      phone: `+${phone}`,
      req,
    });

    if (!sent && !stored) {
      return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  };
}
