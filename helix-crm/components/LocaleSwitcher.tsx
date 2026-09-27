'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function LocaleSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const other = locale === 'he' ? 'en' : 'he';
  const segments = pathname.split('/');
  segments[1] = other;
  const target = segments.join('/') || `/${other}`;

  return (
    <Link
      href={target}
      className="text-[13px] font-semibold text-ink-muted hover:text-ink border border-border rounded-full px-3 py-1 transition-colors min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
    >
      {other === 'en' ? 'EN' : 'עב'}
    </Link>
  );
}
