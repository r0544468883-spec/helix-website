// Gated full report for /ai-checker. Leaving contact details = requesting HELIX's free diagnosis.
// Validates the lead (like lib/register.ts), runs the FULL scan (with fixes) + full Layer A
// (all providers, competitor names, the actual AI answers), emails the lead to HELIX, and
// returns the unlocked report to the client.

import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { scanSite, normalizeUrl } from '@/lib/geo-scan';
import { fullVisibility } from '@/lib/ai-visibility';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:972|0)5\d{8}$/;

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  if (digits.startsWith('972')) return digits;
  return digits;
}

export async function POST(req: Request) {
  let body: { url?: unknown; name?: unknown; email?: unknown; phone?: unknown; company?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot — pretend success.
  if (asString(body.company).length > 0) {
    return NextResponse.json({ ok: true, honeypot: true });
  }

  const name = asString(body.name);
  const email = asString(body.email).toLowerCase();
  const phone = normalizePhone(asString(body.phone));
  const norm = normalizeUrl(asString(body.url));

  if (!norm) return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 });
  if (!name || name.length > 80)
    return NextResponse.json({ ok: false, error: 'invalid_name' }, { status: 400 });
  if (!EMAIL_RE.test(email) || email.length > 200)
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  if (!PHONE_RE.test(phone))
    return NextResponse.json({ ok: false, error: 'invalid_phone' }, { status: 400 });

  const scan = await scanSite(norm.url);
  if (!scan.ok) {
    return NextResponse.json({ ok: false, error: scan.error ?? 'scan_failed' }, { status: 422 });
  }

  const visibility = await fullVisibility(scan.business, norm.host);

  // Fire the lead email (never block the report on email failure).
  const notifyTo = process.env.RESEND_NOTIFY_TO;
  if (notifyTo) {
    try {
      const resend = getResend();
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: notifyTo,
        subject: `בקשת אבחון חינם (בדיקת AI) — ${name}`,
        text: [
          `שם: ${name}`,
          `אימייל: ${email}`,
          `טלפון: +${phone}`,
          `אתר שנבדק: ${norm.url}`,
          `ציון סולם GEO: ${scan.ladder}/10`,
          `בעיות שזוהו: ${scan.issuesCount}`,
          visibility.available
            ? `מופיע ב-AI: ${visibility.appearsAnywhere ? 'כן' : 'לא'} · מתחרים שמופיעים: ${visibility.competitors.join(', ') || '—'}`
            : 'שכבת AI חיה: לא מחוברת (חסרים מפתחות API)',
          '',
          `התקבל: ${new Date().toISOString()}`,
        ].join('\n'),
      });
    } catch (err) {
      console.error('Resend send failed', err);
    }
  } else {
    console.error('RESEND_NOTIFY_TO not set — lead not emailed');
  }

  // Full report (includes the fixes and the live AI answers).
  return NextResponse.json({
    ok: true,
    report: {
      ladder: scan.ladder,
      issuesCount: scan.issuesCount,
      business: scan.business,
      categories: scan.categories,
      visibility,
    },
  });
}
