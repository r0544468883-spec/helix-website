'use client';

import { useCallback, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { CommandPalette, type CommandItem } from '@/lib/motion/CommandPalette';
import { crmSearchIndex, type CrmSearchIndex } from '@/app/crm-actions';
import { getDict, isRtl } from '@/lib/i18n';

// tokens.css is imported once from app/globals.css, where --hm-accent and the dark
// material overrides live. Nothing accent-related belongs in this file.

// CRM screens only. This used to list 24 routes of which 6 were the CRM, because the
// palette was mounted globally across the old directory product. It renders under
// (crm) now, so the directory routes are gone from it.
const ROUTES: { path: string; title: string; subtitle?: string }[] = [
  { path: '/dashboard/crm', title: 'CRM', subtitle: 'אנשי קשר ועסקאות' },
  { path: '/dashboard/crm/team', title: 'צוות CRM', subtitle: 'Team' },
  { path: '/dashboard/crm/business', title: 'פרטי העסק', subtitle: 'Business details' },
  { path: '/dashboard/crm/api', title: 'מפתחות API', subtitle: 'API keys' },
  { path: '/dashboard/automations', title: 'אוטומציות', subtitle: 'Automations' },
  { path: '/dashboard/email', title: 'אימייל', subtitle: 'Email' },
  { path: '/dashboard/email/new', title: 'אימייל חדש', subtitle: 'Compose' },
  { path: '/dashboard/email/contacts', title: 'אנשי קשר לאימייל', subtitle: 'Contacts' },
  // CHIEF and autonomy are hidden from navigation (2026-09-27). Both still work by direct URL.
];

export default function HelixCommandBar() {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState<CrmSearchIndex | null>(null);
  const [failed, setFailed] = useState(false);
  const loading = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  // First path segment is the locale (he/en); fall back to 'he'.
  const seg = (pathname ?? '/').split('/').filter(Boolean)[0];
  const locale = seg === 'en' || seg === 'he' ? seg : 'he';
  const t = getDict(locale).crm;

  // Load on open, then keep the result for the session so reopening is instant.
  // We still revalidate on every open: the active-workspace cookie is httpOnly, so
  // the only way to notice a workspace switch is to compare what the server returns.
  const load = useCallback(async () => {
    if (loading.current) return;
    loading.current = true;
    try {
      const res = await crmSearchIndex();
      if (res.ok) {
        // Whatever comes back is already scoped to the active workspace, so replacing
        // outright is what drops a previous workspace's records after a switch.
        setIndex(res.index);
        setFailed(false);
      } else {
        // Routes still work; only the record half is missing.
        setIndex(null);
        setFailed(true);
      }
    } catch {
      setFailed(true);
    } finally {
      loading.current = false;
    }
  }, []);

  function onOpen() {
    setOpen(true);
    void load();
  }

  const items: CommandItem[] = [
    ...ROUTES.map((r) => ({
      id: `route:${r.path}`,
      title: r.title,
      subtitle: r.subtitle ?? t.paletteNav,
      keywords: r.path,
      run: () => router.push(`/${locale}${r.path}`),
    })),
    ...(index?.contacts ?? []).map((c) => ({
      id: `contact:${c.id}`,
      title: c.name,
      subtitle: c.company ?? t.paletteContacts,
      // Everything the spec says a contact is findable by: name, email, company, role.
      keywords: [c.email, c.company, c.role].filter(Boolean).join(' '),
      // The drawer, not the full page: it is where a person is worked.
      run: () => router.push(`/${locale}/dashboard/crm?c=${c.id}`),
    })),
    ...(index?.deals ?? []).map((d) => ({
      id: `deal:${d.id}`,
      title: d.title,
      subtitle: `${(t[`st_${d.stage}` as keyof typeof t] as string) ?? d.stage}${d.value > 0 ? ` · ₪${d.value.toLocaleString()}` : ''}`,
      keywords: [d.contactName, t.paletteDeals].filter(Boolean).join(' '),
      // A deal with no contact has no record to open, so it lands on the board.
      run: () =>
        router.push(d.contactId ? `/${locale}/dashboard/crm?c=${d.contactId}` : `/${locale}/dashboard/crm`),
    })),
  ];

  return (
    <div dir={isRtl(locale) ? 'rtl' : 'ltr'}>
      <CommandPalette
        open={open}
        onOpen={onOpen}
        onClose={() => setOpen(false)}
        items={items}
        hotkey
        placeholder={t.palettePlaceholder}
        emptyLabel={t.paletteEmpty}
        notice={failed ? t.paletteRecordsFailed : undefined}
      />
    </div>
  );
}
