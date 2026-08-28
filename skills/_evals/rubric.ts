// ============================================================
// Scoring. Two paths:
//   1. DETERMINISTIC_CHECKS  - pure functions, no network, no LLM.
//      Used wherever a criterion is mechanically checkable
//      (em-dash presence, the paid-ads <50-conversion hold rule,
//      spam triggers, word count, presence of a WCAG citation...).
//   2. buildJudgePrompt(...)  - an LLM-judge prompt for the
//      subjective criteria (tone, "one clear ask", "biggest leak").
// ============================================================

import type { RubricItem } from "./fixtures.ts";

export interface CheckResult {
  /** true = pass, false = fail, null = not applicable / could not decide */
  pass: boolean | null;
  detail: string;
}

export type Detector = (answer: string, task: string) => CheckResult;

const EM_DASH = "—";

const BANNED_AI_TELLS = [
  "unlock",
  "elevate",
  "seamless",
  "game-changer",
  "game changer",
  "cutting-edge",
  "cutting edge",
  "world-class",
  "world class",
  "in today's fast-paced world",
  "in todays fast-paced world",
  "fast-paced world",
  "excited to share",
  "let that sink in",
  "plot twist",
];

/** Windowed percentage extraction near "scale/increase/raise/budget/bump". */
function budgetIncreasePercents(text: string): number[] {
  const out: number[] = [];
  const re = /(scale|increase|raise|bump|grow|up)[^.]{0,40}?(\d{1,3})\s*%/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) out.push(Number(m[2]));
  return out;
}

/** Mentions of doubling / multiplying the budget (e.g. "double", "2x", "3x"). */
function mentionsMultiplyBudget(text: string): boolean {
  return /(double|triple|\b[2-9]\s?x\b|\b[2-9]00\s*%)/i.test(text);
}

