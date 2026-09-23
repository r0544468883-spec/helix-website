import { NextResponse } from 'next/server';
import { notifyLead } from '@/lib/notify-lead';
import { recordContentLead } from '@/lib/content-leads';
import { clientIp } from '@/lib/client-ip';
import { rateLimited } from '@/lib/rate-limit';

// The general "a visitor left their details" endpoint. Every form on the site
// that asks for a name and a way to be reached lands here: the homepage lead
// form, the partner application, the exit popup, the AI-agent interest form and
// the product-landing forms.
//
// It used to accept {name, phone} only, which is why callers with more to say
// (the partner form) smuggled their extra fields into `name` and tripped the
// 80-char limit. Extra fields now travel in `details` and reach the inbox intact.

export const runtime = 'nodejs';

// After stripping non-digits: an Israeli landline is 9 digits (03-6123456),
// a mobile is 10 (052-5447209), and either can arrive in 972 form. The old
// {9,10} rejected every landline, so those leads 400'd and were lost.
const PHONE_RE = /^(?:972|0)\d{8,10}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Free-form extra answers. Capped so an anonymous caller can't stuff the mail. */
function asDetails(v: unknown): Record<string, string> {
  if (!v || typeof v !== 'object') return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    const key = asString(k).slice(0, 60);
    const value = asString(val).slice(0, 800);
    if (key && value) out[key] = value;
    if (Object.keys(out).length >= 25) break;
  }
  return out;
}

export async function POST(req: Request) {
  // Unauthenticated endpoint that sends mail, so it is capped per IP.
  if (rateLimited('lead', clientIp(req), 10)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: {
    name?: unknown;
    phone?: unknown;
    email?: unknown;
    source?: unknown;
    interest?: unknown;
    details?: unknown;
    company?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot.
  if (asString(body.company).length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = asString(body.name).slice(0, 120);
  const phone = asString(body.phone).replace(/\D/g, '');
  const email = asString(body.email).toLowerCase();
  const source = asString(body.source).slice(0, 80) || 'lead-form';
  const interest = asString(body.interest).slice(0, 120);
  const details = asDetails(body.details);

  if (!name) {
    return NextResponse.json({ ok: false, error: 'invalid_name' }, { status: 400 });
  }

  const hasPhone = PHONE_RE.test(phone);
  const hasEmail = EMAIL_RE.test(email) && email.length <= 200;

  // Reject only when we would be left with no way to reach the person. A
  // malformed phone next to a good email is not worth losing the lead over:
  // it goes into details as typed so Eran can still read it and call.
  if (!hasPhone && !hasEmail) {
    return NextResponse.json(
      { ok: false, error: phone || email ? 'invalid_contact' : 'missing_contact' },
      { status: 400 }
    );
  }
  if (phone && !hasPhone) details['טלפון כפי שהוקלד'] = asString(body.phone).slice(0, 40);
  if (email && !hasEmail) details['אימייל כפי שהוקלד'] = asString(body.email).slice(0, 200);

  if (interest) details['מתעניין ב'] = interest;

  // Persist BEFORE notifying. The old version emailed and nothing else, so a
  // Resend outage lost the lead permanently and showed the visitor an error.
  const stored = await recordContentLead({
    // content_leads.email is not-null, so a phone-only lead gets a placeholder
    // and keeps its real contact detail in `details`.
    email: hasEmail ? email : `lead-${phone || 'unknown'}@no-email.local`,
    source,
    name,
    details: { ...details, ...(hasPhone ? { טלפון: phone } : {}) },
  });

  const sent = await notifyLead({
    kind: 'ליד חדש',
    source,
    name,
    email: hasEmail ? email : undefined,
    phone: hasPhone ? phone : undefined,
    details,
    req,
  });

  // Only a total loss is an error the visitor should see.
  if (!sent && !stored) {
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, stored, notified: sent });
}
