import type { Metadata, Viewport } from 'next';
import { Heebo, JetBrains_Mono, Rubik } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SITE } from '@/lib/site';
import { professionalServiceSchema, websiteSchema } from '@/lib/schema';
import JsonLd from './components/JsonLd';
import Nav from './components/Nav';
import Footer from './components/Footer';
import MetaPixel from './components/MetaPixel';
import WhatsAppFloat from './components/WhatsAppFloat';
import FloatingCTA from './components/FloatingCTA';
import CursorTrail from './components/CursorTrail';
import FloatingLogos from './components/FloatingLogos';
import './globals.css';
import './service-pages.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-heebo',
  display: 'swap',
});

const rubik = Rubik({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '700', '900'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: SITE.defaultTitle,
    template: SITE.titleTemplate,
  },
  description: SITE.defaultDescription,
  keywords: [
    'פיתוח תוכנה',
    'שיווק דיגיטלי',
    'אסטרטגיית צמיחה',
    'קמפיינים ממומנים',
    'SEO',
    'פיתוח אתרים',
    'יזמים ישראלים',
    'SMB',
    'Helix',
    'ערן ליפשטיין',
  ],
  authors: [{ name: 'Eran Lipshtain' }],
  creator: 'Eran Lipshtain',
  publisher: 'HELIX.',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  category: 'business',
};

export const viewport: Viewport = {
  themeColor: '#121413',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${rubik.variable} ${jetbrainsMono.variable}`}>
      <body className={heebo.className}>
        <JsonLd data={[professionalServiceSchema, websiteSchema]} />
        <a href="#main-content" className="skip-nav">דלג לתוכן</a>
        <FloatingLogos />
        <Nav />
        <main id="main-content">{children}</main>
        <Footer />
        <WhatsAppFloat />
        <FloatingCTA />
        <CursorTrail />
        <MetaPixel />
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
