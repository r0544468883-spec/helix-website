import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import RegistrationForm from './RegistrationForm';

export const metadata: Metadata = {
  title: 'סדנת vibe coding — לבנות אפליקציה בלי לדעת לתכנת',
  description:
    'סדנה חינמית של 30 דקות ב-Google Meet. מה זה vibe coding, אילו כלים משתמשים, ואיך לבנות אפליקציה ראשונה עם AI — בלי רקע בקוד.',
  alternates: { canonical: '/vibe-code' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'סדנת vibe coding — לבנות אפליקציה בלי לדעת לתכנת',
    description:
      'סדנה חינמית של 30 דקות. מה זה vibe coding, אילו כלים משתמשים, ואיך לבנות אפליקציה ראשונה עם AI.',
    url: '/vibe-code',
    type: 'website',
  },
};

const learnings = [
  'תבנה אפליקציה ראשונה משלך מ-0 עד באוויר.',
  'תפעיל את הכלים שעובדים: Cursor, Claude, ו-Lovable — איך לבחור ואיך לשאול.',
  'תקבל workflow קבוע שעובד גם אם מעולם לא כתבת שורת קוד.',
  'תראה איך מחברים שירותים — Google Sheets, מיילים, WhatsApp — בלי backend.',
];

const faqs = [
  {
    q: 'מה זה vibe coding?',
    a: 'שיטה לבנות תוכנה דרך שיחה עם AI במקום לכתוב קוד ידנית. במקום לזכור syntax, אתה מתאר בשפה טבעית מה אתה רוצה — ה-AI כותב את הקוד, מריץ, ומתקן יחד איתך. המונח נטבע ב-2025 ע"י Andrej Karpathy והפך לשם הנפוץ לדרך העבודה הזו עם כלים כמו Cursor, Claude Code, ו-Lovable.',
  },
  {
    q: 'מה ההבדל בין vibe coding לבין כתיבת קוד רגילה?',
    a: 'כתיבת קוד רגילה דורשת ידע מדויק בשפת תכנות — לזכור פקודות, להבין error messages, לדעת לחפש פתרונות. ב-vibe coding האחריות הזו עוברת ל-AI. התפקיד שלך הוא להסביר ברורות מה אתה רוצה ולבדוק שהתוצאה עובדת. זה מוריד את החסם להתחיל מ-6 חודשי לימוד ל-30 דקות.',
  },
  {
    q: 'אילו כלים משתמשים ב-vibe coding?',
    a: 'Cursor, Claude Code, ו-Lovable הם הכלים המרכזיים נכון ל-2026. בסדנה נעבוד עם Cursor — IDE שמשלב Claude ו-GPT ישירות בעריכת הקוד. Cursor מבוסס VS Code, יש לו free tier שמספיק להתחיל, ועובד גם על Mac וגם על Windows.',
  },
  {
    q: 'האם אפשר לבנות מוצר עובד עם vibe coding?',
    a: 'כן, בייצור. אני בעצמי בניתי שני מוצרים שעובדים ועליהם לקוחות משלמים (Datashop.co.il בין השאר) כשהשיטה המרכזית בהם היא vibe coding. החשוב להבין: vibe coding מצוין ל-MVP, פרוטוטיפים, אוטומציות, וכלים פנימיים. למוצרים בקנה מידה של מיליוני משתמשים עדיין נדרש פיתוח קלאסי לחלקים קריטיים.',
  },
  {
    q: 'האם vibe coding מחליף מתכנתים?',
    a: 'לא. הוא מעביר את הצוואר בקבוק. מתכנת מנוסה עם vibe coding בונה מהר יותר ויותר מורכב. אדם שלא יודע לתכנת מקבל יכולת חדשה — לבנות בעצמו דברים שעד עכשיו דרשו צוות פיתוח. אבל ההבנה מה לבנות, איך לנפות bugs קריטיים, ומתי המוצר באמת מוכן לייצור — עדיין דורש שיקול דעת.',
  },
  {
    q: 'אני לא יודע לתכנת בכלל — זה בעיה?',
    a: 'לא. הסדנה בנויה בדיוק לזה. אם אתה יודע לנסח שאלה ולעקוב אחרי הוראות, יש לך מספיק.',
  },
  {
    q: 'מה אני צריך להביא?',
    a: 'מחשב נייד (Mac או Windows) וחשבון Google. שאר הכלים נתקין יחד בתחילת הסדנה.',
  },
  {
    q: 'כמה זה עולה?',
    a: 'חינם.',
  },
  {
    q: 'מה קורה אחרי הסדנה?',
    a: 'ההרשמה מצרפת אותך לקבוצת ייעוץ חינמית ב-WhatsApp — שאלות, עזרה, ועדכונים על המשך התוכן. בלי spam.',
  },
];

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function VibeCodePage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'סדנת vibe coding', url: `${SITE.url}/vibe-code` },
          ]),
        ]}
      />

      <section className="vc-hero">
        <div className="container">
          <h1 className="vc-headline">
            תבנה משהו אמיתי
            <br />
            <span className="accent">בלי לדעת לתכנת.</span>
          </h1>
          <p className="vc-subline">
            סדנת vibe coding חינמית של 30 דקות ב-Google Meet — תצא ממנה עם
            אפליקציה ראשונה משלך באוויר. כולל גישה לקבוצת ייעוץ חינמית ב-WhatsApp
            לשאלות והמשך עזרה.
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
              <dd>Google Meet — סדנה חיה, אינטראקטיבית.</dd>
            </div>
            <div>
              <dt>אורך</dt>
              <dd>30 דקות.</dd>
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
          <h2 className="vc-section-title">מי מעבירים.</h2>
          <div className="vc-host-grid">
            <div>
              <h3 className="vc-host-name">ערן ליפשטיין</h3>
              <p>
                10 שנים בפיתוח תוכנה — Shaam Crop, Groupon Israel, JobMaster.
                בשנתיים האחרונות בניתי שני מוצרים שעובדים בייצור עם הכלים שאני
                מלמד בסדנה.
              </p>
            </div>
            <div>
              <h3 className="vc-host-name">רון קלי</h3>
              <p>
                10+ שנים בפיתוח עסקי, שיווק ומכירות בחברות סטארטאפ והייטק
                בתפקידים אסטרטגיים ובכירים. בשנתיים האחרונות מטמיע אוטומציות וכלי
                AI במחלקות שיווק ומכירות אצל לקוחות.
              </p>
            </div>
          </div>
          <p className="vc-host-together">
            יחד אנחנו רואים את התמונה המלאה: איך לבנות, איך להטמיע, ואיך להפיק
            ערך עסקי מהיום הראשון.
          </p>
        </div>
      </section>

      <section className="vc-register" id="register">
        <div className="container">
          <h2 className="vc-section-title">הרשמה.</h2>
          <p className="vc-register-intro">
            שלושה שדות. אשלח לך את פרטי הסדנה במייל ואצרף אותך לקבוצת הייעוץ
            החינמית ב-WhatsApp.
          </p>
          <RegistrationForm />
        </div>
      </section>

      <section className="vc-faq">
        <div className="container">
          <h2 className="vc-section-title">שאלות נפוצות על vibe coding.</h2>
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
