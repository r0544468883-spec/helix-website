// Share of Model: a real, multi-question measurement of how often the AI engines
// name/recommend THIS business when a buyer asks a category-level question, and
// what share of all brand mentions the business captures.
//
// This is the GATED full-report measurement. It is deliberately separate from the
// free teaser (quickProbe in lib/ai-visibility.ts) and must never touch that path.
// Every engine is optional: with no keys set, `available` is false.

import type { BusinessGuess } from './geo-types';
import { claude } from './providers/claude';
import { openai } from './providers/openai';
import { gemini } from './providers/gemini';
import { perplexity } from './providers/perplexity';
import { aiOverview } from './providers/ai-overview';
import type { AskLocation, Provider } from './providers/types';
import { brandAliases, mentionsBrand, extractCompetitors, REFUSAL_RE } from './ai-visibility';

// The engines we can query. Each is optional: with no key set, isConfigured() is
// false and it is skipped. Perplexity activates automatically once a key is added.
// Order matters only for display.
const ENGINES: Provider[] = [claude, openai, gemini, perplexity, aiOverview];

// Cheapest-first order for the ONE question-generation call. Mirrors the free
// probe: Gemini Flash is cheapest with a real free tier, Claude and OpenAI back it up.
const CHEAPEST_ORDER: Provider[] = [gemini, claude, openai];

// Cost guards: never exceed these regardless of what opts asks for.
const MAX_QUESTIONS = 12;
const MAX_RUNS = 3;
const DEFAULT_QUESTIONS = 8;
const DEFAULT_RUNS = 3;

// Engines that only need ONE run per question. A SERP-backed engine (Google AI
// Overview) returns a stable result that barely varies between identical searches,
// so repeating it 3× just burns paid SERP quota for no extra signal. Generative
// chat engines stay multi-run because their answers genuinely vary.
const SINGLE_RUN_ENGINE_IDS = new Set<Provider['id']>(['google-aio']);

/** Overall tone toward the brand across the runs where it appeared. */
export type BrandSentiment = 'positive' | 'neutral' | 'negative' | 'mixed' | 'none';

export interface ShareOfModelEngine {
  id: string;
  label: string;
  /** Total successful runs for this engine across all questions. 0 means the engine
   *  never returned anything (e.g. out of credit / rate-limited), so a 0% share here
   *  is "not measured", NOT "invisible". The report renders such an engine as "לא נבדק". */
  measuredRuns: number;
  /** 0..1 share of questions where the brand appeared in a majority of runs. */
  appearanceRate: number;
  /** 0..1 share of questions where the brand landed in the top 3 in a majority of runs. */
  recommendationRate: number;
  /** Average 1-based position across all appearances (null if never positioned). */
  avgPosition: number | null;
  /** 0..100 share of this engine's total brand mentions captured by the brand. */
  shareOfModel: number;
  /** Tone toward the brand across the collected answers. 'none' when it never appeared. */
  sentiment: BrandSentiment;
  /**
   * Hallucination check against real site facts. checked=false when no facts were
   * supplied. correct=null when the engine does not recognize the brand (nothing to
   * verify). issues lists the invented/unsupported claims found.
   */
  accuracy: { checked: boolean; correct: boolean | null; issues: string[] };
  perQuestion: Array<{
    question: string;
    appeared: boolean;
    position: number | null;
    topBrands: string[];
    /** Cited source domains this engine used to answer this question. */
    sources: string[];
  }>;
}

export interface ShareOfModelResult {
  /** False when no engine is configured. */
  available: boolean;
  /** The exact questions asked, for transparency in the report. */
  questions: string[];
  runsPerQuestion: number;
  engines: ShareOfModelEngine[];
  /** Competitor name -> number of question-runs it appeared in, across all engines. Top 10. */
  competitorStandings: Array<{ name: string; count: number }>;
  /**
   * Domains the engines actually cited while answering, aggregated across all
   * (question, engine, run) triples. Brand's own host and social/aggregator junk
   * are excluded. Top 15 by citation count.
   */
  citedSources: Array<{ domain: string; count: number; engines: string[] }>;
  /** 0..100, averaged across engines. */
  overallShareOfModel: number;
  /**
   * Presence as a confidence BAND, not a fake-precise point. Adopted from Saylent:
   * "a confidence band, never a single fake-precise number." Computed as a Wilson
   * score interval over all successful (question, engine, run) trials where the
   * brand appeared. `label` is the Hebrew bucket for the point rate.
   */
  presence: {
    /** Raw brand appearances across all successful trials. */
    appearances: number;
    /** Total successful trials (question × engine × run that returned an answer). */
    trials: number;
    /** 0..100 lower / upper bound of the 95% interval. */
    rateLow: number;
    rateHigh: number;
    label: string;
  };
}

