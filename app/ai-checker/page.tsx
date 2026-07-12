import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import AiCheckerClient from './AiCheckerClient';

export const metadata: Metadata = {
  title: 'בדיקת נראות ב-AI — האם ChatGPT ממליץ על העסק שלך?',
  description:
    'בדיקה חינמית: האם ChatGPT, Claude, Gemini ו-Perplexity מוצאים וממליצים על העסק שלך — או על המתחרה? הכניסו כתובת אתר וקבלו תוצאה תוך שניות.',
  alternates: { canonical: '/ai-checker' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'האם ChatGPT ממליץ על העסק שלך — או על המתחרה?',
    description:
      'בדיקה חינמית של נראות העסק שלך בכלי הבינה המלאכותית. תוצאות תוך שניות, ללא הרשמה.',
    url: '/ai-checker',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'מה זה אומר ש-ChatGPT "ממליץ" עליך?',
    a: 'כשלקוח שואל בינה מלאכותית "מי הכי טוב ב___ באזור שלי", היא עונה בשמות ספציפיים. אם העסק שלך לא בנוי נכון, היא לא מכירה אותך ומפנה את הלקוח למתחרה. הבדיקה מראה איפה אתה עומד.',
  },
  {
    q: 'הבדיקה באמת שואלת את הבינה המלאכותית?',
    a: 'כן. בנוסף לבדיקות טכניות של האתר, אנחנו שולחים שאלות אמיתיות ל-ChatGPT, Claude, Gemini ו-Perplexity ובודקים אם אתה מופיע בתשובה ומי כן מופיע.',
  },
  {
    q: 'זה עולה כסף?',
    a: 'הבדיקה חינם. גם האבחון הראשוני מול הצוות חינם. עובדים בלי חוזה ובלי דמי הקמה.',
  },
  {
    q: 'למה האתר שלי לא מופיע בבינה מלאכותית?',
    a: 'ברוב המקרים ככה בנויים רוב האתרים — למנועי חיפוש ישנים, לא לעולם שבו לקוחות שואלים AI. הבדיקה מראה בדיוק מה חסר, וזה כמעט תמיד ניתן לתיקון.',
  },
  {
    q: 'כמה זמן לוקח לראות תוצאות?',
    a: 'הבדיקה עצמה לוקחת שניות. תיקונים טכניים כמו llms.txt, schema וגישת בוטים משפיעים תוך שבועות ככל שהמנועים סורקים מחדש. נוכחות מלאה נבנית לאורך זמן.',
  },
  {
    q: 'מה ההבדל בין זה לבין קידום אתרים (SEO) רגיל?',
    a: 'SEO קלאסי מתמקד בדירוג בגוגל. כאן בודקים גם את השכבה החדשה — האם מנועי הבינה המלאכותית מוצאים, מבינים וממליצים עליך, עם כללים חדשים כמו llms.txt וגישת בוטים.',
  },
  {
    q: 'האם אתם משנים לי את האתר בלי אישור?',
    a: 'לא. הבדיקה היא לקריאה בלבד — לא נוגעים באתר. אם תרצה שנבצע את התיקונים, זה קורה רק אחרי תיאום מדויק מולך.',
  },
  {
    q: 'מה זה llms.txt?',
    a: 'קובץ קטן וחדש שיושב באתר ומכוון מנועי בינה מלאכותית לתוכן החשוב שלך — בערך כמו sitemap, אבל למודלים של AI. רוב האתרים עדיין בלי אחד.',
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

export default function AiCheckerPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'בדיקת נראות ב-AI', url: `${SITE.url}/ai-checker` },
          ]),
        ]}
      />
      <AiCheckerClient />
    </>
  );
}
