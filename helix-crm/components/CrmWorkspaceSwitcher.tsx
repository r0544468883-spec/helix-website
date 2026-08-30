'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { crmSetActiveWorkspace, crmCreateClientWorkspace } from '@/app/crm-actions';
import type { AccessibleWorkspace } from '@/lib/crm-workspace';

type Props = {
  locale: string;
  workspaces: AccessibleWorkspace[];
  activeId: string;
  canManage: boolean; // admin/agency_admin → may add client workspaces
};

/**
 * Agency workspace switcher. Lets an agency admin flip between their own workspace
 * and any client workspace they manage, and spin up a new client. A solo user with a
 * single workspace and no manage rights sees nothing (renders null).
 */
export default function CrmWorkspaceSwitcher({ locale, workspaces, activeId, canManage }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  if (workspaces.length <= 1 && !canManage) return null;

  const active = workspaces.find((w) => w.id === activeId);
  const own = workspaces.filter((w) => !w.isClient);
  const clients = workspaces.filter((w) => w.isClient);

  function switchTo(id: string) {
    if (id === activeId) { setOpen(false); return; }
    start(async () => {
      await crmSetActiveWorkspace(id);
      setOpen(false);
      router.refresh();
    });
  }

  function addClient() {
    const name = window.prompt('שם הלקוח החדש:')?.trim();
    if (!name) return;
    start(async () => {
      const res = await crmCreateClientWorkspace({ locale, name });
      if (res.ok && res.id) { await crmSetActiveWorkspace(res.id); setOpen(false); router.refresh(); }
      else window.alert('יצירת הלקוח נכשלה');
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="flex items-center gap-2 border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors disabled:opacity-50"
      >
        <span className="w-2 h-2 rounded-full bg-brand" />
        <span className="max-w-[140px] truncate" dir="auto">{active?.name ?? 'סביבה'}</span>
        <span className="text-ink-muted text-[11px]">▾</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 end-0 w-64 bg-surface border border-border rounded-xl shadow-xl p-1.5 max-h-[70vh] overflow-auto">
            {own.length > 0 && (
              <>
                <div className="text-[11px] text-ink-muted px-3 py-1.5">הסביבות שלי</div>
                {own.map((w) => (
                  <WsRow key={w.id} w={w} active={w.id === activeId} onClick={() => switchTo(w.id)} />
                ))}
              </>
            )}
            {clients.length > 0 && (
              <>
                <div className="text-[11px] text-ink-muted px-3 py-1.5 mt-1">לקוחות</div>
                {clients.map((w) => (
                  <WsRow key={w.id} w={w} active={w.id === activeId} onClick={() => switchTo(w.id)} />
                ))}
              </>
            )}
            {canManage && (
              <button
                onClick={addClient}
                disabled={pending}
                className="w-full text-start px-3 py-2 mt-1 rounded-lg text-brand hover:bg-brand/10 font-semibold text-[14px] transition-colors disabled:opacity-50"
              >
                ＋ הוסף לקוח
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function WsRow({ w, active, onClick }: { w: AccessibleWorkspace; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-start px-3 py-2 rounded-lg text-[14px] transition-colors flex items-center gap-2 ${active ? 'bg-brand/10 text-brand font-semibold' : 'text-ink-secondary hover:bg-white/5 hover:text-ink'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-brand' : 'bg-ink-muted/40'}`} />
      <span className="truncate flex-1" dir="auto">{w.name}</span>
      {w.isClient && <span className="text-[10px] text-ink-muted border border-border rounded px-1">לקוח</span>}
    </button>
  );
}
