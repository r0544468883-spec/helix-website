import type { Metadata, Viewport } from 'next';
import { Heebo, JetBrains_Mono } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import { SITE } from '@/lib/site';
import Nav from './components/Nav';
import Footer from './components/Footer';
import MetaPixel from './components/MetaPixel';
import WhatsAppFloat from './components/WhatsAppFloat';
import './globals.css';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-heebo',
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
    images: [
      {
        url: SITE.defaultOgImage,
        width: 1200,
        height: 630,
        alt: SITE.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.defaultTitle,
    description: SITE.defaultDescription,
    images: [SITE.defaultOgImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  category: 'business',
};

export const viewport: Viewport = {
  themeColor: '#FAFAF8',
  width: 'device-width',
  initialScale: 1,
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HELIX.',
  alternateName: 'Helix',
  url: SITE.url,
  logo: `${SITE.url}/favicon.svg`,
  email: SITE.email,
  founder: { '@type': 'Person', name: 'Eran Lipshtain' },
  address: { '@type': 'PostalAddress', addressCountry: 'IL' },
  description: SITE.defaultDescription,
  sameAs: [],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${heebo.variable} ${jetbrainsMono.variable}`}>
      <body className={heebo.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <Nav />
        <main>{children}</main>
        <Footer />
        <WhatsAppFloat />
        <MetaPixel />
      </body>
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
    </html>
  );
}
