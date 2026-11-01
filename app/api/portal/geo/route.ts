// Seamless deep-link from a client's /portal into their GEO report. The client is
// already authenticated in the portal (portal_session cookie), so we set the report's
// own session cookie (same HMAC scheme / secret) and redirect them straight into
// /r/<token> — no need to type the report access code again.

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession, signSession } from '@/lib/portal';
import { loadPortalGeoToken } from '@/lib/geo-report-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  // Behind Firebase App Hosting (Cloud Run) req.url carries the internal
  // 0.0.0.0:8080 host, not the public domain — derive origin from the proxy
  // headers so the redirect lands on helix.co.il, not the container address.
  const fwdHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const fwdProto = req.headers.get('x-forwarded-proto') || 'https';
  const origin = fwdHost ? `${fwdProto}://${fwdHost}` : new URL(req.url).origin;
  const slug = verifySession((await cookies()).get('portal_session')?.value);
  // Not logged into the portal → send to the portal login.
  if (!slug) return NextResponse.redirect(`${origin}/portal`, { status: 302 });

  const token = await loadPortalGeoToken(slug);
  if (!token) return NextResponse.redirect(`${origin}/portal`, { status: 302 });

  // Grant the report session (same signSession scheme the report gate verifies), then
  // redirect into the report.
  const res = NextResponse.redirect(`${origin}/r/${token}`, { status: 302 });
  res.cookies.set(`grpt_${token}`, signSession(token), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
