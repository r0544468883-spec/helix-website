# HELIX Skill Library

The single source of truth for HELIX agent capabilities. Every LLM-calling agent across every product loads its domain knowledge from here, not from a prompt duplicated per product (see the STANDING RULE in `helix/CLAUDE.md`).

## Three layers (progressive disclosure)

| Layer | What | Where | When loaded |
|---|---|---|---|
| **1. Operative** | Short always-on rules injected into every agent's system prompt | `_shared/ai-kit/skills/registry.ts` (canonical) + a vendored copy `lib/skills/registry.ts` in each product repo | Always (cheap, ~15-30 lines/skill) |
| **2. Reference** | The full deep `SKILL.md` per capability: decision tables, formulas, worked examples, edge cases | `<skill-name>/SKILL.md` here (+ `references/*.md` overflow) | On demand, via `loader.ts`, only when the agent needs more than Layer 1 |
| **3. Executable** | Deterministic checkers the agent runs instead of guessing | `_scripts/*.ts` | Called as a tool for a hard check |

Layer 1 is what ships to production runtimes today. Layers 2 and 3 are for filesystem-capable environments (dev, a server-side agent with Read, or the Skills-API sandbox), and are the upgrade path.

## The 16 capability skills

Cross-cutting: `helix-brand-voice`, `helix-data-schema`.
Domain: `finance-metrics`, `paid-ads`, `cro-conversion`, `competitive-intel`, `business-strategy`, `project-orchestration`, `code-review-ship`, `qa-verification`, `comms-storytelling`, `ecommerce-sell`, `seo-geo-pack`, `cold-outreach-copy`, `social-engagement`, `contract-legal`, `accessibility-a11y`.

Which agent loads which skill: `helix/PRODUCTS/HELIX-AGENT-SKILLS-MAP.md`. How to wire: `helix/PRODUCTS/HELIX-SKILLS-WIRING-CHECKLIST.md`.

## Executable scripts (`_scripts/`)

Pure, dependency-free TypeScript, runnable under Deno. `deno test --config _scripts/deno.json _scripts/`.

| Script | For skill(s) | Does |
|---|---|---|
| `brand-voice-lint.ts` | helix-brand-voice | catches em-dash + banned AI-tells, returns violations |
| `spam-check.ts` | cold-outreach-copy, social-engagement | scores spam/deliverability risk |
| `finance-calc.ts` | finance-metrics | NRR, LTV, CAC payback, ratio, alerts |
| `paid-ads-significance.ts` | paid-ads | significance gate + decision-table action |
| `seo-schema-validate.ts` | seo-geo-pack | validates JSON-LD + scores GEO citability |
| `a11y-static-check.ts` | accessibility-a11y | static WCAG 2.2 issues from HTML |
| `text-readability.ts` | comms-storytelling | sentence length / burstiness (HE + EN) |

## Evals (`_evals/`)

Measures whether a skill actually improves output (agent-with-skill vs without). `deno run -A _evals/run-eval.ts` is an offline dry run; set `CLAUDE_API_KEY` for a live scored run. Add cases in `_evals/fixtures.ts`. See `_evals/README.md`.

## Loader (`loader.ts`)

Progressive disclosure over Layer 2/3. `deno run --allow-read loader.ts` lists skills; `... loader.ts <skill>` prints its SKILL.md; `... loader.ts <skill> "<heading>"` prints one section (e.g. a decision table) so an agent discloses only what it needs.

## Sync discipline

The Layer-1 registry is a **vendored copy** in each product repo (repos cannot import across each other). Canonical = `_shared/ai-kit/skills/registry.ts`. When it changes, re-copy it to every repo's `lib/skills/registry.ts`. Layer 2/3 live only here and are pulled on demand, so they need no per-repo copy.
