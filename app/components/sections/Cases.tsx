import SectionHeader from '../SectionHeader';

interface CaseEntry {
  sector: string;
  title: string;
  desc: string;
  metric: { number?: string; text: string };
}

const cases: CaseEntry[] = [
  {
    sector: 'B2B2C App · [TBD סקטור]',
    title: 'פיתוח מלא + השקה ראשונה',
    desc: 'בנינו backend, frontend, ופתחנו את קמפיין הרכישה הראשון. ליווי מ-MVP עד product-market-fit.',
    metric: { number: '[X]K', text: 'משתמשים פעילים תוך [X] חודשים' },
  },
  {
    sector: 'Datashop.co.il · המוצר שלנו',
    title: 'פלטפורמת ניהול מלאי + AI',
    desc: 'פלטפורמה משלנו שמשתלבת עם WooCommerce ו-Shopify, עם OCR מבוסס AI שסורק תעודות משלוח אוטומטית.',
    metric: { text: 'בייצור עם לקוחות משלמים מרובים' },
  },
  {
    sector: 'Hospitality · רשת בתי קפה',
    title: 'מערכת ניהול רב-סניפית',
    desc: 'מערכת ניהול ל-[X] סניפים עם קטגוריזציית קבלות מבוססת AI ודוחות מאוחדים בזמן אמת.',
    metric: { number: '[X]', text: 'שעות אדמין חודשיות נחסכו' },
  },
  {
    sector: 'Non-Profit · עמותה ארצית',
    title: 'אתר + קמפיין גיוס תרומות',
    desc: 'בניית אתר מאפס + הפעלת קמפיין גיוס תרומות ב-Google ו-Meta, עם funnel מותאם לקהל היעד.',
    metric: { number: '[X]%', text: 'עליה ב-conversion rate ב-90 יום' },
  },
];

export default function Cases() {
  return (
    <section className="cases">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות"
          title="עבדנו עם."
          description="עסקים בגדלים ובסקטורים שונים — מעמותות עד B2B תעשייה — עם מכנה משותף אחד: צריכים גם מוצר וגם שיווק שעובדים יחד."
        />

        <div className="cases-grid">
          {cases.map((c) => (
            <div key={c.title} className="case-card">
              <div className="case-sector">{c.sector}</div>
              <h3 className="case-title">{c.title}</h3>
              <p className="case-desc">{c.desc}</p>
              <div className="case-metric">
                {c.metric.number && <span className="number">{c.metric.number}</span>}
                {c.metric.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
