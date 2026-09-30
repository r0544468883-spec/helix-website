import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * The short-lived cookie that ties Google's return to the admin's browser that
 * started it: which workspace and user asked, the random `state` Google echoes
 * back, the PKCE verifier, and when it expires. Signed with HMAC, so a return
 * that doesn't carry this browser's own cookie connects nothing.
 * openspec: crm-connect-google-and-make, design decision 3.
 */

export const OAUTH_COOKIE = 'helix_google_oauth';
export const OAUTH_TTL_MS = 10 * 60 * 1000;

export type OAuthState = {
  ws: string;
  uid: string;
  state: string;
  verifier: string;
  locale: 'he' | 'en';
  /** Epoch ms. */
  exp: number;
};

const b64 = (b: Buffer | string) => Buffer.from(b).toString('base64url');
const mac = (body: string, key: string) =>
  createHmac('sha256', `crm-oauth-state:${key}`).update(body).digest('base64url');

/** A random value for Google's `state` parameter. */
export function newState(): string {
  return randomBytes(24).toString('base64url');
}

export function signState(payload: OAuthState, key: string): string {
  const body = b64(JSON.stringify(payload));
  return `${body}.${mac(body, key)}`;
}

/** The payload when the cookie is intact, ours, and not expired; otherwise null. */
export function verifyState(cookie: string | undefined, key: string, now: number = Date.now()): OAuthState | null {
  if (!cookie || !key) return null;
  const [body, sig, extra] = cookie.split('.');
  if (!body || !sig || extra !== undefined) return null;
  const want = Buffer.from(mac(body, key));
  const got = Buffer.from(sig);
  if (want.length !== got.length || !timingSafeEqual(want, got)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as OAuthState;
    if (typeof p.exp !== 'number' || p.exp < now) return null;
    if (!p.ws || !p.uid || !p.state || !p.verifier) return null;
    return p;
  } catch {
    return null;
  }
}
