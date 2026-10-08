'use client';

import Image from 'next/image';
import SectionHeader from '../SectionHeader';
import ScrollTextHighlight from '../ScrollTextHighlight';

export default function About() {
  return (
    <section className="about" id="about">
      <div className="container">
        <SectionHeader
          eyebrow="מי אנחנו"
          titleHtml="הילדים הטובים<br>של עולם הדיגיטל."
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

          <ScrollTextHighlight className="about-text" dimOpacity={0.18} blurAmount={1.5}>
            <p>
              אנחנו <strong>ערן ורון</strong>, הילדים הטובים של עולם הדיגיטל. מתמחים בשיווק, פיתוח עסקי, אוטומציות והטמעת בינה מלאכותית, לצד מערכות שכבר בנינו ואתם פשוט מתחילים להשתמש בהן. מבטיחים פחות, מספקים יותר.
            </p>

            <p>
              <strong>החזון שלנו פשוט:</strong> כל הכלים והשירותים שעד היום היו שמורים לחברות הגדולות, נגישים עכשיו לכל עסק קטן וסטארטאפ.
            </p>

            <p>
              ולמה אנחנו זולים? כי השוק הישראלי מלא בבעלי עסקים שנכוו. ספקי דיגיטל שהבטיחו ולא עמדו בהסכם, וגבו מחירים מופרכים. בפועל כולם כבר עובדים עם בינה מלאכותית שחתכה את העבודה על כל לקוח בכ-60%, אבל המחירים לא ירדו בהתאם. אנחנו עושים את ההפך: מגלגלים את החיסכון אליכם, ונותנים שירות במחירים שוברי שוק לעסקים ולחברות בישראל.
            </p>

            <p>
              <strong>ערן ליפשטיין.</strong> עשר שנים בפיתוח תוכנה: Tech Lead ב-Shaam Corp, ולפני זה ב-Groupon Israel וב-JobMaster.co.il. בשנתיים האחרונות בנה שני מוצרים שעובדים בייצור עם לקוחות משלמים: <strong>Datashop.co.il</strong> (פלטפורמת ניהול מלאי ל-eCommerce עם AI) ומערכת ניהול לרשת בתי קפה.
            </p>

            <p>
              <strong>רון קלי.</strong> מעל 10 שנות ניסיון בפיתוח עסקי, שיווק ומכירות בחברות סטארטאפ והייטק בתפקידים אסטרטגיים ובכירים. בשנתיים האחרונות מתמחה בהטמעת אוטומציות וכלי AI במחלקות שיווק ומכירות אצל לקוחות.
            </p>

            <p>
              <strong>ביחד אנחנו מכסים את כל הדרך:</strong> שיווק, פיתוח עסקי, אוטומציה ו-AI. אותו צוות שרואה את כל התמונה, כך שאף אחד לא מגלגל אחריות הלאה כשמשהו נתקע באמצע.
            </p>

            <p className="muted-block">
              ערן מתנדב ב-<strong className="accent-brand">Havermi</strong>, מנטור למפתחים ג׳וניור שמחפשים את העבודה הראשונה שלהם בהייטק.
            </p>
          </ScrollTextHighlight>
        </div>
      </div>
    </section>
  );
}
