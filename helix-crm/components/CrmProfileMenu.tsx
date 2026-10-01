'use client';

import { useEffect, useId, useRef, useState, useTransition } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ChevronDown, Plus, Languages, Moon, Sun, ExternalLink, LogOut } from 'lucide-react';
import { getDict } from '@/lib/i18n';
import { crmSetActiveWorkspace } from '@/app/crm-actions';
import { withTimeout } from '@/lib/use-status-change';
import { useTheme, applyTheme } from '@/lib/use-theme';
import type { Theme } from '@/lib/theme';
import type { AccessibleWorkspace } from '@/lib/crm-workspace';

const row = 'w-full flex items-center gap-2 text-start px-3 py-2 min-h-[44px] rounded-lg text-[14px] transition-colors text-ink-secondary hover:bg-ink/5 hover:text-ink';
const divider = 'border-t border-border my-1';

/**
 * Everything about the person, at the end of the nav (crm-sidebar-four-screens):
 * who is signed in, the workspaces they can switch between (only with two or
 * more), "workspace חדש", language, theme, the account portal and sign-out. The
 * switcher lives here so a person can switch from any screen; switching keeps the
 * screen. An in-page menu, not an overlay: it sits inside the nav, whose
 * backdrop-blur would clip a fixed click-catcher to the nav's box, so an outside
 * click is caught on the document instead. See DESIGN.md — Profile menu.
 */
