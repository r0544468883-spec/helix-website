---
name: competitive-intel
description: Internal competitive intelligence and account/lead qualification for Israeli SMB products. Use when tracking a competitor move (positioning, pricing, packaging, feature, go-to-market, hiring), separating a real strategy shift from noise, turning a competitor fact into a concrete decision for the roadmap or go-to-market, mapping the competitive landscape by jobs-to-be-done rather than feature counts, or scoring how well a lead or account fits the workspace ICP before spending outreach effort. Analysis is internal only; customer-facing copy never criticizes a competitor.
---

# Competitive Intel

## When to use
Use this for internal-only competitive work: logging and interpreting a rival's move, deciding whether it forces a response, building a jobs-based competitive map, or scoring a lead/account against the ICP before investing in it. It powers the intel agent that watches competitors and qualifies accounts. Hard boundary: this is INTERNAL analysis. Public-facing copy must never name or criticize a competitor (that is a brand-voice rule).

## Operative rules (always-on; mirrors the registry entry)
- For each competitor move record: what changed, evidence/source, why it matters to us, the decision it forces. Every insight ENDS in a concrete "so what" for our roadmap or GTM, else drop it.
- Signal vs noise: a blog post is not a strategy shift. Weight by durability (pricing/packaging changes outrank one-off content). Mark anything inferred as an inference; never fabricate a competitor fact.
- Output threats (what could hurt us and how soon) and openings (gaps we can take), each tied to an owner agent.
- ICP-fit scoring (qualifying a lead/account): score 0-100 against the workspace ICP on firmographics (size, industry, geo), fit-to-offer, and buying signals. Below threshold = do not spend outreach effort. State the top 1-2 reasons for the score.
- A confident-but-unqualified account is worse than an obvious miss.

## Deep reference (the on-demand layer)

### Move-tracking record (the atomic unit)
For every competitor move capture five fields:
1. What changed (specific, not "they updated their site").
2. Evidence / source (link, screenshot, pricing page, job post) and date.
3. Durability weight (see below).
4. Why it matters to us (the mechanism of threat or opening).
5. Decision it forces (owner + timeframe). If there is no decision, the item is noise, drop it.

### Durability weighting: signal vs noise
| Move type | Weight | Why |
|---|---|---|
| Pricing / packaging change | High | Reflects unit-economics and positioning commitment |
| New core feature shipped (not announced) | High | Real investment, hard to reverse |
| Go-to-market / channel shift, key exec hire | Medium-high | Direction change, slower to read |
| Repeated hiring in one function | Medium | Reveals where they are betting |
| A single blog post, webinar, award | Low | Marketing motion, not strategy |
| A roadmap promise / "coming soon" | Low until shipped | Announcements are cheap |
Rule: never treat a Low-durability move as a strategy shift. Aggregate Low signals; act on High ones.

### Landscape mapping by jobs-to-be-done (not feature counts)
Competitors are defined by the job customers hire them for, not by the analyst category. Discipline:
- Substitution evidence test: only call something a competitor if you have evidence customers actually switch to/from it for the same job. "Same category label" is not evidence.
- Direct (same solution, same job), indirect (different solution, same job), potential (adjacent, one release away).
- Compare on depth tiers (minimal -> basic -> advanced -> best-in-class), not on has/does-not-have. A product with 50 deep features beats one with 200 shallow ones.
- Feature prevalence: what share of competitors have a feature? Classify Must-Match / Should-Match / Opportunity / Ignore / Watch. Table stakes must be matched; differentiators are where you fight.
- Gaps are not automatically opportunities. A feature no one has may be a graveyard (someone tried and it failed). Validate demand before chasing a gap.

### Moats: is an advantage defensible?
When judging a threat or your own position, weigh sustainability: network effects, switching costs (data lock-in, integration, learning curve), brand, cost/scale advantage, regulatory (licenses, compliance). An advantage a competitor can copy in a quarter is not a moat and should not anchor strategy.

### Threats and openings output
- Threat = a competitor capability or move that could take our revenue or block our growth. Rate by severity and time-to-impact (now / this quarter / this year).
- Opening = an unserved job, a segment the leaders ignore, or a gap validated by demand. Tie each to an owner agent and a next action.

### ICP-fit scoring (lead/account qualification)
Score 0-100 across three dimensions, then state the top 1-2 drivers:
- Firmographics (size, industry, geo, stage): does the account look like our best customers?
- Fit-to-offer: does our product solve a job they demonstrably have?
- Buying signals: hiring, tech adoption, funding, a trigger event, inbound interest.
Below the workspace threshold, do not spend outreach. A high score with weak evidence is a trap; note the evidence quality. Israeli SMB context: size bands and industry mix differ from US benchmarks, calibrate to the workspace's actual won-deal profile, not generic ICP templates.

### Worked example
Move: Competitor X moved its cheapest plan from ₪99 to ₪149/mo and dropped the free tier.
Record: pricing + packaging change (High durability), evidence = their pricing page dated this week.
Why it matters: they are abandoning the low end; price-sensitive SMBs they served are now unhappy and shoppable.
Decision it forces: GTM agent tests a "switchers" landing angle for that segment this quarter; product confirms our entry tier covers the job those users came for. Opening, medium severity, this-quarter timeframe, owner = GTM.

## Anti-patterns / common mistakes
- Insight with no "so what". If it does not force a decision, it is trivia.
- Treating a blog post or a "coming soon" as a strategy shift.
- Feature counting as a proxy for quality; ignoring depth.
- Assuming category-mates are competitors without substitution evidence.
- Chasing every gap as an opportunity (graveyard risk).
- Fabricating or over-confidently stating an inferred competitor fact. Mark inferences.
- Spending outreach on a below-threshold account because it "feels" reachable.
- Leaking internal competitor criticism into customer-facing copy.

## Checklist before returning
- Every competitor move has evidence, a durability weight, and a forced decision with an owner.
- Inferences are labeled as inferences; no fabricated facts.
- Landscape claims rest on jobs + substitution evidence, not category labels or feature counts.
- ICP scores state the top 1-2 reasons and respect the workspace threshold.
- Threats carry severity + time-to-impact; openings carry an owner + next action.
- Nothing here is phrased for external publication.

## Sources
Distilled from the installed skills `strategy-and-competitive-analysis` (Porter's 5 Forces, moats, competitor profiling, evidence guardrails) and `product-analysis` (jobs-to-be-done boundaries, substitution-evidence test, depth tiers, feature prevalence, graveyard-gap warning, build/buy anti-patterns). The `competitive-analyst` agent is an agent definition, not an installed skill, so no SKILL.md was available there. Registry entry: `competitive-intel` in `_shared/ai-kit/skills/registry.ts`.
