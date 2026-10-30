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
  { q: 'מה המחיר, ולמה הוא מיוחד?', a: 'הליווי המלא הוא ₪3,500 לחודש. לבעלי עסקים במגזר החרדי אנחנו נותנים אותו ב-₪2,500 לחודש, מחיר קבוע, בלי חוזה ובלי התחייבות ל-3 חודשים.' },
  { q: 'מה בדיוק כולל הליווי החודשי?', a: 'ניטור חודשי של הנראות שלכם ב-4 מנועי AI עם דוח התקדמות, תיקון תשתית GEO, יצירת תוכן שה-AI מצטט, חיזוק הזהות הדיגיטלית, ייעוץ PR לקישורים, מעקב מול מתחרים, ופגישת מעקב שבועית.' },
  { q: 'אנחנו על אינטרנט כשר, זה בכלל רלוונטי לנו?', a: 'בהחלט. גם במסגרת האינטרנט הכשר והמסונן יש היום גישה ל-ChatGPT, ל-Gemini ול-Claude. יותר ויותר לקוחות שואלים את הבינה המלאכותית למי לפנות במקום לגלול בגוגל. השאלה היחידה היא אם היא מכירה אתכם או את המתחרה.' },
  { q: 'מה ההבדל בין הליווי לבין הבדיקה החינמית?', a: 'הבדיקה מראה לכם איפה אתם עומדים היום: הציון, המתחרים ומה חסר. הליווי החודשי הוא מי שסוגר את הפער בפועל, חודש אחרי חודש, עד שה-AI מכיר אתכם וממליץ עליכם.' },
  { q: 'כמה זמן לוקח לראות תוצאות?', a: 'תיקונים טכניים כמו schema וגישת בוטים משפיעים תוך שבועות, ככל שהמנועים סורקים מחדש. נוכחות מלאה נבנית לאורך זמן, ובדיוק בשביל זה הליווי הוא חודשי ומתמשך.' },
  { q: 'אתם משנים לנו את האתר בלי אישור?', a: 'לא. הבדיקה היא לקריאה בלבד, לא נוגעים באתר. כל תיקון במסגרת הליווי קורה רק אחרי שנתאם אתכם בדיוק מה עושים.' },
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
