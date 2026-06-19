import Image from 'next/image';
import SectionHeader from '../SectionHeader';

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <SectionHeader
          eyebrow="מי אנחנו"
          titleHtml="מי עומדים<br>מאחורי Helix."
        />

        <div className="about-grid">
          <div className="about-photo">
            <Image
              src="/about-team.png"
              alt="ערן ליפשטיין ורון קלי"
              width={420}
              height={520}
              className="about-team-img"
              priority
            />
          </div>

          <div className="about-text">
            <p>
              <strong>ערן ליפשטיין.</strong> עשר שנים בפיתוח תוכנה: Tech Lead ב-Shaam Crop, ולפני זה ב-Groupon Israel וב-JobMaster.co.il. בשנתיים האחרונות בנה שני מוצרים שעובדים בייצור עם לקוחות משלמים: <strong>Datashop.co.il</strong> (פלטפורמת ניהול מלאי ל-eCommerce עם AI) ומערכת ניהול לרשת בתי קפה.
            </p>

            <p>
              <strong>רון קלי.</strong> מעל 10 שנות ניסיון בפיתוח עסקי, שיווק ומכירות בחברות סטארטאפ והייטק בתפקידים אסטרטגיים ובכירים. בשנתיים האחרונות מתמחה בהטמעת אוטומציות וכלי AI במחלקות שיווק ומכירות אצל לקוחות.
            </p>

            <p>
              <strong>ביחד אנחנו מכסים את כל המסלול:</strong> מוצר, אוטומציה, ושיווק. דב + Go-to-Market תחת קורת גג אחת — בדיוק מה שעסקים קטנים מאבדים כשהם עובדים עם 3 ספקים שלא מדברים אחד עם השני.
            </p>

            <p>
              בדרך גילינו משהו: רוב הסטארטאפים והעסקים הקטנים שעובדים עם ספקים נפרדים מאבדים זמן, כסף, ולפעמים את הסיכוי ל-product-market-fit. לא כי הספקים גרועים — כי אף אחד לא רואה את התמונה השלמה.
            </p>

            <p>
              <strong>Helix זה הניסיון שלנו לעשות אחרת.</strong> גם הקוד, גם האוטומציה, גם הקמפיין, גם השקיפות. תחת קורת גג אחת.
            </p>

            <p className="muted-block">
              ערן מתנדב ב-<strong className="accent-brand">Havermi</strong>, מנטור למפתחים ג׳וניור שמחפשים את העבודה הראשונה שלהם בהייטק.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
