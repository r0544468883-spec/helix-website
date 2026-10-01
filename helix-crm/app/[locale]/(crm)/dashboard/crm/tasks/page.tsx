import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { todayInIsrael } from '@/lib/crm-dates';
import { loadDrawerContact, dueDayMonth } from '@/lib/crm-drawer';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import CrmTaskList, { TASKS_TITLE_ID, type TaskGroup, type TaskGroupKey, type TaskRow } from '@/components/CrmTaskList';
import CrmContactDrawer from '@/components/CrmContactDrawer';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<{ c?: string }>;

// How many open reminders the screen lists, the earliest due first.
const TASK_LIMIT = 500;
const ORDER: TaskGroupKey[] = ['overdue', 'today', 'later', 'none'];

/**
 * Reminders (crm_tasks rows, "תזכורת" on screen): every open one in the workspace,
 * whoever or whatever made it, grouped on Israel's calendar. Grouped here, on the
 * server, so the screen, the contacts list and the drawer use one clock. See
 * DESIGN.md — Reminders list.
 */
export default async function CrmTasksPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  const { c: openId } = await searchParams;
  const tc = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  // No workspace yet: the contacts screen offers the form that creates one.
  if (!ws) redirect(`/${locale}/dashboard/crm`);
  const readOnly = !canWrite(ws.role);

  const [tasksRes, drawer] = await Promise.all([
    // Earliest due first, undated last, the older of two equal ones first: the
    // drawer's own order. One more than the limit, to know there are more.
    supabase.from('crm_tasks').select('id, title, due_date, created_at, contact_id, crm_contacts(full_name)')
      .eq('workspace_id', ws.workspaceId).eq('status', 'open')
      .order('due_date', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true })
      .limit(TASK_LIMIT + 1),
    loadDrawerContact({ supabase, ws, openId, locale }),
  ]);

  if (tasksRes.error) console.error('[crm reminders] open tasks', tasksRes.error.message);
  const raw = (tasksRes.data ?? []) as { id: string; title: string; due_date: string | null; contact_id: string | null; crm_contacts: unknown }[];
  const capped = raw.length > TASK_LIMIT;
  const today = todayInIsrael();
  const due = dueDayMonth(locale);
  const byKey = new Map<TaskGroupKey, TaskRow[]>(ORDER.map((k) => [k, []]));
  for (const r of raw.slice(0, TASK_LIMIT)) {
    const key: TaskGroupKey = !r.due_date ? 'none' : r.due_date < today ? 'overdue' : r.due_date === today ? 'today' : 'later';
    const rel = r.crm_contacts as { full_name: string } | { full_name: string }[] | null;
    byKey.get(key)!.push({
      id: r.id,
      title: r.title,
      due: r.due_date ? due(r.due_date) : null,
      contactId: r.contact_id,
      contactName: (Array.isArray(rel) ? rel[0]?.full_name : rel?.full_name) ?? null,
    });
  }
  const groups: TaskGroup[] = ORDER.map((key) => ({ key, rows: byKey.get(key)! })).filter((g) => g.rows.length > 0);

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16">
      <h1 id={TASKS_TITLE_ID} tabIndex={-1} className="font-display text-[20px] font-extrabold tracking-tight outline-none">{tc.navTasks}</h1>

      <div className="mt-6">
        {readOnly && (
          <p role="status" className="text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.readonlyNotice}</p>
        )}
        {drawer.missing && (
          <p role="status" className="text-ink-muted text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.contactNotFound}</p>
        )}
        {tasksRes.error ? (
          // A failed lookup says so, and never claims there is nothing to do.
          <p role="alert" className="text-ink-secondary text-[15px]">{tc.tkLoadFailed}</p>
        ) : (
          <>
            <CrmTaskList groups={groups} readOnly={readOnly} locale={locale} t={tc} />
            {capped && <p className="text-[12px] text-ink-muted mt-4">{tc.tkCapped}</p>}
          </>
        )}
      </div>

      <CrmContactDrawer locale={locale} contact={drawer.contact} companies={drawer.companies} readOnly={readOnly} t={tc} />
    </div>
  );
}
