// ============================================================
// Eval fixtures. One array of cases, at least 2 per skill.
// ------------------------------------------------------------
// Each case pairs a user task with a rubric. A rubric item's
// `check` is either "judge" (scored by the LLM judge in
// rubric.ts) or the KEY of a deterministic detector in
// DETERMINISTIC_CHECKS (rubric.ts). The task is written so the
// skill, if it works, should visibly change the answer on the
// checkable criteria.
// ============================================================

export type CheckKind = "deterministic" | "judge";

export interface RubricItem {
  /** stable id, unique within the case */
  id: string;
  /** what a GOOD answer must do (the criterion the skill should cause) */
  must: string;
  /** "judge" for the LLM judge, or a detector key from DETERMINISTIC_CHECKS */
  check: string;
}

export interface EvalCase {
  id: string;
  skill: string; // a SkillName from registry.ts
  task: string; // the user input handed to the agent
  rubric: RubricItem[];
}

export const FIXTURES: EvalCase[] = [
  // ---------------- helix-brand-voice ----------------
  {
    id: "brand-voice-1-hero",
    skill: "helix-brand-voice",
    task:
      'כתוב פסקת פתיחה (hero) לעמוד מוצר של HELIX על שירות אוטומציה לעסקים קטנים בישראל. עד 60 מילים, בעברית.',
    rubric: [
      { id: "no-emdash", must: "Contains zero em-dash characters.", check: "noEmDash" },
      { id: "no-ai-tells", must: "Uses none of the banned AI-tell phrases.", check: "noBannedAiTells" },
      { id: "one-cta", must: "Has exactly one specific CTA, not a generic 'Get Started'.", check: "judge" },
      { id: "team-of-agents", must: "Frames the product as a team of agents (צוות סוכנים), not a 'system/platform'.", check: "judge" },
      { id: "hebrew-native", must: "Hebrew reads as native Israeli, not translated.", check: "judge" },
    ],
  },
  {
    id: "brand-voice-2-rewrite",
    skill: "helix-brand-voice",
    task:
      'Rewrite this to HELIX voice, keep it short: "Our world-class platform helps you unlock seamless growth — a real game-changer for your business. Get started today!"',
    rubric: [
      { id: "no-emdash", must: "Removes the em-dash entirely.", check: "noEmDash" },
      { id: "no-ai-tells", must: "Strips banned tells (world-class, unlock, seamless, game-changer).", check: "noBannedAiTells" },
      { id: "specific-cta", must: "Replaces 'Get started today' with one specific CTA.", check: "judge" },
      { id: "no-platform", must: "Does not call the product a platform/system.", check: "judge" },
    ],
  },

  // ---------------- paid-ads ----------------
  {
    id: "paid-ads-1-hold",
    skill: "paid-ads",
    task:
      "A Meta ad set has spent 3 days live, 18 conversions total, and CPA rose about 40% versus yesterday. The client asks: should we pause it or cut the budget?",
    rubric: [
      { id: "holds", must: "Recommends HOLD / wait for volume and changes nothing yet.", check: "paidAdsHold" },
      { id: "significance", must: "Cites the significance threshold (needs ~50 conversions before judging).", check: "mentionsSignificance" },
      { id: "window", must: "Notes a 1-3 day CPA move is variance, judge on rolling 7-day windows.", check: "judge" },
    ],
  },
  {
    id: "paid-ads-2-scale",
    skill: "paid-ads",
    task:
      "A Google Ads campaign has 240 conversions over the last 14 days, ROAS 4.2 against a target of 3.0, stable for 10 days. The client wants to scale spend aggressively, maybe double the budget. What do you recommend?",
    rubric: [
      { id: "max-25", must: "Caps any proposed budget increase at +20-25% per change, never a 2x jump.", check: "paidAdsMaxScale25" },
      { id: "gated", must: "Frames it as a recommendation to confirm, not an autonomous money move.", check: "judge" },
      { id: "wait", must: "Says to wait 2-3 days between increases so learning does not reset.", check: "judge" },
    ],
  },

  // ---------------- cro-conversion ----------------
  {
    id: "cro-1-biggest-leak",
    skill: "cro-conversion",
    task:
      "Funnel last 30 days: 20,000 landing visits -> 8,000 activated -> 6,500 added to cart -> 1,300 purchased. Where should we focus first and why?",
    rubric: [
      { id: "relative-drop", must: "Identifies the step with the worst RELATIVE drop-off (cart to purchase), not the absolute smallest number.", check: "judge" },
      { id: "diagnose", must: "Diagnoses checkout friction as the likely cause of the cart-to-purchase leak.", check: "judge" },
      { id: "reversible", must: "Proposes a reversible, prioritized test rather than a blind redesign.", check: "judge" },
    ],
  },
  {
    id: "cro-2-low-volume",
    skill: "cro-conversion",
    task:
      "We ran an A/B test for 2 days: variant A converted 3 of 40 sessions, variant B converted 5 of 44. The team wants to ship variant B now. Should we?",
    rubric: [
      { id: "significance", must: "Says the sample is too small / not significant to decide.", check: "mentionsSignificance" },
      { id: "no-peek", must: "Warns against peek-and-stop; set a pre-defined sample size and stopping rule.", check: "judge" },
      { id: "no-chase", must: "Does not recommend shipping B on this data.", check: "judge" },
    ],
  },

  // ---------------- finance-metrics ----------------
  {
    id: "finance-1-missing-metric",
    skill: "finance-metrics",
    task:
      "Here is what we have: starting MRR was 100,000 shekel, new MRR this month 12,000 shekel. Please compute our Net Revenue Retention and LTV.",
    rubric: [
      { id: "flags-missing", must: "States that expansion/contraction/churn (and CAC, ARPA, gross margin) are missing and cannot be computed.", check: "financeAcknowledgesMissing" },
      { id: "no-invent", must: "Does not invent or estimate the missing figures.", check: "judge" },
      { id: "names-formula", must: "States the NRR formula so the user knows what inputs are needed.", check: "judge" },
    ],
  },
  {
    id: "finance-2-churn-split",
    skill: "finance-metrics",
    task:
      "Churn jumped from 3.1% to 5.4% this month. On inspection, 60% of the churned accounts were failed card payments in the dunning queue. How should we read this?",
    rubric: [
      { id: "separates-involuntary", must: "Separates involuntary (failed-payment/dunning) churn from voluntary churn and calls it recoverable.", check: "judge" },
      { id: "rolling", must: "Judges the spike against a trailing/rolling average, not a single month in isolation.", check: "judge" },
      { id: "lever", must: "Names the lever (dunning/retry) that the involuntary portion moves.", check: "judge" },
    ],
  },

  // ---------------- seo-geo-pack ----------------
  {
    id: "seo-1-answer-first",
    skill: "seo-geo-pack",
    task:
      "Write the opening of an article section titled 'כמה עולה בניית אתר לעסק קטן בישראל' so it is likely to be cited by AI answer engines.",
    rubric: [
      { id: "tldr", must: "Opens with an answer-first TL;DR / בקצרה summary up top.", check: "seoHasTldr" },
      { id: "self-contained", must: "The passage answers the question standalone, definitive tone, no filler.", check: "judge" },
      { id: "no-fabrication", must: "Does not fabricate specific prices/stats or cite fake studies.", check: "judge" },
    ],
  },
  {
    id: "seo-2-critique",
    skill: "seo-geo-pack",
    task:
      "Critique this intro for GEO citability and rewrite it: 'In today's fast-paced digital world, having a website is very important for every business. There are many factors to consider.'",
    rubric: [
      { id: "tldr", must: "The rewrite adds an answer-first TL;DR / בקצרה.", check: "seoHasTldr" },
      { id: "kills-filler", must: "Removes generic filler and replaces it with specific, self-contained answers.", check: "judge" },
      { id: "cta-pain", must: "Any CTA restates the reader's pain rather than a generic 'sign up'.", check: "judge" },
    ],
  },

  // ---------------- cold-outreach-copy ----------------
  {
    id: "cold-1-email",
    skill: "cold-outreach-copy",
    task:
      "Write a cold outreach email to the ops lead at a 40-person Israeli logistics SMB that just posted 3 open warehouse roles on LinkedIn. We sell hiring automation.",
    rubric: [
      { id: "short", must: "Is short (roughly under 120 words), no wall of text.", check: "coldShortEnough" },
      { id: "no-spam", must: "Avoids spam triggers (ALL-CAPS, '!!!', free/guarantee stacks).", check: "coldNoSpamTriggers" },
      { id: "one-ask", must: "Has exactly one clear low-friction ask.", check: "judge" },
      { id: "relevance-open", must: "Opens with the specific relevance (the 3 open roles), not 'I hope this finds you well'.", check: "judge" },
    ],
  },
  {
    id: "cold-2-grounding",
    skill: "cold-outreach-copy",
    task:
      "Here are the ONLY facts about the lead: name Dana, title Head of Marketing, company a boutique Tel Aviv cosmetics brand. Write a cold LinkedIn message. Do not invent anything else about her.",
    rubric: [
      { id: "no-spam", must: "Avoids spam triggers and stays plain and human.", check: "coldNoSpamTriggers" },
      { id: "grounded", must: "Uses only the provided facts, invents no extra detail about Dana.", check: "judge" },
      { id: "single-angle", must: "Picks one angle and at most one personalization hook, no forced over-personalization.", check: "judge" },
    ],
  },

  // ---------------- contract-legal ----------------
  {
    id: "contract-1-review",
    skill: "contract-legal",
    task:
      "Review this clause for a HELIX client: 'The Provider may terminate this agreement at any time without notice. Client waives all claims for damages. This agreement auto-renews annually.' What are the issues?",
    rubric: [
      { id: "advisory", must: "States this is not legal advice and recommends a lawyer for anything material.", check: "contractMentionsLawyer" },
      { id: "risky-vs-missing", must: "Separates 'risky' (present but bad) clauses from 'missing' standard protections.", check: "contractSeparatesRiskyMissing" },
      { id: "quotes", must: "Quotes the specific clause language it is flagging.", check: "judge" },
    ],
  },
  {
    id: "contract-2-presence",
    skill: "contract-legal",
    task:
      "A short IL-jurisdiction service agreement only covers scope of work and price. Run a presence check: what standard protections are absent?",
    rubric: [
      { id: "advisory", must: "States it is advisory only and to consult a lawyer.", check: "contractMentionsLawyer" },
      { id: "il-checklist", must: "Names IL-relevant missing items (governing law, VAT/מע\"מ, late-payment, liability cap, termination/notice, confidentiality, data/privacy).", check: "judge" },
      { id: "no-invent", must: "Does not invent statutes or legal facts it is unsure of.", check: "judge" },
    ],
  },

  // ---------------- accessibility-a11y ----------------
  {
    id: "a11y-1-contrast",
    skill: "accessibility-a11y",
    task:
      "Audit this: a call-to-action button uses light gray text (#9AA0A6) on a white background, has no visible focus ring, and its accessible name is 'click here'. List the a11y issues and fixes.",
    rubric: [
      { id: "cites-wcag", must: "References the specific WCAG criteria (or ת\"י 5568) behind each issue.", check: "a11yCitesWcag" },
      { id: "contrast-ratio", must: "States the 4.5:1 text contrast requirement.", check: "a11yContrastRatio" },
      { id: "fixes", must: "Gives a concrete fix for each of: contrast, focus ring, and the 'click here' name.", check: "judge" },
    ],
  },
  {
    id: "a11y-2-keyboard",
    skill: "accessibility-a11y",
    task:
      "A custom dropdown menu is built from div elements with onClick handlers. Review it for keyboard and screen-reader accessibility and list what to fix.",
    rubric: [
      { id: "cites-wcag", must: "References specific WCAG criteria (or ת\"י 5568).", check: "a11yCitesWcag" },
      { id: "keyboard", must: "Flags keyboard operability (Tab/Enter/Space, focus order, no trap) and missing roles/labels.", check: "judge" },
      { id: "method", must: "Recommends automated (axe-core/pa11y) plus manual checks.", check: "judge" },
    ],
  },
];
