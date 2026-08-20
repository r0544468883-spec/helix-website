import 'server-only';
import { issueDiscountCode, REFERRAL_DISCOUNT_PERCENT } from './stripe-coupon';

// HELIX self-growth share-to-earn loop (Track A). Email-keyed, no auth — matches the
// marketing site's no-dependency Supabase REST pattern (lib/supabase-scans.ts). If
// SUPABASE_URL / SUPABASE_SERVICE_KEY are unset it degrades gracefully to no-ops.
//
// Tables: docs/helix_referrals.sql (helix_referrers, helix_referrals).

export const POINTS_PER_SIGNUP = 10;
export const THRESHOLD_REFERRALS = 3; // confirmed signups needed to auto-earn the discount
export { REFERRAL_DISCOUNT_PERCENT };

export interface ReferrerState {
  email: string;
  refCode: string;
  points: number;
  referralsConfirmed: number;
  couponCode: string | null;
  discountPercent: number;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function base(): string | null {
  const b = process.env.SUPABASE_URL;
  const k = process.env.SUPABASE_SERVICE_KEY;
  return b && k ? b.replace(/\/$/, '') : null;
}

function headers(extra?: Record<string, string>): Record<string, string> {
  const key = process.env.SUPABASE_SERVICE_KEY as string;
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', ...extra };
}

function genRefCode(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  let s = '';
  for (let i = 0; i < 7; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

interface ReferrerRow {
  email: string;
  ref_code: string;
  points: number;
  referrals_confirmed: number;
  coupon_code: string | null;
}

function toState(r: ReferrerRow): ReferrerState {
  return {
    email: r.email,
    refCode: r.ref_code,
    points: r.points,
    referralsConfirmed: r.referrals_confirmed,
    couponCode: r.coupon_code,
    discountPercent: REFERRAL_DISCOUNT_PERCENT,
  };
}

async function fetchReferrerByEmail(b: string, email: string): Promise<ReferrerRow | null> {
  const res = await fetch(`${b}/rest/v1/helix_referrers?email=eq.${encodeURIComponent(email)}&select=*`, {
    headers: headers(),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as ReferrerRow[];
  return rows[0] ?? null;
}

async function fetchReferrerByCode(b: string, code: string): Promise<ReferrerRow | null> {
  const res = await fetch(`${b}/rest/v1/helix_referrers?ref_code=eq.${encodeURIComponent(code)}&select=*`, {
    headers: headers(),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) return null;
  const rows = (await res.json()) as ReferrerRow[];
  return rows[0] ?? null;
}

/**
 * Get the referrer for this email, creating one (with a fresh ref_code) if new.
 * Returns null only if Supabase is not configured or the write failed.
 */
export async function getOrCreateReferrer(email: string): Promise<ReferrerState | null> {
  const b = base();
  const trimmed = email.trim().toLowerCase();
  if (!b || !EMAIL_RE.test(trimmed) || trimmed.length > 200) return null;

  const existing = await fetchReferrerByEmail(b, trimmed);
  if (existing) return toState(existing);

  const row = { email: trimmed, ref_code: genRefCode(), points: 0, referrals_confirmed: 0 };
  const res = await fetch(`${b}/rest/v1/helix_referrers`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(row),
    signal: AbortSignal.timeout(5000),
  });
  if (res.ok) {
    const [created] = (await res.json()) as ReferrerRow[];
    if (created) return toState(created);
  }
  // Lost a create race (unique email) — re-fetch.
  const again = await fetchReferrerByEmail(b, trimmed);
  return again ? toState(again) : null;
}

/** Record a click on a share link. Best-effort. */
export async function recordReferralClick(refCode: string, channel = 'direct'): Promise<void> {
  const b = base();
  if (!b || !refCode) return;
  try {
    await fetch(`${b}/rest/v1/helix_referrals`, {
      method: 'POST',
      headers: headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ referrer_code: refCode.trim().slice(0, 32), channel, status: 'clicked' }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error('recordReferralClick failed', err);
  }
}

/**
 * Record a confirmed signup attributed to refCode. Idempotent per (code, email):
 * increments the referrer's points + confirmed count, and once they cross
 * THRESHOLD_REFERRALS auto-issues a discount coupon. Returns the updated referrer state.
 */
export async function recordReferralSignup(refCode: string, referredEmail: string): Promise<ReferrerState | null> {
  const b = base();
  const code = refCode.trim().slice(0, 32);
  const referred = referredEmail.trim().toLowerCase();
  if (!b || !code || !EMAIL_RE.test(referred)) return null;

  const referrer = await fetchReferrerByCode(b, code);
  if (!referrer) return null;

  // Don't let people refer themselves.
  if (referrer.email === referred) return toState(referrer);

  // Idempotency: skip if this referred email already counted for this referrer.
  const dupRes = await fetch(
    `${b}/rest/v1/helix_referrals?referrer_code=eq.${encodeURIComponent(code)}&referred_email=eq.${encodeURIComponent(referred)}&status=eq.signed_up&select=id`,
    { headers: headers(), signal: AbortSignal.timeout(5000) }
  );
  const dup = dupRes.ok ? ((await dupRes.json()) as unknown[]).length > 0 : false;
  if (dup) return toState(referrer);

  // Log the signup event.
  await fetch(`${b}/rest/v1/helix_referrals`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=minimal' }),
    body: JSON.stringify({
      referrer_code: code,
      referred_email: referred,
      status: 'signed_up',
      confirmed_at: new Date().toISOString(),
    }),
    signal: AbortSignal.timeout(5000),
  }).catch(() => {});

  // Update the referrer's ledger.
  const newConfirmed = referrer.referrals_confirmed + 1;
  const newPoints = referrer.points + POINTS_PER_SIGNUP;
  let couponCode = referrer.coupon_code;
  const patch: Record<string, unknown> = { points: newPoints, referrals_confirmed: newConfirmed };

  if (!couponCode && newConfirmed >= THRESHOLD_REFERRALS) {
    couponCode = await issueDiscountCode(referrer.email);
    patch.coupon_code = couponCode;
    patch.coupon_issued_at = new Date().toISOString();
  }

  const patchRes = await fetch(`${b}/rest/v1/helix_referrers?ref_code=eq.${encodeURIComponent(code)}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=representation' }),
    body: JSON.stringify(patch),
    signal: AbortSignal.timeout(5000),
  });
  if (patchRes.ok) {
    const [updated] = (await patchRes.json()) as ReferrerRow[];
    if (updated) return toState(updated);
  }
  return { ...toState(referrer), points: newPoints, referralsConfirmed: newConfirmed, couponCode };
}
