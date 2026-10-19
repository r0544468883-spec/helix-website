// Exchanges the admin access key for the geo_admin cookie, so the browser can
// then reach /geo-admin and its APIs without carrying the header each time.

import { NextResponse } from 'next/server';
import { adminToken } from '@/lib/geo-admin-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const THIRTY_DAYS = 60 * 60 * 24 * 30;

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
  const match = !!key && ((!!password && key === password) || key === want);
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
