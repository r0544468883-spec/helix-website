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

  const [{ data: dueTasks }, stalledRes, { data: acts }, { count: contactCount }, { count: hotCount }, { data: allDeals }] = await Promise.all([
    supabase.from('crm_tasks').select('id, title, due_date, priority, contact_id, crm_contacts(full_name)')
      .eq('workspace_id', ws.workspaceId).eq('status', 'open').lte('due_date', todayIso)
      .order('due_date', { ascending: true, nullsFirst: false }).limit(50),
    crmDetectStalledDeals(locale),
    supabase.from('crm_activities').select('type, body, created_at, contact_id, crm_contacts(full_name)')
      .eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(12),
    supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('workspace_id', ws.workspaceId),
    supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('workspace_id', ws.workspaceId).gte('score', 70),
    supabase.from('crm_deals').select('value, status').eq('workspace_id', ws.workspaceId),
  ]);

  type TRaw = { id: string; title: string; due_date: string | null; priority: string | null; contact_id: string | null; crm_contacts: { full_name: string } | { full_name: string }[] | null };
  const name = (c: TRaw['crm_contacts']) => (Array.isArray(c) ? c[0]?.full_name : c?.full_name) ?? null;
  const today: TaskRow[] = ((dueTasks ?? []) as TRaw[]).map((r) => {
    const overdue = !!r.due_date && r.due_date < todayIso;
    return { id: r.id, title: r.title, dueLabel: overdue ? t.tasksOverdue : t.taskToday, overdue, priority: (r.priority as 'low' | 'medium' | 'high') ?? 'medium', contactId: r.contact_id, contactName: name(r.crm_contacts) };
  });
  const stalled: { id: string; title: string; days: number; contactId: string | null }[] = stalledRes.ok ? stalledRes.deals : [];

  const deals = (allDeals ?? []) as { value: number | null; status: string }[];
  const open = deals.filter((d) => d.status === 'open');
  const won = deals.filter((d) => d.status === 'won').length;
  const lost = deals.filter((d) => d.status === 'lost').length;
  const pipelineValue = open.reduce((s, d) => s + (d.value ?? 0), 0);
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : null;
  const todoCount = today.length + stalled.length;

  const card = 'bg-surface border border-border rounded-2xl p-5';
  const h2 = 'font-display text-[16px] font-extrabold mb-3';
  const kpi = `${card} glow-hover rise flex flex-col gap-1`;
  const kn = 'font-display text-[26px] font-extrabold tracking-tight tabular-nums leading-none';
  const kl = 'text-[12.5px] text-ink-muted';

  return (
    <div className="plug-ambient">
      <div className="max-w-[860px] mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-20">
        <h1 className="font-display text-[26px] md:text-[30px] font-extrabold tracking-tight">
          <span className="plug-gradient-text">{t.ovHello}</span>
        </h1>
        <p className="text-[14px] text-ink-secondary mt-1.5 mb-7">
          {todoCount > 0 ? `${todoCount} ${lang === 'he' ? 'דברים מחכים לך היום.' : 'things waiting for you today.'}` : t.overviewTodayEmpty}
        </p>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-7">
          <Link href={`${base}/crm`} className={kpi} style={{ ['--d' as string]: '0ms' }}>
            <span className={kn}>{contactCount ?? 0}</span><span className={kl}>{t.navContacts}</span>
          </Link>
          <Link href={`${base}/crm`} className={kpi} style={{ ['--d' as string]: '60ms' }}>
            <span className={kn}>{hotCount ?? 0}</span><span className={kl}>{t.ovKpiHot}</span>
          </Link>
          <Link href={`${base}/crm`} className={`${kpi} plug-glow-mint`} style={{ ['--d' as string]: '120ms' }}>
            <span className={`${kn} text-brand-ink`}>₪{Math.round(pipelineValue).toLocaleString()}</span><span className={kl}>{t.ovKpiPipeline}</span>
          </Link>
          <Link href={`${base}/crm/analytics`} className={kpi} style={{ ['--d' as string]: '180ms' }}>
            <span className={kn}>{winRate !== null ? `${winRate}%` : '—'}</span><span className={kl}>{t.reportsWinRate} · {t.ovMonth}</span>
          </Link>
        </div>

        <div className="grid gap-4">
          <section className="rise" style={{ ['--d' as string]: '220ms' }}>
            <h2 className={h2}>{t.overviewToday}</h2>
            {today.length ? (
              <CrmTaskList locale={locale} base={base} tasks={today} canWrite={canWrite(ws.role)}
                s={{ done: t.taskDoneShort, priorityHigh: t.taskHigh, noDue: t.taskNoDue, markDone: t.taskMarkDone, openContact: t.navContacts }} />
            ) : <div className={card}><p className="text-ink-secondary text-[14px]">{t.overviewTodayEmpty}</p></div>}
          </section>

          {stalled.length > 0 && (
            <section className="rise" style={{ ['--d' as string]: '280ms' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-[16px] font-extrabold">{t.overviewStalled}</h2>
                <Link href={`${base}/crm/stalled`} className="text-[13px] font-semibold text-brand-ink hover:underline">{t.navStalled} ←</Link>
              </div>
              <div className="flex flex-col gap-2">
                {stalled.slice(0, 5).map((d) => (
                  <Link key={d.id} href={d.contactId ? `${base}/crm?c=${d.contactId}` : `${base}/crm/stalled`} scroll={false}
                    className="glow-hover flex items-center justify-between gap-3 bg-surface border border-border rounded-xl p-3 min-h-[44px]">
                    <span className="text-[15px] font-semibold text-ink truncate" dir="auto">{d.title}</span>
                    <span className="text-[12px] font-bold text-danger bg-danger/10 rounded-full px-2.5 py-0.5 whitespace-nowrap tabular-nums">{d.days} {t.overviewStalledDays}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="rise" style={{ ['--d' as string]: '340ms' }}>
            <h2 className={h2}>{t.overviewActivity}</h2>
            {acts && acts.length ? (
              <div className={card}>
                {(acts as { type: string; body: string; created_at: string; contact_id: string | null; crm_contacts: { full_name: string } | { full_name: string }[] | null }[]).map((a, i) => (
                  <div key={i} className="grid grid-cols-[64px_minmax(0,1fr)_auto] gap-3 items-baseline py-2 border-t first:border-t-0 border-border">
                    <span className="text-[11px] font-semibold text-brand-ink/80 uppercase">{(ACTIVITY_LABELS[a.type] ?? { he: a.type, en: a.type })[lang]}</span>
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
    </div>
  );
}
