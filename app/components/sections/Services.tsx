import SectionHeader from '../SectionHeader';
import { SITE } from '@/lib/site';

const paths = [
  {
    name: 'Helix Audit',
    title: 'אבחון מקיף',
    fit: 'כשמשהו לא עובד אבל לא ברור מה. כש-2-3 ספקים מאשימים אחד את השני. כשרוצים שמישהו יסתכל מבחוץ ויאמר את האמת.',
    items: [
      'מסמך עם תמונת מצב מלאה',
      'תעדוף של 3 פעולות בעלות ROI גבוה',
      'שיחת סיכום של שעה',
      'אופציה להמשיך או לקחת ולעצור',
    ],
    cta: 'דבר איתנו על Audit',
  },
  {
    name: 'Helix Launch',
    title: 'פרויקט ממוקד',
    fit: 'כשיש לך משימה ברורה: השקת מוצר, פיצ׳ר חדש, פתיחת קמפיין מ-0, מיגרציה. אתה יודע מה אתה רוצה — לא בטוח איך לבצע.',
    items: [
      'המשימה — מוכנה, עובדת, מתועדת',
      'אפיון כתוב לפני התחלה',
      'סטטוס שבועי לכל אורך הפרויקט',
      'בלי scope creep · בלי הפתעות',
    ],
    cta: 'דבר איתנו על Launch',
  },
  {
    name: 'Helix Grow',
    title: 'שותפות חודשית',
    fit: 'כשאתה צריך שותף קבוע, לא ספק. כשמעטפת מלאה — dev + organic + paid — תחת קורת גג אחת תפתור הרבה כאבי ראש. כשעייפת מספקים מתחלפים.',
    items: [
      'מעטפת מלאה: dev + organic + paid',
      'שיחת סטטוס שבועית מתועדת',
      'דוחות חודשיים, מספרים אמיתיים',
      'אחראי אחד על הצמיחה שלך',
    ],
    cta: 'דבר איתנו על Grow',
  },
];

export default function Services() {
  return (
    <section className="paths" id="paths">
      <div className="container">
        <SectionHeader
          eyebrow="שירותים"
          titleHtml="שלושה שירותים<br>אפשריים."
          description="בסוף השיחה הראשונה, אנחנו יחד מבינים איזה שירות מתאים. רוב הלקוחות מתחילים ב-Audit ועוברים ל-Grow אחרי 60-90 יום, אבל אין חוקים קבועים."
        />

        <div className="paths-grid">
          {paths.map((path) => (
            <div key={path.name} className="path-card">
              <div className="path-name">{path.name}</div>
              <h3 className="path-title">{path.title}</h3>

              <div className="path-section">
                <div className="path-section-label">מתי זה מתאים</div>
                <p className="path-fit">{path.fit}</p>
              </div>

              <div className="path-section">
                <div className="path-section-label">מה תקבל</div>
                <ul className="path-list">
                  {path.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <a
                href={SITE.calendlyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="path-cta"
              >
                {path.cta} <span className="btn-arrow">←</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
