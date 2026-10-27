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
import type { AskLocation, Provider, SearchAnswer } from './providers/types';
import {
  brandAliases,
  mentionsBrand,
  extractCompetitors,
  registrableDomain,
  competitorKey,
  REFUSAL_RE,
} from './ai-visibility';

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
export const SINGLE_RUN_ENGINE_IDS = new Set<Provider['id']>(['google-aio']);

// Engines capped at 1 run per question to avoid overloading their rate-limited
// web_search: Claude kept aborting (and showing "not measured" in every report)
// when 3 of its calls fired at once per question. One call at a time lets it finish,
// without the whole-report slowdown that fully-sequential runs caused. Unlike the
// SINGLE_RUN set, these still answer the brand-description query (recognition/tone).
// 1 run per question. Claude's web_search is now fast (extended thinking disabled in
// the provider), but 3 concurrent Claude calls per question still rate-limit the key
// (429 -> "not measured"). One call at a time keeps Claude reliably returning data.
const LOW_CONCURRENCY_ENGINE_IDS = new Set<Provider['id']>(['claude']);

const ENGINE_RETRIES = 2;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Call provider.ask with retries on a transient failure, so one flaky 429/timeout
 * does not drop an engine to "not measured". This retries ONLY the single failed
 * call — a call that already returned is never re-run, so no duplicate load or cost.
 * The SERP engine is exempt: its null means "Google showed no AI Overview" (a valid
 * result), and a retry would only burn a paid search.
 */
async function askResilient(
  p: Provider,
  prompt: string,
  loc?: AskLocation,
): Promise<SearchAnswer | null> {
  if (p.id === 'google-aio') return p.ask(prompt, loc);
  for (let attempt = 0; ; attempt++) {
    const t0 = Date.now();
    const ans = await p.ask(prompt, loc);
    if (ans || attempt >= ENGINE_RETRIES) return ans;
    // Only retry FAST failures (a 429/network blip). A slow failure is a timeout —
    // retrying it would triple the latency and blow the whole report's time budget
    // (that 504'd reports). Give up quickly instead.
    if (Date.now() - t0 > 8000) return ans;
    await sleep(300 * (attempt + 1));
  }
}

/** Normalize a free-form country to an ISO-3166 alpha-2 code for user_location.
 *  The admin field invites "ישראל", but the search tools expect "IL"; sending the
 *  Hebrew name breaks localization and can 400 some providers into dropping out.
 *  Unknown free-text names return undefined (safer than passing garbage). */
function normalizeCountry(s?: string): string | undefined {
  const v = (s ?? '').trim();
  if (!v) return undefined;
  if (/^[A-Za-z]{2}$/.test(v)) return v.toUpperCase();
  if (/ישראל|israel/i.test(v)) return 'IL';
  return undefined;
}

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
  /** Plain recognition state, so the card can say it in words rather than leave the
   *  reader to infer it from a 0% + a pill:
   *  - 'recognized'  — the engine described YOUR business (knows you).
   *  - 'wrong-entity'— the engine described a DIFFERENT same-named entity (doesn't know you).
   *  - 'not-found'   — the engine said it doesn't know you / returned nothing.
   *  - 'not-probed'  — a SERP engine with no recognition query. */
  recognitionState?: 'recognized' | 'wrong-entity' | 'not-found' | 'not-probed';
  perQuestion: Array<{
    question: string;
    appeared: boolean;
    position: number | null;
    topBrands: string[];
    /** Cited source domains this engine used to answer this question. */
    sources: string[];
  }>;
}

/** A single raw AI answer, kept so the measurement can be RE-PROCESSED later (new
 *  aliases, new denylist, new accuracy judge) WITHOUT paying to re-measure. */
export interface RawAnswer {
  text: string;
  citations: string[];
}
/** All raw answers for one engine: its brand-description probe + per-question run
 *  answers ([questionIndex][runIndex], null = that call failed). */
export interface RawEngineData {
  brandDesc: RawAnswer | null;
  questions: Array<Array<RawAnswer | null>>;
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
   * Recognition axis: among the engines we asked "do you know this business?", how
   * many actually recognized it (described it, did not say "I don't know"). This is
   * a SEPARATE signal from Share of Model: a brand can be known to the AI yet never
   * recommended unprompted, so the report isn't a flat 0% for everyone. `total` is
   * the engines that ran the recognition query (SERP engines are excluded).
   */
  recognition: { recognized: number; total: number };
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
    /** True when too few trials to read the point rate confidently (borrowed from
     *  limelit's small-sample flagging). The band stays valid; this just warns. */
    smallSample?: boolean;
  };
  /** Raw per-engine answers (brand-description + per-question runs), keyed by engine id.
   *  Persisted in the measurement SESSION so a later code fix (aliases/denylist/accuracy
   *  judge) can be re-applied without re-calling the APIs. Stripped from the public
   *  report to keep it small and avoid exposing raw answers. */
  rawAnswers?: Record<string, RawEngineData>;
}

