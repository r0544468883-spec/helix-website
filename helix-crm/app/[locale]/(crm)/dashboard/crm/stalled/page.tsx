import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import CrmStalledList, { type StalledRow } from '@/components/CrmStalledList';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

const STALL_DAYS = 10;

export default async function CrmStalledPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 text-center"><p className="text-ink-secondary">{t.setupPending}</p></div>;
  }
  const base = `/${locale}/dashboard`;

  const { data } = await supabase
    .from('crm_deals')
    .select('id, title, value, stage, contact_id, crm_contacts(full_name, last_activity_at)')
    .eq('workspace_id', ws.workspaceId)
    .eq('status', 'open');

  type Row = { id: string; title: string | null; value: number | null; stage: string; contact_id: string | null; crm_contacts: { full_name: string; last_activity_at: string | null } | { full_name: string; last_activity_at: string | null }[] | null };
  const now = Date.now();
  const stalled: StalledRow[] = ((data ?? []) as Row[])
    .map((d) => {
      const c = Array.isArray(d.crm_contacts) ? d.crm_contacts[0] : d.crm_contacts;
      const last = c?.last_activity_at ? new Date(c.last_activity_at).getTime() : 0;
      const days = last ? Math.floor((now - last) / 86_400_000) : 999;
      return {
        id: d.id, title: d.title ?? '—', value: d.value ?? 0,
        stageLabel: (t[`st_${d.stage}` as keyof typeof t] as string) ?? d.stage,
        contactId: d.contact_id, contactName: c?.full_name ?? null, days,
      };
    })
    .filter((d) => d.days >= STALL_DAYS)
    .sort((a, b) => b.days - a.days);

  const avgDays = stalled.length ? Math.round(stalled.reduce((s, d) => s + Math.min(d.days, 365), 0) / stalled.length) : 0;
  const over30 = stalled.filter((d) => d.days >= 30).length;
  const atRisk = stalled.reduce((s, d) => s + d.value, 0);

  const stat = 'bg-surface border border-border rounded-2xl p-4 rise glow-hover';
  const sn = 'font-display text-[23px] font-extrabold tabular-nums leading-none';
  const sl = 'text-[12px] text-ink-muted mt-1 block';

  return (
    <div className="plug-ambient">
      <div className="max-w-[860px] mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-20">
        <h1 className="font-display text-[26px] md:text-[30px] font-extrabold tracking-tight"><span className="plug-gradient-text">{t.stTitle}</span></h1>
        <p className="text-[14px] text-ink-secondary mt-1.5 mb-7">{t.stSubtitle}</p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
          <div className={stat} style={{ ['--d' as string]: '0ms' }}><span className={sn}>{stalled.length}</span><span className={sl}>{t.stCount}</span></div>
          <div className={stat} style={{ ['--d' as string]: '60ms' }}><span className={sn}>{avgDays}</span><span className={sl}>{t.stAvgDays}</span></div>
          <div className={stat} style={{ ['--d' as string]: '120ms' }}><span className={`${sn} ${over30 > 0 ? 'text-danger' : ''}`}>{over30}</span><span className={sl}>{t.stOver30}</span></div>
          <div className={`${stat} ${atRisk > 0 ? 'plug-glow-purple' : ''}`} style={{ ['--d' as string]: '180ms' }}><span className={`${sn} text-accent-ink`}>₪{Math.round(atRisk).toLocaleString()}</span><span className={sl}>{t.stAtRisk}</span></div>
        </div>

        <CrmStalledList locale={locale} base={base} rows={stalled} canWrite={canWrite(ws.role)} t={t} />
        {stalled.length > 0 && <p className="text-[12.5px] text-ink-muted text-center mt-5">{t.stHint}</p>}
      </div>
    </div>
  );
}
