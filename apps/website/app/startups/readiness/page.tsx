import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../../components/JsonLd';
import ReadinessClient from './ReadinessClient';

export const metadata: Metadata = {
  title: 'בדיקת מוכנות למיזם בחינם, האם הסטארטאפ שלך מוכן לצאת לשוק?',
  description:
    'בדיקה חינמית ליזמים: הכניסו כתובת וגלו אם המסר שלכם ברור, מי המתחרים ואיך אתם נראים לשוק, פלוס בדיקה טכנית מלאה. תוך שניות, בלי הרשמה. ומשם לקהילת HELIX STAGE.',
  alternates: { canonical: '/startups/readiness' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'כמה הסטארטאפ שלך מוכן להשקה?',
    description:
      'בדיקת מוכנות-השקה חינמית ליזמים. ציון תוך שניות, בלי הרשמה, ומשם לקהילת HELIX STAGE.',
    url: '/startups/readiness',
    type: 'website',
  },
};

const faqs = [
  {
    q: 'מה הבדיקה בעצם בודקת?',
    a: 'מהזנת כתובת בלבד אנחנו בודקים שתי שכבות. העסקית: האם המסר ברור, מי קהל היעד, מי המתחרים בשוק ומה הפיצ׳רים הבולטים. והטכנית: מהירות, מדידה ופיקסלים, מובייל ונראות מול מנועי AI. תוך שניות אתה מקבל ציון מוכנות ורשימת פערים, בשפה פשוטה.',
  },
  {
    q: 'אני עוד לפני השקה, אין לי אתר חי, זה רלוונטי לי?',
    a: 'כן. הבדיקה שואלת קודם אם כבר השקת. אם עדיין לא, אפשר לבדוק דף נחיתה, אתר בהקמה, או אפילו עמוד "בקרוב". ואם אין עדיין כלום, זה בדיוק הרגע להצטרף לקהילת STAGE ולבנות נכון מההתחלה.',
  },
  {
    q: 'למה מפנים אותי ל-HELIX STAGE?',
    a: 'הבדיקה מודדת את הצד הטכני, אבל השקה מנצחת תלויה בדברים שרובוט לא מודד, משתמשים ראשונים, פידבק אמיתי, שותפים. את אלה סוגרים בקהילת STAGE, שחינמית ליזמים וסטארטאפים.',
  },
  {
    q: 'זה עולה כסף?',
    a: 'הבדיקה חינם וקהילת STAGE חינמית לסטארטאפים. אם בהמשך תרצה כלים מתקדמים (כמו שיפור המרות או נראות ב-AI), נמליץ עליהם רק לפי הפערים שנמצאו, בלי לחץ.',
  },
  {
    q: 'אתם נוגעים לי באתר או בקוד?',
    a: 'לא. הבדיקה היא לקריאה בלבד, אנחנו רק סורקים את הכתובת הציבורית ולא משנים כלום.',
  },
  {
    q: 'מה ההבדל בין זה לבדיקת נראות ב-AI שלכם?',
    a: 'בדיקת ה-AI מתמקדת בשאלה אם מנועי AI ממליצים על העסק. בדיקת המוכנות רחבה יותר וממוקדת ביזמים לפני/אחרי השקה, היא בוחנת אם המוצר מוכן לצאת לשוק, ומחברת אותך לקהילה שתעזור בהשקה.',
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

export default function ReadinessPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'סטארטאפים ויזמים', url: `${SITE.url}/startups` },
            { name: 'בדיקת מוכנות להשקה', url: `${SITE.url}/startups/readiness` },
          ]),
        ]}
      />
      <ReadinessClient faqs={faqs} />
    </>
  );
}
