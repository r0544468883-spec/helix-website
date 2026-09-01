import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, softwareApplicationSchema } from '@/lib/schema';
import JsonLd from '../../components/JsonLd';
import DifferentiationClient from './DifferentiationClient';

// HowTo boosts AEO/GEO, answer engines quote the numbered steps directly.
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'איך מגלים את הבידול העסקי שלכם בחינם',
  description: 'ניתוח בידול אסטרטגי מלא בכמה שאלות, פורטר, קבוצות אסטרטגיה, VRINO, SWOT ואוקיינוס כחול.',
  inLanguage: 'he-IL',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'עונים על כמה שאלות', text: 'מה אתם מוכרים, למי, מי המתחרים ומה היתרונות שאתם חושבים שיש לכם.' },
    { '@type': 'HowToStep', position: 2, name: 'הצוות מריץ את המודלים', text: 'היוצר מריץ פורטר, קבוצות אסטרטגיה, VRINO, SWOT ואוקיינוס כחול, והמבקר בודק כל טענה.' },
    { '@type': 'HowToStep', position: 3, name: 'מקבלים דוח בידול', text: 'ציון בהירות בידול, הנכס היחיד שעובר VRINO, ומשפט אסטרטגי אחד עם מהלכים.' },
  ],
};

export const metadata: Metadata = {
  title: 'בדיקת בידול עסקי בחינם, ניתוח אסטרטגי ב-AI',
  description:
    'כלי חינמי: עונים על כמה שאלות על העסק, וצוות סוכנים מריץ ניתוח בידול אסטרטגי מלא, פורטר, קבוצות אסטרטגיה, VRINO, SWOT ואוקיינוס כחול, ואומר בכנות מה באמת מבדל אתכם. בלי הרשמה.',
  alternates: { canonical: '/free-tools/differentiation' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'בדיקת בידול עסקי בחינם, ניתוח אסטרטגי ב-AI',
    description: 'ניתוח בידול מלא ברמת MBA בכמה שאלות: קבוצות אסטרטגיה, VRINO, SWOT ואוקיינוס כחול. חינם, בלי הרשמה.',
    url: '/free-tools/differentiation',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'מה הכלי בעצם עושה?',
    a: 'עונים על כמה שאלות על העסק, השוק והמתחרים, וצוות סוכנים מריץ ניתוח אסטרטגי מלא: מיפוי הענף, פורטר 5+1, מפת קבוצות אסטרטגיה, VRINO, SWOT עם מנוף ובטן רכה, אוקיינוס כחול ומשפט אסטרטגי אחד עם מהלכים.',
  },
  {
    q: 'מה זה VRINO ולמה זה החלק החשוב?',
    a: 'VRINO מעביר כל יתרון שאתם חושבים שיש לכם דרך חמישה מסננים: ערך, נדירות, קושי לחיקוי, קושי להחלפה, וארגון. המטרה לחשוף אילו "יתרונות" הם בעצם תנאי סף שכל מתחרה מחזיק, ואיזה נכס אחד באמת מבדל. זה החלק שהכי קשה לעשות לבד, כי קל להתאהב ביתרון מדומה.',
  },
  {
    q: 'איך אתם מונעים תשובות מומצאות?',
    a: 'הכלי בנוי כצוות: מייקר מריץ את המודלים, ומבקר בודק כל טענה אחריו, מפיל יתרונות שהם תנאי סף, מפריד ראיה מהסקה, ומסמן כל מתחרה שהמנוע העלה מעצמו כטעון אימות. שם של מתחרה שאתם נותנים נשאר כפי שנתתם.',
  },
  {
    q: 'התוכן נשמע כמו AI?',
    a: 'לא. הניתוח נכתב בעברית טבעית ודוגרי, בלי קלישאות של AI ובלי מקף ארוך, כדי שיישמע כמו יועץ אמיתי ולא כמו רובוט.',
  },
  {
    q: 'זה עולה כסף?',
    a: 'הבדיקה חינם, שני ניתוחים מלאים בלי עלות ובלי התחייבות. צריך רק להשאיר אימייל.',
  },
  {
    q: 'מה ההבדל בין זה לכלי המכירות שלכם?',
    a: 'הכלי הזה עונה על השאלה איפה היתרון שלכם. כלי המכירות עונה על השאלה איך מוכרים אותו: ICP, משפך, ANUM, הודעות פנייה ותסריט שיחה. שניהם עובדים על אותו עסק, זה אחרי זה.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function FreeToolsDifferentiationPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          howToSchema,
          softwareApplicationSchema({
            name: 'בדיקת בידול עסקי, HELIX',
            description: 'כלי חינמי שמריץ ניתוח בידול אסטרטגי מלא (פורטר, קבוצות אסטרטגיה, VRINO, SWOT, אוקיינוס כחול) ומחזיר ציון בהירות בידול ומשפט אסטרטגי.',
            path: '/free-tools/differentiation',
            price: 'חינם',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'בדיקות חינם', url: `${SITE.url}/free-tools/differentiation` },
            { name: 'בדיקת בידול עסקי', url: `${SITE.url}/free-tools/differentiation` },
          ]),
        ]}
      />
      <DifferentiationClient faqs={faqs} />
    </>
  );
}
