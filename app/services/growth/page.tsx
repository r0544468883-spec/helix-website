import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'Growth Hacking', description: 'צמיחה מהירה. ניסויים, אופטימיזציה, viral loops. 500 ₪ לחודש.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על Growth Hacking')}`;

export default function GrowthPage() {
  return (
    <div className="service-page">
      <section className="sp-hero"><div className="container">
        <p className="sp-eyebrow">חבילה 04</p>
        <h1 className="sp-title">צמיחה שלא תלויה בתקציב.<br />תלויה בראש.</h1>
        <p className="sp-subtitle">סוכנויות שיווק זורקות כסף על קמפיינים ומקוות לטוב. אנחנו בודקים, מודדים, ומשפרים. כל שבוע ניסוי חדש, כל חודש צמיחה.</p>
        <div className="sp-price-badge"><span className="sp-market-price">בשוק: 6,000–12,000 ₪</span><span className="sp-our-price">500 ₪ <small>/ לחודש</small></span></div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
      </div></section>

      <section className="sp-section"><div className="container">
        <h2 className="sp-section-title">הבעיה שאתה מכיר</h2>
        <div className="sp-pain-grid">
          <div className="sp-pain-card"><h3>שורפים תקציב בלי ללמוד</h3><p>הוצאת 10,000 ש"ח על קמפיין. לא עבד. אף אחד לא ניתח למה. הוצאת עוד 10,000 על אותו דבר.</p></div>
          <div className="sp-pain-card"><h3>אין מי שמנתח את המשפך</h3><p>אנשים נכנסים לאתר. חלק ממלאים טופס. חלק קונים. אבל אין לך מושג איפה אתה מפסיד את רובם.</p></div>
          <div className="sp-pain-card"><h3>צמיחה = עוד תקציב</h3><p>כל פעם שרוצים לגדול, מגדילים תקציב. אין מנגנון צמיחה אורגני. בלי כסף, הכל עוצר.</p></div>
        </div>
      </div></section>

      <section className="sp-section sp-section-alt"><div className="container">
        <h2 className="sp-section-title">מה כלול</h2>
        <div className="sp-features-grid">
          <div className="sp-feature"><div className="sp-feature-num">01</div><h3>אסטרטגיית צמיחה מותאמת</h3><p>מנתחים את העסק, מזהים הזדמנויות צמיחה, ובונים תוכנית.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">02</div><h3>ניסויי A/B ואופטימיזציית המרות</h3><p>כל שבוע ניסוי. כל ניסוי מלמד משהו. המספרים עולים.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">03</div><h3>Funnel Analysis</h3><p>מאיפה אנשים מגיעים, איפה הם נופלים, ומה גורם להם לסגור. עם מספרים.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">04</div><h3>Viral Loops ותוכניות Referral</h3><p>מנגנונים שגורמים ללקוחות להביא עוד לקוחות. בלי שתשלם על כל אחד.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">05</div><h3>Growth Metrics ודשבורד</h3><p>מספרים שחשובים, לא מספרים שנראים טוב. דשבורד שאתה באמת מסתכל עליו.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">06</div><h3>פגישה שבועית + דוח חודשי</h3><p>30 דקות כל שבוע. דוח מפורט כל חודש.</p></div>
        </div>
      </div></section>

      <section className="sp-section"><div className="container">
        <h2 className="sp-section-title">למי זה מתאים</h2>
        <div className="sp-for-grid">
          <div className="sp-for-card sp-for-yes"><h3>מתאים</h3><ul><li>סטארטאפים שרוצים לצמוח מהר בתקציב נמוך</li><li>עסקים שרוצים מנגנון צמיחה, לא רק קמפיין</li><li>מי שמוכן לנסות, למדוד, ולשפר</li></ul></div>
          <div className="sp-for-card sp-for-no"><h3>לא מתאים</h3><ul><li>עסקים שרוצים "רק קמפיין בגוגל"</li><li>מי שלא מוכן לעבוד עם דאטה</li></ul></div>
        </div>
      </div></section>

      <section className="sp-section"><div className="container"><div className="sp-trust-bar"><span>✓ בלי חוזה</span><span>✓ ביטול בכל עת</span><span>✓ אבחון צמיחה ראשוני חינם</span></div></div></section>

      <section className="sp-section sp-final-cta"><div className="container">
        <h2 className="sp-section-title">500 ₪ לחודש. צמיחה אמיתית.</h2>
        <p className="sp-lead">שלחו הודעה בוואטסאפ.</p>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
      </div></section>
    </div>
  );
}
