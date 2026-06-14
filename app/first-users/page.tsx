import type { Metadata } from 'next';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import WorkshopRegistrationForm from '../components/WorkshopRegistrationForm';

export const metadata: Metadata = {
  title: 'סדנת משתמשים ראשונים — מ-POC לשיחה הראשונה עם משתמש אמיתי',
  description:
    'סדנת המשך חינמית של 4 ערבים ב-Google Meet. נבנה מערכת שמזהה מי כבר מחפש בפומבי פתרון כמו שלך, ומחברת אותך אליו בשיחה אמיתית — בלי פרסום ובלי בוטים.',
  alternates: { canonical: '/first-users' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'סדנת משתמשים ראשונים — מ-POC לשיחה הראשונה עם משתמש אמיתי',
    description:
      'סדנת המשך חינמית של 4 ערבים. מערכת שמזהה מי כבר מחפש בפומבי פתרון כמו שלך, ומחברת אותך אליו בשיחה אמיתית.',
    url: '/first-users',
    type: 'website',
  },
};

const learnings = [
  'תזהה איפה הקהל שלך כבר מדבר — אילו קבוצות, פורומים, ואילו מילים מסגירות כוונת קנייה.',
  'תרים מערכת חיה ב-n8n או Make שמקשיבה לסיגנלים האלה ומביאה אותם אליך.',
  'תראה את הסיגנל האמיתי הראשון נכנס לפניך — מישהו שמחפש בדיוק מה שבנית.',
  'תדע לפתוח שיחה אמיתית עם מי שהרים יד, בלי טמפלייטים ובלי להישמע ספאם.',
];

const program = [
  {
    title: 'ערב 1 — למה אתה לא רואה אותם',
    body: 'המשתמשים הראשונים שלך כבר קיימים ומרוכזים בכמה מקומות — קבוצות, פורומים, לינקדאין. נבין למה פרסום ממומן מפספס בדיוק אותם, ולמה עדיף להיות מי שעונה ראשון מאשר מי שמשלם הכי הרבה.',
  },
  {
    title: 'ערב 2 — אילו מילים מסגירות שמישהו מחפש',
    body: 'נחליט יחד אילו ביטויים הקהל שלך באמת כותב כשהוא מחפש פתרון, מאילו מקורות מקשיבים, ואיך מסננים את הרלוונטי מהרעש. זה התכנון של המערכת לפני שנוגעים בכלי.',
  },
  {
    title: 'ערב 3 — מרימים את המערכת לאוויר',
    body: 'הערב המעשי. פותחים n8n או Make, מגדירים את הטריגר, מחברים את המקורות, ובסוף הערב אתה רואה את הסיגנל האמיתי הראשון נכנס לפניך — מישהו שכתב בפומבי שהוא מחפש בדיוק מה שבנית.',
  },
  {
    title: 'ערב 4 — מסיגנל לשיחה',
    body: 'איך עונים למי שכבר הרים יד בלי להישמע כמו ספאם, איך פותחים שיחה אמיתית, ואיפה זה תלוי בך ולא במערכת. בסוף נראה איך לוקחים את המערכת מ"רצה על ברכיים" לסיסטם מלא ויציב — אם וכשתרצה.',
  },
];

