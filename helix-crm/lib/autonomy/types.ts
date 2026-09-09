// HELIX Autonomy Switch — canonical types. Source: helix/PRODUCTS/autonomy-reference.

export type AutonomyMode = 'advisor' | 'approve' | 'autopilot';
export type RiskClass = 'internal' | 'outbound' | 'money' | 'tos';

export interface Degradation {
  entity: string;   // "deal:<id>"
  metric: string;   // "days_since_activity"
  direction: 'down' | 'up';
  severity: 'info' | 'warn' | 'crit';
  detail?: string;
}

export const RISK_BY_FEATURE: Record<string, RiskClass> = {
  'crm.deal_move': 'internal',
  'crm.followup': 'outbound',
  'crm.next_step': 'internal',
};

export function riskOf(featureKey: string): RiskClass {
  return RISK_BY_FEATURE[featureKey] ?? 'outbound';
}

export function needsRiskAck(featureKey: string): boolean {
  return riskOf(featureKey) !== 'internal';
}
