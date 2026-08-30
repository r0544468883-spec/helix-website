// ============================================================
// finance-calc.ts
// ------------------------------------------------------------
// Deterministic SaaS unit-economics math. An agent calls these instead
// of doing arithmetic in its head (where it can drift). Numbers in ->
// numbers/flags out. NEVER invents an input: if a required field is
// missing/NaN the function throws, it does not guess a value.
//
// Formulas distilled from the "finance-metrics" registry entry:
//   NRR = (start + expansion - contraction - churn) / start   (healthy >100%)
//   LTV = ARPA x gross-margin ÷ monthly churn
//   CAC payback (months) = CAC / (ARPA x gross-margin)
//   CAC:LTV target >= 1:3
// Alerts: CAC > LTV; NRR < 100%; payback > 12mo; runway < 6mo.
// ============================================================

function req(name: string, v: number): number {
  if (typeof v !== "number" || Number.isNaN(v)) {
    throw new Error(`finance-calc: missing/invalid input "${name}"`);
  }
  return v;
}

/** Accept a percentage given either as 0-1 (0.8) or 0-100 (80). */
function asFraction(pct: number): number {
  return pct > 1 ? pct / 100 : pct;
}

export interface NrrInput {
  start: number; // MRR at start of window
  expansion: number; // expansion MRR in window
  contraction: number; // contraction MRR in window
  churn: number; // churned MRR in window
}

/**
 * Net Revenue Retention as a percentage (100 = flat, >100 = net growth).
 * Throws if start is 0 (undefined ratio) or any input is missing.
 */
export function nrr({ start, expansion, contraction, churn }: NrrInput): number {
  req("start", start);
  req("expansion", expansion);
  req("contraction", contraction);
  req("churn", churn);
  if (start === 0) throw new Error("finance-calc: nrr start must be non-zero");
  return ((start + expansion - contraction - churn) / start) * 100;
}

export interface LtvInput {
  arpa: number; // average revenue per account (per month)
  grossMarginPct: number; // 0-1 or 0-100
  monthlyChurnPct: number; // 0-1 or 0-100
}

/**
 * Lifetime value = ARPA x gross-margin ÷ monthly churn.
 * Throws if churn is 0 (infinite LTV is not a usable figure).
 */
export function ltv({ arpa, grossMarginPct, monthlyChurnPct }: LtvInput): number {
  req("arpa", arpa);
  req("grossMarginPct", grossMarginPct);
  req("monthlyChurnPct", monthlyChurnPct);
  const churn = asFraction(monthlyChurnPct);
  if (churn === 0) {
    throw new Error("finance-calc: monthlyChurnPct must be > 0 for LTV");
  }
  return (arpa * asFraction(grossMarginPct)) / churn;
}

export interface CacPaybackInput {
  cac: number;
  arpa: number;
  grossMarginPct: number; // 0-1 or 0-100
}

/**
 * Months to recover CAC = CAC / (ARPA x gross-margin).
 * Throws if the gross-margin contribution is 0 (never pays back).
 */
export function cacPaybackMonths(
  { cac, arpa, grossMarginPct }: CacPaybackInput,
): number {
  req("cac", cac);
  req("arpa", arpa);
  req("grossMarginPct", grossMarginPct);
  const monthlyContribution = arpa * asFraction(grossMarginPct);
  if (monthlyContribution === 0) {
    throw new Error(
      "finance-calc: arpa x grossMargin must be > 0 for payback",
    );
  }
  return cac / monthlyContribution;
}

export interface CacLtvInput {
  cac: number;
  ltv: number;
}

/**
 * LTV-to-CAC ratio (the "3" in a healthy 1:3). Named caclTvRatio per the
 * task spec. Throws if CAC is 0.
 */
export function caclTvRatio({ cac, ltv }: CacLtvInput): number {
  req("cac", cac);
  req("ltv", ltv);
  if (cac === 0) throw new Error("finance-calc: cac must be > 0 for ratio");
  return ltv / cac;
}

export interface FinanceSnapshot {
  cac?: number;
  ltv?: number;
  nrrPct?: number; // already a percentage (100 = flat)
  cacPaybackMonths?: number;
  runwayMonths?: number;
}

export interface FinanceAlert {
  code: "cac-gt-ltv" | "nrr-below-100" | "payback-over-12" | "runway-under-6";
  message: string;
}

/**
 * Given a snapshot of already-computed metrics, return the triggered
 * alerts. Only evaluates fields that are present, never fabricates a
 * value for a missing metric.
 */
export function financeAlerts(snapshot: FinanceSnapshot): FinanceAlert[] {
  const alerts: FinanceAlert[] = [];

  if (
    typeof snapshot.cac === "number" &&
    typeof snapshot.ltv === "number" &&
    !Number.isNaN(snapshot.cac) &&
    !Number.isNaN(snapshot.ltv) &&
    snapshot.cac > snapshot.ltv
  ) {
    alerts.push({
      code: "cac-gt-ltv",
      message:
        `CAC (${snapshot.cac}) exceeds LTV (${snapshot.ltv}): acquiring at a loss.`,
    });
  }

  if (
    typeof snapshot.nrrPct === "number" &&
    !Number.isNaN(snapshot.nrrPct) &&
    snapshot.nrrPct < 100
  ) {
    alerts.push({
      code: "nrr-below-100",
      message: `NRR ${snapshot.nrrPct.toFixed(1)}% is below 100% (net contraction).`,
    });
  }

  if (
    typeof snapshot.cacPaybackMonths === "number" &&
    !Number.isNaN(snapshot.cacPaybackMonths) &&
    snapshot.cacPaybackMonths > 12
  ) {
    alerts.push({
      code: "payback-over-12",
      message:
        `CAC payback ${snapshot.cacPaybackMonths.toFixed(1)}mo exceeds 12mo target.`,
    });
  }

  if (
    typeof snapshot.runwayMonths === "number" &&
    !Number.isNaN(snapshot.runwayMonths) &&
    snapshot.runwayMonths < 6
  ) {
    alerts.push({
      code: "runway-under-6",
      message: `Runway ${snapshot.runwayMonths.toFixed(1)}mo is under 6mo.`,
    });
  }

  return alerts;
}
