---
name: finance-metrics
description: SaaS unit economics and revenue, retention, and growth metrics for Israeli SMB products. Use when calculating or interpreting MRR, ARR, NRR, gross and net retention, churn, CAC, LTV, payback, burn, or runway, when diagnosing momentum, churn, expansion, or product-market-fit signals, when building a metrics dashboard, defining KPIs, or setting alert thresholds, or when a board or investor deck needs the numbers reasoned correctly rather than estimated.
---

# Finance Metrics

## When to use
Reach for this when a task involves SaaS money: computing or reading MRR/ARR movement, retention (NRR, GRR, logo vs revenue churn), unit economics (CAC, LTV, payback), or cash (burn, runway). Also use it to design a metrics dashboard (North Star, input, health, business layers) or to set alert thresholds. It powers the finance agent that reads a workspace's KPIs and flags what is off. It does NOT do profitability accounting, tax, or pricing design (see pricing skills).

## Operative rules (always-on; mirrors the registry entry)
- Reason ONLY over numbers present in context. If a metric is missing, say so explicitly. Never estimate, infer, or invent a figure.
- Judge trends on rolling windows (7 / 30 / 90 day), never a single day.
- State the exact number behind every claim. Round only for readability, never to invent precision.
- Separate voluntary churn from involuntary (failed-payment) churn; involuntary is recoverable, call it out on its own.
- Every recommendation names the lever it pulls (pricing, dunning, onboarding, expansion motion) AND the metric it moves.
- Alert triggers to flag explicitly: churn spike vs trailing average; failed-payment / dunning cluster; CAC > LTV; NRR below 100%; runway < 6 months; one account > 10% of MRR (concentration risk).

## Deep reference (the on-demand layer)

### Core formulas
| Metric | Formula | Read |
|---|---|---|
| MRR | Sum of recurring monthly subscription revenue | Track components, not just total |
| ARR | MRR x 12 | |
| MRR bridge | Start + New + Expansion - Contraction - Churned = End | The most important view |
| ARPA | MRR / active accounts | Account-level deal size |
| ARPU | MRR / total users (seats) | Per-seat monetization |
| Avg seats/account | ARPA / ARPU | Packaging sanity check |
| ACV | Annual recurring revenue per contract (exclude setup / services) | Compare deal economics |
| Logo churn | Customers lost / starting customers | |
| Revenue churn | MRR lost / starting MRR | If > logo churn, you lose big accounts |
| GRR (gross retention) | (Start - contraction - churn) / start | Always < 100%, higher is better |
| NRR (net retention) | (Start + expansion - contraction - churn) / start | Growth without new logos |
| Quick Ratio | (New + Expansion) / (Churned + Contraction) | Growth quality |
| CAC | Fully-loaded sales+marketing spend / new customers won | |
| LTV | ARPA x gross-margin% / churn-rate | |
| CAC:LTV | LTV / CAC | Target >= 3 |
| CAC payback | CAC / (ARPA x gross-margin%) | Target < 12 months |
| Runway | Cash on hand / net monthly burn | |

### Benchmarks (context-dependent, use as flags not verdicts)
- Monthly logo churn: < 2% great, 2-5% acceptable, > 5% crisis. Annual: < 10% / 10-30% / > 30%.
- NRR: > 120% excellent, 100-120% good, 90-100% acceptable, < 90% problem.
- Quick Ratio: > 4 excellent, 2-4 healthy, < 2 leaky bucket (fix retention before scaling spend).
- Expansion should reach 20-30% of revenue and be the main driver of NRR > 100%.
- Refunds > 10% signal product-quality problems; discounts > 20% signal pricing-power problems.
- Revenue concentration: top customer < 10% of revenue, top 10 < 40%.
- CAC:LTV >= 3; payback < 12 months.

### Compounding churn (the classic trap)
Monthly churn does NOT annualize by x12. Use `Annual = 1 - (1 - monthly)^12`. So 3% monthly = ~31% annual, not 36%. 5% monthly = ~46% annual.

### NRR quality decomposition
NRR can be > 100% purely from very low churn with no real expansion. Always split into expansion MRR vs churned+contracted MRR. Expansion-driven NRR (> 120%) is the healthy kind; low-churn-only NRR is fragile.

### Cohort analysis (the anti-blending discipline)
Blended metrics hide trends. Group customers by join month and track retention/expansion/LTV per cohort. Rule: recent cohorts should retain the same or better than older ones. If newer cohorts churn faster, PMF is degrading, stop scaling acquisition and fix the product first.

### Worked example: warning-sign account
Given: MRR $500K growing 15% MoM; logo churn 6% (was 4% six months ago); revenue churn 7%; NRR 85%; expansion 1% of MRR; Quick Ratio 1.2; cohort M6 retention 75% -> 65% -> 58%.
Read: revenue churn > logo churn means losing bigger accounts; NRR < 100% means contracting; cohort degradation means PMF slipping; Quick Ratio 1.2 is a leaky bucket. Growth is masking a broken retention base.
Action: stop scaling acquisition; investigate why new cohorts churn faster and why expansion is only 1%. Lever = onboarding + expansion motion; metric = GRR and cohort M6 retention.

### Dashboard design (4-layer model)
1. North Star: the single metric that captures core value delivery (a leading indicator, customer-centric).
2. Input metrics (3-5): the levers that move the North Star.
3. Health metrics: guardrails (error rate, latency, NPS).
4. Business metrics: MRR, CAC, LTV, churn.
For each metric define: exact calculation (numerator/denominator + window), data source, visualization, target, alert threshold. Good-metric test (Lean Analytics): understandable, comparative (over time not a snapshot), a ratio/rate, and behavior-changing. If a metric would not change a decision, drop it. Review cadence: daily (operational health), weekly (input metrics), monthly (North Star + business + OKRs), quarterly (recalibrate).

## Anti-patterns / common mistakes
- Confusing revenue with profit. Revenue is top line; growing at negative margin is not winning.
- Celebrating ARPU growth that came from losing small customers (mix shift), not better monetization. Check ARPU by cohort/segment.
- Reporting one blended churn number that hides a dying legacy product inside a healthy portfolio. Do a revenue-mix breakdown.
- Confusing logo churn with revenue churn. 2% logo churn can be 10% revenue churn if big accounts leave.
- Multiplying monthly churn by 12.
- Blended ARPU across segments (e.g. averaging $10 SMB with $1,000 enterprise). Segment it.
- Estimating a missing number to fill a table. Mark it missing instead.

## Checklist before returning
- Every number cited is present in the provided context (nothing invented or estimated).
- Trends use a rolling window, not a single day.
- Voluntary and involuntary churn are separated.
- Each recommendation names a lever and the metric it moves.
- Alert triggers checked: churn spike, dunning cluster, CAC>LTV, NRR<100%, runway<6mo, account>10% MRR.
- Israeli context respected: currency shown as ₪ before the number.

## Sources
Distilled from the installed skills `saas-revenue-growth-metrics` (metric definitions, benchmarks, cohort/quick-ratio discipline, the ten pitfalls) and `metrics-dashboard` (North Star / input / health / business layering, good-metric criteria, review cadence, alert design). Registry entry: `finance-metrics` in `_shared/ai-kit/skills/registry.ts`.
