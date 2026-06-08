import SectionHeader from '../SectionHeader';
import { SITE } from '@/lib/site';

const whatsappHref = (msg: string) =>
  `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;

const corePackages = [
  {
    tag: 'חבילה 01',
    name: 'שיווק דיגיטלי · Hands-on',
    pitch: 'מאסטרטגיה ועד ביצוע. אנחנו לא רק ממליצים, אנחנו מריצים.',
    items: [
      'אסטרטגיית שיווק, מחקר קהלים ומסרים',
      'ניהול קמפיינים: Google · Meta · TikTok',
      'SEO אורגני + GEO (אופטימיזציה למנועי AI)',
      'ניהול סושיאל, תוכן וקריאייטיב',
      'דוחות שקופים: לידים ומכירות, לא impressions',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    price: '500',
    cta: 'דברו איתנו על שיווק',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת השיווק',
  },
  {
    tag: 'חבילה 02',
    name: 'אתרים ואיקומרס',
    pitch: 'מאסטרטגיה ועד תחזוקה שוטפת. האתר עולה לאוויר ונשאר חי.',
    items: [
      'אפיון ואסטרטגיית אתר / חנות',
      'עיצוב UX/UI ופיתוח מלא',
      'חנות eCommerce · דף נחיתה · אתר תדמית',
      'חיבור פיקסלים, אוטומציות ו-WhatsApp',
      'SEO בסיסי + תחזוקה, עדכונים וגיבויים שוטפים',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    price: '500',
    cta: 'דברו איתנו על אתרים',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אתרים',
  },
  {
    tag: 'חבילה 03',
    name: 'אוטומציה',
    pitch: 'מאסטרטגיה, דרך הטמעה, ועד ניהול שוטף של כל התהליך.',
    items: [
      'מיפוי תהליכים ואסטרטגיית אוטומציה',
      'הטמעת כלים: CRM · Email Automation · Lead Nurturing',
      'בניית Funnel אוטומטי מקצה לקצה',
      'חיבור Data Enrichment ו-LinkedIn Sales Navigator',
      'מעקב, ניהול ואופטימיזציה שוטפת',
      'דוח חודשי מפורט',
      'פגישה שבועית של 30 דקות',
    ],
    price: '500',
    cta: 'דברו איתנו על אוטומציה',
    ctaMsg: 'שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אוטומציה',
  },
];

export default function Services() {
  return (
    <section className="paths" id="packages">
      <div className="container">
        <SectionHeader
          eyebrow="החבילות"
          titleHtml="שלוש חבילות ליבה.<br>500 &#8362; לחודש כל אחת."
          description="בינה מלאכותית חתכה לנו את שעות העבודה. במקום לשבת על ההפרש, העברנו אותו אליכם. כל חבילה כוללת הכל, מאסטרטגיה ועד ביצוע. בלי הפתעות."
        />

        <div className="paths-grid">
          {corePackages.map((pkg) => (
            <div key={pkg.tag} className="path-card">
              <div className="path-card-header">
                <div className="path-name">{pkg.tag}</div>
                <h3 className="path-title">{pkg.name}</h3>
                <p className="path-pitch">{pkg.pitch}</p>
              </div>
              <div className="path-card-body">
                <ul className="path-list">
                  {pkg.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="path-price">{pkg.price} &#8362; <small>/ לחודש</small></div>
                <a
                  href={whatsappHref(pkg.ctaMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="path-cta-btn"
                >
                  דברו איתנו בוואטסאפ
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pk-divider">חבילות נוספות</div>

        <div className="paths-grid paths-grid-2">
          <div className="path-card">
            <div className="path-card-header">
              <div className="path-name">גישה לתוכנות</div>
              <h3 className="path-title">הכלים של HELIX</h3>
              <p className="path-pitch">התוכנות שכבר בנינו ושנמשיך לבנות. בתשלום חודשי, בלי לפתח מאפס.</p>
            </div>
            <div className="path-card-body">
              <ul className="path-list">
                <li>גישה מלאה לתוכנה, כולל עדכונים ותמיכה</li>
                <li>לדוגמה: Datashop — ניהול מלאי לאיקומרס עם AI</li>
                <li>ניתן להכין פיצ׳רים נוספים בהתאמה אישית</li>
                <li>דוח חודשי מפורט</li>
                <li>פגישה שבועית של 30 דקות</li>
              </ul>
              <div className="path-price-rows">
                <div className="path-price-row"><span>תוכנה בודדת</span><b>500 &#8362; / חודש</b></div>
                <div className="path-price-row"><span>חבילת 3 תוכנות</span><b>1,000 &#8362; / חודש</b></div>
              </div>
              <a
                href={whatsappHref('שלום, ראיתי את helix.co.il ורציתי לשמוע על התוכנות')}
                target="_blank"
                rel="noopener noreferrer"
                className="path-cta-btn"
              >
                דברו איתנו בוואטסאפ
              </a>
            </div>
          </div>

          <div className="path-card">
            <div className="path-card-header">
              <div className="path-name">פיתוח בהתאמה</div>
              <h3 className="path-title">בנק שעות פיתוח ואפיון</h3>
              <p className="path-pitch">לתוכנות ואפליקציות בהתאמה אישית. גמיש לפי הצורך שלכם.</p>
            </div>
            <div className="path-card-body">
              <ul className="path-list">
                <li>שעות פיתוח ואפיון לפי בנק שעות</li>
                <li>MVP · פיצ׳ר חדש · אינטגרציה · אפליקציה</li>
                <li>מתאים כשיש משימה ברורה ולא בטוחים איך לבצע</li>
                <li>דוח חודשי מפורט</li>
                <li>פגישה שבועית של 30 דקות</li>
              </ul>
              <div className="path-price">לפי הצעה <small>· נסגר בשיחה</small></div>
              <a
                href={whatsappHref('שלום, ראיתי את helix.co.il ורציתי לשמוע על פיתוח בהתאמה')}
                target="_blank"
                rel="noopener noreferrer"
                className="path-cta-btn"
              >
                דברו איתנו בוואטסאפ
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
