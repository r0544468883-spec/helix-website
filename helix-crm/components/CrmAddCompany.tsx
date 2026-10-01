'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmCreateCompany } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';

const NAME_MAX = 80;
const field = 'bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';

/**
 * The Companies screen's one primary action, "חברה חדשה". It swaps itself for an
 * inline form in the header row (DESIGN.md §9 Forms), like CrmAddDeal. The server
 * refuses a name another company in the workspace already has, ignoring case; the
 * new company shows when the page revalidates, and from then on it is offered
 * wherever a person's company is chosen. See DESIGN.md — Companies list.
 */
export default function CrmAddCompany({ locale, t }: { locale: string; t: Dict['crm'] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  // A transition's pending flag flips a render late; a double press must not add two.
  const inFlight = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function close() {
    setOpen(false);
    setName('');
    setMsg(null);
    requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function save() {
    if (inFlight.current) return;
    const trimmed = name.trim();
    if (!trimmed) { setMsg(t.coNameEmpty); inputRef.current?.focus(); return; }
    if (Array.from(trimmed).length > NAME_MAX) { setMsg(t.coNameLong); return; }
    inFlight.current = true;
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmCreateCompany({ locale, name: trimmed }));
      inFlight.current = false;
      if (res && 'ok' in res && res.ok) { close(); return; }
      // Not created: the name stays in the field, and the reason is said.
      setMsg(res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.coCreateFailed, t));
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
        {t.coNew}
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
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t.coName}
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
