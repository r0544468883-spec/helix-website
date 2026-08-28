// ============================================================
// Eval runner (Deno).
//
//   deno run -A run-eval.ts            -> DRY RUN (offline)
//   CLAUDE_API_KEY=sk-... deno run -A run-eval.ts   -> LIVE
//
// For every fixture it builds two agent prompt variants:
//   baseline = generic agent system prompt, NO skill
//   skilled  = withSkills(baseline, [case.skill])
// DRY RUN prints both prompts and labels each rubric check as
// deterministic or judge, and touches no network.
// LIVE (only when an API key env var is present) calls the model
// for both variants, scores each with the deterministic detectors
// and the LLM judge, and reports the with-skill vs no-skill lift.
//
// No em-dash anywhere in this file, per HELIX rules.
// ============================================================

import { FIXTURES, type EvalCase, type RubricItem } from "./fixtures.ts";
import { withSkills } from "./registry.ts";
import {
  buildJudgePrompt,
  isDeterministic,
  runDeterministic,
  type CheckResult,
} from "./rubric.ts";

// Generic agent system prompt (the "without skill" baseline). Deliberately
// plain so the skill body is the only difference between the two variants.
const BASE_AGENT_PROMPT =
  "You are a HELIX AI agent helping an Israeli SMB. Answer the user task directly, concisely, and usefully. If the task is in Hebrew, answer in Hebrew.";

const API_KEY = Deno.env.get("CLAUDE_API_KEY") ?? Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const MODEL = Deno.env.get("CLAUDE_MODEL") ?? "claude-sonnet-5";
const JUDGE_MODEL = Deno.env.get("CLAUDE_JUDGE_MODEL") ?? MODEL;

interface ItemScore {
  id: string;
  must: string;
  kind: "deterministic" | "judge";
  result: CheckResult;
}

interface VariantScore {
  variant: "baseline" | "skilled";
  answer: string;
  items: ItemScore[];
  passed: number;
  applicable: number;
  ratio: number;
}

// ---------------------------------------------------------------
// Network (LIVE only). Everything below the API_KEY guard is dead
// code in a dry run, so the harness never touches the network offline.
// ---------------------------------------------------------------
async function callModel(system: string, user: string, model: string): Promise<string> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`model call failed ${resp.status}: ${txt.slice(0, 300)}`);
  }
  const data = await resp.json();
  const parts = (data.content ?? []) as Array<{ type: string; text?: string }>;
  return parts.filter((p) => p.type === "text").map((p) => p.text ?? "").join("").trim();
}

async function judge(
  task: string,
  answer: string,
  rubric: RubricItem[],
): Promise<Record<string, CheckResult>> {
  const judged = rubric.filter((r) => r.check === "judge");
  if (!judged.length) return {};
  const prompt = buildJudgePrompt(task, answer, rubric);
  const raw = await callModel("You are a strict grader. Output strict JSON only.", prompt, JUDGE_MODEL);
  const out: Record<string, CheckResult> = {};
  try {
    const jsonStr = raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1);
    const parsed = JSON.parse(jsonStr) as { results: Array<{ id: string; pass: boolean; reason: string }> };
    for (const r of parsed.results ?? []) {
      out[r.id] = { pass: Boolean(r.pass), detail: r.reason ?? "" };
    }
  } catch (e) {
    for (const r of judged) out[r.id] = { pass: null, detail: `judge parse error: ${(e as Error).message}` };
  }
  // fill any the judge omitted
  for (const r of judged) if (!(r.id in out)) out[r.id] = { pass: null, detail: "judge returned no verdict" };
  return out;
}

async function scoreVariant(
  variant: "baseline" | "skilled",
  system: string,
  kase: EvalCase,
): Promise<VariantScore> {
  const answer = await callModel(system, kase.task, MODEL);
  const judgeResults = await judge(kase.task, answer, kase.rubric);
  const items: ItemScore[] = kase.rubric.map((r) => {
    if (isDeterministic(r.check)) {
      return { id: r.id, must: r.must, kind: "deterministic", result: runDeterministic(r.check, answer, kase.task) };
    }
    return { id: r.id, must: r.must, kind: "judge", result: judgeResults[r.id] ?? { pass: null, detail: "no verdict" } };
  });
  const applicable = items.filter((it) => it.result.pass !== null).length;
  const passed = items.filter((it) => it.result.pass === true).length;
  return { variant, answer, items, passed, applicable, ratio: applicable ? passed / applicable : 0 };
}