/** Below this many successful trials, flag the measurement as a small sample (limelit). */
const SMALL_SAMPLE_MIN = 20;

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
      // Collapse subdomains so a site and its subdomains count as one source.
      const reg = registrableDomain(h);
      if (reg === brand || brand.endsWith('.' + reg)) continue;
      out.add(reg);
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

/** Did the engine actually recognize the brand in its description answer (i.e. it
 *  described the business rather than saying it doesn't know it)? */
function recognizedBrand(ans: { text: string } | null): boolean {
  if (!ans) return false;
  const t = ans.text.trim();
  if (t.length < 15 || REFUSAL_RE.test(t)) return false;
  if (/לא\s*מכיר|לא\s*מוכר|אינני\s*מכיר|אין\s*לי\s*מידע|don'?t\s*know|not\s*familiar|no\s*information/i.test(t)) {
    return false;
  }
  return true;
}

/** One brand-description question per engine, for sentiment + accuracy. The explicit
 *  "search the site first" instruction matters: a small/new brand is often absent from
 *  an engine's training memory, so without a live lookup it falsely answers "לא מכיר"
 *  even though the site exists. The host is the unique identifier, so this improves
 *  TRUE recognition without planting a generic category description (which would
 *  inflate recognition for engines that don't actually know this specific business). */
