// HELIX Autonomy Switch — canonical types (copy into each product's lib/autonomy/)

export type AutonomyMode = 'advisor' | 'approve' | 'autopilot';

// Blast radius of a feature. Drives whether autopilot needs an explicit risk_ack.
export type RiskClass = 'internal' | 'outbound' | 'money' | 'tos';

export interface AutonomySettings {
  workspaceId: string;
  featureKey: string;
  mode: AutonomyMode;
  riskAck: boolean;
  dailyCap: number | null;
}

// What the guard tells a feature to do with a proposed action.
export type Disposition = 'display' | 'enqueue' | 'execute';

export interface ProposedAction<T = unknown> {
  featureKey: string;
  summary: string; // human-readable "what will happen"
  payload: T;
}

// Output shape of every product's proactive degradation detector (Von rule 3).
export interface Degradation {
  entity: string; // "deal:123", "ad:abc", "keyword:seo tips", "cohort:2026-W31"
  metric: string; // "win_prob", "roas", "position", "d7_retention"
  direction: 'down' | 'up';
  severity: 'info' | 'warn' | 'crit';
  detail?: string;
}

// Feature keys are the stable identifiers from AUTONOMY-SWITCH-SPEC.md §4.
export const RISK_BY_FEATURE: Record<string, RiskClass> = {
  // OPS
  'ops.engagement': 'tos',
  'ops.ads': 'money',
  'ops.campaign_publish': 'outbound',
  'ops.radar_outreach': 'outbound',
  'ops.landing_publish': 'internal',
  // SDR
  'sdr.outreach': 'outbound',
  'sdr.inbound_reply': 'outbound',
  'sdr.lifecycle': 'outbound',
  'sdr.enrich_trigger': 'internal',
  // Rank
  'rank.publish': 'outbound',
  'rank.patch': 'outbound',
  'rank.edit_page': 'tos',
  'rank.meta_fix': 'tos',
  // PLUG
  'plug.apply': 'tos',
  'plug.autofill': 'tos',
  'plug.social_engage': 'tos',
  // Dashboards
  'dash.build_widget': 'internal',
  'dash.cross_act': 'internal',
  // Growth Doctor
  'gd.ab_test': 'internal',
  'gd.edit_landing': 'tos',
  'gd.campaign': 'outbound',
  'gd.winback': 'outbound',
  // STAGE-CRM
  'crm.deal_move': 'internal',
  'crm.followup': 'outbound',
  'crm.next_step': 'internal',
};

export function riskOf(featureKey: string): RiskClass {
  return RISK_BY_FEATURE[featureKey] ?? 'outbound'; // unknown => treat as risky
}

export function needsRiskAck(featureKey: string): boolean {
  return riskOf(featureKey) !== 'internal';
}
