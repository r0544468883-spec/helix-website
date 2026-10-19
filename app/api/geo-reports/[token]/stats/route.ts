// Per-report anonymous view statistics for the internal admin dashboard.
// Gated with isAdmin (header or geo_admin cookie). 404 to probes.

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/geo-admin-auth';
import { reportStats } from '@/lib/report-events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  const { token } = await params;
  return NextResponse.json({ ok: true, stats: await reportStats(token) });
}
