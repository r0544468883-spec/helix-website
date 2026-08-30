import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import { spamRisk } from "./spam-check.ts";

Deno.test("plain human note is low risk", () => {
  const r = spamRisk(
    "Hi Dana, saw you launched the new pricing page. Worth a 15-min call this week?",
  );
  assertEquals(r.risk, "low");
  assertEquals(r.hits.length, 0);
});

Deno.test("stacked spam words go high", () => {
  const r = spamRisk("Act now for a FREE guarantee, limited time only!!!");
  assertEquals(r.risk, "high");
  assert(r.score >= 4);
  assert(r.hits.some((h) => h.includes("free")));
  assert(r.hits.some((h) => h.includes("guarantee")));
});

Deno.test("excessive exclamation marks are flagged", () => {
  const r = spamRisk("Read this!!!");
  assert(r.hits.some((h) => h.toLowerCase().includes("exclamation")));
});

Deno.test("ALL-CAPS words are flagged but short acronyms are not", () => {
  const r = spamRisk("This AI tool is a US product.");
  const capsHit = r.hits.find((h) => h.startsWith("ALL-CAPS"));
  assertEquals(capsHit, undefined, "short acronyms should not trigger");

  const r2 = spamRisk("BUY THIS AMAZING OFFER");
  assert(r2.hits.some((h) => h.startsWith("ALL-CAPS")));
});

Deno.test("too many links flagged", () => {
  const r = spamRisk(
    "See https://a.com and https://b.com and https://c.com now.",
  );
  assert(r.hits.some((h) => h.includes("links")));
});

Deno.test("excessive length flagged", () => {
  const r = spamRisk("word ".repeat(400));
  assert(r.hits.some((h) => h.includes("long body")));
});

Deno.test("deterministic score", () => {
  const text = "FREE guarantee act now!!!";
  assertEquals(spamRisk(text).score, spamRisk(text).score);
});
