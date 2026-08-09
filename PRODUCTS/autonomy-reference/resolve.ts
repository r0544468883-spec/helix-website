// HELIX Autonomy Switch — mode resolution (copy into each product's lib/autonomy/)
//
// resolveMode() is the ONE function features call to learn what they may do.
// It is deliberately fail-safe: any error, missing row, or missing risk_ack
// can only ever DOWNGRADE autonomy, never escalate it.

import type { AutonomyMode } from './types';
import { needsRiskAck } from './types';

// Each product injects its own Supabase admin/server client + membership scoping.
export interface AutonomyStore {
  // Return the raw row for (workspace, feature) or null if none exists.
  getSettings(
    workspaceId: string,
    featureKey: string,
  ): Promise<{ mode: AutonomyMode; risk_ack: boolean } | null>;
}

/**
 * Resolve the effective mode for a feature in a workspace.
 * - No row            -> 'advisor'   (safe default)
 * - autopilot + risky feature without risk_ack -> downgraded to 'approve'
 * - any store error   -> 'advisor'   (fail closed)
 */
export async function resolveMode(
  store: AutonomyStore,
  workspaceId: string,
  featureKey: string,
): Promise<AutonomyMode> {
  let row: { mode: AutonomyMode; risk_ack: boolean } | null = null;
  try {
    row = await store.getSettings(workspaceId, featureKey);
  } catch {
    return 'advisor';
  }
  if (!row) return 'advisor';

  if (row.mode === 'autopilot' && needsRiskAck(featureKey) && !row.risk_ack) {
    return 'approve'; // opt-in guard: risky autopilot without ack falls back to HITL
  }
  return row.mode;
}

// ---- Adapters for legacy per-product controls (§2 of the spec) --------------
// These let already-shipped products expose the canonical mode WITHOUT a
// migration, by translating their existing column. Migrate to autonomy_settings
// later; until then, wrap the legacy value.

export function fromOpsPerformance(
  executionMode: 'brain' | 'connector',
  autonomy: 'approve' | 'autopilot',
): AutonomyMode {
  if (executionMode === 'brain') return 'advisor';
  return autonomy === 'autopilot' ? 'autopilot' : 'approve';
}

export function fromSdrTrust(trust: 'founder' | 'growth' | 'pro'): AutonomyMode {
  return trust === 'pro' ? 'autopilot' : 'approve';
}

export function fromExtensionMode(mode: 'review' | 'auto'): AutonomyMode {
  return mode === 'auto' ? 'autopilot' : 'approve';
}
