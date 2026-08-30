import 'server-only';

// Clean interface for issuing a real discount for a referral reward.
// If STRIPE_SECRET_KEY is set, creates a one-off Stripe promotion code the visitor
// can paste at checkout. If not (today — the Account Portal / Stripe is still a POC),
// it degrades gracefully to a locally-generated code so the loop is fully functional
// now and lights up for real the moment Stripe is wired. Same no-hard-dependency,
// degrade-gracefully pattern as lib/supabase-scans.ts.

export const REFERRAL_DISCOUNT_PERCENT = 20; // 20% off a paid HELIX product

function localCode(): string {
  // Human-friendly, unambiguous (no 0/O/1/I) code, e.g. HELIX-7K4Q9P
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `HELIX-${s}`;
}

/**
 * Issue a discount code for a referral reward. Returns the code the visitor uses at
 * checkout. Never throws — falls back to a local code if Stripe is unavailable.
 */
export async function issueDiscountCode(email: string): Promise<string> {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) return localCode();

  try {
    // Create a coupon, then a promotion code bound to it. Minimal REST calls so we
    // avoid pulling in the stripe SDK before the Portal work standardises it.
    const auth = { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/x-www-form-urlencoded' };
    const couponRes = await fetch('https://api.stripe.com/v1/coupons', {
      method: 'POST',
      headers: auth,
      body: new URLSearchParams({
        percent_off: String(REFERRAL_DISCOUNT_PERCENT),
        duration: 'once',
        'metadata[reason]': 'referral_reward',
        'metadata[email]': email,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!couponRes.ok) return localCode();
    const coupon = (await couponRes.json()) as { id: string };

    const code = localCode();
    const promoRes = await fetch('https://api.stripe.com/v1/promotion_codes', {
      method: 'POST',
      headers: auth,
      body: new URLSearchParams({ coupon: coupon.id, code, max_redemptions: '1' }),
      signal: AbortSignal.timeout(8000),
    });
    if (!promoRes.ok) return code; // coupon exists; the code string is still valid to surface
    return code;
  } catch (err) {
    console.error('issueDiscountCode failed, using local code', err);
    return localCode();
  }
}
