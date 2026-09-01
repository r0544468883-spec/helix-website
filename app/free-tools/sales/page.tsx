import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, softwareApplicationSchema } from '@/lib/schema';
import JsonLd from '../../components/JsonLd';
import SalesClient from './SalesClient';

// HowTo boosts AEO/GEO, answer engines quote the numbered steps directly.
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'איך בונים פלייבוק מכירות בחינם',
  description: 'פלייבוק מכירות מלא בכמה שאלות, ICP, משפך, ANUM, הודעות פנייה ותסריט שיחה טלפונית.',
  inLanguage: 'he-IL',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'עונים על כמה שאלות', text: 'מה אתם מוכרים, למי, גודל עסקה, אילו ערוצים ואיזו הוכחה יש לכם.' },
    { '@type': 'HowToStep', position: 2, name: 'הצוות בונה את הפלייבוק', text: 'היוצר בונה ICP, משפך, ANUM, ערוצים, הודעות ותסריט שיחה, והמבקר בודק כל טענה.' },
    { '@type': 'HowToStep', position: 3, name: 'מקבלים פלייבוק מוכן', text: 'ציון מוכנות מכירה, משפך עם טריגרים, רצף לינקדאין, מייל, התנגדויות ותסריט שיחה טלפונית.' },
  ],
};

export const metadata: Metadata = {
  title: 'בדיקת מכירות בחינם, פלייבוק ותסריט שיחה ב-AI',
  description:
    'כלי חינמי: עונים על כמה שאלות על העסק, וצוות סוכנים בונה פלייבוק מכירות מלא, ICP, משפך עם טריגרים, ANUM, הודעות פנייה בלינקדאין ובמייל, טיפול בהתנגדויות ותסריט שיחה טלפונית. בלי הרשמה.',
  alternates: { canonical: '/free-tools/sales' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'בדיקת מכירות בחינם, פלייבוק ותסריט שיחה ב-AI',
    description: 'פלייבוק מכירות מלא בכמה שאלות: ICP, משפך, ANUM, הודעות פנייה ותסריט שיחה. חינם, בלי הרשמה.',
    url: '/free-tools/sales',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'מה הכלי בעצם עושה?',
    a: 'עונים על כמה שאלות על העסק, וצוות סוכנים בונה פלייבוק מכירות מלא: הגדרת ICP והכאב, מפת מקבלי החלטות, משפך עם טריגר לכל מעבר, שער ANUM, מתמטיקת פייפליין, תוכנית ערוצים, רצף פנייה בלינקדאין ובמייל, טיפול בהתנגדויות, ותסריט שיחה טלפונית מותאם.',
  },
  {
    q: 'למה רצף לינקדאין ולא הודעה אחת?',
    a: 'כי לזרוק הצעה בהודעה הראשונה, מה שנקרא pitch slap, מוריד את שיעור התגובה. הכלי בונה רצף rapport-first: חימום אמיתי, בקשת חיבור בלי הצעה, הודעת ערך, ורק אז בקשת הפניה. ככה נבנה קשר לפני הבקשה.',
  },
  {
    q: 'מה עם חוק הספאם בישראל?',
    a: 'הכלי כולל הערת §30א כנה. החוק חל על וואטסאפ, סמס וגם מייל, עם חשיפה של עד 1000 שקל להודעה ובלי פטור גורף ל-B2B. לכן פנייה קרה בוואטסאפ היא הסיכון הגבוה, ולינקדאין הוא הנמוך ביותר בפועל אך לא פטור. הכלי לא ימליץ לכם על ערוץ שמסכן אתכם.',
  },
  {
    q: 'איך אתם מונעים תשובות מומצאות?',
    a: 'הכלי בנוי כצוות: מייקר בונה, ומבקר בודק אחריו, מסמן את מספרי הפייפליין כהנחה לאימות, מוודא שהלינקדאין rapport-first, ומסמן כל מתחרה לא מאומת. בלי מספרים מומצאים ובלי שמות בדויים.',
  },
  {
    q: 'זה עולה כסף?',
    a: 'הבדיקה חינם, שני פלייבוקים מלאים בלי עלות ובלי התחייבות. צריך רק להשאיר אימייל.',
  },
  {
    q: 'מה ההבדל בין זה לכלי הבידול שלכם?',
    a: 'כלי הבידול עונה על השאלה איפה היתרון שלכם. הכלי הזה עונה על השאלה איך מוכרים אותו. הרבה עסקים מריצים קודם את הבידול, ואז את המכירות על אותו עסק.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function FreeToolsSalesPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          howToSchema,
          softwareApplicationSchema({
            name: 'בדיקת מכירות, פלייבוק ותסריט שיחה, HELIX',
            description: 'כלי חינמי שבונה פלייבוק מכירות מלא, ICP, משפך, ANUM, הודעות פנייה בלינקדאין ובמייל, טיפול בהתנגדויות ותסריט שיחה טלפונית.',
            path: '/free-tools/sales',
            price: 'חינם',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'בדיקות חינם', url: `${SITE.url}/free-tools/sales` },
            { name: 'בדיקת מכירות', url: `${SITE.url}/free-tools/sales` },
          ]),
        ]}
      />
      <SalesClient faqs={faqs} />
    </>
  );
}
