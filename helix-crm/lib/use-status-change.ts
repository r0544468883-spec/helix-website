'use client';

import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmUpdateContact, crmUndoStatus, crmSetStatusReason, crmSetNextStep, crmUpdateTask } from '@/app/crm-actions';
import { isContactStatus, statusKey, type ContactStatus, type DeclineReason } from '@/lib/crm-status';

// A server action has no timeout of its own. Without one, a dropped connection
// leaves the path showing a status that was never stored.
const SAVE_TIMEOUT_MS = 15_000;
const UNDO_MS = 8_000;

type ActionResult = { ok?: boolean; error?: string; message?: string } | undefined | null;

/** Resolves to `{ error: 'timeout' }` if the action has not answered in 15 seconds. */
export function withTimeout<T>(p: Promise<T>, ms = SAVE_TIMEOUT_MS): Promise<T | { error: 'timeout' }> {
  return Promise.race([p, new Promise<{ error: 'timeout' }>((r) => setTimeout(() => r({ error: 'timeout' }), ms))]);
}

/** The sentence for a failed action: an expired session is named as one. */
export function failureText(res: ActionResult, fallback: string, t: Dict['crm']): string {
  if (res && res.error === 'auth') return t.sessionExpired;
  if (res && res.message) return res.message;
  return fallback;
}

export type StatusChanged = { previous: ContactStatus; next: ContactStatus; activityId: string | null };

/** The one optional question a stored exit asks: why they declined, or when to come back. */
export type ExitQuestion =
  | { kind: 'decline'; activityId: string; picked: DeclineReason | null; err: string | null }
  | { kind: 'freeze'; picked: '1m' | '3m' | 'date' | null; saved: boolean; taskId: string | null; err: string | null };

/**
 * One status control's state, shared by the drawer and the full contact page.
 * The change shows at once (never dimmed while saving), reverts with a message
 * when it is not stored, and can be undone for 8 seconds. Leaving the path asks
 * one optional question. `onChanged` runs after a change is stored, which is
 * where the drawer adds its deal prompts. See DESIGN.md — Header feedback line.
 */
