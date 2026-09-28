'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X, Clock, ListChecks } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { STATUS_BADGE, isContactStatus, type ContactStatus } from '@/lib/crm-status';
import BidiParts from '@/components/BidiParts';

export type ListContact = {
  id: string;
  full_name: string;
  email: string | null;
  role_title: string | null;
  status: string;
  score: number;
  company?: string;
  /** Relative, already localised on the server ("לפני 3 ימים", "טרם"). */
  lastTouch: string;
  /** Active status and quiet for STALL_DAYS or more — see needsTouch(). */
  stale: boolean;
  /** Earliest-due open task, if any. `due` is pre-formatted day/month. */
  task: { title: string; due: string | null; overdue: boolean } | null;
};

// The board loads the top 200 contacts by score. Finding one used to mean the
// browser's own Ctrl+F: there was no filter and no paging. This narrows the rows
// already in memory, so it issues no request. See DESIGN.md — CRM Shell / search.
export default function CrmContactList({
  locale,
  contacts,
  capped,
  t,
}: {
  locale: string;
  contacts: ListContact[];
  /** True when the workspace holds more than the 200 the board loaded. */
  capped: boolean;
  t: Dict['crm'];
}) {
  const [q, setQ] = useState('');
  const [onlyStale, setOnlyStale] = useState(false);
  const staleCount = useMemo(() => contacts.filter((c) => c.stale).length, [contacts]);
  // The chip disappears when nothing is stale, so it must not keep filtering unseen.
  const staleOn = onlyStale && staleCount > 0;

  const statusOf = (c: ListContact): ContactStatus => (isContactStatus(c.status) ? c.status : 'new');
  const statusLabel = (c: ListContact) => t[`cs_${statusOf(c)}` as keyof Dict['crm']] as string;

  const pool = useMemo(() => (staleOn ? contacts.filter((c) => c.stale) : contacts), [staleOn, contacts]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return pool;
    // The status label is searchable too: typing "הצעה" should narrow to the
    // contacts whose status is `proposal`, which is how you find them by state.
    return pool.filter((c) =>
      [c.full_name, c.company, c.role_title, c.email, statusLabel(c)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, pool, t]);

  return (
    <div>
      <h2 className="sr-only">{t.contactsHeading}</h2>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search
            size={15}
            aria-hidden="true"
            className="absolute top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none"
            style={{ insetInlineStart: 12 }}
          />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.filterPlaceholder}
            dir="auto"
            aria-label={t.filterPlaceholder}
            className="w-full bg-bg border border-border rounded-[10px] ps-9 pe-3 py-2.5 text-[15px] outline-none focus:border-brand"
          />
        </div>
        {staleCount > 0 && (
          <button
            type="button"
            onClick={() => setOnlyStale((v) => !v)}
            aria-pressed={staleOn}
            className={`flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-3 min-h-[44px] border transition-colors ${staleOn ? 'border-brand text-brand-ink bg-brand/10' : 'border-border text-ink-secondary hover:text-ink'}`}
          >
            <Clock size={14} aria-hidden="true" />
            {t.needsTouchFilter.replace('{n}', String(staleCount))}
          </button>
        )}
        {q.trim() !== '' && (
          <>
            <span className="text-[12px] text-ink-muted font-mono" aria-live="polite">
              {t.filterCount.replace('{shown}', String(shown.length)).replace('{total}', String(pool.length))}
            </span>
            <button
              type="button"
              onClick={() => setQ('')}
              className="flex items-center gap-1 text-[12px] text-ink-secondary hover:text-ink border border-border rounded-full px-2.5 py-1 transition-colors"
            >
              <X size={12} aria-hidden="true" />
              {t.filterClear}
            </button>
          </>
        )}
      </div>

      {capped && <p className="text-ink-muted text-[12px] mb-3">{t.contactsCapped}</p>}

      {contacts.length === 0 ? (
        <p className="text-ink-muted text-[15px]">{t.emptyContacts}</p>
      ) : shown.length === 0 ? (
        <p className="text-ink-muted text-[15px]">
          {t.filterEmpty}{' '}
          <button type="button" onClick={() => setQ('')} className="text-brand-ink underline">
            {t.filterClear}
          </button>
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {shown.map((c) => (
            <Link
              key={c.id}
              href={`/${locale}/dashboard/crm?c=${c.id}`}
              scroll={false}
              data-contact-row={c.id}
              className="flex items-start gap-3 bg-surface border border-border rounded-xl p-3 min-h-[44px] hover:border-brand transition-colors"
            >
              {/* The score is a neutral number now. Status owns colour in this row:
                  two coloured signals contradicted each other (a "cold" paying client).
                  See DESIGN.md — CRM contact status. */}
              <span className="font-mono font-bold text-[15px] w-12 text-center rounded-lg py-1 bg-ink/5 text-ink-secondary shrink-0">{c.score}</span>
              <div className="min-w-0 flex-1">
                {/* The chip sits beside the name, not at the far edge: on a wide screen
                    the eye had to cross the whole row to pair a person with a status. */}
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-semibold text-[15px] truncate" dir="auto">{c.full_name}</span>
                  <span className={`text-[12px] font-semibold rounded-full px-2.5 py-0.5 shrink-0 whitespace-nowrap ${STATUS_BADGE[statusOf(c)]}`}>
                    {statusLabel(c)}
                  </span>
                </div>
                {(c.role_title || c.company || c.email) && (
                  <p className="text-ink-secondary text-[13px] truncate">
                    <BidiParts parts={[c.role_title, c.company, c.email]} />
                  </p>
                )}
                {c.task && (
                  <p className="flex items-center gap-1.5 text-[13px] mt-1 min-w-0">
                    <ListChecks size={13} aria-hidden="true" className="text-ink-muted shrink-0" />
                    <span className="truncate text-ink" dir="auto">{c.task.title}</span>
                    {c.task.due && (
                      <span className={`shrink-0 whitespace-nowrap ${c.task.overdue ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
                        {c.task.overdue ? `${t.taskOverdue} · ` : ''}{t.taskDue.replace('{date}', c.task.due)}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0 text-end">
                <span className="text-[12px] text-ink-muted whitespace-nowrap" title={t.lastTouchLabel}>
                  <span className="sr-only">{t.lastTouchLabel}: </span>{c.lastTouch}
                </span>
                {c.stale && (
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-ink border border-border-strong rounded-full px-2 py-0.5 whitespace-nowrap">
                    <Clock size={11} aria-hidden="true" />
                    {t.needsTouch}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