export const DETERMINISTIC_CHECKS: Record<string, Detector> = {
  // ---- brand voice ----
  noEmDash: (answer) => {
    const n = (answer.match(/—/g) || []).length;
    return {
      pass: n === 0,
      detail: n === 0 ? "no em-dash found" : `found ${n} em-dash char(s) (${EM_DASH})`,
    };
  },

  noBannedAiTells: (answer) => {
    const lc = answer.toLowerCase();
    const hits = BANNED_AI_TELLS.filter((p) => lc.includes(p));
    return {
      pass: hits.length === 0,
      detail: hits.length === 0 ? "no banned AI-tells" : `banned tells: ${hits.join(", ")}`,
    };
  },

  // ---- paid ads ----
  // Cardinal rule: an ad set under ~50 conversions must be HELD, not acted on.
  paidAdsHold: (answer) => {
    const lc = answer.toLowerCase();
    const holds =
      /(hold|wait for (more )?(volume|data|conversion|traffic)|not enough (data|volume|conversion)|insufficient (data|volume)|change nothing|leave it|don'?t (touch|change)|לחכות|להמתין|אל תיגע)/i
        .test(lc);
    // A concrete proposal to move budget (a number tied to scale/cut) fails the rule.
    const proposesMove =
      /(scale|increase|raise|cut|lower|reduce)[^.]{0,30}?(budget|spend)[^.]{0,20}?\d{1,3}\s*%/i
        .test(lc) || mentionsMultiplyBudget(lc);
    if (holds && !proposesMove) return { pass: true, detail: "recommends hold, proposes no budget move" };
    if (!holds) return { pass: false, detail: "no explicit hold / wait-for-volume recommendation" };
    return { pass: false, detail: "proposes a budget move despite insufficient data" };
  },

  // When there IS enough volume, any increase must be capped at +25% and never a multiply.
  paidAdsMaxScale25: (answer) => {
    if (mentionsMultiplyBudget(answer)) {
      // allow only if it is an explicit refusal ("do not double")
      const refuses = /(don'?t|do not|never|avoid|not).{0,20}(double|triple|\d\s?x|\d00\s*%)/i.test(answer);
      if (!refuses) return { pass: false, detail: "proposes doubling/multiplying the budget" };
    }
    const pcts = budgetIncreasePercents(answer);
    const over = pcts.filter((p) => p > 25);
    if (over.length) return { pass: false, detail: `proposes increase(s) over 25%: ${over.join(", ")}%` };
    if (pcts.length) return { pass: true, detail: `increase(s) within cap: ${pcts.join(", ")}%` };
    return { pass: true, detail: "no over-cap increase and no multiply proposal" };
  },

  // ---- shared significance guard (paid + cro) ----
  mentionsSignificance: (answer) => {
    const ok =
      /(significan|sample size|not enough (data|volume|traffic|conversion)|too (small|early)|insufficient|confidence|volume|~?50 conversion|50 conversions)/i
        .test(answer);
    return { pass: ok, detail: ok ? "acknowledges significance/sample" : "no significance/sample guard" };
  },

  // ---- finance ----
  financeAcknowledgesMissing: (answer) => {
    const ok =
      /(not (provided|given|available|in (the )?(context|data))|missing|isn'?t (provided|available)|do(es)? not have|cannot (compute|calculate|determine)|can'?t (compute|calculate)|need(ed)? (the|more) (data|figures|numbers)|לא סופק|חסר|אין נתונים)/i
        .test(answer);
    return { pass: ok, detail: ok ? "flags missing inputs" : "does not flag the missing inputs" };
  },

  // ---- seo/geo ----
  seoHasTldr: (answer) => {
    const ok = /(TL;?DR|בקצרה|בקיצור|תקציר|bottom line|in short|short answer|התשובה הקצרה)/i.test(answer);
    return { pass: ok, detail: ok ? "has an answer-first TL;DR" : "no answer-first TL;DR" };
  },

  // ---- cold outreach ----
  coldShortEnough: (answer) => {
    const words = (answer.trim().match(/\S+/g) || []).length;
    return { pass: words <= 120, detail: `${words} words (<=120 target)` };
  },

  coldNoSpamTriggers: (answer) => {
    const issues: string[] = [];
    if (/!{3,}/.test(answer)) issues.push("triple+ exclamation");
    const capsWords = (answer.match(/\b[A-Z]{4,}\b/g) || []).filter((w) => w !== "HELIX" && w !== "LinkedIn");
    if (capsWords.length > 1) issues.push(`ALL-CAPS words: ${capsWords.join(", ")}`);
    if (/\bfree\b[^.]{0,30}\bguarantee\b/i.test(answer)) issues.push("free/guarantee stack");
    return { pass: issues.length === 0, detail: issues.length === 0 ? "no spam triggers" : issues.join("; ") };
  },

  // ---- contract ----
  contractMentionsLawyer: (answer) => {
    const ok =
      /(not legal advice|lawyer|legal counsel|attorney|seek legal|consult (a|your) (lawyer|attorney)|עורך[- ]?דין|ייעוץ משפטי|אינו ייעוץ משפטי)/i
        .test(answer);
    return { pass: ok, detail: ok ? "advisory disclaimer / recommends lawyer" : "no advisory disclaimer" };
  },

  contractSeparatesRiskyMissing: (answer) => {
    const hasMissing = /(missing|absent|not present|lacks|no .* clause|should (add|include)|חסר|נעדר)/i.test(answer);
    const hasRisky = /(risk|one-?sided|unbalanced|unfavorable|problematic|too broad|waiv|חד[- ]?צדדי|מסוכן)/i.test(answer);
    if (hasMissing && hasRisky) return { pass: true, detail: "separates risky (present) from missing (absent)" };
    return { pass: false, detail: `risky=${hasRisky} missing=${hasMissing} (needs both)` };
  },

  // ---- accessibility ----
  a11yCitesWcag: (answer) => {
    const ok = /(WCAG|\b\d\.\d(\.\d)?\b|success criterion|ת"?י ?5568|5568)/i.test(answer);
    return { pass: ok, detail: ok ? "cites WCAG/criterion/5568" : "no WCAG criterion cited" };
  },

  a11yContrastRatio: (answer) => {
    const ok = /4\.5\s*:\s*1|4\.5:1|ratio of 4\.5/i.test(answer);
    return { pass: ok, detail: ok ? "states 4.5:1 contrast" : "does not state 4.5:1" };
  },
};

export function isDeterministic(check: string): boolean {
  return check !== "judge" && check in DETERMINISTIC_CHECKS;
}

export function runDeterministic(check: string, answer: string, task: string): CheckResult {
  const fn = DETERMINISTIC_CHECKS[check];
  if (!fn) return { pass: null, detail: `unknown detector "${check}"` };
  try {
    return fn(answer, task);
  } catch (e) {
    return { pass: null, detail: `detector error: ${(e as Error).message}` };
  }
}

/** LLM-judge prompt for the subjective criteria. Returns strict-JSON-only instructions
 *  so the runner can parse a verdict per rubric item. */
export function buildJudgePrompt(task: string, answer: string, rubric: RubricItem[]): string {
  const judged = rubric.filter((r) => r.check === "judge");
  const criteria = judged
    .map((r, i) => `${i + 1}. [id: ${r.id}] ${r.must}`)
    .join("\n");
  return `You are a strict, fair grader. You judge ONLY whether the answer satisfies each criterion. Do not reward verbosity. Be skeptical: fabricated numbers, hedging where a stand is required, or ignoring an instruction all fail.

--- TASK GIVEN TO THE AGENT ---
${task}

--- AGENT ANSWER ---
${answer}

--- CRITERIA TO GRADE ---
${criteria || "(none)"}

For each criterion decide pass (true) or fail (false), with a one-line reason grounded in the answer text.
Respond with STRICT JSON ONLY, no prose, no markdown fence, in this exact shape:
{"results":[{"id":"<criterion id>","pass":true,"reason":"..."}]}`;
}
