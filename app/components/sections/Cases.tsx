import SectionHeader from '../SectionHeader';

interface CaseEntry {
  sector: string;
  title: string;
  desc: string;
  metric: { number?: string; text: string };
}

const cases: CaseEntry[] = [
  {
    sector: 'Wedding-tech · matchme.co.il',
    title: 'פלטפורמת לידים חכמה לספקי חתונות',
    desc: 'התאמה אלגוריתמית בין זוגות לספקי חתונות לפי סגנון, תקציב, וצרכים — לידים חמים בלבד, בלי spam. שאלון מותאם, מנוע התאמה, ופאנל ניהול לספק.',
    metric: { text: 'פעיל באוויר, פתוח לרישום ספקים וזוגות' },
  },
  {
    sector: 'AR / Mobile · Show-me',
    title: 'אפליקציית AR לעיצוב פרגולות וחוץ',
    desc: 'אפליקציה שמאפשרת ללקוחות להציב מודלים תלת-ממדיים של פרגולות ועיצובי גן בגינה דרך הטלפון. פיתוח iOS ו-Android, כולל pipeline למודלים.',
    metric: { text: 'בייצור' },
  },
  {
    sector: 'DTC / Brand · Conchi',
    title: 'e-commerce ומותג חוסן רגשי לילדים',
    desc: 'מערכת רגשית לילדים שמשלבת בובה פיזית עם תכנים דיגיטליים. בניית חנות eCommerce, אפיון מוצר, ועיצוב מותג.',
    metric: { text: 'חנות פעילה עם הזמנות שוטפות' },
  },
  {
    sector: 'Fintech · OM1000',
    title: 'leadgen + content לייעוץ משכנתאות',
    desc: 'אתר ייעוץ פיננסי המכסה איחוד הלוואות, מסורבי בנק, משכנתאות עסקיות, וגיל השלישי. מערך leadgen, בלוג מקצועי, וקורסים מקוונים.',
    metric: { text: 'פעיל עם leadgen ועם קורסים בתשלום' },
  },
];

export default function Cases() {
  return (
    <section className="cases">
      <div className="container">
        <SectionHeader
          eyebrow="לקוחות"
          title="עבדנו עם."
          description="פלטפורמות, מותגי DTC, ושירותים — סקטורים שונים לחלוטין. המכנה המשותף: צריכים גם מוצר וגם שיווק שעובדים יחד."
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
