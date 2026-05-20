import SectionHeader from '../SectionHeader';

const resources = [
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
    href: '#',
    name: 'ערוץ יוטיוב',
    desc: 'סרטונים קצרים (5-15 דקות) על נושאים טכניים: איך מקימים קמפיין Google Ads ראשון, איך בונים funnel ב-WooCommerce, איך מטמיעים OCR ב-Python.',
    link: 'לערוץ ←',
  },
  {
    href: '#',
    name: 'LinkedIn',
    desc: 'העדכונים הכי תכופים. רעיונות, תובנות, סיפורי מקרים קצרים מהיומיום. הכי קל לעקוב בלי commitment.',
    link: 'לפרופיל ←',
  },
];

export default function Resources() {
  return (
    <section className="resources" id="resources">
      <div className="container">
        <SectionHeader
          eyebrow="תוכן ומקורות"
          titleHtml="קצת רקע לפני<br>שאנחנו נדבר."
          description="ארבעה ערוצים שדרכם אפשר להבין איך אנחנו חושבים על דברים. רובם בעברית, אבל יש גם תוכן באנגלית. הכל חינמי."
        />

        <div className="resources-list">
          {resources.map((r) => (
            <a key={r.name} href={r.href} className="resource-item">
              <div className="resource-content">
                <h3 className="resource-name">{r.name}</h3>
                <p className="resource-desc">{r.desc}</p>
              </div>
              <span className="resource-link">{r.link}</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
