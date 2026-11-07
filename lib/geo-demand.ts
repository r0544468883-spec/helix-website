import 'server-only';

// Real-demand grounding for the measured questions. Google Autocomplete returns what
// people ACTUALLY type in a category; we seed the question-generation prompt with these
// so the Share of Model measures real buyer queries rather than invented ones (the Velut
// case-study method: he grounded his content in 150 real searches, not guesses).
// Free, unofficial endpoint, no key. Best-effort: returns [] on any failure.

const SEEDS_HE = ['', ' מומלץ', ' הכי טוב', ' המלצות', ' מי'];
const SEEDS_EN = ['', ' best', ' recommended', ' top'];

async function suggest(q: string, hl: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&hl=${hl}&q=${encodeURIComponent(q)}`;
    const r = await fetch(url, {
      headers: { 'user-agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000),
    });
    if (!r.ok) return [];
    const data = JSON.parse(await r.text());
    return Array.isArray(data?.[1])
      ? (data[1].filter((s: unknown): s is string => typeof s === 'string') as string[])
      : [];
  } catch {
    return [];
  }
}

/**
 * Real searches people make around a category, deduped, capped at `limit`. Language is
 * auto-detected from the category (Hebrew chars → he, else en). Returns [] on failure so
 * the caller can fall back to pure LLM generation.
 */
export async function fetchDemandQueries(category: string, limit = 12): Promise<string[]> {
  const cat = category.trim();
  if (!cat) return [];
  const lang: 'he' | 'en' = /[֐-׿]/.test(cat) ? 'he' : 'en';
  const seeds = lang === 'he' ? SEEDS_HE : SEEDS_EN;
  const batches = await Promise.all(seeds.map((s) => suggest(`${cat}${s}`, lang)));
  const seen = new Set<string>();
  const out: string[] = [];
  for (const batch of batches) {
    for (const s of batch) {
      const key = s.trim().toLowerCase();
      if (!key || seen.has(key)) continue;
      seen.add(key);
      out.push(s.trim());
      if (out.length >= limit) return out;
    }
  }
  return out;
}