/** Hebrew bucket for a 0..1 appearance rate. */
function presenceLabel(rate: number, trials: number): string {
  if (trials === 0) return 'לא נמדד';
  if (rate <= 0) return 'לא נראה';
  if (rate < 0.15) return 'נוכחות נמוכה';
  if (rate < 0.4) return 'נוכחות חלקית';
  if (rate < 0.7) return 'נוכחות טובה';
  return 'נוכחות חזקה';
}

/** 95% Wilson score interval for k successes out of n trials, returned as 0..100. */
function wilsonInterval(k: number, n: number): { low: number; high: number } {
  if (n <= 0) return { low: 0, high: 0 };
  const z = 1.96;
  const p = k / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const center = (p + z2 / (2 * n)) / denom;
  const margin = (z / denom) * Math.sqrt((p * (1 - p)) / n + z2 / (4 * n * n));
  const low = Math.max(0, center - margin);
  const high = Math.min(1, center + margin);
  return { low: Math.round(low * 1000) / 10, high: Math.round(high * 1000) / 10 };
}

function bareHostOf(host: string): string {
  return host.replace(/^www\./, '');
}

/**
 * Approximate search location for the live engines, derived from the business. This
 * is what makes the measurement meaningful for a LOCAL business: without it the
 * engines' web search localizes to the hosting datacenter's IP, so a city-bound
 * business ("a locksmith") never surfaces on a category question even though it
 * does for a real searcher standing in that city.
 *
 * Country defaults to IL for Israeli sites (a .il host or a Hebrew name/category).
 * City comes from business.location when it names a real place, not the bare 'IL'
 * country sentinel. Returns undefined when there is no usable signal, so the search
 * stays neutral rather than guessing a wrong place.
 */
