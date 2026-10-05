'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X, Clock, Bell, Phone, Star, Tag } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { STATUS_BADGE, isContactStatus, type ContactStatus } from '@/lib/crm-status';
import BidiParts from '@/components/BidiParts';

export type ListContact = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role_title: string | null;
  status: string;
  // No score: the list doesn't show it, and the page already sorts by it.
  company?: string;
  /** תאריך הכניסה (created_at), בפורמט ישראלי ("3.10.2026"), מחושב בשרת. */
  entryDate: string | null;
  /** מקור הליד (matana / content / manual ...), גולמי. */
  source: string | null;
  /** חבר/ת קהילת הפרגונים (ליד "מתנה" עם ניקוד עדיפות). */
  fromCommunity: boolean;
  /** Relative, already localised on the server ("לפני 3 ימים", "טרם"). */
  lastTouch: string;
  /** Active status and quiet for STALL_DAYS or more — see needsTouch(). */
  stale: boolean;
  /** Earliest-due open task, if any. `due` is pre-formatted day/month. */
  task: { title: string; due: string | null; overdue: boolean } | null;
};

// From md the four columns line up under the head: status and last touch are fixed
// widths, contact and reminder share the rest. Below md the same row is a card.
const MD_COLS = 'md:grid-cols-[minmax(0,1fr)_132px_minmax(0,1fr)_120px]';

// The board loads the top 200 contacts by score. Finding one used to mean the
// browser's own Ctrl+F: there was no filter and no paging. This narrows the rows
// already in memory, so it issues no request. See DESIGN.md — CRM Shell / search.
// Every value says what it is: a column head from md, a label on a phone. The score
// is not shown; the drawer's details explain it. See DESIGN.md — Contacts table.
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
  // מקור הליד בעברית אם מוכר (src_*), אחרת הערך הגולמי.
  const srcLabel = (s: string) => (t[`src_${s}` as keyof Dict['crm']] as string) || s;

  const pool = useMemo(() => (staleOn ? contacts.filter((c) => c.stale) : contacts), [staleOn, contacts]);

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return pool;
    // The status label is searchable too: typing "הצעה" should narrow to the
    // contacts whose status is `proposal`, which is how you find them by state.
    return pool.filter((c) =>
      [c.full_name, c.company, c.role_title, c.email, c.phone, statusLabel(c)]
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
        <>
          {/* The number is gone from the rows, so the order says what it is. */}
          <p className="text-[12px] text-ink-muted mb-2">{t.listOrder}</p>
          <div role="table" aria-label={t.contactsHeading}>
            <div role="rowgroup">
              <div
                role="row"
                className={`hidden md:grid ${MD_COLS} gap-x-4 px-3 pb-2 border border-transparent text-[12px] font-semibold text-ink-muted`}
              >
                <span role="columnheader">{t.colContact}</span>
                <span role="columnheader">{t.statusLabel}</span>
                <span role="columnheader">{t.nextStep}</span>
                <span role="columnheader">{t.lastTouchLabel}</span>
              </div>
            </div>
            <div role="rowgroup" className="flex flex-col gap-2">
              {shown.map((c) => (
                <div
                  key={c.id}
                  role="row"
                  className={`relative grid grid-cols-[minmax(0,1fr)_auto] ${MD_COLS} gap-x-4 gap-y-1 items-start bg-surface border border-border rounded-xl p-3 min-h-[44px] hover:border-brand transition-colors`}
                >
                  <div role="cell" className="min-w-0">
                    {/* The link is an empty layer over the whole card: a tap anywhere opens
                        the person, it is one keyboard stop, and the global focus ring (which
                        no utility can switch off) outlines the card. The drawer focuses it
                        on close through data-contact-row. See DESIGN.md — Contacts table. */}
                    <Link
                      href={`/${locale}/dashboard/crm?c=${c.id}`}
                      scroll={false}
                      data-contact-row={c.id}
                      aria-label={c.full_name}
                      className="absolute inset-0 rounded-xl"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <span aria-hidden="true" className="font-semibold text-[15px] truncate" dir="auto">{c.full_name}</span>
                      {c.fromCommunity && (
                        <span className="relative z-[1] inline-flex items-center gap-1 text-[11px] font-semibold text-brand-ink bg-brand/10 border border-brand/30 rounded-full px-2 py-0.5 whitespace-nowrap shrink-0">
                          <Star size={11} aria-hidden="true" />{t.communityBadge}
                        </span>
                      )}
                    </div>
                    {(c.role_title || c.company || c.email) && (
                      <p className="text-ink-secondary text-[13px] truncate">
                        <BidiParts parts={[c.role_title, c.company, c.email]} />
                      </p>
                    )}
                    {c.phone && (
                      <p className="text-ink-secondary text-[13px] truncate" dir="ltr">
                        <span className="inline-flex items-center gap-1"><Phone size={12} aria-hidden="true" className="text-ink-muted" />{c.phone}</span>
                      </p>
                    )}
                    {c.source && (
                      <span className="relative z-[1] inline-flex items-center gap-1 mt-0.5 text-[11px] text-ink-secondary border border-border rounded-full px-2 py-0.5 whitespace-nowrap">
                        <Tag size={10} aria-hidden="true" className="text-ink-muted" />{srcLabel(c.source)}
                      </span>
                    )}
                  </div>
                  <div role="cell">
                    {/* Status owns colour in this row (DESIGN.md §3); nothing else is coloured. */}
                    <span className={`inline-block text-[12px] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap ${STATUS_BADGE[statusOf(c)]}`}>
                      {statusLabel(c)}
                    </span>
                  </div>
                  <div role="cell" className="col-span-2 md:col-span-1 flex items-center gap-1.5 min-w-0 text-[13px]">
                    <span className="md:hidden text-ink-muted shrink-0">{t.nextStep}:</span>
                    {c.task ? (
                      <>
                        {/* The reminder's mark, as in the drawer (DESIGN.md — Reminder). */}
                        <Bell size={13} aria-hidden="true" className="text-ink-muted shrink-0" />
                        <span className="truncate text-ink" dir="auto">{c.task.title}</span>
                        {c.task.due && (
                          <span className={`shrink-0 whitespace-nowrap ${c.task.overdue ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
                            {c.task.overdue ? `${t.taskOverdue} · ` : ''}{t.taskDue.replace('{date}', c.task.due)}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-ink-muted">{t.reminderNone}</span>
                    )}
                  </div>
                  <div role="cell" className="col-span-2 md:col-span-1 flex flex-wrap items-center gap-x-2 gap-y-1 md:flex-col md:items-start text-[13px]">
                    <span>
                      <span className="md:hidden text-ink-muted">{t.lastTouchLabel}: </span>
                      <span className="text-ink-secondary whitespace-nowrap">{c.lastTouch}</span>
                    </span>
                    {c.entryDate && (
                      <span className="text-ink-muted text-[12px] whitespace-nowrap">
                        {t.entryLabel}: {c.entryDate}
                      </span>
                    )}
                    {c.stale && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-ink border border-border-strong rounded-full px-2 py-0.5 whitespace-nowrap">
                        <Clock size={11} aria-hidden="true" />
                        {t.needsTouch}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
