import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'שיווק דיגיטלי · Hands-on',
  description: 'מאסטרטגיה ועד ביצוע. קמפיינים, SEO, סושיאל, תוכן. 500 ₪ לחודש. בלי חוזה.',
};

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על חבילת השיווק')}`;

export default function MarketingPage() {
  return (
    <div className="service-page">
      <section className="sp-hero">
        <div className="container">
          <p className="sp-eyebrow">חבילה 01</p>
          <h1 className="sp-title">שיווק דיגיטלי שעובד.<br />לא שיווק שנראה טוב בדוח.</h1>
          <p className="sp-subtitle">
            שילמת 5,000 ש"ח בחודש על סוכנות שיווק וקיבלת דוח עם impressions? אצלנו אתה יודע בדיוק כמה לידים הגיעו, מאיפה, ובכמה. בלי גרפים יפים שמסתירים תוצאות עלובות.
          </p>
          <div className="sp-price-badge">
            <span className="sp-market-price">בשוק: 5,000–8,000 ₪</span>
            <span className="sp-our-price">500 ₪ <small>/ לחודש</small></span>
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
        </div>
      </section>

      <section className="sp-section">
        <div className="container">
          <h2 className="sp-section-title">הבעיה שאתה מכיר</h2>
          <div className="sp-pain-grid">
            <div className="sp-pain-card">
              <h3>הסוכנות שלחה דוח</h3>
              <p>גרפים צבעוניים, מספרים שנראים גדולים. אבל שורה תחתונה? אתה לא יודע כמה לידים הגיעו בגלל הקמפיין וכמה בגלל גוגל.</p>
            </div>
            <div className="sp-pain-card">
              <h3>ג׳וניור מנהל לך את החשבון</h3>
              <p>שילמת על "צוות שלם". בפועל? בן אדם אחד שמנהל עוד שבעה לקוחות ושואל אותך כל שבוע "מה רוצים לפרסם?"</p>
            </div>
            <div className="sp-pain-card">
              <h3>המחיר עולה, התוצאות לא</h3>
              <p>התחלת ב-3,000 ש"ח. עכשיו אתה ב-6,000. ואין לך מושג אם המעבר הצדיק את עצמו.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="sp-section sp-section-alt">
        <div className="container">
          <h2 className="sp-section-title">מה אנחנו עושים אחרת</h2>
          <p className="sp-lead">אותו שיווק דיגיטלי שסוכנות גובה עליו 5,000. AI חתך לנו 60% מהעבודה, ואנחנו מעבירים את החיסכון אליכם.</p>
          <div className="sp-features-grid">
            <div className="sp-feature"><div className="sp-feature-num">01</div><h3>אסטרטגיה מבוססת נתונים</h3><p>מחקר קהלים, מסרים, מיפוי מתחרים. לפני שמוציאים שקל.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">02</div><h3>ניהול קמפיינים: Google · Meta · TikTok</h3><p>מקימים, מנהלים, מנתחים, משפרים. כל שבוע. עם מספרים אמיתיים.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">03</div><h3>SEO אורגני + GEO</h3><p>קידום אורגני קלאסי + אופטימיזציה למנועי AI (ChatGPT, Perplexity, Gemini). ככה אנשים מחפשים ב-2026.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">04</div><h3>סושיאל, תוכן וקריאייטיב</h3><p>פוסטים, סטוריז, reels. תוכן שאנשים רוצים לצרוך, לא "תוכן שיווקי" שאף אחד לא קורא.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">05</div><h3>דוחות שקופים</h3><p>לידים, עלות ליד, מכירות. לא impressions ולא reach.</p></div>
            <div className="sp-feature"><div className="sp-feature-num">06</div><h3>פגישה שבועית + דוח חודשי</h3><p>30 דקות כל שבוע. דוח מפורט כל חודש. אתה תמיד יודע מה קורה.</p></div>
          </div>
        </div>
      </section>

      <section className="sp-section">
        <div className="container">
          <h2 className="sp-section-title">למי זה מתאים</h2>
          <div className="sp-for-grid">
            <div className="sp-for-card sp-for-yes"><h3>מתאים</h3><ul><li>עסקים שרוצים תוצאות מדידות</li><li>בעלי עסקים שנכוו מסוכנויות יקרות</li><li>סטארטאפים שצריכים לידים עכשיו</li><li>מי שרוצה שקיפות מלאה על כל שקל</li></ul></div>
            <div className="sp-for-card sp-for-no"><h3>לא מתאים</h3><ul><li>מי שמחפש רק "מישהו שינהל את הפייסבוק"</li><li>עסקים שלא מוכנים לפגישה שבועית</li><li>מי שרוצה את הזול ביותר בלי מעורבות</li></ul></div>
          </div>
        </div>
      </section>

      <section className="sp-section sp-section-alt">
        <div className="container">
          <h2 className="sp-section-title">אפשר להוסיף</h2>
          <div className="sp-addons-table">
            <div className="sp-addon-row"><span>מאמר SEO מותאם (800–1,200 מילים)</span><b>550 ₪</b></div>
            <div className="sp-addon-row"><span>SEO בסיסי לעמוד</span><b>350 ₪ / עמוד</b></div>
            <div className="sp-addon-row"><span>SEO מתקדם (מחקר מילות מפתח + Schema + Search Console)</span><b>1,200 ₪ / עמוד</b></div>
            <div className="sp-addon-row"><span>שעת ייעוץ דיגיטלי</span><b>350 ₪ / שעה</b></div>
          </div>
        </div>
      </section>

      <section className="sp-section">
        <div className="container">
          <div className="sp-trust-bar">
            <span>✓ בלי חוזה</span><span>✓ ביטול בכל עת</span><span>✓ עשרות לקוחות מרוצים</span><span>✓ דוח חודשי מפורט</span>
          </div>
        </div>
      </section>

      <section className="sp-section sp-final-cta">
        <div className="container">
          <h2 className="sp-section-title">500 ₪ לחודש. שיווק דיגיטלי מלא.</h2>
          <p className="sp-lead">שלחו הודעה בוואטסאפ. בלי טפסים, בלי המתנה.</p>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
        </div>
      </section>
    </div>
  );
}