const faqs = [
  {
    q: 'למי הסדנה הזו?',
    a: 'למי שכבר בנה משהו — POC, מוצר רזה, גרסה ראשונה — ותקוע על השאלה "ועכשיו איך מביאים משתמש ראשון". אם עוד לא בנית כלום, סדנת vibe coding שלנו היא הנקודה להתחיל בה.',
  },
  {
    q: 'אני לא איש שיווק. זה בשבילי?',
    a: 'כן. כל הרעיון הוא לא להפוך אותך למשווק. אנחנו בונים מערכת שמזהה אנשים שכבר מחפשים מה שבנית, ואתה פשוט עונה להם כבן אדם. בלי רקע בקמפיינים, בפרסום או בקופירייטינג.',
  },
  {
    q: 'במה זה שונה מקמפיין ממומן בפייסבוק או גוגל?',
    a: 'קמפיין ממומן דוחף את המוצר שלך לאנשים שלא ביקשו אותו, ומשלם על כל קליק. כאן אנחנו עושים הפוך: מקשיבים לאנשים שכבר כתבו בפומבי שהם מחפשים פתרון, ומגיעים אליהם ברגע הנכון. בלי תקציב מדיה.',
  },
  {
    q: 'זה לא בוטים ששולחים ספאם?',
    a: 'לא, וזה עיקרון אצלנו. המערכת מזהה סיגנל ציבורי — מישהו שכתב שהוא מחפש משהו — ומביאה אותו אליך. הפנייה עצמה היא שלך, אדם לאדם. אנחנו לא בונים בוט ששולח הודעות קרות בשמך, וגם לא מלמדים לעשות את זה.',
  },
  {
    q: 'אילו כלים נשתמש בהם?',
    a: 'n8n או Make לאוטומציה — כלי no-code שיש להם free tier שמספיק כדי להתחיל. נחבר אותם למקורות שבהם הקהל שלך מדבר. הכל נתקין יחד במהלך הסדנה.',
  },
  {
    q: 'אני צריך מוצר מוכן לגמרי?',
    a: 'לא. מספיק POC או גרסה רזה שאפשר להראות. למעשה זה השלב הכי טוב למצוא משתמשים ראשונים — הם גם נותנים לך את הפידבק שמעצב את המוצר הלאה.',
  },
  {
    q: 'כמה משתמשים זה יביא לי?',
    a: 'אי אפשר להבטיח מספר, ולא נבטיח. זה תלוי בכמה אנשים מדברים בפומבי על הבעיה שאתה פותר ובאיכות המוצר. מה שכן מובטח: מערכת חיה שעובדת, והסיגנל האמיתי הראשון נכנס לפניך עוד בסדנה.',
  },
  {
    q: 'מה אני צריך להביא?',
    a: 'מחשב נייד (Mac או Windows), חשבון Google, ומשהו שכבר בנית להציג. שאר הכלים נתקין יחד בתחילת הסדנה.',
  },
  {
    q: 'כמה זה עולה?',
    a: 'חינם.',
  },
  {
    q: 'מה קורה אחרי הסדנה?',
    a: 'ההרשמה מצרפת אותך לקבוצת WhatsApp לשאלות, עזרה והמשך. ואם תרצה לקחת את המערכת שבנית ולהפוך אותה לסיסטם מלא ויציב — זה בדיוק מה ש-Helix עושה. בלי spam, בלי לחץ.',
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

export default function FirstUsersPage() {
  return (
    <>
      <JsonLd
        data={[
          faqJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'סדנת משתמשים ראשונים', url: `${SITE.url}/first-users` },
          ]),
        ]}
      />

      <section className="vc-hero">
        <div className="container">
          <h1 className="vc-headline">
            בנית משהו אמיתי.
            <br />
            <span className="accent">עכשיו אף אחד לא יודע שהוא קיים.</span>
          </h1>
          <p className="vc-subline">
            סדנת המשך חינמית של 4 ערבים ב-Google Meet, למי שיש לו POC או מוצר רזה
            ואפס משתמשים. נבנה יחד מערכת שמזהה אנשים שכבר כותבים בפומבי שהם מחפשים
            בדיוק את מה שבנית, ומחברת אותך אליהם בשיחה אמיתית. בלי לשרוף שקל על
            פרסום, ובלי בוטים ששולחים פניות קרות בשמך.
          </p>
          <a href="#register" className="btn btn-primary vc-cta">
            להרשמה
          </a>
        </div>
      </section>

      <section className="vc-learnings">
        <div className="container">
          <h2 className="vc-section-title">מה תצא איתו.</h2>
          <ul className="vc-learning-list">
            {learnings.map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="vc-format">
        <div className="container">
          <h2 className="vc-section-title">תוכנית 4 הערבים.</h2>
          <dl className="vc-format-list">
            {program.map((p) => (
              <div key={p.title}>
                <dt>{p.title}</dt>
                <dd>{p.body}</dd>
              </div>
            ))}
          </dl>
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
              <dt>מבנה</dt>
              <dd>4 ערבים, כשעה כל אחד. מפגשים — לא 4 ימי עבודה.</dd>
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
                בשנתיים האחרונות בניתי שני מוצרים שעובדים בייצור, והרמתי את
                מערכות האוטומציה שמביאות אליהם משתמשים.
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
            ב-vibe coding בנית את המוצר. כאן אנחנו מראים איך מוצאים לו את המשתמש
            הראשון — ערן מצד הבנייה והאוטומציה, רון מצד השיחה שמובילה ללקוח.
          </p>
        </div>
      </section>

      <section className="vc-register" id="register">
        <div className="container">
          <h2 className="vc-section-title">הרשמה.</h2>
          <p className="vc-register-intro">
            שלושה שדות. אשלח לך את פרטי הסדנה במייל ואצרף אותך לקבוצת WhatsApp
            לשאלות ועזרה.
          </p>
          <WorkshopRegistrationForm
            endpoint="/api/first-users-register"
            whatsappGroup={SITE.firstUsersWhatsappGroup}
          />
        </div>
      </section>

      <section className="vc-faq">
        <div className="container">
          <h2 className="vc-section-title">שאלות נפוצות.</h2>
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
