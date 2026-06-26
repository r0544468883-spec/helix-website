'use client';

import SectionHeader from '../SectionHeader';
import ScrollTextHighlight from '../ScrollTextHighlight';

interface Resource {
  href: string;
  name: string;
  desc: string;
  link: string;
  external?: boolean;
}

const resources: Resource[] = [
  {
    href: '/articles',
    name: 'מאמרים',
    desc: 'טקסטים ארוכים על פיתוח, שיווק, אסטרטגיה, ועל איך לנהל פרויקטים בלי שיתמוטטו. בלי "10 טיפים" וקליקבייט - רק נושאים אמיתיים בעומק.',
    link: 'לכל המאמרים ←',
  },
  {
    href: '/podcast',
    name: 'פודקאסט',
    desc: 'שיחות עם founders ובעלי עסקים ישראלים על מה באמת קורה מאחורי הקלעים. אין "סיפורי הצלחה" - יש דיונים אמיתיים על מה עבד, מה לא, ולמה.',
    link: 'לכל הפרקים ←',
  },
  {
    href: 'https://www.linkedin.com/in/eranlipi/',
    name: 'LinkedIn',
    desc: 'העדכונים הכי תכופים. רעיונות, תובנות, סיפורי מקרים קצרים מהיומיום. הכי קל לעקוב בלי commitment.',
    link: 'לפרופיל ←',
    external: true,
  },
];

export default function Resources() {
  return (
    <section className="resources" id="resources">
      <div className="container">
        <SectionHeader
          eyebrow="תוכן ומקורות"
          titleHtml="קצת רקע לפני<br>שאנחנו נדבר."
          description="ערוצים שדרכם אפשר להבין איך אנחנו חושבים על דברים. רובם בעברית, אבל יש גם תוכן באנגלית. הכל חינמי."
        />

        <ScrollTextHighlight className="resources-list" dimOpacity={0.15} blurAmount={1}>
          {resources.map((r) => (
            <a
              key={r.name}
              href={r.href}
              className="resource-item"
              {...(r.external && { target: '_blank', rel: 'noopener noreferrer' })}
            >
              <div className="resource-content">
                <h3 className="resource-name">{r.name}</h3>
                <p className="resource-desc">{r.desc}</p>
              </div>
              <span className="resource-link">{r.link}</span>
            </a>
          ))}
        </ScrollTextHighlight>
      </div>
    </section>
  );
}
