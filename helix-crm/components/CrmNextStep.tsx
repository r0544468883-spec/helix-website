'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { Bell } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { plural } from '@/lib/i18n';
import { crmSetNextStep, crmUpdateTask } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';
import { addDaysIso, todayInIsrael } from '@/lib/crm-dates';

/** An open task of the contact. `due` is day/month, pre-formatted on the server. */
export type DrawerTask = { id: string; title: string; due_date: string | null; due: string | null; overdue: boolean };

/** The unsaved form, held by the drawer so closing it can ask before discarding. */
export type StepDraft = { title: string; due: string };
export const NO_STEP_DRAFT: StepDraft = { title: '', due: '' };

const input = 'bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';

// The quick picks: days after today's date in Israel. "בעוד שבוע", not "בשבוע הבא",
// which can also mean next Sunday.
const PICKS = [
  { days: 1, key: 'pickTomorrow' },
  { days: 3, key: 'pick3Days' },
  { days: 7, key: 'pickWeek' },
] as const;

/**
 * The person's reminder ("תזכורת"): their earliest-due open task, the same one the
 * home row shows. Until 2026-09-28 it was "הצעד הבא", which said nothing. With none
 * set it is one "+ תזכורת" button, not an empty form. Set with a title and a date or
 * a quick pick, rescheduled and marked done from here, and offered as "מה הלאה?"
 * after a logged call or meeting. None of it is a touch: last touch stays with
 * calls, meetings, notes, WhatsApp and email. See DESIGN.md — Reminder.
 */
export default function CrmNextStep({
  locale,
  contactId,
  tasks,
  readOnly = false,
  draft,
  setDraft,
  onDirtyChange,
  offered = false,
  onOfferDone,
  t,
}: {
  locale: string;
  contactId: string;
  tasks: DrawerTask[];
  /** viewer role: the reminder is shown when there is one; nothing is editable. */
  readOnly?: boolean;
  draft: StepDraft;
  setDraft: (d: StepDraft) => void;
  /** True while the form holds something not yet saved, so closing the drawer asks first. */
  onDirtyChange?: (dirty: boolean) => void;
  /** A call or meeting was just logged and nothing is set: open the form as "מה הלאה?". */
  offered?: boolean;
  /** The offer was answered: saved, or put off with "לא עכשיו". */
  onOfferDone?: () => void;
  t: Dict['crm'];
}) {
  // A reminder marked done leaves at once; it comes back if the save fails.
  const [hidden, setHidden] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  // The form for a new reminder. It starts closed: one "+ תזכורת" button.
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setHidden(null); setEditing(false); setAdding(false); setMsg(null); }, [contactId]);

  const shown = tasks.filter((k) => k.id !== hidden);
  const step = shown[0];
  const more = shown.length - 1;
  const formOpen = editing || (!step && (adding || offered));
  const isOffer = offered && !step && !editing;

  // The title takes focus whenever the form opens: asked for, offered, or editing.
  useEffect(() => { if (formOpen) titleRef.current?.focus(); }, [formOpen]);

  // Opening a reminder to edit fills the form with what is saved; that alone is not
  // unsaved text. Neither is an offered form nobody typed into.
  const dirty = editing && step
    ? draft.title !== step.title || draft.due !== (step.due_date ?? '')
    : draft.title.trim() !== '';
  useEffect(() => { onDirtyChange?.(dirty); }, [dirty, onDirtyChange]);

  if (readOnly && !step) return null;

  function closeForm() {
    setEditing(false);
    setAdding(false);
    setDraft(NO_STEP_DRAFT);
    setMsg(null);
    onOfferDone?.();
  }

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
        setAdding(false);
        onOfferDone?.();
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

  const error = msg && <p role="alert" aria-live="polite" className="text-danger text-[13px] mt-2">{msg}</p>;

  // Nothing set and nothing asked for: one button, with no heading and no empty form.
  if (!step && !formOpen) {
    return (
      <section className="mb-6" aria-label={t.nextStep}>
        <button
          type="button"
          onClick={() => { setMsg(null); setAdding(true); }}
          className="border border-brand/40 bg-brand/5 hover:bg-brand/10 text-brand-ink font-semibold px-3 rounded-[10px] text-[13px] min-h-[44px]"
        >
          {t.nextStepAdd}
        </button>
        {error}
      </section>
    );
  }

  const today = todayInIsrael();
  const form = (
    <div className="flex flex-col gap-2">
      <input
        ref={titleRef}
        value={draft.title}
        onChange={(e) => setDraft({ ...draft, title: e.target.value })}
        onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
        placeholder={t.nextStepPlaceholder}
        aria-label={t.nextStep}
        dir="auto"
        className={`w-full ${input}`}
      />
      <div role="group" aria-label={t.nextStepWhen} className="flex flex-wrap items-center gap-2">
        {PICKS.map(({ days, key }) => {
          const date = addDaysIso(today, days);
          // Derived, not stored: typing another date in the field unmarks the pick.
          const on = draft.due === date;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => setDraft({ ...draft, due: on ? '' : date })}
              className={`text-[13px] rounded-full px-3 min-h-[44px] border transition-colors ${
                on ? 'border-brand text-brand-ink bg-brand/10' : 'border-border text-ink-secondary hover:text-ink'
              }`}
            >
              {t[key]}
            </button>
          );
        })}
        <input
          type="date"
          value={draft.due}
          onChange={(e) => setDraft({ ...draft, due: e.target.value })}
          aria-label={t.nextStepDue}
          title={t.nextStepDue}
          dir="ltr"
          className={input}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={save}
          disabled={!draft.title.trim() || isPending}
          className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-4 rounded-[10px] text-[14px] min-h-[44px]"
        >
          {t.save}
        </button>
        <button
          type="button"
          onClick={closeForm}
          className="text-ink-secondary hover:text-ink px-3 text-[14px] min-h-[44px]"
        >
          {isOffer ? t.nextStepNotNow : t.cancel}
        </button>
      </div>
    </div>
  );

  return (
    <section className="mb-6" aria-label={t.nextStep}>
      <h3 className="font-bold text-[14px] mb-2">{isOffer ? t.nextStepOffer : t.nextStep}</h3>
      {step && !editing ? (
        <div className="flex items-center gap-2 bg-bg border border-border rounded-xl ps-3 pe-1.5 py-1.5 min-h-[44px]">
          <Bell size={14} aria-hidden="true" className="text-ink-muted shrink-0" />
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
      {error}
    </section>
  );
}
