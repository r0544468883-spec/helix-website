import { assert, assertEquals } from "jsr:@std/assert@1";
import { readability, splitSentences, countWords } from "./text-readability.ts";

Deno.test("splitSentences splits on terminal punctuation and newlines", () => {
  const s = splitSentences("Hello world. How are you? I am fine!\nNew line here.");
  assertEquals(s.length, 4);
});

Deno.test("countWords is script-agnostic", () => {
  assertEquals(countWords("one two three"), 3);
  assertEquals(countWords("שלום עולם גדול"), 3);
  assertEquals(countWords("well-known state-of-the-art"), 2);
});

Deno.test("readability basic counts", () => {
  const r = readability("The cat sat. The dog ran.");
  assertEquals(r.sentences, 2);
  assertEquals(r.avgWordsPerSentence, 3); // 3 words each
  assertEquals(r.longSentences.length, 0);
});

Deno.test("long sentence (>28 words) flagged", () => {
  const words = Array.from({ length: 32 }, (_, i) => `word${i}`).join(" ");
  const r = readability(words + ".");
  assertEquals(r.sentences, 1);
  assertEquals(r.longSentences.length, 1);
  assert(r.avgWordsPerSentence > 28);
});

Deno.test("sentence exactly 28 words is not long", () => {
  const words = Array.from({ length: 28 }, (_, i) => `w${i}`).join(" ");
  const r = readability(words + ".");
  assertEquals(r.longSentences.length, 0);
});

Deno.test("English passive voice hints counted", () => {
  const r = readability("The report was written by the team. Mistakes were made.");
  assert(r.passiveHints >= 2);
});

Deno.test("active voice yields zero passive hints", () => {
  const r = readability("The team writes the report. We ship features daily.");
  assertEquals(r.passiveHints, 0);
});

Deno.test("Hebrew text: sentences, words, passive hints", () => {
  const text = "ההחלטה התקבלה אתמול. הצוות בנה מוצר חדש והשיק אותו לשוק.";
  const r = readability(text);
  assertEquals(r.sentences, 2);
  assert(r.avgWordsPerSentence > 0);
  assert(r.passiveHints >= 1); // "התקבלה"
});

Deno.test("Hebrew long sentence flagged", () => {
  const longHe = Array.from({ length: 30 }, () => "מילה").join(" ") + ".";
  const r = readability(longHe);
  assertEquals(r.longSentences.length, 1);
});

Deno.test("empty text is safe", () => {
  const r = readability("   ");
  assertEquals(r.sentences, 0);
  assertEquals(r.avgWordsPerSentence, 0);
  assertEquals(r.longSentences.length, 0);
  assertEquals(r.passiveHints, 0);
});
