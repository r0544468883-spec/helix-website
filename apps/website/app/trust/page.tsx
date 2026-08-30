import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { breadcrumbSchema, faqSchema, contentPageSchema } from '@/lib/schema';
import JsonLd from '@/app/components/JsonLd';
import ScrollReveal from '../components/ScrollReveal';
import FAQItem from '../components/FAQItem';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'שקיפות ואמון',
  description: 'מה HELIX עושה, מה הוא במפורש לא עושה, ואיך אנחנו שומרים על הדאטה שלכם. בלי תגי-אבטחה שלא הרווחנו.',
  alternates: { canonical: '/trust' },
};

const DOES = [
  'מריץ עבודה חוזרת בשליטתכם, עם מתג אוטונומיה שברירת המחדל שלו בטוחה.',
  'מעביר כל תוכן וכל פעולה דרך מבקר נפרד שפוסל לפני שמשהו יוצא בשמכם.',
  'שומר בידוד per-workspace: הדאטה של כל לקוח נפרדת.',
  'מאפשר להריץ את מנוע ה-AI מקומית (Ollama) כך שהתוכן לא יוצא מהעסק.',
];

const DOESNT = [
  'לא מפרסם לרשת או מוציא כסף בלי הפעלה מפורשת שלכם.',
  'לא נועל אתכם: התוכן והדאטה שלכם, ואתם יכולים לקחת אותם.',
  'לא מתיימר להחליף שיקול דעת אנושי, אסטרטגיה או יחסי לקוח.',
  'לא טוען לתקנים שלא עברנו. אין לנו כרגע SOC 2 או ISO, ואנחנו אומרים את זה בקול.',
];

const DATA = [
  { k: 'תוכן ודאטה עסקית', v: 'ב-Supabase עם בידוד per-site, ואפשרות להרצה מקומית דרך Ollama.' },
  { k: 'סודות וחיבורים', v: 'נשמרים מוצפנים, לא נחשפים בתוך התוכן שנוצר.' },
  { k: 'מה עוזב את העסק', v: 'רק מה שאתם מאשרים לפרסום. שאר העבודה נשארת אצלכם.' },
];

const FAQ = [
  { q: 'יש לכם תקני אבטחה רשמיים?', a: 'כרגע לא SOC 2 ולא ISO 27001, ואנחנו לא מתחזים לכאלה. מה שיש: בידוד per-site, הצפנת סודות, ואפשרות הרצה מקומית. לצוותי אבטחה נענה על שאלון ישירות.' },
  { q: 'הדאטה שלי משמשת לאימון מודלים?', a: 'לא. הדאטה שלכם היא שלכם. אפשר גם להריץ את מנוע ה-AI מקומית כך שהתוכן לא יוצא מהעסק בכלל.' },
  { q: 'מה קורה אם אני עוזב?', a: 'לוקחים את התוכן והדאטה. אין נעילה, וזה במכוון, לקוח שנשאר כי הוא לא יכול לצאת הוא לא לקוח מרוצה.' },
  { q: 'מי רואה את הפעולות שהמערכת עושה בשמי?', a: 'רק אתם. כל פעולה נרשמת ביומן פר-workspace שנשאר אצלכם, ומתג האוטונומיה קובע מה רץ לבד ומה ממתין לאישורכם. אין צד שלישי שמציץ בעבודה או בתוצאות.' },
];

export default function TrustPage() {
  const url = `${SITE.url}/trust`;
  return (
    <>
      <JsonLd
        data={[
          contentPageSchema({ name: 'שקיפות ואמון', description: 'מה HELIX עושה, מה הוא במפורש לא עושה, ואיך אנחנו שומרים על הדאטה שלכם.', path: '/trust' }),
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'שקיפות ואמון', url },
          ]),
          faqSchema(FAQ),
        ]}
      />

      <article className="article-single">
        <div className="container container-narrow">
          <div className="article-meta">
            <span className="category">שקיפות</span>
          </div>
          <h1>שקיפות ואמון</h1>
          <p className="article-lede">אמון לא בונים עם תגי-אבטחה. בונים עם מה שאתם באמת אומרים, כולל מה שאתם לא עושים.</p>

          <div className="article-tldr" data-role="tldr">
            <span className="article-tldr-label">בקצרה</span>
            <p>HELIX מריץ עבודה חוזרת בשליטתכם, עם מבקר שפוסל ומתג אוטונומיה בטוח, ובידוד דאטה per-site עם אפשרות הרצה מקומית. מה שאנחנו לא עושים: לא מפרסמים בלי אישור, לא נועלים אתכם, ולא טוענים לתקנים שלא עברנו.</p>
          </div>

          <ScrollReveal className="trust-cols" direction="up" stagger staggerDelay={0.1}>
            <div className="trust-col trust-does">
              <h2>מה אנחנו עושים</h2>
              <ul>
                {DOES.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
            <div className="trust-col trust-doesnt" data-role="limits">
              <h2>מה אנחנו לא עושים</h2>
              <ul>
                {DOESNT.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          </ScrollReveal>

          <div className="article-body">
            <h2>איך הדאטה שלכם מטופלת</h2>
          </div>
          <div className="trust-table-wrap">
            <table className="compare-table">
              <tbody>
                {DATA.map((d) => (
                  <tr key={d.k}>
                    <th scope="row">{d.k}</th>
                    <td>{d.v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="article-faq">
            <h2>שאלות ותשובות</h2>
            <div className="faq-list">
              {FAQ.map((f, i) => (
                <FAQItem key={i} question={f.q}>{f.a}</FAQItem>
              ))}
            </div>
          </div>

          <div className="article-cta" data-role="cta">
            <h2>יש לכם שאלת אבטחה או פרטיות?</h2>
            <p>נענה ישירות, כולל שאלון אבטחה אם הצוות שלכם צריך. בלי תשובות מעורפלות.</p>
            <a href={`mailto:${SITE.email}`} className="btn btn-primary">לכתוב לנו</a>
            <Link href="/learn" className="article-back">← למרכז הלמידה</Link>
          </div>
        </div>
      </article>
    </>
  );
}
