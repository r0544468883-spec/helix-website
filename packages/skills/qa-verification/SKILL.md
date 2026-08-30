---
name: qa-verification
description: QA and verification discipline that separates a real defect from a transient one and proves every claim against fresh evidence before acting. Use before claiming work is complete, fixed, or passing, before committing or opening a PR, when validating a fix, running a pre-merge or pre-deploy checklist, deciding whether a failed fetch or link is broken, or planning manual versus automated testing of a feature. Covers the iron law of no completion claims without fresh verification output, transient versus real failure triage (403, 429, 500-503, timeouts), regression checks on the change and its neighbors, least-destructive fixes, and automate-first then user-verify only the visual. Not for planning the code change (use code-review-ship).
---

# QA and Verification

## When to use
- You are about to claim work is done, fixed, passing, or built.
- Before committing, pushing, or opening a PR.
- Validating that a specific fix actually resolved the original symptom.
- Running a pre-merge or pre-deploy gate.
- Deciding whether a failed request, dead link, or missing resource is really broken or just transient.
- Planning how to test a feature: what can be automated versus what a human must eyeball.

Not for: designing the code change itself (use code-review-ship).

## Operative rules (always-on; mirrors the registry entry)
- TRANSIENT vs REAL: 403 / 429 / 500-503 / bot-block / timeout are likely transient. Re-check (retry/backoff) before flagging or removing anything. A single failed fetch is not a broken link. Confirm reproducibility.
- DON'T BREAK GOOD THINGS: never remove/redirect a valid resource. A fix must be safe to apply to a live system. Prefer the least destructive action.
- EVIDENCE STANDARD: every claim needs a citation (the exact snippet/line/number). If a claim cannot be verified, mark it unverified and do NOT pass it. Plausible is not correct.
- REGRESSION: after a change, check the thing you changed AND the neighbor it could affect. State what you verified and what you did not.

## Deep reference (the on-demand layer)

### The iron law
No completion claims without fresh verification evidence. If you have not run the verification command in this exchange, you cannot claim it passes. Confidence is not evidence. "Should work now" is not verification. Different wording ("looks correct", "done", "great") that implies success is still a claim and still needs the evidence.

### The gate function (run before any status claim)
1. IDENTIFY: what command or observation proves this claim?
2. RUN: execute the full command, fresh and complete (not a partial run, not a previous run).
3. READ: the full output, the exit code, count the failures.
4. VERIFY: does the output actually confirm the claim? If no, state the real status with evidence. If yes, state the claim with the evidence attached.
5. ONLY THEN make the claim.
Skipping any step is claiming without verifying.

### Claim-to-evidence table
| Claim | Requires | Not sufficient |
|-------|----------|----------------|
| Tests pass | Test output: 0 failures, count shown | A previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check, extrapolation |
| Build succeeds | Build command: exit 0 | Linter passing, "logs look fine" |
| Bug fixed | Original symptom re-tested: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent finished | VCS diff shows the changes | The agent reported success |
| Requirements met | Line-by-line checklist against the plan | Tests passing |

### Regression test proof (red-green)
A regression test is only proven when: write it, run it (passes), revert the fix, run it (it MUST fail), restore the fix, run it (passes). A test that passes once, without seeing it fail on the unfixed code, proves nothing.

### Transient vs real failure triage
Do not act on a single failure. HTTP 403, 429, 500-503, bot-blocks, and timeouts are usually transient. Before flagging a link dead or removing a resource:
1. Re-check with a short backoff (a couple of retries).
2. Confirm the failure reproduces consistently, not once.
3. Distinguish "the resource is gone" (real) from "the fetch failed this instant" (transient).
A confident-but-wrong removal of a valid resource is worse than leaving a flaky check unresolved. When unsure, mark unverified and do not act.

### Least-destructive fix
Any fix must be safe to apply to a live system. Never remove or redirect a valid resource to "clean up". Prefer the reversible action. If a link looks broken, fixing the link beats deleting it; deleting beats a broad redirect that could catch valid URLs.

### Regression scope: the change and its neighbor
After a change, verify two things: the thing you changed works, and the adjacent thing it could have affected still works. State explicitly what you verified and what you did not (do not imply full coverage from a partial check). For PLUG this includes cross-project neighbors: a change to a shared Supabase table (profiles, applications, jobs) can break the extension even when the web app looks fine.

### Automate first, ask the human only for the visual
Automate everything verifiable by tool. Ask a human only for what tools genuinely cannot see.

Claude CAN verify automatically: build/compile, tests, lint/typecheck, API responses (curl), file contents (read/grep), server starts and endpoints respond, database state (query), log output, exit codes, port availability, config/JSON validity, git state.

Claude CANNOT verify (ask the user): visual appearance (color, layout, spacing, alignment), animation and transition feel, UX responsiveness, cross-browser rendering, real mobile-device behavior, third-party UIs (OAuth, payment forms), actual screen-reader behavior, perceived performance.

Method: run all automatable checks first and report pass/fail as you go. If an automated check fails, stop and fix before asking the user anything. Then present each manual step as: Action (what to do), Expected (what a correct result looks like), and offer the likely outcomes (success first, then common failure modes).

### Pre-merge / pre-deploy phases (blocking unless noted)
1. Build verification: typecheck (tsc --noEmit) then production build. Any error stops the gate.
2. Test suite: unit tests green; end-to-end for critical flows where present.
3. No-touch zones: confirm protected paths (auth, core business logic, production config) were not modified without explicit approval.
4. Region/environment (deploy only): correct target/region/env; after deploy, health endpoint returns 200.
5. Security (warning level): no secrets committed, no new untyped `any` without a documented reason, no new high/critical dependency vulnerabilities.
6. Report: a short table of each check with PASS/FAIL and a verdict of APPROVED or REJECTED with the specific issues to fix.
Loop at most a few iterations; if still failing, escalate to a human rather than forcing it through.

## Anti-patterns / common mistakes
- "Should pass now" / "looks correct" without running the command.
- Reusing a previous run's output as evidence for the current state.
- A partial check extrapolated to the whole ("some tests pass" claimed as "tests pass").
- Trusting an agent's success report without checking the diff.
- Calling a link dead or removing a resource after a single failed fetch.
- A destructive cleanup (delete/redirect) applied to a possibly-valid resource.
- Verifying only the changed line and implying the neighbor is fine.
- Asking the user to verify something a tool could have checked.
- Expressing satisfaction ("Perfect!", "Done!") before the verification ran.

## Checklist before returning
- Every completion/pass/fixed claim has fresh output cited (command, exit code, counts).
- No claim rests on a previous run, a partial check, or an agent's word alone.
- Any failed fetch/link/resource was re-checked with backoff and confirmed reproducible before being flagged; nothing valid was removed.
- The fix is the least-destructive, live-safe option.
- Both the change and its affected neighbor were checked; coverage stated honestly (verified vs not).
- Regression tests proven red-green, not just green-once.
- Automated checks run first; only genuinely visual/experiential items handed to the user.

## Sources
- verification-before-completion (installed at helix/.agents/skills/): the iron law, gate function, claim-to-evidence table, red-green regression proof, rationalization prevention.
- qa-checklist (installed at ~/.claude/skills/): the 6-phase pre-merge/pre-deploy gate (build, tests, no-touch zones, region, security, report).
- manual-testing (installed at ~/.claude/skills/): automate-first classification, what Claude can vs cannot verify, sequential user-verification steps.
- Registry operative entry "qa-verification" (ai-kit/skills/registry.ts): transient vs real, least-destructive fix, evidence standard, regression scope.
