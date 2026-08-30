---
name: cro-conversion
description: Conversion-rate optimization for Israeli SMB funnels. Use to diagnose where a funnel leaks (traffic, landing, activation, checkout, retention), size the leak in revenue terms, and recommend the single highest-leverage reversible fix. Covers funnel-leak diagnosis tables, sample-size and statistical-significance thresholds, ICE and PXL prioritization, value-moment paywall timing, checkout-friction checklists, price-anchoring and ROI framing, Van Westendorp willingness-to-pay, growth-loop selection, and A/B test design with a pre-set stopping rule. Trigger on CRO audit, funnel optimization, checkout abandonment, low activation, paywall or upgrade design, freemium conversion, pricing tiers, cart drop-off, landing-page conversion, or A/B test planning. Works in Hebrew and RTL with shekel pricing.
---

# CRO + Conversion

## When to use
- A funnel step converts worse than it should and the root cause is unclear.
- Checkout or cart abandonment is high (surprise fees, forced signup, too many fields).
- Free users are not converting to paid, or a paywall or upgrade screen needs designing.
- A landing page from an ad or email underperforms (high CTR, low CVR).
- Pricing, tiers, or packaging need setting or the value metric is wrong.
- An A/B test needs a hypothesis, a primary metric, a sample size, and a stopping rule.
- Retention is falling and it is being confused with an acquisition problem.

Do NOT use for raw ad-buying decisions (that is paid-ads) or for finance metric definitions like NRR and LTV (that is finance-metrics). CRO owns the post-click, in-product, and pricing surface.

## Operative rules (always-on; mirrors the registry entry)
1. **Funnel**: traffic to landing to activation to checkout/convert to retain. Find the STEP with the worst RELATIVE drop-off, not the absolute smallest number. Fix the biggest leak first.
2. **Significance**: a drop measured at noise-level volume is not real. Require an adequate sample before recommending, and state confidence. Do not chase a 2% wiggle on 40 sessions.
3. **Diagnosis map**:
   - high traffic + low activation to onboarding / first-value friction
   - high add-to-cart + low purchase to checkout friction (fields, forced signup, surprise fees, no trust signals)
   - high CTR + low CVR to message-match / offer / page-speed
   - rising churn to value-realization, not acquisition
4. **Levers**: gate value at the value-moment (after the user felt benefit), never before. Price-anchor and show ROI. Reduce fields and steps. Add trust (reviews, guarantees) at the point of doubt. Match landing copy to the ad or source promise.
5. **Prioritize** by ICE (Impact x Confidence x Ease) or PXL. Ship the reversible, high-confidence change first.
6. **Test design**: one hypothesis, two variants, one primary metric, a pre-set sample size and stopping rule. Do not peek-and-stop. The action must fit the ROOT cause and be reversible.

## Deep reference (the on-demand layer)

### Funnel-leak diagnosis table
Read the two adjacent steps and match the symptom. Root cause points at the lever, not the other way around.

| Symptom (where volume falls) | Likely root cause | Lever to pull first |
|---|---|---|
| Traffic high, landing bounce high | Message mismatch: ad/source promise not repeated above the fold; slow load | Match hero headline to the source promise; cut load time; one clear CTA |
| Landing OK, activation low | First-value friction: signup wall before value, unclear next step, empty state | Delay signup until after value; guided first action; populate empty states |
| Activation OK, add-to-cart low | Weak product page: no social proof, hidden price, no urgency, buried CTA | Reviews on page, visible price, CTA above the fold on mobile, honest scarcity |
| Add-to-cart high, purchase low | Checkout friction: forced account, too many fields, surprise shipping/fees, no trust at payment | Guest checkout, fewer fields, show total early, trust badges by the pay button |
| High CTR, low CVR | Offer or speed or match: page does not deliver what the click promised | Rewrite offer to match intent; fix page speed; align creative to landing |
| Converts fine, churn rising | Value not realized after purchase; onboarding stops at signup | Move users to the value-moment fast; lifecycle nudges; fix the drop in week 1 |
| CVR up but revenue flat or down | AOV fell (discount or wrong bundle) | Track revenue per visitor, not CVR alone; re-check bundle and anchor |

