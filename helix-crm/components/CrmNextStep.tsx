'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { ListChecks } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { plural } from '@/lib/i18n';
import { crmSetNextStep, crmUpdateTask } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';

/** An open task of the contact. `due` is day/month, pre-formatted on the server. */
export type DrawerTask = { id: string; title: string; due_date: string | null; due: string | null; overdue: boolean };

/** The unsaved form, held by the drawer so closing it can ask before discarding. */
export type StepDraft = { title: string; due: string };
export const NO_STEP_DRAFT: StepDraft = { title: '', due: '' };

const input = 'bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';

/**
 * The person's next step: their earliest-due open task, the same one the home row
 * shows. Set, rescheduled and marked done from here. None of it is a touch: last
 * touch stays with calls, meetings, notes, WhatsApp and email. See DESIGN.md — Next
 * step.
 */
export default function CrmNextStep({
  locale,
  contactId,
  tasks,
  readOnly = false,
  draft,
  setDraft,
  onDirtyChange,
  t,
}: {
  locale: string;
  contactId: string;
  tasks: DrawerTask[];
  /** viewer role: the step is shown when there is one; nothing is editable. */
  readOnly?: boolean;
  draft: StepDraft;
  setDraft: (d: StepDraft) => void;
  /** True while the form holds something not yet saved, so closing the drawer asks first. */
  onDirtyChange?: (dirty: boolean) => void;
  t: Dict['crm'];
}) {
  // A step marked done leaves at once; it comes back if the save fails.
  const [hidden, setHidden] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);

  useEffect(() => { setHidden(null); setEditing(false); setMsg(null); }, [contactId]);

  const shown = tasks.filter((k) => k.id !== hidden);
  const step = shown[0];
  const more = shown.length - 1;

  // Opening a step to edit fills the form with what is saved; that alone is not
  // unsaved text.
  const dirty = editing && step
    ? draft.title !== step.title || draft.due !== (step.due_date ?? '')
    : draft.title.trim() !== '';
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);

  if (readOnly && !step) return null;

  function save() {
    const title = draft.title.trim();
    if (!title || inFlight.current) return;
    inFlight.current = true;
    setMsg(null);
    const editingId = editing && step ? step.id : null;
    startTransition(async () => {
      const res = await withTimeout(editingId
        ? crmUpdateTask({ locale, id: editingId, title, due_date: draft.due || null })
        : crmSetNextStep({ locale, contact_id: contactId, title, due_date: draft.due || null }));
      inFlight.current = false;
      if (res && 'ok' in res && res.ok) {
        setDraft(NO_STEP_DRAFT);
        setEditing(false);
        return;
      }
      setMsg(res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.nextStepFailed, t));
    });
  }

  function done() {
    if (!step || inFlight.current) return;
    const id = step.id;
    inFlight.current = true;
    setMsg(null);
    setHidden(id);
    startTransition(async () => {
      const res = await withTimeout(crmUpdateTask({ locale, id, done: true }));
      inFlight.current = false;
      if (!res || !('ok' in res) || !res.ok) {
        setHidden(null);
        setMsg(failureText(res, t.nextStepDoneFailed, t));
      }
    });
  }

  function startEdit() {
    if (!step) return;
    setDraft({ title: step.title, due: step.due_date ?? '' });
    setEditing(true);
    setMsg(null);
  }

  const form = (
    <div className="flex flex-wrap gap-2">
      <input
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
        placeholder={t.nextStepPlaceholder}
        aria-label={t.nextStep}
        dir="auto"
        className={`flex-1 min-w-[160px] ${input}`}
      />
      <input
        type="date"
        value={draft.due}
        onChange={(e) => setDraft({ ...draft, due: e.target.value })}
        aria-label={t.nextStepDue}
        title={t.nextStepDue}
        dir="ltr"
        className={input}
      />
      <button
        type="button"
        onClick={save}
        disabled={!draft.title.trim() || isPending}
        className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-4 rounded-[10px] text-[14px] min-h-[44px]"
      >
        {t.save}
      </button>
      {editing && (
        <button
          type="button"
          onClick={() => { setEditing(false); setDraft(NO_STEP_DRAFT); setMsg(null); }}
          className="text-ink-secondary hover:text-ink px-3 text-[14px] min-h-[44px]"
        >
          {t.cancel}
        </button>
      )}
    </div>
  );

  return (
    <section className="mb-6" aria-label={t.nextStep}>
      <h3 className="font-bold text-[14px] mb-2">{t.nextStep}</h3>
      {step && !editing ? (
        <div className="flex items-center gap-2 bg-bg border border-border rounded-xl ps-3 pe-1.5 py-1.5 min-h-[44px]">
          <ListChecks size={14} aria-hidden="true" className="text-ink-muted shrink-0" />
          <span className="text-[14px] text-ink truncate flex-1 min-w-0" dir="auto">{step.title}</span>
          {step.due && (
            <span className={`text-[12px] shrink-0 whitespace-nowrap ${step.overdue ? 'text-ink font-semibold' : 'text-ink-muted'}`}>
              {step.overdue ? `${t.taskOverdue} · ` : ''}{t.taskDue.replace('{date}', step.due)}
            </span>
          )}
          {!readOnly && (
            <>
              <button type="button" onClick={startEdit} className="text-ink-secondary hover:text-ink px-2 text-[13px] min-h-[44px] shrink-0">
                {t.nextStepEdit}
              </button>
              <button
                type="button"
                onClick={done}
                className="border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px] shrink-0"
              >
                {t.nextStepDone}
              </button>
            </>
          )}
        </div>
      ) : (
        !readOnly && form
      )}
      {more > 0 && !editing && (
        <p className="text-[12px] text-ink-muted mt-1">
          {plural(locale, more, { one: t.moreTasksOne, two: t.moreTasksTwo, other: t.moreTasksOther })}
        </p>
      )}
      {msg && <p role="alert" aria-live="polite" className="text-danger text-[13px] mt-2">{msg}</p>}
    </section>
  );
}
