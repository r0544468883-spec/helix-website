'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { crmSetActiveWorkspace } from '@/app/crm-actions';
import { getDict } from '@/lib/i18n';
import type { AccessibleWorkspace } from '@/lib/crm-workspace';

type Props = {
  locale: string;
  workspaces: AccessibleWorkspace[];
  activeId: string;
};

/**
 * Moves an agency admin between their own workspace and the clients' ones. It
 * appears only when there is a choice: with one workspace it was a menu of one row
 * that also hid the page title (Eran, 2026-09-28). It lists and switches, nothing
 * else: adding a client lives on the Team screen (CrmClientWorkspaces).
 * See DESIGN.md — Dropdown / menu.
 */
export default function CrmWorkspaceSwitcher({ locale, workspaces, activeId }: Props) {
  const t = getDict(locale).crm;
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, start] = useTransition();

  if (workspaces.length < 2) return null;

  const active = workspaces.find((w) => w.id === activeId);
  const own = workspaces.filter((w) => !w.isClient);
  const clients = workspaces.filter((w) => w.isClient);

  function switchTo(id: string) {
    if (id === activeId) { setOpen(false); return; }
    setFailed(false);
    start(async () => {
      const res = await crmSetActiveWorkspace(id);
      if (!res.ok) { setFailed(true); return; }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        aria-expanded={open}
        className="flex items-center gap-2 border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 min-h-[44px] rounded-[10px] transition-colors disabled:opacity-50"
      >
        <span aria-hidden="true" className="w-2 h-2 rounded-full bg-brand" />
        <span className="max-w-[140px] truncate" dir="auto">{active?.name ?? t.wsFallback}</span>
        <span aria-hidden="true" className="text-ink-muted text-[11px]">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 end-0 w-64 max-w-[calc(100vw-40px)] bg-surface border border-border rounded-xl shadow-xl p-1.5 max-h-[70vh] overflow-auto">
            {own.length > 0 && (
              <>
                <div className="text-[11px] text-ink-muted px-3 py-1.5">{t.wsMine}</div>
                {own.map((w) => (
                  <WsRow key={w.id} w={w} active={w.id === activeId} tag={t.wsClientTag} onClick={() => switchTo(w.id)} />
                ))}
              </>
            )}
            {clients.length > 0 && (
              <>
                <div className="text-[11px] text-ink-muted px-3 py-1.5 mt-1">{t.wsClients}</div>
                {clients.map((w) => (
                  <WsRow key={w.id} w={w} active={w.id === activeId} tag={t.wsClientTag} onClick={() => switchTo(w.id)} />
                ))}
              </>
            )}
            {failed && <p role="alert" className="text-danger text-[13px] px-3 py-2">{t.clientSwitchFailed}</p>}
          </div>
        </>
      )}
    </div>
  );
}

function WsRow({ w, active, tag, onClick }: { w: AccessibleWorkspace; active: boolean; tag: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`w-full flex items-center gap-2 text-start px-3 py-2 min-h-[44px] rounded-lg text-[14px] transition-colors ${active ? 'bg-brand/10 text-brand-ink font-semibold' : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'}`}
    >
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-brand' : 'bg-ink-muted/40'}`} />
      <span className="truncate flex-1" dir="auto">{w.name}</span>
      {w.isClient && <span className="text-[10px] text-ink-muted border border-border rounded px-1">{tag}</span>}
    </button>
  );
}
