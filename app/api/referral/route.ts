import { NextResponse } from 'next/server';
import { notifyLead } from '@/lib/notify-lead';
import { recordContentLead } from '@/lib/content-leads';
import { clientIp } from '@/lib/client-ip';
import { rateLimited } from '@/lib/rate-limit';
import {
  getOrCreateReferrer,
  recordReferralClick,
  recordReferralSignup,
} from '@/lib/referrals';

// Track A — HELIX self-growth share-to-earn loop. One endpoint, three actions:
//   register → email in, returns the visitor's share code + current progress
//   track    → log a click on a share link (attribution, incl. channel=qr)
//   signup   → a referred person joined; credits the referrer, may issue a coupon
// Mirrors app/api/content-lead/route.ts conventions (honeypot, graceful, no throw).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(req: Request) {
  let body: { action?: unknown; email?: unknown; code?: unknown; channel?: unknown; company?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const action = asString(body.action);

  // Unauthenticated endpoint that sends mail, so it is capped per IP. The cap is
  // per action, not per endpoint: InviteClient fires `track` on every invite-page
  // view, so ten views a minute from one shared IP (event wifi, a QR campaign, a
  // carrier NAT) used to spend the whole budget on clicks and 429 the next real
  // signup. InviteClient shows "תודה" whatever comes back, so that visitor was
  // thanked for a lead nobody saved or mailed. A click carries no lead, so it gets
  // its own wider bucket; register and signup keep the tighter one. The honeypot
  // below only catches a browser filling the form; a script posting JSON never
  // touches it.
  const overLimit =
    action === 'track'
      ? rateLimited('referral-track', clientIp(req), 30)
      : rateLimited('referral', clientIp(req), 10);
  if (overLimit) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  // Honeypot — pretend success.
  if (asString(body.company).length > 0) return NextResponse.json({ ok: true });

  if (action === 'register') {
    const email = asString(body.email).toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 200) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }
    const state = await getOrCreateReferrer(email);
    // A null state means Supabase is off or the insert failed, so no referrer row
    // exists. The address the visitor typed must not disappear with it: persist a
    // plain lead row as the fallback, then notify either way. Persist first,
    // notify second.
    if (!state) {
      await recordContentLead({
        email,
        source: 'referral',
        details: { 'קוד שיתוף': 'לא נוצר' },
      });
    }
    // Known limitation, same shape as the duplicate signup below: `register` also
    // serves as "give me my link back" for ReferralWidget, which has no separate
    // lookup, and getOrCreateReferrer returns the same state for an existing row as
    // for a new one. So every time a returning visitor re-types their address just
    // to see the progress bar, this mail goes out again as if they had just joined.
    // Fixing it needs a lookup action in the widget, not a change here.
    await notifyLead({
      kind: state ? 'הרשמה לתוכנית ההפניות' : 'הרשמה לתוכנית ההפניות, הקוד לא נוצר',
      source: 'referral',
      email,
      details: { 'קוד שיתוף': state ? state.refCode : 'לא נוצר, המערכת לא הייתה זמינה' },
      req,
    });
    // The widget needs the state to render the share panel, so a failure stays a
    // failure on the wire. It just no longer costs us the address.
    if (!state) return NextResponse.json({ ok: false, error: 'unavailable' }, { status: 503 });
    return NextResponse.json({ ok: true, referrer: state });
  }

  if (action === 'track') {
    const code = asString(body.code);
    const channel = asString(body.channel) || 'direct';
    if (!code) return NextResponse.json({ ok: false, error: 'missing_code' }, { status: 400 });
    await recordReferralClick(code, channel.slice(0, 20));
    return NextResponse.json({ ok: true });
  }

  if (action === 'signup') {
    // Same 32 chars recordReferralSignup itself keeps. The code now reaches the
    // notification mail, and an anonymous caller must not be able to stuff it.
    const code = asString(body.code).slice(0, 32);
    const email = asString(body.email).toLowerCase();
    // No 'direct' fallback here, unlike `track`. InviteClient posts {action, code,
    // email} on join and sends the channel only on the track call, so a default
    // would file a visitor who scanned a QR code as 'direct', a measurement we
    // never took. The field travels only when the client actually sent one.
    const channel = asString(body.channel).slice(0, 20);
    if (!code || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
    }
    const state = await recordReferralSignup(code, email);

    // A null state means the code did not resolve (typo, expired, unknown referrer,
    // Supabase down), and that branch writes nothing at all. InviteClient shows
    // "תודה, נהיה בקשר" whatever comes back, and this form is the only capture path
    // on the page, so a null state must still leave a row and still send the mail.
    if (!state) {
      await recordContentLead({
        email,
        source: 'referral:invite',
        details: { 'קוד הפניה': code, ...(channel ? { ערוץ: channel } : {}), המפנה: 'לא זוהה' },
      });
    }

    // A self-referral is returned uncredited by recordReferralSignup, and the state
    // gives it away: the referrer is the same address that just signed up. Labelled
    // so Eran does not chase it as a new person. A duplicate signup is returned the
    // same way but is indistinguishable from a credited one here, since the state
    // carries no before/after counter.
    let kind = 'הצטרפות דרך הפניה';
    if (!state) kind = 'הצטרפות דרך הפניה, קוד המפנה לא זוהה';
    else if (state.email === email) kind = 'הפניה עצמית, לא זוכתה';

    await notifyLead({
      kind,
      source: 'referral:invite',
      email,
      details: {
        'קוד הפניה': code,
        ...(channel ? { ערוץ: channel } : {}),
        המפנה: state ? state.email : 'לא זוהה',
      },
      req,
    });
    return NextResponse.json({ ok: true, referrer: state });
  }

  return NextResponse.json({ ok: false, error: 'unknown_action' }, { status: 400 });
}
