'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { MoreHorizontal, X, Users, KeyRound, SlidersHorizontal, Workflow } from 'lucide-react';
import { Drawer } from '@/lib/motion/Drawer';
import type { Dict } from '@/lib/i18n/he';

// The board header used to carry four same-weight outline buttons for things you
// touch monthly, level with the one action you take all day. They live behind this
// one control now, and autonomy is reachable without ⌘K for the first time.
// See DESIGN.md — CRM Shell / header: primary + overflow.
export default function CrmHeaderMenu({ locale, t }: { locale: string; t: Dict['crm'] }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Drawer closes itself on scrim click and Escape; focus return is the consumer's
  // job, so both paths land back on the control that opened it.
  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  const items = [
    { href: `/${locale}/dashboard/crm/team`, label: t.team, Icon: Users },
    { href: `/${locale}/dashboard/crm/api`, label: t.apiLink, Icon: KeyRound },
    { href: `/${locale}/dashboard/crm/autonomy`, label: t.autonomy, Icon: SlidersHorizontal },
    { href: `/${locale}/dashboard/automations`, label: t.automations, Icon: Workflow },
  ];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t.moreTitle}
        className="flex items-center gap-1.5 border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors min-h-[44px]"
      >
        <MoreHorizontal size={18} aria-hidden="true" />
        <span className="text-[14px]">{t.more}</span>
      </button>

      <Drawer open={open} onClose={close} side="end" width={340}>
        {/* Rendered only while open so the panel holds no tabbable links off-screen. */}
        {open && (
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
            <nav className="flex flex-col gap-1.5">
              {items.map(({ href, label, Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] text-ink-secondary hover:text-ink hover:bg-white/5 transition-colors min-h-[44px]"
                >
                  <Icon size={17} aria-hidden="true" className="text-ink-muted shrink-0" />
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </Drawer>
    </>
  );
}
