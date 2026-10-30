import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import UniqueOfferClient from './UniqueOfferClient';

export const metadata: Metadata = {
  title: 'הצעה ייחודית לבעלי עסקים במגזר החרדי · נראות ב-AI | HELIX',
  description:
    'ליווי GEO חודשי מלא, שהבינה המלאכותית תמצא, תבין ותמליץ על העסק שלכם. מחיר מיוחד לבעלי עסקים במגזר החרדי: ₪2,500 לחודש במקום ₪3,500. אפשר להתחיל בבדיקת נראות חינם.',
  alternates: { canonical: '/unique-offer' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'הצעה ייחודית לבעלי עסקים במגזר החרדי · נראות ב-AI',
    description:
      'כשלקוח שואל את ה-AI למי לפנות, הוא עונה בשם אחד. ליווי GEO חודשי מ-HELIX, ₪2,500 לחודש במקום ₪3,500, מחיר מיוחד למגזר.',
    url: '/unique-offer',
    type: 'website',
    locale: 'he_IL',
    images: ['/opengraph-image'],
  },
};

const faqs = [
  { q: 'מה המחיר, ולמה הוא מיוחד?', a: 'הליווי המלא הוא ₪3,500 לחודש. לבעלי עסקים במגזר אנחנו נותנים אותו ב-₪2,500 לחודש, מחיר קבוע, בלי חוזה ובלי התחייבות ל-3 חודשים.' },
  { q: 'אני צריך לעשות משהו באינטרנט או להתחבר למשהו?', a: 'לא. הכל נעשה על ידינו. אתם רק מתקשרים או משאירים מספר, ואנחנו עושים את הבדיקה ואת כל העבודה, ומעדכנים אתכם בטלפון.' },
  { q: 'מה זה בעצם נראות בבינה המלאכותית?', a: 'כשלקוח שואל את ChatGPT, את Gemini או את Claude "מה הכי טוב ב___ באזור שלי", הם עונים בשם אחד או שניים. אנחנו דואגים שהשם שלכם יהיה שם, במקום של המתחרה.' },
  { q: 'אתם מבטיחים שה-AI ימליץ עליי?', a: 'אנחנו לא מבטיחים כתר. אנחנו בונים את התשתית שגורמת לבינה המלאכותית להכיר אתכם ולהמליץ עליכם, ומראים לכם את ההתקדמות בנתונים אמיתיים, חודש אחרי חודש.' },
  { q: 'צריך חוזה או התחייבות?', a: 'לא. מחיר קבוע חודשי, אפשר לעצור בכל חודש. מתחילים בבדיקה בחינם, ורק אם תראו ערך, ממשיכים.' },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

const offerJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'ניהול נראות ב-AI (GEO)',
  serviceType: 'Generative Engine Optimization',
  provider: { '@type': 'Organization', name: 'HELIX', url: SITE.url },
  description:
    'ניהול חודשי של הנראות של העסק במנועי הבינה המלאכותית: ניטור, תיקון תשתית GEO, תוכן שה-AI מצטט, נראות מקומית ומעקב מתחרים.',
  areaServed: 'IL',
  offers: {
    '@type': 'Offer',
    price: '2500',
    priceCurrency: 'ILS',
    availability: 'https://schema.org/InStock',
    url: `${SITE.url}/unique-offer`,
    description: 'חודשי, בלי התחייבות ארוכה',
  },
};

export default function UniqueOfferPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          offerJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'הצעה ייחודית', url: `${SITE.url}/unique-offer` },
          ]),
        ]}
      />
      <UniqueOfferClient />
    </>
  );
}
