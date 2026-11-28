import 'server-only';

// Sub-query (fan-out) intelligence for the GEO machine. Engines decompose one buyer
// question into several real web searches; lib/share-of-model.ts now CAPTURES those real
// sub-queries at no API cost. This module turns them into the three things Instinct flagged:
//   (rec 2) sub-query COVERAGE  — run each sub-query and measure if the brand is cited.
//   (rec 4) answer-page GAP     — map sub-queries to the site's sitemap pages, flag the
//                                 sub-queries that have NO page answering them (pitch gold).
//   (rec 3) free-check EXPANSION — turn one head query into 5-8 sub-queries for the teaser.
// Costed calls (coverage, expansion) are capped and opt-in; page-gap is HTTP-only, no API.

import type { BusinessGuess } from './geo-types';
import { brandAliases, mentionsBrand } from './ai-visibility';
import { claude } from './providers/claude';
import { openai } from './providers/openai';
import { gemini } from './providers/gemini';
import type { AskLocation, Provider } from './providers/types';

// Cheapest-first for the extra passes, so a coverage run costs the least.
const ORDER: Provider[] = [gemini, openai, claude];
function pickProvider(): Provider | null {
  return ORDER.find((p) => p.isConfigured()) ?? null;
}

// ---------- rec 2: sub-query coverage ----------

export interface SubQueryCoverageItem {
  query: string;
  /** Brand cited/named in the answer to THIS specific sub-query. */
  appeared: boolean;
}
export interface SubQueryCoverage {
  /** Engine used for the coverage pass. */
  provider: string;
  items: SubQueryCoverageItem[];
  /** Sub-queries where the brand appeared. */
  covered: number;
  total: number;
  /** 0..100. The headline "sub-query coverage" number. */
  rate: number;
}

/**
 * Run each sub-query as its own live search (cheapest engine, 1 run) and check whether the
 * brand appears. This is the true sub-query-coverage measurement: a brand can win the head
 * question yet be invisible on "price", "reviews", "vs competitor". Costed: one engine call
 * per sub-query, so the caller caps the list. Best-effort, returns null when no engine.
 */
export async function measureSubQueryCoverage(
  subQueries: string[],
  business: BusinessGuess,
  host: string,
  loc?: AskLocation,
  cap = 8,
): Promise<SubQueryCoverage | null> {
  const provider = pickProvider();
  const qs = [...new Set(subQueries.map((q) => q.trim()).filter(Boolean))].slice(0, cap);
  if (!provider || qs.length === 0) return null;
  const aliases = brandAliases(business, host);
  const items = await Promise.all(
    qs.map(async (query): Promise<SubQueryCoverageItem | null> => {
      const ans = await provider.ask(query, loc).catch(() => null);
      if (!ans) return null; // call failed: don't count as "not covered"
      return { query, appeared: mentionsBrand(ans.text, ans.citations, aliases) };
    }),
  );
  const measured = items.filter((i): i is SubQueryCoverageItem => i !== null);
  if (measured.length === 0) return null;
  const covered = measured.filter((i) => i.appeared).length;
  return {
    provider: provider.id,
    items: measured,
    covered,
    total: measured.length,
    rate: Math.round((covered / measured.length) * 100),
  };
}

// ---------- rec 3: free-check expansion ----------

/**
 * Turn one head query into 5-8 realistic buyer sub-queries (price / reviews / comparison /
 * who-it-fits / location). One cheap LLM call. Used by the free teaser so it can show
 * "appears in the main question, missing in N of M sub-queries" instead of a single yes/no.
 */
