'use server';

// The dashboard builder's persistence: one personal layout per user per
// workspace (crm_dashboards, service-role only). The widget catalog itself
// lives in components/CrmDashboard.tsx; here we only validate shape.

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace } from '@/lib/crm-workspace';

export type WidgetSize = 's' | 'm' | 'l';
export type WidgetSpec = { t: string; s: WidgetSize };

const SIZES: WidgetSize[] = ['s', 'm', 'l'];
export const WIDGET_TYPES = [
  'kpi_contacts', 'kpi_hot', 'kpi_pipeline', 'kpi_winrate',
  'funnel', 'today', 'stalled', 'activity', 'sources',
] as const;

export async function saveDashboardLayout(layout: WidgetSpec[]): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'auth' };
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) return { ok: false, error: 'workspace' };
  const admin = createAdminClient();
  if (!admin) return { ok: false, error: 'noadmin' };

  const clean: WidgetSpec[] = (Array.isArray(layout) ? layout : [])
    .filter((w) => w && (WIDGET_TYPES as readonly string[]).includes(w.t) && SIZES.includes(w.s))
    .slice(0, 20);

  const { error } = await admin.from('crm_dashboards').upsert(
    { workspace_id: ws.workspaceId, user_id: user.id, layout: clean, updated_at: new Date().toISOString() },
    { onConflict: 'workspace_id,user_id' },
  );
  return error ? { ok: false, error: 'save_failed' } : { ok: true };
}
