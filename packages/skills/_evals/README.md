# HELIX skill eval harness

Measures whether a HELIX skill actually improves an agent's output, by
comparing the same agent **with the skill** against **without the skill**
on a fixed set of tasks and rubrics.

For each fixture the runner builds two system-prompt variants:

- **baseline**: a generic agent prompt, no skill.
- **skilled**: `withSkills(baseline, [case.skill])`, the exact same helper the
  production edge functions use, so the only difference is the injected skill body.

It then scores both answers against the case rubric. Wherever a criterion is
mechanically checkable it is scored by a **deterministic detector** (no LLM);
the subjective criteria are scored by an **LLM judge**. The "lift" is the
skilled pass-rate minus the baseline pass-rate.

## Files

- `registry.ts` - vendored copy of `SKILL_REGISTRY` + `withSkills` (source of
  truth: `plug-nexus-ai-main/supabase/functions/_shared/ai-kit/skills/registry.ts`).
  Self-contained so the eval runs offline.
- `fixtures.ts` - the eval cases (at least 2 per skill).
- `rubric.ts` - `DETERMINISTIC_CHECKS` (pure detectors) + `buildJudgePrompt`.
- `run-eval.ts` - the runner (dry run offline, live with an API key).

## Run

Deno is at `C:\Users\User\.deno\bin\deno.exe`.

### Dry run (offline, no network)

```
deno run -A run-eval.ts
```

Prints, for every fixture, the baseline and skilled system prompts and labels
each rubric check as `deterministic:<key>` or `judge`. Touches no network.

### Live run (measures the lift)

Set an Anthropic API key and re-run:

```
CLAUDE_API_KEY=sk-ant-... deno run -A run-eval.ts
```

PowerShell:

```
$env:CLAUDE_API_KEY = "sk-ant-..."; & "$env:USERPROFILE\.deno\bin\deno.exe" run -A run-eval.ts
```

Optional env overrides:

- `CLAUDE_MODEL` (default `claude-sonnet-4-5`) - model used to generate answers.
- `CLAUDE_JUDGE_MODEL` (default = `CLAUDE_MODEL`) - model used for the LLM judge.
- `ANTHROPIC_API_KEY` is accepted as an alias for `CLAUDE_API_KEY`.

Live output shows per-case `baseline x/y` vs `skilled x/y`, a per-criterion
`PASS/FAIL -> PASS/FAIL` transition, and a mean lift across all cases.

## Add a fixture

1. Open `fixtures.ts` and push a new object to `FIXTURES`:

   ```ts
   {
     id: "my-skill-3-something",     // unique
     skill: "cro-conversion",        // a SkillName present in registry.ts
     task: "the exact user input the agent receives",
     rubric: [
       { id: "crit-a", must: "what a GOOD answer must do", check: "mentionsSignificance" }, // deterministic
       { id: "crit-b", must: "the subjective thing to grade", check: "judge" },              // LLM judge
     ],
   }
   ```

2. `check` is either `"judge"` or the KEY of a detector in `DETERMINISTIC_CHECKS`
   (`rubric.ts`). Prefer a deterministic check whenever the criterion is
   mechanically checkable (a forbidden phrase, a numeric rule, a required token).

3. To add a NEW deterministic detector, add an entry to `DETERMINISTIC_CHECKS`
   in `rubric.ts`. A detector is `(answer, task) => { pass: boolean | null, detail: string }`
   where `pass: null` means "not applicable / could not decide" (excluded from the
   pass-rate denominator).

4. Write the task so the skill, if it works, visibly changes the answer on the
   checkable criteria (that is what the eval is measuring).

## Notes

- No em-dash anywhere in this harness, per HELIX brand rules.
- All network is guarded behind the API-key check, so the dry run is fully offline.
- `registry.ts` is a vendored copy. When the source registry changes, re-copy the
  affected skill bodies here and keep `withSkills` identical.
