---
name: business-strategy
description: CEO-level strategy and growth-loop design for Israeli SMB products. Use when deciding where to push next from a brief and current KPIs, setting short-term goals tied to measurable numbers, prioritizing a small set of high-leverage bets with owners and success metrics, naming the assumption each bet rests on and how to invalidate it cheaply, choosing frameworks for market entry, positioning, competitive response, or portfolio calls, or designing a product-native growth loop (viral, usage, collaboration, user-generated, referral) to reduce reliance on paid acquisition.
---

# Business Strategy

## When to use
Use this to turn a brief plus current KPIs into a decision about where to focus: short-term goals, the one or two numbers that matter this cycle, a few prioritized bets, and the risks. Also use it to pick a strategy framework (Good Strategy kernel, Porter, Blue Ocean, Playing to Win, BCG) or to design a growth loop. It powers the strategy agent. It stops at the decision; execution planning belongs to the orchestration skill.

## Operative rules (always-on; mirrors the registry entry)
- Output: (1) 1-3 short-term goals, each tied to a KPI you can actually see; (2) the KPI focus (the 1-2 numbers that matter this cycle); (3) 2-3 prioritized bets, each with an owner agent/department and a success metric; (4) explicit risks.
- Prefer 2-3 sharp, high-leverage bets over a long wish list.
- Ground every goal in a provided KPI. Do not set goals for metrics you cannot measure.
- Size bets by impact x confidence x ease and sequence them (dependencies first).
- Name the assumption each bet rests on and how you would invalidate it cheaply.
- Distinguish a growth bet from a survival/defensive one.
- No vision-speak: every line implies an action someone takes this cycle.

## Deep reference (the on-demand layer)

### The spine: Good Strategy kernel (Rumelt)
Every strategy reduces to three parts, in order:
1. Diagnosis: name the actual challenge, specifically. Not "we need to grow" but "CAC exceeds LTV in our current segment because we compete on commoditized features."
2. Guiding policy: the overall approach to that challenge. Not "be customer-focused" but "vertical specialization in healthcare + product-led growth."
3. Coherent actions: 3-5 specific, mutually reinforcing steps with owners and timelines. Actions must reinforce each other and serve the guiding policy, which must address the diagnosis. If any action does not, it is a distraction.

### Framework selection
| Situation | Framework(s) |
|---|---|
| Overall strategy formulation / turnaround | Good Strategy kernel (diagnosis is the whole game) |
| Assess industry attractiveness | Porter's 5 Forces (rivalry, new entrants, substitutes, buyer power, supplier power) |
| Find uncontested space | Blue Ocean + Four Actions (Eliminate / Reduce / Raise / Create) |
| Make choices explicit | Playing to Win (where to play, how to win) |
| Compare options | SWOT per option + a weighted decision matrix |
| Portfolio / resource allocation | BCG matrix (Stars invest, Cash Cows harvest, Question Marks selective, Dogs divest) |
| Market entry mode | Export / License / JV / Acquisition / Greenfield ladder (control vs risk vs commitment) |

### Sizing and sequencing bets
Score each candidate bet by Impact x Confidence x Ease (ICE), then sequence by dependency (prerequisites first, not just highest score first). Keep the list to 2-3. A long portfolio of half-funded bets loses to two fully-backed ones. For each bet state: owner, success metric, the assumption it rests on, and the cheapest experiment that would prove the assumption false.

### Growth vs survival bets
Separate them explicitly. A growth bet expands the business (new segment, expansion motion, new loop). A survival/defensive bet protects it (retention fix, a competitive response, runway extension). Do not fund growth bets while a survival threat (runway < 6 months, churn spike, single-account concentration) is unaddressed.

### Growth loops (product-native acquisition)
Prefer compounding, product-built loops over renting paid traffic. Five types:
| Loop | Mechanism | Best for | Watch |
|---|---|---|---|
| Viral | Users create shareable output shared on external platforms, pulling new users in | Inherently shareable output (design links, video) | Needs strong share incentive |
| Usage | Users create in-product, share it, others consume and become users | Content products | Creation friction must be near-zero |
| Collaboration | Users invite colleagues to co-create inside the product | Team/collaborative tools | Best retention and LTV of the five |
| User-generated | Users discover others' creations, make and share their own | Content networks | Needs critical mass of quality content |
| Referral | Users invite others for a reward | Clear-value products | Incentive must not erode unit economics |
Design steps: define the core value action -> pick the loop that fits the product -> design trigger + incentive + low-friction share + activation -> estimate loop coefficient (invites/user x invite-to-activation conversion) -> ship one loop, master it, then layer a second. Collaboration loops give the strongest retention; viral compounds fastest but is slowest to build.

### Worked example
Brief: SMB SaaS, MRR flat, NRR 92%, CAC payback 14 months, runway 9 months.
Diagnosis: acquisition is expensive and retention leaks; we are refilling a leaky bucket.
Guiding policy: fix retention and add a product-native loop before spending more on ads.
Goals (KPI-tied): lift NRR 92% -> 100% this quarter; cut CAC payback below 12 months.
Bets (ICE-sized, sequenced): (1) survival, owner = product: onboarding rework targeting first-value time, assumption "activation drives retention", invalidate by cohort M1 retention on the reworked flow. (2) growth, owner = GTM: launch a collaboration loop (invite-a-teammate), assumption "our product is used in teams", invalidate cheaply with an invite-CTA experiment. Risk: runway limits ad spend, so both bets must move organic/retention, not paid.

## Anti-patterns / common mistakes
- Vision-speak with no action ("become the market leader in AI").
- Goals set against metrics the workspace cannot measure.
- A guiding policy that is a goal in disguise ("grow 30%") rather than an approach.
- Incoherent actions that do not reinforce one another.
- A wish list of 8 bets instead of 2-3 backed ones.
- Funding growth while a survival threat is live.
- Adding three growth loops at once instead of mastering one.
- Copying a "best practice" a competitor can replicate; no defensibility.

## Checklist before returning
- Diagnosis is specific and evidence-grounded, not a restated goal.
- Guiding policy addresses the diagnosis; actions reinforce the policy.
- Every goal is tied to a KPI actually present in context.
- 2-3 bets max, each with owner, success metric, assumption, and cheap disproof.
- Bets are sized by ICE and sequenced by dependency.
- Growth vs survival bets are labeled; survival threats are handled first.
- Risks are explicit. No vision-speak.

## Sources
Distilled from the installed skills `business-strategy` (Porter, BCG, McKinsey 9-box, Blue Ocean/Four Actions, generic strategies, market-entry modes, decision matrix, scenario planning) and `growth-loops` (the five loop types, loop-fit evaluation, loop-coefficient design, sequencing). Good Strategy kernel framing shared with the `strategy-and-competitive-analysis` skill. Registry entry: `business-strategy` in `_shared/ai-kit/skills/registry.ts`.
