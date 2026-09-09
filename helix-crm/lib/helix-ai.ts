// ============================================================
// HELIX AI — client for the shared AI Gateway (lives in PLUG's Supabase
// edge functions: _shared/ai-kit + ai-gateway/ai-stream). Lets this app
// use the whole HELIX AI Kit over fetch without copying the kit here.
//
// Guarded by design: if HELIX_AI_GATEWAY_URL / HELIX_GATEWAY_KEY are not
// set, every method is a safe no-op (returns null / swallows) so wiring
// it into existing routes NEVER breaks them. Turn it on by setting env.
//
// Env: HELIX_AI_GATEWAY_URL, HELIX_GATEWAY_KEY
// ============================================================

const BASE = (process.env.HELIX_AI_GATEWAY_URL ?? '').replace(/\/$/, '');
const KEY = process.env.HELIX_GATEWAY_KEY ?? '';
export const helixAIEnabled = Boolean(BASE && KEY);

async function call<T = unknown>(action: string, payload: Record<string, unknown>): Promise<T | null> {
  if (!helixAIEnabled) return null;
  try {
    const res = await fetch(`${BASE}/ai-gateway`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-helix-key': KEY },
      body: JSON.stringify({ action, ...payload }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) {
      console.warn(`helix-ai [${action}]:`, data.error ?? res.status);
      return null;
    }
    return data as T;
  } catch (e) {
    console.warn(`helix-ai [${action}] failed:`, (e as Error).message);
    return null;
  }
}

export const helixAI = {
  enabled: helixAIEnabled,
  llm: (request: Record<string, unknown>) =>
    call<{ text: string; costUsd: number }>('llm', { request }),
  structured: <T = unknown>(request: Record<string, unknown>, schema: unknown, maxAttempts?: number) =>
    call<{ data: T; attempts: number }>('structured', { request, schema, maxAttempts }),
  embed: (texts: string[]) => call<{ vectors: number[][] }>('embed', { texts }),
  index: (doc: Record<string, unknown>, options?: Record<string, unknown>) =>
    call<{ chunks: number }>('index', { doc, options }),
  search: (namespace: string, query: string, options?: Record<string, unknown>) =>
    call<{ matches: Array<{ content: string; score: number; metadata: Record<string, unknown> }> }>('search', { namespace, query, options }),
  searchHybrid: (namespace: string, query: string, options?: Record<string, unknown>) =>
    call<{ matches: Array<{ content: string; score: number; metadata: Record<string, unknown> }> }>('searchHybrid', { namespace, query, options }),
  toMarkdown: (input: Record<string, unknown>) =>
    call<{ markdown: string; via: string }>('toMarkdown', { input }),
  remember: (text: string, scope: Record<string, unknown>, options?: Record<string, unknown>) =>
    call<{ added: unknown[]; skipped: number }>('remember', { text, scope, options }),
  recall: (query: string, scope: Record<string, unknown>) =>
    call<{ memories: Array<{ type: string; content: string }> }>('recall', { query, scope }),
  guard: (text: string, guards: Record<string, unknown>) =>
    call<{ ok: boolean; tripwire?: string; sanitized?: string }>('guard', { text, guards }),
  groupChat: (options: Record<string, unknown>) =>
    call<{ final: string; transcript: unknown[] }>('groupChat', { options }),
  /** fire-and-forget PIXEL event; never throws, never blocks the caller */
  capture: (event: Record<string, unknown>) => { void call('capture', { event }); },
  notify: (input: Record<string, unknown>) => call<{ via: string }>('notify', { input }),
};

export type HelixAI = typeof helixAI;
