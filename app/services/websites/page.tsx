import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'אתרים ואיקומרס',
  description: 'אפיון, עיצוב, פיתוח ותחזוקה. אתר תדמית, חנות, דף נחיתה. 500 ₪ לחודש. בלי דמי הקמה.',
};

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת אתרים')}`;

export default function WebsitesPage() {
  return (
    <div className="service-page">
      <section className="sp-hero">
        <div className="container">
          <p className="sp-eyebrow">חבילה 02</p>
          <h1 className="sp-title">אתר שעובד בשבילך.<br />לא אתר שיושב בפינה.</h1>
          <p className="sp-subtitle">
            שילמת 12,000 ש"ח על אתר שהיה "כמעט מוכן" חודשיים? אצלנו האתר עולה לאוויר, מביא לקוחות, ונשאר חי. תחזוקה, עדכונים, וגיבויים כלולים. בלי דמי הקמה.
          </p>
          <div className="sp-price-badge">
            <span className="sp-market-price">בשוק: 8,000–15,000 ₪ חד פעמי</span>
            <span className="sp-our-price">500 ₪ <small>/ לחודש</small></span>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
        </div>
      </section>

      <section className="sp-section">
        <div className="container">
          <h2 className="sp-section-title">הבעיה שאתה מכיר</h2>
          <div className="sp-pain-grid">
            <div className="sp-pain-card"><h3>האתר "כמעט מוכן" כבר חודשיים</h3><p>הספק נעלם לשבוע, חזר עם תירוצים, והחשבון עלה ב-50%. אתה עדיין בלי אתר.</p></div>
            <div className="sp-pain-card"><h3>האתר עלה. ואז מה?</h3><p>שילמת על בנייה, אבל אף אחד לא דיבר על תחזוקה. עכשיו האתר איטי, לא מעודכן, ואתה לא יודע מי אחראי.</p></div>
            <div className="sp-pain-card"><h3>אתר יפה, אפס תנועה</h3><p>עיצוב יפהפה. אבל אף אחד לא הסביר שאתר בלי SEO ובלי שיווק זה שלט חוצות במדבר.</p></div>
          </div>
        </div>
      </section>

      <section className="sp-section sp-section-alt">
        <div className="container">
          <h2 className="sp-section-title">מה כלול</h2>
          <div className="sp-features-grid">
            <div className="sp-feature"><div className="sp-feature-num">01</div><h3>אפיון ואסטרטגיית אתר</h3><p>מבינים מה האתר צריך לעשות בשבילך לפני שמתחילים לבנות.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">02</div><h3>עיצוב UX/UI ופיתוח מלא</h3><p>עיצוב שנראה טוב ועובד טוב. רספונסיבי, מהיר, ממיר.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">03</div><h3>חנות eCommerce · דף נחיתה · אתר תדמית</h3><p>לא משנה מה צריך. בונים את מה שמתאים לך, לא את מה שנוח לנו.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">04</div><h3>פיקסלים, אוטומציות ו-WhatsApp</h3><p>הכל מחובר מיום ראשון. פיקסלים של גוגל ומטא, טפסים, וואטסאפ.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">05</div><h3>SEO בסיסי + תחזוקה שוטפת</h3><p>האתר לא רק עולה. הוא נשאר חי: עדכונים, גיבויים, אבטחה.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">06</div><h3>פגישה שבועית + דוח חודשי</h3><p>30 דקות כל שבוע. דוח מפורט כל חודש.</p></div>
          </div>
        </div>
      </section>

      <section className="sp-section">
        <div className="container">
          <h2 className="sp-section-title">למי זה מתאים</h2>
          <div className="sp-for-grid">
            <div className="sp-for-card sp-for-yes"><h3>מתאים</h3><ul><li>עסקים חדשים שצריכים אתר מקצועי</li><li>עסקים עם אתר ישן שצריך עדכון</li><li>חנויות שרוצות למכור אונליין</li><li>מי שצריך דף נחיתה לקמפיין</li></ul></div>
            <div className="sp-for-card sp-for-no"><h3>לא מתאים</h3><ul><li>פלטפורמות SaaS מורכבות (זה פיתוח בהתאמה)</li><li>מי שרוצה "רק עיצוב" בלי אסטרטגיה</li></ul></div>
          </div>
        </div>
      </section>

      <section className="sp-section sp-section-alt">
        <div className="container">
          <h2 className="sp-section-title">אפשר להוסיף</h2>
          <div className="sp-addons-table">
            <div className="sp-addon-row"><span>עמוד אינטרנט נוסף</span><b>480 ₪</b></div>
            <div className="sp-addon-row"><span>הקמת תשתית בלוג</span><b>550 ₪</b></div>
            <div className="sp-addon-row"><span>תרגום שפה לעמוד</span><b>480 ₪ / עמוד</b></div>
            <div className="sp-addon-row"><span>תחזוקה מורחבת חודשית</span><b>350 ₪ / חודש</b></div>
            <div className="sp-addon-row"><span>פיתוח WordPress</span><b>220 ₪ / שעה</b></div>
            <div className="sp-addon-row"><span>פיתוח בקוד</span><b>450 ₪ / שעה</b></div>
          </div>
        </div>
      </section>

      <section className="sp-section">
        <div className="container"><div className="sp-trust-bar"><span>✓ בלי חוזה</span><span>✓ בלי דמי הקמה</span><span>✓ ביטול בכל עת</span><span>✓ תחזוקה כלולה</span></div></div>
      </section>

      <section className="sp-section sp-final-cta">
        <div className="container">
          <h2 className="sp-section-title">500 ₪ לחודש. אתר מלא + תחזוקה.</h2>
          <p className="sp-lead">שלחו הודעה בוואטסאפ. בלי טפסים, בלי המתנה.</p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
        </div>
      </section>
    </div>
  );
}
