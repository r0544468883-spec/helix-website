'use client';

import type { ReactNode } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { DECLINE_REASONS, statusKey } from '@/lib/crm-status';
import type { StatusControl } from '@/lib/use-status-change';

/** A question's chips, off and on: the same pair as the needs-touch filter. */
export function feedbackChip(on: boolean): string {
  return `text-[13px] rounded-full px-3 min-h-[44px] border transition-colors ${
    on ? 'border-brand text-brand-ink bg-brand/10' : 'border-border text-ink-secondary hover:text-ink'
  }`;
}

/**
 * The line under the status path: the undo, a failure, and the one optional
 * question an exit asks. `children` is for the caller's own follow-ups (the
 * drawer's deal prompts). Always mounted, so a screen reader hears it change;
 * empty, and without margin, when there is nothing to say. See DESIGN.md —
 * Header feedback line.
 */
export default function CrmStatusFeedback({
  status,
  t,
  children,
}: {
  status: StatusControl;
  t: Dict['crm'];
  children?: ReactNode;
}) {
  const { undoable, error, question } = status;
  return (
    <div role="status" aria-live="polite" className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 empty:mt-0 text-[13px] text-ink-secondary">
      {undoable && (
        <>
          <span>{t.statusMovedTo.replace('{status}', t[statusKey(undoable.next)])}</span>
          <button type="button" onClick={status.undo} className="font-semibold text-ink hover:underline min-h-[44px] px-2">
            {t.undo}
          </button>
        </>
      )}
      {error && <span className="text-danger">{error}</span>}

      {question?.kind === 'decline' && (
        <div className="basis-full flex flex-wrap items-center gap-2">
          <span>{t.declineAsk}</span>
          {DECLINE_REASONS.map((r) => (
            <button key={r} type="button" onClick={() => status.pickReason(r)} aria-pressed={question.picked === r} className={feedbackChip(question.picked === r)}>
              {t[`reason_${r}`]}
            </button>
          ))}
          {question.err && <span className="text-danger">{question.err}</span>}
        </div>
      )}

      {question?.kind === 'freeze' && (
        <div className="basis-full flex flex-wrap items-center gap-2">
          <span>{t.freezeAsk}</span>
          <button type="button" onClick={() => status.pickReturn('1m')} aria-pressed={question.picked === '1m'} className={feedbackChip(question.picked === '1m')}>{t.freeze1m}</button>
          <button type="button" onClick={() => status.pickReturn('3m')} aria-pressed={question.picked === '3m'} className={feedbackChip(question.picked === '3m')}>{t.freeze3m}</button>
          <button type="button" onClick={() => status.pickReturn('date')} aria-pressed={question.picked === 'date'} className={feedbackChip(question.picked === 'date')}>{t.freezeDate}</button>
          {question.picked === 'date' && !question.saved && (
            <input
              type="date"
              dir="ltr"
              aria-label={t.freezeDate}
              onChange={(e) => { if (e.target.value) status.pickReturn('date', e.target.value); }}
              className="bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]"
            />
          )}
          {question.err && <span className="text-danger">{question.err}</span>}
        </div>
      )}

      {children}
    </div>
  );
}
