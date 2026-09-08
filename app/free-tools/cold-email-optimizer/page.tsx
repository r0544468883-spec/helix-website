import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, softwareApplicationSchema } from '@/lib/schema';
import JsonLd from '../../components/JsonLd';
import ColdEmailClient from './ColdEmailClient';

// HowTo boosts AEO/GEO, answer engines quote the numbered steps directly.
const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'איך בודקים מייל קר בחינם',
  description: 'מדביקים מייל קר ומקבלים ציון לפי חמישה מדדים, תיקונים קונקרטיים, מייל כתוב מחדש ושורות נושא חזקות יותר.',
  inLanguage: 'he-IL',
  step: [
    { '@type': 'HowToStep', position: 1, name: 'מדביקים את המייל', text: 'את המייל הקר שכתבתם כולל שורת הנושא, למי הוא נשלח ומה המטרה.' },
    { '@type': 'HowToStep', position: 2, name: 'הצוות מדרג וכותב מחדש', text: 'היוצר מדרג את המייל על חמישה מדדים וכותב אותו מחדש, והמבקר בודק כל תיקון.' },
    { '@type': 'HowToStep', position: 3, name: 'מקבלים דוח מלא', text: 'ציון לפי מדד, תיקונים קונקרטיים, מייל כתוב מחדש, שורות נושא ודגלים אדומים של ספאם.' },
  ],
};

export const metadata: Metadata = {
  title: 'בדיקת מייל קר בחינם: ציון, תיקונים ושורות נושא',
  description:
    'כלי חינמי: מדביקים מייל קר וצוות סוכנים מדרג אותו על חמישה מדדים, נותן תיקונים קונקרטיים, מייל כתוב מחדש ושורות נושא חזקות יותר, ומסמן דגלים אדומים של ספאם. בלי הרשמה.',
  alternates: { canonical: '/free-tools/cold-email-optimizer' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'בדיקת מייל קר בחינם: ציון, תיקונים ושורות נושא',
    description: 'מדביקים מייל קר ומקבלים ציון לפי חמישה מדדים, תיקונים קונקרטיים, מייל כתוב מחדש ושורות נושא. חינם, בלי הרשמה.',
    url: '/free-tools/cold-email-optimizer',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'מה הכלי בעצם עושה?',
    a: 'מדביקים מייל קר שכתבתם, אומרים למי הוא נשלח ומה המטרה, וצוות סוכנים מדרג אותו על חמישה מדדים: נושא, פתיח, רלוונטיות ופרסונליזציה, CTA ואורך וקריאוּת. אחר כך מקבלים תיקונים קונקרטיים, מייל כתוב מחדש, 6 עד 8 שורות נושא חזקות יותר, ודגלים אדומים של מסירוּת וספאם.',
  },
  {
    q: 'לפי אילו מדדים אתם מדרגים?',
    a: 'חמישה מדדים שקובעים אם מייל קר יקבל תגובה: שורת הנושא (האם בכלל יפתחו), הפתיח (האם ימשיכו לקרוא), רלוונטיות ופרסונליזציה (האם זה מרגיש אליהם או טמפלייט), ה-CTA (האם הבקשה קטנה וברורה), והאורך והקריאוּת. כל מדד מקבל ציון וגם אבחון קונקרטי.',
  },
  {
    q: 'למה חשוב לתקן דווקא את שורת הנושא?',
    a: 'שורת הנושא קובעת אם המייל בכלל נפתח. אפשר לכתוב את הגוף הכי טוב בעולם, אם השורה כללית או נשמעת כמו מכירה, הוא נשאר סגור. לכן הכלי מציע 6 עד 8 חלופות ספציפיות, בלי מילות ספאם ובלי clickbait.',
  },
  {
    q: 'איך אתם מונעים תשובות מומצאות?',
    a: 'הכלי בנוי כצוות: מייקר מדרג וכותב מחדש, ומבקר בודק אחריו, מוודא שכל תיקון קונקרטי ולא עצה כללית, שהכתיבה מחדש דוגרי, ושאין עובדות מומצאות על הנמען. כל הנחה על הנמען מסומנת בנפרד ולא נכתבת כעובדה.',
  },
  {
    q: 'התוכן נשמע כמו AI?',
    a: 'לא. המייל שכתוב מחדש ושורות הנושא נכתבים בעברית טבעית ודוגרי, בלי קלישאות של AI ובלי מקף ארוך, כדי שיישמע כמו בן אדם ולא כמו רובוט.',
  },
  {
    q: 'זה עולה כסף?',
    a: 'הבדיקה חינם, שלוש בדיקות מלאות בלי עלות ובלי התחייבות. צריך רק להשאיר אימייל.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
};

export default function FreeToolsColdEmailOptimizerPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          howToSchema,
          softwareApplicationSchema({
            name: 'בדיקת מייל קר, HELIX',
            description: 'כלי חינמי שמדרג מייל קר על חמישה מדדים ומחזיר ציון, תיקונים קונקרטיים, מייל כתוב מחדש ושורות נושא חזקות יותר.',
            path: '/free-tools/cold-email-optimizer',
            price: 'חינם',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'בדיקות חינם', url: `${SITE.url}/free-tools/cold-email-optimizer` },
            { name: 'בדיקת מייל קר', url: `${SITE.url}/free-tools/cold-email-optimizer` },
          ]),
        ]}
      />
      <ColdEmailClient faqs={faqs} />
    </>
  );
}
