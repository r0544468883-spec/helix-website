// HELIX Autonomy Switch — proactive degradation layer (Von rule 3)
// Copy into each product's lib/autonomy/. Each product implements detect() over
// its own domain; the wiring to the guard is identical everywhere.

import type { AutonomyMode, Degradation, ProposedAction } from './types';
import { runAction, type ActionSinks } from './guard';

// A product supplies: how to find degradations, and how to turn one into a
// concrete remediation action. The proactive loop below is shared.
export interface DegradationEngine<T> {
  detect(workspaceId: string): Promise<Degradation[]>;
  remediation(d: Degradation): ProposedAction<T>;
}

/**
 * Run one proactive sweep for a workspace:
 *   detect "X is slipping" -> for each, route the remediation through the guard.
 * advisor => just alert; approve => enqueue a fix; autopilot => fix + notify.
 * `mode` is resolved once by the caller (resolveMode) for this feature_key.
 */
export async function sweep<T>(
  workspaceId: string,
  mode: AutonomyMode,
  engine: DegradationEngine<T>,
  sinks: ActionSinks<T>,
): Promise<Array<{ degradation: Degradation; disposition: string }>> {
  const found = await engine.detect(workspaceId);
  const out: Array<{ degradation: Degradation; disposition: string }> = [];
  for (const d of found) {
    const action = engine.remediation(d);
    const { disposition } = await runAction(mode, action, sinks);
    out.push({ degradation: d, disposition });
  }
  return out;
}
