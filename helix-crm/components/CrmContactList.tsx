'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { STATUS_BADGE, isContactStatus, type ContactStatus } from '@/lib/crm-status';

export type ListContact = {
  id: string;
  full_name: string;
  email: string | null;
  role_title: string | null;
  status: string;
  score: number;
  company?: string;
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

  const statusOf = (c: ListContact): ContactStatus => (isContactStatus(c.status) ? c.status : 'new');
  const statusLabel = (c: ListContact) => t[`cs_${statusOf(c)}` as keyof Dict['crm']] as string;

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return contacts;
    // The status label is searchable too: typing "הצעה" should narrow to the
    // contacts whose status is `proposal`, which is how you find them by state.
    return contacts.filter((c) =>
      [c.full_name, c.company, c.role_title, c.email, statusLabel(c)]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(needle)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, contacts, t]);

  return (
    <div>
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
        {q.trim() !== '' && (
          <>
            <span className="text-[12px] text-ink-muted font-mono" aria-live="polite">
              {t.filterCount.replace('{shown}', String(shown.length)).replace('{total}', String(contacts.length))}
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
          <button type="button" onClick={() => setQ('')} className="text-brand underline">
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
              className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3 hover:border-brand transition-colors"
            >
              {/* The score is a neutral number now. Status owns colour in this row:
                  two coloured signals contradicted each other (a "cold" paying client).
                  See DESIGN.md — CRM contact status. */}
              <span className="font-mono font-bold text-[15px] w-12 text-center rounded-lg py-1 bg-white/5 text-ink-secondary shrink-0">{c.score}</span>
              <div className="min-w-0 flex-1">
                <span className="font-semibold text-[15px]" dir="auto">{c.full_name}</span>
                <p className="text-ink-secondary text-[13px] truncate" dir="auto">
                  {[c.role_title, c.company, c.email].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className={`text-[12px] font-semibold rounded-full px-2.5 py-0.5 shrink-0 whitespace-nowrap ${STATUS_BADGE[statusOf(c)]}`}>
                {statusLabel(c)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
