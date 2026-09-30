'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Contact, Users, KeyRound, Workflow, Building2, Plus, Plug } from 'lucide-react';
import { Drawer } from '@/lib/motion/Drawer';
import { getDict, dirOf } from '@/lib/i18n';

// The CRM's screens, listed once. On desktop they sit in a fixed column on the
// start side (the right in Hebrew); below lg the same list opens from that edge.
// This replaced the "עוד" overflow button on the home header (Eran, 2026-09-27).
// Autonomy is hidden from navigation like CHIEF; /dashboard/crm/autonomy still
// works by direct URL. See DESIGN.md — CRM side menu.
function useItems(locale: string) {
  const t = getDict(locale).crm;
  const base = `/${locale}/dashboard`;
  return {
    t,
    items: [
      { href: `${base}/crm`, label: t.navContacts, Icon: Contact, exact: true },
      { href: `${base}/automations`, label: t.automations, Icon: Workflow, exact: false },
      { href: `${base}/crm/team`, label: t.team, Icon: Users, exact: false },
      { href: `${base}/crm/business`, label: t.businessNav, Icon: Building2, exact: false },
      { href: `${base}/crm/connections`, label: t.connNav, Icon: Plug, exact: false },
      { href: `${base}/crm/api`, label: t.apiLink, Icon: KeyRound, exact: false },
      // Every role: anyone signed in may have a workspace of their own (crm-multi-workspace).
      { href: `${base}/crm/workspaces/new`, label: t.wsNew, Icon: Plus, exact: false },
    ],
  };
}

function MenuLinks({ locale, onNavigate }: { locale: string; onNavigate?: () => void }) {
  const pathname = usePathname() ?? '';
  const { items } = useItems(locale);
  return (
    <>
      {items.map(({ href, label, Icon, exact }) => {
        // The contacts home also owns /crm/[id]; team and api are their own screens.
        const active = exact
          ? pathname === href || (pathname.startsWith(`${href}/`) && !items.some((i) => i.href !== href && pathname.startsWith(i.href)))
          : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] min-h-[44px] transition-colors ${
              active ? 'bg-ink/5 text-ink font-semibold' : 'text-ink-secondary hover:text-ink hover:bg-ink/5'
            }`}
          >
            <Icon size={17} aria-hidden="true" className={active ? 'text-ink shrink-0' : 'text-ink-muted shrink-0'} />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export function CrmSideNav({ locale }: { locale: string }) {
  const { t } = useItems(locale);
  return (
    <aside className="hidden lg:block w-[220px] shrink-0 border-e border-border">
      <nav aria-label={t.moreTitle} className="sticky top-16 flex flex-col gap-1.5 px-4 pt-8">
        <MenuLinks locale={locale} />
      </nav>
    </aside>
  );
}

export function CrmMenuButton({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { t } = useItems(locale);
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
            <h2 className="font-bold text-[16px]">{t.moreTitle}</h2>
            <button
              type="button"
              onClick={close}
              aria-label={t.close}
              className="text-ink-muted hover:text-ink transition-colors p-2 -m-2 rounded-lg"
            >
              <X size={18} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label={t.moreTitle} className="flex flex-col gap-1.5">
            <MenuLinks locale={locale} onNavigate={() => setOpen(false)} />
          </nav>
        </div>
      </Drawer>
    </>
  );
}
