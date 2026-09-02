---
name: helix-sales-playbook
description: Produce a full B2B sales playbook for a company from a short intake (what they sell, to whom, deal size, current channels). Outputs ICP + core pain, decision-maker map, a 5-stage funnel with per-stage triggers, ANUM qualification, pipeline math, channel plan (with Israeli §30א spam-law caveat), first-touch messages (rapport-first LinkedIn sequence + email), objection handling, AND a tailored phone-call script. Use for the HELIX free sales tool and any "build my outbound motion" question.
---

# HELIX Sales Playbook

A **wiring + capability** skill. Composes the installed sales skills and adds the
Q2-style playbook structure that turns a short intake into a usable GTM motion.

Follows the STANDING RULE: one skill per capability, compose before authoring.

## Compose these (load together)

| Layer | Skill | Take from it |
|-------|-------|--------------|
| Methodology | `predictable-revenue` | Seeds/nets/spears, referral-first move, ANUM, pipeline math, SDR→AE handoff. |
| Phone script | `helix-call-script` | Cold / discovery / no-show / voicemail script framework, rendered in Hebrew (it already composes cold-call-scripts × baldiga). |
| Competitors | `competitive-intel` | Only if the playbook names rival vendors — same verification rule applies. |
| Voice | `helix-brand-voice` (+ Hebrew-native, no em-dash) | Authentic Israeli Hebrew for every message and script. |

## The playbook stack this skill produces (Q2 layer)

1. **ICP + הכאב המרכזי** — a precise ideal customer (size, structure, buying
   context) and the one pain that makes them buy now. Specific, not "SMBs".
2. **מפת מקבלי החלטות** — who decides, who influences, who blocks, and the
   internal champion to recruit. Name roles, not just "the company".
3. **המשפך המלא עם טריגר לכל מעבר** — awareness → first-touch → discovery →
   proposal/pilot → close/expand, and for each stage the concrete trigger that
   moves the deal to the next stage.
4. **שער ANUM** — Authority / Need / Urgency / Money as a qualification gate;
   a lead that fails any one is skipped, not chased. Plus a set of natural ANUM
   **questions to ask on the call** (one per letter), phrased like a human.
4b. **בנק שאלות גילוי לפי SPIN** (Rackham) — Situation (few), Problem, Implication
   (the core, makes the pain expensive in shekels and hours), Need-payoff (the buyer
   sells themselves). Ratio: few Situation, many Implication/Need-payoff.
5. **מתמטיקת פייפליין** — work backward from a target: touches → replies →
   meetings → proposals → deals. Always label the conversion rates as an
   assumption to validate on the first ~20 touches, never as fact.
6. **תוכנית ערוצים + הערת §30א** — pick channels for reaching the decision maker.
   Israeli spam law §30א covers WhatsApp, SMS **and** email equally (₪1,000/msg
   exposure, no blanket B2B exemption); cold WhatsApp/SMS is the highest risk and
   is avoided; LinkedIn is lowest-risk-in-practice but not a legal safe harbor.
   Keep this caveat honest, never present cold WhatsApp as a safe substitute.
7. **פנייה ראשונה** — a **rapport-first LinkedIn sequence** (warm-up → personalized
   connect with no ask → value/curiosity message → then the referral ask; never a
   pitch in message one, that is "pitch slap" and lowers reply) + an email version
   using the referral method.
8. **טיפול בהתנגדויות** — the 3-4 objections this ICP will raise, with a crisp
   response each.
9. **תסריט שיחה טלפונית** — via `helix-call-script`, adapted to the company: opener
   + permission, relevance, one social-proof result, ANUM-built discovery
   questions, concrete next step. Cold and/or discovery variant as needed.

## Hard rules (non-negotiable)

1. **Pipeline numbers are assumptions, labeled.** Never present invented
   conversion rates as measured. State them as a model to validate.
2. **Referral-first, not pitch-first.** First LinkedIn touch builds a real
   interaction; the ask comes only after initial rapport. Verified best practice.
3. **§30א honesty.** Do not recommend cold WhatsApp/SMS as a safe channel. Email
   is also covered. LinkedIn is lowest practical risk, not exempt.
4. **Any named rival vendor is verified or "לאימות".** Same rule as
   [[feedback-competitor-verification-touch-source]]. Never invent a competitor,
   client, or number.
5. **Native Hebrew, no em-dash, no blacklist/AI-tell words, spoken register** for
   messages and scripts. Run through `helix-brand-voice`.
6. **Sell the outcome, not features.** ROI and the specific pain, not a spec list.

## Intake (the few questions the tool asks)

Minimum to run: (1) what you sell; (2) who the customer is (ICP hint); (3) typical
deal size / price band; (4) current channels, if any; (5) one proof/result you can
cite. Propose defaults; mark any missing answer as an assumption, never block.

## Output shape

Labeled JSON sections (ICP, decision-map, funnel, ANUM, pipeline, channels,
first-touch LinkedIn sequence, email, objections, phone-script) so the tool UI
renders each as its own card. The Critic pass re-checks: pipeline labeled as
assumption, §30א honest, LinkedIn rapport-first not pitch-first, no unverified
competitor as fact, no em-dash.

## Where this gets used

- **HELIX sales free tool** (`/free-tools/sales`) — this skill is the engine's
  domain layer.
- **HELIX SDR/BDR bot** — shares the methodology and the call-script layer.

## Combine with

- `predictable-revenue` (methodology, loaded above)
- `helix-call-script` (phone script, loaded above)
- `helix-brand-voice` (Hebrew voice, mandatory)
- Sibling: `helix-differentiation-analysis` (the Q1 strategy tool, same intake company).
