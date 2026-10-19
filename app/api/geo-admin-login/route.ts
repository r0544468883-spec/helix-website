// Exchanges the admin access key for the geo_admin cookie, so the browser can
// then reach /geo-admin and its APIs without carrying the header each time.

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { adminToken } from '@/lib/geo-admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

// sha256 of the admin password. Comparing the hash (not the plaintext) keeps the
// password out of the repo and works independently of secret wiring. The
// GEO_ADMIN_PASSWORD env secret is still honored first when present.
const PASSWORD_SHA256 = 'c9d2b01240eacefdb2ccba945d0e0c3e6a03337b0feadaaf3aa422434e9c1424';

export async function POST(req: Request) {
  const want = adminToken();
  if (!want) return NextResponse.json({ ok: false }, { status: 401 });

  let key = '';
  try {
    const body = (await req.json()) as { key?: unknown };
    key = typeof body.key === 'string' ? body.key.trim() : '';
  } catch {
    key = '';
  }

  // Accept the human-friendly admin password (GEO_ADMIN_PASSWORD) or, as a
  // fallback, the raw derived token. On match we store the derived token in the
  // cookie, which is what isAdmin() checks.
  const password = process.env.GEO_ADMIN_PASSWORD;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const match =
    !!key &&
    ((!!password && key === password) || keyHash === PASSWORD_SHA256 || key === want);
  if (!match) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set('geo_admin', want, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    path: '/',
    maxAge: THIRTY_DAYS,
  });
  return res;
}
