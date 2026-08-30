'use client';

import { useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmCreateDeal, crmMoveDeal } from '@/app/crm-actions';
import { useFlip } from '@/lib/motion/useFlip';

const STAGES = ['lead', 'qualified', 'meeting', 'proposal', 'negotiation', 'won'] as const;
type Stage = (typeof STAGES)[number];

type Deal = { id: string; title: string; value: number; currency: string; stage: string; status: string; contactName?: string };

export default function CrmDealBoard({
  locale,
  deals,
  contacts,
  t,
}: {
  locale: string;
  deals: Deal[];
  contacts: { id: string; name: string }[];
  t: Dict['crm'];
}) {
  const [isPending, startTransition] = useTransition();
  // FLIP reflow: when a deal changes stage, cards flow to their new position (spring), not jump.
  const boardRef = useFlip<HTMLDivElement>([deals]);
  const [adding, setAdding] = useState(false);
  const [nf, setNf] = useState({ title: '', value: '', contact_id: '' });

  function move(id: string, dir: -1 | 1, cur: string) {
    const i = STAGES.indexOf(cur as Stage);
    const ni = Math.max(0, Math.min(STAGES.length - 1, i + dir));
    if (ni === i) return;
    startTransition(() => { void crmMoveDeal(id, STAGES[ni], locale); });
  }
  function lose(id: string) {
    startTransition(() => { void crmMoveDeal(id, 'lost', locale); });
  }
  function add() {
    if (!nf.title.trim()) return;
    startTransition(async () => {
      const res = await crmCreateDeal({ locale, title: nf.title, value: Number(nf.value) || 0, contact_id: nf.contact_id || undefined });
      if (res?.ok) { setNf({ title: '', value: '', contact_id: '' }); setAdding(false); }
    });
  }

  return (
    <>
      <div className="mb-4">
        {!adding ? (
          <button onClick={() => setAdding(true)} className="border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand font-semibold px-4 py-2 rounded-[10px] text-[14px]">+ {t.addDeal}</button>
        ) : (
          <div className="bg-surface border border-border rounded-2xl p-4 flex flex-wrap gap-2 items-center">
            <input value={nf.title} onChange={(e) => setNf({ ...nf, title: e.target.value })} placeholder={t.dealTitle} dir="auto" className="flex-1 min-w-[160px] bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand" />
            <input value={nf.value} onChange={(e) => setNf({ ...nf, value: e.target.value })} placeholder={t.dealValue} dir="ltr" inputMode="numeric" className="w-28 bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand" />
            <select value={nf.contact_id} onChange={(e) => setNf({ ...nf, contact_id: e.target.value })} className="bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand">
              <option value="">{t.dealNoContact}</option>
              {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={add} disabled={isPending} className="bg-brand text-bg font-semibold px-4 py-2 rounded-[10px] text-[14px] disabled:opacity-50">{t.save}</button>
            <button onClick={() => setAdding(false)} className="text-ink-secondary px-3 py-2 text-[14px]">{t.cancel}</button>
          </div>
        )}
      </div>

      <div ref={boardRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STAGES.map((stage) => {
          const items = deals.filter((d) => d.stage === stage && d.status !== 'lost');
          const total = items.reduce((a, d) => a + (d.value || 0), 0);
          return (
            <div key={stage} className="bg-bg border border-border rounded-xl p-2 min-h-[120px]">
              <div className="flex items-center justify-between px-1 mb-2">
                <span className="text-[12px] font-bold text-ink-secondary">{t[`st_${stage}` as keyof Dict['crm']] as string}</span>
                <span className="text-[11px] text-ink-muted font-mono">{items.length}</span>
              </div>
              {total > 0 && <div className="text-[11px] text-brand font-mono px-1 mb-2">₪{total.toLocaleString()}</div>}
              <div className="flex flex-col gap-2">
                {items.map((d) => (
                  <div key={d.id} data-flip-id={d.id} className="bg-surface border border-border rounded-lg p-2.5">
                    <p className="text-[13px] font-semibold leading-snug" dir="auto">{d.title}</p>
                    {d.contactName && <p className="text-[11px] text-ink-muted mt-0.5" dir="auto">{d.contactName}</p>}
                    {d.value > 0 && <p className="text-[11px] text-brand font-mono mt-0.5">₪{d.value.toLocaleString()}</p>}
                    <div className="flex items-center gap-1 mt-2">
                      <button onClick={() => move(d.id, -1, d.stage)} disabled={isPending} className="text-ink-muted hover:text-ink text-[14px] px-1 disabled:opacity-40">‹</button>
                      <button onClick={() => move(d.id, 1, d.stage)} disabled={isPending} className="text-ink-muted hover:text-brand text-[14px] px-1 disabled:opacity-40">›</button>
                      <button onClick={() => lose(d.id)} disabled={isPending} className="text-ink-muted hover:text-red-400 text-[11px] px-1 ms-auto disabled:opacity-40">{t.st_lost}</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