Ground truth note: order count from the store or DB is truth; analytics (GA4) undercounts via ad blockers. Reconcile before trusting a funnel number.

### Sample-size and significance rule of thumb
Do not act until the test has enough conversions per variant, not just enough sessions.

- **Fast floor**: require at least **~100 conversions per variant** (not sessions) before reading any A/B result, and at least 1-2 weeks of runtime to cover weekly seasonality. Below that, treat the difference as noise.
- **Practical minimum for confidence**: a swing is only trustworthy when the confidence interval excludes zero at ~95% (p < 0.05) AND both floors above are met.
- **Sample-size estimate** (per variant), for a baseline rate p and a minimum detectable effect (relative lift) that you set BEFORE the test:

  ```
  n per variant  ~=  16 * p * (1 - p) / (MDE_abs^2)
  MDE_abs = p * relative_lift        (e.g. p=0.03, want +15% => MDE_abs = 0.0045)
  ```

  Worked: baseline CVR 3% (p=0.03), want to detect a +15% relative lift.
  MDE_abs = 0.03 * 0.15 = 0.0045.
  n = 16 * 0.03 * 0.97 / (0.0045^2) = 16 * 0.0291 / 0.00002025 = 0.4656 / 0.00002025 ≈ **22,993 sessions per variant** (about 690 conversions each). Small lifts on low baselines need large samples; this is why a 2% wiggle on 40 sessions is meaningless.
- **The 40-session trap**: at 40 sessions, one extra conversion moves the rate 2.5 points. Any observed difference is within noise. Report "insufficient data, hold" and change nothing.
- **No peeking**: decide the sample size and end date up front. Checking daily and stopping when it "looks significant" inflates false positives 3-5x. If you must monitor, use a pre-committed sequential rule, not eyeballing.

### ICE scoring (worked example)
Score each hypothesis 1-5 on Impact, Confidence, Ease. ICE = product (max 125) or sum, stay consistent. Ship highest first.

| Hypothesis | Impact | Confidence | Ease | ICE (product) |
|---|---|---|---|---|
| Enable guest checkout (remove forced signup) | 5 | 5 | 3 | 75 |
| Express pay (Apple/Google/bit) above fold on mobile | 4 | 4 | 4 | 64 |
| Show shipping total on product page | 4 | 4 | 3 | 48 |
| Add "only X left" honest scarcity | 3 | 3 | 5 | 45 |

Guest checkout wins: reversible, high-confidence, big impact. Ship it first, then re-measure before the next.

### PXL scoring (worked example)
PXL replaces the guesswork in ICE "Confidence" with yes/no evidence questions, then rates ease. Use PXL when the team over-rates its own confidence.

Evidence questions (1 point each if yes): Is the change above the fold? Is it on a high-traffic page? Does it add or remove a whole element (not a tweak)? Is it motivated by user research, a session recording, or analytics? Does it address a rage-click or drop-off you actually observed?

| Hypothesis | Evidence points (of 5) | Ease (1-5) | PXL |
|---|---|---|---|
| Move email to first checkout field | 4 | 5 | 9 |
| Add trust badges by pay button | 3 | 4 | 7 |
| Recolor the CTA | 1 | 5 | 6 |

Higher PXL and grounded-in-evidence beats a pretty hunch. The recolor scores low on evidence: deprioritize.

### Value-moment paywall-timing decision table
Gate value AFTER the aha moment, never before. Show, do not just tell. Respect the no (easy escape hatch keeps trust for a later conversion).

| Trigger | When it fires | What to show | Escape hatch |
|---|---|---|---|
| Feature gate | User clicks a paid-only feature | What the feature does + one-tap unlock + "why it is paid" | "Continue without" |
| Usage limit | User hits a cap (e.g. 3 free exports) | What was reached + what upgrading gives, do not block abruptly | Let them finish the current action |
| Trial expiration | 7 / 3 / 1 days before end | Summary of value received + what breaks on expiry | Downgrade to free, not lockout |
| Time / session based | After N sessions of engaged free use | Unused paid features they would benefit from | Easy dismiss, gentle frequency |

Paywall copy rule: headline on benefit ("Unlock X to get Y"), not on price ("Upgrade for ₪X/mo"). CTA specific ("שדרג ל-Pro" / "Start free trial"), never bare "Upgrade". Never trap or shame the user.

