import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import UniqueOfferClient from './UniqueOfferClient';

export const metadata: Metadata = {
  title: 'הצעה ייחודית · שהבינה המלאכותית תמליץ על העסק שלכם | HELIX',
  description:
    'הלקוחות כבר שואלים את ChatGPT, Gemini ו-Claude למי לפנות, גם באינטרנט הכשר. ניהול הנראות של העסק שלכם במנועי ה-AI, החל מ-₪2,500 לחודש. בדיקה ואבחון ראשוני חינם.',
  alternates: { canonical: '/unique-offer' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'שהבינה המלאכותית תמליץ על העסק שלכם, לא על המתחרה',
    description:
      'כשלקוח שואל את ה-AI למי לפנות, היא עונה בשם אחד. אנחנו דואגים שזה יהיו אתם. ניהול נראות ב-AI מ-HELIX.',
    url: '/unique-offer',
    type: 'website',
    locale: 'he_IL',
    images: ['/opengraph-image'],
  },
};

const faqs = [
  { q: 'אנחנו על אינטרנט כשר, זה בכלל רלוונטי לנו?', a: 'בהחלט. גם במסגרת האינטרנט הכשר והמסונן יש היום גישה ל-ChatGPT, ל-Gemini ול-Claude. יותר ויותר אנשים, גם בציבור החרדי, שואלים את הבינה המלאכותית למי לפנות במקום לגלול בגוגל. השאלה היחידה היא אם היא מכירה אתכם או את המתחרה.' },
  { q: 'מה זה אומר ש-ChatGPT "ממליץ" עלינו?', a: 'כשלקוח שואל בינה מלאכותית "מה הכי טוב ב___ באזור שלי", היא עונה בשמות ספציפיים. אם העסק שלכם לא בנוי נכון, היא פשוט לא מכירה אתכם, ומפנה את הלקוח למתחרה. אנחנו דואגים שהשם שלכם יהיה בתשובה.' },
  { q: 'אני עסק מקומי קטן בבני ברק או בירושלים, זה מתאים לי?', a: 'דווקא הכי מתאים. לקוחות שואלים AI "מי הכי טוב ב___ באזור שלי", וזה בדיוק המקום שבו עסק מקומי יכול לנצח, אם ה-AI מכיר אותו. רוב העסקים עדיין לא בנויים לזה, אז הפער קל יחסית לסגור.' },
  { q: 'כמה זה עולה?', a: 'השירות השוטף הוא ₪2,500 לחודש, בלי חוזה ובלי התחייבות ארוכה. הבדיקה הראשונית והאבחון מולנו, חינם. מתחילים רק אחרי שתראו בדיוק מה חסר ומה אפשר להרוויח.' },
  { q: 'כמה זמן לוקח לראות תוצאות?', a: 'תיקונים טכניים כמו schema וגישת בוטים משפיעים תוך שבועות, ככל שהמנועים סורקים מחדש. נוכחות מלאה נבנית לאורך זמן, אבל הצעד הראשון הוא לדעת בדיוק איפה אתם עומדים היום.' },
  { q: 'אתם משנים לנו את האתר בלי אישור?', a: 'לא. הבדיקה היא לקריאה בלבד, לא נוגעים באתר. כל תיקון קורה רק אחרי שנתאם אתכם בדיוק מה עושים.' },
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