function buildAskLocation(business: BusinessGuess, host: string): AskLocation | undefined {
  const isIL =
    /\.il$/i.test(host) ||
    /[֐-׿]/.test(`${business.name ?? ''} ${business.category ?? ''} ${business.location ?? ''}`);
  const rawLoc = (business.location ?? '').trim();
  const city = rawLoc && rawLoc.toUpperCase() !== 'IL' ? rawLoc : undefined;
  const country = isIL ? 'IL' : undefined;
  if (!country && !city) return undefined;
  return {
    ...(country ? { country } : {}),
    ...(city ? { city } : {}),
    ...(country === 'IL' ? { timezone: 'Asia/Jerusalem' } : {}),
  };
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// Hosts that are never counted as a cited "source": social, aggregators, search,
// encyclopedias. Mirrors the denylist used inside ai-visibility.extractCompetitors.
const SOURCE_DENYLIST = [
  'facebook.', 'instagram.', 'linkedin.', 'youtube.', 'youtu.be', 'twitter.', 'x.com',
  'tiktok.', 'wikipedia.', 'wikidata.', 'google.', 'maps.', 'yelp.', 'reddit.',
  'pinterest.', 'medium.com', 'quora.', 'crunchbase.', 'glassdoor.', 'indeed.',
];

/**
 * Unique cited source domains from a run's citations, excluding the brand's own
 * host and social/aggregator junk. Hostnames only, www-stripped, lowercased.
 */
function citationDomains(citations: string[], bareHost: string): string[] {
  const out = new Set<string>();
  const brand = bareHost.toLowerCase();
  for (const c of citations) {
    try {
      const h = new URL(c).hostname.replace(/^www\./, '').toLowerCase();
      if (!h) continue;
      if (h === brand || h.endsWith('.' + brand) || brand.endsWith('.' + h)) continue;
      if (SOURCE_DENYLIST.some((d) => h.includes(d))) continue;
      out.add(h);
    } catch {
      /* ignore malformed citation */
    }
  }
  return [...out];
}

// Lexical sentiment: cheap, language-agnostic heuristic over the answers we ALREADY
// collected, no extra model calls. Hebrew and English markers of praise vs. concern.
const POSITIVE_WORDS = [
  'מומלץ', 'מצוין', 'מעולה', 'איכות', 'אמין', 'מוביל', 'מובילה', 'הטוב', 'הטובה', 'הטובים',
  'מקצועי', 'מקצועית', 'מרשים', 'חדשני', 'פופולרי', 'אהוב', 'יתרון', 'יתרונות', 'ותיק', 'מנוסה',
  'recommended', 'excellent', 'great', 'best', 'leading', 'reliable', 'trusted', 'top',
  'quality', 'professional', 'popular', 'innovative', 'strong', 'impressive', 'reputable',
  'well-known', 'advantage', 'favorite',
];
const NEGATIVE_WORDS = [
  'גרוע', 'בעיה', 'בעיות', 'תלונה', 'תלונות', 'יקר', 'חיסרון', 'חסרונות', 'מאכזב', 'לא מומלץ',
  'לא איכותי', 'חלש', 'בעייתי', 'כשל', 'סיכון', 'זהירות', 'פחות טוב',
  'bad', 'poor', 'problem', 'problems', 'complaint', 'complaints', 'expensive', 'disadvantage',
  'disappointing', 'not recommended', 'weak', 'risky', 'avoid', 'scam', 'issue', 'issues',
  'concern', 'concerns', 'overpriced',
];

/** Classify tone toward the brand from the texts where it appeared. */
function classifySentiment(texts: string[]): BrandSentiment {
  const joined = texts.join('\n').toLowerCase();
  if (!joined.trim()) return 'none';
  let pos = 0;
  let neg = 0;
  for (const w of POSITIVE_WORDS) if (joined.includes(w.toLowerCase())) pos += 1;
  for (const w of NEGATIVE_WORDS) if (joined.includes(w.toLowerCase())) neg += 1;
  if (pos === 0 && neg === 0) return 'neutral';
  if (pos > 0 && neg > 0) {
    const ratio = pos / (pos + neg);
    if (ratio >= 0.7) return 'positive';
    if (ratio <= 0.3) return 'negative';
    return 'mixed';
  }
  return pos > 0 ? 'positive' : 'negative';
}

/** One brand-description question per engine, for sentiment + accuracy. */
function brandDescriptionQuery(business: BusinessGuess, bareHost: string): string {
  return (
    `האם אתה מכיר את העסק או האתר "${business.name}" (${bareHost})? ` +
    `בכמה משפטים תאר מה העסק עושה, באילו תחומים הוא עוסק ולמי הוא מתאים. ` +
    `אם אינך מכיר אותו, כתוב בדיוק: "לא מכיר את העסק הזה".`
  );
}

/** Content words (length >= 4) for grounding overlap, punctuation stripped. */
function contentTokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9֐-׿\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 4),
  );
}

/**
 * Heuristic hallucination check: compare the engine's brand description to the real
 * site facts and list invented/unsupported claims. Deliberately conservative, it
 * only flags specific, checkable claims and gross lack of grounding.
 */