function brandDescriptionQuery(business: BusinessGuess, bareHost: string): string {
  return (
    `חפש מידע עדכני על האתר ${bareHost} וענה על סמך מה שתמצא. ` +
    `האם אתה מכיר את העסק או האתר "${business.name}" (${bareHost})? ` +
    `בכמה משפטים תאר מה העסק עושה, באילו תחומים הוא עוסק ולמי הוא מתאים. ` +
    `אם אינך מכיר אותו ולא מצאת עליו מידע, כתוב בדיוק: "לא מכיר את העסק הזה".`
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
  // Without substantial site facts we cannot judge accuracy. Name + category alone
  // (a handful of words) would false-flag almost any real description as a
  // hallucination, so report "not checked" instead of a misleading "אי-דיוקים".
  if (source.trim().split(/\s+/).filter(Boolean).length < 8) {
    return { checked: false, correct: null, issues: [] };
  }
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

/* ---------- LLM-judge for tone + factual accuracy (borrowed from helix-rank's
   brand-protection.ts). Replaces the brittle word-list sentiment and regex accuracy:
   a cheap model READS the engine's brand description and judges tone + each factual
   claim against a source of truth. Fixes the false "חשד להמצאה": a claim the truth
   can't confirm is "unverifiable", not "wrong". Falls back to the old heuristics when
   no engine is configured or the call/parse fails, so nothing regresses. ---------- */
interface BrandJudgment {
  sentiment: 'positive' | 'neutral' | 'negative';
  claims: Array<{ claim: string; status: 'correct' | 'wrong' | 'unverifiable'; correction?: string }>;
  /** Did the engine actually describe THIS business, or a different same-named entity?
   *  A generic brand name ("Impact with AI") makes engines describe the wrong company
   *  (a podcast, a research project). False = the engine does NOT really recognize you. */
  describesThisBusiness: boolean;
}

async function judgeBrandAnswer(
  brandName: string,
  answerText: string,
  truth: string | undefined,
): Promise<BrandJudgment | null> {
  const provider = cheapestProvider();
  if (!provider || !answerText.trim() || REFUSAL_RE.test(answerText)) return null;
  const prompt =
    `אתה מנתח מוניטין מותג בתשובות של מנועי AI. החזר JSON תקין בלבד, בלי טקסט נוסף.\n` +
    `מותג: "${brandName}"\n` +
    `תשובת מנוע ה-AI:\n"""${answerText.slice(0, 4000)}"""\n` +
    (truth ? `עובדות-אמת רשמיות על המותג (מקור אמת להשוואה):\n"""${truth.slice(0, 2000)}"""\n` : '') +
    `החזר JSON במבנה: {"describesThisBusiness":true|false,"sentiment":"positive|neutral|negative","claims":[{"claim":"טענה עובדתית קונקרטית על המותג שהופיעה בתשובה","status":"correct|wrong|unverifiable","correction":"התיקון הנכון, רק אם status=wrong"}]}\n` +
    `describesThisBusiness: האם התשובה מתארת את אותו העסק שבמקור האמת (אותו מייסד, אותו סוג שירות)? ` +
    `אם המנוע תיאר חברה או ישות אחרת עם שם דומה (פודקאסט, פרויקט מחקר, חברה אחרת) — החזר false. בלי מקור אמת, החזר true אם התיאור סביר.\n` +
    `כללים לטענות: אם יש מקור אמת, השווה כל טענה מולו; טענה שסותרת אותו = "wrong" עם correction. ` +
    `אם אין מקור אמת או שאי אפשר לאמת, סמן "unverifiable" (לא "wrong"). סמן "wrong" רק כשברור שהטענה שגויה. עד 5 claims.`;
  const ans = await provider.ask(prompt);
  if (!ans) return null;
  const m = ans.text.match(/\{[\s\S]*\}/);
  if (!m) return null;
  let data: { sentiment?: unknown; claims?: unknown; describesThisBusiness?: unknown };
  try {
    data = JSON.parse(m[0]);
  } catch {
    return null;
  }
  // Default to true (don't falsely accuse an engine of wrong-entity when unsure).
  const describesThisBusiness = data.describesThisBusiness !== false;
  const sentiment: BrandJudgment['sentiment'] =
    data.sentiment === 'positive' || data.sentiment === 'negative' ? data.sentiment : 'neutral';
  const toStatus = (s: unknown): 'correct' | 'wrong' | 'unverifiable' =>
    s === 'correct' || s === 'wrong' ? s : 'unverifiable';
  const claims: BrandJudgment['claims'] = Array.isArray(data.claims)
    ? data.claims
        .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
        .filter((c) => typeof c.claim === 'string' && (c.claim as string).trim())
        .slice(0, 5)
        .map((c) => ({
          claim: String(c.claim),
          status: toStatus(c.status),
          correction: typeof c.correction === 'string' ? c.correction : undefined,
        }))
    : [];
  return { sentiment, claims, describesThisBusiness };
}

/** Map an LLM judgment onto our { checked, correct, issues } accuracy shape. */
function judgmentToAccuracy(j: BrandJudgment): ShareOfModelEngine['accuracy'] {
  const wrong = j.claims.filter((c) => c.status === 'wrong');
  const anyCorrect = j.claims.some((c) => c.status === 'correct');
  const correct = wrong.length > 0 ? false : anyCorrect ? true : null; // all-unverifiable => null
  const issues = wrong.map((c) => (c.correction ? `${c.claim} — הנכון: ${c.correction}` : c.claim));
  return { checked: true, correct, issues };
}

/**
 * Infer the REAL business category from what the site actually says it does, not the
 * schema.org @type. The @type is frequently "Person"/"Organization"/"WebSite", which
 * is meaningless as a field and made the question generator invent a wrong domain
 * (e.g. "personal coaching" for an AI-consulting firm) — so every question, and the
 * whole measurement, was about the wrong thing. Returns undefined when no engine is
 * configured, there's nothing to read, or the model doesn't return a clean category.
 */
export async function inferCategory(
  name: string,
  host: string,
  content: string | undefined,
): Promise<string | undefined> {
  const provider = cheapestProvider();
  if (!provider) return undefined;
  const basis = ((content ?? '').trim() || name || '').slice(0, 1300);
  if (!basis) return undefined;
  const prompt =
    `לפניך תוכן מתוך אתר של עסק. מהו תחום העיסוק המדויק של העסק? ` +
    `החזר ביטוי קצר אחד בלבד בעברית (2 עד 6 מילים) שמתאר מה העסק מוכר או עושה, ` +
    `בלי משפט שלם, בלי הסבר ובלי ניקוד. לדוגמאות לפורמט: ` +
    `"ייעוץ והטמעת AI לארגונים", "מנעולן ופורץ מנעולים", "רואה חשבון לעסקים קטנים".\n\n` +
    `שם: ${name}\nאתר: ${host}\nתוכן: ${basis}`;
  const ans = await provider.ask(prompt);
  if (!ans) return undefined;
  const line = ans.text.split('\n').map((l) => l.trim()).find(Boolean) ?? '';
  const cat = line.replace(/^["'*\-–—:·\s]+|["'*.\s]+$/g, '').trim();
  // A category is short; reject sentences / refusals / junk.
  if (!cat || cat.length < 2 || cat.length > 60 || cat.split(/\s+/).length > 8) return undefined;
  if (REFUSAL_RE.test(cat) || /[.?!]/.test(cat)) return undefined; // a sentence, not a category
  return cat;
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

/** Per-business-type question guidance. The word the buyer is "choosing" and the kinds
 *  of questions that are legitimate for that kind of business. This is the fix for a
 *  service firm being measured with "tool X vs tool Y" questions it can never appear in
 *  (and for the tool "competitors" that polluted the rivals list as a result). */
const QUESTION_TYPE_PROFILES: Record<
  NonNullable<BusinessGuess['businessType']>,
  { choiceNoun: string; guidance: string }
> = {
  service: {
    choiceNoun: 'ספק, חברה או יועץ',
    guidance:
      'העסק הוא נותן שירות/ייעוץ, לא מוצר. כתוב רק שאלות על בחירת ספק, חברה או יועץ בתחום: ' +
      'שאלות המלצה (מי החברות או היועצים המומלצים), שאלות השוואה בין נותני שירות ' +
      '(מה ההבדל בין החברות המובילות), ושאלות איך בוחרים (איך בוחרים חברה או ספק, מה חשוב לבדוק). ' +
      'אל תכתוב שאלות שמשוות בין כלים, תוכנות או מוצרים, ואל תזכיר שמות כלים.',
  },
  product: {
    choiceNoun: 'מוצר, כלי או תוכנה',
    guidance:
      'העסק מוכר מוצר/כלי/תוכנה. כתוב שאלות על בחירת מוצר או כלי בתחום: ' +
      'שאלות המלצה (מה הכלי או התוכנה הכי טובה ל), שאלות השוואה (מוצר מול מוצר), ' +
      'ושאלות איך בוחרים (איך בוחרים כלי, מה חשוב לבדוק).',
  },
  local: {
    choiceNoun: 'עסק מקומי',
    guidance:
      'העסק הוא עסק מקומי שמשרת אזור גאוגרפי. כתוב שאלות על בחירת עסק מקומי בתחום ובאזור: ' +
      'שאלות המלצה (מי העסק הכי טוב באזור), איך בוחרים, ולמי כדאי לפנות באזור. ' +
      'אל תכתוב שאלות שמשוות בין כלים או מוצרים.',
  },
  ecommerce: {
    choiceNoun: 'חנות או מוצר',
    guidance:
      'העסק הוא חנות/מסחר אלקטרוני. כתוב שאלות על היכן לקנות ומה כדאי לקנות בתחום: ' +
      'שאלות המלצה (איפה כדאי לקנות, מה החנות המומלצת), שאלות השוואה בין חנויות או מוצרים, ' +
      'ושאלות איך בוחרים.',
  },
  personal: {
    choiceNoun: 'מומחה או יוצר',
    guidance:
      'העסק הוא מותג אישי/מומחה/יוצר תוכן. כתוב שאלות על מי המומחים או היוצרים המובילים בתחום: ' +
      'שאלות המלצה (מי המומחים או היוצרים המובילים, את מי כדאי לעקוב או להתייעץ), ' +
      'ושאלות איך בוחרים מומחה. אל תכתוב שאלות שמשוות בין כלים או מוצרים.',
  },
};

/** Generic guidance when the operator did not pick a business type (unchanged behavior). */
const GENERIC_QUESTION_GUIDANCE =
  'חלק את השאלות לשלושה סוגים: שאלות המלצה (מי מומלץ, מה הכי טוב ל), ' +
  'שאלות השוואה (מה ההבדל בין), ושאלות איך בוחרים (איך בוחרים, מה חשוב לבדוק).';

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
  const profile = business.businessType ? QUESTION_TYPE_PROFILES[business.businessType] : null;
  const choiceNoun = profile?.choiceNoun ?? 'ספק או מוצר';
  const guidance = profile?.guidance ?? GENERIC_QUESTION_GUIDANCE;
  const prompt =
    `עסק פועל בתחום "${cat}" באזור ${loc}. ` +
    `כתוב ${count} שאלות אמיתיות שלקוח שואל לפני שהוא בוחר ${choiceNoun} בתחום הזה. ` +
    guidance +
    ` החזר רשימה ממוספרת של שאלות בלבד, שאלה אחת בכל שורה, בלי כותרות ובלי הסברים. ` +
    `כתוב בעברית טבעית.`;
  const ans = await askResilient(provider, prompt, askLoc);
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
  categoryTokens?: Set<string>,
): RunParse {
  const domains = citationDomains(citations, bareHost);
  if (REFUSAL_RE.test(text)) {
    return { appeared: false, position: null, competitors: [], domains };
  }
  const appeared = mentionsBrand(text, citations, aliases);
  const ranked = parseRankedNames(text);
  const position = appeared ? brandPosition(ranked, aliases) : null;
  const competitors = extractCompetitors(text, citations, bareHost, aliases, categoryTokens);
  return { appeared, position, competitors, domains };
}

/** Content words of the business category, for filtering category phrases out of
 *  the competitor list (so "mortgage advisors" is not listed as a rival bank). */
function categoryTokenSet(category: string | undefined): Set<string> {
  return new Set(
    (category ?? '')
      .toLowerCase()
      .replace(/[^a-z0-9֐-׿\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length >= 3),
  );
}

/** Is this candidate name a bare domain (verifiable business), e.g. "yaelgroup.com"? */
function isDomainName(n: string): boolean {
  const t = n.trim();
  return !/\s/.test(t) && /\.[a-z]{2,}(\.[a-z]{2})?$/i.test(t);
}

/**
 * elmo-style two-stage competitor refinement. The cheap string/domain prescreen has
 * already run (standings); this is the LLM-judge second stage. Domains and operator-
 * seeded rivals are verifiable, kept as-is and never sent to the model. The remaining
 * prose names (the noisy ones: "automation tools", "the bottom line", category words)
 * are handed to the cheapest engine, which returns ONLY the real company/brand/product
 * names. This keeps genuine prose competitors (e.g. "יעל גרופ") that the old domains-only
 * filter threw away, while still dropping the phrase-junk. Falls back to the safe
 * domains+seeded-only list when no engine is configured or the call/parse fails, so the
 * display never regresses to junk.
 */
async function refineCompetitorStandings(
  all: Array<{ name: string; count: number }>,
  category: string | undefined,
  seededKeys: Set<string>,
): Promise<Array<{ name: string; count: number }>> {
  const keepAlways = (c: { name: string }) =>
    isDomainName(c.name) || seededKeys.has(competitorKey(c.name));
  const safe = () => all.filter(keepAlways);

  const toJudge = all.filter((c) => !keepAlways(c));
  const provider = cheapestProvider();
  if (toJudge.length === 0 || !provider) return safe();

  const cat = category?.trim() || 'העסק';
  const names = toJudge.map((c) => c.name);
  const prompt =
    `להלן שמות שחולצו מתשובות של מנועי AI כמתחרים אפשריים של עסק בתחום "${cat}". ` +
    `החזר רק את אלה שהם שם אמיתי וספציפי של חברה, מותג או מוצר (עברית או אנגלית). ` +
    `הסר ביטויים כלליים, שמות של קטגוריה או תחום, תיאורי תפקיד, משפטים, וכל דבר שאינו שם של חברה או מותג. ` +
    `החזר מערך JSON של המחרוזות שנשמרו, בדיוק כפי שהופיעו, בלי הסבר ובלי טקסט נוסף.\n\n` +
    JSON.stringify(names);
  const ans = await provider.ask(prompt);
  if (!ans) return safe();

  let approved: Set<string> | null = null;
  try {
    const m = ans.text.match(/\[[\s\S]*\]/);
    if (m) {
      const arr = JSON.parse(m[0]);
      if (Array.isArray(arr)) {
        approved = new Set(
          arr
            .filter((x): x is string => typeof x === 'string')
            .map((s) => s.trim().toLowerCase()),
        );
      }
    }
  } catch {
    approved = null;
  }
  if (!approved) return safe();
  const ok = approved;
  return all.filter((c) => keepAlways(c) || ok.has(c.name.trim().toLowerCase()));
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
    /** Run ONLY these engine ids; the rest are skipped. Used by the incremental
     *  session to re-measure just the engines that failed in a prior partial run. */
    onlyEngineIds?: Set<string>;
    /** Use these exact questions instead of generating a fresh set, so partial runs
     *  on the same site stay comparable and mergeable. */
    fixedQuestions?: string[];
    /** RE-PROCESS mode: instead of calling the engine APIs, read these stored raw
     *  answers (from a prior session) and re-run all the processing (parse appearances,
     *  extract competitors, filter, accuracy judge) with CURRENT code. Lets a fix apply
     *  to an already-measured site without paying for the question calls again (only the
     *  cheap accuracy judge re-runs). Keyed by engine id. */
    precomputedAnswers?: Record<string, RawEngineData>;
  },
): Promise<ShareOfModelResult> {
  const configured = ENGINES.filter(
    (p) => p.isConfigured() && (!opts?.onlyEngineIds || opts.onlyEngineIds.has(p.id)),
  );

  const questionCount = clamp(Math.round(opts?.questions ?? DEFAULT_QUESTIONS), 1, MAX_QUESTIONS);
  const runs = clamp(Math.round(opts?.runs ?? DEFAULT_RUNS), 1, MAX_RUNS);

  // Resolve search localization once, up front (needed by both the no-engine branch
  // and the live path). Provided country/cities win; otherwise fall back to what the
  // business implies; otherwise stay location-neutral.
  const provided = opts?.location;
  const derived = buildAskLocation(business, host);
  const rawCountry = (provided?.country?.trim() || derived?.country) || undefined;
  // ISO alpha-2 for the search tools; the human text is kept for the question wording.
  const country = normalizeCountry(rawCountry);
  const timezone = country === 'IL' ? 'Asia/Jerusalem' : derived?.timezone;
  const cities = (provided?.cities ?? []).map((c) => c.trim()).filter(Boolean);
  const areaLabel =
    provided?.areaLabel?.trim() ||
    (country === 'IL' ? 'ישראל' : rawCountry) ||
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
  const runsFor = (p: Provider): number =>
    SINGLE_RUN_ENGINE_IDS.has(p.id) || LOW_CONCURRENCY_ENGINE_IDS.has(p.id) ? 1 : runs;
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
      recognition: { recognized: 0, total: 0 },
      presence: { appearances: 0, trials: 0, rateLow: 0, rateHigh: 0, label: 'לא נמדד' },
    };
  }

  const bareHost = bareHostOf(host);
  const aliases = brandAliases(business, host);
  const categoryTokens = categoryTokenSet(business.category);

  // 1) Question set. In an incremental session we REUSE the prior run's questions
  // (so partial results merge apples-to-apples); otherwise generate a fresh set.
  const questions =
    opts?.fixedQuestions && opts.fixedQuestions.length > 0
      ? opts.fixedQuestions.slice(0, MAX_QUESTIONS)
      : await buildQuestionSet(business, cheapestProvider(), questionCount, primaryLoc, areaLabel, aliases);

  // competitorsSeed primes the standings so known competitors surface even at count 0.
  // Keyed by the canonical competitorKey so the same business (e.g. mul-t-lock.com
  // and mul-t-lock.co.il) is a single entry, never double-counted.
  const standings = new Map<string, { name: string; count: number }>();
  for (const seed of opts?.competitorsSeed ?? []) {
    const name = seed.trim();
    if (!name) continue;
    const key = competitorKey(name);
    if (key && !standings.has(key)) standings.set(key, { name, count: 0 });
  }
  // Operator-specified competitors to measure head-to-head. Even though competitors
  // are otherwise taken from cited domains only, these named rivals are detected in
  // the answer TEXT too, so "did competitor X get recommended here?" is answered.
  const seededCompetitors = (opts?.competitorsSeed ?? [])
    .map((s) => s.trim())
    .filter((s) => s.length >= 3);
  const bumpCompetitor = (name: string) => {
    const key = competitorKey(name);
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
  // Skip the brand-description call on SERP-backed engines: a Google search for a
  // brand name renders no AI Overview, so it would spend a paid SERP query for null.
  const precomputed = opts?.precomputedAnswers;
  const brandDescAnswers = await Promise.all(
    configured.map((p) => {
      // RE-PROCESS mode: read the stored brand-description instead of calling the API.
      if (precomputed) return Promise.resolve(precomputed[p.id]?.brandDesc ?? null);
      return SINGLE_RUN_ENGINE_IDS.has(p.id)
        ? Promise.resolve(null)
        : askResilient(p, brandDescQ, primaryLoc);
    }),
  );

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

  // Raw per-engine run answers ([engineIndex][questionIndex][runIndex]), captured so the
  // session can store them and a later fix can re-process without re-measuring.
  const rawQuestions: Array<Array<Array<RawAnswer | null>>> = accums.map(() => []);

  // 2) Per question SEQUENTIALLY (bounds parallelism); engines x runs in parallel per question.
  for (let qi = 0; qi < questions.length; qi++) {
    const question = questions[qi];
    const perEngineRuns = await Promise.all(
      // Engines AND their runs all fire in parallel — this keeps a report within the
      // server's request timeout (sequential runs blew past it and every report 504'd).
      // Claude's own timeout + reduced web_search budget keep it from hanging the batch.
      accums.map((acc) => {
        const er = runsFor(acc.provider);
        // RE-PROCESS mode: read the stored runs for this (engine, question) instead of
        // calling the API. Falls back to [] if that question wasn't stored.
        if (precomputed) {
          return Promise.resolve(precomputed[acc.provider.id]?.questions[qi] ?? []);
        }
        return Promise.all(
          // Each run may target a different service city (round-robin).
          Array.from({ length: er }, (_unused, r) => askResilient(acc.provider, question, pickLoc(qi, r, er))),
        );
      }),
    );

    accums.forEach((acc, ei) => {
      const answers = perEngineRuns[ei];
      // Keep the raw answers for this (engine, question) so they can be re-processed later.
      rawQuestions[ei].push(answers.map((a) => (a ? { text: a.text, citations: a.citations } : null)));
      const parses: RunParse[] = [];
      for (const ans of answers) {
        if (!ans) continue; // failed/null call: skipped, does not count as "did not appear"
        const parse = parseAnswer(ans.text, ans.citations, bareHost, aliases, categoryTokens);
        // Detect operator-specified competitors by name in the answer, and fold them
        // into this run's competitor set so they are counted head-to-head.
        if (seededCompetitors.length > 0) {
          const named = seededCompetitors.filter((c) => mentionsBrand(ans.text, ans.citations, [c]));
          if (named.length > 0) parse.competitors = [...parse.competitors, ...named];
        }
        // Collapse to one entry per canonical business so the Share-of-Model
        // denominator and the standings never count the same rival twice (e.g. a
        // domain + its subdomain, or mul-t-lock.com + mul-t-lock.co.il).
        if (parse.competitors.length > 1) {
          const seen = new Set<string>();
          parse.competitors = parse.competitors.filter((c) => {
            const k = competitorKey(c);
            if (!k || seen.has(k)) return false;
            seen.add(k);
            return true;
          });
        }
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
          const key = competitorKey(c);
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

  // LLM-judge tone + accuracy per engine, in parallel, BEFORE building the cards (the
  // map below is sync). Only judge engines that actually described the brand; others
  // keep the old "nothing to verify" behavior. The judge's truth is opts.facts (site
  // content, enriched in buildGeoReport). Each falls back to null on failure so the
  // old heuristics run instead — no regression.
  const judgments = await Promise.all(
    accums.map((acc, ei) => {
      const bd = brandDescAnswers[ei];
      if (!bd || !recognizedBrand(bd)) return Promise.resolve(null);
      return judgeBrandAnswer(business.name, bd.text, opts?.facts?.description).catch(() => null);
    }),
  );

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

    // Prefer the LLM judgment (tone + per-claim accuracy); fall back to the heuristics.
    const judg = judgments[ei];

    // Plain recognition state for the card.
    let recognitionState: ShareOfModelEngine['recognitionState'];
    if (SINGLE_RUN_ENGINE_IDS.has(acc.provider.id)) {
      recognitionState = 'not-probed'; // SERP engine, no recognition query
    } else if (!brandDesc || !recognizedBrand(brandDesc)) {
      recognitionState = 'not-found'; // said "don't know" / returned nothing
    } else if (judg && !judg.describesThisBusiness) {
      recognitionState = 'wrong-entity'; // described a different same-named entity
    } else {
      recognitionState = 'recognized'; // described YOUR business
    }
    // A wrong-entity answer is NOT really about you: don't carry its tone/accuracy.
    const wrongEntity = recognitionState === 'wrong-entity';

    return {
      id: acc.provider.id,
      label: acc.provider.label,
      measuredRuns: acc.measuredRuns,
      appearanceRate,
      recommendationRate,
      avgPosition,
      shareOfModel,
      sentiment: wrongEntity ? 'none' : judg ? judg.sentiment : classifySentiment(sentimentTexts),
      accuracy: wrongEntity
        ? { checked: false, correct: null, issues: [] }
        : judg
          ? judgmentToAccuracy(judg)
          : checkAccuracy(brandDesc?.text ?? '', opts?.facts, business),
      recognitionState,
      perQuestion: acc.perQuestion,
    };
  });

  // DISPLAYED competitors: verifiable domains + operator-seeded rivals are always kept;
  // prose-extracted names pass through an elmo-style LLM judge that keeps real company/
  // brand names and drops the phrase-junk ("automation tools", "the bottom line"). This
  // is richer than the old domains-only filter (it keeps genuine prose rivals like
  // "יעל גרופ") while still killing the junk, and it degrades to domains+seeded on
  // failure. The Share-of-Model denominator is computed per-engine above and is
  // unchanged by this display refinement.
  const seededKeys = new Set(seededCompetitors.map((s) => competitorKey(s)));
  const competitorStandings = (
    await refineCompetitorStandings([...standings.values()], business.category, seededKeys)
  )
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
    smallSample: grandTrials > 0 && grandTrials < SMALL_SAMPLE_MIN,
  };

  // Recognition: among engines that ran the "do you know this business?" probe, how many
  // actually described YOUR business. Uses recognitionState so a wrong-entity answer
  // (the engine described a different same-named company) does NOT count as recognition.
  let recTotal = 0;
  let recYes = 0;
  for (const e of engines) {
    if (e.recognitionState === 'not-probed' || e.measuredRuns === 0) continue;
    recTotal += 1;
    if (e.recognitionState === 'recognized') recYes += 1;
  }

  // Raw answers keyed by engine id, for the session to persist (re-processable later).
  const rawAnswers: Record<string, RawEngineData> = {};
  accums.forEach((acc, ei) => {
    const bd = brandDescAnswers[ei];
    rawAnswers[acc.provider.id] = {
      brandDesc: bd ? { text: bd.text, citations: bd.citations } : null,
      questions: rawQuestions[ei],
    };
  });

  return {
    available: true,
    questions,
    runsPerQuestion: runs,
    engines,
    competitorStandings,
    citedSources,
    overallShareOfModel,
    recognition: { recognized: recYes, total: recTotal },
    presence,
    rawAnswers,
  };
}

/** Engine ids that are currently configured (have a key). For cost estimates. */
export function listConfiguredEngineIds(): string[] {
  return ENGINES.filter((p) => p.isConfigured()).map((p) => p.id);
}

/**
 * Merge a prior (partial) result with a fresh one that measured ONLY the engines
 * missing before. Engines union by id (fresh wins); presence, recognition, competitor
 * standings and cited sources are additive (the fresh run touched only NEW engines, so
 * no double counting); the overall share is re-averaged over the measured engines. This
 * lets a report complete across several runs without re-measuring an engine that already
 * returned — the incremental "session".
 */
export function mergeShareOfModel(
  prior: ShareOfModelResult,
  fresh: ShareOfModelResult,
): ShareOfModelResult {
  const byId = new Map(prior.engines.map((e) => [e.id, e]));
  for (const e of fresh.engines) byId.set(e.id, e);
  const engines = [...byId.values()];

  const appearances = prior.presence.appearances + fresh.presence.appearances;
  const trials = prior.presence.trials + fresh.presence.trials;
  const band = wilsonInterval(appearances, trials);

  const recognition = {
    recognized: prior.recognition.recognized + fresh.recognition.recognized,
    total: prior.recognition.total + fresh.recognition.total,
  };

  const stMap = new Map<string, { name: string; count: number }>();
  for (const s of [...prior.competitorStandings, ...fresh.competitorStandings]) {
    const k = competitorKey(s.name);
    const cur = stMap.get(k);
    if (cur) cur.count += s.count;
    else stMap.set(k, { name: s.name, count: s.count });
  }
  const competitorStandings = [...stMap.values()].sort((a, b) => b.count - a.count).slice(0, 10);

  const srcMap = new Map<string, { domain: string; count: number; engines: Set<string> }>();
  for (const s of [...prior.citedSources, ...fresh.citedSources]) {
    const k = s.domain.toLowerCase();
    const cur = srcMap.get(k);
    if (cur) {
      cur.count += s.count;
      for (const e of s.engines) cur.engines.add(e);
    } else {
      srcMap.set(k, { domain: s.domain, count: s.count, engines: new Set(s.engines) });
    }
  }
  const citedSources = [...srcMap.values()]
    .map((s) => ({ domain: s.domain, count: s.count, engines: [...s.engines] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 15);

  const measured = engines.filter((e) => e.measuredRuns > 0);
  const overallShareOfModel =
    measured.length > 0
      ? Math.round((measured.reduce((a, e) => a + e.shareOfModel, 0) / measured.length) * 10) / 10
      : 0;

  return {
    available: engines.length > 0,
    questions: prior.questions.length > 0 ? prior.questions : fresh.questions,
    runsPerQuestion: prior.runsPerQuestion || fresh.runsPerQuestion,
    engines,
    competitorStandings,
    citedSources,
    overallShareOfModel,
    recognition,
    presence: {
      appearances,
      trials,
      rateLow: band.low,
      rateHigh: band.high,
      label: presenceLabel(trials > 0 ? appearances / trials : 0, trials),
      smallSample: trials > 0 && trials < SMALL_SAMPLE_MIN,
    },
    // Raw answers union by engine id (the fresh run measured only new engines).
    rawAnswers: { ...(prior.rawAnswers ?? {}), ...(fresh.rawAnswers ?? {}) },
  };
}
