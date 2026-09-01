---
name: helix-differentiation-analysis
description: Produce a full strategic differentiation analysis for a company from a short intake (what they sell, to whom, market, competitors, their claimed advantages). Runs the MBA strategy model stack — Porter 5+1, strategic-groups map, VRINO, SWOT (מנוף/בטן רכה), Blue Ocean/Four Actions, and a strategy statement (Objective/Scope/Advantage) — and returns a structured, evidence-honest Hebrew analysis. Use for the HELIX free differentiation tool and any "where is our real, non-imitable edge" question.
---

# HELIX Differentiation Analysis

A **wiring + capability** skill. It does not replace the shared strategy skill —
it composes it and adds the specific model stack (from the MBA business-strategy
course) that produces a full Palmidos-Q1-style differentiation analysis.

Follows the STANDING RULE: one skill per capability, shared across products;
compose existing skills before authoring new content.

## Compose these (load together)

| Layer | Skill | Take from it |
|-------|-------|--------------|
| Strategy spine | `business-strategy` | Porter 5 Forces, Blue Ocean/Four Actions, Good-Strategy kernel (diagnosis→policy→actions), framework selection. |
| Competitors | `competitive-intel` | How to map rivals and read positioning. Feeds the strategic-groups map and the "everyone says the same sentence" test. |
| Voice | `helix-brand-voice` (+ Hebrew-native, no em-dash) | Render the whole analysis in authentic Israeli Hebrew. |

## The model stack this skill adds (the MBA course layer)

The differentiation analysis MUST run these, in order, because each feeds the next:

1. **הענף (industry framing)** — name the specific sector/segment the company
   plays in, one sentence. Not "AI", but "פיתוח מערכות AI בהזמנה לעסקים".
2. **Porter 5+1** — entry barriers, rivalry, substitutes, buyer power, supplier
   power (+ complementors). Output the pressure verdict: is this a price-war
   industry (גיהינום אסטרטגי) or a protected one (גן עדן אסטרטגי)?
3. **קבוצות אסטרטגיה (strategic-groups map)** — pick TWO axes that actually
   separate players (e.g. deal size × technical depth). Place the company and its
   real rivals. Name the crowded red-ocean cluster and any empty space.
4. **VRINO** — pass each claimed asset through Value / Rare / Inimitable / Non-
   substitutable / Organized. The point is to expose which "advantages" are
   actually **category table-stakes** (fail Rare/Inimitable) and which one asset
   truly passes. State the single asset that passes, explicitly.
5. **SWOT with integration (מנוף / בטן רכה)** — internal S/W, external O/T, then
   integrate: **מנוף** = a strength meeting an opportunity (where to push);
   **בטן רכה** = a weakness meeting a threat (what will sink deals). Not a flat
   four-quadrant list — the integration is the deliverable.
6. **אוקיינוס כחול (Blue Ocean / Four Actions)** — the uncontested space =
   intersection of a few things few rivals hold together. Eliminate / Reduce /
   Raise / Create.
7. **משפט אסטרטגי (strategy statement)** — one line: Objective (what) × Scope
   (where/who) × Advantage (the non-imitable edge, from VRINO).

## Hard rules (non-negotiable)

1. **The VRINO honesty test is the core value.** Do not flatter the company. If a
   "differentiator" is really a category baseline (e.g. "senior team", "8200
   grads", "agents not chatbots" when every rival says the same), SAY SO and mark
   it failed. The whole analysis is worthless if it rubber-stamps table-stakes as
   an edge. This mirrors the real Palmidos-Q1 finding.
2. **Competitor claims must be verified or labeled.** Per the standing rule
   [[feedback-competitor-verification-touch-source]]: never assert a named
   competitor, its slogan, or a specific fact as verified unless it was fetched
   and quoted. If the user supplied competitors, use them as given (their input).
   Any rival the analysis *suggests* on its own is marked **"לאימות"**, never
   stated as fact. Never invent a competitor, tagline, or number.
3. **Evidence-honest, not confident-sounding.** Separate what the user told us,
   what is a reasonable inference, and what is unknown. A thin-proof company gets
   told its proof is thin.
4. **Native Hebrew, no em-dash, no blacklist/AI-tell words.** Run through
   `helix-brand-voice` / Hebrew-native. Dugri, specific, numbers and proper nouns.
5. **Actionable close.** End with the strategy statement plus 2-3 concrete moves,
   each implying an action someone takes, not vision-speak.

## Intake (the few questions the tool asks the user)

Minimum to run the stack: (1) what you sell / build; (2) who the customer is;
(3) the market/industry in a sentence; (4) up to ~5 competitors you know of;
(5) the advantages you believe you have; (6) deal size / price band (for the
strategic-groups X axis). Propose safe defaults; never block on a missing answer,
mark it as an assumption instead.

## Output shape

A structured analysis with a section per model above, each short and concrete,
ending with the strategy statement and the 2-3 moves. For the tool, return it as
labeled JSON sections so the UI can render each model as its own card. The Critic
pass (see engine) re-checks: no unverified competitor stated as fact, VRINO
actually failed the table-stakes, no em-dash, evidence separated from inference.

## Where this gets used

- **HELIX differentiation free tool** (`/free-tools/differentiation`) — this skill
  is the analytical engine's domain layer.
- Any consulting deliverable needing a fast, honest differentiation read.

## Combine with

- `business-strategy` (spine, loaded above)
- `competitive-intel` (rivals, loaded above)
- `helix-brand-voice` (Hebrew voice, mandatory)
- Sibling: `helix-sales-playbook` (the Q2 sales tool shares the same intake company).
