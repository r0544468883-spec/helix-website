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
          <div className="about-photo">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <path d="M16 7C16 9.20914 14.2091 11 12 11C9.79086 11 8 9.20914 8 7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M12 14C8.13401 14 5 17.134 5 21H19C19 17.134 15.866 14 12 14Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <p className="about-photo-note">תמונה מקצועית של<br />ערן ליפשטיין</p>
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
