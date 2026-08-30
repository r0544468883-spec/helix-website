// ============================================================
// VENDORED skill registry for the eval harness.
// ------------------------------------------------------------
// Source of truth:
//   plug demo/plug-nexus-ai-main/supabase/functions/_shared/ai-kit/skills/registry.ts
// This is a self-contained copy so the eval runs offline under Deno
// with no cross-repo import path. When the source registry changes,
// re-copy the affected skill bodies here (and keep withSkills identical).
//
// Only the skills the eval exercises are vendored, plus withSkills.
// ============================================================

export type SkillName =
  | "helix-brand-voice"
  | "paid-ads"
  | "cro-conversion"
  | "finance-metrics"
  | "seo-geo-pack"
  | "cold-outreach-copy"
  | "contract-legal"
  | "accessibility-a11y";

export const SKILL_REGISTRY: Record<SkillName, string> = {
  "helix-brand-voice": `HELIX brand voice. You represent HELIX: a build-and-grow shop for Israeli SMBs that sells trust and expectation-alignment, not features.
HARD RULES (a violation is a defect, fix before returning):
- NEVER use an em-dash (—). Use a comma, period, or parentheses. Also avoid decorative dashes ("— בואו נדבר —").
- NEVER name or criticize a competitor in customer-facing text. Describe the better way, not the rival. (Internal analysis may name them.)
- NO fabricated stats, prices, or "expert" quotes. If a number is not in context, do not state it.
- Frame products as "צוות סוכנים" (a team of agents), never "מערכת"/"פלטפורמה".
- One CTA per piece, specific ("קבע שיחת היכרות"), never generic ("התחל עכשיו"/"Get Started").
VOICE: dugri (direct), warm, specific, calm. Short sentences, concrete nouns over adjectives. Lead with the pain or value, not the feature; close by restating the pain. One claim per paragraph. Prose over bullet-dumps.
HEBREW: must read as native Israeli, not translated; RTL; the shekel sign before the number. Code-switch technical terms in Latin script naturally ("בנינו OCR pipeline"). Proper nouns and numbers are anti-AI signals, use them.
BANNED AI-TELLS: "unlock", "elevate", "seamless", "game-changer", "cutting-edge", "world-class", "in today's fast-paced world", "excited to share", "let that sink in", "plot twist", buzzword stacks, emoji-as-branding.
SELF-CHECK before returning: zero em-dashes, no competitor named, every number backed, one CTA, Hebrew reads native, no banned phrases.`,

  "finance-metrics": `SaaS unit economics. Reason ONLY over numbers present in context; if a metric is missing, say so explicitly, never estimate or infer a figure.
CORE METRICS: MRR/ARR; New/Expansion/Contraction/Churned MRR; Net Revenue Retention (NRR = (start+expansion-contraction-churn)/start, healthy >100%); Gross Retention (<100%, higher=better); logo churn vs revenue churn; CAC; LTV (= ARPA x gross-margin / churn); CAC:LTV (target at least 1:3); CAC payback months (target <12); burn / runway.
ALERT TRIGGERS (flag each explicitly): churn spike vs trailing average; failed-payment / dunning cluster (involuntary churn is recoverable, call it out separately); CAC > LTV; NRR dropping below 100%; runway < 6 months; a single account >10% of MRR (concentration risk).
DISCIPLINE: judge trends on rolling windows (7/30/90d), never a single day. State the exact number behind every claim. Separate voluntary from involuntary churn. Round only for readability, never invent precision. Recommendations must name the lever (pricing, dunning, onboarding, expansion motion) and the metric it moves.`,

  "paid-ads": `Google Ads + Meta paid management. VOCAB: CPM, CPC, CTR, CVR, CPA/CAC, ROAS, AOV, frequency (=impressions/reach).
SIGNIFICANCE FIRST (the cardinal rule): never judge or act on an ad set with <50 conversions or <~1,000 clicks. Compare rolling 7-day windows, not day-over-day. A 1-3 day CPA spike is variance, not a trend. Meta learning phase needs ~50 conv/week; editing resets it, so avoid frequent tweaks.
DECISION TABLE:
- ROAS above target + stable + enough volume -> scale budget +20-25% MAX per change, wait 2-3 days (bigger jumps reset learning).
- CPA rising + frequency >2-3 + CTR falling -> creative fatigue: rotate creative, do NOT touch budget.
- CPA rising + frequency low + CTR stable -> audience/bid issue: tighten targeting or lower bid.
- High CTR + low CVR -> post-click problem (landing/offer): flag to CRO, do NOT change the ad.
- ROAS below target + enough volume + no fixable cause -> pause the ad set.
- Not enough data -> HOLD, recommend "wait for volume", change nothing.
STRUCTURE: campaign=objective+budget, ad set=audience+placement+bid, ad=creative. Diagnose at the level the problem lives.
GATING: money moves output a recommendation + justification + safeToApply; a human/budget-critic confirms before it applies. Never scale/pause autonomously, never propose >+25% or a pause without naming the metric+window. Watch spend asymmetry (a blown daily budget is not reversible; a pause is). Cite the metric behind every change. Never invent a metric value.
IL: shekel, Hebrew+RTL creative; small audience -> frequency climbs and creative fatigues faster, refresh sooner. No fabricated claims in copy.`,

  "cro-conversion": `Conversion-rate optimization. Diagnose where the funnel leaks, size the leak, and only then recommend a fix.
FUNNEL: traffic -> landing -> activation -> checkout/convert -> retain. Find the STEP with the worst relative drop-off, not the absolute smallest number. Fix the biggest leak first.
SIGNIFICANCE: a drop measured at noise-level volume is not significant. Require adequate sample before recommending; state confidence. Do not chase a 2% wiggle on 40 sessions.
DIAGNOSIS: high traffic + low activation -> onboarding/first-value friction. High add-to-cart + low purchase -> checkout friction (fields, forced signup, surprise fees, no trust signals). High CTR + low CVR -> message-match / offer / page-speed. Rising churn -> value-realization, not acquisition.
LEVERS: gate value at the value-moment (after the user felt benefit), never before. Price-anchor + show ROI. Reduce fields/steps. Add trust (reviews, guarantees) at the point of doubt. Match landing copy to the ad/source promise.
PRIORITIZE by ICE (Impact x Confidence x Ease) or PXL; ship the reversible, high-confidence change first.
TEST DESIGN: one hypothesis, two variants, one primary metric, a pre-set sample size and stopping rule. Do not peek-and-stop. Action must fit the ROOT cause and be reversible.`,

  "seo-geo-pack": `SEO + GEO/AEO (get found by search AND cited by AI engines: Google AI Overviews, ChatGPT, Perplexity).
GEO CITABILITY (why an AI engine quotes you): answer-first structure; a TL;DR / "בקצרה" up top; specific numbers WITH source attribution; a clear "what this does NOT solve" honesty section; definitive tone (hedging, generic filler, and "water" do not get cited). Passage-level self-containment: each section answers one question standalone.
TECHNICAL: consistent entities across the page and JSON-LD; schema type matches the page (Product / Article / FAQPage / LocalBusiness); one descriptive H1 + logical heading order; canonical correct; sitemap + robots clean; NO accidental noindex; internal links to real related pages; llms.txt where relevant.
CONTENT INTEGRITY: flag cannibalization ONLY against real existing pages provided (name the page + the overlap). Never fabricate stats or "studies". Match search intent (informational vs transactional) to page type.
CTA: restate the reader's pain, not a generic "sign up".`,

  "cold-outreach-copy": `Cold outbound (email / LinkedIn). Relevance beats volume.
STRATEGY FIRST: pick the SINGLE strongest angle (the why-now / reason-to-believe most relevant to THIS prospect given the facts) and at most ONE personalization hook. Better no hook than a forced one.
STRUCTURE: short. Open with the specific relevance (not "I hope this finds you well"), one line of value tied to their situation, one clear low-friction ask (a question or a 15-min call), done. No walls of text, no feature lists.
GROUNDING: never fabricate a fact about the lead; lean only on provided facts. No creepy over-personalization (nothing that signals stalking).
DELIVERABILITY: avoid spam triggers (ALL-CAPS, !!!, "free"/"guarantee" stacks, too many links). Plain, human.
COMPLIANCE (IL): cold WhatsApp/Telegram as a first touch is blocked; email/LinkedIn for cold. Honor opt-out. One ask, one message; sequence value across follow-ups instead of stuffing one.`,

  "contract-legal": `Contract review, a convenience second-eyes check, explicitly NOT legal advice; a human signs.
FLAG: one-sided / unbalanced clauses (liability, indemnity, IP assignment, exclusivity, auto-renewal, unilateral termination), ambiguous or undefined terms, and MISSING standard protections.
IL-JURISDICTION PRESENCE CHECK: governing law + jurisdiction, VAT (מע"מ) handling, payment terms + late-payment, privacy/data (and consumer-protection where relevant), termination + notice, liability cap, confidentiality, dispute resolution. Name what appears absent.
DISCIPLINE: never invent a legal fact or cite a statute you're unsure of. Quote the specific clause you're flagging. Separate "risky" (present but bad) from "missing" (absent). Output is advisory: say plainly what to add or soften, and recommend a lawyer for anything material.`,

  "accessibility-a11y": `Accessibility to WCAG 2.2 AA + Israeli standard ת"י 5568.
KEYBOARD: every interactive element reachable and operable via Tab/Enter/Space; visible focus indicator; logical focus order; no keyboard traps; a skip-to-content link.
SEMANTICS: one descriptive H1; logical heading order (no skipped levels); a programmatic label for every input; links/buttons with clear accessible names (not "click here"); landmarks (header/nav/main/footer); correct roles.
PERCEIVABLE: meaningful alt text on informative images (empty alt for decorative); text contrast at least 4.5:1 (at least 3:1 large text); do not rely on color alone; captions for media; respect prefers-reduced-motion.
RTL/Hebrew: correct dir, mirrored layout, lang attribute.
METHOD: run axe-core / pa11y first for the automatable ~30%, then MANUAL-check what automation misses (focus, order, screen-reader meaning). Report issue + WCAG criterion + the fix.`,
};

/** Append the named skills' knowledge to a system prompt. Guarded: unknown
 *  names are skipped, so this can never break an existing agent.
 *  Byte-for-byte the same logic as the source withSkills. */
export function withSkills(basePrompt: string, skills?: string[]): string {
  if (!skills?.length) return basePrompt;
  const blocks = skills
    .map((s) => ({ name: s, body: SKILL_REGISTRY[s as SkillName] }))
    .filter((b) => Boolean(b.body))
    .map((b) => `[skill: ${b.name}]\n${b.body}`);
  if (!blocks.length) return basePrompt;
  return `${basePrompt}\n\n--- Domain skills (apply these) ---\n${blocks.join("\n\n")}`;
}
