import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../../components/JsonLd';
import FreeToolsContentClient from './FreeToolsContentClient';

export const metadata: Metadata = {
  title: 'בדיקת תוכן בחינם — נתחו פוסטים, בנו פוסטים וכתבו מיילים ב-AI',
  description:
    'כלי חינמי: מדביקים פוסטים שעבדו ומגלים את הנוסחה שלהם, בונים פוסטים חדשים לפי מה שמוכח, וכותבים או משכתבים מיילים בעברית ובאנגלית. בלי הרשמה.',
  alternates: { canonical: '/free-tools/content' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'בדיקת תוכן בחינם — נוסחה לפוסטים ומיילים ב-AI',
    description: 'נתחו פוסטים מנצחים, בנו חדשים וכתבו מיילים בעברית ובאנגלית — חינם, בלי הרשמה.',
    url: '/free-tools/content',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'מה הכלי בעצם עושה?',
    a: 'שלושה דברים: (1) מנתח פוסטים שהצליחו ומחלץ את הנוסחה החוזרת שלהם; (2) בונה פוסטים חדשים לפי אותה נוסחה; (3) כותב או משכתב מיילים בעברית ובאנגלית. הכל במקום אחד, בלי הרשמה.',
  },
  {
    q: 'איך מנתחים פוסטים?',
    a: 'מדביקים 2 עד 8 פוסטים שקיבלו תגובות טובות. הכלי מפרק כל אחד ל-4 מרכיבים (פתיח, נושא, פורמט, סיום), מזהה את התבנית המשותפת, ומראה עד כמה היא עקבית ולמה היא עובדת.',
  },
  {
    q: 'התוכן נשמע כמו AI?',
    a: 'לא. הכלי בנוי לכתוב בעברית (ובאנגלית) טבעית, בלי קלישאות של AI ובלי אימוג׳ים מוגזמים — כדי שהתוכן יישמע כמוך, לא כמו רובוט.',
  },
  {
    q: 'זה עולה כסף?',
    a: 'הבדיקה והכלי חינם. אין הרשמה ואין התחייבות.',
  },
  {
    q: 'מה ההבדל בין זה לבדיקות האחרות שלכם?',
    a: 'בדיקת ה-GEO בודקת אם מנועי AI ממליצים על העסק, ובדיקת המוכנות בודקת אם המיזם מוכן לשוק. הכלי הזה מתמקד בתוכן עצמו — פוסטים ומיילים — ובנוסחה שגורמת להם לעבוד.',
  },
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

export default function FreeToolsContentPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'בדיקות חינם', url: `${SITE.url}/free-tools/content` },
            { name: 'בדיקת תוכן', url: `${SITE.url}/free-tools/content` },
          ]),
        ]}
      />
      <FreeToolsContentClient faqs={faqs} />
    </>
  );
}