export default function CrmProfileMenu({
  locale,
  email,
  workspaces,
  activeId,
  activeName,
  initialTheme,
}: {
  locale: string;
  email: string;
  workspaces: AccessibleWorkspace[];
  activeId: string | null;
  activeName: string;
  initialTheme: Theme;
}) {
  const d = getDict(locale);
  const t = d.crm;
  const router = useRouter();
  const pathname = usePathname() ?? `/${locale}`;
  const theme = useTheme(initialTheme);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();
  // A switch in flight: a second press waits for it instead of racing it.
  const switching = useRef(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  // Escape returns focus to the control; a press anywhere outside just closes.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };
    const onDown = (e: PointerEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open]);

  // The same screen in the other language: the first path segment is the locale.
  const other = locale === 'he' ? 'en' : 'he';
  const segs = pathname.split('/');
  segs[1] = other;
  const otherHref = segs.join('/') || `/${other}`;

  const initial = (email.trim()[0] ?? '?').toLocaleUpperCase();
  const roleText = (w: AccessibleWorkspace) =>
    w.role === 'admin' ? t.roleAdmin
    : w.role === 'viewer' ? t.roleViewer
    : w.role === 'agency_admin' ? t.roleAgencyAdmin
    : t.roleMember;
  const own = workspaces.filter((w) => !w.isClient);
  const clients = workspaces.filter((w) => w.isClient);

  function switchTo(id: string) {
    if (id === activeId) { setOpen(false); return; }
    if (switching.current) return;
    switching.current = true;
    setFailed(false);
    startTransition(async () => {
      const res = await withTimeout(crmSetActiveWorkspace(id));
      switching.current = false;
      if (!res || !('ok' in res) || !res.ok) { setFailed(true); return; }
      setOpen(false);
      // Same path, the new workspace's records: the switch keeps the screen.
      router.refresh();
    });
  }

  function toggleTheme() {
    applyTheme(theme === 'dark' ? 'light' : 'dark');
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={panelId}
        // The visible name is inside the accessible one (WCAG 2.5.3).
        aria-label={`${t.profileMenu}, ${activeName}`}
        className="flex items-center gap-2 min-h-[44px] min-w-[44px] rounded-[10px] px-1.5 md:px-2 text-ink-secondary hover:text-ink hover:bg-ink/5 transition-colors"
      >
        <span aria-hidden="true" className="w-8 h-8 rounded-full bg-ink/10 text-ink text-[13px] font-bold grid place-items-center shrink-0">{initial}</span>
        <span className="hidden md:block max-w-[140px] truncate text-[14px] font-semibold" dir="auto">{activeName}</span>
        <ChevronDown size={14} aria-hidden="true" className="hidden md:block text-ink-muted shrink-0" />
      </button>

      {open && (
        <div
          id={panelId}
          className="absolute z-20 top-full mt-2 end-0 w-72 max-w-[calc(100vw-32px)] bg-surface border border-border rounded-xl shadow-xl p-1.5 max-h-[80vh] overflow-auto text-start"
        >
          {/* An address reads left to right inside a right-aligned Hebrew menu. */}
          <p className="px-3 py-2 text-[13px] text-ink-secondary truncate"><bdi dir="ltr">{email}</bdi></p>

          {workspaces.length > 1 && (
            <>
              <div className={divider} />
              <div role="group" aria-label={t.wsMine}>
                {own.length > 0 && (
                  <>
                    <div className="text-[11px] text-ink-muted px-3 py-1.5">{t.wsMine}</div>
                    {own.map((w) => (
                      <WsRow key={w.id} w={w} active={w.id === activeId} role={roleText(w)} tag={t.wsClientTag} onClick={() => switchTo(w.id)} />
                    ))}
                  </>
                )}
                {clients.length > 0 && (
                  <>
                    <div className="text-[11px] text-ink-muted px-3 py-1.5 mt-1">{t.wsClients}</div>
                    {clients.map((w) => (
                      <WsRow key={w.id} w={w} active={w.id === activeId} role={roleText(w)} tag={t.wsClientTag} onClick={() => switchTo(w.id)} />
                    ))}
                  </>
                )}
                {failed && <p role="alert" className="text-danger text-[13px] px-3 py-2">{t.clientSwitchFailed}</p>}
              </div>
            </>
          )}

          {/* Outside the workspaces group: the switcher lists and switches, nothing else. */}
          <div className={divider} />
          <Link href={`/${locale}/dashboard/crm/workspaces/new`} onClick={() => setOpen(false)} className={row}>
            <Plus size={16} aria-hidden="true" className="text-ink-muted shrink-0" />
            {t.wsNew}
          </Link>

          <div className={divider} />
          <Link href={otherHref} lang={other} onClick={() => setOpen(false)} className={row}>
            <Languages size={16} aria-hidden="true" className="text-ink-muted shrink-0" />
            {t.langOther}
          </Link>
          <button type="button" onClick={toggleTheme} className={row}>
            {theme === 'dark'
              ? <Sun size={16} aria-hidden="true" className="text-ink-muted shrink-0" />
              : <Moon size={16} aria-hidden="true" className="text-ink-muted shrink-0" />}
            {/* Named for what it turns on. */}
            {theme === 'dark' ? d.shell.themeLight : d.shell.themeDark}
          </button>

          <div className={divider} />
          <a
            href="https://my.helix.co.il"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={d.shell.portalNewTab}
            onClick={() => setOpen(false)}
            className={row}
          >
            <ExternalLink size={16} aria-hidden="true" className="text-ink-muted shrink-0" />
            {d.shell.portal}
          </a>
          <form action={`/auth/signout?locale=${locale}`} method="post">
            <button type="submit" className={row}>
              <LogOut size={16} aria-hidden="true" className="text-ink-muted shrink-0 rtl:-scale-x-100" />
              {d.auth.logout}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function WsRow({ w, active, role, tag, onClick }: {
  w: AccessibleWorkspace; active: boolean; role: string; tag: string; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`w-full flex items-center gap-2 text-start px-3 py-2 min-h-[44px] rounded-lg text-[14px] transition-colors ${active ? 'bg-brand/10 text-brand-ink font-semibold' : 'text-ink-secondary hover:bg-ink/5 hover:text-ink'}`}
    >
      <span aria-hidden="true" className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-brand' : 'bg-ink-muted/40'}`} />
      <span className="truncate flex-1 min-w-0" dir="auto">{w.name}</span>
      {/* The role held there: it differs from row to row, and stays whole while the name truncates. */}
      <span className="text-[11px] text-ink-muted font-normal shrink-0 whitespace-nowrap">{role}</span>
      {w.isClient && <span className="text-[10px] text-ink-muted border border-border rounded px-1 shrink-0">{tag}</span>}
    </button>
  );
}
