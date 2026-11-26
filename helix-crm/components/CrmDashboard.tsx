'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Pencil, Check, Plus, X, ChevronUp, ChevronDown, Maximize2, Minimize2,
} from 'lucide-react';
import { saveDashboardLayout, type WidgetSpec, type WidgetSize } from '@/app/crm-dashboard-actions';
import type { Dict } from '@/lib/i18n/he';

// The PLUG-style dashboard builder: the overview is composed of widgets the
// user adds / removes / resizes / reorders; the layout persists per user.
// All widget DATA is fetched server-side by the overview page and passed in —
// this component only arranges and renders it.

export type DashboardData = {
  base: string;
  kpis: { contacts: number; hot: number; pipeline: number; winRate: number | null };
  funnel: { label: string; count: number; hue: string }[];
  today: { id: string; title: string; contactId: string | null; contactName: string | null; overdue: boolean }[];
  stalled: { id: string; title: string; days: number; contactId: string | null }[];
  activity: { label: string; body: string; who: string | null; rel: string }[];
  sources: { label: string; count: number }[];
};

const DEFAULT_LAYOUT: WidgetSpec[] = [
  { t: 'kpi_contacts', s: 's' }, { t: 'kpi_hot', s: 's' }, { t: 'kpi_pipeline', s: 's' }, { t: 'kpi_winrate', s: 's' },
  { t: 'today', s: 'm' }, { t: 'stalled', s: 'm' }, { t: 'activity', s: 'l' },
];

const SPAN: Record<WidgetSize, string> = { s: 'lg:col-span-1', m: 'lg:col-span-2', l: 'lg:col-span-4' };

