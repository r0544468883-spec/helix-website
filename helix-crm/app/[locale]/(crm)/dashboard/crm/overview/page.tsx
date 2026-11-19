import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import { crmDetectStalledDeals } from '@/app/crm-actions';
import CrmTaskList, { type TaskRow } from '@/components/CrmTaskList';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

const ACTIVITY_LABELS: Record<string, { he: string; en: string }> = {
  note: { he: 'הערה', en: 'Note' }, email: { he: 'מייל', en: 'Email' },
  call: { he: 'שיחה', en: 'Call' }, meeting: { he: 'פגישה', en: 'Meeting' },
  whatsapp: { he: 'וואטסאפ', en: 'WhatsApp' }, task: { he: 'משימה', en: 'Task' },
  status: { he: 'סטטוס', en: 'Status' },
};

function rel(iso: string, locale: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  const rtf = new Intl.RelativeTimeFormat(locale === 'en' ? 'en' : 'he', { numeric: 'auto' });
  if (days < 30) return rtf.format(-days, 'day');
  return rtf.format(-Math.floor(days / 30), 'month');
}

export default async function CrmOverviewPage({ params }: { params: Params }) {
  const { locale } = await params;
  const lang: 'he' | 'en' = locale === 'en' ? 'en' : 'he';
  const t = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 text-center"><p className="text-ink-secondary">{t.setupPending}</p></div>;
  }
  const base = `/${locale}/dashboard`;
  const todayIso = new Date().toISOString().slice(0, 10);

  const [{ data: dueTasks }, stalledRes, { data: acts }, { count: contactCount }, { data: openDeals }] = await Promise.all([
    supabase.from('crm_tasks').select('id, title, due_date, priority, contact_id, crm_contacts(full_name)')
      .eq('workspace_id', ws.workspaceId).eq('status', 'open').lte('due_date', todayIso)
      .order('due_date', { ascending: true, nullsFirst: false }).limit(50),
    crmDetectStalledDeals(locale),
    supabase.from('crm_activities').select('type, body, created_at, contact_id, crm_contacts(full_name)')
      .eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(12),
    supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('workspace_id', ws.workspaceId),
    supabase.from('crm_deals').select('value').eq('workspace_id', ws.workspaceId).eq('status', 'open'),
  ]);

  type TRaw = { id: string; title: string; due_date: string | null; priority: string | null; contact_id: string | null; crm_contacts: { full_name: string } | { full_name: string }[] | null };
  const name = (c: TRaw['crm_contacts']) => (Array.isArray(c) ? c[0]?.full_name : c?.full_name) ?? null;
  const today: TaskRow[] = ((dueTasks ?? []) as TRaw[]).map((r) => {
    const overdue = !!r.due_date && r.due_date < todayIso;
    return { id: r.id, title: r.title, dueLabel: overdue ? t.tasksOverdue : t.taskToday, overdue, priority: (r.priority as 'low' | 'medium' | 'high') ?? 'medium', contactId: r.contact_id, contactName: name(r.crm_contacts) };
  });
  const stalled: { id: string; title: string; days: number; contactId: string | null }[] = stalledRes.ok ? stalledRes.deals : [];
  const pipelineValue = ((openDeals ?? []) as { value: number | null }[]).reduce((s: number, d) => s + (d.value ?? 0), 0);

  const card = 'bg-surface border border-border rounded-2xl p-5';
  const h2 = 'font-display text-[16px] font-extrabold mb-3';

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-20">
      <h1 className="font-display text-[24px] md:text-[28px] font-extrabold">{t.overviewTitle}</h1>
      <p className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-ink-secondary mt-3 mb-6">
        <span className="whitespace-nowrap">{contactCount ?? 0} {t.navContacts}</span>
        <span className="whitespace-nowrap"><span aria-hidden className="text-ink-soft me-2">·</span>{(openDeals ?? []).length} {t.reportsOpenDeals}</span>
        {pipelineValue > 0 && <span className="whitespace-nowrap"><span aria-hidden className="text-ink-soft me-2">·</span>₪{Math.round(pipelineValue).toLocaleString()} {t.reportsInPipeline}</span>}
      </p>

      <div className="grid gap-4">
        <section>
          <h2 className={h2}>{t.overviewToday}</h2>
          {today.length ? (
            <CrmTaskList locale={locale} base={base} tasks={today} canWrite={canWrite(ws.role)}
              s={{ done: t.taskDoneShort, priorityHigh: t.taskHigh, noDue: t.taskNoDue, markDone: t.taskMarkDone, openContact: t.navContacts }} />
          ) : <div className={card}><p className="text-ink-secondary text-[14px]">{t.overviewTodayEmpty}</p></div>}
        </section>

        {stalled.length > 0 && (
          <section>
            <h2 className={h2}>{t.overviewStalled}</h2>
            <div className="flex flex-col gap-2">
              {stalled.slice(0, 8).map((d) => (
                <Link key={d.id} href={d.contactId ? `${base}/crm?c=${d.contactId}` : `${base}/crm`} scroll={false}
                  className="flex items-center justify-between gap-3 bg-surface border border-border rounded-xl p-3 min-h-[44px] hover:border-brand transition-colors">
                  <span className="text-[15px] font-semibold text-ink truncate" dir="auto">{d.title}</span>
                  <span className="text-[13px] text-danger whitespace-nowrap">{d.days} {t.overviewStalledDays}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className={h2}>{t.overviewActivity}</h2>
          {acts && acts.length ? (
            <div className={card}>
              {(acts as { type: string; body: string; created_at: string; contact_id: string | null; crm_contacts: { full_name: string } | { full_name: string }[] | null }[]).map((a, i) => (
                <div key={i} className="grid grid-cols-[64px_minmax(0,1fr)_auto] gap-3 items-baseline py-2 border-t first:border-t-0 border-border">
                  <span className="text-[11px] font-semibold text-ink-muted uppercase">{(ACTIVITY_LABELS[a.type] ?? { he: a.type, en: a.type })[lang]}</span>
                  <span className="text-[14px] text-ink-secondary truncate" dir="auto">
                    {a.body}{name(a.crm_contacts) ? <span className="text-ink-muted"> · {name(a.crm_contacts)}</span> : null}
                  </span>
                  <span className="text-[12px] text-ink-muted whitespace-nowrap">{rel(a.created_at, locale)}</span>
                </div>
              ))}
            </div>
          ) : <div className={card}><p className="text-ink-secondary text-[14px]">{t.overviewActivityEmpty}</p></div>}
        </section>
      </div>
    </div>
  );
}
