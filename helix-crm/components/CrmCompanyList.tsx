'use client';

import { useEffect, useId, useMemo, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, Search, X } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { STATUS_BADGE, isContactStatus, type ContactStatus } from '@/lib/crm-status';
import { crmRenameCompany } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';

export type CompanyPerson = { id: string; name: string; status: string };
export type CompanyDeal = {
  id: string; title: string; contactId: string | null;
  /** The stage's or result's words ("הצעה", "נסגרה"), and "₪8,000"; both from the server. */
  stageText: string; valueText: string | null;
};
export type CompanyRow = {
  id: string;
  name: string;
  /** Most promising first, as on the contacts list. */
  people: CompanyPerson[];
  /** Open first, then won. Lost deals are not listed. */
  deals: CompanyDeal[];
  // The row's words, made on the server so the two renders agree.
  peopleText: string;
  dealsText: string;
  lastActivity: string;
};

const NAME_MAX = 80;
const field = 'bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';

/**
 * Every company in the workspace. A row opens in place, below itself, to show the
 * company's people and its open and won deals; a person (or a deal's person) opens
 * in the drawer over this screen. Which companies are open is this component's
 * state, so closing a drawer, which re-renders the page, leaves them open. A
 * writer renames an open company here. See DESIGN.md — Companies list.
 */
