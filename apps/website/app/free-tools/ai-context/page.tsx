import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../../components/JsonLd';
import AiContextClient from './AiContextClient';

export const metadata: Metadata = {
  title: 'אבחון AI לעסק בחינם, כמה אתם מוכנים ל-AI? | HELIX',
  description:
    'אבחון מקצועי חינמי: ענו על שאלון קצר (כלים, CRM, אוטומציות, דאטה, ממשל) וקבלו דוח בשלות AI, ציון ב-5 מימדים, 3 ההזדמנויות הגדולות שלכם ותוכנית 90 יום. בונוס: קובץ אפיון לכל כלי AI. בלי הרשמה.',
  alternates: { canonical: '/free-tools/ai-context' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'אבחון AI לעסק בחינם, דוח בשלות + תוכנית 90 יום',
    description: 'שאלון מקצועי על פני 5 מימדים → ציון בשלות, 3 הזדמנויות ותוכנית פעולה. חינם, בלי הרשמה.',
    url: '/free-tools/ai-context',
    type: 'website',
  },
};

const faqs = [
  { q: 'מה הכלי עושה?', a: 'אבחון AI מקצועי לעסק: עונים על שאלון קצר (על העסק, הכלים, ה-CRM, האוטומציות, הדאטה והממשל) ומקבלים דוח בשלות, ציון ב-5 מימדים, 3 ההזדמנויות הגדולות שלכם עם פתרון מומלץ לכל אחת, ותוכנית 90 יום. בונוס: קובץ אפיון להדבקה בכל כלי AI. חינם, בלי הרשמה.' },
  { q: 'זה באמת בחינם? צריך להירשם?', a: 'חינם לגמרי, בלי הרשמה. הכל נבנה אצלכם בדפדפן. אנחנו כן מבקשים פרטי קשר בסוף כדי שנוכל להתאים לכם ליווי אם תרצו.' },
  { q: 'איפה אפשר להשתמש בקובץ הבונוס?', a: 'בכל כלי AI עם שדה הנחיות: Claude Projects, GPT מותאם, Gemini Gems, ולמפתחים, אותו קובץ בדיוק הופך ל-CLAUDE.md בקלוד קוד ול-AGENTS.md בקודקס.' },
  { q: 'לפי מה בניתם את הכלי?', a: 'לפי ההנחיות הרשמיות של Anthropic, OpenAI וגוגל לכתיבת קבצי הקשר וסוכנים, כדי שהקובץ יעבוד טוב בכל הכלים.' },
  { q: 'מה ההבדל בין זה לליווי בהטמעת AI?', a: 'זו המתנה החודשית שלנו לקהילת "מאפס ל-AI", נקודת התחלה. הליווי המלא לוקח את הארגון הרבה מעבר: מיפוי הזדמנויות, Quick Wins, סדנאות לצוות ומדיניות אבטחת מידע.' },
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

export default function AiContextPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'בדיקות חינם', url: `${SITE.url}/free-tools/ai-context` },
            { name: 'קובץ אפיון ל-AI', url: `${SITE.url}/free-tools/ai-context` },
          ]),
        ]}
      />
      <AiContextClient />
    </>
  );
}
