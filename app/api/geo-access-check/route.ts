// PUBLIC, FREE developer endpoint: "can an AI crawler reach and read this page?".
// It runs ONLY the deterministic Layer-B scan (lib/geo-scan.ts): plain HTTP checks,
// NO LLM call, no API keys, $0 cost. This is the self-serve check the GitHub Action /
// CLI hit. Never add an LLM call here, it must stay free.

import { NextResponse } from 'next/server';
import { normalizeUrl, scanSite } from '@/lib/geo-scan';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// The scan signals that describe access + readability (foundation category + the
// AI-access signals from the 'ai' category). Everything else in the scan is omitted.
const ACCESS_AI_KEYS = new Set(['ai_access', 'bot_fetch', 'llms', 'indexable', 'depth']);

async function run(raw: string) {
  const norm = normalizeUrl(raw);
  if (!norm) return NextResponse.json({ ok: false, error: 'invalid_url' }, { status: 400 });

  const result = await scanSite(norm.url);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error || 'scan_failed' }, { status: 400 });
  }

  // Pull the access-relevant signals out of the scan, keeping only the public fields.
  const foundation = result.categories.find((c) => c.key === 'foundation')?.signals ?? [];
  const aiCat = result.categories.find((c) => c.key === 'ai')?.signals ?? [];
  const accessAi = aiCat.filter((s) => ACCESS_AI_KEYS.has(s.key));

  const find = (key: string) =>
    [...foundation, ...aiCat].find((s) => s.key === key) ?? null;

  const aiAccess = find('ai_access'); // robots.txt not blocking AI crawlers
  const botFetch = find('bot_fetch'); // CDN/WAF actually serves AI bots
  const ssr = find('ssr'); // real content without running JS
  const indexable = find('indexable'); // not noindex

  // Human-readable Hebrew blockers: only the things that actually block AI access.
  const blockers: string[] = [];
  if (aiAccess && aiAccess.status === 'fail') blockers.push(aiAccess.detail);
  if (botFetch && botFetch.status === 'fail') blockers.push(botFetch.detail);
  if (ssr && ssr.status === 'fail') blockers.push(ssr.detail);
  if (indexable && indexable.status === 'fail') blockers.push(indexable.detail);

  // Pass = no AI crawler is blocked (robots + CDN) AND the content actually renders.
  const pass =
    aiAccess?.status === 'pass' &&
    botFetch?.status !== 'fail' &&
    ssr?.status !== 'fail';

  const signals = [...foundation, ...accessAi].map((s) => ({
    key: s.key,
    label: s.label,
    status: s.status,
    detail: s.detail,
  }));

  return NextResponse.json({
    ok: true,
    url: result.finalUrl,
    ladder: result.ladder,
    pass,
    blockers,
    signals,
  });
}

export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get('url') || '';
  return run(url);
}

export async function POST(req: Request) {
  let body: { url?: unknown };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  return run(typeof body.url === 'string' ? body.url : '');
}
