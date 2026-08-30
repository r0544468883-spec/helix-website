import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getWorkspace } from '@/lib/crm-workspace';
import { TRIGGER_LABELS, type TriggerKind } from '@/lib/automations/types';
import NewAutomationButton from '@/components/NewAutomationButton';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

export default async function AutomationsPage({ params }: { params: Params }) {
  const { locale } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) redirect(`/${locale}/dashboard/crm`);

  const { data } = await supabase
    .from('automations').select('id, name, trigger, enabled, updated_at')
    .eq('workspace_id', ws.workspaceId).order('updated_at', { ascending: false });
  const rows = (data ?? []) as { id: string; name: string; trigger: string; enabled: boolean }[];

  return (
    <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight">אוטומציות</h1>
        <NewAutomationButton locale={locale} />
      </div>
      <p className="text-ink-secondary text-[15px] mb-8">בנו זרימות אוטומטיות — ויזואלית או בתיאור חופשי. כשמתרחש טריגר, הזרימה רצה לבד.</p>

      {rows.length === 0 ? (
        <div className="border border-dashed border-border rounded-2xl p-10 text-center text-ink-muted">
          עדיין אין אוטומציות. צרו את הראשונה — למשל: ״כשנכנס ליד, העשר, נקד, ואם חם — צור משימה״.
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((a) => (
            <Link key={a.id} href={`/${locale}/dashboard/automations/${a.id}`}
              className="flex items-center gap-3 bg-surface border border-border rounded-xl p-4 hover:border-brand transition-colors">
              <span className={`w-2.5 h-2.5 rounded-full ${a.enabled ? 'bg-brand' : 'bg-ink-muted/40'}`} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px]" dir="auto">{a.name}</div>
                <div className="text-ink-muted text-[12px]">טריגר: {TRIGGER_LABELS[a.trigger as TriggerKind] ?? a.trigger}</div>
              </div>
              <span className={`text-[11px] font-bold uppercase ${a.enabled ? 'text-brand' : 'text-ink-muted'}`}>{a.enabled ? 'פעיל' : 'כבוי'}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
