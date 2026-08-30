'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CommandPalette, type CommandItem } from '@/lib/motion/CommandPalette';
import '@/lib/motion/tokens.css';

const ACCENT = '#10B981'; // --color-brand (app/globals.css)

// Top-level, static routes only (dynamic [param] + API routes excluded).
// Paths are locale-prefixed at runtime from the current pathname.
const ROUTES: { path: string; title: string; subtitle?: string }[] = [
  { path: '', title: 'דף הבית', subtitle: 'Home' },
  { path: '/dashboard', title: 'לוח בקרה', subtitle: 'Dashboard' },
  { path: '/dashboard/crm', title: 'CRM', subtitle: 'אנשי קשר ועסקאות' },
  { path: '/dashboard/crm/team', title: 'צוות CRM', subtitle: 'Team' },
  { path: '/dashboard/crm/autonomy', title: 'אוטונומיה', subtitle: 'Autonomy' },
  { path: '/dashboard/crm/api', title: 'מפתחות API', subtitle: 'API keys' },
  { path: '/dashboard/automations', title: 'אוטומציות', subtitle: 'Automations' },
  { path: '/dashboard/email', title: 'אימייל', subtitle: 'Email' },
  { path: '/dashboard/email/new', title: 'אימייל חדש', subtitle: 'Compose' },
  { path: '/dashboard/email/contacts', title: 'אנשי קשר לאימייל', subtitle: 'Contacts' },
  { path: '/chief', title: 'CHIEF', subtitle: 'סוכן AI' },
  { path: '/signals', title: 'סיגנלים', subtitle: 'Signals' },
  { path: '/board', title: 'לוח', subtitle: 'Board' },
  { path: '/launches', title: 'השקות', subtitle: 'Launches' },
  { path: '/categories', title: 'קטגוריות', subtitle: 'Categories' },
  { path: '/alternatives', title: 'אלטרנטיבות', subtitle: 'Alternatives' },
  { path: '/compare', title: 'השוואה', subtitle: 'Compare' },
  { path: '/community', title: 'קהילה', subtitle: 'Community' },
  { path: '/testers', title: 'בודקים', subtitle: 'Testers' },
  { path: '/submit', title: 'הגשה', subtitle: 'Submit' },
  { path: '/newsletter', title: 'ניוזלטר', subtitle: 'Newsletter' },
  { path: '/profile/edit', title: 'עריכת פרופיל', subtitle: 'Edit profile' },
  { path: '/about', title: 'אודות', subtitle: 'About' },
  { path: '/search', title: 'חיפוש', subtitle: 'Search' },
];

export default function HelixCommandBar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // First path segment is the locale (he/en); fall back to 'he'.
  const seg = (pathname ?? '/').split('/').filter(Boolean)[0];
  const locale = seg === 'en' || seg === 'he' ? seg : 'he';

  const items: CommandItem[] = ROUTES.map((r) => ({
    id: r.path || 'home',
    title: r.title,
    subtitle: r.subtitle,
    keywords: r.path,
    run: () => router.push(`/${locale}${r.path}`),
  }));

  return (
    <div dir="rtl" style={{ ['--hm-accent' as any]: ACCENT }}>
      <CommandPalette
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        items={items}
        hotkey
        placeholder="חיפוש ניווט… (⌘K)"
      />
    </div>
  );
}
