import type { Metadata } from 'next';
import Image from 'next/image';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import SectionHeader from '../components/SectionHeader';
import ScrollReveal from '../components/ScrollReveal';
import CommunityForm from './CommunityForm';

export const metadata: Metadata = {
  title: 'קהילת הפרגונים של HELIX, פרגון אמיתי לעסקים קטנים',
  description:
    'קהילת פרגונים בוואטסאפ בשיתוף קהילת הפייסבוק עסקים קטנים צומחים. פוסט אחד ביום, פרגון אמיתי מאנשים אמיתיים, וצמיחה משותפת בכל הרשתות. בחינם.',
  alternates: { canonical: '/community' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'קהילת הפרגונים של HELIX',
    description:
      'פוסט אחד ביום, פרגון אמיתי מאנשים אמיתיים, וצמיחה משותפת. בשיתוף קהילת הפייסבוק עסקים קטנים צומחים.',
    url: '/community',
    type: 'website',
    images: ['/opengraph-image'],
  },
};

const communityUrl = SITE.pergunimCommunityUrl;
// מספר אישי של רון לחיבור ידני ל-CRM (0544468883).
const crmWhatsappHref = `https://wa.me/972544468883?text=${encodeURIComponent(
  'היי הגעתי דרך הקהילה ואני מעוניין להשתמש ב-CRM של הליקס'
)}`;

const whyDetails = [
  'לחבר בין עסקים, ולהפנות אליכם אנשים רלוונטיים מתוך הקהילה.',
  'להמליץ לכם בדיוק אילו קבוצות פרגונים מתאימות לעסק שלכם.',
  'להזמין אתכם להפתעות: וובינרים, מפגשי נטוורקינג ועוד דברים מגניבים.',
  'לתת לכם ראשונים את ההפתעה הראשונה שלנו, מערכת CRM חינמית (בהמשך הדף).',
];

const contentYes = [
  'המלצות וסיפורי לקוחות',
  'קייס סטאדיז מהעסק שלכם',
  'טיפים וידע מקצועי',
  'סיפורים אישיים מאחורי הקלעים',
  'סרטונים, מהטלפון, אותנטי',
];

const contentNo = [
  'מבצעים והנחות',
  'פרסומות ישירות',
  'כל מה שמרגיש כמו פרסומת אגרסיבית',
  'ספאם וקישורי מכירה נטו',
];

const participationRules = [
  'עד פוסט אחד ביום בכל קבוצה. לא מכירתי.',
  'חובה לפרגן חזרה לכל שאר הפוסטים באותו מחזור.',
  'פרגון = לייק + תגובה אמיתית.',
  'פרגנתם? סמנו "בוצע" על הפוסט.',
  'מחזור יומי: מ-10:00 בבוקר עד 10:00 למחרת.',
];

const fullRules = [
  'עד פוסט אחד ביום בכל קבוצה, ובלי פוסטים מכירתיים. המטרה היא ערך איכותי בתחום שלכם, לא חשיפה למבצעים, אחרת זה לא יעבוד.',
  'חובה לפרגן חזרה לכל הפוסטים שעלו באותו מחזור.',
  'פרגון = לייק + תגובה.',
  'פרגנתם? סמנו "בוצע" על הפוסט.',
  'מחזור יומי: מ-10:00 בבוקר עד 10:00 למחרת.',
  'תוכן מקצועי בלבד. בלי פרסום בקהילה עצמה, בלי ספאם, בלי הפניה לטלגרם או לקבוצות אחרות, בלי עסקים שאינם נורמטיביים ובלי תוכן פוגעני.',
  'אין לפנות בהודעה פרטית ישירה למשתתפי הקהילה. נתקלתם בכך? דווחו לנו ונרחיק את המשתמש.',
  'בוט סורק את הקבוצות. מי שלא עומד בחוקים יקבל תחילה התראה ידידותית, והמשך חריגה יוביל להרחקה מהקהילה עד לבירור נוסף.',
  'ספאמרים יורחקו מהקהילה מיידית וללא אפשרות חזרה.',
];

const platforms = [
  { name: 'לינקדאין', desc: 'פרגון לפוסטים העסקיים שלכם.' },
  { name: 'אינסטגרם', desc: 'לייקים ותגובות אמיתיות לתוכן שלכם.' },
  { name: 'טיקטוק', desc: 'דחיפה ראשונית שהאלגוריתם אוהב.' },
  { name: 'פייסבוק', desc: 'פרופילים אישיים, לא דפים עסקיים.' },
];

