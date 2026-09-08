import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, softwareApplicationSchema } from '@/lib/schema';
import JsonLd from '../../components/JsonLd';
import IcpListClient from './IcpListClient';

// HowTo boosts AEO/GEO, answer engines quote the numbered steps directly.
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'איך מסננים רשימת לידים מול ה-ICP בחינם',
  description: 'מגדירים ICP, מדביקים רשימת לידים, וצוות סוכנים ממיין כל ליד למתאים, לבדיקה או לא מתאים עם סיבה לכל שורה.',
  inLanguage: 'he-IL',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'מגדירים את ה-ICP', text: 'מי הלקוח האידיאלי: תחום, גודל, תפקיד וכאב, ומי לפסול מיד.' },
    { '@type': 'HowToStep', position: 2, name: 'מדביקים את הרשימה', text: 'ליד אחד בכל שורה, שם, חברה, תפקיד. עד 40 שורות.' },
    { '@type': 'HowToStep', position: 3, name: 'מקבלים רשימה מסוננת', text: 'כל ליד מסומן מתאים, לבדיקה או לא מתאים עם סיבה, ורשימת ההמלצות החמות.' },
  ],
};

export const metadata: Metadata = {
  title: 'סינון רשימת לידים מול ICP בחינם',
  description:
    'כלי חינמי: מגדירים את ה-ICP, מדביקים רשימת לידים, וצוות סוכנים ממיין כל שורה למתאים, לבדיקה או לא מתאים, עם סיבה אחת קונקרטית לכל ליד ורשימת ההמלצות החמות. בלי הרשמה.',
  alternates: { canonical: '/free-tools/icp-list-filter' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'סינון רשימת לידים מול ICP בחינם',
    description: 'מדביקים רשימת לידים, מקבלים אותה מסוננת מול ה-ICP: מתאים, לבדיקה או לא מתאים, עם סיבה לכל שורה. חינם, בלי הרשמה.',
    url: '/free-tools/icp-list-filter',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'מה הכלי בעצם עושה?',
    a: 'מגדירים מי הלקוח האידיאלי שלכם, מדביקים רשימת לידים, וצוות סוכנים עובר שורה אחר שורה וממיין כל ליד למתאים, לבדיקה נוספת או לא מתאים, עם סיבה קצרה לכל אחד. בסוף מקבלים ציון סינון, ריכוז התאמות ורשימת ההמלצות החמות להתחיל מהן.',
  },
  {
    q: 'איזו רשימה אפשר להדביק?',
    a: 'כל רשימה טקסטואלית, ליד אחד בכל שורה. הכי טוב שם, חברה ותפקיד בכל שורה, כי ככל שיש יותר הקשר כך הסיווג מדויק יותר. הכלי מטפל בעד 40 שורות בכל ריצה.',
  },
  {
    q: 'איך אתם מונעים שליד ייפול בין הכיסאות?',
    a: 'הכלי בנוי כצוות: מייקר מסווג כל שורה, ומבקר בודק אחריו שאף ליד לא הושמט בשקט, שכל שורת קלט מופיעה בפלט, ושהחברה שלכם או מתחרים לא נספרים בטעות כהתאמה אלא מסומנים לבדיקה.',
  },
  {
    q: 'התוכן נשמע כמו AI?',
    a: 'לא. הסיווגים והסיבות נכתבים בעברית טבעית ודוגרי, בלי קלישאות של AI ובלי מקף ארוך, כדי שיישמע כמו אנליסט אמיתי ולא כמו רובוט.',
  },
  {
    q: 'זה עולה כסף?',
    a: 'הסינון חינם, שלושה סינונים מלאים בלי עלות ובלי התחייבות. צריך רק להשאיר אימייל.',
  },
  {
    q: 'מה עושים עם הרשימה המסוננת אחר כך?',
    a: 'לוקחים את ההמלצות החמות ופונים אליהן קודם. אם אתם רוצים לדעת גם איך ומתי לפנות, מודיעין ה-GTM שלנו אוסף על אותם לידים אותות, טריגרים והקשר לפני הפנייה.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function FreeToolsIcpListFilterPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          howToSchema,
          softwareApplicationSchema({
            name: 'סינון רשימת לידים מול ICP, HELIX',
            description: 'כלי חינמי שממיין רשימת לידים מול הגדרת ICP למתאים, לבדיקה או לא מתאים, עם סיבה לכל שורה, ציון סינון ורשימת המלצות חמות.',
            path: '/free-tools/icp-list-filter',
            price: 'חינם',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'בדיקות חינם', url: `${SITE.url}/free-tools/icp-list-filter` },
            { name: 'סינון רשימת לידים מול ICP', url: `${SITE.url}/free-tools/icp-list-filter` },
          ]),
        ]}
      />
      <IcpListClient faqs={faqs} />
    </>
  );
}
