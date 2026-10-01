'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Dict } from '@/lib/i18n/he';
import { crmCreateWorkspace } from '@/app/crm-actions';
import { withTimeout } from '@/lib/use-status-change';

const NAME_MAX = 80;

/**
 * A workspace of your own: a name, then "יצירת workspace". On the new-workspace
 * page and on the CRM home of someone with no workspace. The new one opens at once,
 * empty, with its creator as admin. See DESIGN.md §8 — New workspace form.
 */
export default function CrmNewWorkspaceForm({ locale, t }: { locale: string; t: Dict['crm'] }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inFlight = useRef(false);

  function create(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) { setErr(t.errWorkspaceNameRequired); return; }
    if (Array.from(trimmed).length > NAME_MAX) { setErr(t.errWorkspaceNameLong); return; }
    // A double press must not create two.
    if (inFlight.current) return;
    inFlight.current = true;
    setErr(null);
    startTransition(async () => {
      const res = await withTimeout(crmCreateWorkspace({ locale, name: trimmed }));
      if (res && 'ok' in res && res.ok) {
        router.push(`/${locale}/dashboard/crm`);
        router.refresh();
        return;
      }
      inFlight.current = false;
      if (res && 'error' in res && res.error === 'timeout') { setErr(t.wsCreateTimeout); return; }
      if (res && 'error' in res && res.error === 'auth') { setErr(t.sessionExpired); return; }
      setErr(res && 'message' in res && res.message ? res.message : t.errWorkspaceCreateFailed);
    });
  }

  return (
    <form onSubmit={create} className="flex flex-col gap-3">
      <label className="block text-[12px] text-ink-muted">
        {t.wsNameLabel}
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.wsNamePlaceholder}
          dir="auto"
          className="mt-1 w-full bg-bg border border-border rounded-[10px] px-3 py-2 text-[15px] text-ink outline-none focus:border-brand min-h-[44px]"
        />
      </label>
      <button
        type="submit"
        disabled={isPending}
        className="self-start bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-5 py-2.5 rounded-[10px] min-h-[44px]"
      >
        {isPending ? t.wsCreating : t.wsCreate}
      </button>
      {err && <p role="alert" className="text-danger text-[13px]">{err}</p>}
    </form>
  );
}
