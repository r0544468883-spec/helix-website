// Public beacon endpoint for the hosted GEO report's anonymous view analytics.
// Called a few times per view from app/r/[token]/track.tsx (view / progress / leave).
// No auth: it must accept the report reader. We hash the client IP before storing it
// (never the raw IP) and persist the event via recordEvent into Supabase Storage.

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { recordEvent, type EventType } from '@/lib/report-events';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const TYPES: readonly EventType[] = ['view', 'progress', 'leave'];

function asString(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

/** Hash the caller IP with a secret salt so we can count uniques without storing PII. */
function hashIp(req: Request): string | undefined {
  const fwd = req.headers.get('x-forwarded-for') || '';
  const ip = fwd.split(',')[0].trim() || req.headers.get('x-real-ip') || '';
  if (!ip) return undefined;
  const salt = process.env.PORTAL_SESSION_SECRET || 'geo-events';
  return crypto.createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

export async function POST(req: Request) {
  let body: {
    token?: unknown;
    type?: unknown;
    visitorId?: unknown;
    section?: unknown;
    maxScrollPct?: unknown;
    dwellMs?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Sane token: short slug/hex the way the report links are shaped.
  const token = asString(body.token);
  if (!token || token.length > 80 || !/^[a-zA-Z0-9_-]+$/.test(token)) {
    return NextResponse.json({ ok: false, error: 'bad_token' }, { status: 400 });
  }

  const type = asString(body.type) as EventType;
  if (!TYPES.includes(type)) {
    return NextResponse.json({ ok: false, error: 'bad_type' }, { status: 400 });
  }

  const visitorId = asString(body.visitorId).slice(0, 64);
  if (!visitorId) {
    return NextResponse.json({ ok: false, error: 'bad_visitor' }, { status: 400 });
  }

  const section = asString(body.section).slice(0, 40) || undefined;

  let maxScrollPct: number | undefined;
  if (typeof body.maxScrollPct === 'number' && Number.isFinite(body.maxScrollPct)) {
    maxScrollPct = Math.max(0, Math.min(100, Math.round(body.maxScrollPct)));
  }

  let dwellMs: number | undefined;
  if (typeof body.dwellMs === 'number' && Number.isFinite(body.dwellMs) && body.dwellMs >= 0) {
    // Cap at 24h so a stuck tab can't poison the average.
    dwellMs = Math.min(body.dwellMs, 86_400_000);
  }

  await recordEvent(token, {
    type,
    visitorId,
    ipHash: hashIp(req),
    section,
    maxScrollPct,
    dwellMs,
    ts: new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}
