'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { XCircle, BellPlus } from 'lucide-react';
import { crmBulkStalled } from '@/app/crm-actions';
import type { Dict } from '@/lib/i18n/he';

export type StalledRow = {
  id: string;
  title: string;
  value: number;
  stageLabel: string;
  contactId: string | null;
  contactName: string | null;
  days: number;
};

/** The stalled list with PLUG-style bulk actions: select → mark lost / create a
 *  revival task per deal. Optimistic removal on "lost"; tasks keep the rows. */
export default function CrmStalledList({ locale, base, rows: initial, canWrite, t }: {
  locale: string;
  base: string;
  rows: StalledRow[];
  canWrite: boolean;
  t: Dict['crm'];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initial);
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [msg, setMsg] = useState('');
  const [busy, startTransition] = useTransition();

  const toggle = (id: string) =>
    setSel((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allSelected = sel.size === rows.length && rows.length > 0;

  function run(op: 'lost' | 'task') {
    const ids = [...sel];
    if (!ids.length) return;
    setMsg('');
    startTransition(async () => {
      const r = await crmBulkStalled(locale, ids, op);
      if (!r.ok) { setMsg(t.aiError); return; }
      setMsg(`${t.stActed} ${r.acted}`);
      if (op === 'lost') setRows((rs) => rs.filter((x) => !sel.has(x.id)));
      setSel(new Set());
      router.refresh();
    });
  }

  return (
    <>
      {canWrite && rows.length > 0 && (
        <div className="flex items-center gap-2.5 flex-wrap mb-3 rise" style={{ ['--d' as string]: '200ms' }}>
          <button type="button" onClick={() => setSel(allSelected ? new Set() : new Set(rows.map((r) => r.id)))}
            className="text-[13px] font-semibold text-ink-secondary hover:text-ink border border-border rounded-lg px-3 py-1.5">
            {allSelected ? t.stClear : t.stSelectAll}
          </button>
          {sel.size > 0 && (
            <>
              <span className="text-[13px] text-ink-muted tabular-nums">{sel.size} {t.stSelected}</span>
              <button type="button" disabled={busy} onClick={() => run('task')}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-brand-ink bg-brand/10 border border-brand/30 rounded-lg px-3 py-1.5 disabled:opacity-60">
                <BellPlus size={14} aria-hidden /> {t.stBulkTask}
              </button>
              <button type="button" disabled={busy} onClick={() => run('lost')}
                className="inline-flex items-center gap-1.5 text-[13px] font-bold text-danger bg-danger/10 border border-danger/30 rounded-lg px-3 py-1.5 disabled:opacity-60">
                <XCircle size={14} aria-hidden /> {t.stBulkLost}
              </button>
            </>
          )}
          {msg && <span className="text-[13px] font-semibold text-brand-ink">{msg}</span>}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="bg-surface border border-border rounded-2xl p-6 text-center">
          <p className="text-brand-ink font-semibold text-[15px]">{t.stEmpty}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rows.map((d, i) => (
            <div key={d.id}
              className={`glow-hover rise flex items-center gap-3 bg-surface border rounded-xl px-4 py-3 min-h-[52px] ${
                sel.has(d.id) ? 'border-brand/50 bg-brand/5' : 'border-border'
              }`}
              style={{ ['--d' as string]: `${220 + Math.min(i, 8) * 45}ms` }}>
              {canWrite && (
                <input type="checkbox" checked={sel.has(d.id)} onChange={() => toggle(d.id)}
                  aria-label={d.title} className="size-[17px] shrink-0 accent-[var(--color-brand)]" />
              )}
              <Link href={d.contactId ? `${base}/crm?c=${d.contactId}` : `${base}/crm`} scroll={false} className="flex-1 min-w-0">
                <span className="block text-[14.5px] font-semibold text-ink truncate" dir="auto">{d.title}</span>
                <span className="block text-[12px] text-ink-muted truncate" dir="auto">
                  {d.stageLabel}{d.contactName ? ` · ${d.contactName}` : ''}{d.value > 0 ? ` · ₪${Math.round(d.value).toLocaleString()}` : ''}
                </span>
              </Link>
              <span className={`text-[12px] font-bold rounded-full px-2.5 py-1 whitespace-nowrap tabular-nums ${
                d.days >= 30 ? 'text-danger bg-danger/10' : d.days >= 20 ? 'text-accent-ink bg-accent/10' : 'text-ink-secondary bg-soft'
              }`}>{d.days >= 999 ? '—' : d.days} {t.overviewStalledDays}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
