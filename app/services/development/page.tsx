import type { Metadata } from 'next';
import { SITE } from '@/lib/site';

export const metadata: Metadata = { title: 'בנק שעות פיתוח ואפיון', description: 'פיתוח תוכנה, אפליקציות, אינטגרציות. MVP עד production. תמחור לפי הצעה.' };
const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על פיתוח בהתאמה')}`;

export default function DevelopmentPage() {
  return (
    <div className="service-page">
      <section className="sp-hero"><div className="container">
        <p className="sp-eyebrow">פיתוח בהתאמה</p>
        <h1 className="sp-title">תוכנה שעובדת בדיוק<br />כמו שאתה צריך.</h1>
        <p className="sp-subtitle">יש לך רעיון למוצר? צריך פיצ'ר שלא קיים? רוצה לחבר שתי מערכות שלא מדברות? זה מה שאנחנו עושים. פיתוח בהתאמה, בלי bloat, בלי over-engineering.</p>
        <div className="sp-price-badge"><span className="sp-our-price">לפי הצעה <small>· נסגר בשיחה</small></span></div>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
      </div></section>

      <section className="sp-section"><div className="container">
        <h2 className="sp-section-title">הבעיה שאתה מכיר</h2>
        <div className="sp-pain-grid">
          <div className="sp-pain-card"><h3>MVP שלקח שנה</h3><p>הזמנת מערכת פשוטה. הספק אמר 3 חודשים. עברה שנה ויש חצי מוצר.</p></div>
          <div className="sp-pain-card"><h3>הספק נעלם</h3><p>פיתחו לך מערכת. הספק עבר לפרויקט אחר. עכשיו יש באג ואין מי שיתקן.</p></div>
          <div className="sp-pain-card"><h3>עלות שפוחתה</h3><p>הסכמתם על 30,000. החשבון עלה ל-80,000. "הייתה מורכבות שלא צפינו."</p></div>
        </div>
      </div></section>

      <section className="sp-section sp-section-alt"><div className="container">
        <h2 className="sp-section-title">מה כלול</h2>
        <div className="sp-features-grid">
          <div className="sp-feature"><div className="sp-feature-num">01</div><h3>שעות פיתוח ואפיון לפי בנק שעות</h3><p>משלם על מה שצורך. לא על חבילה שלא מתאימה.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">02</div><h3>MVP · פיצ'ר · אינטגרציה · אפליקציה</h3><p>מ-MVP ראשון ועד פיצ'רים למוצר קיים. גמיש.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">03</div><h3>Stack: Node.js · React · Python · .NET · AWS · GCP</h3><p>עובדים עם מה שמתאים לפרויקט, לא עם מה שנוח לנו.</p></div>
          <div className="sp-feature"><div className="sp-feature-num">04</div><h3>פגישה שבועית + דוח חודשי</h3><p>30 דקות כל שבוע. שקיפות מלאה על התקדמות ושעות.</p></div>
        </div>
      </div></section>

      <section className="sp-section"><div className="container">
        <h2 className="sp-section-title">תמחור</h2>
        <div className="sp-addons-table">
          <div className="sp-addon-row"><span>פיתוח WordPress</span><b>220 ₪ / שעה</b></div>
          <div className="sp-addon-row"><span>פיתוח בקוד (React, Node, Python, .NET)</span><b>450 ₪ / שעה</b></div>
          <div className="sp-addon-row"><span>שעת ייעוץ דיגיטלי / אפיון</span><b>350 ₪ / שעה</b></div>
        </div>
      </div></section>

      <section className="sp-section"><div className="container">
        <h2 className="sp-section-title">למי זה מתאים</h2>
        <div className="sp-for-grid">
          <div className="sp-for-card sp-for-yes"><h3>מתאים</h3><ul><li>יזמים שצריכים MVP</li><li>עסקים שצריכים פיצ'ר חדש למוצר קיים</li><li>מי שצריך אינטגרציה בין מערכות</li><li>פרויקטים עם scope ברור</li></ul></div>
          <div className="sp-for-card sp-for-no"><h3>לא מתאים</h3><ul><li>"יש לי רעיון, תבנה לי פייסבוק"</li><li>פרויקטים בלי תקציב או scope</li></ul></div>
        </div>
      </div></section>

      <section className="sp-section"><div className="container"><div className="sp-trust-bar"><span>✓ שיחת אפיון ראשונה חינם</span><span>✓ הצעת מחיר מפורטת לפני התחלה</span><span>✓ שקיפות מלאה על שעות</span></div></div></section>

      <section className="sp-section sp-final-cta"><div className="container">
        <h2 className="sp-section-title">ספרו לנו מה צריך. נחזור עם הצעה.</h2>
        <p className="sp-lead">שלחו הודעה בוואטסאפ.</p>
        <a href={wa} target="_blank" rel="noopener noreferrer" className="sp-cta">דברו איתנו בוואטסאפ</a>
      </div></section>
    </div>
  );
}
