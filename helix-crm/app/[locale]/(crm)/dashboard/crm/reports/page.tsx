import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { getWorkspace } from '@/lib/crm-workspace';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

// Fixed domain enums → bilingual labels (kept local; these are not user content).
const STAGE_LABELS: Record<string, { he: string; en: string }> = {
  lead: { he: 'ליד', en: 'Lead' },
  qualified: { he: 'מתאים', en: 'Qualified' },
  meeting: { he: 'פגישה', en: 'Meeting' },
  proposal: { he: 'הצעה', en: 'Proposal' },
  negotiation: { he: 'מו״מ', en: 'Negotiation' },
  won: { he: 'נסגר', en: 'Won' },
  lost: { he: 'אבוד', en: 'Lost' },
};
const STATUS_LABELS: Record<string, { he: string; en: string }> = {
  new: { he: 'חדש', en: 'New' }, contacted: { he: 'נוצר קשר', en: 'Contacted' },
  talking: { he: 'בשיחה', en: 'Talking' }, proposal: { he: 'הצעה', en: 'Proposal' },
  signed: { he: 'נחתם', en: 'Signed' }, paid: { he: 'שילם', en: 'Paid' },
  client: { he: 'לקוח', en: 'Client' }, declined: { he: 'סירב', en: 'Declined' },
  frozen: { he: 'מוקפא', en: 'Frozen' },
};

function BarRow({ label, count, total, value, currency }: { label: string; count: number; total: number; value?: number; currency?: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="grid grid-cols-[minmax(90px,140px)_minmax(0,1fr)_auto] items-center gap-3 py-1.5">
      <span className="text-[13px] text-ink-secondary truncate" dir="auto">{label}</span>
      <span className="h-2 rounded-full bg-bg overflow-hidden" aria-hidden>
        <span className="block h-full rounded-full bg-brand" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-[13px] text-ink-muted tabular-nums whitespace-nowrap">
        {count}{value != null && value > 0 ? ` · ${currency === 'ILS' ? '₪' : ''}${Math.round(value).toLocaleString()}` : ''}
      </span>
    </div>
  );
}

export default async function CrmReportsPage({ params }: { params: Params }) {
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

  const [{ data: deals }, { data: contacts }] = await Promise.all([
    supabase.from('crm_deals').select('stage, status, value, currency').eq('workspace_id', ws.workspaceId).limit(5000),
    supabase.from('crm_contacts').select('status, source').eq('workspace_id', ws.workspaceId).limit(5000),
  ]);

  type Deal = { stage: string; status: string; value: number | null; currency: string | null };
  type Contact = { status: string; source: string | null };
  const dealRows = (deals ?? []) as Deal[];
  const contactRows = (contacts ?? []) as Contact[];

  // Pipeline: open deals by stage (count + value); win rate from closed.
  const openDeals = dealRows.filter((d) => d.status === 'open');
  const openValue = openDeals.reduce((s, d) => s + (d.value ?? 0), 0);
  const won = dealRows.filter((d) => d.status === 'won').length;
  const lost = dealRows.filter((d) => d.status === 'lost').length;
  const winRate = won + lost > 0 ? Math.round((won / (won + lost)) * 100) : null;
  const byStage = Object.keys(STAGE_LABELS).map((st) => {
    const rows = openDeals.filter((d) => d.stage === st);
    return { st, count: rows.length, value: rows.reduce((s, d) => s + (d.value ?? 0), 0) };
  }).filter((x) => x.count > 0);

  // Contacts by status + by source.
  const byStatus = Object.keys(STATUS_LABELS).map((s) => ({ s, count: contactRows.filter((c) => c.status === s).length })).filter((x) => x.count > 0);
  const sourceMap = new Map<string, number>();
  for (const c of contactRows) { const k = (c.source || '').trim() || (lang === 'he' ? 'לא ידוע' : 'Unknown'); sourceMap.set(k, (sourceMap.get(k) ?? 0) + 1); }
  const bySource = [...sourceMap.entries()].map(([src, count]) => ({ src, count })).sort((a, b) => b.count - a.count).slice(0, 8);

  const card = 'bg-surface border border-border rounded-2xl p-5';
  const h2 = 'font-display text-[16px] font-extrabold mb-1';

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-20">
      <h1 className="font-display text-[24px] md:text-[28px] font-extrabold">{t.reportsTitle}</h1>
      <p className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-ink-secondary mt-3 mb-6">
        <span className="whitespace-nowrap">{contactRows.length} {t.navContacts}</span>
        <span className="whitespace-nowrap"><span aria-hidden className="text-ink-soft me-2">·</span>{openDeals.length} {t.reportsOpenDeals}</span>
        {openValue > 0 && <span className="whitespace-nowrap"><span aria-hidden className="text-ink-soft me-2">·</span>₪{Math.round(openValue).toLocaleString()} {t.reportsInPipeline}</span>}
        {winRate != null && <span className="whitespace-nowrap"><span aria-hidden className="text-ink-soft me-2">·</span>{winRate}% {t.reportsWinRate}</span>}
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <section className={card}>
          <h2 className={h2}>{t.reportsPipeline}</h2>
          <p className="text-[12px] text-ink-muted mb-3">{t.reportsPipelineHint}</p>
          {byStage.length ? byStage.map((x) => (
            <BarRow key={x.st} label={STAGE_LABELS[x.st][lang]} count={x.count} total={openDeals.length} value={x.value} currency="ILS" />
          )) : <p className="text-[13px] text-ink-muted">{t.reportsNoData}</p>}
        </section>

        <section className={card}>
          <h2 className={h2}>{t.reportsByStatus}</h2>
          <p className="text-[12px] text-ink-muted mb-3">{t.reportsByStatusHint}</p>
          {byStatus.length ? byStatus.map((x) => (
            <BarRow key={x.s} label={STATUS_LABELS[x.s][lang]} count={x.count} total={contactRows.length} />
          )) : <p className="text-[13px] text-ink-muted">{t.reportsNoData}</p>}
        </section>

        <section className={`${card} md:col-span-2`}>
          <h2 className={h2}>{t.reportsBySource}</h2>
          <p className="text-[12px] text-ink-muted mb-3">{t.reportsBySourceHint}</p>
          {bySource.length ? bySource.map((x) => (
            <BarRow key={x.src} label={x.src} count={x.count} total={contactRows.length} />
          )) : <p className="text-[13px] text-ink-muted">{t.reportsNoData}</p>}
        </section>
      </div>
    </div>
  );
}
