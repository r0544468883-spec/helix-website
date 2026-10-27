// Verifies a client access code for a gated GEO report and, on success, sets a signed
// per-report session cookie so the hosted page (/r/<token>) renders the report.
// Reuses the portal's HMAC session helper. 404 on bad code (invisible to probes).

import { NextResponse } from 'next/server';
import { loadReport } from '@/lib/geo-report-store';
import { signSession } from '@/lib/portal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  let body: { token?: unknown; code?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  const token = typeof body.token === 'string' ? body.token : '';
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!token || !code) return NextResponse.json({ ok: false }, { status: 400 });

  const report = await loadReport(token);
  const expected = (report?.accessCode || '').trim().toUpperCase();
  // Constant-ish: a missing report or empty code never matches.
  if (!expected || code !== expected) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(`grpt_${token}`, signSession(token), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
  return res;
}
