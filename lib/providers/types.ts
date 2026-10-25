// Uniform provider interface for the live AI-visibility layer.
// Every provider is optional: if its API key is not set, isConfigured() returns false
// and the orchestrator (lib/ai-visibility.ts) skips it. Nothing throws on a missing key.

export interface SearchAnswer {
  /** Full text the model returned. */
  text: string;
  /** URLs the model cited, if the provider exposes them (Perplexity). */
  citations: string[];
}

/**
 * Approximate location hint for the live web-search tools. Localizes results the
 * way a real user's device does, which is decisive for LOCAL businesses: the same
 * category question ("a recommended locksmith") returns a city's businesses to a
 * searcher in that city and generic/foreign results to a datacenter IP. Every
 * field is optional; providers apply what they support and ignore the rest.
 */
export interface AskLocation {
  /** ISO-3166-1 alpha-2, e.g. 'IL'. */
  country?: string;
  /** City / service area, free-form, e.g. 'תל אביב' or 'Tel Aviv'. */
  city?: string;
  /** Region / district, free-form. */
  region?: string;
  /** IANA timezone, e.g. 'Asia/Jerusalem'. */
  timezone?: string;
}

export interface Provider {
  id: 'perplexity' | 'claude' | 'openai' | 'gemini';
  label: string;
  isConfigured(): boolean;
  /**
   * Ask a question with live web access. Returns null on any failure.
   * `loc` localizes the web search to a place (see AskLocation); omit for a
   * location-neutral query. Providers that cannot take a location hint fall back
   * to a neutral search and rely on the prompt carrying the place.
   */
  ask(prompt: string, loc?: AskLocation): Promise<SearchAnswer | null>;
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