function checkAccuracy(
  answerText: string,
  facts: { description?: string; url: string } | undefined,
  business: BusinessGuess,
): ShareOfModelEngine['accuracy'] {
  if (!facts) return { checked: false, correct: null, issues: [] };
  // No recognition means nothing to verify, not a hallucination.
  if (!answerText.trim() || REFUSAL_RE.test(answerText)) {
    return { checked: true, correct: null, issues: [] };
  }
  const source = `${facts.description ?? ''}`;
  const sourceLc = source.toLowerCase();
  const known = contentTokens(
    `${facts.description ?? ''} ${business.name ?? ''} ${business.category ?? ''} ${business.location ?? ''}`,
  );
  const issues: string[] = [];

  // 1) Years / founding dates the source never states.
  for (const y of [...new Set(answerText.match(/\b(?:19|20)\d{2}\b/g) ?? [])]) {
    if (!source.includes(y)) issues.push(`טענה על שנה (${y}) שאינה מופיעה בעובדות האתר`);
  }

  // 2) Strong specificity claims absent from the source.
  const markers: Array<[RegExp, string]> = [
    [
      /מספר\s*1|#\s*1|number\s*one|the\s+largest|הגדול(?:ה)?\s+ביותר|המוביל(?:ה)?\s+בישראל/i,
      'טענת מובילות או גודל שאינה מגובה בעובדות האתר',
    ],
    [
      /פרס|זוכ[הת]|award|winner|תקן\s*ISO|iso\s*\d/i,
      'טענת פרס או תקן שאינה מופיעה בעובדות האתר',
    ],
    [
      /\d+\s*(?:סניפים|עובדים|שנות\s+ניסיון|years)/i,
      'טענה מספרית (סניפים, עובדים או ותק) שאינה מופיעה בעובדות האתר',
    ],
  ];
  for (const [re, msg] of markers) {
    const m = re.exec(answerText);
    if (m && !sourceLc.includes(m[0].toLowerCase()) && !issues.includes(msg)) issues.push(msg);
  }

  // 3) Grounding: how much of the engine's description echoes the known facts.
  const answerTokens = [...contentTokens(answerText)];
  if (answerTokens.length >= 5 && known.size > 0) {
    const grounded = answerTokens.filter((t) => known.has(t)).length;
    if (grounded / answerTokens.length < 0.15) {
      issues.push('רוב התיאור של המנוע אינו מגובה בעובדות האתר, חשד להמצאה');
    }
  }

  return { checked: true, correct: issues.length === 0, issues };
}

/** The cheapest configured engine, or null if none are set. */
function cheapestProvider(): Provider | null {
  return CHEAPEST_ORDER.find((p) => p.isConfigured()) ?? null;
}

/**
 * Parse an ordered list of names from a numbered/bulleted answer, INCLUDING our
 * own brand, so we can read the brand's rank. This is the one thing
 * extractCompetitors cannot give us, because it deliberately strips the brand.
 * Name cleanup mirrors the list parsing style used there.
 */
function parseRankedNames(text: string): string[] {
  const names: string[] = [];
  for (const line of text.split('\n')) {
    const m = /^\s*(?:\d+[.)]|[-*•])\s*(.+)$/.exec(line);
    if (!m) continue;
    const name = m[1].replace(/[*_`"']/g, '').split(/[\-–—:|(]/)[0].trim();
    if (name) names.push(name);
  }
  return names;
}

/** 1-based rank of the brand in the ranked list, or null if not in a parseable list. */
function brandPosition(rankedNames: string[], aliases: string[]): number | null {
  for (let i = 0; i < rankedNames.length; i++) {
    if (mentionsBrand(rankedNames[i], [], aliases)) return i + 1;
  }
  return null;
}

/** Templated fallback questions when LLM generation fails or returns too few.
 *  `areaLabel` is the place word woven into the question text (e.g. 'ישראל' or a
 *  region). City-level precision rides on the per-run search location, not here, so
 *  one question set stays valid across every city in a multi-city service area. */
function fallbackQuestions(business: BusinessGuess, count: number, areaLabel?: string): string[] {
  const cat = business.category?.trim() || 'התחום של העסק';
  const loc =
    areaLabel?.trim() ||
    (business.location && business.location !== 'IL' ? business.location.trim() : 'ישראל');
  const base = [
    `מי העסקים המומלצים ביותר בתחום ${cat} באזור ${loc}?`,
    `מה הכי טוב לבחור בתחום ${cat} ב${loc}, ולמה?`,
    `איך בוחרים נותן שירות טוב בתחום ${cat}? מה חשוב לבדוק?`,
    `מה ההבדל בין הספקים המובילים בתחום ${cat} ב${loc}?`,
    `למי כדאי לפנות בתחום ${cat} אם רוצים שירות אמין ב${loc}?`,
    `מה היתרונות והחסרונות של האפשרויות המובילות בתחום ${cat}?`,
    `על מה חשוב לשים לב לפני שבוחרים עסק בתחום ${cat}?`,
    `אילו חברות או עסקים מתמחים בתחום ${cat} ב${loc}?`,
    `מה המחיר המקובל ולמי משתלם לפנות בתחום ${cat}?`,
    `מי נחשב המוביל בתחום ${cat} ב${loc} כיום?`,
    `איזה עסק בתחום ${cat} מקבל את ההמלצות הכי טובות מלקוחות?`,
    `מה כדאי להשוות בין ספקים שונים בתחום ${cat} לפני החלטה?`,
  ];
  return base.slice(0, count);
}

/** Parse a numbered/bulleted question list out of the generator's answer. */
function parseQuestionList(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split('\n')) {
    const m = /^\s*(?:\d+[.)]|[-*•])\s*(.+)$/.exec(line);
    if (!m) continue;
    const q = m[1].replace(/[*_`]/g, '').trim();
    // A real buyer question ends with a question mark or is a reasonable clause.
    if (q.length >= 8 && q.length <= 200) out.push(q);
  }
  return out;
}

