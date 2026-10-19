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
import type { Provider } from './providers/types';
import { brandAliases, mentionsBrand, extractCompetitors, REFUSAL_RE } from './ai-visibility';

// The three engines we hold keys for. Order matters only for display.
const ENGINES: Provider[] = [claude, openai, gemini];

// Cheapest-first order for the ONE question-generation call. Mirrors the free
// probe: Gemini Flash is cheapest with a real free tier, Claude and OpenAI back it up.
const CHEAPEST_ORDER: Provider[] = [gemini, claude, openai];

// Cost guards: never exceed these regardless of what opts asks for.
const MAX_QUESTIONS = 12;
const MAX_RUNS = 3;
const DEFAULT_QUESTIONS = 8;
const DEFAULT_RUNS = 3;

export interface ShareOfModelEngine {
  id: string;
  label: string;
  /** 0..1 share of questions where the brand appeared in a majority of runs. */
  appearanceRate: number;
  /** 0..1 share of questions where the brand landed in the top 3 in a majority of runs. */
  recommendationRate: number;
  /** Average 1-based position across all appearances (null if never positioned). */
  avgPosition: number | null;
  /** 0..100 share of this engine's total brand mentions captured by the brand. */
  shareOfModel: number;
  perQuestion: Array<{
    question: string;
    appeared: boolean;
    position: number | null;
    topBrands: string[];
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
  /** 0..100, averaged across engines. */
  overallShareOfModel: number;
}

function bareHostOf(host: string): string {
  return host.replace(/^www\./, '');
}

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
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

/** Templated fallback questions when LLM generation fails or returns too few. */
function fallbackQuestions(business: BusinessGuess, count: number): string[] {
  const cat = business.category?.trim() || 'התחום של העסק';
  const loc =
    business.location && business.location !== 'IL' ? business.location.trim() : 'ישראל';
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
): Promise<string[]> {
  if (!provider) return fallbackQuestions(business, count);
  const cat = business.category?.trim() || 'התחום של העסק';
  const loc =
    business.location && business.location !== 'IL' ? business.location.trim() : 'ישראל';
  const prompt =
    `עסק פועל בתחום "${cat}" באזור ${loc}. ` +
    `כתוב ${count} שאלות אמיתיות שלקוח שואל לפני שהוא בוחר ספק או מוצר בתחום הזה. ` +
    `חלק את השאלות לשלושה סוגים: ` +
    `שאלות המלצה (מי מומלץ, מה הכי טוב ל), ` +
    `שאלות השוואה (מה ההבדל בין, מוצר מול מוצר), ` +
    `ושאלות איך בוחרים (איך בוחרים, מה חשוב לבדוק). ` +
    `החזר רשימה ממוספרת של שאלות בלבד, שאלה אחת בכל שורה, בלי כותרות ובלי הסברים. ` +
    `כתוב בעברית טבעית.`;
  const ans = await provider.ask(prompt);
  if (!ans) return fallbackQuestions(business, count);
  const parsed = parseQuestionList(ans.text);
  if (parsed.length < Math.min(3, count)) return fallbackQuestions(business, count);
  if (parsed.length < count) {
    // Top up from the templated set, skipping duplicates.
    const seen = new Set(parsed.map((q) => q.toLowerCase()));
    for (const q of fallbackQuestions(business, count)) {
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
}

function parseAnswer(
  text: string,
  citations: string[],
  bareHost: string,
  aliases: string[],
): RunParse {
  if (REFUSAL_RE.test(text)) {
    return { appeared: false, position: null, competitors: [] };
  }
  const appeared = mentionsBrand(text, citations, aliases);
  const ranked = parseRankedNames(text);
  const position = appeared ? brandPosition(ranked, aliases) : null;
  const competitors = extractCompetitors(text, citations, bareHost, aliases);
  return { appeared, position, competitors };
}

export async function computeShareOfModel(
  business: BusinessGuess,
  host: string,
  opts?: { questions?: number; runs?: number; competitorsSeed?: string[] },
): Promise<ShareOfModelResult> {
  const configured = ENGINES.filter((p) => p.isConfigured());

  const questionCount = clamp(Math.round(opts?.questions ?? DEFAULT_QUESTIONS), 1, MAX_QUESTIONS);
  const runs = clamp(Math.round(opts?.runs ?? DEFAULT_RUNS), 1, MAX_RUNS);

  if (configured.length === 0) {
    // No engine configured: still return the question set for transparency.
    const questions = fallbackQuestions(business, questionCount);
    return {
      available: false,
      questions,
      runsPerQuestion: runs,
      engines: [],
      competitorStandings: [],
      overallShareOfModel: 0,
    };
  }

  const bareHost = bareHostOf(host);
  const aliases = brandAliases(business, host);

  // 1) Question set from the cheapest engine (one call), with templated fallback.
  const questions = await buildQuestionSet(business, cheapestProvider(), questionCount);

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

  // Accumulators per engine.
  interface Accum {
    provider: Provider;
    perQuestion: ShareOfModelEngine['perQuestion'];
    positions: number[]; // all non-null positions across runs, for avgPosition
    appearances: number; // our-brand appearances across all question-runs
    totalMentions: number; // total brand appearances (all brands) across those runs
    appearedQuestions: number; // questions where brand appeared in a majority of runs
    top3Questions: number; // questions where brand in top 3 in a majority of runs
  }
  const accums: Accum[] = configured.map((provider) => ({
    provider,
    perQuestion: [],
    positions: [],
    appearances: 0,
    totalMentions: 0,
    appearedQuestions: 0,
    top3Questions: 0,
  }));

  // 2) Per question SEQUENTIALLY (bounds parallelism); engines x runs in parallel per question.
  for (const question of questions) {
    const perEngineRuns = await Promise.all(
      accums.map((acc) =>
        Promise.all(Array.from({ length: runs }, () => acc.provider.ask(question))),
      ),
    );

    accums.forEach((acc, ei) => {
      const answers = perEngineRuns[ei];
      const parses: RunParse[] = [];
      for (const ans of answers) {
        if (!ans) continue; // failed/null call: skipped, does not count as "did not appear"
        parses.push(parseAnswer(ans.text, ans.citations, bareHost, aliases));
      }

      const measured = parses.length;
      let appearedCount = 0;
      let top3Count = 0;
      const topBrandsSeen = new Map<string, string>(); // lowercase -> display, order-preserving

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
      }

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
      });
    });
  }

  const engines: ShareOfModelEngine[] = accums.map((acc) => {
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
    return {
      id: acc.provider.id,
      label: acc.provider.label,
      appearanceRate,
      recommendationRate,
      avgPosition,
      shareOfModel,
      perQuestion: acc.perQuestion,
    };
  });

  const competitorStandings = [...standings.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const overallShareOfModel =
    engines.length > 0
      ? Math.round(
          (engines.reduce((a, e) => a + e.shareOfModel, 0) / engines.length) * 10,
        ) / 10
      : 0;

  return {
    available: true,
    questions,
    runsPerQuestion: runs,
    engines,
    competitorStandings,
    overallShareOfModel,
  };
}
