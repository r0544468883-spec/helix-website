// PUBLIC but API-KEY gated developer endpoint: runs a FULL GEO report (the same work
// as /api/geo-generate, which fans out to many LLM calls), so it is never free. The
// caller authenticates with a key minted in /geo-admin (Authorization: Bearer <key>,
// or x-api-key). Each key carries a per-run dollar cap; a run whose HIGH estimate
// exceeds the cap is refused (402) before a cent is spent.

import { NextResponse } from 'next/server';
import crypto from 'node:crypto'; // used for randomBytes token generation
import { normalizeUrl } from '@/lib/geo-scan';
import { buildGeoReport } from '@/lib/geo-report-build';
import { saveReport } from '@/lib/geo-report-store';
import { validateApiKey, touchApiKey } from '@/lib/geo-api-keys';
import { listConfiguredEngineIds } from '@/lib/share-of-model';
import { estimateShareOfModelCost } from '@/lib/geo-cost';

// Mirrors computeShareOfModel's defaults so the pre-flight estimate matches the run.
const EST_QUESTIONS = 8;
const EST_RUNS = 3;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Pull the key out of Authorization: Bearer <key>, falling back to x-api-key. */
function readKey(req: Request): string {
  const auth = req.headers.get('authorization') || '';
  const m = /^Bearer\s+(.+)$/i.exec(auth.trim());
  if (m) return m[1].trim();
  return (req.headers.get('x-api-key') || '').trim();
}

export async function POST(req: Request) {
  const presented = readKey(req);
  const keyInfo = presented ? await validateApiKey(presented) : null;
  if (!keyInfo) {
    return NextResponse.json({ error: 'invalid_api_key' }, { status: 401 });
  }

  let body: { url?: unknown; category?: unknown; competitors?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const norm = normalizeUrl(typeof body.url === 'string' ? body.url : '');
  if (!norm) return NextResponse.json({ error: 'invalid_url' }, { status: 400 });

  // Pre-flight cost estimate, then enforce the key's per-run cap on the HIGH band.
  const estimate = estimateShareOfModelCost({
    engineIds: listConfiguredEngineIds(),
    questionCount: EST_QUESTIONS,
    runs: EST_RUNS,
  });
  if (estimate.highUsd > keyInfo.maxUsdPerRun) {
    return NextResponse.json(
      { error: 'cost_cap_exceeded', estimate, maxUsd: keyInfo.maxUsdPerRun },
      { status: 402 },
    );
  }

  const category =
    typeof body.category === 'string' && body.category.trim() ? body.category.trim() : undefined;
  const competitors = Array.isArray(body.competitors)
    ? body.competitors.filter((c): c is string => typeof c === 'string')
    : undefined;

  // Same readable + unguessable token scheme as /api/geo-generate: domain label + hex suffix.
  const slug =
    norm.host.replace(/^www\./, '').split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24) ||
    'report';
  const token = `${slug}-${crypto.randomBytes(3).toString('hex')}`;

  try {
    const report = await buildGeoReport(norm.url, { token, category, competitors });
    await saveReport(token, report);
    // Best-effort usage stamp, never blocks the response.
    await touchApiKey(presented);
    const reportUrl = `/r/${token}`;
    return NextResponse.json({
      ok: true,
      token,
      url: `https://helix.co.il${reportUrl}`,
      reportUrl,
      estimate,
      report,
    });
  } catch (err) {
    console.error('v1/audit failed', err);
    return NextResponse.json({ error: 'audit_failed' }, { status: 500 });
  }
}
