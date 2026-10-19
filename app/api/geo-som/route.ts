// Internal validation endpoint for the Share of Model engine (phase 1).
// Token-gated (fans out to many LLM calls, so never public). Returns the raw
// computeShareOfModel result for a given business so we can validate the engine
// on real domains before wiring it into the gated report / hosted page.
// Not linked anywhere. Guard token is derived from PORTAL_SESSION_SECRET so no
// new secret is needed.

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { normalizeUrl } from '@/lib/geo-scan';
import { computeShareOfModel } from '@/lib/share-of-model';
import type { BusinessGuess } from '@/lib/geo-types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function expectedToken(): string | null {
  const s = process.env.PORTAL_SESSION_SECRET;
  if (!s) return null;
  return crypto.createHash('sha256').update(`geo-som:${s}`).digest('hex').slice(0, 24);
}

export async function POST(req: Request) {
  const want = expectedToken();
  const got = req.headers.get('x-som-key') || '';
  // 404 (not 401) so the route is invisible to probes.
  if (!want || got !== want) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  let body: {
    url?: unknown;
    name?: unknown;
    category?: unknown;
    location?: unknown;
    competitors?: unknown;
    questions?: unknown;
    runs?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const norm = normalizeUrl(typeof body.url === 'string' ? body.url : '');
  if (!norm) return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 });

  const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : undefined);
  const business: BusinessGuess = {
    name: str(body.name) ?? norm.host.replace(/^www\./, '').split('.')[0],
    category: str(body.category),
    location: str(body.location) ?? 'IL',
  };
  const competitorsSeed = Array.isArray(body.competitors)
    ? body.competitors.filter((c): c is string => typeof c === 'string')
    : undefined;
  const questions = typeof body.questions === 'number' ? body.questions : undefined;
  const runs = typeof body.runs === 'number' ? body.runs : undefined;

  const result = await computeShareOfModel(business, norm.host, {
    competitorsSeed,
    questions,
    runs,
  });
  return NextResponse.json({ ok: true, host: norm.host, business, result });
}
