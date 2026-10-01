'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Contact, Building2, Handshake, Bell, Store, Users, Workflow, Plug, KeyRound, Settings, ArrowLeft,
  type LucideIcon,
} from 'lucide-react';
import { Drawer } from '@/lib/motion/Drawer';
import { getDict, dirOf } from '@/lib/i18n';
import type { Dict } from '@/lib/i18n/he';

type Key = keyof Dict['crm'];
type Item = { path: string; key: Key; Icon: LucideIcon };

// The four screens a person works in, like HubSpot's sidebar (Eran, 2026-10-01).
// Everything that sets the workspace up lives in Settings, and what is about the
// person in the profile menu. See DESIGN.md — CRM side menu.
const SCREENS: Item[] = [
  { path: '/dashboard/crm', key: 'navContacts', Icon: Contact },
  { path: '/dashboard/crm/companies', key: 'navCompanies', Icon: Building2 },
  { path: '/dashboard/crm/deals', key: 'navDeals', Icon: Handshake },
  { path: '/dashboard/crm/tasks', key: 'navTasks', Icon: Bell },
];

// Settings: the screens that change the workspace for everyone. Their addresses
// predate the menu and stay as they are (bookmarks, the Google callback), so the
// menu tells a settings screen apart by its path. Autonomy and CHIEF stay hidden.
const SETTINGS: Item[] = [
  { path: '/dashboard/crm/business', key: 'businessNav', Icon: Store },
  { path: '/dashboard/crm/team', key: 'team', Icon: Users },
  { path: '/dashboard/automations', key: 'automations', Icon: Workflow },
  { path: '/dashboard/crm/connections', key: 'connNav', Icon: Plug },
  { path: '/dashboard/crm/api', key: 'apiLink', Icon: KeyRound },
];

/** The path without its locale: "/he/dashboard/crm/team" → "/dashboard/crm/team". */
function bare(pathname: string): string {
  return pathname.replace(/^\/(he|en)(?=\/|$)/, '') || '/';
}
const under = (path: string, base: string) => path === base || path.startsWith(`${base}/`);
const CONTACT_PAGE = /^\/dashboard\/crm\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True on a settings screen, or on a page under one (an automation, the Google import). */
export function isSettingsPath(pathname: string): boolean {
  const p = bare(pathname);
  return SETTINGS.some((s) => under(p, s.path));
}

/**
 * The one of the four screens a path belongs to. Contacts also own a contact's
 * full page and the quote editor; a screen reached only from the profile menu or by
 * its address (a new workspace, autonomy, CHIEF) belongs to none of them.
 */
function currentScreen(pathname: string): string | null {
  const p = bare(pathname);
  for (const s of SCREENS.slice(1)) if (under(p, s.path)) return s.path;
  if (p === '/dashboard/crm' || p.startsWith('/dashboard/crm/quotes/') || CONTACT_PAGE.test(p)) return '/dashboard/crm';
  return null;
}

const rowBase = 'flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] min-h-[44px] transition-colors';
const rowIdle = 'text-ink-secondary hover:text-ink hover:bg-ink/5';
const rowActive = 'bg-ink/5 text-ink font-semibold';

function Row({ href, label, Icon, active, onNavigate }: { href: string; label: string; Icon: LucideIcon; active: boolean; onNavigate?: () => void }) {
  return (
    <Link href={href} onClick={onNavigate} aria-current={active ? 'page' : undefined} className={`${rowBase} ${active ? rowActive : rowIdle}`}>
      <Icon size={17} aria-hidden="true" className={active ? 'text-ink shrink-0' : 'text-ink-muted shrink-0'} />
      {label}
    </Link>
  );
}

function MenuLinks({ locale, onNavigate }: { locale: string; onNavigate?: () => void }) {
  const pathname = usePathname() ?? '';
  const t = getDict(locale).crm;
  const base = `/${locale}`;
  const label = (k: Key) => t[k] as string;

  if (isSettingsPath(pathname)) {
    const p = bare(pathname);
    return (
      <>
        <Link href={`${base}/dashboard/crm`} onClick={onNavigate} className={`${rowBase} ${rowIdle}`}>
          {/* Back points the way the page reads: right in Hebrew. */}
          <ArrowLeft size={17} aria-hidden="true" className="text-ink-muted shrink-0 rtl:rotate-180" />
          {t.settingsBack}
        </Link>
        <div role="presentation" className="border-t border-border my-1.5" />
        {SETTINGS.map((s) => (
          <Row key={s.path} href={`${base}${s.path}`} label={label(s.key)} Icon={s.Icon} active={under(p, s.path)} onNavigate={onNavigate} />
        ))}
      </>
    );
  }

  const current = currentScreen(pathname);
  return (
    <>
      {SCREENS.map((s) => (
        <Row key={s.path} href={`${base}${s.path}`} label={label(s.key)} Icon={s.Icon} active={current === s.path} onNavigate={onNavigate} />
      ))}
    </>
  );
}

/** The menu's name for assistive technology: Settings inside a setting, else the main menu. */
function useMenuName(locale: string): string {
  const pathname = usePathname() ?? '';
  const t = getDict(locale).crm;
  return isSettingsPath(pathname) ? t.settings : t.navMain;
}

export function CrmSideNav({ locale }: { locale: string }) {
  const name = useMenuName(locale);
  return (
    <aside className="hidden lg:block w-[220px] shrink-0 border-e border-border">
      <nav aria-label={name} className="sticky top-16 flex flex-col gap-1.5 px-4 pt-8">
        <MenuLinks locale={locale} />
      </nav>
    </aside>
  );
}

/** The nav's gear: opens Settings at its first screen, and reads as current inside it. */
export function CrmSettingsButton({ locale }: { locale: string }) {
  const pathname = usePathname() ?? '';
  const t = getDict(locale).crm;
  const on = isSettingsPath(pathname);
  return (
    <Link
      href={`/${locale}/dashboard/crm/business`}
      aria-label={t.settings}
      title={t.settings}
      className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-[10px] transition-colors ${on ? 'text-ink bg-ink/5' : 'text-ink-secondary hover:text-ink hover:bg-ink/5'}`}
    >
      <Settings size={18} aria-hidden="true" />
    </Link>
  );
}

export function CrmMenuButton({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const t = getDict(locale).crm;
  const name = useMenuName(locale);
  // The trigger lives in the nav, whose backdrop-blur makes it the containing block
  // for fixed children. The Drawer portals itself into <body>, so it stays full-height.

  // Drawer closes itself on scrim click and Escape; focus return is the consumer's
  // job, so both paths land back on the control that opened it.
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label={t.menuOpen}
        className="lg:hidden inline-flex items-center justify-center min-h-[44px] min-w-[44px] -ms-2 rounded-[10px] text-ink-secondary hover:text-ink transition-colors"
      >
        <Menu size={20} aria-hidden="true" />
      </button>

      <Drawer open={open} onClose={close} side="start" dir={dirOf(locale)} width={300}>
        <div className="flex flex-col h-full text-ink">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-[16px]">{name}</h2>
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="text-ink-muted hover:text-ink transition-colors p-2 -m-2 rounded-lg"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label={name} className="flex flex-col gap-1.5">
            <MenuLinks locale={locale} onNavigate={() => setOpen(false)} />
          </nav>
        </div>
      </Drawer>
    </>
  );
}
