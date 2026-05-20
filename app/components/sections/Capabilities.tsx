import SectionHeader from '../SectionHeader';

const capabilities = [
  {
    name: 'פיתוח תוכנה',
    desc: 'אתרים ומערכות web, אפליקציות מובייל (iOS/Android), מערכות SaaS, אינטגרציות עם Shopify ו-WooCommerce, פתרונות AI/OCR/NLP לעיבוד מסמכים אוטומטי. מ-MVP ועד scale ב-production.',
    stack: 'Node.js · React · Angular · Python · C#/.NET · GCP · AWS · Docker · Redis',
  },
  {
    name: 'שיווק אורגני',
    desc: 'SEO טכני וקידום אורגני, תוכן ארוך עם POV, נוכחות LinkedIn לסטארטאפים ולמותגים, ניהול מועדוני לקוחות, ו-email automation. אסטרטגיה ארוכת-טווח שבונה traffic שלא נעלם כשהתקציב נגמר.',
    stack: 'Search Console · Ahrefs · Notion · Mailchimp · ActiveCampaign · GA4',
  },
  {
    name: 'קמפיינים ממומנים',
    desc: 'Google Ads (חיפוש, דיספליי, רימרקטינג), Meta Ads (Facebook + Instagram), TikTok Ads, ניהול תקציבים, tracking, attribution, ו-conversion optimization. תקציבים מ-5K עד 200K ש"ח/חודש.',
    stack: 'Google Ads · Meta Business · TikTok · GTM · GA4 · Hotjar',
  },
  {
    name: 'אסטרטגיה ו-Go-to-Market',
    desc: 'ניתוח תחרות, תכנון funnel, product-to-market fit, A/B testing מתמשך, KPI design, וצמיחה מבוססת-נתונים. הרבה פעמים זה ההבדל בין שיווק שעובד לשיווק שלא, עוד לפני שהזזנו ש"ח אחד.',
    stack: 'Jobs-to-be-Done · AARRR · ICE prioritization · OKRs',
  },
];

export default function Capabilities() {
  return (
    <section className="capabilities" id="capabilities">
      <div className="container">
        <SectionHeader
          eyebrow="מה אנחנו עושים"
          titleHtml="ארבעה תחומים.<br>בכולם מבצעים בעצמנו."
          description="בלי outsourcing לסוכנויות שיווק, בלי freelancers נסתרים שמקבלים את הקוד שלך. הקוד שלנו, הקמפיינים שלנו, האסטרטגיה שלנו. זה מה שמאפשר שכל הצדדים מדברים אחד עם השני בלי handoffs."
        />

        <div className="capabilities-grid">
          {capabilities.map((cap) => (
            <div key={cap.name} className="capability">
              <h3 className="capability-name">{cap.name}</h3>
              <p className="capability-desc">{cap.desc}</p>
              <p className="capability-stack">{cap.stack}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
