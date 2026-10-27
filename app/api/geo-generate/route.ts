// Generates a full GEO report and stores it for the hosted page (/r/<token>).
// Token-gated with the SAME scheme as /api/geo-som (fans out to many LLM calls,
// so it is never public). Guard token is derived from PORTAL_SESSION_SECRET.

import { NextResponse } from 'next/server';
import crypto from 'node:crypto'; // used for randomBytes token generation
import { normalizeUrl } from '@/lib/geo-scan';
import { buildGeoReport } from '@/lib/geo-report-build';
import { saveReport } from '@/lib/geo-report-store';
import { isAdmin } from '@/lib/geo-admin-auth';
import { listConfiguredEngineIds } from '@/lib/share-of-model';
import { estimateShareOfModelCost } from '@/lib/geo-cost';
import { asBusinessType } from '@/lib/geo-types';

// Mirrors computeShareOfModel's defaults so the pre-flight estimate matches the run.
const EST_QUESTIONS = 8;
const EST_RUNS = 3;

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  // Accepts the x-som-key header OR the geo_admin cookie (via isAdmin).
  // 404 (not 401) so the route is invisible to probes.
  if (!isAdmin(req)) {
    return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 });
  }

  let body: {
    url?: unknown;
    category?: unknown;
    businessType?: unknown;
    people?: unknown;
    locations?: unknown;
    country?: unknown;
    competitors?: unknown;
    dryRun?: unknown;
    maxUsd?: unknown;
    draftPassages?: unknown;
    fresh?: unknown;
  };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  const norm = normalizeUrl(typeof body.url === 'string' ? body.url : '');
  if (!norm) return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 });

  // Opt-in, paid answer-passage drafting. When on, the pre-flight estimate accounts
  // for up to 5 extra cheapest-engine calls so the dry-run and cap reflect it.
  const draftPassages = body.draftPassages === true;

  // Pre-flight cost estimate (adopted from Saylent). Always computed; drives both the
  // dry-run preview and the hard cap, and is echoed back on a real run.
  const estimate = estimateShareOfModelCost({
    engineIds: listConfiguredEngineIds(),
    questionCount: EST_QUESTIONS,
    runs: EST_RUNS,
    draftPassages: draftPassages ? Math.min(5, EST_QUESTIONS) : 0,
  });

  // dry-run: return the plan + estimate and spend NOTHING.
  if (body.dryRun === true) {
    return NextResponse.json({ ok: true, dryRun: true, estimate });
  }

  // Hard cap: refuse to run if the HIGH estimate exceeds the caller's ceiling.
  const maxUsd = typeof body.maxUsd === 'number' && body.maxUsd > 0 ? body.maxUsd : null;
  if (maxUsd !== null && estimate.highUsd > maxUsd) {
    return NextResponse.json(
      { ok: false, error: 'cost_cap_exceeded', estimate, maxUsd },
      { status: 402 },
    );
  }

  const category =
    typeof body.category === 'string' && body.category.trim() ? body.category.trim() : undefined;
  const businessType = asBusinessType(body.businessType);
  const people = (
    Array.isArray(body.people)
      ? body.people.filter((p): p is string => typeof p === 'string')
      : typeof body.people === 'string'
        ? body.people.split(',')
        : []
  )
    .map((p) => p.trim())
    .filter(Boolean);
  // Cities accepted either as an array or as a comma-separated string. All optional.
  const locations = (
    Array.isArray(body.locations)
      ? body.locations.filter((c): c is string => typeof c === 'string')
      : typeof body.locations === 'string'
        ? body.locations.split(',')
        : []
  )
    .map((c) => c.trim())
    .filter(Boolean);
  const country =
    typeof body.country === 'string' && body.country.trim() ? body.country.trim() : undefined;
  const competitors = Array.isArray(body.competitors)
    ? body.competitors.filter((c): c is string => typeof c === 'string')
    : undefined;

  // Readable + unguessable: the company's domain label + a short hex suffix,
  // e.g. "reddgrow-a1b2c3". The slug is alphanumeric and the suffix is hex, so the
  // token never starts or ends with '-'/'_' (those get dropped when a link is copied).
  const slug =
    norm.host.replace(/^www\./, '').split('.')[0].toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24) ||
    'report';
  const token = `${slug}-${crypto.randomBytes(3).toString('hex')}`;

  try {
    const report = await buildGeoReport(norm.url, {
      token,
      category,
      businessType,
      people,
      locations,
      country,
      competitors,
      draftPassages,
      fresh: body.fresh === true,
    });
    await saveReport(token, report);
    return NextResponse.json({
      ok: true,
      token,
      url: `/r/${token}`,
      estimate,
      sessionStatus: report.sessionStatus,
    });
  } catch (err) {
    console.error('geo-generate failed', err);
    return NextResponse.json({ ok: false, error: 'generate_failed' }, { status: 500 });
  }
}
