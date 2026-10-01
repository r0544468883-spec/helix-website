'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmCreateDeal } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';
import { parseDealValue } from '@/components/CrmDrawerDeals';

const field = 'bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';
const NO_DRAFT = { title: '', value: '', contact_id: '' };

/**
 * The Deals screen's one primary action, "עסקה חדשה". It swaps itself for an inline
 * form in the header row (DESIGN.md §9 Forms): the form is w-full, so the header's
 * flex-wrap puts it on its own line under the title. A new deal lands in `ליד`; the
 * board shows it when the page revalidates. Same fields and parsing as the drawer's
 * new-deal form, so "18,000" and "₪18 000" mean the same thing in both places.
 */
export default function CrmAddDeal({
  locale,
  contacts,
  t,
}: {
  locale: string;
  /** Who a deal can be for; an empty choice means no person. */
  contacts: { id: string; name: string }[];
  t: Dict['crm'];
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(NO_DRAFT);
  const [msg, setMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  // A transition's pending flag flips a render late; a double press must not add two.
  const inFlight = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) titleRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setDraft(NO_DRAFT);
    setMsg(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function save() {
    if (inFlight.current) return;
    const title = draft.title.trim();
    if (!title) { setMsg(t.errDealTitleRequired); titleRef.current?.focus(); return; }
    const value = parseDealValue(draft.value);
    if (!value.ok) { setMsg(t.errDealValue); return; }
    inFlight.current = true;
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmCreateDeal({ locale, title, value: value.value, contact_id: draft.contact_id || undefined }));
      inFlight.current = false;
      if (res && 'ok' in res && res.ok) { close(); return; }
      // Not stored: what was typed stays, and the reason is said.
      setMsg(res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.dealSaveFailed, t));
    });
  }

  if (!open) {
    return (
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="bg-brand hover:bg-brand-hover text-on-brand font-bold px-5 py-2.5 rounded-[10px] transition-colors min-h-[44px]"
      >
        {t.addDeal}
      </button>
    );
  }

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); save(); }}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } }}
      className="bg-surface border border-border rounded-2xl p-4 flex flex-wrap gap-2 items-center w-full"
    >
      <input
        ref={titleRef}
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        placeholder={t.dealTitle}
        aria-label={t.dealTitle}
        dir="auto"
        className={`${field} flex-1 min-w-[160px]`}
      />
      <input
        value={draft.value}
        onChange={(e) => setDraft({ ...draft, value: e.target.value })}
        placeholder={t.dealValue}
        aria-label={t.dealValue}
        dir="ltr"
        inputMode="numeric"
        className={`${field} w-28`}
      />
      <select
        value={draft.contact_id}
        onChange={(e) => setDraft({ ...draft, contact_id: e.target.value })}
        aria-label={t.colContact}
        className={`${field} min-w-0 max-w-full`}
      >
        <option value="">{t.dealNoContact}</option>
        {contacts.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <button type="submit" className="bg-brand hover:bg-brand-hover text-on-brand font-bold px-4 py-2 rounded-[10px] text-[14px] min-h-[44px]">{t.save}</button>
      <button type="button" onClick={close} className="text-ink-secondary hover:text-ink px-3 py-2 text-[14px] min-h-[44px] transition-colors">{t.cancel}</button>
      {msg && <p role="alert" className="w-full text-danger text-[13px]">{msg}</p>}
    </form>
  );
}
