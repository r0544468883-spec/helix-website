import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../../components/JsonLd';
import AiContextClient from './AiContextClient';

export const metadata: Metadata = {
  title: 'שאלון AI לעסק — קבלו תוכנית מותאמת לשיפור העבודה | HELIX',
  description:
    'כלי חינמי: ענו על שאלון קצר וקבלו תוכנית פעולה מותאמת אישית לשיפור העבודה עם AI — Quick Win, מה לתקן, כלים מומלצים וציון מוכנות. בונוס: קובץ אפיון לכל כלי AI. בלי הרשמה, הכל בדפדפן.',
  alternates: { canonical: '/free-tools/ai-context' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'שאלון AI לעסק — תוכנית מותאמת לשיפור העבודה עם AI',
    description: 'ענו על שאלון קצר וקבלו המלצות אישיות: מאיפה להתחיל, מה לתקן, ואילו כלים מתאימים. חינם, בלי הרשמה.',
    url: '/free-tools/ai-context',
    type: 'website',
  },
};

const faqs = [
  { q: 'מה הכלי עושה?', a: 'עונים על שאלון קצר על הארגון והמצב הנוכחי שלכם עם AI — ומקבלים תוכנית פעולה מותאמת אישית: Quick Win להתחיל ממנו, מה כדאי לתקן קודם, כלים מומלצים וציון מוכנות. בונוס: קובץ אפיון להדבקה בכל כלי AI. חינם, בלי הרשמה.' },
  { q: 'זה באמת בחינם? צריך להירשם?', a: 'חינם לגמרי, בלי הרשמה. הכל נבנה אצלכם בדפדפן. אנחנו כן מבקשים פרטי קשר בסוף כדי שנוכל להתאים לכם ליווי אם תרצו.' },
  { q: 'איפה אפשר להשתמש בקובץ הבונוס?', a: 'בכל כלי AI עם שדה הנחיות: Claude Projects, GPT מותאם, Gemini Gems — ולמפתחים, אותו קובץ בדיוק הופך ל-CLAUDE.md בקלוד קוד ול-AGENTS.md בקודקס.' },
  { q: 'לפי מה בניתם את הכלי?', a: 'לפי ההנחיות הרשמיות של Anthropic, OpenAI וגוגל לכתיבת קבצי הקשר וסוכנים — כדי שהקובץ יעבוד טוב בכל הכלים.' },
  { q: 'מה ההבדל בין זה לליווי בהטמעת AI?', a: 'זו המתנה החודשית שלנו לקהילת "מאפס ל-AI" — נקודת התחלה. הליווי המלא לוקח את הארגון הרבה מעבר: מיפוי הזדמנויות, Quick Wins, סדנאות לצוות ומדיניות אבטחת מידע.' },
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
