import { NextResponse } from 'next/server';
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

  // Honeypot — pretend success.
  if (asString(body.company).length > 0) return NextResponse.json({ ok: true });

  const action = asString(body.action);

  if (action === 'register') {
    const email = asString(body.email).toLowerCase();
    if (!EMAIL_RE.test(email) || email.length > 200) {
      return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
    }
    const state = await getOrCreateReferrer(email);
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
    const code = asString(body.code);
    const email = asString(body.email).toLowerCase();
    if (!code || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: 'invalid' }, { status: 400 });
    }
    const state = await recordReferralSignup(code, email);
    return NextResponse.json({ ok: true, referrer: state });
  }

  return NextResponse.json({ ok: false, error: 'unknown_action' }, { status: 400 });
}