export function useStatusChange({
  locale, contactId, contactName, initial, t, onChanged, onUndone,
}: {
  locale: string;
  contactId: string | null;
  contactName: string;
  initial: string;
  t: Dict['crm'];
  onChanged?: (c: StatusChanged) => void;
  onUndone?: () => void;
}) {
  const [status, setStatus] = useState<ContactStatus>(isContactStatus(initial) ? initial : 'new');
  const [undoable, setUndoable] = useState<StatusChanged | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [question, setQuestion] = useState<ExitQuestion | null>(null);
  const [, startTransition] = useTransition();
  const timer = useRef<number | null>(null);
  const questionBusy = useRef(false);
  // The newest status the user chose. A slow failure of an older change must not
  // overwrite a newer choice.
  const latest = useRef<ContactStatus>(status);
  // Saves still in flight. While there are any, the page's refreshed data can be one
  // change behind what is on screen, so it waits for the saves to answer.
  const pending = useRef(0);
  const lastContact = useRef(contactId);

  const clearUndo = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    setUndoable(null);
  }, []);

  /** Everything the feedback line holds: the drawer calls this when it closes. */
  const clearFeedback = useCallback(() => {
    clearUndo();
    setError(null);
    setQuestion(null);
  }, [clearUndo]);

  // A different person, or fresher data for this one after a revalidation.
  useEffect(() => {
    const s = isContactStatus(initial) ? initial : 'new';
    const switched = lastContact.current !== contactId;
    lastContact.current = contactId;
    if (!switched && pending.current > 0) return;
    latest.current = s;
    setStatus(s);
  }, [initial, contactId]);

  // The feedback belongs to one person; switching ends it.
  useEffect(() => { clearFeedback(); }, [contactId, clearFeedback]);

  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);

  const label = (s: ContactStatus) => t[statusKey(s)];

  function change(next: ContactStatus) {
    if (!contactId || next === latest.current) return;
    const previous = latest.current;
    latest.current = next;
    setStatus(next);
    clearFeedback();
    pending.current++;
    startTransition(async () => {
      const res = await withTimeout(crmUpdateContact({ locale, id: contactId, status: next }));
      pending.current--;
      if (!res || !('ok' in res) || !res.ok) {
        if (latest.current === next) { latest.current = previous; setStatus(previous); }
        setError(failureText(res as ActionResult, t.statusFailed, t));
        return;
      }
      if (latest.current !== next) return;  // a newer choice owns the line now
      const done: StatusChanged = { previous: res.previous, next, activityId: res.activityId };
      setUndoable(done);
      timer.current = window.setTimeout(() => setUndoable(null), UNDO_MS);
      // A reason needs the change's own row to attach to.
      if (next === 'declined' && done.activityId) {
        setQuestion({ kind: 'decline', activityId: done.activityId, picked: null, err: null });
      } else if (next === 'frozen') {
        setQuestion({ kind: 'freeze', picked: null, saved: false, taskId: null, err: null });
      }
      onChanged?.(done);
    });
  }

  function undo() {
    if (!contactId || !undoable) return;
    const { previous, next, activityId } = undoable;
    clearFeedback();
    latest.current = previous;
    setStatus(previous);
    onUndone?.();
    pending.current++;
    startTransition(async () => {
      const res = await withTimeout(crmUndoStatus({ locale, contact_id: contactId, activity_id: activityId, previous }));
      pending.current--;
      if (!res || !('ok' in res) || !res.ok) {
        if (latest.current === previous) { latest.current = next; setStatus(next); }
        setError(failureText(res as ActionResult, t.undoFailed.replace('{status}', label(next)), t));
      }
    });
  }

  /** A decline reason goes onto the change's own timeline row; a second pick replaces it. */
  function pickReason(reason: DeclineReason) {
    if (question?.kind !== 'decline' || questionBusy.current) return;
    const { activityId, picked: before } = question;
    questionBusy.current = true;
    setQuestion({ ...question, picked: reason, err: null });
    startTransition(async () => {
      const res = await withTimeout(crmSetStatusReason({ locale, activity_id: activityId, reason }));
      questionBusy.current = false;
      if (!res || !('ok' in res) || !res.ok) {
        const err = failureText(res as ActionResult, t.reasonFailed, t);
        setQuestion((q) => (q?.kind === 'decline' ? { ...q, picked: before, err } : q));
      }
    });
  }

  /**
   * "When to come back" becomes the contact's next step, dated on the server from
   * the Israeli date. A second pick moves that same step instead of adding another.
   */
  function pickReturn(choice: '1m' | '3m' | 'date', date?: string) {
    if (!contactId || question?.kind !== 'freeze' || questionBusy.current) return;
    if (choice === 'date' && !date) { setQuestion({ ...question, picked: 'date', saved: false, err: null }); return; }
    const before = question;
    const when = choice === 'date' ? { due_date: date } : { due_in: choice };
    questionBusy.current = true;
    setQuestion({ ...question, picked: choice, saved: false, err: null });
    startTransition(async () => {
      let taskId = before.taskId;
      let res;
      if (taskId) {
        res = await withTimeout(crmUpdateTask({ locale, id: taskId, ...when }));
      } else {
        res = await withTimeout(crmSetNextStep({
          locale, contact_id: contactId, title: t.freezeTaskTitle.replace('{name}', contactName), ...when,
        }));
        if (res && 'ok' in res && res.ok && 'id' in res) taskId = res.id;
      }
      questionBusy.current = false;
      if (!res || !('ok' in res) || !res.ok) {
        const err = failureText(res as ActionResult, t.freezeFailed, t);
        setQuestion((q) => (q?.kind === 'freeze' ? { ...before, err } : q));
        return;
      }
      setQuestion((q) => (q?.kind === 'freeze' ? { ...q, saved: true, taskId } : q));
    });
  }

  return { status, change, undo, undoable, error, question, pickReason, pickReturn, clearFeedback };
}

export type StatusControl = ReturnType<typeof useStatusChange>;
