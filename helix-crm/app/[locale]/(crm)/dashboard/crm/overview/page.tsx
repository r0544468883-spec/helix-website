import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getDict } from '@/lib/i18n';
import { getWorkspace } from '@/lib/crm-workspace';
import { crmDetectStalledDeals } from '@/app/crm-actions';
import type { WidgetSpec } from '@/app/crm-dashboard-actions';
import CrmDashboard, { type DashboardData } from '@/components/CrmDashboard';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

// The overview IS the dashboard builder (PLUG methodology): the server gathers
// every widget's data once; the client component arranges the widgets per the
// user's saved layout and lets them edit it.

const ACTIVITY_LABELS: Record<string, { he: string; en: string }> = {
  note: { he: 'הערה', en: 'Note' }, email: { he: 'מייל', en: 'Email' },
  call: { he: 'שיחה', en: 'Call' }, meeting: { he: 'פגישה', en: 'Meeting' },
  whatsapp: { he: 'וואטסאפ', en: 'WhatsApp' }, task: { he: 'משימה', en: 'Task' },
  status: { he: 'סטטוס', en: 'Status' }, next_step: { he: 'צעד הבא', en: 'Next step' },
};

const STAGES = ['lead', 'qualified', 'meeting', 'proposal', 'negotiation', 'won'] as const;
const STAGE_HUES = ['var(--color-ink-muted)', '#38BDF8', 'var(--color-accent)', '#FBBF24', '#FB923C', 'var(--color-brand)'];

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
  const admin = createAdminClient();

  const [
    { data: dueTasks }, stalledRes, { data: acts },
    { count: contactCount }, { count: hotCount },
    { data: allDeals }, { data: srcRows }, layoutRow,
  ] = await Promise.all([
    supabase.from('crm_tasks').select('id, title, due_date, contact_id, crm_contacts(full_name)')
      .eq('workspace_id', ws.workspaceId).eq('status', 'open').lte('due_date', todayIso)
      .order('due_date', { ascending: true, nullsFirst: false }).limit(20),
    crmDetectStalledDeals(locale),
    supabase.from('crm_activities').select('type, body, created_at, crm_contacts(full_name)')
      .eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(10),
    supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('workspace_id', ws.workspaceId),
    supabase.from('crm_contacts').select('id', { count: 'exact', head: true }).eq('workspace_id', ws.workspaceId).gte('score', 70),
    supabase.from('crm_deals').select('value, stage, status').eq('workspace_id', ws.workspaceId).limit(2000),
    supabase.from('crm_contacts').select('source').eq('workspace_id', ws.workspaceId).limit(2000),
    admin
      ? admin.from('crm_dashboards').select('layout').eq('workspace_id', ws.workspaceId).eq('user_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const deals = (allDeals ?? []) as { value: number | null; stage: string; status: string }[];
  const open = deals.filter((d) => d.status === 'open');
  const won = deals.filter((d) => d.status === 'won');
  const lost = deals.filter((d) => d.status === 'lost').length;
  const name = (c: { full_name: string } | { full_name: string }[] | null) =>
    (Array.isArray(c) ? c[0]?.full_name : c?.full_name) ?? null;

  const srcCount = new Map<string, number>();
  for (const r of (srcRows ?? []) as { source: string | null }[]) {
    const s = r.source || '—';
    srcCount.set(s, (srcCount.get(s) ?? 0) + 1);
  }

  const data: DashboardData = {
    base,
    kpis: {
      contacts: contactCount ?? 0,
      hot: hotCount ?? 0,
      pipeline: open.reduce((s, d) => s + (d.value ?? 0), 0),
      winRate: won.length + lost > 0 ? Math.round((won.length / (won.length + lost)) * 100) : null,
    },
    funnel: STAGES.map((s, i) => ({
      label: (t[`st_${s}` as keyof typeof t] as string) ?? s,
      count: s === 'won' ? won.length : open.filter((d) => d.stage === s).length,
      hue: STAGE_HUES[i],
    })),
    today: ((dueTasks ?? []) as { id: string; title: string; due_date: string | null; contact_id: string | null; crm_contacts: { full_name: string } | { full_name: string }[] | null }[])
      .map((r) => ({ id: r.id, title: r.title, contactId: r.contact_id, contactName: name(r.crm_contacts), overdue: !!r.due_date && r.due_date < todayIso })),
    stalled: stalledRes.ok ? stalledRes.deals : [],
    activity: ((acts ?? []) as { type: string; body: string; created_at: string; crm_contacts: { full_name: string } | { full_name: string }[] | null }[])
      .map((a) => ({ label: (ACTIVITY_LABELS[a.type] ?? { he: a.type, en: a.type })[lang], body: a.body, who: name(a.crm_contacts), rel: rel(a.created_at, locale) })),
    sources: [...srcCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([label, count]) => ({ label, count })),
  };

  const layout = ((layoutRow as { data?: { layout?: WidgetSpec[] } | null })?.data?.layout ?? null) as WidgetSpec[] | null;
  const todoCount = data.today.length + data.stalled.length;

  return (
    <div className="plug-ambient">
      <div className="max-w-[980px] mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-20">
        <h1 className="font-display text-[26px] md:text-[30px] font-extrabold tracking-tight">
          <span className="plug-gradient-text">{t.ovHello}</span>
        </h1>
        <p className="text-[14px] text-ink-secondary mt-1.5 mb-5">
          {todoCount > 0 ? `${todoCount} ${lang === 'he' ? 'דברים מחכים לך היום.' : 'things waiting for you today.'}` : t.overviewTodayEmpty}
        </p>

        <CrmDashboard locale={locale} layout={layout} data={data} t={t} />
      </div>
    </div>
  );
}
