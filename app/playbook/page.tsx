import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, faqSchema, contentPageSchema } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import ScrollReveal from '../components/ScrollReveal';
import FAQItem from '../components/FAQItem';
import NewsletterForm from '../articles/NewsletterForm';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'המדריך התפעולי לצוות עם סוכני AI',
  description: 'איך מריצים שיווק, מכירות ותוכן עם צוות סוכני AI, בלי לאבד שליטה. 6 עקרונות תפעול ו-12 workflows מוכנים לעבודת סוכנות אמיתית.',
  alternates: { canonical: '/playbook' },
};

const CHAPTERS: { n: string; title: string; text: string }[] = [
  { n: '01', title: 'למה סוכן נתקע', text: 'לא חוסר אינטליגנציה, אלא הסביבה סביבו: הרשאות, הקשר, וגבול אישור לא ברור.' },
  { n: '02', title: 'משימה אחת, מקצה לקצה', text: 'בוחרים משימה חוזרת אחת בעלת ערך, ומריצים אותה עד הסוף לפני שמרחיבים.' },
  { n: '03', title: 'המבקר שפוסל', text: 'סוכן נפרד מהכותב שתפקידו היחיד לפסול, זה מה שמונע תוכן גנרי ופעולה שגויה.' },
  { n: '04', title: 'מתג אוטונומיה', text: 'המלצה, אישור, או אוטופיילוט, לכל סוג פעולה בנפרד. ברירת מחדל בטוחה תמיד.' },
  { n: '05', title: 'הקשר לפני יכולת', text: 'סוכן טוב שלא יודע את הלקוח, המותג והגבולות, יעשה עבודה גנרית מהר.' },
  { n: '06', title: 'שקיפות שמבדלת', text: 'להגיד מה המערכת לא פותרת. זה בונה אמון יותר מכל הבטחה.' },
];

const WORKFLOWS: { group: string; items: string[] }[] = [
  { group: 'תוכן ו-SEO', items: ['תכנון אשכול תוכן (עוגן + לוויינים)', 'כתיבת מאמר אנושי לפי תבנית', 'מעקב דירוגים וציטוטי AI', 'תיקון עמוד שדועך'] },
  { group: 'שיווק וקמפיינים', items: ['בריף אחד לקמפיין רב-ערוצי', 'עשרות וריאציות A/B', 'הזזת תקציב למנצחים', 'דוח White-Label ללקוח'] },
  { group: 'מכירות ותפעול', items: ['מחקר ליד ואיתור פרטים', 'טיוטת פנייה ראשונה מותאמת', 'סנכרון CRM ואיכות דאטה', 'דייג׳סט מדדים לוואטסאפ'] },
];

const FAQ = [
  { q: 'המדריך בתשלום?', a: 'לא. הוא חינם וזמין כאן במלואו. אפשר גם להשאיר מייל ולקבל עדכון כשמתווספים workflows חדשים.' },
  { q: 'זה מתאים גם לעסק קטן?', a: 'כן. העקרונות זהים בין סוכנות גדולה לעסק של אדם אחד. מתחילים ממשימה חוזרת אחת ומרחיבים.' },
  { q: 'צריך ידע טכני כדי ליישם?', a: 'לא כדי להבין את המדריך. כדי להריץ בפועל, HELIX עושה את ההטמעה, אתם מאשרים.' },
  { q: 'מאיזה workflow כדאי להתחיל?', a: 'מהמשימה החוזרת שגוזלת לכם הכי הרבה זמן ובעלת ערך ברור, למשל תכנון אשכול תוכן או דוח ביצועים. מריצים אותה מקצה לקצה עם אישור, ורק כשהיא יציבה מרחיבים לעוד workflow.' },
];

export default function PlaybookPage() {
  const url = `${SITE.url}/playbook`;
  return (
    <>
      <JsonLd
        data={[
          contentPageSchema({ name: 'המדריך התפעולי לצוות עם סוכני AI', description: 'איך עוברים מ-AI שממליץ לצוות סוכנים שמסיים עבודה אמיתית, בלי לאבד שליטה.', path: '/playbook' }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'המדריך התפעולי', url },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <article className="article-single">
        <div className="container container-narrow">
          <div className="article-meta">
            <span className="category">מדריך תפעולי</span>
            <span className="dot">·</span>
            <span>קריאה חופשית, בלי טופס</span>
          </div>
          <h1>המדריך התפעולי לצוות עם סוכני AI</h1>
          <p className="article-lede">איך עוברים מ-AI שממליץ לצוות סוכנים שמסיים עבודה אמיתית, בלי לאבד שליטה.</p>

          <div className="article-tldr" data-role="tldr">
            <span className="article-tldr-label">בקצרה</span>
            <p>סוכני AI לא נתקעים בגלל חוסר חוכמה, אלא בגלל הסביבה סביבם: הרשאות, הקשר וגבול אישור. המדריך נותן 6 עקרונות תפעול ו-12 workflows מוכנים, מתוכם מתחילים ממשימה חוזרת אחת עם מבקר שפוסל ומתג אוטונומיה בטוח.</p>
          </div>

          <div className="article-body">
            <h2>העקרונות</h2>
            <p>סוכן AI חוסם לא כי הוא לא חכם מספיק, אלא כי הסביבה סביבו לא בנויה לתת לו לפעול בבטחה. אלה העקרונות שמשנים את זה.</p>
          </div>

          <ScrollReveal className="playbook-grid" direction="up" stagger staggerDelay={0.06}>
            {CHAPTERS.map((c) => (
              <div key={c.n} className="playbook-card">
                <span className="playbook-card-n">{c.n}</span>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </div>
            ))}
          </ScrollReveal>

          <div className="article-body">
            <h2>קטלוג ה-workflows</h2>
            <p>עבודת סוכנות אמיתית, לא הדגמות. אלה זרימות עבודה שהצוות מריץ בפועל, בשליטת מתג אוטונומיה.</p>
          </div>

          <ScrollReveal className="playbook-workflows" direction="up" stagger staggerDelay={0.08}>
            {WORKFLOWS.map((w) => (
              <div key={w.group} className="playbook-wf-col">
                <h3>{w.group}</h3>
                <ul>
                  {w.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </ScrollReveal>

          <div className="article-faq">
            <h2>שאלות ותשובות</h2>
            <div className="faq-list">
              {FAQ.map((f, i) => (
                <FAQItem key={i} question={f.q}>{f.a}</FAQItem>
              ))}
            </div>
          </div>

          <div className="article-cta" data-role="cta">
            <h2>רוצים שנטמיע workflow אחד אצלכם?</h2>
            <p>נבחר איתכם משימה חוזרת אחת, נחבר, ונראה אותה רצה בפועל בשליטתכם, לפני שמרחיבים.</p>
            <a href={SITE.calendlyUrl} className="btn btn-primary" target="_blank" rel="noopener noreferrer">
              לקביעת שיחה
            </a>
            <Link href="/learn" className="article-back">← למרכז הלמידה</Link>
          </div>
        </div>
      </article>

      <section className="newsletter">
        <div className="container">
          <h2>workflows חדשים לאימייל</h2>
          <p>נעדכן כשמתווספים workflows ועדכונים למדריך. בלי spam.</p>
          <NewsletterForm />
          <p className="newsletter-note">בכל רגע אפשר להסיר את עצמך. כתובת האימייל לא תופץ.</p>
        </div>
      </section>
    </>
  );
}
