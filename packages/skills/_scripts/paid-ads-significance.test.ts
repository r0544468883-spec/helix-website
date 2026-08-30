import {
  assert,
  assertEquals,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  adDecision,
  canJudge,
  type AdDecisionInput,
} from "./paid-ads-significance.ts";

Deno.test("canJudge gate", () => {
  assert(!canJudge({ conversions: 10, clicks: 200 }));
  assert(canJudge({ conversions: 50, clicks: 0 }));
  assert(canJudge({ conversions: 0, clicks: 1000 }));
});

const base: AdDecisionInput = {
  roas: 3,
  targetRoas: 3,
  cpaTrend: "stable",
  frequency: 1.5,
  ctrTrend: "stable",
  conversions: 80,
  clicks: 2000,
};

Deno.test("insufficient data -> hold", () => {
  const r = adDecision({ ...base, conversions: 5, clicks: 100 });
  assertEquals(r.decision, "hold-insufficient-data");
});

Deno.test("above target + stable -> scale", () => {
  const r = adDecision({ ...base, roas: 5, targetRoas: 3, cpaTrend: "stable" });
  assertEquals(r.decision, "scale");
});

Deno.test("cpa rising + high freq + ctr falling -> rotate-creative", () => {
  const r = adDecision({
    ...base,
    roas: 2,
    targetRoas: 3,
    cpaTrend: "rising",
    frequency: 3.2,
    ctrTrend: "falling",
  });
  assertEquals(r.decision, "rotate-creative");
});

Deno.test("cpa rising + low freq + ctr stable -> tighten-targeting", () => {
  const r = adDecision({
    ...base,
    roas: 2,
    targetRoas: 3,
    cpaTrend: "rising",
    frequency: 1.4,
    ctrTrend: "stable",
  });
  assertEquals(r.decision, "tighten-targeting");
});

Deno.test("below target + ctr rising -> fix-landing", () => {
  const r = adDecision({
    ...base,
    roas: 1.5,
    targetRoas: 3,
    cpaTrend: "stable",
    ctrTrend: "rising",
  });
  assertEquals(r.decision, "fix-landing");
});

Deno.test("below target + ctr falling + no fatigue pattern -> pause", () => {
  const r = adDecision({
    ...base,
    roas: 1.2,
    targetRoas: 3,
    cpaTrend: "falling",
    frequency: 1.1,
    ctrTrend: "falling",
  });
  assertEquals(r.decision, "pause");
});

Deno.test("mixed above-target signals -> hold", () => {
  const r = adDecision({
    ...base,
    roas: 4,
    targetRoas: 3,
    cpaTrend: "rising",
    frequency: 1.2,
    ctrTrend: "falling",
  });
  assertEquals(r.decision, "hold-insufficient-data");
});
