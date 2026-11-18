'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { Check, Circle, AlertCircle } from 'lucide-react';
import { crmUpdateTask } from '@/app/crm-actions';

export type TaskRow = {
  id: string;
  title: string;
  dueLabel: string;
  overdue: boolean;
  priority: 'low' | 'medium' | 'high';
  contactId: string | null;
  contactName: string | null;
};

type Strings = {
  done: string; priorityHigh: string; noDue: string; markDone: string; openContact: string;
};

/** Work-queue of open tasks. Checking one marks it done (crmUpdateTask) and drops it. */
export default function CrmTaskList({
  locale, base, tasks, canWrite, s,
}: {
  locale: string; base: string; tasks: TaskRow[]; canWrite: boolean; s: Strings;
}) {
  const [rows, setRows] = useState(tasks);
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<string | null>(null);

  function markDone(id: string) {
    if (!canWrite) return;
    setBusy(id);
    start(async () => {
      const res = await crmUpdateTask({ locale, id, done: true });
      if (res && 'ok' in res && res.ok) setRows((r) => r.filter((t) => t.id !== id));
      setBusy(null);
    });
  }

  return (
    <div role="list" className="flex flex-col gap-2">
      {rows.map((task) => (
        <div
          key={task.id}
          role="listitem"
          className="relative grid grid-cols-[auto_minmax(0,1fr)_auto] gap-x-3 items-center bg-surface border border-border rounded-xl p-3 min-h-[44px] hover:border-brand transition-colors"
        >
          <button
            type="button"
            onClick={() => markDone(task.id)}
            disabled={!canWrite || (pending && busy === task.id)}
            aria-label={s.markDone}
            className="shrink-0 text-ink-muted hover:text-brand disabled:opacity-40 transition-colors"
          >
            {pending && busy === task.id ? <Check size={20} className="text-brand" /> : <Circle size={20} />}
          </button>

          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-ink truncate" dir="auto">{task.title}</p>
            {task.contactName && task.contactId && (
              <Link
                href={`${base}/crm?c=${task.contactId}`}
                scroll={false}
                className="text-[13px] text-ink-secondary hover:text-brand transition-colors relative z-10"
              >
                {task.contactName}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {task.priority === 'high' && (
              <span className="inline-flex items-center gap-1 text-[11px] text-danger" title={s.priorityHigh}>
                <AlertCircle size={13} /> {s.priorityHigh}
              </span>
            )}
            <span className={`text-[13px] whitespace-nowrap ${task.overdue ? 'text-danger font-semibold' : 'text-ink-muted'}`}>
              {task.dueLabel || s.noDue}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
