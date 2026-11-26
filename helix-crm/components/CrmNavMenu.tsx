'use client';

import { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu, X, Contact, Users, KeyRound, Workflow, CheckSquare, BarChart3, LayoutGrid,
  TrendingUp, Clock, Mail, Briefcase, Lightbulb, Megaphone, Settings, ChevronDown, Sparkles, Building2,
} from 'lucide-react';
import { Drawer } from '@/lib/motion/Drawer';
import { getDict, dirOf } from '@/lib/i18n';

// The CRM's screens, in the PLUG hierarchy (Ron, 2026-11-25): the dashboard on
// top, then accordion groups — daily sales work first, insights, marketing, and
// the technical screens tucked into "system" at the bottom. The group holding
// the active screen opens on its own, like PLUG's DashboardLayout accordion.
// On desktop this is a fixed start-side column; below lg it opens as a drawer.
// Autonomy stays off-menu (direct URL only). See DESIGN.md — CRM side menu.

type Item = { href: string; label: string; Icon: typeof Contact; exact?: boolean };
type Group = { key: string; label: string; Icon: typeof Contact; items: Item[] };

function useMenu(locale: string) {
  const t = getDict(locale).crm;
  const email = getDict(locale).email;
  const base = `/${locale}/dashboard`;
  const home: Item = { href: `${base}/crm/overview`, label: t.navOverview, Icon: LayoutGrid };
  const groups: Group[] = [
    {
      key: 'sales', label: t.navGroupSales, Icon: Briefcase,
      items: [
        { href: `${base}/crm`, label: t.navContacts, Icon: Contact, exact: true },
        { href: `${base}/crm/companies`, label: t.navCompanies, Icon: Building2 },
        { href: `${base}/crm/stalled`, label: t.navStalled, Icon: Clock },
        { href: `${base}/crm/tasks`, label: t.navTasks, Icon: CheckSquare },
      ],
    },
    {
      key: 'insights', label: t.navGroupInsights, Icon: Lightbulb,
      items: [
        { href: `${base}/crm/analytics`, label: t.navAnalytics, Icon: TrendingUp },
        { href: `${base}/crm/reports`, label: t.navReports, Icon: BarChart3 },
      ],
    },
    {
      key: 'marketing', label: t.navGroupMarketing, Icon: Megaphone,
      items: [{ href: `${base}/email`, label: email.navLabel, Icon: Mail }],
    },
    {
      key: 'system', label: t.navGroupSystem, Icon: Settings,
      items: [
        { href: `${base}/crm/ai`, label: t.navAi, Icon: Sparkles },
        { href: `${base}/automations`, label: t.automations, Icon: Workflow },
        { href: `${base}/crm/team`, label: t.team, Icon: Users },
        { href: `${base}/crm/api`, label: t.apiLink, Icon: KeyRound },
      ],
    },
  ];
  return { t, home, groups };
}

function isActive(pathname: string, item: Item, all: Item[]): boolean {
  if (item.exact) {
    return pathname === item.href ||
      (pathname.startsWith(`${item.href}/`) && !all.some((i) => i.href !== item.href && pathname.startsWith(i.href)));
  }
  return pathname.startsWith(item.href);
}

function MenuLinks({ locale, onNavigate }: { locale: string; onNavigate?: () => void }) {
  const pathname = usePathname() ?? '';
  const { home, groups } = useMenu(locale);
  const all = useMemo(() => [home, ...groups.flatMap((g) => g.items)], [home, groups]);
  const activeGroup = groups.find((g) => g.items.some((i) => isActive(pathname, i, all)))?.key ?? null;
  // The active group starts open (PLUG behavior); the rest start closed. The
  // user may open/close freely; their toggles win over the default.
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const isOpen = (key: string) => toggled[key] ?? (key === activeGroup || activeGroup === null && key === 'sales');

  const itemCls = (active: boolean) =>
    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14.5px] min-h-[42px] transition-colors ${
      active
        ? 'bg-brand/10 text-brand-ink font-semibold shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--color-brand)_25%,transparent)]'
        : 'text-ink-secondary hover:text-ink hover:bg-ink/5'
    }`;

  return (
    <div className="flex flex-col gap-1">
      {/* Dashboard — top-level, outside the groups */}
      <Link href={home.href} onClick={onNavigate}
        aria-current={isActive(pathname, home, all) ? 'page' : undefined}
        className={itemCls(isActive(pathname, home, all))}>
        <home.Icon size={17} aria-hidden="true" className="shrink-0" />
        {home.label}
      </Link>

      {groups.map((g) => {
        const open = isOpen(g.key);
        const groupActive = g.key === activeGroup;
        return (
          <div key={g.key} className="mt-1">
            <button
              type="button"
              onClick={() => setToggled((s) => ({ ...s, [g.key]: !open }))}
              aria-expanded={open}
              className={`w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-semibold min-h-[40px] transition-colors ${
                groupActive && !open ? 'text-brand-ink' : 'text-ink-secondary hover:text-ink hover:bg-ink/5'
              }`}
            >
              <g.Icon size={16} aria-hidden="true" className="shrink-0" />
              {g.label}
              <ChevronDown size={14} aria-hidden="true"
                className={`ms-auto shrink-0 transition-transform duration-200 ${open ? '' : '-rotate-90 rtl:rotate-90'}`} />
            </button>
            {open && (
              <div className="flex flex-col gap-0.5 ps-3 ms-4 border-s border-border">
                {g.items.map((item) => {
                  const active = isActive(pathname, item, all);
                  return (
                    <Link key={item.href} href={item.href} onClick={onNavigate}
                      aria-current={active ? 'page' : undefined} className={itemCls(active)}>
                      <item.Icon size={16} aria-hidden="true" className="shrink-0" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export function CrmSideNav({ locale }: { locale: string }) {
  const { t } = useMenu(locale);
  return (
    <aside className="hidden lg:block w-[228px] shrink-0 border-e border-border">
      <nav aria-label={t.moreTitle} className="sticky top-16 flex flex-col px-4 pt-7 pb-6">
        <MenuLinks locale={locale} />
      </nav>
    </aside>
  );
}

export function CrmMenuButton({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { t } = useMenu(locale);

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
          <nav aria-label={t.moreTitle}>
            <MenuLinks locale={locale} onNavigate={() => setOpen(false)} />
          </nav>
        </div>
      </Drawer>
    </>
  );
}