/**
 * Build the category-level buyer question set with ONE cheap LLM call. Falls back
 * to a templated set if generation fails or returns too few questions.
 */
async function buildQuestionSet(
  business: BusinessGuess,
  provider: Provider | null,
  count: number,
  askLoc?: AskLocation,
  areaLabel?: string,
  brandNames?: string[],
): Promise<string[]> {
  // Never hand the model the brand name inside a question: that would plant the
  // answer and inflate the appearance rate. Questions must stay category-level.
  const stripBranded = (qs: string[]): string[] =>
    brandNames && brandNames.length > 0
      ? qs.filter((q) => !mentionsBrand(q, [], brandNames))
      : qs;
  if (!provider) return fallbackQuestions(business, count, areaLabel);
  const cat = business.category?.trim() || 'התחום של העסק';
  const loc =
    areaLabel?.trim() ||
    (business.location && business.location !== 'IL' ? business.location.trim() : 'ישראל');
  const prompt =
    `עסק פועל בתחום "${cat}" באזור ${loc}. ` +
    `כתוב ${count} שאלות אמיתיות שלקוח שואל לפני שהוא בוחר ספק או מוצר בתחום הזה. ` +
    `חלק את השאלות לשלושה סוגים: ` +
    `שאלות המלצה (מי מומלץ, מה הכי טוב ל), ` +
    `שאלות השוואה (מה ההבדל בין, מוצר מול מוצר), ` +
    `ושאלות איך בוחרים (איך בוחרים, מה חשוב לבדוק). ` +
    `החזר רשימה ממוספרת של שאלות בלבד, שאלה אחת בכל שורה, בלי כותרות ובלי הסברים. ` +
    `כתוב בעברית טבעית.`;
  const ans = await provider.ask(prompt, askLoc);
  if (!ans) return fallbackQuestions(business, count, areaLabel);
  const parsed = stripBranded(parseQuestionList(ans.text));
  if (parsed.length < Math.min(3, count)) return fallbackQuestions(business, count, areaLabel);
  if (parsed.length < count) {
    // Top up from the templated set, skipping duplicates.
    const seen = new Set(parsed.map((q) => q.toLowerCase()));
    for (const q of fallbackQuestions(business, count, areaLabel)) {
      if (parsed.length >= count) break;
      if (!seen.has(q.toLowerCase())) {
        parsed.push(q);
        seen.add(q.toLowerCase());
      }
    }
  }
  return parsed.slice(0, count);
}

// One parsed answer for a single (question, engine, run).
interface RunParse {
  appeared: boolean;
  position: number | null;
  competitors: string[];
  /** Cited source domains for this run (brand host + junk excluded). */
  domains: string[];
}