export default function CrmDashboard({ locale, layout: initial, data, t }: {
  locale: string;
  layout: WidgetSpec[] | null;
  data: DashboardData;
  t: Dict['crm'];
}) {
  const [layout, setLayout] = useState<WidgetSpec[]>(initial?.length ? initial : DEFAULT_LAYOUT);
  const [edit, setEdit] = useState(false);
  const [adding, setAdding] = useState(false);
  const [, startTransition] = useTransition();

  const NAMES: Record<string, string> = {
    kpi_contacts: t.navContacts, kpi_hot: t.ovKpiHot, kpi_pipeline: t.ovKpiPipeline, kpi_winrate: t.reportsWinRate,
    funnel: t.wFunnel, today: t.overviewToday, stalled: t.navStalled, activity: t.overviewActivity, sources: t.anaSources,
  };
  const missing = Object.keys(NAMES).filter((k) => !layout.some((w) => w.t === k));

  function apply(next: WidgetSpec[]) {
    setLayout(next);
    startTransition(async () => { await saveDashboardLayout(next); });
  }
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= layout.length) return;
    const next = [...layout];
    [next[i], next[j]] = [next[j], next[i]];
    apply(next);
  };
  const resize = (i: number, dir: -1 | 1) => {
    const order: WidgetSize[] = ['s', 'm', 'l'];
    const cur = order.indexOf(layout[i].s);
    const ns = order[Math.min(2, Math.max(0, cur + dir))];
    if (ns === layout[i].s) return;
    apply(layout.map((w, x) => (x === i ? { ...w, s: ns } : w)));
  };
  const remove = (i: number) => apply(layout.filter((_, x) => x !== i));
  const add = (type: string) => { apply([...layout, { t: type, s: type.startsWith('kpi_') ? 's' : 'm' }]); setAdding(false); };

  const card = 'bg-surface border border-border rounded-2xl p-5 relative group';
  const h2 = 'font-display text-[14.5px] font-extrabold mb-3';

  function renderWidget(w: WidgetSpec) {
    const { kpis, funnel, today, stalled, activity, sources, base } = data;
    switch (w.t) {
      case 'kpi_contacts': return <Kpi value={String(kpis.contacts)} label={t.navContacts} href={`${base}/crm`} />;
      case 'kpi_hot': return <Kpi value={String(kpis.hot)} label={t.ovKpiHot} href={`${base}/crm`} />;
      case 'kpi_pipeline': return <Kpi value={`₪${Math.round(kpis.pipeline).toLocaleString()}`} label={t.ovKpiPipeline} href={`${base}/crm`} mint />;
      case 'kpi_winrate': return <Kpi value={kpis.winRate !== null ? `${kpis.winRate}%` : '—'} label={t.reportsWinRate} href={`${base}/crm/analytics`} />;
      case 'funnel': {
        const max = Math.max(...funnel.map((f) => f.count), 1);
        return (
          <>
            <h2 className={h2}>{t.wFunnel}</h2>
            <div className="flex flex-col gap-2">
              {funnel.map((f) => (
                <div key={f.label} className="grid grid-cols-[56px_minmax(0,1fr)_30px] items-center gap-2.5">
                  <span className="text-[12px] font-semibold text-ink-secondary truncate">{f.label}</span>
                  <div className="h-[15px] rounded-md bg-soft overflow-hidden"><span className="block h-full rounded-md" style={{ width: `${Math.max((f.count / max) * 100, f.count > 0 ? 6 : 0)}%`, background: f.hue }} /></div>
                  <span className="text-[12px] font-bold tabular-nums">{f.count}</span>
                </div>
              ))}
            </div>
          </>
        );
      }
      case 'today': return (
        <>
          <h2 className={h2}>{t.overviewToday}</h2>
          {today.length === 0 ? <p className="text-ink-secondary text-[13.5px]">{t.overviewTodayEmpty}</p> : (
            <div className="flex flex-col">
              {today.slice(0, 6).map((x) => (
                <Link key={x.id} href={x.contactId ? `${base}/crm?c=${x.contactId}` : `${base}/crm/tasks`} scroll={false}
                  className="flex items-center justify-between gap-2 py-2 border-t first:border-t-0 border-border hover:text-brand-ink">
                  <span className="text-[13.5px] text-ink truncate" dir="auto">{x.title}{x.contactName ? <span className="text-ink-muted"> · {x.contactName}</span> : null}</span>
                  {x.overdue && <span className="text-[11px] font-bold text-danger shrink-0">{t.tasksOverdue}</span>}
                </Link>
              ))}
            </div>
          )}
        </>
      );
      case 'stalled': return (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-[14.5px] font-extrabold">{t.navStalled}</h2>
            <Link href={`${base}/crm/stalled`} className="text-[12.5px] font-semibold text-brand-ink hover:underline">←</Link>
          </div>
          {stalled.length === 0 ? <p className="text-ink-secondary text-[13.5px]">{t.stEmpty}</p> : (
            <div className="flex flex-col">
              {stalled.slice(0, 5).map((d) => (
                <Link key={d.id} href={d.contactId ? `${base}/crm?c=${d.contactId}` : `${base}/crm/stalled`} scroll={false}
                  className="flex items-center justify-between gap-2 py-2 border-t first:border-t-0 border-border">
                  <span className="text-[13.5px] font-semibold text-ink truncate" dir="auto">{d.title}</span>
                  <span className="text-[11px] font-bold text-danger bg-danger/10 rounded-full px-2 py-0.5 tabular-nums shrink-0">{d.days} {t.overviewStalledDays}</span>
                </Link>
              ))}
            </div>
          )}
        </>
      );
      case 'activity': return (
        <>
          <h2 className={h2}>{t.overviewActivity}</h2>
          {activity.length === 0 ? <p className="text-ink-secondary text-[13.5px]">{t.overviewActivityEmpty}</p> : (
            <div className="flex flex-col">
              {activity.slice(0, 8).map((a, i) => (
                <div key={i} className="grid grid-cols-[60px_minmax(0,1fr)_auto] gap-3 items-baseline py-1.5 border-t first:border-t-0 border-border">
                  <span className="text-[10.5px] font-bold text-brand-ink/80 uppercase">{a.label}</span>
                  <span className="text-[13px] text-ink-secondary truncate" dir="auto">{a.body}{a.who ? <span className="text-ink-muted"> · {a.who}</span> : null}</span>
                  <span className="text-[11px] text-ink-muted whitespace-nowrap">{a.rel}</span>
                </div>
              ))}
            </div>
          )}
        </>
      );
      case 'sources': {
        const max = Math.max(...sources.map((x) => x.count), 1);
        return (
          <>
            <h2 className={h2}>{t.anaSources}</h2>
            {sources.length === 0 ? <p className="text-ink-secondary text-[13.5px]">{t.reportsNoData}</p> : (
              <div className="flex flex-col gap-2.5">
                {sources.slice(0, 6).map((x) => (
                  <div key={x.label} className="grid grid-cols-[100px_minmax(0,1fr)_26px] items-center gap-2 text-[12px]">
                    <span className="text-ink-secondary truncate" dir="auto">{x.label}</span>
                    <div className="h-[9px] rounded-full bg-soft overflow-hidden"><span className="block h-full rounded-full" style={{ width: `${(x.count / max) * 100}%`, background: 'linear-gradient(90deg, var(--color-brand), var(--color-accent))' }} /></div>
                    <b className="tabular-nums text-ink">{x.count}</b>
                  </div>
                ))}
              </div>
            )}
          </>
        );
      }
      default: return null;
    }
  }

  return (
    <>
      <div className="flex items-center justify-end -mt-2 mb-3">
        <button type="button" onClick={() => { setEdit(!edit); setAdding(false); }}
          className={`inline-flex items-center gap-1.5 text-[12.5px] font-semibold rounded-lg px-3 py-1.5 border transition-colors ${
            edit ? 'text-brand-ink border-brand/40 bg-brand/10' : 'text-ink-muted border-border hover:text-ink'
          }`}>
          {edit ? <><Check size={13} aria-hidden /> {t.dbDone}</> : <><Pencil size={13} aria-hidden /> {t.dbEdit}</>}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {layout.map((w, i) => (
          <div key={`${w.t}-${i}`} className={`${card} ${SPAN[w.s]} col-span-2 ${edit ? 'border-dashed' : 'glow-hover rise'}`}
            style={edit ? undefined : { ['--d' as string]: `${Math.min(i, 8) * 55}ms` }}>
            {edit && (
              <div className="absolute top-2 end-2 z-10 flex items-center gap-1 bg-soft border border-border rounded-lg p-1">
                <button type="button" onClick={() => move(i, -1)} aria-label={t.dbUp} className="p-1 text-ink-muted hover:text-ink"><ChevronUp size={13} /></button>
                <button type="button" onClick={() => move(i, 1)} aria-label={t.dbDown} className="p-1 text-ink-muted hover:text-ink"><ChevronDown size={13} /></button>
                <button type="button" onClick={() => resize(i, 1)} aria-label={t.dbWider} className="p-1 text-ink-muted hover:text-ink"><Maximize2 size={12} /></button>
                <button type="button" onClick={() => resize(i, -1)} aria-label={t.dbNarrower} className="p-1 text-ink-muted hover:text-ink"><Minimize2 size={12} /></button>
                <button type="button" onClick={() => remove(i)} aria-label={t.dbRemove} className="p-1 text-danger"><X size={13} /></button>
              </div>
            )}
            {renderWidget(w)}
          </div>
        ))}

        {edit && (
          <div className="col-span-2 lg:col-span-1 relative">
            <button type="button" onClick={() => setAdding(!adding)}
              className="w-full h-full min-h-[96px] rounded-2xl border border-dashed border-border text-ink-muted hover:text-brand-ink hover:border-brand/40 grid place-items-center">
              <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold"><Plus size={15} aria-hidden /> {t.dbAdd}</span>
            </button>
            {adding && (
              <div className="absolute z-20 top-full mt-2 start-0 w-56 bg-surface border border-border rounded-xl shadow-lg p-2">
                {missing.length === 0 ? <p className="text-[12.5px] text-ink-muted p-2">{t.dbEmptyCat}</p> :
                  missing.map((k) => (
                    <button key={k} type="button" onClick={() => add(k)}
                      className="w-full text-start text-[13px] text-ink-secondary hover:text-ink hover:bg-ink/5 rounded-lg px-3 py-2">
                      {NAMES[k]}
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function Kpi({ value, label, href, mint }: { value: string; label: string; href: string; mint?: boolean }) {
  return (
    <Link href={href} className="flex flex-col gap-1">
      <span className={`font-display text-[25px] font-extrabold tracking-tight tabular-nums leading-none ${mint ? 'text-brand-ink' : ''}`}>{value}</span>
      <span className="text-[12.5px] text-ink-muted">{label}</span>
    </Link>
  );
}
