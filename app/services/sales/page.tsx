import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'תהליכי מכירה אוטומטיים', description: 'SDR אוטומטי. Data Enrichment, LinkedIn Sales Navigator, Outreach. 500 ₪ לחודש.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על תהליכי מכירה אוטומטיים')}`;

export default function SalesPage() {
  return (
    <div className="service-page">
      <section className="sp-hero"><div className="container">
        <p className="sp-eyebrow">חבילה 05</p>
        <h1 className="sp-title">SDR שעובד 24/7.<br />בלי להגדיל צוות.</h1>
        <p className="sp-subtitle">לידים B2B חמים לא מגיעים מקמפיינים. הם מגיעים מ-outreach חכם, data enrichment, ו-LinkedIn. בנינו מערך שעושה את זה אוטומטית.</p>
        <div className="sp-price-badge"><span className="sp-market-price">בשוק: 8,000–15,000 ₪</span><span className="sp-our-price">500 ₪ <small>/ לחודש</small></span></div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
      </div></section>

      <section className="sp-section"><div className="container">
        <h2 className="sp-section-title">הבעיה שאתה מכיר</h2>
        <div className="sp-pain-grid">
          <div className="sp-pain-card"><h3>SDR עולה 15,000 ש"ח בחודש</h3><p>גייסת איש מכירות. הוא לומד 3 חודשים. מתחיל להניב. ואז עוזב. מתחילים מחדש.</p></div>
          <div className="sp-pain-card"><h3>Outreach ביד</h3><p>שולח הודעות LinkedIn אחת אחת. 20 ביום. מתוכן 2 עונים. זה לא scalable.</p></div>
          <div className="sp-pain-card"><h3>אין Pipeline אמיתי</h3><p>יודע שיש "כמה לידים" אבל אין מערכת שמראה לך בדיוק מה הסטטוס של כל ליד.</p></div>
        </div>
      </div></section>

      <section className="sp-section sp-section-alt"><div className="container">
        <h2 className="sp-section-title">מה כלול</h2>
        <div className="sp-features-grid">
          <div className="sp-feature"><div className="sp-feature-num">01</div><h3>אסטרטגיית מכירות דיגיטלית</h3><p>מגדירים ICP, מסרים, ערוצים. יודעים למי פונים ולמה.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">02</div><h3>Data Enrichment + LinkedIn Sales Navigator</h3><p>מוצאים את האנשים הנכונים, מעשירים את הנתונים, ומכינים רשימות ממוקדות.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">03</div><h3>תהליכי SDR אוטומטיים</h3><p>Outreach sequences שרצים לבד. הודעות, follow-ups, תזכורות. בלי שתיגע.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">04</div><h3>ניהול Pipeline אוטומטי</h3><p>CRM מסודר. כל ליד יודע איפה הוא. אתה יודע מה הצעד הבא.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">05</div><h3>פגישה שבועית + דוח חודשי</h3><p>30 דקות כל שבוע. דוח מפורט כל חודש.</p></div>
        </div>
      </div></section>

      <section className="sp-section"><div className="container">
        <h2 className="sp-section-title">למי זה מתאים</h2>
        <div className="sp-for-grid">
          <div className="sp-for-card sp-for-yes"><h3>מתאים</h3><ul><li>עסקי B2B שרוצים לידים בלי להגדיל צוות</li><li>יועצים ופרילנסרים שרוצים לקוחות חדשים</li><li>סטארטאפים בשלב מכירות ראשוניות</li></ul></div>
          <div className="sp-for-card sp-for-no"><h3>לא מתאים</h3><ul><li>B2C (קהל צרכנים רחב)</li><li>עסקים בלי הגדרה ברורה של לקוח יעד</li></ul></div>
        </div>
      </div></section>

      <section className="sp-section"><div className="container"><div className="sp-trust-bar"><span>✓ בלי חוזה</span><span>✓ ביטול בכל עת</span><span>✓ מיפוי ICP ראשוני חינם</span></div></div></section>

      <section className="sp-section sp-final-cta"><div className="container">
        <h2 className="sp-section-title">500 ₪ לחודש. מערך מכירות אוטומטי.</h2>
        <p className="sp-lead">שלחו הודעה בוואטסאפ.</p>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
      </div></section>
    </div>
  );
}
