import SectionHeader from '../SectionHeader';

const capabilities = [
  {
    name: 'בניית אתרים',
    price: '500',
    desc: 'אתר עסקי, דף נחיתה, חנות eCommerce, או אתר תדמית. עיצוב, פיתוח, תוכן, ו-SEO בסיסי. עולה לאוויר ועובד.',
    icon: '01',
  },
  {
    name: 'שיווק דיגיטלי',
    price: '500',
    desc: 'קמפיינים ב-Google, Meta, TikTok. SEO אורגני, תוכן, ניהול סושיאל. דוחות שקופים עם מספרים אמיתיים, לא impressions.',
    icon: '02',
  },
  {
    name: 'אוטומציה שיווקית ומכירתית',
    price: '500',
    desc: 'חיבור CRM, email automation, תהליכי lead nurturing, ו-funnel אוטומטי. פחות עבודה ידנית, יותר לידים שמתקדמים לבד.',
    icon: '03',
  },
  {
    name: 'מערך פיתוח עסקי אוטומטי',
    price: '500',
    desc: 'אסטרטגיית מכירות דיגיטלית + חיבור ותחזוק כלל הכלים: Data Enrichment, LinkedIn Sales Navigator, CRM, ועוד. SDR שעובד 24/7.',
    icon: '04',
  },
  {
    name: 'פיתוח תוכנה',
    price: '500',
    desc: 'אפליקציות web ומובייל, מערכות SaaS, אינטגרציות, ופתרונות AI בהתאמה אישית. מ-MVP ועד production.',
    icon: '05',
  },
];

export default function Capabilities() {
  return (
    <section className="capabilities" id="capabilities">
      <div className="container">
        <SectionHeader
          eyebrow="מה אנחנו עושים"
          titleHtml="חמישה שירותים.<br>500 &#8362; לחודש כל אחד."
          description="בינה מלאכותית חתכה לנו את שעות העבודה. במקום לשבת על ההפרש, העברנו אותו אליכם. כל שירות כולל הכל, בלי הפתעות."
        />

        <div className="capabilities-grid">
          {capabilities.map((cap) => (
            <div key={cap.name} className="capability">
              <div className="capability-icon">{cap.icon}</div>
              <h3 className="capability-name">{cap.name}</h3>
              <p className="capability-desc">{cap.desc}</p>
              <div className="capability-price">{cap.price} &#8362;/חודש</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