### Checkout-friction checklist
Fix these before running any test; they are known-good, not hypotheses.

- [ ] Guest checkout available (forced account creation is the #1 abandonment cause, ~35% leave).
- [ ] Email is the FIRST field (captures abandoners for recovery even if they quit).
- [ ] Express pay (Apple Pay, Google Pay, bit, Shop Pay) above the fold on mobile.
- [ ] Total incl. shipping and fees shown BEFORE the payment step (surprise fees cause ~25% of abandonment).
- [ ] Field count minimized; autofill and single-column layout; no re-typing (no "confirm email").
- [ ] Trust at the point of doubt: SSL padlock, card logos, return/refund policy, guarantee near the pay button.
- [ ] Progress indicator on multi-step checkout; back does not wipe entered data.
- [ ] Mobile: 44px touch targets, no horizontal scroll, numeric keyboard for card fields.
- [ ] RTL/Hebrew: currency ₪ before the number (₪400), fields and validation mirror correctly, error text in Hebrew.

### Price-anchoring + ROI-framing playbook
- **Anchor high first**: show the premium tier or the "before" price first so the target tier reads as reasonable. Good-Better-Best with the middle tier as the obvious best value (decoy effect).
- **Charge for a value metric** that scales with the value the customer gets, is easy to understand, and is hard to game (per seat, per usage, per contact, per transaction, flat). Wrong metric caps growth or feels unfair.
- **Show ROI, not cost**: frame price against the alternative it replaces or the money/time it saves ("₪400/חודש מחליף X שעות עבודה"). Price sits between the next best alternative and perceived value.
- **Annual discount** 17-20% to pull cash forward and cut churn. Charm pricing (₪49) for value buyers, round pricing (₪50) for premium positioning.
- **IL specifics**: ₪ before the number, VAT stance stated (plus מע"מ or כולל מע"מ), Hebrew tier names, monthly framing since SMBs budget monthly.

### Van Westendorp sketch (willingness to pay)
Ask 4 questions, plot cumulative curves, read the acceptable band.

- Too cheap (quality doubted): "At what price is it so low you would question quality?"
- Cheap / a bargain: "At what price is it a good deal?"
- Expensive but worth considering: "At what price does it start to feel expensive?"
- Too expensive (won't buy): "At what price is it too expensive to consider?"

Plot the 4 cumulative distributions. The **Point of Marginal Cheapness** (too-cheap x expensive cross) and **Point of Marginal Expensiveness** (cheap x too-expensive cross) bound the **acceptable price range**. The **Optimal Price Point** is where too-cheap and too-expensive intersect. Sample rule from above applies: need enough respondents (aim 30+ per segment) before trusting the band.

### Growth-loop selection table
Retention and self-serve acquisition are CRO's back half. Pick ONE loop native to the product, master it, then layer.

| Loop | Mechanism | Fits when | Watch out for |
|---|---|---|---|
| Viral | User output shared externally brings new users | Output is inherently shareable (a link, a video) | Needs strong reason to share; slow to build |
| Usage | Using the product creates public artifacts others consume | Creation friction is very low | Weak if output stays private |
| Collaboration | User invites colleagues to co-work | Team/collaborative product | Only works if the work is shared |
| User-generated | Users discover others' content, make their own | Content platform at critical mass | Needs a quality-content threshold |
| Referral | Invite for a reward | Clear incentive, measurable ROI | Reward must not break unit economics |

Loop coefficient = invites per user x invite-to-activation rate. Above ~1 it compounds. Collaboration loops give the strongest retention and LTV; referral is easiest to measure.

### A/B test design template (with stopping rule)
```
Hypothesis:  Because we observed [evidence: recording/analytics/rage-click],
             we believe [change] will cause [primary metric] to move [direction]
             for [segment]. We will know it worked if [metric] moves >= [MDE].
Variants:    A = control (current). B = one change only. (No multi-change bundles.)
Primary metric: ONE (e.g. purchase CVR or revenue per visitor). Guardrail: AOV, refunds.
Sample size: [n per variant from the formula above], set BEFORE launch.
Duration:    >= 1-2 full weeks AND until sample size reached, whichever is longer.
Stopping rule: Stop ONLY at the pre-set end. No peeking-and-stopping. If flat at
             the end, keep control. If B wins and passes guardrails, ship B.
Rollback:    B is reversible; can revert instantly if guardrail metric degrades.
```

### Worked example: sizing a leak from real-ish numbers
A HELIX SMB store, last 30 days:
- Sessions 10,000 to product view 6,000 (60%) to add-to-cart 1,500 (25% of views) to begin-checkout 900 (60% of cart) to purchase 300 (33% of checkout).
- Overall CVR = 300 / 10,000 = **3%**. AOV = ₪250. Revenue = ₪75,000.

Relative drop-offs: view to cart keeps 25%, cart to checkout keeps 60%, **checkout to purchase keeps 33%** (loses 67%). The worst RELATIVE leak is inside checkout (67% lost), not the view-to-cart step even though that loses more absolute people, because checkout traffic is high-intent and cheapest to recover.

Size it: if guest checkout + trust-at-pay lifts checkout-to-purchase from 33% to 45% (a realistic, conservative move, benchmarked to the "forced signup ~35% abandon" figure):
- New purchases = 900 x 0.45 = 405. Delta = +105 orders/month.
- Delta revenue = 105 x ₪250 = **+₪26,250/month** (~₪315,000/year), from one reversible change.

Significance check before believing it live: 900 begin-checkout/month means ~405 vs 300 conversions per arm across a clean split, comfortably above the ~100-conversion floor within 2-3 weeks. Trustworthy. Ship guest checkout first (top ICE), measure, then attack the view-to-cart step next.

## Anti-patterns / common mistakes
- Optimizing the smallest absolute number instead of the worst relative drop-off.
- Calling a result on 40 sessions or on session count instead of conversions per variant.
- Peek-and-stop: watching a test daily and stopping the moment it looks significant.
- Gating value before the aha moment, so users bounce before they feel benefit.
- Bundling many changes into one variant, so you cannot attribute the win.
- Celebrating a CVR lift that quietly cut AOV; always check revenue per visitor.
- Trusting GA4 over order-count truth when ad blockers undercount the funnel.
- Recommending a fix that does not match the diagnosed root cause (e.g. a checkout change for a message-match problem).
- Pressuring or trapping users on a paywall, burning trust for a one-time conversion.
- Choosing a value metric that does not scale with delivered value or is easy to game.
- Using an em-dash or English-first pricing in Hebrew/RTL surfaces.

## Checklist before returning
- [ ] Named the funnel step with the worst RELATIVE drop-off, not the smallest absolute number.
- [ ] Stated the sample and confidence; refused to call anything at noise volume.
- [ ] Diagnosis maps symptom to root cause per the diagnosis table.
- [ ] The recommended fix matches the root cause and is reversible.
- [ ] Prioritized by ICE or PXL; the top pick is high-confidence and reversible.
- [ ] Any test has one hypothesis, two variants, one primary metric, a pre-set sample size and stopping rule.
- [ ] Paywall/pricing advice gates at the value-moment and frames ROI, not raw cost.
- [ ] Sized the leak in revenue terms (delta orders x AOV) where numbers allow.
- [ ] Hebrew/RTL correct, ₪ before the number, no em-dash anywhere.

## Sources
- `~/.claude/skills/conversion-rate-optimization/SKILL.md` (found). CRO audit method, checkout-friction checklist, heatmap/session-recording review, ICE scoring, revenue-per-visitor and no-peeking pitfalls.
- `~/.claude/skills/paywall-upgrade-cro/SKILL.md` (found). Value-before-ask, value-moment trigger types (feature gate, usage limit, trial expiry, time-based), benefit-led headline, respect-the-no escape hatch.
- `~/.claude/skills/pricing-strategy/SKILL.md` (found). Three pricing axes, value metric selection, Good-Better-Best, freemium vs trial, anchoring/decoy/charm pricing, Van Westendorp.
- `~/.claude/skills/growth-loops/SKILL.md` (found). 5 loop types (viral, usage, collaboration, user-generated, referral), loop coefficient, retention framing.
- Registry operative layer: `supabase/functions/_shared/ai-kit/skills/registry.ts` entry `cro-conversion`.
