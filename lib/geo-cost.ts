// Pre-flight cost estimate for a Share-of-Model run, adopted (clean-room) from
// Saylent's dry-run / --max-usd idea: show what a run will cost BEFORE spending a
// cent, and let the caller refuse to run above a hard dollar cap.
//
// These are deliberately rough per-call bands (web-search-enabled calls, variable
// token counts), labeled as an ESTIMATE everywhere they surface. The point is a
// safe ceiling and a no-surprises number, not accounting precision.

/** Rough USD cost of ONE web-search answer call, per engine. [low, high]. */
const PER_CALL_USD: Record<string, { low: number; high: number }> = {
  claude: { low: 0.03, high: 0.06 },
  openai: { low: 0.03, high: 0.06 },
  gemini: { low: 0.01, high: 0.025 },
  perplexity: { low: 0.015, high: 0.035 },
  // Google AI Overview via a SERP API: priced per search, not per token.
  'google-aio': { low: 0.01, high: 0.02 },
};

// Fallback band for an engine we don't have a row for.
const DEFAULT_CALL = { low: 0.02, high: 0.05 };

export interface CostEstimate {
  /** Engines included in the estimate. */
  engineIds: string[];
  questionCount: number;
  runs: number;
  /** Number of answer passages to auto-draft (0 when the feature is off). */
  draftPassages: number;
  /** Total number of model calls the run will make. */
  calls: number;
  lowUsd: number;
  highUsd: number;
}

/**
 * Estimate the cost of a Share-of-Model run.
 *
 * Call budget mirrors computeShareOfModel exactly:
 *   1 question-generation call (cheapest engine)
 * + 1 brand-description call per engine
 * + questionCount × engines × runs answer calls
 * + draftPassages answer-drafting calls (cheapest engine), when the feature is on.
 */
export function estimateShareOfModelCost(args: {
  engineIds: string[];
  questionCount: number;
  runs: number;
  /** Answer passages to auto-draft, each one cheapest-engine call. Default 0 (off). */
  draftPassages?: number;
}): CostEstimate {
  const engineIds = args.engineIds.filter(Boolean);
  const nEngines = engineIds.length;
  const questionCount = Math.max(0, Math.round(args.questionCount));
  const runs = Math.max(1, Math.round(args.runs));
  const draftPassages = Math.max(0, Math.round(args.draftPassages ?? 0));

  // Single-run engines (SERP-backed, e.g. Google AI Overview) do 1 run per question
  // instead of `runs`. Mirror lib/share-of-model's SINGLE_RUN_ENGINE_IDS.
  const runsForId = (id: string) => (id === 'google-aio' ? 1 : runs);

  const answerCalls = engineIds.reduce((sum, id) => sum + questionCount * runsForId(id), 0);
  const brandDescCalls = nEngines;
  const questionGenCalls = nEngines > 0 ? 1 : 0;
  const draftCalls = nEngines > 0 ? draftPassages : 0;
  const calls = answerCalls + brandDescCalls + questionGenCalls + draftCalls;

  const band = (id: string) => PER_CALL_USD[id] ?? DEFAULT_CALL;

  // Answer + brand-desc calls are per-engine; question-gen uses the cheapest engine.
  let low = 0;
  let high = 0;
  for (const id of engineIds) {
    const b = band(id);
    const perEngineCalls = questionCount * runsForId(id) + 1; // answers + 1 brand-desc
    low += b.low * perEngineCalls;
    high += b.high * perEngineCalls;
  }
  // Question-generation and answer-drafting both run on the cheapest engine.
  if (nEngines > 0) {
    const cheapest = engineIds
      .map((id) => band(id))
      .reduce((a, b) => (b.low < a.low ? b : a), { low: Infinity, high: Infinity });
    if (questionGenCalls > 0) {
      low += cheapest.low;
      high += cheapest.high;
    }
    if (draftCalls > 0) {
      low += cheapest.low * draftCalls;
      high += cheapest.high * draftCalls;
    }
  }

  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    engineIds,
    questionCount,
    runs,
    draftPassages,
    calls,
    lowUsd: round(low),
    highUsd: round(high),
  };
}
