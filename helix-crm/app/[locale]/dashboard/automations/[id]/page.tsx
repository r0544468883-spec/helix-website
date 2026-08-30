import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getWorkspace } from '@/lib/crm-workspace';
import AutomationBuilder from '@/components/AutomationBuilder';
import { emptyGraph, type Graph, type TriggerKind } from '@/lib/automations/types';

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
        <Link href={`/${locale}/dashboard/automations`} className="text-brand text-[13px]">← כל האוטומציות</Link>
      </div>
      <AutomationBuilder
        locale={locale} id={id}
        initialName={(data.name as string) ?? 'אוטומציה'}
        initialTrigger={trigger}
        initialGraph={graph}
      />
    </div>
  );
}
