import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { getWorkspace } from '@/lib/crm-workspace';
import { crmDetectStalledDeals } from '@/app/crm-actions';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

// The six pipeline stages, in funnel order. Labels come from the dict's st_* keys
// (the same ones CrmDealBoard uses), so the two screens always agree.
const STAGES = ['lead', 'qualified', 'meeting', 'proposal', 'negotiation', 'won'] as const;
const STAGE_HUES = ['var(--color-ink-muted)', '#38BDF8', 'var(--color-accent)', '#FBBF24', '#FB923C', 'var(--color-brand)'];

function monthKey(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }

export default async function CrmAnalyticsPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 text-center"><p className="text-ink-secondary">{t.setupPending}</p></div>;
  }

  const [{ data: dealRows }, { data: srcRows }, stalledRes] = await Promise.all([
    supabase.from('crm_deals').select('value, stage, status, created_at').eq('workspace_id', ws.workspaceId).limit(2000),
    supabase.from('crm_contacts').select('source').eq('workspace_id', ws.workspaceId).limit(2000),
    crmDetectStalledDeals(locale),
  ]);

  const deals = (dealRows ?? []) as { value: number | null; stage: string; status: string; created_at: string }[];
  const won = deals.filter((d) => d.status === 'won');
  const lost = deals.filter((d) => d.status === 'lost').length;
  const open = deals.filter((d) => d.status === 'open');
  const winRate = won.length + lost > 0 ? Math.round((won.length / (won.length + lost)) * 100) : null;
  const stalledCount = stalledRes.ok ? stalledRes.deals.length : 0;

  // Funnel: open deals per stage (+ all won in the last stage).
  const funnel = STAGES.map((s) => (s === 'won' ? won.length : open.filter((d) => d.stage === s).length));
  const funnelMax = Math.max(...funnel, 1);

  // Close pace: won deals per month, last 6 months, + a naive next-month projection
  // (the average of the last 3 actual months — a pace, not a promise).
  const months: { key: string; label: string; count: number }[] = [];
  const fmt = new Intl.DateTimeFormat(locale === 'en' ? 'en' : 'he', { month: 'short' });
  for (let i = 5; i >= 0; i--) {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
    months.push({ key: monthKey(d), label: fmt.format(d), count: 0 });
  }
  for (const w of won) {
    const k = monthKey(new Date(w.created_at));
    const m = months.find((x) => x.key === k);
    if (m) m.count++;
  }
  const last3 = months.slice(-3).map((m) => m.count);
  const forecast = Math.round(last3.reduce((a, b) => a + b, 0) / 3);
  const chartMax = Math.max(...months.map((m) => m.count), forecast, 1);
  const px = (i: number) => 14 + i * (292 / 6);
  const py = (v: number) => 104 - (v / chartMax) * 86;
  const actualPts = months.map((m, i) => `${px(i)},${py(m.count)}`).join(' ');
  const forecastPts = `${px(5)},${py(months[5].count)} ${px(6)},${py(forecast)}`;

  // Pipeline health, honest and simple: win rate (50%) + non-stalled share (50%).
  const stalledShare = open.length > 0 ? stalledCount / open.length : 0;
  const health = winRate === null && open.length === 0 ? null
    : Math.round(((winRate ?? 50) * 0.5) + (100 - stalledShare * 100) * 0.5);

  // Top lead sources.
  const srcCount = new Map<string, number>();
  for (const r of (srcRows ?? []) as { source: string | null }[]) {
    const s = r.source || '—';
    srcCount.set(s, (srcCount.get(s) ?? 0) + 1);
  }
  const sources = [...srcCount.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const srcMax = sources[0]?.[1] ?? 1;

  const noData = deals.length === 0 && sources.length === 0;
  const card = 'bg-surface border border-border rounded-2xl p-5 rise';
  const h2 = 'font-display text-[15.5px] font-extrabold';

  return (
    <div className="plug-ambient">
      <div className="max-w-[860px] mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-20">
        <h1 className="font-display text-[26px] md:text-[30px] font-extrabold tracking-tight"><span className="plug-gradient-text">{t.anaTitle}</span></h1>
        <p className="text-[14px] text-ink-secondary mt-1.5 mb-7">{t.anaRange}</p>

        {noData ? (
          <div className={card}><p className="text-ink-secondary text-[14px]">{t.anaEmpty}</p></div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {/* Funnel */}
            <div className={card} style={{ ['--d' as string]: '0ms' }}>
              <div className="flex items-center justify-between mb-5"><h2 className={h2}>{t.anaFunnel}</h2></div>
              <div className="flex flex-col gap-2.5">
                {STAGES.map((s, i) => (
                  <div key={s} className="grid grid-cols-[56px_minmax(0,1fr)_34px] items-center gap-2.5">
                    <span className="text-[12px] font-semibold text-ink-secondary truncate">{(t[`st_${s}` as keyof typeof t] as string) ?? s}</span>
                    <div className="h-[18px] rounded-md bg-soft overflow-hidden">
                      <span className="block h-full rounded-md" style={{ width: `${Math.max((funnel[i] / funnelMax) * 100, funnel[i] > 0 ? 6 : 0)}%`, background: STAGE_HUES[i] }} />
                    </div>
                    <span className="text-[12.5px] font-bold tabular-nums text-ink">{funnel[i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Health ring */}
            <div className={card} style={{ ['--d' as string]: '60ms' }}>
              <div className="flex items-center justify-between mb-5"><h2 className={h2}>{t.anaHealth}</h2></div>
              <div className="flex items-center gap-6">
                <div className="grid place-items-center size-[96px] rounded-full shrink-0"
                  style={{ background: `conic-gradient(var(--color-brand) ${(health ?? 0)}%, var(--color-soft) 0)` }}>
                  <span className="grid place-items-center size-[74px] rounded-full bg-surface font-display text-[22px] font-extrabold tabular-nums">
                    {health ?? '—'}
                  </span>
                </div>
                <ul className="flex-1 flex flex-col gap-2.5 text-[13.5px]">
                  <li className="flex justify-between border-b border-border pb-2"><span className="text-ink-secondary">{t.anaHealthWin}</span><b className="text-brand-ink tabular-nums">{winRate !== null ? `${winRate}%` : '—'}</b></li>
                  <li className="flex justify-between border-b border-border pb-2"><span className="text-ink-secondary">{t.anaHealthOpen}</span><b className="tabular-nums">{open.length}</b></li>
                  <li className="flex justify-between"><span className="text-ink-secondary">{t.anaHealthStalled}</span><b className={`tabular-nums ${stalledCount > 0 ? 'text-danger' : ''}`}>{stalledCount}</b></li>
                </ul>
              </div>
            </div>

            {/* Close pace + forecast */}
            <div className={card} style={{ ['--d' as string]: '120ms' }}>
              <div className="flex items-center justify-between mb-4"><h2 className={h2}>{t.anaForecast}</h2></div>
              <svg viewBox="0 0 320 120" className="w-full h-[120px]" role="img" aria-label={t.anaForecast}>
                <g stroke="var(--color-border)" strokeWidth="1">
                  <line x1="0" y1="30" x2="320" y2="30" /><line x1="0" y1="66" x2="320" y2="66" /><line x1="0" y1="104" x2="320" y2="104" />
                </g>
                <polyline fill="none" stroke="var(--color-brand)" strokeWidth="2.5" points={actualPts} />
                <polyline fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeDasharray="5 4" points={forecastPts} />
                <circle cx={px(5)} cy={py(months[5].count)} r="3.5" fill="var(--color-brand)" />
                <circle cx={px(6)} cy={py(forecast)} r="3.5" fill="var(--color-accent)" />
              </svg>
              <div className="flex gap-5 mt-2 text-[12px] text-ink-muted">
                <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: 'var(--color-brand)' }} />{t.anaActual}</span>
                <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: 'var(--color-accent)' }} />{t.anaPredicted}: {forecast}</span>
              </div>
              <p className="mt-3 text-[12.5px] text-ink-secondary bg-brand/5 border border-brand/20 rounded-lg px-3 py-2">{t.anaForecastNote}</p>
            </div>

            {/* Sources */}
            <div className={card} style={{ ['--d' as string]: '180ms' }}>
              <div className="flex items-center justify-between mb-5"><h2 className={h2}>{t.anaSources}</h2></div>
              {sources.length ? (
                <div className="flex flex-col gap-3">
                  {sources.map(([s, n]) => (
                    <div key={s} className="grid grid-cols-[110px_minmax(0,1fr)_30px] items-center gap-2.5 text-[12.5px]">
                      <span className="text-ink-secondary truncate" dir="auto">{s}</span>
                      <div className="h-[10px] rounded-full bg-soft overflow-hidden">
                        <span className="block h-full rounded-full" style={{ width: `${(n / srcMax) * 100}%`, background: 'linear-gradient(90deg, var(--color-brand), var(--color-accent))' }} />
                      </div>
                      <b className="tabular-nums text-ink">{n}</b>
                    </div>
                  ))}
                </div>
              ) : <p className="text-ink-secondary text-[14px]">{t.reportsNoData}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