export default function CrmCompanyList({
  companies,
  readOnly = false,
  locale,
  t,
}: {
  companies: CompanyRow[];
  readOnly?: boolean;
  locale: string;
  t: Dict['crm'];
}) {
  const pathname = usePathname() || `/${locale}/dashboard/crm/companies`;
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  // A rename shows at once; a failed one goes back to the server's name.
  const [renamed, setRenamed] = useState<Record<string, string>>({});
  const baseId = useId();
  // Once the server's list carries a rename, the local copy has done its job.
  useEffect(() => {
    setRenamed((r) => {
      let changed = false;
      const n = { ...r };
      for (const c of companies) if (n[c.id] !== undefined && n[c.id] === c.name) { delete n[c.id]; changed = true; }
      return changed ? n : r;
    });
  }, [companies]);

  const nameOf = (c: CompanyRow) => renamed[c.id] ?? c.name;
  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase();
    if (!needle) return companies;
    return companies.filter((c) => (renamed[c.id] ?? c.name).toLocaleLowerCase().includes(needle));
  }, [q, companies, renamed]);

  function toggle(id: string) {
    setOpen((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id); else n.add(id);
      return n;
    });
  }

  if (companies.length === 0) return <p className="text-ink-muted text-[15px]">{t.coEmpty}</p>;

  const cols = 'grid-cols-[20px_minmax(0,1fr)] md:grid-cols-[20px_minmax(0,1fr)_132px_minmax(0,180px)_120px]';

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} aria-hidden="true" className="absolute top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" style={{ insetInlineStart: 12 }} />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.coFilter}
            aria-label={t.coFilter}
            dir="auto"
            className="w-full bg-bg border border-border rounded-[10px] ps-9 pe-3 py-2.5 text-[15px] outline-none focus:border-brand"
          />
        </div>
        {q.trim() !== '' && (
          <button
            type="button"
            onClick={() => setQ('')}
            className="flex items-center gap-1 text-[12px] text-ink-secondary hover:text-ink border border-border rounded-full px-2.5 min-h-[44px] transition-colors"
          >
            <X size={12} aria-hidden="true" />
            {t.filterClear}
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="text-ink-muted text-[15px]" aria-live="polite">{t.coNoMatch}</p>
      ) : (
        <>
          <div aria-hidden="true" className={`hidden md:grid ${cols} gap-x-4 px-3 pb-2 border border-transparent text-[12px] font-semibold text-ink-muted`}>
            <span />
            <span>{t.coColCompany}</span>
            <span>{t.coColPeople}</span>
            <span>{t.coColDeals}</span>
            <span>{t.coColActivity}</span>
          </div>
          <ul className="flex flex-col gap-2">
            {shown.map((c) => {
              const isOpen = open.has(c.id);
              const panelId = `${baseId}-${c.id}`;
              return (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => toggle(c.id)}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    className={`w-full text-start grid ${cols} gap-x-4 gap-y-1 items-center bg-surface border rounded-xl p-3 min-h-[44px] hover:border-brand transition-colors ${isOpen ? 'border-border-strong' : 'border-border'}`}
                  >
                    <ChevronDown
                      size={16}
                      aria-hidden="true"
                      className={`text-ink-muted transition-transform ${isOpen ? '' : 'ltr:-rotate-90 rtl:rotate-90'}`}
                    />
                    <span className="text-[15px] font-semibold truncate" dir="auto">{nameOf(c)}</span>
                    {/* Below md the three values wrap under the name, each with its label. */}
                    <span className="col-start-2 md:col-start-auto flex flex-wrap gap-x-3 gap-y-0.5 text-[13px] text-ink-secondary md:contents">
                      <span className="whitespace-nowrap"><span className="text-ink-muted md:sr-only">{t.coColPeople}: </span>{c.peopleText}</span>
                      <span className="whitespace-nowrap"><span className="text-ink-muted md:sr-only">{t.coColDeals}: </span>{c.dealsText}</span>
                      <span className="whitespace-nowrap"><span className="text-ink-muted md:sr-only">{t.coColActivity}: </span>{c.lastActivity}</span>
                    </span>
                  </button>
                  {isOpen && (
                    <CompanyPanel
                      id={panelId}
                      company={c}
                      name={nameOf(c)}
                      pathname={pathname}
                      readOnly={readOnly}
                      locale={locale}
                      t={t}
                      onRenamed={(name) => setRenamed((r) => ({ ...r, [c.id]: name }))}
                      onRenameFailed={() => setRenamed((r) => { const n = { ...r }; delete n[c.id]; return n; })}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function CompanyPanel({
  id, company, name, pathname, readOnly, locale, t, onRenamed, onRenameFailed,
}: {
  id: string;
  company: CompanyRow;
  name: string;
  pathname: string;
  readOnly: boolean;
  locale: string;
  t: Dict['crm'];
  onRenamed: (name: string) => void;
  onRenameFailed: () => void;
}) {
  const statusOf = (s: string): ContactStatus => (isContactStatus(s) ? s : 'new');
  const nothing = company.people.length === 0 && company.deals.length === 0;

  return (
    <div id={id} className="bg-bg border border-border rounded-xl p-3 mt-1">
      {nothing ? (
        <p className="text-ink-muted text-[14px]">{t.coNothingLinked}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {company.people.length > 0 && (
            <div className="min-w-0">
              <h3 className="text-[12px] font-semibold text-ink-muted mb-1 px-2">{t.coPeopleHeading}</h3>
              <ul className="flex flex-col">
                {company.people.map((p) => {
                  const st = statusOf(p.status);
                  return (
                    <li key={p.id}>
                      <Link
                        href={`${pathname}?c=${p.id}`}
                        scroll={false}
                        data-contact-row={p.id}
                        className="flex items-center gap-2 min-h-[44px] px-2 rounded-lg hover:bg-ink/5 transition-colors"
                      >
                        <span className="text-[14px] font-semibold truncate min-w-0" dir="auto">{p.name}</span>
                        <span className={`shrink-0 text-[12px] font-semibold rounded-full px-2.5 py-0.5 whitespace-nowrap ${STATUS_BADGE[st]}`}>
                          {t[`cs_${st}` as keyof Dict['crm']] as string}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {company.deals.length > 0 && (
            <div className="min-w-0">
              <h3 className="text-[12px] font-semibold text-ink-muted mb-1 px-2">{t.coDealsHeading}</h3>
              <ul className="flex flex-col">
                {company.deals.map((d) => {
                  const inner = (
                    <>
                      <span className="text-[14px] font-semibold truncate min-w-0" dir="auto">{d.title}</span>
                      <span className="shrink-0 text-[12px] text-ink-secondary">{d.stageText}</span>
                      {d.valueText && <span className="shrink-0 text-[12px] text-brand-ink font-mono ms-auto">{d.valueText}</span>}
                    </>
                  );
                  return (
                    <li key={d.id}>
                      {d.contactId ? (
                        <Link
                          href={`${pathname}?c=${d.contactId}`}
                          scroll={false}
                          data-contact-row={d.contactId}
                          className="flex items-center gap-2 min-h-[44px] px-2 rounded-lg hover:bg-ink/5 transition-colors"
                        >
                          {inner}
                        </Link>
                      ) : (
                        <div className="flex items-center gap-2 min-h-[44px] px-2">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
      {!readOnly && (
        <Rename
          companyId={company.id}
          name={name}
          locale={locale}
          t={t}
          onRenamed={onRenamed}
          onRenameFailed={onRenameFailed}
        />
      )}
    </div>
  );
}

function Rename({
  companyId, name, locale, t, onRenamed, onRenameFailed,
}: {
  companyId: string;
  name: string;
  locale: string;
  t: Dict['crm'];
  onRenamed: (name: string) => void;
  onRenameFailed: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [msg, setMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const inFlight = useRef(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setEditing(false);
    setMsg(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function save() {
    if (inFlight.current) return;
    const next = draft.trim();
    if (!next) { setMsg(t.coNameEmpty); return; }
    if (Array.from(next).length > NAME_MAX) { setMsg(t.coNameLong); return; }
    if (next === name) { close(); return; }
    inFlight.current = true;
    setMsg(null);
    onRenamed(next);
    startTransition(async () => {
      const res = await withTimeout(crmRenameCompany({ locale, id: companyId, name: next }));
      inFlight.current = false;
      if (res && 'ok' in res && res.ok) { close(); return; }
      // Not stored: the list goes back to the old name, the edit keeps what was typed.
      onRenameFailed();
      setMsg(res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.coRenameFailed, t));
    });
  }

  if (!editing) {
    return (
      <div className="mt-2 pt-2 border-t border-border">
        <button
          ref={triggerRef}
          type="button"
          onClick={() => { setDraft(name); setEditing(true); }}
          className="text-ink-secondary hover:text-ink px-3 py-2 text-[14px] min-h-[44px] transition-colors"
        >
          {t.coRename}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); save(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } }}
      className="mt-2 pt-2 border-t border-border flex flex-wrap gap-2 items-center"
    >
      <input
        autoFocus
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label={t.coName}
        dir="auto"
        className={`${field} flex-1 min-w-[180px]`}
      />
      <button type="submit" className="bg-brand hover:bg-brand-hover text-on-brand font-bold px-4 py-2 rounded-[10px] text-[14px] min-h-[44px]">{t.save}</button>
      <button type="button" onClick={close} className="text-ink-secondary hover:text-ink px-3 py-2 text-[14px] min-h-[44px] transition-colors">{t.cancel}</button>
      {msg && <p role="alert" className="w-full text-danger text-[13px]">{msg}</p>}
    </form>
  );
}
