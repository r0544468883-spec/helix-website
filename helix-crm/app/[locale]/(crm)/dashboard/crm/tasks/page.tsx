import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import CrmTaskList, { type TaskRow } from '@/components/CrmTaskList';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

function dueLabel(due: string | null, locale: string, s: { today: string; tomorrow: string; noDue: string }): { label: string; overdue: boolean } {
  if (!due) return { label: s.noDue, overdue: false };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const d = new Date(`${due}T00:00:00`);
  const days = Math.round((d.getTime() - today.getTime()) / 86_400_000);
  if (days === 0) return { label: s.today, overdue: false };
  if (days === 1) return { label: s.tomorrow, overdue: false };
  const rtf = new Intl.RelativeTimeFormat(locale === 'en' ? 'en' : 'he', { numeric: 'auto' });
  if (Math.abs(days) < 60) return { label: rtf.format(days, 'day'), overdue: days < 0 };
  return { label: rtf.format(Math.round(days / 30), 'month'), overdue: days < 0 };
}

export default async function CrmTasksPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return (
      <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 text-center">
        <p className="text-ink-secondary">{t.setupPending}</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from('crm_tasks')
    .select('id, title, due_date, priority, contact_id, crm_contacts(full_name)')
    .eq('workspace_id', ws.workspaceId)
    .eq('status', 'open')
    .order('due_date', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true })
    .limit(500);
  if (error) console.error('[crm tasks]', error.message);

  const s = { today: t.taskToday, tomorrow: t.taskTomorrow, noDue: t.taskNoDue };
  type Raw = {
    id: string; title: string; due_date: string | null; priority: string | null;
    contact_id: string | null; crm_contacts: { full_name: string } | { full_name: string }[] | null;
  };
  const rows: TaskRow[] = ((data ?? []) as Raw[]).map((r) => {
    const { label, overdue } = dueLabel(r.due_date as string | null, locale, s);
    const contact = r.crm_contacts as { full_name: string } | { full_name: string }[] | null;
    const contactName = Array.isArray(contact) ? contact[0]?.full_name ?? null : contact?.full_name ?? null;
    return {
      id: r.id as string,
      title: r.title as string,
      dueLabel: label,
      overdue,
      priority: (r.priority as 'low' | 'medium' | 'high') ?? 'medium',
      contactId: (r.contact_id as string | null) ?? null,
      contactName,
    };
  });

  const overdueCount = rows.filter((r) => r.overdue).length;

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-20">
      <h1 className="font-display text-[24px] md:text-[28px] font-extrabold">{t.tasksTitle}</h1>
      <p className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-ink-secondary mt-3 mb-6">
        <span className="whitespace-nowrap">{rows.length} {t.tasksOpen}</span>
        {overdueCount > 0 && (
          <span className="whitespace-nowrap text-danger">
            <span aria-hidden className="text-ink-soft me-2">·</span>{overdueCount} {t.tasksOverdue}
          </span>
        )}
      </p>

      {rows.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-8 text-center">
          <p className="text-ink-secondary">{t.tasksEmpty}</p>
        </div>
      ) : (
        <CrmTaskList
          locale={locale}
          base={`/${locale}/dashboard`}
          tasks={rows}
          canWrite={canWrite(ws.role)}
          s={{ done: t.taskDoneShort, priorityHigh: t.taskHigh, noDue: t.taskNoDue, markDone: t.taskMarkDone, openContact: t.navContacts }}
        />
      )}
    </div>
  );
}
