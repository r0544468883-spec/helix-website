import type { Metadata } from 'next';
import RegistrationForm from './RegistrationForm';

export const metadata: Metadata = {
  title: 'סדנת vibe coding',
  description:
    'סדנה חינמית לבנות אפליקציות וכלים פנימיים עם AI — בלי לדעת לתכנת.',
  alternates: { canonical: '/vibe-code' },
  robots: { index: false, follow: false },
};

const learnings = [
  'תבנה אפליקציה ראשונה משלך מ-0 עד באוויר.',
  'תפעיל את הכלים שעובדים: Cursor, Claude, ועוזרי AI — איך לבחור ואיך לשאול.',
  'תקבל workflow קבוע שעובד גם אם מעולם לא כתבת שורת קוד.',
  'תראה איך מחברים שירותים — Google Sheets, מיילים, WhatsApp — בלי backend.',
];

const faqs = [
  {
    q: 'אני לא יודע לתכנת בכלל — זה בעיה?',
    a: 'לא. הסדנה בנויה בדיוק לזה. אם אתה יודע לנסח שאלה ולעקוב אחרי הוראות, יש לך מספיק.',
  },
  {
    q: 'כמה זה עולה?',
    a: 'חינם.',
  },
  {
    q: 'מה אני צריך להביא?',
    a: 'מחשב נייד (Mac או Windows) וחשבון Google. שאר הכלים נתקין יחד בתחילת הסדנה.',
  },
  {
    q: 'מה קורה אחרי הסדנה?',
    a: 'נשארים בקבוצת ה-WhatsApp לעזרה, שאלות, ומדי פעם עוד tips. בלי spam.',
  },
];

export default function VibeCodePage() {
  return (
    <>
      <section className="vc-hero">
        <div className="container">
          <h1 className="vc-headline">
            תבנה משהו אמיתי
            <br />
            <span className="accent">בלי לדעת לתכנת.</span>
          </h1>
          <p className="vc-subline">
            סדנה חינמית של 90 דקות — תצא ממנה עם אפליקציה ראשונה משלך באוויר. בלי
            תיאוריה, בלי "מה זה AI". יושבים, בונים, ומקבלים תוצאה.
          </p>
          <a href="#register" className="btn btn-primary vc-cta">
            להרשמה
          </a>
        </div>
      </section>

      <section className="vc-learnings">
        <div className="container">
          <h2 className="vc-section-title">מה תבנה בסדנה.</h2>
          <ul className="vc-learning-list">
            {learnings.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="vc-format">
        <div className="container">
          <h2 className="vc-section-title">איך זה עובד.</h2>
          <dl className="vc-format-list">
            <div>
              <dt>פורמט</dt>
              <dd>Zoom — סדנה חיה, אינטראקטיבית.</dd>
            </div>
            <div>
              <dt>אורך</dt>
              <dd>90 דקות.</dd>
            </div>
            <div>
              <dt>מועד</dt>
              <dd>יתעדכן בקרוב — תקבל הודעה במייל וב-WhatsApp.</dd>
            </div>
            <div>
              <dt>עלות</dt>
              <dd>חינם.</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="vc-host">
        <div className="container">
          <h2 className="vc-section-title">מי מעביר.</h2>
          <p>
            <strong>ערן ליפשטיין.</strong> 10 שנים בפיתוח תוכנה — Shaam Crop,
            Groupon Israel, JobMaster. בשנתיים האחרונות בניתי שני מוצרים שעובדים
            בייצור עם הכלים שאני מלמד בסדנה.
          </p>
        </div>
      </section>

      <section className="vc-register" id="register">
        <div className="container">
          <h2 className="vc-section-title">הרשמה.</h2>
          <p className="vc-register-intro">
            שלושה שדות. אשלח לך את פרטי הסדנה במייל ואצרף אותך לקבוצת ה-WhatsApp.
          </p>
          <RegistrationForm />
        </div>
      </section>

      <section className="vc-faq">
        <div className="container">
          <h2 className="vc-section-title">שאלות.</h2>
          <ul className="vc-faq-list">
            {faqs.map((f) => (
              <li key={f.q}>
                <h3>{f.q}</h3>
                <p>{f.a}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
