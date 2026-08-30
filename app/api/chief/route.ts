// POST /api/chief — HELIX CHIEF endpoint. Takes a natural-language message,
// runs the orchestrator over the workspace's entitled agents, returns the
// reply + the action trace (done / pending_approval / suggested) for the UI.

import { NextResponse } from 'next/server';
import { buildChiefContext } from '@/lib/chief/context';
import { runChief } from '@/lib/chief/orchestrator';
import { helixAI } from '@/lib/helix-ai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function POST(req: Request) {
  let body: { message?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const message = String(body.message || '').trim();
  if (!message) return NextResponse.json({ error: 'message_required' }, { status: 422 });
  const locale = typeof body.locale === 'string' ? body.locale : 'he';

  const built = await buildChiefContext(locale);
  if (!built.ok) {
    const status = built.error === 'unauthorized' ? 401 : 400;
    return NextResponse.json({ error: built.error }, { status });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'chief_not_configured' }, { status: 503 });
  }

  try {
    const run = await runChief(message, built.ctx);

    // Distil durable memories from the exchange into the shared store
    // (mem0 pattern) so CHIEF gets long-term, cross-product recall.
    // Guarded + non-blocking: no-op if the gateway env isn't set.
    const workspaceId = (built.ctx as { workspaceId?: string } | undefined)?.workspaceId;
    void helixAI.remember(
      `User asked CHIEF: ${message}`,
      { namespace: 'crm_chief', workspaceId },
    );

    return NextResponse.json(run);
  } catch (e) {
    const error = e instanceof Error ? e.message : 'chief_failed';
    return NextResponse.json({ error }, { status: 500 });
  }
}
