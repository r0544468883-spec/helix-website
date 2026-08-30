// ============================================================
// brand-voice-lint.ts
// ------------------------------------------------------------
// Deterministic HELIX brand-voice checker. An agent calls this
// instead of eyeballing text for banned phrasing. Pure TypeScript,
// zero dependencies, runs under Deno.
//
// Rules are distilled from the "helix-brand-voice" registry entry in
// supabase/functions/_shared/ai-kit/skills/registry.ts:
//   - NEVER use an em-dash (U+2014). Also avoid decorative dashes.
//   - BANNED AI-TELLS: unlock, elevate, seamless, game-changer,
//     cutting-edge, world-class, "in today's fast-paced world",
//     "excited to share", "let that sink in", "plot twist".
// ============================================================

export type BrandVoiceRule =
  | "em-dash"
  | "decorative-dash"
  | "banned-ai-tell";

export interface BrandVoiceViolation {
  rule: BrandVoiceRule;
  /** 0-based character index into the original text where the match starts. */
  index: number;
  /** The exact matched substring (or a short surrounding window). */
  excerpt: string;
}

export interface BrandVoiceResult {
  ok: boolean;
  violations: BrandVoiceViolation[];
}

/** The em-dash character (U+2014). */
export const EM_DASH = "—";

/**
 * Banned AI-tell phrases, sourced verbatim from the helix-brand-voice
 * registry entry. Matched case-insensitively as whole words / phrases.
 */
export const BANNED_AI_TELLS: readonly string[] = [
  "unlock",
  "elevate",
  "seamless",
  "game-changer",
  "cutting-edge",
  "world-class",
  "in today's fast-paced world",
  "excited to share",
  "let that sink in",
  "plot twist",
];

/** Remove every em-dash from the text (helper for auto-fix callers). */
export function stripEmDash(text: string): string {
  return text.split(EM_DASH).join("");
}

/** Escape a literal string for safe use inside a RegExp. */
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * A short excerpt window around a match, so an agent can locate the
 * problem in context without re-scanning the whole string.
 */
function windowAround(text: string, index: number, matchLen: number): string {
  const pad = 12;
  const start = Math.max(0, index - pad);
  const end = Math.min(text.length, index + matchLen + pad);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";
  return prefix + text.slice(start, end) + suffix;
}

/**
 * Lint text against the HELIX brand voice. Returns every violation with
 * its position and an excerpt. Deterministic and side-effect free.
 */
export function lintBrandVoice(text: string): BrandVoiceResult {
  const violations: BrandVoiceViolation[] = [];

  // 1. Em-dash anywhere.
  for (let i = 0; i < text.length; i++) {
    if (text[i] === EM_DASH) {
      violations.push({
        rule: "em-dash",
        index: i,
        excerpt: windowAround(text, i, 1),
      });
    }
  }

  // 2. Decorative dashes: runs of ASCII hyphens/en-dashes used as
  //    ornamentation (e.g. " -- " or " --- ") OR an en-dash used as a
  //    sentence dash (spaced). These are decorative, not hyphenation.
  const decorative = /(?:\s[-–]{1,}\s)|(?:[-–]{2,})/g;
  for (const m of text.matchAll(decorative)) {
    // Skip if this is actually inside an em-dash we already flagged; en/hyphen only here.
    violations.push({
      rule: "decorative-dash",
      index: m.index ?? 0,
      excerpt: windowAround(text, m.index ?? 0, m[0].length),
    });
  }

  // 3. Banned AI-tells (case-insensitive). Word-boundary aware where the
  //    phrase begins/ends with a word char, so "unlocked" does not match
  //    "unlock" but "unlock" as a word does.
  for (const phrase of BANNED_AI_TELLS) {
    const startsWord = /^\w/.test(phrase);
    const endsWord = /\w$/.test(phrase);
    const pattern =
      (startsWord ? "\\b" : "") +
      escapeRegExp(phrase) +
      (endsWord ? "\\b" : "");
    const re = new RegExp(pattern, "gi");
    for (const m of text.matchAll(re)) {
      violations.push({
        rule: "banned-ai-tell",
        index: m.index ?? 0,
        excerpt: m[0],
      });
    }
  }

  // Stable ordering: by position, then rule name.
  violations.sort((a, b) => a.index - b.index || a.rule.localeCompare(b.rule));

  return { ok: violations.length === 0, violations };
}
