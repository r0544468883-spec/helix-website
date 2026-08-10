// Gated full report for /ai-checker. Leaving contact details = requesting HELIX's free diagnosis.
// Validates the lead (like lib/register.ts), runs the FULL scan (with fixes) + full Layer A
// (all providers, competitor names, the actual AI answers), emails the lead to HELIX, and
// returns the unlocked report to the client.

import { NextResponse } from 'next/server';
import { getResend } from '@/lib/resend';
import { scanSite, normalizeUrl } from '@/lib/geo-scan';
import { fullVisibility } from '@/lib/ai-visibility';
import { recordScan } from '@/lib/supabase-scans';
import { clientIp } from '@/lib/client-ip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^(?:972|0)5\d{8}$/;

// This route fans out to a full site scan plus every configured LLM provider,
// so it is the most expensive endpoint on the site. It was also the only scan
// route with no rate limit at all.
const hits = new Map<string, { at: number; count: number }>();
const RATE_WINDOW_MS = 60 * 1000;
const RATE_MAX = 2;

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

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Best-effort lead notification — never blocks or fails the caller. */
async function notifyLead(subject: string, lines: string[]): Promise<void> {
  const notifyTo = process.env.RESEND_NOTIFY_TO;
  if (!notifyTo) {
    console.error('RESEND_NOTIFY_TO not set — lead not emailed');
    return;
  }
  try {
    await getResend().emails.send({
      from: 'onboarding@resend.dev',
      to: notifyTo,
      subject,
      text: [...lines, '', `התקבל: ${new Date().toISOString()}`].join('\n'),
    });
  } catch (err) {
    console.error('Resend send failed', err);
  }
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) return `972${digits.slice(1)}`;
  if (digits.startsWith('972')) return digits;
  return digits;
}

export async function POST(req: Request) {
  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

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
    // The SCAN failed, the LEAD did not. A lead HELIX can call back is worth more
    // than the report — capture it before bailing out.
    await recordScan({
      url: norm.url,
      host: norm.host,
      has_lead: true,
      name,
      email,
      phone,
      source: 'report',
    });
    await notifyLead(`בקשת אבחון חינם — ${name} (הסריקה נכשלה)`, [
      `שם: ${name}`,
      `אימייל: ${email}`,
      `טלפון: +${phone}`,
      `אתר שנבדק: ${norm.url}`,
      `שגיאת סריקה: ${scan.error ?? 'scan_failed'}`,
    ]);
    return NextResponse.json({ ok: false, error: scan.error ?? 'scan_failed' }, { status: 422 });
  }

  const visibility = await fullVisibility(scan.business, norm.host);

  // Awaited, not fire-and-forget: Cloud Run throttles CPU to ~0 the moment the
  // response is flushed, which would abandon this insert — and it carries the
  // lead. No-op if Supabase env is unset; bounded by a 5s timeout in recordScan.
  await recordScan({
    url: norm.url,
    host: norm.host,
    ladder: scan.ladder,
    issues: scan.issuesCount,
    business_name: scan.business.name,
    has_lead: true,
    name,
    email,
    phone,
    source: 'report',
  });

  // Fire the lead email (never block the report on email failure).
  await notifyLead(`בקשת אבחון חינם (בדיקת AI) — ${name}`, [
    `שם: ${name}`,
    `אימייל: ${email}`,
    `טלפון: +${phone}`,
    `אתר שנבדק: ${norm.url}`,
    `ציון סולם GEO: ${scan.ladder}/10`,
    `בעיות שזוהו: ${scan.issuesCount}`,
    visibility.available
      ? `מופיע ב-AI: ${visibility.appearsAnywhere ? 'כן' : 'לא'} · מתחרים שמופיעים: ${visibility.competitors.join(', ') || '—'}`
      : 'שכבת AI חיה: לא מחוברת (חסרים מפתחות API)',
  ]);

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
