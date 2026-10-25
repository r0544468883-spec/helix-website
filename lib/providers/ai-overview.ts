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
}

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

async function getJson(url: string): Promise<SerpResponse | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) return null;
    return (await res.json()) as SerpResponse;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export const aiOverview: Provider = {
  id: 'google-aio',
  label: 'AI Overview (Google)',
  isConfigured() {
    return !!process.env.SERPAPI_API_KEY;
  },
  async ask(prompt: string, loc?: AskLocation): Promise<SearchAnswer | null> {
    const key = process.env.SERPAPI_API_KEY;
    if (!key) return null;

    const params = new URLSearchParams({ engine: 'google', q: prompt, api_key: key, hl: 'he' });
    // Localize exactly like a real searcher: free-form `location` + `gl` country code.
    if (loc?.country) params.set('gl', loc.country.toLowerCase());
    const locParts = [loc?.city, loc?.region, loc?.country === 'IL' ? 'Israel' : loc?.country].filter(
      (p): p is string => !!p,
    );
    if (locParts.length > 0) params.set('location', locParts.join(', '));

    const data = await getJson(`https://serpapi.com/search.json?${params.toString()}`);
    if (!data) return null;

    let aio: Aio | undefined = data.ai_overview;
    // No overview for this query/location: a valid, meaningful empty result.
    if (!aio) return { text: '', citations: [] };
    // Deferred overview: fetch the content with the page_token.
    if (!aio.text_blocks && aio.page_token) {
      const p2 = new URLSearchParams({
        engine: 'google_ai_overview',
        page_token: aio.page_token,
        api_key: key,
      });
      const d2 = await getJson(`https://serpapi.com/search.json?${p2.toString()}`);
      aio = d2?.ai_overview ?? aio;
    }

    const text = flattenBlocks(aio.text_blocks);
    const citations = (aio.references ?? [])
      .map((r) => r.link)
      .filter((l): l is string => typeof l === 'string');
    return { text, citations };
  },
};
