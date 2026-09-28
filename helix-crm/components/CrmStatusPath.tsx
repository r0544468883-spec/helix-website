'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { Sheet } from '@/lib/motion/Sheet';
import {
  PATH_STATUSES, EXIT_STATUSES, STATUS_BAR, STATUS_TEXT, isContactStatus, statusKey, type ContactStatus,
} from '@/lib/crm-status';

/**
 * The status as a path of seven steps, from ליד חדש at the start edge to לקוח פעיל.
 * One tap on a step sets that status; the two exits sit beside the path, never on
 * it. Below `sm` the steps would be ~38px wide, under the 44px rule, so the path
 * becomes one control that opens a sheet listing all nine. Saving, undo and the
 * follow-up questions belong to the caller (useStatusChange). See DESIGN.md —
 * Status path.
 */
export default function CrmStatusPath({
  locale,
  status,
  readOnly = false,
  onChange,
  onListOpenChange,
  t,
}: {
  locale: string;
  status: string;
  /** viewer role: the path is shown, and nothing on it is a control. */
  readOnly?: boolean;
  onChange: (next: ContactStatus) => void;
  /** The drawer ignores Escape while the phone list is open, so Escape closes only the list. */
  onListOpenChange?: (open: boolean) => void;
  t: Dict['crm'];
}) {
  const cur: ContactStatus = isContactStatus(status) ? status : 'new';
  const curIndex = (PATH_STATUSES as readonly ContactStatus[]).indexOf(cur); // -1 while in an exit
  const rtl = locale !== 'en';
  const label = (s: ContactStatus) => t[statusKey(s)];
  const short = (s: (typeof PATH_STATUSES)[number]) => t[`csShort_${s}`];

  // Roving focus: the toolbar is one tab stop, arrows move within it.
  const [focusIdx, setFocusIdx] = useState(Math.max(0, curIndex));
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => { setFocusIdx(Math.max(0, curIndex)); }, [curIndex]);

  const [listOpen, setListOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef<Map<ContactStatus, HTMLButtonElement>>(new Map());
  useEffect(() => setMounted(true), []);
  useEffect(() => { onListOpenChange?.(listOpen); }, [listOpen, onListOpenChange]);
  // Focus goes into the list when it opens, to the current status.
  useEffect(() => {
    if (!listOpen) return;
    const id = requestAnimationFrame(() => rowRefs.current.get(cur)?.focus());
    return () => cancelAnimationFrame(id);
  }, [listOpen, cur]);

  const bar = (i: number) =>
    curIndex < 0 ? 'bg-border-strong'
      : i < curIndex ? 'bg-ink-muted'
      : i === curIndex ? STATUS_BAR[cur]
      : 'bg-border-strong';
  const text = (i: number) =>
    curIndex < 0 ? 'text-ink-muted'
      : i < curIndex ? 'text-ink-secondary'
      : i === curIndex ? 'font-semibold text-ink'
      : 'text-ink-muted';

  if (readOnly) {
    return (
      <ol aria-label={t.pathLabel} className="flex gap-1">
        {PATH_STATUSES.map((s, i) => (
          <li key={s} aria-current={i === curIndex ? 'step' : undefined} className="flex-1 min-w-0 flex flex-col gap-1.5 pt-1.5 pb-1 px-0.5 text-center">
            <span aria-hidden="true" className={`h-1.5 rounded-full w-full ${bar(i)}`} />
            <span className={`text-[11px] leading-tight break-words ${text(i)}`}>{short(s)}</span>
          </li>
        ))}
      </ol>
    );
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const back = rtl ? 'ArrowRight' : 'ArrowLeft';
    let idx = focusIdx;
    if (e.key === forward) idx = Math.min(PATH_STATUSES.length - 1, focusIdx + 1);
    else if (e.key === back) idx = Math.max(0, focusIdx - 1);
    else if (e.key === 'Home') idx = 0;
    else if (e.key === 'End') idx = PATH_STATUSES.length - 1;
    else return;
    e.preventDefault();
    setFocusIdx(idx);
    stepRefs.current[idx]?.focus();
  }

  function closeList() {
    setListOpen(false);
    triggerRef.current?.focus();
  }

  function pick(s: ContactStatus) {
    closeList();
    if (s !== cur) onChange(s);
  }

  const listRow = (s: ContactStatus) => (
    <button
      key={s}
      ref={(n) => { if (n) rowRefs.current.set(s, n); else rowRefs.current.delete(s); }}
      type="button"
      onClick={() => pick(s)}
      aria-current={s === cur ? 'true' : undefined}
      className={`w-full flex items-center gap-3 min-h-[48px] px-4 rounded-xl text-[15px] text-start transition-colors ${
        s === cur ? 'bg-white/5 text-ink font-semibold' : 'text-ink-secondary hover:bg-white/5'
      }`}
    >
      <span aria-hidden="true" className={`w-2 h-2 rounded-full shrink-0 ${STATUS_BAR[s]}`} />
      <span className="flex-1 min-w-0">{label(s)}</span>
      {s === cur && <Check size={16} aria-hidden="true" className="shrink-0" />}
    </button>
  );

  return (
    <>
      {/* ≥sm: the path itself, then the exits on their own line at the end edge */}
      <div role="toolbar" aria-label={t.pathLabel} onKeyDown={onKeyDown} className="hidden sm:flex gap-1">
        {PATH_STATUSES.map((s, i) => (
          <button
            key={s}
            ref={(n) => { stepRefs.current[i] = n; }}
            type="button"
            tabIndex={i === focusIdx ? 0 : -1}
            onFocus={() => setFocusIdx(i)}
            onClick={() => { if (s !== cur) onChange(s); }}
            aria-current={i === curIndex ? 'step' : undefined}
            className="flex-1 min-w-0 min-h-[44px] flex flex-col gap-1.5 pt-1.5 pb-1 px-0.5 rounded-lg text-center transition-colors hover:bg-white/5"
          >
            <span aria-hidden="true" className={`h-1.5 rounded-full w-full transition-colors ${bar(i)}`} />
            <span className={`text-[11px] leading-tight break-words transition-colors ${text(i)}`}>{short(s)}</span>
          </button>
        ))}
      </div>
      <div className="hidden sm:flex justify-end gap-1">
        {EXIT_STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => { if (s !== cur) onChange(s); }}
            aria-pressed={s === cur}
            className={`inline-flex items-center min-h-[44px] px-2 text-[12px] rounded-lg transition-colors ${
              s === cur ? `font-semibold ${STATUS_TEXT[s]}` : 'text-ink-muted hover:text-ink'
            }`}
          >
            {label(s)}
          </button>
        ))}
      </div>

      {/* <sm: one control that opens the full list */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setListOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={listOpen}
        aria-label={`${t.statusChange}: ${label(cur)}`}
        className="sm:hidden w-full min-h-[44px] flex items-center gap-1 rounded-lg px-1"
      >
        {PATH_STATUSES.map((s, i) => (
          <span key={s} aria-hidden="true" className={`flex-1 h-1.5 rounded-full ${bar(i)}`} />
        ))}
        <span aria-hidden="true" className="text-ink-muted text-[11px] ms-1">▾</span>
      </button>

      {/* Portaled: the drawer panel's backdrop-filter would otherwise be this fixed
          sheet's containing block. The wrapper lifts the sheet's own scrim and panel
          above the drawer (z-60), so the drawer dims behind the list. */}
      {mounted && createPortal(
        <div style={{ position: 'relative', zIndex: 70 }}>
          <Sheet open={listOpen} onClose={closeList}>
            <div className="text-ink">
              <h2 className="font-bold text-[16px] mb-2">{t.statusChange}</h2>
              {PATH_STATUSES.map(listRow)}
              <div className="border-t border-border my-1" />
              {EXIT_STATUSES.map(listRow)}
            </div>
          </Sheet>
        </div>,
        document.body,
      )}
    </>
  );
}
