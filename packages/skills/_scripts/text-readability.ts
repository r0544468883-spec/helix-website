// text-readability.ts
// Language-agnostic readability heuristics (Hebrew + English).
// Pure TypeScript, zero external deps, deterministic, no network.

export interface ReadabilityResult {
  sentences: number;
  avgWordsPerSentence: number;
  longSentences: string[];
  passiveHints: number;
}

const LONG_SENTENCE_WORDS = 28;

// English passive-voice hints: a "be" verb followed (nearby) by a past
// participle ending in -ed/-en, plus common irregular participles.
const BE_VERBS = /\b(is|are|was|were|be|been being|being|been)\b/i;
const EN_PASSIVE =
  /\b(is|are|was|were|be|been|being)\s+(\w+ed|\w+en|done|made|given|taken|seen|known|shown|built|held|kept|sent|written|found|told|paid|felt|left)\b/gi;

// Hebrew passive/impersonal hints: nif'al / pu'al / huf'al prefixes are hard
// to catch by morphology alone, so we flag common passive/agentless markers.
const HE_PASSIVE = /(נעשה|נעשתה|נעשו|נבנה|נבנתה|נמסר|נמסרה|נקבע|נקבעה|בוצע|בוצעה|הוחלט|נאמר|נמצא|נכתב|התקבל|התקבלה|מבוצע|מיושם)/g;

/**
 * Split text into sentences using terminal punctuation for both scripts.
 * Handles ". ! ? \n" and the Hebrew maqaf/sof-pasuk edge lightly.
 */
export function splitSentences(text: string): string[] {
  return text
    // Break on sentence terminators (Latin + fullwidth) or hard newlines.
    .split(/(?<=[.!?…۔。！？])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /[\p{L}\p{N}]/u.test(s));
}

/** Count word-like tokens (unicode letters/numbers), script-agnostic. */
export function countWords(text: string): number {
  const m = text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu);
  return m ? m.length : 0;
}

export function readability(text: string): ReadabilityResult {
  const sentences = splitSentences(text);
  const sentenceCount = sentences.length;

  let totalWords = 0;
  const longSentences: string[] = [];
  for (const s of sentences) {
    const w = countWords(s);
    totalWords += w;
    if (w > LONG_SENTENCE_WORDS) longSentences.push(s);
  }

  const avgWordsPerSentence =
    sentenceCount === 0 ? 0 : round2(totalWords / sentenceCount);

  // Passive hints counted across the whole text (both languages).
  const enPassive = (text.match(EN_PASSIVE) ?? []).length;
  const hePassive = (text.match(HE_PASSIVE) ?? []).length;
  const passiveHints = enPassive + hePassive;

  return {
    sentences: sentenceCount,
    avgWordsPerSentence,
    longSentences,
    passiveHints,
  };
}

// ---------- helpers ----------

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// Exported for potential reuse / testing of the be-verb heuristic.
export function hasBeVerb(text: string): boolean {
  return BE_VERBS.test(text);
}
