/**
 * The pure rules behind an access email (lib/crm-access-link.ts): the limits, what
 * counts as an address, and which one-time link an address gets. Kept apart from
 * the sender so they can be checked without a server.
 */

export const LINK_LIMITS = {
  /** One email per address per minute... */
  gapSeconds: 60,
  /** ...and five an hour, invites and sign-in links together. */
  perAddressPerHour: 5,
  /** Sign-in requests from one IP address in an hour. */
  perIpPerHour: 10,
} as const;

export const HOUR_MS = 3_600_000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** A trimmed, lowercased address, or null when it isn't one. */
export function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const email = raw.trim().toLowerCase();
  return email.length <= 254 && EMAIL_RE.test(email) ? email : null;
}

export type LimitVerdict =
  | { ok: true }
  | { ok: false; reason: 'too_soon'; retryInSeconds: number }
  | { ok: false; reason: 'hourly_limit' | 'ip_limit' };

/**
 * Pure: whether one more email may go to an address, given the times (ms) of its
 * logged sends in the last hour, and, for the sign-in form, of the caller's IP.
 */
export function decideLimit(addressTimes: number[], ipTimes: number[] | null, now: number): LimitVerdict {
  const recent = addressTimes.filter((t) => now - t < HOUR_MS);
  const newest = recent.length ? Math.max(...recent) : null;
  if (newest !== null) {
    const elapsed = Math.floor((now - newest) / 1000);
    if (elapsed < LINK_LIMITS.gapSeconds) {
      return { ok: false, reason: 'too_soon', retryInSeconds: LINK_LIMITS.gapSeconds - elapsed };
    }
  }
  if (recent.length >= LINK_LIMITS.perAddressPerHour) return { ok: false, reason: 'hourly_limit' };
  if (ipTimes && ipTimes.filter((t) => now - t < HOUR_MS).length >= LINK_LIMITS.perIpPerHour) {
    return { ok: false, reason: 'ip_limit' };
  }
  return { ok: true };
}

export type AccountState = 'none' | 'invited' | 'active';

/**
 * Pure: which one-time link an address gets. An active account signs in with a
 * magic link. An account never used, or none at all, gets an invite link, and only
 * while the address may join (an unexpired invite, or the allowlist); otherwise
 * nothing, so no account is ever attempted for a stranger.
 */
export function linkTypeFor(state: AccountState, mayJoin: boolean): 'invite' | 'magiclink' | null {
  if (state === 'active') return 'magiclink';
  return mayJoin ? 'invite' : null;
}

const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;
export const LINK_TYPES = ['invite', 'magiclink', 'signup', 'email'] as const;

/**
 * Whether a confirm link's code and type are worth sending to Supabase at all. The
 * code is Supabase's hashed token; the type is the verification_type it returned.
 */
export function isAccessLinkShape(tokenHash: unknown, type: unknown): tokenHash is string {
  return typeof tokenHash === 'string' && TOKEN_RE.test(tokenHash)
    && typeof type === 'string' && (LINK_TYPES as readonly string[]).includes(type);
}

/**
 * The address an access email's button opens: the confirm page with Supabase's
 * hashed token and its verification type. An invite's link also names the invite,
 * so the press joins that workspace (openspec: crm-multi-workspace).
 */
export function accessLinkUrl(input: {
  origin: string;
  locale: 'he' | 'en';
  hashedToken: string;
  verificationType: string;
  kind: 'invite' | 'sign_in';
  inviteId?: string | null;
}): string {
  const base = `${input.origin}/${input.locale}/auth/confirm?token_hash=${encodeURIComponent(input.hashedToken)}` +
    `&type=${encodeURIComponent(input.verificationType)}`;
  return input.kind === 'invite' && input.inviteId ? `${base}&invite=${encodeURIComponent(input.inviteId)}` : base;
}
