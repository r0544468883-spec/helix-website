import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  BANNED_AI_TELLS,
  EM_DASH,
  lintBrandVoice,
  stripEmDash,
} from "./brand-voice-lint.ts";

Deno.test("clean text passes", () => {
  const r = lintBrandVoice("בנינו OCR pipeline מדויק. קבע שיחת היכרות.");
  assert(r.ok);
  assertEquals(r.violations.length, 0);
});

Deno.test("flags an em-dash with position and excerpt", () => {
  const text = "We ship fast" + EM_DASH + "and clean.";
  const r = lintBrandVoice(text);
  assert(!r.ok);
  const emDash = r.violations.find((v) => v.rule === "em-dash");
  assert(emDash, "expected an em-dash violation");
  assertEquals(emDash!.index, text.indexOf(EM_DASH));
  assert(emDash!.excerpt.includes(EM_DASH));
});

Deno.test("flags each banned AI-tell case-insensitively", () => {
  const r = lintBrandVoice("This will Unlock and elevate your SEAMLESS workflow.");
  const tells = r.violations.filter((v) => v.rule === "banned-ai-tell");
  assertEquals(tells.length, 3);
  assert(!r.ok);
});

Deno.test("flags multi-word banned phrase", () => {
  const r = lintBrandVoice("Excited to share our launch!");
  const tell = r.violations.find((v) => v.rule === "banned-ai-tell");
  assert(tell);
  assertEquals(tell!.excerpt.toLowerCase(), "excited to share");
});

Deno.test("does not flag substrings of banned words", () => {
  // "unlocked" contains "unlock" but is a different word.
  const r = lintBrandVoice("The door was unlocked already.");
  const tells = r.violations.filter((v) => v.rule === "banned-ai-tell");
  assertEquals(tells.length, 0);
});

Deno.test("flags decorative dashes", () => {
  const r = lintBrandVoice("Great value -- really -- for teams.");
  const deco = r.violations.filter((v) => v.rule === "decorative-dash");
  assert(deco.length >= 1);
});

Deno.test("stripEmDash removes all em-dashes", () => {
  const text = `a${EM_DASH}b${EM_DASH}c`;
  assertEquals(stripEmDash(text), "abc");
});

Deno.test("registry banned list is present", () => {
  assert(BANNED_AI_TELLS.includes("game-changer"));
  assert(BANNED_AI_TELLS.includes("plot twist"));
});
