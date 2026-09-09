import { createClient } from '@/lib/supabase/server';
import { getWorkspace } from '@/lib/crm-workspace';
import AutonomySwitch from '@/components/AutonomySwitch';

export const dynamic = 'force-dynamic';

type Mode = 'advisor' | 'approve' | 'autopilot';
const FEATURES: { key: string; label: string; risky: boolean }[] = [
  { key: 'crm.next_step', label: '🩹 next-step לעסקאות מידרדרות', risky: false },
  { key: 'crm.followup', label: '📩 פולואפ אוטומטי ללידים', risky: true },
  { key: 'crm.deal_move', label: '↔️ הזזת עסקאות בפייפליין', risky: false },
];

export default async function CrmAutonomyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const settings: Record<string, { mode: Mode; risk_ack: boolean }> = {};
  if (user) {
    const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
    if (ws) {
      const { data: rows } = await supabase.from('autonomy_settings').select('feature_key, mode, risk_ack').eq('workspace_id', ws.workspaceId);
      for (const r of (rows ?? []) as { feature_key: string; mode: Mode; risk_ack: boolean }[]) settings[r.feature_key] = { mode: r.mode, risk_ack: r.risk_ack };
    }
  }

  return (
    <main dir="rtl" style={{ maxWidth: 860, margin: '0 auto', padding: 'clamp(20px,4vw,48px)' }}>
      <h1 style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 800, margin: '0 0 6px' }}>⚙️ מתג אוטונומיה — CRM</h1>
      <p style={{ color: 'var(--ink-2, #6b7280)', fontSize: 14, margin: '0 0 20px' }}>כמה חופש לתת ל-CRM לפעול לבד. ברירת מחדל בטוחה: המלצה בלבד.</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 12 }}>
        {FEATURES.map((f) => (
          <AutonomySwitch key={f.key} featureKey={f.key} label={f.label} risky={f.risky}
            initialMode={settings[f.key]?.mode ?? 'advisor'} initialRiskAck={settings[f.key]?.risk_ack ?? false} />
        ))}
      </div>
    </main>
  );
}
