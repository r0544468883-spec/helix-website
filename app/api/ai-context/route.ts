// AI-context free tool backend. The questionnaire (free-tools/ai-context)
// posted to a client-side NEXT_PUBLIC_AI_RECO_ENDPOINT that was usually
// unset (→ WhatsApp fallback). This server route connects it to the shared
// HELIX AI Kit via the gateway, keeping the shared key server-side.
// Returns { text } — Hebrew, personalized AI-adoption recommendations.

import { NextResponse } from 'next/server';
import { helixAI } from '@/lib/helix-ai';
import { clientIp } from '@/lib/client-ip';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const hits = new Map<string, { at: number; count: number }>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.at > 60_000) { hits.set(ip, { at: now, count: 1 }); return false; }
  cur.count += 1;
  return cur.count > 10;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (rateLimited(ip)) return NextResponse.json({ error: 'rate_limited' }, { status: 429 });

  if (!helixAI.enabled) {
    // Gateway not configured yet — signal the client to keep its WhatsApp fallback.
    return NextResponse.json({ error: 'unconfigured' }, { status: 200 });
  }

  let answers: Record<string, unknown>;
  try { answers = await req.json(); } catch { return NextResponse.json({ error: 'invalid_json' }, { status: 400 }); }

  const res = await helixAI.llm({
    system:
      'אתה יועץ הטמעת AI לעסקים קטנים-בינוניים בישראל. קיבלת תשובות משאלון אבחון. ' +
      'החזר המלצות קונקרטיות ומותאמות אישית בעברית: 3-5 צעדים מעשיים, ' +
      'בלי מקף ארוך, טון ישיר ומקצועי. סיים בהמלצה על מוצר HELIX רלוונטי אחד.',
    messages: [{ role: 'user', content: `תשובות השאלון:\n${JSON.stringify(answers, null, 2)}` }],
    maxTokens: 900,
    temperature: 0.5,
  });

  const text = res?.text ?? '';
  // PIXEL spine: questionnaire completion is a high-intent lead signal.
  const email = typeof answers.email === 'string' ? answers.email : undefined;
  helixAI.capture({ event: 'ai_context_completed', distinctId: email || ip, product: 'site', properties: { tool: 'ai-context' } });

  return NextResponse.json({ text });
}
