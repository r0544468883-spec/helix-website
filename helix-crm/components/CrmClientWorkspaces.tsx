'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import type { Dict } from '@/lib/i18n/he';
import { crmCreateClientWorkspace, crmSetActiveWorkspace } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';

const NAME_MAX = 80;
const input = 'bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';

/**
 * The Team screen's client workspaces: the agency's clients, a switch to each, and
 * a form to add one. Only an admin of a workspace that is not itself a client sees
 * it; crmCreateClientWorkspace refuses everyone else too. It replaced the switcher's
 * browser prompt (2026-09-28). See DESIGN.md §9 — Team screen, client workspaces.
 */
export default function CrmClientWorkspaces({
  locale,
  clients,
  t,
}: {
  locale: string;
  clients: { id: string; name: string }[];
  t: Dict['crm'];
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  // isPending flips a render late, so a double press could create two clients.
  const inFlight = useRef(false);

  function add() {
    const n = name.trim();
    if (!n || inFlight.current) return;
    if (Array.from(n).length > NAME_MAX) { setMsg({ kind: 'err', text: t.errClientNameLong }); return; }
    inFlight.current = true;
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmCreateClientWorkspace({ locale, name: n }));
      inFlight.current = false;
      if (res && 'ok' in res && res.ok) {
        setName('');
        setMsg({ kind: 'ok', text: t.clientAdded.replace('{name}', n) });
        router.refresh();
        return;
      }
      setMsg({
        kind: 'err',
        text: res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.errClientFailed, t),
      });
    });
  }

  function switchTo(id: string) {
    startTransition(async () => {
      const res = await withTimeout(crmSetActiveWorkspace(id));
      if (res && 'ok' in res && res.ok) {
        router.push(`/${locale}/dashboard/crm`);
        router.refresh();
        return;
      }
      setMsg({ kind: 'err', text: t.clientSwitchFailed });
    });
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <h2 className="font-bold text-[16px] mb-1">{t.clientsTitle}</h2>
      <p className="text-ink-secondary text-[14px] mb-4">{t.clientsIntro}</p>

      {clients.length === 0 ? (
        <p className="text-ink-muted text-[14px] mb-4">{t.clientsNone}</p>
      ) : (
        <ul className="flex flex-col gap-2 mb-4">
          {clients.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between gap-2 bg-bg border border-border rounded-xl ps-3 pe-1.5 py-1.5 min-h-[44px]"
            >
              <span className="text-[14px] truncate min-w-0" dir="auto">{w.name}</span>
              <button
                type="button"
                onClick={() => switchTo(w.id)}
                disabled={isPending}
                className="border border-brand text-brand-ink hover:bg-brand hover:text-on-brand font-semibold px-3 rounded-[10px] transition-colors text-[13px] min-h-[44px] shrink-0 disabled:opacity-50"
              >
                {t.clientSwitch}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') add(); }}
          placeholder={t.clientName}
          aria-label={t.clientName}
          dir="auto"
          className={`flex-1 min-w-[180px] ${input}`}
        />
        <button
          type="button"
          onClick={add}
          disabled={!name.trim() || isPending}
          className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-4 rounded-[10px] text-[14px] min-h-[44px]"
        >
          {t.clientAdd}
        </button>
      </div>
      {msg && (
        <p
          role={msg.kind === 'err' ? 'alert' : 'status'}
          aria-live="polite"
          className={`text-[13px] mt-2 ${msg.kind === 'err' ? 'text-danger' : 'text-ink-secondary'}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
