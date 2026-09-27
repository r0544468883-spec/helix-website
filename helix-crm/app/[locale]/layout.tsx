import type { Metadata } from 'next';
import { Heebo, Rubik, JetBrains_Mono } from 'next/font/google';
import { notFound } from 'next/navigation';
import '../globals.css';
import { getDict, isRtl, locales, type Locale } from '@/lib/i18n';

// Document shell only. Next.js allows exactly one root layout on a path, and every
// page lives under app/[locale]/, so <html>/<body>, the fonts and globals.css stay
// here. The chrome moved down into the two route groups: (crm) renders the lean CRM
// shell, (stage) keeps the directory chrome it always had. See DESIGN.md — CRM Shell.

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-heebo',
  display: 'swap',
});

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '700', '900'],
  variable: '--font-rubik',
  display: 'swap',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = getDict(locale);
  return { title: t.meta.title, description: t.meta.description };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();
  const t = getDict(locale);

  return (
    <html lang={locale} dir={isRtl(locale) ? 'rtl' : 'ltr'}>
      <body
        className={`${heebo.className} ${heebo.variable} ${rubik.variable} ${jetbrains.variable} bg-bg text-ink min-h-screen flex flex-col`}
      >
        {/* Stays at the document level so it is the first focusable thing in the DOM,
            ahead of whichever group layout renders the nav. Targets the <main> that
            each group renders. */}
        <a href="#main-content" className="skip-nav">
          {t.nav.skipToContent}
        </a>
        {children}
      </body>
    </html>
  );
}
