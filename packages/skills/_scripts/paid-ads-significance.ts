// ============================================================
// paid-ads-significance.ts
// ------------------------------------------------------------
// Deterministic paid-ads decision helper. An agent calls this so it never
// acts on statistically insignificant data and always follows the same
// decision table. Pure TypeScript, zero dependencies, Deno-safe.
//
// Distilled from the "paid-ads" registry entry:
//   SIGNIFICANCE FIRST: never judge/act on an ad set with <50 conversions
//   or <~1,000 clicks.
//   DECISION TABLE:
//   - ROAS >= target + stable + enough volume  -> scale (+20-25% max)
//   - CPA rising + frequency >2-3 + CTR falling -> creative fatigue: rotate
//   - CPA rising + frequency low + CTR stable   -> audience/bid: tighten
//   - High CTR + low CVR                         -> post-click: fix landing
//   - ROAS < target + enough volume + no fix     -> pause
//   - Not enough data                            -> HOLD
// ============================================================

export type Trend = "rising" | "falling" | "stable";

export type AdDecision =
  | "hold-insufficient-data"
  | "scale"
  | "pause"
  | "rotate-creative"
  | "fix-landing"
  | "tighten-targeting";

export interface VolumeInput {
  conversions: number;
  clicks: number;
}

/** Significance gate: >=50 conversions OR >=~1,000 clicks. */
export const MIN_CONVERSIONS = 50;
export const MIN_CLICKS = 1000;

/** Frequency above this counts as "high" (creative-fatigue territory). */
export const HIGH_FREQUENCY = 2.5;

/**
 * Can we judge this ad set at all? True once it clears the significance
 * gate. Deterministic, no side effects.
 */
export function canJudge({ conversions, clicks }: VolumeInput): boolean {
  const conv = Number.isFinite(conversions) ? conversions : 0;
  const clk = Number.isFinite(clicks) ? clicks : 0;
  return conv >= MIN_CONVERSIONS || clk >= MIN_CLICKS;
}

export interface AdDecisionInput {
  roas: number;
  targetRoas: number;
  cpaTrend: Trend;
  frequency: number;
  ctrTrend: Trend;
  conversions: number;
  clicks: number;
}

export interface AdDecisionResult {
  decision: AdDecision;
  /** Why this decision fired, referencing the signals that drove it. */
  reason: string;
}

/**
 * Apply the paid-ads decision table. The significance gate wins over
 * everything: below it, always HOLD. Never invents a metric value; it
 * only reasons over what is passed in.
 */
export function adDecision(input: AdDecisionInput): AdDecisionResult {
  const {
    roas,
    targetRoas,
    cpaTrend,
    frequency,
    ctrTrend,
    conversions,
    clicks,
  } = input;

  // Cardinal rule: not enough data -> change nothing.
  if (!canJudge({ conversions, clicks })) {
    return {
      decision: "hold-insufficient-data",
      reason:
        `Below significance gate (${conversions} conv, ${clicks} clicks; ` +
        `need >=${MIN_CONVERSIONS} conv or >=${MIN_CLICKS} clicks). Wait for volume.`,
    };
  }

  const atOrAboveTarget = roas >= targetRoas;

  // ROAS above target + stable CPA -> scale (registry caps the +% at the caller).
  if (atOrAboveTarget && cpaTrend !== "rising") {
    return {
      decision: "scale",
      reason:
        `ROAS ${roas} >= target ${targetRoas} with CPA ${cpaTrend}. ` +
        `Scale budget +20-25% max, then wait 2-3 days.`,
    };
  }

  // CPA rising + frequency high + CTR falling -> creative fatigue.
  if (cpaTrend === "rising" && frequency > HIGH_FREQUENCY && ctrTrend === "falling") {
    return {
      decision: "rotate-creative",
      reason:
        `CPA rising, frequency ${frequency} > ${HIGH_FREQUENCY}, CTR falling: ` +
        `creative fatigue. Rotate creative, do not touch budget.`,
    };
  }

  // CPA rising + frequency low + CTR stable -> audience/bid issue.
  if (cpaTrend === "rising" && frequency <= HIGH_FREQUENCY && ctrTrend === "stable") {
    return {
      decision: "tighten-targeting",
      reason:
        `CPA rising, frequency ${frequency} low, CTR stable: audience/bid issue. ` +
        `Tighten targeting or lower bid.`,
    };
  }

  // High CTR (rising/stable click engagement) but ROAS below target ->
  // clicks arrive yet do not convert: post-click / landing problem.
  if (!atOrAboveTarget && (ctrTrend === "rising" || ctrTrend === "stable")) {
    return {
      decision: "fix-landing",
      reason:
        `ROAS ${roas} < target ${targetRoas} while CTR ${ctrTrend}: clicks ` +
        `do not convert. Post-click/landing problem, flag to CRO.`,
    };
  }

  // ROAS below target with enough volume and no fixable cause above -> pause.
  if (!atOrAboveTarget) {
    return {
      decision: "pause",
      reason:
        `ROAS ${roas} < target ${targetRoas} with sufficient volume and no ` +
        `fixable creative/targeting/landing cause. Pause the ad set.`,
    };
  }

  // At/above target but CPA rising and none of the fatigue/targeting
  // patterns matched cleanly: hold rather than act on an ambiguous signal.
  return {
    decision: "hold-insufficient-data",
    reason:
      `Signals are mixed (ROAS ${roas} vs target ${targetRoas}, CPA ${cpaTrend}, ` +
      `CTR ${ctrTrend}, freq ${frequency}). Hold and gather a cleaner window.`,
  };
}
