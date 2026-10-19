// Lists the stored GEO reports for the internal admin dashboard (/geo-admin).
// Gated with isAdmin (header or geo_admin cookie). 404 to probes.

import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/geo-admin-auth';
import { listReports } from '@/lib/geo-report-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true, reports: await listReports() });
}
