import {
  assert,
  assertAlmostEquals,
  assertEquals,
  assertThrows,
} from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  cacPaybackMonths,
  caclTvRatio,
  financeAlerts,
  ltv,
  nrr,
} from "./finance-calc.ts";

Deno.test("nrr basic and >100 growth", () => {
  // (1000 + 200 - 50 - 100) / 1000 = 1.05 -> 105%
  assertAlmostEquals(
    nrr({ start: 1000, expansion: 200, contraction: 50, churn: 100 }),
    105,
    1e-9,
  );
});

Deno.test("nrr throws on zero start", () => {
  assertThrows(() =>
    nrr({ start: 0, expansion: 1, contraction: 0, churn: 0 })
  );
});

Deno.test("nrr throws on missing input", () => {
  // deno-lint-ignore no-explicit-any
  assertThrows(() => nrr({ start: 1000 } as any));
});

Deno.test("ltv accepts pct as fraction or percent", () => {
  // arpa 100, 80% margin, 5% churn -> 100*0.8/0.05 = 1600
  assertAlmostEquals(
    ltv({ arpa: 100, grossMarginPct: 0.8, monthlyChurnPct: 0.05 }),
    1600,
    1e-9,
  );
  assertAlmostEquals(
    ltv({ arpa: 100, grossMarginPct: 80, monthlyChurnPct: 5 }),
    1600,
    1e-9,
  );
});

Deno.test("ltv throws on zero churn", () => {
  assertThrows(() =>
    ltv({ arpa: 100, grossMarginPct: 0.8, monthlyChurnPct: 0 })
  );
});

Deno.test("cacPaybackMonths", () => {
  // 400 / (100 * 0.8) = 5
  assertAlmostEquals(
    cacPaybackMonths({ cac: 400, arpa: 100, grossMarginPct: 0.8 }),
    5,
    1e-9,
  );
});

Deno.test("caclTvRatio", () => {
  assertEquals(caclTvRatio({ cac: 500, ltv: 1500 }), 3);
  assertThrows(() => caclTvRatio({ cac: 0, ltv: 1500 }));
});

Deno.test("financeAlerts triggers all four", () => {
  const alerts = financeAlerts({
    cac: 2000,
    ltv: 1000,
    nrrPct: 92,
    cacPaybackMonths: 18,
    runwayMonths: 3,
  });
  const codes = alerts.map((a) => a.code).sort();
  assertEquals(codes, [
    "cac-gt-ltv",
    "nrr-below-100",
    "payback-over-12",
    "runway-under-6",
  ]);
});

Deno.test("financeAlerts silent on healthy + missing fields", () => {
  const alerts = financeAlerts({ nrrPct: 115, runwayMonths: 24 });
  assertEquals(alerts.length, 0);
});

Deno.test("financeAlerts never fabricates a missing metric", () => {
  // Only cac present, no ltv -> no cac-gt-ltv alert.
  const alerts = financeAlerts({ cac: 5000 });
  assertEquals(alerts.length, 0);
});
