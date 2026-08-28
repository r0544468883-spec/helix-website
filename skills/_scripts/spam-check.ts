// ============================================================
// spam-check.ts
// ------------------------------------------------------------
// Deterministic cold-outreach / email spam-trigger detector. An agent
// calls this before sending outbound so it never guesses whether copy
// will trip a spam filter. Pure TypeScript, zero dependencies, Deno-safe.
//
// Triggers distilled from the "cold-outreach-copy" registry entry:
// avoid ALL-CAPS, !!!, "free"/"guarantee" stacks, too many links.
// ============================================================

export type SpamRiskLevel = "low" | "high";

export interface SpamCheckResult {
  risk: SpamRiskLevel;
  /** Higher = spammier. Sum of weighted hit contributions. */
  score: number;
  /** Human-readable list of what tripped, most relevant first. */
  hits: string[];
}

/** Spam trigger words/phrases (matched case-insensitively). */
export const SPAM_WORDS: readonly string[] = [
  "free",
  "guarantee",
  "guaranteed",
  "act now",
  "limited time",
  "click here",
  "$$$",
  "risk-free",
  "no obligation",
  "winner",
  "cash bonus",
  "buy now",
  "order now",
];

const MAX_LINKS = 2;
const LONG_TEXT_CHARS = 1500;
const CAPS_WORD_MIN_LEN = 3; // ignore short acronyms like "AI", "US"

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Count links: http(s) URLs, www., and markdown/html anchors. */
function countLinks(text: string): number {
  const urls = text.match(/\bhttps?:\/\/\S+/gi)?.length ?? 0;
  const wwws = text.match(/\bwww\.\S+/gi)?.length ?? 0;
  return urls + wwws;
}

/** Count ALL-CAPS words (>=3 letters, all uppercase). */
function countCapsWords(text: string): string[] {
  const out: string[] = [];
  for (const m of text.matchAll(/\b[A-Z][A-Z0-9]{2,}\b/g)) {
    const word = m[0];
    // Require at least CAPS_WORD_MIN_LEN letters and no lowercase.
    const letters = word.replace(/[^A-Z]/g, "");
    if (letters.length >= CAPS_WORD_MIN_LEN) out.push(word);
  }
  return out;
}

/**
 * Score cold-outreach text for spam risk. Deterministic: same input
 * always yields the same score, level, and hit list.
 */
export function spamRisk(text: string): SpamCheckResult {
  const hits: string[] = [];
  let score = 0;

  // 1. Excessive exclamation marks (!!! or more, or many total).
  const bangRuns = text.match(/!{2,}/g) ?? [];
  if (bangRuns.length > 0) {
    score += 2 * bangRuns.length;
    hits.push(`excessive exclamation marks (${bangRuns.length} run(s))`);
  }
  const totalBangs = (text.match(/!/g) ?? []).length;
  if (totalBangs >= 4) {
    score += 1;
    hits.push(`${totalBangs} exclamation marks total`);
  }

  // 2. ALL-CAPS words.
  const caps = countCapsWords(text);
  if (caps.length > 0) {
    score += caps.length;
    hits.push(`ALL-CAPS word(s): ${caps.slice(0, 5).join(", ")}`);
  }

  // 3. Spam trigger words.
  for (const word of SPAM_WORDS) {
    const startsWord = /^[a-z0-9]/i.test(word);
    const endsWord = /[a-z0-9]$/i.test(word);
    const pattern =
      (startsWord ? "\\b" : "") +
      escapeRegExp(word) +
      (endsWord ? "\\b" : "");
    const re = new RegExp(pattern, "gi");
    const count = (text.match(re) ?? []).length;
    if (count > 0) {
      score += 2 * count;
      hits.push(`spam word "${word}" x${count}`);
    }
  }

  // 4. Too many links.
  const links = countLinks(text);
  if (links > MAX_LINKS) {
    score += 2 * (links - MAX_LINKS);
    hits.push(`${links} links (limit ${MAX_LINKS})`);
  }

  // 5. Excessive length (walls of text convert worse and look spammy).
  if (text.length > LONG_TEXT_CHARS) {
    score += 2;
    hits.push(`long body (${text.length} chars > ${LONG_TEXT_CHARS})`);
  }

  const risk: SpamRiskLevel = score >= 4 ? "high" : "low";
  return { risk, score, hits };
}
