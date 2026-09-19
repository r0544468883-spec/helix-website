// POST /api/chief — HELIX CHIEF endpoint. Takes a natural-language message,
// runs the orchestrator over the workspace's entitled agents, returns the
// reply + the action trace (done / pending_approval / suggested) for the UI.

import { NextResponse } from 'next/server';
import { buildChiefContext } from '@/lib/chief/context';
import { runChief } from '@/lib/chief/orchestrator';
import { helixAI } from '@/lib/helix-ai';
import { rateLimit } from '@/lib/crm-api';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_MESSAGE = 8000;
const CHIEF_PER_MINUTE = 10;

export async function POST(req: Request) {
  let body: { message?: unknown; locale?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const message = String(body.message || '').trim();
  if (!message) return NextResponse.json({ error: 'message_required' }, { status: 422 });
  // כל בקשה מריצה עד 6 קריאות רצופות ל-Opus עם max_tokens 16000, על המפתח
  // של בעל המערכת. אורך ההודעה חייב להיות חסום.
  if (message.length > MAX_MESSAGE) {
    return NextResponse.json({ error: 'message_too_long' }, { status: 413 });
  }
  const locale = typeof body.locale === 'string' ? body.locale : 'he';

  const built = await buildChiefContext(locale);
  if (!built.ok) {
    const status = built.error === 'unauthorized' ? 401 : 400;
    return NextResponse.json({ error: built.error }, { status });
  }

  // מכסה לכל workspace. rateLimit כבר מוחל על כל /api/v1/crm/* — כאן הוא פשוט
  // היה חסר, בזמן שזה הנתיב היחיד שמוציא כסף אמיתי.
  const wsId = (built.ctx as { workspaceId?: string } | undefined)?.workspaceId ?? 'unknown';
  if (!rateLimit(`chief:${wsId}`, CHIEF_PER_MINUTE, 60_000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
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
    // לא מחזירים e.message ללקוח — הוא נושא פרטי פנים (שמות מודלים, שגיאות
    // ספק, לפעמים מקטעי prompt).
    console.error('[api/chief]', e);
    return NextResponse.json({ error: 'chief_failed' }, { status: 500 });
  }
}
