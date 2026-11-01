// Google AI Overviews via a SERP API (SerpAPI). This is the AEO surface: Google's
// AI-written answer box at the top of search. The model APIs cannot see it because
// it is a Google Search product, not a model endpoint, so we read it by running a
// real Google search from the target location and extracting the overview text plus
// the sources it cites. Auto-enables once SERPAPI_API_KEY is set, like Perplexity.
//
// WATCH: SerpAPI sometimes returns the overview inline (text_blocks) and sometimes
// only a page_token that must be fetched from the google_ai_overview engine. Both
// paths are handled. A query with no overview returns an empty (not failed) answer:
// that is a real signal (no AI-Overview presence here), not an error.
import { type AskLocation, type Provider, type SearchAnswer } from './types';

const TIMEOUT_MS = 20000;

interface AioBlock {
  type?: string;
  snippet?: string;
  list?: Array<{ snippet?: string }>;
}
interface Aio {
  text_blocks?: AioBlock[];
  references?: Array<{ link?: string }>;
  page_token?: string;
}
interface SerpResponse {
  ai_overview?: Aio;
  error?: string;
}

/**
 * All configured SerpAPI keys, in priority order. SerpAPI resets each account's free
 * credits monthly (on the signup-date anniversary), so holding several keys from
 * different emails means at any given moment at least one usually has credits left.
 * Reads a comma/space/newline-separated SERPAPI_API_KEY plus numbered
 * SERPAPI_API_KEY_2 … _9. Put the key with credits first; dead keys are skipped.
 */
function serpKeys(): string[] {
  const out: string[] = [];
  const push = (v?: string) => {
    if (!v) return;
    for (const part of v.split(/[\s,]+/)) {
      const t = part.trim();
      if (t && !out.includes(t)) out.push(t);
    }
  };
  push(process.env.SERPAPI_API_KEY);
  for (let i = 2; i <= 9; i += 1) push(process.env[`SERPAPI_API_KEY_${i}`]);
  return out;
}

// getJson outcome. keyDead=true means this key is out of credits or invalid, so the
// caller should fall through to the next key; keyDead=false is a transient failure
// (timeout / 5xx / no results) that should NOT burn the remaining keys.
type GetResult = { ok: true; data: SerpResponse } | { ok: false; keyDead: boolean };

/** Join an overview's paragraph/list blocks into plain text. */
function flattenBlocks(blocks: AioBlock[] | undefined): string {
  if (!Array.isArray(blocks)) return '';
  const out: string[] = [];
  for (const b of blocks) {
    if (b.snippet) out.push(b.snippet);
    for (const li of b.list ?? []) if (li.snippet) out.push(li.snippet);
  }
  return out.join('\n').trim();
}

async function getJson(url: string): Promise<GetResult> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    // 401 = bad key, 429 = out of searches / rate limited → this key is dead.
    if (res.status === 401 || res.status === 429) return { ok: false, keyDead: true };
    if (!res.ok) return { ok: false, keyDead: false };
    const data = (await res.json()) as SerpResponse;
    // SerpAPI also reports credential/quota problems as an `error` string on a 200 body.
    if (typeof data.error === 'string' && data.error) {
      const e = data.error.toLowerCase();
      const dead =
        e.includes('run out') ||
        e.includes('ran out') ||
        e.includes('out of searches') ||
        e.includes('api key') ||
        e.includes('unauthorized') ||
        e.includes('plan') ||
        e.includes('exceeded');
      return { ok: false, keyDead: dead };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, keyDead: false };
  } finally {
    clearTimeout(timer);
  }
}

export const aiOverview: Provider = {
  id: 'google-aio',
  label: 'AI Overview (Google)',
  isConfigured() {
    return serpKeys().length > 0;
  },
  async ask(prompt: string, loc?: AskLocation): Promise<SearchAnswer | null> {
    const keys = serpKeys();
    if (keys.length === 0) return null;

    const searchParams = (key: string) => {
      const params = new URLSearchParams({ engine: 'google', q: prompt, api_key: key, hl: 'he' });
      // Localize exactly like a real searcher: free-form `location` + `gl` country code.
      if (loc?.country) params.set('gl', loc.country.toLowerCase());
      const locParts = [loc?.city, loc?.region, loc?.country === 'IL' ? 'Israel' : loc?.country].filter(
        (p): p is string => !!p,
      );
      if (locParts.length > 0) params.set('location', locParts.join(', '));
      return params;
    };

    // Try each key in order. A key that is out of credits / invalid (keyDead) is
    // skipped for the next one; a transient failure or a genuine "no overview" ends
    // the attempt (returns null = not-measured), so we never burn spare keys on a
    // query Google simply didn't answer.
    for (const key of keys) {
      const r = await getJson(`https://serpapi.com/search.json?${searchParams(key).toString()}`);
      if (!r.ok) {
        if (r.keyDead) continue; // this key is exhausted/invalid → try the next one
        return null; // transient (timeout / 5xx) → treat as not-measured
      }

      let aio: Aio | undefined = r.data.ai_overview;
      // No overview for this query/location. Return null (not an empty answer) so the
      // measurement treats it as "not measured" rather than "measured, brand absent" —
      // Google often renders no AI Overview for Hebrew/niche queries, and counting that
      // as a measured 0 would drag the overall score and presence down for every brand.
      if (!aio) return null;
      // Deferred overview: fetch the content with the page_token (same working key).
      if (!aio.text_blocks && aio.page_token) {
        const p2 = new URLSearchParams({
          engine: 'google_ai_overview',
          page_token: aio.page_token,
          api_key: key,
        });
        const r2 = await getJson(`https://serpapi.com/search.json?${p2.toString()}`);
        if (r2.ok) aio = r2.data.ai_overview ?? aio;
      }

      const text = flattenBlocks(aio.text_blocks);
      const citations = (aio.references ?? [])
        .map((rf) => rf.link)
        .filter((l): l is string => typeof l === 'string');
      // Overview present but we extracted nothing usable: treat as not-measured, not
      // as a measured empty answer.
      if (!text && citations.length === 0) return null;
      return { text, citations };
    }

    // Every configured key was exhausted/invalid.
    return null;
  },
};