export async function expandToSubQueries(
  category: string,
  location: string,
  cap = 6,
): Promise<string[]> {
  const provider = pickProvider();
  if (!provider || !category.trim()) return [];
  const loc = location.trim() || 'ישראל';
  const prompt =
    `לקוח שוקל ${category.trim()} ב${loc}. ` +
    `כתוב ${cap} חיפושים שונים וממוקדים שלקוח אמיתי מקליד בתהליך הבחירה: מחיר, ביקורות, ` +
    `השוואה למתחרה, למי זה מתאים, ומיקום/אזור. ` +
    `חיפוש אחד בכל שורה, בעברית טבעית, בלי מספור ובלי שם מותג ספציפי.`;
  const ans = await provider.ask(prompt).catch(() => null);
  if (!ans) return [];
  return ans.text
    .split('\n')
    .map((l) => l.replace(/^[\d.)\-*•\s]+/, '').replace(/["'`]/g, '').trim())
    .filter((l) => l.length >= 6 && l.length <= 160)
    .slice(0, cap);
}

// ---------- rec 4: answer-page gap (HTTP only, no API) ----------

export interface PageGapItem {
  query: string;
  /** True when a site page plausibly answers this sub-query. */
  hasPage: boolean;
  /** The best-matching page URL, when found. */
  page?: string;
}
export interface PageGap {
  /** How many sub-queries have NO answering page (the sellable gap). */
  missing: number;
  total: number;
  items: PageGapItem[];
}

const STOP = new Set([
  'של','עם','על','את','מה','מי','איך','הכי','יותר','בין','או','גם','הוא','היא','זה','לא',
  'the','a','an','of','to','for','and','or','is','in','on','best','top','vs','how','what','which','who',
]);
function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .map((w) => w.trim())
      .filter((w) => w.length >= 2 && !STOP.has(w)),
  );
}

/** Fetch the site's sitemap(s) and return page URLs + their <title>/<h1> text for matching.
 *  Bounded: at most `maxPages` URLs, and titles fetched for at most `maxTitles` of them. All
 *  best-effort with short timeouts, so a slow/absent sitemap never stalls the report. */
export async function fetchSitemapPages(
  host: string,
  maxPages = 60,
  maxTitles = 18,
): Promise<Array<{ url: string; text: string }>> {
  const base = `https://${host.replace(/^www\./, '')}`;
  const grab = async (u: string): Promise<string> => {
    try {
      const r = await fetch(u, { signal: AbortSignal.timeout(6000), headers: { 'user-agent': 'Mozilla/5.0' } });
      return r.ok ? await r.text() : '';
    } catch {
      return '';
    }
  };
  const locs = (xml: string): string[] =>
    [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim()).filter(Boolean);
  let xml = await grab(`${base}/sitemap.xml`);
  if (!xml) xml = await grab(`${base}/sitemap_index.xml`);
  if (!xml) return [];
  let urls = locs(xml);
  // Sitemap index: entries point to child sitemaps (also .xml). Expand the first few.
  const childSitemaps = urls.filter((u) => /\.xml(\?|$)/i.test(u)).slice(0, 3);
  if (childSitemaps.length > 0 && urls.every((u) => /\.xml(\?|$)/i.test(u))) {
    const kids = await Promise.all(childSitemaps.map((u) => grab(u)));
    urls = kids.flatMap((k) => locs(k));
  }
  urls = [...new Set(urls.filter((u) => !/\.xml(\?|$)/i.test(u)))].slice(0, maxPages);
  // Fetch titles for a bounded subset so Hebrew queries match Hebrew titles (URL slugs are
  // often English/transliterated and would never match Hebrew sub-queries).
  const titled = await Promise.all(
    urls.slice(0, maxTitles).map(async (url) => {
      const html = await grab(url);
      const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? '';
      const h1 = /<h1[^>]*>([\s\S]*?)<\/h1>/i.exec(html)?.[1]?.replace(/<[^>]+>/g, '') ?? '';
      return { url, text: `${url} ${title} ${h1}` };
    }),
  );
  // The rest contribute their URL slug only (still catches English-slug matches).
  const rest = urls.slice(maxTitles).map((url) => ({ url, text: url }));
  return [...titled, ...rest];
}

/** Match each sub-query to the best site page by token overlap; flag those with none. */
export function mapSubQueriesToPages(
  subQueries: string[],
  pages: Array<{ url: string; text: string }>,
  cap = 20,
): PageGap {
  const qs = [...new Set(subQueries.map((q) => q.trim()).filter(Boolean))].slice(0, cap);
  const pageTok = pages.map((p) => ({ url: p.url, tok: tokens(p.text) }));
  const items: PageGapItem[] = qs.map((query) => {
    const qt = [...tokens(query)];
    if (qt.length === 0) return { query, hasPage: false };
    let best: { url: string; score: number } | null = null;
    for (const p of pageTok) {
      const hits = qt.filter((t) => p.tok.has(t)).length;
      const score = hits / qt.length;
      if (!best || score > best.score) best = { url: p.url, score };
    }
    // A page "answers" a sub-query when it shares a meaningful share of the query's terms.
    const hasPage = !!best && best.score >= 0.5;
    return hasPage ? { query, hasPage, page: best!.url } : { query, hasPage: false };
  });
  return { missing: items.filter((i) => !i.hasPage).length, total: items.length, items };
}
