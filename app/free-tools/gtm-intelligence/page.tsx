import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, softwareApplicationSchema } from '@/lib/schema';
import JsonLd from '../../components/JsonLd';
import GtmIntelligenceClient from './GtmIntelligenceClient';

// HowTo boosts AEO/GEO, answer engines quote the numbered steps directly.
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'איך בונים מודיעין GTM בחינם',
  description: 'מודיעין GTM מלא בכמה שאלות: ICP, מודל TAM, תדריך יעד ו-battlecard מול מתחרה.',
  inLanguage: 'he-IL',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'עונים על כמה שאלות', text: 'מה אתם מוכרים, למי, מה השוק, גודל העסקה, ואם יש חברה או מתחרה לתחקיר.' },
    { '@type': 'HowToStep', position: 2, name: 'הצוות מריץ את המודיעין', text: 'היוצר בונה ICP, מודל TAM, תדריך יעד ו-battlecard, והמבקר בודק כל טענה ומספר.' },
    { '@type': 'HowToStep', position: 3, name: 'מקבלים דוח GTM', text: 'ציון מודיעין, ICP חד, גודל שוק בשקלים, תדריך יעד ו-battlecard, עם מהלכים.' },
  ],
};

export const metadata: Metadata = {
  title: 'מודיעין GTM בחינם: ICP, TAM, תחקיר מתחרה',
  description:
    'כלי חינמי: עונים על כמה שאלות על העסק, וצוות סוכנים בונה מודיעין GTM מלא, ICP חד, מודל TAM עם גודל שוק בשקלים, תדריך על חברת יעד ו-battlecard מול מתחרה, בלי נתונים מומצאים. בלי הרשמה.',
  alternates: { canonical: '/free-tools/gtm-intelligence' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'מודיעין GTM בחינם: ICP, TAM, תחקיר מתחרה',
    description: 'מודיעין GTM מלא בכמה שאלות: ICP, TAM בשקלים, תדריך יעד ו-battlecard מול מתחרה. חינם, בלי הרשמה.',
    url: '/free-tools/gtm-intelligence',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'מה הכלי בעצם עושה?',
    a: 'עונים על כמה שאלות על העסק, השוק וגודל העסקה, וצוות סוכנים בונה מודיעין GTM מלא: פרופיל לקוח אידיאלי (ICP) עם פירמוגרפיה ופרסונות, מודל TAM עם גודל שוק בשקלים, ואם נתתם חברת יעד או מתחרה, גם תדריך חשבון ו-battlecard מולו, עם מהלכים קונקרטיים.',
  },
  {
    q: 'מה ההבדל בין ICP ל-TAM?',
    a: 'ICP הוא פרופיל הלקוח האידיאלי, מי בדיוק צריך לקנות מכם ולמה, כולל מי לא מתאים. TAM הוא גודל השוק, כמה חברות כאלה יש וכמה כסף הן שוות. ICP אומר למי לפנות, TAM אומר כמה גדול הפוטנציאל. הכלי בונה את שניהם ביחד, כי ICP בלי גודל שוק הוא ניחוש.',
  },
  {
    q: 'איך אתם מונעים תשובות מומצאות?',
    a: 'הכלי בנוי כצוות: מייקר בונה את המודיעין, ומבקר בודק כל טענה אחריו. כל מתחרה, מספר או לקוח שהמנוע העלה מעצמו עובר ל-"נתונים טעונים אימות", מספרי TAM מסומנים כהערכות עם הנחות, והראיה מופרדת מההסקה. שם יעד שאתם נותנים נשאר כפי שנתתם, ולא ממציאים שמות אנשים.',
  },
  {
    q: 'זה עולה כסף?',
    a: 'הבדיקה חינם, שני ניתוחים מלאים בלי עלות ובלי התחייבות. צריך רק להשאיר אימייל.',
  },
  {
    q: 'התוכן נשמע כמו AI?',
    a: 'לא. הדוח נכתב בעברית טבעית ודוגרי, בלי קלישאות של AI ובלי מקף ארוך, כדי שיישמע כמו אנליסט אמיתי ולא כמו רובוט.',
  },
  {
    q: 'מה ההבדל בין זה לכלים האחרים שלכם?',
    a: 'כלי הבידול עונה על השאלה איפה היתרון שלכם. הכלי הזה עונה על השאלה למי למכור ומול מי אתם עומדים: ICP, TAM ו-battlecard. כלי המייל הקר לוקח את המודיעין הזה והופך אותו להודעת פתיחה. שלושתם עובדים על אותו עסק, זה אחרי זה.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function FreeToolsGtmIntelligencePage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          howToSchema,
          softwareApplicationSchema({
            name: 'מודיעין GTM, HELIX',
            description: 'כלי חינמי שבונה מודיעין GTM מלא (ICP, TAM, תדריך יעד ו-battlecard מול מתחרה) ומחזיר ציון מודיעין וגודל שוק בשקלים.',
            path: '/free-tools/gtm-intelligence',
            price: 'חינם',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'בדיקות חינם', url: `${SITE.url}/free-tools/gtm-intelligence` },
            { name: 'מודיעין GTM', url: `${SITE.url}/free-tools/gtm-intelligence` },
          ]),
        ]}
      />
      <GtmIntelligenceClient faqs={faqs} />
    </>
  );
}
