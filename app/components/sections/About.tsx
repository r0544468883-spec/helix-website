import SectionHeader from '../SectionHeader';

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <SectionHeader
          eyebrow="מי אני"
          titleHtml="מי עומד<br>מאחורי Helix."
        />

        <div className="about-grid">
          <div
            className="about-photo about-photo-placeholder"
            role="img"
            aria-label="ערן ליפשטיין"
          >
            <span className="about-photo-initials" aria-hidden="true">ער</span>
          </div>

          <div className="about-text">
            <p>
              אני <strong>ערן ליפשטיין</strong>. עשר שנים בפיתוח תוכנה: Tech Lead ב-Shaam Crop, ולפני זה ב-Groupon Israel וב-JobMaster.co.il.
            </p>

            <p>
              בשנתיים האחרונות בניתי שני מוצרים שעובדים בייצור עם לקוחות משלמים: <strong>Datashop.co.il</strong> (פלטפורמת ניהול מלאי ל-eCommerce עם AI) ומערכת ניהול לרשת בתי קפה. שניהם נבנו בדיוק כפי שאני בונה ללקוחות אחרים: אפיון כתוב, סטטוס שבועי, וגילוי לב.
            </p>

            <p>
              בדרך גיליתי משהו: רוב הסטארטאפים והעסקים הקטנים שעובדים עם ספקים נפרדים מאבדים זמן, כסף, ולפעמים את הסיכוי ל-product-market-fit. לא כי הספקים גרועים — כי אף אחד לא רואה את התמונה השלמה.
            </p>

            <p>
              <strong>Helix זה הניסיון שלי לעשות אחרת.</strong> גם הקוד, גם הקמפיין, גם השקיפות. תחת קורת גג אחת.
            </p>

            <p className="muted-block">
              מתנדב ב-<strong className="accent-brand">Havermi</strong>, מנטור למפתחים ג׳וניור שמחפשים את העבודה הראשונה שלהם בהייטק.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
