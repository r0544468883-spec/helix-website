import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, contentPageSchema } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import ScrollReveal from '../../components/ScrollReveal';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'נתונים: שיווק, SEO וחיפוש AI',
  description: 'הנתונים שמאחורי המעבר לחיפוש AI ולזירו-קליק, ולמה לעסק קטן אין זמן לשיווק. כל נתון עם מקור, תאריך וקישור.',
  alternates: { canonical: '/learn/stats' },
};

// Every stat carries a NAMED source + date + link (methodology §3.6). Honesty rule:
// nothing here is invented — each number is quoted from the cited public study.
type Stat = { value: string; claim: string; source: string; date: string; url: string };

const STATS: Stat[] = [
  {
    value: '58.5%',
    claim: 'מחיפושי הגוגל בארה"ב הסתיימו בלי אף קליק. אם אתם לא הופכים לתשובה עצמה, אתם פשוט לא נראים.',
    source: 'SparkToro, מחקר Zero-Click (Rand Fishkin)',
    date: '2024',
    url: 'https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/',
  },
  {
    value: '360 מ-1,000',
    claim: 'רק 360 מכל 1,000 חיפושי גוגל בארה"ב מגיעים לאתר חיצוני. השאר נשארים בתוך גוגל או נגמרים בלי קליק.',
    source: 'SparkToro, מחקר Zero-Click',
    date: '2024',
    url: 'https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/',
  },
  {
    value: '~30%',
    claim: 'מהקליקים בחיפוש בארה"ב הולכים לנכסים של גוגל עצמה (YouTube, Maps, Images). התחרות על תשומת הלב קשה מתמיד.',
    source: 'SparkToro, מחקר Zero-Click',
    date: '2024',
    url: 'https://sparktoro.com/blog/2024-zero-click-search-study-for-every-1000-us-google-searches-only-374-clicks-go-to-the-open-web-in-the-eu-its-360/',
  },
  {
    value: '~75%',
    claim: 'מתנועת ההפניות ממנועי AI מגיעה מ-ChatGPT, ואחריו Gemini ו-Perplexity. אם ה-AI לא מכיר אתכם, אתם לא בשיחה.',
    source: 'Goodie, דוח AI Referral Traffic',
    date: '2026',
    url: 'https://higoodie.com/blog/ai-search-traffic-report-2026/',
  },
  {
    value: '56%',
    claim: 'מהעסקים הקטנים מדווחים שיש להם שעה ביום או פחות לשיווק. הזמן, לא הרעיונות, הוא צוואר הבקבוק.',
    source: 'Constant Contact, Small Business Now',
    date: '2024',
    url: 'https://www.constantcontact.com/blog/small-business-now-2024/',
  },
  {
    value: '51%',
    claim: 'מבעלי העסקים הקטנים ציינו את הפרסום ברשתות החברתיות כמשימה שהכי גוזלת להם זמן.',
    source: 'Constant Contact, Small Business Now',
    date: '2024',
    url: 'https://www.constantcontact.com/blog/small-business-now-2024/',
  },
];

export default function StatsPage() {
  const url = `${SITE.url}/learn/stats`;
  return (
    <>
      <JsonLd
        data={[
          contentPageSchema({
            name: 'נתונים: שיווק, SEO וחיפוש AI',
            description: 'נתונים מתוארכים על חיפוש AI, זירו-קליק וזמן שיווק בעסק קטן, כל אחד עם מקור וקישור.',
            path: '/learn/stats',
          }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'מרכז הלמידה', url: `${SITE.url}/learn` },
            { name: 'נתונים', url },
          ]),
        ]}
      />

      <ScrollReveal direction="up">
        <div className="page-header container">
          <h1>הנתונים שמאחורי המהלך</h1>
          <p className="page-header-sub">
            למה חיפוש עובר ל-AI, למה קידום אורגני כבר לא מספיק, ולמה לעסק קטן אין זמן לשיווק. כל נתון עם מקור, תאריך וקישור. בלי מספרים מומצאים.
          </p>
        </div>
      </ScrollReveal>

      <div className="container">
        <div className="article-tldr" data-role="tldr" style={{ maxWidth: 720, margin: '0 auto 32px' }}>
          <span className="article-tldr-label">בקצרה</span>
          <p>
            כמעט 6 מכל 10 חיפושי גוגל נגמרים בלי קליק, יותר ויותר אנשים שואלים AI במקום גוגל, ולמרבית העסקים הקטנים יש שעה ביום או פחות לשיווק. שלושת אלה יחד הם בדיוק הסיבה לצוות סוכנים שמבצע, ולנוכחות גם בגוגל וגם במנועי ה-AI.
          </p>
        </div>

        <ScrollReveal className="stats-grid" direction="up" stagger staggerDelay={0.07}>
          {STATS.map((s, i) => (
            <div key={i} className="stat-fact">
              <div className="stat-fact-value">{s.value}</div>
              <p className="stat-fact-claim">{s.claim}</p>
              <a href={s.url} target="_blank" rel="noopener noreferrer" className="stat-fact-source">
                {s.source} · {s.date}
              </a>
            </div>
          ))}
        </ScrollReveal>

        <div className="learn-bridge">
          <span>עוד באתר:</span>
          <Link href="/learn">מרכז הלמידה</Link>
          <Link href="/compare">השוואות</Link>
        </div>
      </div>
    </>
  );
}
