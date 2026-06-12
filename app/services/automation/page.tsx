import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'אוטומציות', description: 'מיפוי תהליכים, CRM, Email Automation, Funnel אוטומטי. 500 ₪ לחודש. בלי חוזה.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אוטומציה')}`;

export default function AutomationPage() {
  return (
    <div className="service-page">
      <section className="sp-hero"><div className="container">
        <p className="sp-eyebrow">חבילה 03</p>
        <h1 className="sp-title">שהמכונה תעבוד בשבילך.<br />לא ההפך.</h1>
        <p className="sp-subtitle">יש לך CRM שאף אחד לא משתמש בו? תהליכי מכירה שרצים ביד? לידים שנופלים בין הכיסאות? זה בדיוק מה שאנחנו מסדרים.</p>
        <div className="sp-price-badge"><span className="sp-market-price">בשוק: 4,000–7,000 ₪</span><span className="sp-our-price">500 ₪ <small>/ לחודש</small></span></div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
      </div></section>

      <section className="sp-section"><div className="container">
        <h2 className="sp-section-title">הבעיה שאתה מכיר</h2>
        <div className="sp-pain-grid">
          <div className="sp-pain-card"><h3>לידים שנעלמים</h3><p>מילאו טופס באתר. אף אחד לא חזר אליהם בזמן. עד שהתפנית, הם כבר סגרו עם מישהו אחר.</p></div>
          <div className="sp-pain-card"><h3>CRM ריק או בלאגן</h3><p>קנית מערכת ב-200 דולר לחודש. אף אחד בצוות לא מזין נתונים. המערכת ריקה, ואתה חוזר לאקסל.</p></div>
          <div className="sp-pain-card"><h3>הכל ידני</h3><p>שולח מיילים ביד, מעדכן סטטוסים ביד, עוקב אחרי לידים ביד. יש לך עסק, לא משרד דואר.</p></div>
        </div>
      </div></section>

      <section className="sp-section sp-section-alt"><div className="container">
        <h2 className="sp-section-title">מה כלול</h2>
        <div className="sp-features-grid">
          <div className="sp-feature"><div className="sp-feature-num">01</div><h3>מיפוי תהליכים</h3><p>יושבים איתך, מבינים את ה-flow, ומזהים איפה אוטומציה תחסוך הכי הרבה זמן.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">02</div><h3>הטמעת CRM + Email + Lead Nurturing</h3><p>מחברים את הכלים. מגדירים את התהליכים. מוודאים שזה עובד.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">03</div><h3>Funnel אוטומטי מקצה לקצה</h3><p>מהרגע שליד נכנס, דרך nurturing, ועד סגירה. בלי שתיגע.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">04</div><h3>מעקב ואופטימיזציה שוטפת</h3><p>לא רק מקימים ועוזבים. עוקבים, מודדים, משפרים.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">05</div><h3>פגישה שבועית + דוח חודשי</h3><p>30 דקות כל שבוע. דוח מפורט כל חודש.</p></div>
        </div>
      </div></section>

      <section className="sp-section"><div className="container">
        <h2 className="sp-section-title">למי זה מתאים</h2>
        <div className="sp-for-grid">
          <div className="sp-for-card sp-for-yes"><h3>מתאים</h3><ul><li>עסקים שעושים הכל ביד ורוצים להפסיק</li><li>מי שיש לו CRM אבל לא משתמש בו</li><li>עסקים עם תהליך מכירה שחוזר על עצמו</li></ul></div>
          <div className="sp-for-card sp-for-no"><h3>לא מתאים</h3><ul><li>עסקים בלי תהליך מכירה ברור</li><li>מי שרוצה "רק לחבר Zapier"</li></ul></div>
        </div>
      </div></section>

      <section className="sp-section sp-section-alt"><div className="container">
        <h2 className="sp-section-title">אפשר להוסיף</h2>
        <div className="sp-addons-table">
          <div className="sp-addon-row"><span>איסוף לידים ל-Google Sheets</span><b>350 ₪</b></div>
          <div className="sp-addon-row"><span>חיבור לידים ל-CRM (Monday, HubSpot, Pipedrive)</span><b>החל מ-650 ₪</b></div>
          <div className="sp-addon-row"><span>הקמת מערכת דיוור (SendPulse)</span><b>750 ₪</b></div>
          <div className="sp-addon-row"><span>בניית סדרת אימיילים</span><b>350 ₪ / שעה</b></div>
        </div>
      </div></section>

      <section className="sp-section"><div className="container"><div className="sp-trust-bar"><span>✓ בלי חוזה</span><span>✓ ביטול בכל עת</span><span>✓ מיפוי ראשוני חינם</span></div></div></section>

      <section className="sp-section sp-final-cta"><div className="container">
        <h2 className="sp-section-title">500 ₪ לחודש. אוטומציה מלאה.</h2>
        <p className="sp-lead">שלחו הודעה בוואטסאפ. בלי טפסים, בלי המתנה.</p>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
      </div></section>
    </div>
  );
}
