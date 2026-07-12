// Uniform provider interface for the live AI-visibility layer.
// Every provider is optional: if its API key is not set, isConfigured() returns false
// and the orchestrator (lib/ai-visibility.ts) skips it. Nothing throws on a missing key.

export interface SearchAnswer {
  /** Full text the model returned. */
  text: string;
  /** URLs the model cited, if the provider exposes them (Perplexity). */
  citations: string[];
}

export interface Provider {
  id: 'perplexity' | 'claude' | 'openai' | 'gemini';
  label: string;
  isConfigured(): boolean;
  /** Ask a question with live web access. Returns null on any failure. */
  ask(prompt: string): Promise<SearchAnswer | null>;
}

const TIMEOUT_MS = 15000;

export async function postJson(
  url: string,
  body: unknown,
  headers: Record<string, string>,
): Promise<unknown | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(body),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
