import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';

export const metadata: Metadata = {
  title: 'הצהרת נגישות',
  description: `הצהרת הנגישות של ${SITE.name}: לפי איזה תקן אנחנו עובדים, מה כבר נגיש, מה עוד לא, ואיך לפנות לרכז הנגישות.`,
  alternates: { canonical: '/accessibility' },
  robots: { index: true, follow: true },
};

export default function AccessibilityPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: 'בית', url: SITE.url },
          { name: 'הצהרת נגישות', url: `${SITE.url}/accessibility` },
        ])}
      />
      <section className="page-header">
        <div className="container">
          <div className="eyebrow">משפטי</div>
          <h1>נגישות.</h1>
          <p className="intro">
            אתר צריך לעבוד לכל אחד — גם עם קורא מסך, גם בניווט מקלדת, וגם
            בהגדלת טקסט. הנה איפה אנחנו עומדים בזה, בלי לייפות.
          </p>
        </div>
      </section>

      <section className="legal">
        <div className="container">
          <div className="about-text legal-body">
            <p>
              אנחנו מאמינים שנגישות היא חלק מהעבודה, לא תוספת בסוף. השקענו בזה
              מחשבה כבר בבנייה של האתר, ואנחנו ממשיכים לשפר אותו לאורך זמן.
            </p>

            <h2>התקן שלפיו אנחנו עובדים</h2>
            <p>
              האתר נבנה מתוך שאיפה לעמוד בתקן הישראלי 5568, שמבוסס על הנחיות{' '}
              WCAG 2.0 ברמה AA — התקן המקובל להנגשת אתרים בישראל. נהיה כנים: האתר
              עוד לא עבר ביקורת נגישות מקצועית פורמלית, ולכן אנחנו מצהירים על
              שאיפה לעמוד בתקן ולא על עמידה מלאה בו.
            </p>

            <h2>מה כבר עשינו</h2>
            <ul>
              <li>מבנה HTML סמנטי שקוראי מסך יודעים לפרש.</li>
              <li>ניווט מלא במקלדת, עם מצב פוקוס נראה לעין.</li>
              <li>ניגודיות צבעים גבוהה בין הטקסט לרקע.</li>
              <li>טקסט שאפשר להגדיל בדפדפן בלי שהתוכן יישבר.</li>
              <li>תמיכה מלאה בעברית ובכיוון מימין לשמאל.</li>
              <li>תיאורים טקסטואליים לתמונות שנושאות מידע.</li>
              <li>תצוגה תקינה במובייל, בטאבלט ובמחשב.</li>
            </ul>

            <h2>מה עוד לא מושלם</h2>
            <p>
              נגישות היא תהליך, לא תיבת סימון. יש דברים שאנחנו עדיין משפרים,
              ויכול להיות שתיתקלו ברכיב שטרם הונגש במלואו — למשל תוכן מוטמע מצד
              שלישי, כמו טופס תיאום פגישה או נגן חיצוני, שכפוף לרמת הנגישות של
              הספק שלו. אם נתקלתם במשהו שלא עובד כמו שצריך, נשמח שתספרו לנו ונתקן.
            </p>

            <h2>פנייה לרכז הנגישות</h2>
            <p>
              רכז הנגישות שלנו הוא ערן ליפשטיין. אם נתקלתם בבעיית נגישות באתר, או
              שאתם צריכים מידע בפורמט נגיש, תכתבו או תתקשרו ונחזור אליכם בהקדם
              הסביר.
            </p>
            <ul>
              <li>
                אימייל: <a href={`mailto:${SITE.accessibilityEmail}`}>{SITE.accessibilityEmail}</a>
              </li>
              <li>
                טלפון: <a href="tel:+972525447209">052-544-7209</a>
              </li>
            </ul>

            <p className="muted-block">הצהרת הנגישות עודכנה: 04.06.2026</p>
          </div>
        </div>
      </section>
    </>
  );
}
