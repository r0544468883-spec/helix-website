'use client';

import { useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Circle, CheckCircle2 } from 'lucide-react';
import type { Dict } from '@/lib/i18n/he';
import { crmUpdateTask } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';

export type TaskRow = {
  id: string;
  title: string;
  /** "30/9", formatted on the server; null for a reminder with no date. */
  due: string | null;
  contactId: string | null;
  contactName: string | null;
};
export type TaskGroupKey = 'overdue' | 'today' | 'later' | 'none';
export type TaskGroup = { key: TaskGroupKey; rows: TaskRow[] };

/** The id the screen's h1 carries, so focus has somewhere to go when no row is left. */
export const TASKS_TITLE_ID = 'crm-tasks-title';

/**
 * Every open reminder in the workspace, in the four groups the server made
 * (overdue, today, later, no date) on Israel's calendar. A writer marks one done
 * from its row, with the same effect as in the drawer: crmUpdateTask writes the
 * "בוצע" timeline entry and leaves the person's last touch alone. The row leaves at
 * once; a completion that is not stored puts it back with the reason. See
 * DESIGN.md — Reminders list.
 */
export default function CrmTaskList({
  groups,
  readOnly = false,
  locale,
  t,
}: {
  groups: TaskGroup[];
  readOnly?: boolean;
  locale: string;
  t: Dict['crm'];
}) {
  const router = useRouter();
  const pathname = usePathname() || `/${locale}/dashboard/crm/tasks`;
  const [, startTransition] = useTransition();
  // Rows hidden at once on press: in flight, or done and waiting for the server's
  // list to drop them. A failed one comes back out of this set.
  const [hidden, setHidden] = useState<Set<string>>(() => new Set());
  const [failed, setFailed] = useState<{ id: string; text: string } | null>(null);
  const inFlight = useRef<Set<string>>(new Set());

  const visible = groups
    .map((g) => ({ ...g, rows: g.rows.filter((r) => !hidden.has(r.id)) }))
    .filter((g) => g.rows.length > 0);

  const groupName: Record<TaskGroupKey, string> = {
    overdue: t.tkOverdue, today: t.tkToday, later: t.tkLater, none: t.tkNoDate,
  };

  function moveFocusFrom(id: string) {
    const all = Array.from(document.querySelectorAll<HTMLElement>('[data-task-done]'));
    const i = all.findIndex((el) => el.dataset.taskDone === id);
    const next = all.slice(i + 1).find((el) => el.dataset.taskDone !== id) ?? all.slice(0, Math.max(0, i)).reverse()[0];
    requestAnimationFrame(() => {
      if (next && next.isConnected) next.focus();
      else document.getElementById(TASKS_TITLE_ID)?.focus();
    });
  }

  function done(row: TaskRow) {
    if (inFlight.current.has(row.id)) return;
    inFlight.current.add(row.id);
    setFailed(null);
    moveFocusFrom(row.id);
    setHidden((h) => new Set(h).add(row.id));
    startTransition(async () => {
      const res = await withTimeout(crmUpdateTask({ locale, id: row.id, done: true }));
      inFlight.current.delete(row.id);
      if (res && 'ok' in res && res.ok) return;   // the action revalidates this screen
      // Already done in another tab: it is gone either way, and the server wrote one
      // "בוצע" entry for it, not two. A refresh drops it from the list for good.
      if (res && 'error' in res && res.error === 'notfound') { router.refresh(); return; }
      setHidden((h) => { const n = new Set(h); n.delete(row.id); return n; });
      setFailed({ id: row.id, text: res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.tkDoneFailed, t) });
    });
  }

  if (visible.length === 0) {
    return <p className="text-ink-muted text-[15px]">{t.tkEmpty}</p>;
  }

  // One DOM for both widths, like the contacts table: from md the row is columns
  // under the head; below it the person and the date sit on a labelled line under
  // the title. `md:contents` lifts the inner cells into the row's grid.
  const cols = readOnly
    ? 'grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_minmax(0,220px)_88px]'
    : 'grid-cols-[44px_minmax(0,1fr)] md:grid-cols-[44px_minmax(0,1fr)_minmax(0,220px)_88px]';

  return (
    <div>
      <div aria-hidden="true" className={`hidden md:grid ${cols} gap-x-3 px-2 pb-2 border border-transparent text-[12px] font-semibold text-ink-muted`}>
        {!readOnly && <span />}
        <span>{t.nextStep}</span>
        <span>{t.colContact}</span>
        <span>{t.tkColDue}</span>
      </div>
      {visible.map((g) => (
        <section key={g.key} aria-labelledby={`tk-${g.key}`} className="mb-6 last:mb-0">
          <h2 id={`tk-${g.key}`} className="font-bold text-[15px] mb-2">
            {t.tkGroup.replace('{name}', groupName[g.key]).replace('{n}', String(g.rows.length))}
          </h2>
          <ul className="flex flex-col gap-2">
            {g.rows.map((r) => (
              <li key={r.id} className={`grid ${cols} gap-x-3 gap-y-1 items-center bg-surface border border-border rounded-xl p-2 min-h-[44px]`}>
                {!readOnly && (
                  <button
                    type="button"
                    data-task-done={r.id}
                    onClick={() => done(r)}
                    aria-label={t.tkDone.replace('{title}', r.title)}
                    className="group inline-flex items-center justify-center w-11 h-11 rounded-full text-ink-muted hover:text-brand-ink transition-colors"
                  >
                    <Circle size={20} aria-hidden="true" className="group-hover:hidden" />
                    <CheckCircle2 size={20} aria-hidden="true" className="hidden group-hover:block" />
                  </button>
                )}
                <div className="min-w-0 md:contents">
                  <p className="text-[14px] font-semibold text-ink truncate" dir="auto">{r.title}</p>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] md:contents">
                    <span className="min-w-0 truncate">
                      <span className="text-ink-muted md:sr-only">{t.colContact}: </span>
                      {r.contactId && r.contactName ? (
                        <Link
                          href={`${pathname}?c=${r.contactId}`}
                          scroll={false}
                          data-contact-row={r.contactId}
                          className="text-ink-secondary hover:text-ink hover:underline"
                          dir="auto"
                        >
                          {r.contactName}
                        </Link>
                      ) : (
                        <span className="text-ink-muted">{t.dealNoContact}</span>
                      )}
                    </span>
                    {r.due && (
                      <span className="whitespace-nowrap text-ink-secondary">
                        <span className="text-ink-muted md:sr-only">{t.tkColDue}: </span>
                        <span className="font-mono">{r.due}</span>
                      </span>
                    )}
                  </div>
                </div>
                {failed?.id === r.id && (
                  <p role="alert" className="col-span-full text-danger text-[13px] px-1">{failed.text}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
