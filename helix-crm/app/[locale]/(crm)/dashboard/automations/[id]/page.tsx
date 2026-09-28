import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import { getDict } from '@/lib/i18n';
import AutomationBuilder from '@/components/AutomationBuilder';
import { THEME_COOKIE, themeFrom } from '@/lib/theme';
import { emptyGraph, TRIGGER_LABELS, type Graph, type TriggerKind } from '@/lib/automations/types';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string; id: string }>;

export default async function AutomationBuilderPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) redirect(`/${locale}/dashboard/crm`);

  const { data } = await supabase
    .from('automations').select('name, trigger, enabled, graph')
    .eq('id', id).eq('workspace_id', ws.workspaceId).maybeSingle();
  if (!data) redirect(`/${locale}/dashboard/automations`);

  const trigger = (data.trigger as TriggerKind) ?? 'contact.created';
  const graph = (data.graph as Graph) ?? emptyGraph(trigger);

  return (
    <div>
      <div className="px-4 pt-3">
        <Link href={`/${locale}/dashboard/automations`} className="text-brand-ink text-[13px]">← כל האוטומציות</Link>
      </div>
      {/* The builder has no read-only mode, so a viewer gets the summary instead of an editor they cannot save. */}
      {!canWrite(ws.role) ? (
        <div className="max-w-[900px] mx-auto px-5 md:px-10 pt-8">
          <h1 className="font-display text-[24px] font-extrabold tracking-tight" dir="auto">{(data.name as string) ?? 'אוטומציה'}</h1>
          <p className="text-ink-muted text-[13px] mt-1">טריגר: {TRIGGER_LABELS[trigger] ?? trigger}</p>
          <p role="status" className="text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mt-6">{getDict(locale).crm.readonlyNotice}</p>
        </div>
      ) : (
      <AutomationBuilder
        locale={locale} id={id}
        initialTheme={themeFrom((await cookies()).get(THEME_COOKIE)?.value)}
        initialName={(data.name as string) ?? 'אוטומציה'}
        initialTrigger={trigger}
        initialGraph={graph}
      />
      )}
    </div>
  );
}
