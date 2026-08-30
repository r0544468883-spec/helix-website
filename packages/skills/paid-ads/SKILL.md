---
name: paid-ads
description: Google Ads and Meta paid-media management and optimization for Israeli SMB budgets. Use when reading or acting on ad performance (ROAS, CPA, CTR, CVR, frequency), deciding whether to scale, pause, rotate creative, or hold an ad set, diagnosing whether a problem lives in the audience, the creative, the bid, or the post-click page, structuring campaigns and ad sets, or judging whether there is enough data to act at all. Enforces significance-first discipline and gated money moves so budget is never changed autonomously.
---

# Paid Ads

## When to use
Use this when the task is paid acquisition on Google Ads or Meta: interpreting a performance report, recommending a budget or bid change, diagnosing a rising CPA, rotating fatigued creative, or structuring a new campaign. It powers the ads agent that proposes money moves for a human or budget-critic to approve. It does NOT design the landing page (that is CRO) or write the brand story (that is comms), though it decides which of those a problem belongs to.

## Operative rules (always-on; mirrors the registry entry)
- Significance first (cardinal rule): never judge or act on an ad set with < 50 conversions or < ~1,000 clicks. Not enough data means HOLD, change nothing.
- Compare rolling 7-day windows, not day-over-day. A 1-3 day CPA spike is variance, not a trend.
- Respect the learning phase: Meta needs ~50 conversions/week to exit learning; any edit resets it, so avoid frequent tweaks.
- Scale in small steps: +20-25% budget MAX per change, then wait 2-3 days. Bigger jumps reset learning.
- Money moves are gated: output a recommendation + justification + safeToApply flag; a human or budget-critic confirms before it applies. Never scale or pause autonomously.
- Never propose a scale > +25% or a pause without naming the metric AND the window behind it.
- Cite the metric behind every change. Never invent a metric value. No fabricated claims in ad copy.

## Deep reference (the on-demand layer)

### Vocabulary
CPM (cost per 1,000 impressions), CPC (cost per click), CTR (clicks / impressions), CVR (conversions / clicks), CPA or CAC (cost per acquisition), ROAS (revenue / spend), AOV (average order value), frequency (impressions / reach).

### The decision table
| Signal | Diagnosis | Action |
|---|---|---|
| ROAS above target + stable + enough volume | Winner with headroom | Scale budget +20-25% max, wait 2-3 days |
| CPA rising + frequency > 2-3 + CTR falling | Creative fatigue | Rotate creative. Do NOT touch budget |
| CPA rising + frequency low + CTR stable | Audience or bid issue | Tighten targeting or lower bid |
| High CTR + low CVR | Post-click problem (landing/offer) | Flag to CRO. Do NOT change the ad |
| ROAS below target + enough volume + no fixable cause | Losing ad set | Pause it |
| Not enough data (< 50 conv / < 1,000 clicks) | Variance, not a trend | HOLD, wait for volume, change nothing |

### Diagnose at the level the problem lives
Structure: campaign = objective + budget; ad set (Meta) / ad group (Google) = audience + placement + bid; ad = creative. A creative problem is fixed at the ad level, an audience/bid problem at the ad-set level, a budget/objective problem at the campaign level. Do not fix a creative-fatigue problem with a budget change.

### The funnel of blame (where does a bad result live?)
Impressions -> clicks -> conversions -> revenue. Walk it:
- Low CTR = the creative/hook or the audience match is weak (top of funnel).
- High CTR + low CVR = the click was good but the landing page, offer, or price failed (post-click, hand to CRO).
- Good CVR + bad ROAS = AOV or targeting quality; you are buying low-value conversions.

### Spend asymmetry (why the gating matters)
A blown daily budget is spent and not reversible; a pause is fully reversible. When uncertain, the reversible action wins. This is why scale-ups are capped and always gated, while a pause on a clearly-losing, high-volume ad set is the safer default.

### Creative fatigue mechanics
Frequency climbing past ~2-3 with falling CTR and rising CPA is the classic fatigue signature. The fix is new creative, not more or less money. On small audiences (common in Israel) frequency climbs faster, so creative burns out sooner. Refresh the creative pool earlier and keep more variants in rotation.

### Scaling without resetting learning
Prefer gradual budget increases (+20-25%) over large jumps. Alternative scaling paths that disturb learning less: duplicating a proven ad set into a new audience, or raising the cap on a campaign-budget-optimization campaign rather than editing individual ad sets. Every hard edit (creative swap, big budget change, targeting change) risks a fresh learning phase, so batch changes rather than drip them.

### Worked example
Ad set: 7-day ROAS 4.1 vs 3.0 target, 180 conversions, frequency 1.6, CTR steady, budget ₪150/day.
Read: winner, enough volume, no fatigue. Headroom to scale.
Recommendation: raise budget to ₪185/day (+23%), hold 3 days, re-check ROAS and frequency. safeToApply after budget-critic confirms. Justification cites: ROAS 4.1 on 180 conv over 7d, frequency healthy at 1.6.

## Anti-patterns / common mistakes
- Acting on yesterday vs today. Day-over-day swings are noise.
- Killing or scaling an ad set with 12 conversions. Below threshold = HOLD.
- Fixing a low-CVR problem by editing the ad. That is a landing/offer problem; route to CRO.
- Scaling a winner +100% overnight and wondering why performance collapsed (learning reset).
- Editing an ad set daily and never letting it exit learning.
- Applying a budget change autonomously. All money moves are gated.
- Writing ad copy with a claim, price, or stat not backed by context.

## Checklist before returning
- Volume threshold met (>= 50 conv or ~1,000 clicks) before any judgment; otherwise HOLD.
- Comparison uses a rolling 7-day window.
- The action fits the diagnosed level (creative / audience-bid / landing / budget).
- Any scale is <= +25% and any scale/pause names its metric and window.
- Output carries recommendation + justification + safeToApply; nothing applied autonomously.
- Israeli context: ₪, Hebrew + RTL creative, no fabricated claims.

## Sources
No installed source skill exists for this capability; written from Google Ads and Meta optimization domain expertise and aligned to the `paid-ads` registry entry in `_shared/ai-kit/skills/registry.ts` (significance-first, decision table, gating, spend asymmetry).
