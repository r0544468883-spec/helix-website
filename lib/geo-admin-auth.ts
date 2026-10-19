import crypto from 'node:crypto';

// Shared gate for the internal GEO admin surface (/geo-admin + its APIs).
// The token is the SAME value the generate route already used (sha256 of
// "geo-som:<PORTAL_SESSION_SECRET>", first 24 hex chars). We accept it from
// EITHER the x-som-key header (programmatic) OR the geo_admin cookie (browser,
// set once by /api/geo-admin-login). Returns null when the secret is unset.

export function adminToken(): string | null {
  const s = process.env.PORTAL_SESSION_SECRET;
  if (!s) return null;
  return crypto.createHash('sha256').update(`geo-som:${s}`).digest('hex').slice(0, 24);
}

/** Read a single cookie value out of a raw Cookie header. */
function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;
    const k = part.slice(0, eq).trim();
    if (k === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

export function isAdmin(req: Request): boolean {
  const want = adminToken();
  if (!want) return false;
  const header = req.headers.get('x-som-key') || '';
  if (header === want) return true;
  const cookie = readCookie(req.headers.get('cookie'), 'geo_admin');
  return cookie === want;
}