function parseAnswer(
  text: string,
  citations: string[],
  bareHost: string,
  aliases: string[],
): RunParse {
  const domains = citationDomains(citations, bareHost);
  if (REFUSAL_RE.test(text)) {
    return { appeared: false, position: null, competitors: [], domains };
  }
  const appeared = mentionsBrand(text, citations, aliases);
  const ranked = parseRankedNames(text);
  const position = appeared ? brandPosition(ranked, aliases) : null;
  const competitors = extractCompetitors(text, citations, bareHost, aliases);
  return { appeared, position, competitors, domains };
}

export async function computeShareOfModel(
  business: BusinessGuess,
  host: string,
  opts?: {
    questions?: number;
    runs?: number;
    competitorsSeed?: string[];
    /** Real site facts for the hallucination check. Without them accuracy.checked=false. */
    facts?: { description?: string; url: string };
    /** Optional search localization. All fields optional, so a caller can pin a
     *  country, one or more service-area cities, or nothing at all. When cities are
     *  given the runs rotate across them (round-robin) so the measurement reflects the
     *  whole service area at the same cost. When omitted, falls back to the location
     *  derived from the business (IL for .il / Hebrew sites), or stays neutral. */
    location?: { country?: string; cities?: string[]; areaLabel?: string };
  },
): Promise<ShareOfModelResult> {
  const configured = ENGINES.filter((p) => p.isConfigured());

  const questionCount = clamp(Math.round(opts?.questions ?? DEFAULT_QUESTIONS), 1, MAX_QUESTIONS);
  const runs = clamp(Math.round(opts?.runs ?? DEFAULT_RUNS), 1, MAX_RUNS);

  // Resolve search localization once, up front (needed by both the no-engine branch
  // and the live path). Provided country/cities win; otherwise fall back to what the
  // business implies; otherwise stay location-neutral.
  const provided = opts?.location;
  const derived = buildAskLocation(business, host);
  const country = (provided?.country?.trim() || derived?.country) || undefined;
  const timezone = country === 'IL' ? 'Asia/Jerusalem' : derived?.timezone;
  const cities = (provided?.cities ?? []).map((c) => c.trim()).filter(Boolean);
  const areaLabel =
    provided?.areaLabel?.trim() ||
    (country === 'IL' ? 'ישראל' : country) ||
    derived?.city ||
    undefined;
  // Per-run search locations. Multiple cities => rotate across runs; else a single
  // country/city element; else empty (neutral search).
  const mk = (city?: string): AskLocation => ({
    ...(country ? { country } : {}),
    ...(city ? { city } : {}),
    ...(timezone ? { timezone } : {}),
  });
  const askLocations: AskLocation[] =
    cities.length > 0
      ? cities.map((c) => mk(c))
      : country || derived?.city
        ? [mk(derived?.city)]
        : [];
  const primaryLoc: AskLocation | undefined = askLocations[0];
  // Runs for a given engine: single-run engines (SERP-backed) do 1, the rest do `runs`.
  const runsFor = (p: Provider): number => (SINGLE_RUN_ENGINE_IDS.has(p.id) ? 1 : runs);
  // Which search location a given (question, run) uses. Rotates deterministically so
  // every city gets roughly even coverage across the question set. `engineRuns` keeps
  // the rotation correct for single-run engines too (index by question when runs=1).
  const pickLoc = (qi: number, r: number, engineRuns: number): AskLocation | undefined =>
    askLocations.length > 0
      ? askLocations[(qi * engineRuns + r) % askLocations.length]
      : undefined;

  if (configured.length === 0) {
    // No engine configured: still return the question set for transparency.
    const questions = fallbackQuestions(business, questionCount, areaLabel);
    return {
      available: false,
      questions,
      runsPerQuestion: runs,
      engines: [],
      competitorStandings: [],
      citedSources: [],
      overallShareOfModel: 0,
      presence: { appearances: 0, trials: 0, rateLow: 0, rateHigh: 0, label: 'לא נמדד' },
    };
  }

  const bareHost = bareHostOf(host);
  const aliases = brandAliases(business, host);

  // 1) Question set from the cheapest engine (one call), with templated fallback.
  // Generated at category level (area word = areaLabel); city precision comes from
  // the per-run search location, so the same set is valid across every service city.
  const questions = await buildQuestionSet(
    business,
    cheapestProvider(),
    questionCount,
    primaryLoc,
    areaLabel,
    aliases,
  );

  // competitorsSeed primes the standings so known competitors surface even at count 0.
  const standings = new Map<string, { name: string; count: number }>();
  for (const seed of opts?.competitorsSeed ?? []) {
    const name = seed.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!standings.has(key)) standings.set(key, { name, count: 0 });
  }
  const bumpCompetitor = (name: string) => {
    const key = name.trim().toLowerCase();
    if (!key) return;
    const cur = standings.get(key);
    if (cur) cur.count += 1;
    else standings.set(key, { name: name.trim(), count: 1 });
  };

  // Cited-source standings: domain -> run-count + the engines that cited it.
  const citedSourceMap = new Map<string, { domain: string; count: number; engines: Set<string> }>();
  const bumpSource = (domain: string, engineId: string) => {
    const key = domain.toLowerCase();
    const cur = citedSourceMap.get(key);
    if (cur) {
      cur.count += 1;
      cur.engines.add(engineId);
    } else {
      citedSourceMap.set(key, { domain, count: 1, engines: new Set([engineId]) });
    }
  };

  // One brand-description answer per engine, reused for sentiment + accuracy (no
  // per-question cost). Aligned by index with `configured` / `accums`.
  const brandDescQ = brandDescriptionQuery(business, bareHost);
  const brandDescAnswers = await Promise.all(configured.map((p) => p.ask(brandDescQ, primaryLoc)));

  // Accumulators per engine.
  interface Accum {
    provider: Provider;
    perQuestion: ShareOfModelEngine['perQuestion'];
    positions: number[]; // all non-null positions across runs, for avgPosition
    measuredRuns: number; // total successful runs across all questions (0 => engine failed)
    appearances: number; // our-brand appearances across all question-runs
    totalMentions: number; // total brand appearances (all brands) across those runs
    appearedQuestions: number; // questions where brand appeared in a majority of runs
    top3Questions: number; // questions where brand in top 3 in a majority of runs
    brandTexts: string[]; // texts where the brand appeared, for sentiment
  }
  const accums: Accum[] = configured.map((provider) => ({
    provider,
    perQuestion: [],
    positions: [],
    measuredRuns: 0,
    appearances: 0,
    totalMentions: 0,
    appearedQuestions: 0,
    top3Questions: 0,
    brandTexts: [],
  }));

  // Grand totals for the presence confidence band (across all engines + runs).
  let grandTrials = 0;
  let grandAppearances = 0;

  // 2) Per question SEQUENTIALLY (bounds parallelism); engines x runs in parallel per question.
  for (let qi = 0; qi < questions.length; qi++) {
    const question = questions[qi];
    const perEngineRuns = await Promise.all(
      accums.map((acc) => {
        const er = runsFor(acc.provider);
        return Promise.all(
          // Each run may target a different service city (round-robin), so a
          // multi-city business is measured across its whole area.
          Array.from({ length: er }, (_unused, r) => acc.provider.ask(question, pickLoc(qi, r, er))),
        );
      }),
    );

    accums.forEach((acc, ei) => {
      const answers = perEngineRuns[ei];
      const parses: RunParse[] = [];
      for (const ans of answers) {
        if (!ans) continue; // failed/null call: skipped, does not count as "did not appear"
        const parse = parseAnswer(ans.text, ans.citations, bareHost, aliases);
        parses.push(parse);
        if (parse.appeared) acc.brandTexts.push(ans.text);
      }

      const measured = parses.length;
      let appearedCount = 0;
      let top3Count = 0;
      const topBrandsSeen = new Map<string, string>(); // lowercase -> display, order-preserving
      const qSources = new Set<string>(); // cited domains for this engine+question

      for (const p of parses) {
        // Share-of-model denominator: every distinct brand appearing in this run.
        const runBrands = p.competitors.length + (p.appeared ? 1 : 0);
        acc.totalMentions += runBrands;
        if (p.appeared) {
          acc.appearances += 1;
          appearedCount += 1;
          if (p.position !== null && p.position <= 3) top3Count += 1;
        }
        if (p.position !== null) acc.positions.push(p.position);
        for (const c of p.competitors) {
          const key = c.toLowerCase();
          if (!topBrandsSeen.has(key)) topBrandsSeen.set(key, c);
          bumpCompetitor(c);
        }
        for (const d of p.domains) {
          qSources.add(d);
          bumpSource(d, acc.provider.id);
        }
      }

      // Feed the grand presence band: every successful run is a trial.
      grandTrials += measured;
      grandAppearances += appearedCount;
      acc.measuredRuns += measured;

      // Majority is over MEASURED (successful) runs. Zero measured => not appeared.
      const majority = measured > 0 && appearedCount * 2 > measured;
      const top3Majority = measured > 0 && top3Count * 2 > measured;
      if (majority) acc.appearedQuestions += 1;
      if (top3Majority) acc.top3Questions += 1;

      // Representative position for the question: average of this question's non-null runs.
      const qPositions = parses
        .map((p) => p.position)
        .filter((x): x is number => x !== null);
      const qPosition =
        qPositions.length > 0
          ? Math.round((qPositions.reduce((a, b) => a + b, 0) / qPositions.length) * 10) / 10
          : null;

      acc.perQuestion.push({
        question,
        appeared: majority,
        position: qPosition,
        topBrands: [...topBrandsSeen.values()],
        sources: [...qSources].slice(0, 12),
      });
    });
  }

  const engines: ShareOfModelEngine[] = accums.map((acc, ei) => {
    const appearanceRate = acc.appearedQuestions / questions.length;
    const recommendationRate = acc.top3Questions / questions.length;
    const avgPosition =
      acc.positions.length > 0
        ? Math.round(
            (acc.positions.reduce((a, b) => a + b, 0) / acc.positions.length) * 10,
          ) / 10
        : null;
    const shareOfModel =
      acc.totalMentions > 0
        ? Math.round((acc.appearances / acc.totalMentions) * 1000) / 10
        : 0;

    // Fold the brand-description answer into sentiment when it recognized the brand.
    const brandDesc = brandDescAnswers[ei];
    const sentimentTexts = [...acc.brandTexts];
    if (brandDesc && !REFUSAL_RE.test(brandDesc.text) &&
        mentionsBrand(brandDesc.text, brandDesc.citations, aliases)) {
      sentimentTexts.push(brandDesc.text);
    }

    return {
      id: acc.provider.id,
      label: acc.provider.label,
      measuredRuns: acc.measuredRuns,
      appearanceRate,
      recommendationRate,
      avgPosition,
      shareOfModel,
      sentiment: classifySentiment(sentimentTexts),
      accuracy: checkAccuracy(brandDesc?.text ?? '', opts?.facts, business),
      perQuestion: acc.perQuestion,
    };
  });

  const competitorStandings = [...standings.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const citedSources = [...citedSourceMap.values()]
    .map((s) => ({ domain: s.domain, count: s.count, engines: [...s.engines] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  // Average only over engines that actually returned data. A failed engine (0 runs)
  // must not drag the overall share down to look like poor visibility.
  const measuredEngines = engines.filter((e) => e.measuredRuns > 0);
  const overallShareOfModel =
    measuredEngines.length > 0
      ? Math.round(
          (measuredEngines.reduce((a, e) => a + e.shareOfModel, 0) / measuredEngines.length) * 10,
        ) / 10
      : 0;

  const band = wilsonInterval(grandAppearances, grandTrials);
  const presence = {
    appearances: grandAppearances,
    trials: grandTrials,
    rateLow: band.low,
    rateHigh: band.high,
    label: presenceLabel(grandTrials > 0 ? grandAppearances / grandTrials : 0, grandTrials),
  };

  return {
    available: true,
    questions,
    runsPerQuestion: runs,
    engines,
    competitorStandings,
    citedSources,
    overallShareOfModel,
    presence,
  };
}

/** Engine ids that are currently configured (have a key). For cost estimates. */
export function listConfiguredEngineIds(): string[] {
  return ENGINES.filter((p) => p.isConfigured()).map((p) => p.id);
}