// ---------------------------------------------------------------
// Dry run (offline): prints prompts and check taxonomy only.
// ---------------------------------------------------------------
function dryRun(): void {
  const skills = new Set(FIXTURES.map((f) => f.skill));
  console.log("=== HELIX skill eval harness ===");
  console.log("mode: DRY RUN (no CLAUDE_API_KEY / ANTHROPIC_API_KEY set) - offline, no network");
  console.log(`fixtures: ${FIXTURES.length} cases across ${skills.size} skills`);
  console.log(`model (would use when live): ${MODEL}`);
  console.log("");

  let detTotal = 0;
  let judgeTotal = 0;

  for (const kase of FIXTURES) {
    const baseline = BASE_AGENT_PROMPT;
    const skilled = withSkills(BASE_AGENT_PROMPT, [kase.skill]);
    const det = kase.rubric.filter((r) => isDeterministic(r.check));
    const jud = kase.rubric.filter((r) => !isDeterministic(r.check));
    detTotal += det.length;
    judgeTotal += jud.length;

    console.log(`--- [${kase.id}] skill=${kase.skill} ---`);
    console.log(`task: ${kase.task}`);
    console.log(`baseline system prompt (${baseline.length} chars):`);
    console.log(indent(baseline));
    console.log(`skilled system prompt (${skilled.length} chars, +${skilled.length - baseline.length} from skill):`);
    console.log(indent(skilled));
    console.log(`rubric: ${det.length} deterministic, ${jud.length} judge`);
    for (const r of kase.rubric) {
      const kind = isDeterministic(r.check) ? `deterministic:${r.check}` : "judge";
      console.log(`  - [${kind}] ${r.id}: ${r.must}`);
    }
    console.log("");
  }

  console.log("=== dry-run summary ===");
  console.log(`cases: ${FIXTURES.length}`);
  console.log(`rubric checks: ${detTotal + judgeTotal} total, ${detTotal} deterministic, ${judgeTotal} judge`);
  console.log("set CLAUDE_API_KEY to run live and measure with-skill vs no-skill lift.");
}

function indent(s: string): string {
  return s.split("\n").map((l) => "    " + l).join("\n");
}

// ---------------------------------------------------------------
// Live run: measures baseline vs skilled.
// ---------------------------------------------------------------
async function liveRun(): Promise<void> {
  console.log("=== HELIX skill eval harness ===");
  console.log(`mode: LIVE (model=${MODEL}, judge=${JUDGE_MODEL})`);
  console.log(`fixtures: ${FIXTURES.length} cases`);
  console.log("");

  let sumBaseline = 0;
  let sumSkilled = 0;

  for (const kase of FIXTURES) {
    const baseline = await scoreVariant("baseline", BASE_AGENT_PROMPT, kase);
    const skilled = await scoreVariant("skilled", withSkills(BASE_AGENT_PROMPT, [kase.skill]), kase);
    sumBaseline += baseline.ratio;
    sumSkilled += skilled.ratio;

    const lift = skilled.ratio - baseline.ratio;
    const arrow = lift > 0 ? "UP" : lift < 0 ? "DOWN" : "flat";
    console.log(`--- [${kase.id}] skill=${kase.skill} ---`);
    console.log(
      `  baseline: ${baseline.passed}/${baseline.applicable} (${pct(baseline.ratio)})   ` +
        `skilled: ${skilled.passed}/${skilled.applicable} (${pct(skilled.ratio)})   ` +
        `lift: ${arrow} ${pct(lift)}`,
    );
    for (const r of kase.rubric) {
      const b = baseline.items.find((x) => x.id === r.id)!;
      const s = skilled.items.find((x) => x.id === r.id)!;
      console.log(`    ${mark(b.result.pass)} -> ${mark(s.result.pass)}  [${b.kind}] ${r.id}: ${s.result.detail}`);
    }
    console.log("");
  }

  const n = FIXTURES.length;
  console.log("=== live summary ===");
  console.log(`mean baseline pass-rate: ${pct(sumBaseline / n)}`);
  console.log(`mean skilled  pass-rate: ${pct(sumSkilled / n)}`);
  console.log(`mean lift from skill:    ${pct((sumSkilled - sumBaseline) / n)}`);
}

function pct(x: number): string {
  return `${Math.round(x * 100)}%`;
}
function mark(p: boolean | null): string {
  return p === true ? "PASS" : p === false ? "FAIL" : "n/a ";
}

// ---------------------------------------------------------------
if (import.meta.main) {
  if (!API_KEY) {
    dryRun();
  } else {
    await liveRun();
  }
}
