import SectionHeader from '../SectionHeader';

interface CaseEntry {
  sector: string;
  title: string;
  brand: string;
  desc: string;
  tags: string[];
  metric: string;
  gradient: string;
}

const cases: CaseEntry[] = [
  {
    sector: 'Wedding-tech',
    brand: 'MatchMe',
    title: 'פלטפורמת לידים חכמה לספקי חתונות',
    desc: 'התאמה אלגוריתמית בין זוגות לספקים לפי סגנון, תקציב, וצרכים. לידים חמים בלבד. שאלון מותאם, מנוע התאמה, ופאנל ניהול.',
    tags: ['#פיתוח', '#UX', '#אוטומציה', '#לידים'],
    metric: 'פעיל באוויר · matchme.co.il',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
  },
  {
    sector: 'AR / Mobile',
    brand: 'Show-me',
    title: 'אפליקציית AR לעיצוב פרגולות וחוץ',
    desc: 'אפליקציה שמאפשרת ללקוחות להציב מודלים תלת-ממדיים של פרגולות בגינה דרך הטלפון. iOS ו-Android, כולל pipeline למודלים.',
    tags: ['#מובייל', '#AR', '#3D', '#UX'],
    metric: 'בייצור',
    gradient: 'linear-gradient(135deg, #1A1A1A 0%, #374151 50%, #4B5563 100%)',
  },
  {
    sector: 'DTC / Brand',
    brand: 'Conchi',
    title: 'e-commerce ומותג חוסן רגשי לילדים',
    desc: 'מערכת רגשית לילדים שמשלבת בובה פיזית עם תכנים דיגיטליים. חנות eCommerce, אפיון מוצר, ועיצוב מותג שלם.',
    tags: ['#eCommerce', '#מיתוג', '#Shopify', '#תוכן'],
    metric: 'חנות פעילה עם הזמנות שוטפות',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)',
  },
  {
    sector: 'Fintech',
    brand: 'OM1000',
    title: 'leadgen + content לייעוץ משכנתאות',
    desc: 'אתר ייעוץ פיננסי: איחוד הלוואות, מסורבי בנק, משכנתאות עסקיות. מערך leadgen מלא, בלוג מקצועי, וקורסים מקוונים.',
    tags: ['#לידים', '#SEO', '#תוכן', '#קורסים'],
    metric: 'פעיל עם leadgen וקורסים בתשלום',
    gradient: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 50%, #38BDF8 100%)',
  },
];

export default function Cases() {
  return (
    <section className="cases-sefi" id="cases">
      <div className="container">
        <SectionHeader
          eyebrow="פרויקטים"
          titleHtml="עבדנו עם."
          description="סקטורים שונים. מכנה משותף אחד: צריכים גם מוצר וגם שיווק שעובדים יחד."
        />
      </div>

      <div className="cases-sefi-list">
        {cases.map((c, i) => (
          <div key={c.brand} className="case-sefi-card" style={{ background: c.gradient }}>
            <div className="container case-sefi-inner">
              <div className="case-sefi-content">
                <span className="case-sefi-sector">{c.sector}</span>
                <h3 className="case-sefi-brand">{c.brand}</h3>
                <p className="case-sefi-title">{c.title}</p>
                <p className="case-sefi-desc">{c.desc}</p>
                <div className="case-sefi-tags">
                  {c.tags.map((t) => <span key={t} className="case-sefi-tag">{t}</span>)}
                </div>
                <div className="case-sefi-metric">{c.metric}</div>
              </div>
              <div className="case-sefi-visual">
                <div className="case-sefi-number">{String(i + 1).padStart(2, '0')}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
