// BYOK AI: each workspace brings its own key (Claude / GPT / Gemini) and the
// CRM's AI features run on it. Server-only — the key lives in crm_ai_settings
// (RLS with no policies: service-role reads only) and never reaches the browser;
// the UI only ever sees a masked prefix.
import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';

export type AiProvider = 'anthropic' | 'openai' | 'gemini';

export const AI_PROVIDERS: { id: AiProvider; label: string; defaultModel: string; keyHint: string }[] = [
  { id: 'anthropic', label: 'Claude (Anthropic)', defaultModel: 'claude-sonnet-5', keyHint: 'sk-ant-…' },
  { id: 'openai', label: 'GPT (OpenAI)', defaultModel: 'gpt-4o', keyHint: 'sk-…' },
  { id: 'gemini', label: 'Gemini (Google)', defaultModel: 'gemini-2.5-flash', keyHint: 'AIza…' },
];

export function defaultModelFor(provider: AiProvider): string {
  return AI_PROVIDERS.find((p) => p.id === provider)?.defaultModel ?? 'claude-sonnet-5';
}

export type AiSettings = {
  provider: AiProvider;
  api_key: string;
  model: string | null;
  enabled: boolean;
};

export function maskKey(key: string): string {
  if (key.length <= 10) return '••••••••';
  return `${key.slice(0, 8)}…${key.slice(-4)}`;
}

export async function getAiSettings(workspaceId: string): Promise<AiSettings | null> {
  const admin = createAdminClient();
  if (!admin) return null;
  const { data } = await admin
    .from('crm_ai_settings')
    .select('provider, api_key, model, enabled')
    .eq('workspace_id', workspaceId)
    .maybeSingle();
  return (data as AiSettings | null) ?? null;
}

export type AiResult = { ok: true; text: string } | { ok: false; error: string };

/** One call surface for all three providers. Hebrew-first system prompts are the
 *  caller's job; this only speaks each provider's wire format. */
export async function callAi(s: AiSettings, system: string, user: string, maxTokens = 800): Promise<AiResult> {
  const model = s.model?.trim() || defaultModelFor(s.provider);
  try {
    if (s.provider === 'anthropic') {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': s.api_key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
        signal: AbortSignal.timeout(45_000),
      });
      if (!res.ok) return { ok: false, error: `anthropic_${res.status}` };
      const j = (await res.json()) as { content?: { type: string; text?: string }[] };
      const text = (j.content ?? []).filter((b) => b.type === 'text').map((b) => b.text ?? '').join('').trim();
      return text ? { ok: true, text } : { ok: false, error: 'empty' };
    }
    if (s.provider === 'openai') {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { authorization: `Bearer ${s.api_key}`, 'content-type': 'application/json' },
        body: JSON.stringify({ model, max_tokens: maxTokens, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
        signal: AbortSignal.timeout(45_000),
      });
      if (!res.ok) return { ok: false, error: `openai_${res.status}` };
      const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = j.choices?.[0]?.message?.content?.trim() ?? '';
      return text ? { ok: true, text } : { ok: false, error: 'empty' };
    }
    // gemini
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(s.api_key)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: system }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: { maxOutputTokens: maxTokens },
        }),
        signal: AbortSignal.timeout(45_000),
      },
    );
    if (!res.ok) return { ok: false, error: `gemini_${res.status}` };
    const j = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    const text = (j.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('').trim();
    return text ? { ok: true, text } : { ok: false, error: 'empty' };
  } catch (e) {
    return { ok: false, error: e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'network' };
  }
}