const faqs = [
  {
    q: 'מה זו קהילת הפרגונים?',
    a: 'קבוצת וואטסאפ שבה כל אחד מעלה פוסט אחד ביום, וכל שאר החברים מפרגנים לו באמת: לייק, תגובה, שיתוף. בלי בוטים, בלי לקנות לייקים. אנשים אמיתיים שדוחפים אחד את השני קדימה.',
  },
  {
    q: 'למה זה עובד?',
    a: 'האלגוריתמים של הרשתות אוהבים פוסטים שמקבלים תגובות בשעה הראשונה. כשהקהילה מפרגנת לכם מיד, הפוסט מזנק, וגם אנשים שמחוץ לקהילה מתחילים לראות אתכם.',
  },
  {
    q: 'כמה זה עולה?',
    a: 'חינם. זו קהילה, לא מוצר.',
  },
  {
    q: 'חייבים להשאיר פרטים?',
    a: 'לא. הטופס לגמרי אופציונלי, ולא חייבים למלא את כל השדות. משאירים פרטים רק אם רוצים שנחבר אתכם לאנשים רלוונטיים ונעדכן אתכם בהפתעות. אפשר גם פשוט להצטרף לקהילה ישירות.',
  },
  {
    q: 'מי עומד מאחורי הקהילה?',
    a: 'הקהילה היא שיתוף פעולה בין HELIX לבין קהילת הפייסבוק עסקים קטנים צומחים. HELIX הוא בית תוכנה שבונה אוטומציות, בוטים וכלי AI לעסקים.',
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

export default function CommunityPage() {
  return (
    <div className="community-page">
      <JsonLd
        data={[
          faqJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'קהילת הפרגונים', url: `${SITE.url}/community` },
          ]),
        ]}
      />

      {/* הירו */}
      <section className="vc-hero community-hero" id="top">
        <div className="container">
          <span className="community-partner">
            שיתוף פעולה · HELIX ✕ קהילת הפייסבוק עסקים קטנים צומחים
          </span>
          <h1 className="vc-headline">
            נמאס להעלות פוסט
            <br />
            <span className="accent">ולשמוע צרצרים?</span>
          </h1>
          <p className="vc-subline">
            קהילת הפרגונים של HELIX, בשיתוף קהילת הפייסבוק{' '}
            <strong>עסקים קטנים צומחים</strong>. פוסט אחד ביום, פרגון אמיתי
            מאנשים אמיתיים, וצמיחה משותפת בכל הרשתות. בחינם.
          </p>
          {communityUrl && (
            <a
              href={communityUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary vc-cta"
            >
              הצטרפות לקהילה
            </a>
          )}
        </div>
      </section>

      {/* מי אנחנו */}
      <ScrollReveal direction="up">
        <section className="vc-host">
          <div className="container">
            <SectionHeader eyebrow="מי אנחנו" title="הילדים הטובים של הדיגיטל." as="h2" />
            <div className="community-about-grid">
              <div className="community-about-photo">
                <Image
                  src="/about-team.png"
                  alt="ערן ליפשטיין ורון קלי, המייסדים של HELIX"
                  width={380}
                  height={470}
                  priority
                />
              </div>
              <div className="community-about-text">
                <p>
                  אנחנו <strong>ערן ורון</strong>, הילדים הטובים של עולם
                  הדיגיטל, והמייסדים של HELIX. מבטיחים פחות, מספקים יותר, ועושים
                  תיאום ציפיות.
                </p>
                <p>
                  ב-HELIX אנחנו מספקים <strong>מעטפת מלאה לעסקים</strong>: משיווק,
                  פיתוח עסקי ומכירות, ועד אוטומציות, סוכני AI, בוטים, מוצרים
                  שאנחנו מפתחים במיוחד לעסקים קטנים, ופיתוח בהתאמה אישית של מערכות
                  לעסקים ישראלים. הכל תחת קורת גג אחת. בלי לגלגל אחריות הלאה, בלי
                  אותיות קטנות.
                </p>
                <p>
                  ומכיוון שהבינה המלאכותית חתכה לנו את העלויות בכ-<strong>60%</strong>,
                  גם המחירים שלנו בהתאם. אתם מקבלים הרבה יותר, בפחות.
                </p>
                <p>
                  את הקהילה הזאת הקמנו יחד עם עסקים קטנים צומחים כדי לתת לעסקים
                  בדיוק את מה שחסר להם: חשיפה אמיתית ברשתות, בלי לשלם על זה,
                  בעזרת בעלי עסקים אמיתיים.
                </p>
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* הסבר על הפרטים + טופס */}
      <ScrollReveal direction="up">
        <section className="vc-register" id="register">
          <div className="container">
            <SectionHeader
              eyebrow="רוצים שנהיה בקשר?"
              title="השאירו פרטים, וניתן לכם יותר."
              description="הכל אופציונלי, ולא חייבים למלא הכל. ככל שנדע יותר, נוכל לעזור לכם יותר."
              as="h2"
            />

            <div className="community-why">
              <ul className="community-why-list">
                {whyDetails.map((w) => (
                  <li key={w} dangerouslySetInnerHTML={{ __html: w }} />
                ))}
              </ul>
            </div>

            <div className="community-hero-form">
              <CommunityForm endpoint="/api/community-register" communityUrl={communityUrl} />
            </div>

            {communityUrl && (
              <p className="community-join-inline">
                <a href={communityUrl} target="_blank" rel="noopener noreferrer">
                  או הצטרפו ישירות לקהילה, בלי למלא כלום
                </a>
              </p>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* קבוצה לכל פלטפורמה */}
      <ScrollReveal direction="up">
        <section className="vc-format">
          <div className="container">
            <SectionHeader eyebrow="הקבוצות" title="קבוצה לכל פלטפורמה." as="h2" />
            <dl className="vc-format-list">
              {platforms.map((p) => (
                <div key={p.name}>
                  <dt>{p.name}</dt>
                  <dd>{p.desc}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </ScrollReveal>

      {/* איזה תוכן מייצרים */}
      <ScrollReveal direction="up">
        <section className="vc-learnings">
          <div className="container">
            <SectionHeader
              eyebrow="התוכן"
              title="תוכן איכותי, לא פרסומות."
              description="בשנת 2026 פרסומות אגרסיביות פשוט לא עובדות. מה שעובד זה ערך אמיתי."
              as="h2"
            />
            <div className="community-content-grid">
              <div className="community-content-col yes">
                <h3>מה כן עובד</h3>
                <ul>
                  {contentYes.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
              <div className="community-content-col no">
                <h3>מה לא עובר אצלנו</h3>
                <ul>
                  {contentNo.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="community-content-note">
              אנחנו שומרים על זה בקפדנות כדי לשמור על <strong>טיב הקהילה</strong>{' '}
              וליצור ערך מקצועי, אנושי ואמיתי לחברי הקהילה וללקוחות הפוטנציאליים
              שלכם. מהמלצות, סיפורים, קייס סטאדיז וטיפים, ועד סרטונים.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* כללי הקהילה */}
      <ScrollReveal direction="up">
        <section className="vc-learnings">
          <div className="container">
            <SectionHeader
              eyebrow="כללי הקהילה"
              title="ככה משתתפים."
              description="המטרה: קרקע פורייה לפרגון הדדי בין בעלי ובעלות עסקים ברשתות. ערך אמיתי, לא מבצעים."
              as="h2"
            />
            <ol className="community-rules-list">
              {participationRules.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
            <details className="community-rules-full">
              <summary>כללי הקהילה המלאים</summary>
              <ol>
                {fullRules.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ol>
            </details>
          </div>
        </section>
      </ScrollReveal>

      {/* ההפתעה, CRM */}
      <ScrollReveal direction="up">
        <section className="vc-register">
          <div className="container">
            <SectionHeader eyebrow="ההפתעה שהבטחנו" title="מתנה לחברי הקהילה." as="h2" />
            <div className="community-crm">
              <h3>ה-CRM החינמי של HELIX</h3>
              <p>
                כל ליד שמגיע מהפוסטים שלכם שווה כסף, חבל שיתפזר בין וואטסאפ,
                מיילים ופתקים. חברי הקהילה מקבלים גישה ל-HELIX CHIEF CRM, מערכת
                לניהול לקוחות בעברית מלאה. חינם לתמיד, בלי כרטיס אשראי. מקום אחד
                מסודר לכל הלקוחות והלידים שלכם.
              </p>
              <p className="community-crm-note">
                לוחצים, נפתחת שיחת וואטסאפ איתנו, ואנחנו מחברים אתכם ל-CRM אישית.
                בלי טפסים ובלי כרטיס אשראי.
              </p>
              <a
                href={crmWhatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                לחיבור ל-CRM בוואטסאפ
              </a>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* שאלות נפוצות */}
      <ScrollReveal direction="up">
        <section className="vc-faq">
          <div className="container">
            <SectionHeader eyebrow="שאלות ותשובות" title="שאלות נפוצות." as="h2" />
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
      </ScrollReveal>
    </div>
  );
}
