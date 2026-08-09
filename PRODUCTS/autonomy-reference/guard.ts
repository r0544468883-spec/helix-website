// HELIX Autonomy Switch — the guard (copy into each product's lib/autonomy/)
//
// gate() turns a resolved mode into a disposition for a proposed action, and
// runAction() is the single choke point every executor feature funnels through.
// This is where "advisor vs executor" actually becomes real, uniformly.

import type { AutonomyMode, Disposition, ProposedAction } from './types';

export function gate(mode: AutonomyMode): Disposition {
  switch (mode) {
    case 'advisor':
      return 'display';
    case 'approve':
      return 'enqueue';
    case 'autopilot':
      return 'execute';
  }
}

export interface ActionSinks<T> {
  // advisor: surface the recommendation (return the card/insight payload).
  display: (a: ProposedAction<T>) => Promise<unknown> | unknown;
  // approve: write to the approval queue + notify; execution happens on ✓ later.
  enqueue: (a: ProposedAction<T>) => Promise<unknown> | unknown;
  // autopilot: perform the action now, then notify.
  execute: (a: ProposedAction<T>) => Promise<unknown> | unknown;
}

export interface GateResult {
  mode: AutonomyMode;
  disposition: Disposition;
  result: unknown;
}

/**
 * The universal executor entry point. Every feature that can "act" calls this
 * instead of acting directly, so the switch governs it consistently.
 */
export async function runAction<T>(
  mode: AutonomyMode,
  action: ProposedAction<T>,
  sinks: ActionSinks<T>,
): Promise<GateResult> {
  const disposition = gate(mode);
  let result: unknown;
  if (disposition === 'display') result = await sinks.display(action);
  else if (disposition === 'enqueue') result = await sinks.enqueue(action);
  else result = await sinks.execute(action);
  return { mode, disposition, result };
}
