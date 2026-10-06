import type { Metadata } from 'next';
import Image from 'next/image';
import { Search, ScanSearch, FileText, Bot, Target, TrendingUp, Sparkles, CalendarDays, MessageCircle, Database, Wrench, Gift, ShieldCheck, Award, Rocket, BarChart3 } from 'lucide-react';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import SectionHeader from '../components/SectionHeader';
import ScrollReveal from '../components/ScrollReveal';
import MatanaForm from './MatanaForm';
import SecretReveal from './SecretReveal';
import StickyCta from './StickyCta';

export const metadata: Metadata = {
  title: 'מתנת חג מ-HELIX · 3 כתבות תומכות GEO/AEO על העסק שלכם, בחינם',
  description:
    'לכבוד החג: 3 תוצרים תומכי GEO/AEO על העסק שלכם, במתנה. סריקת תוכן ומילון מושגים + 2 כתבות בנויות כך שמנועי הבינה המלאכותית יזהו אתכם וימליצו עליכם. בלי עלות, בלי התחייבות.',
  alternates: { canonical: '/matana' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'מתנת חג מ-HELIX · 3 כתבות תומכות GEO/AEO, בחינם',
    description:
      'שהעסק שלכם יופיע כשמישהו שואל את ChatGPT או Gemini "מה מומלץ ל...". 3 תוצרים על העסק שלכם, במתנה.',
    url: '/matana',
    type: 'website',
    locale: 'he_IL',
    images: [
      { url: '/opengraph-image', width: 1200, height: 630, alt: 'מתנת חג HELIX · 3 כתבות GEO/AEO על העסק שלכם, בחינם' },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'מתנת חג מ-HELIX · 3 כתבות GEO/AEO בחינם',
    description: 'שהעסק שלכם יעלה כשמישהו שואל את ChatGPT "מה מומלץ". 3 תוצרים במתנה.',
    images: ['/opengraph-image'],
  },
};

// כשיהיה סרטון, הדביקו כאן קישור embed (YouTube/Vimeo) והסקשן ייחשף אוטומטית.
const heroVideo = '';

// קישור ההזמנה לקהילת הפרגונים (אותו מקור כמו דף הקהילה).
const communityUrl = SITE.pergunimCommunityUrl;

const whyCards = [
  {
    Icon: Search,
    title: 'הלקוחות עברו לשאול AI',
    body: 'במקום לגלול 10 תוצאות בגוגל, אנשים שואלים את ChatGPT ו-Gemini "מה מומלץ ל...?" ומקבלים תשובה אחת, עם שם אחד או שלושה.',
  },
  {
    Icon: Target,
    title: 'אם אתם לא שם, אתם לא בשיחה',
    body: 'לא הפסדתם ללקוח, הוא בכלל לא ידע שאתם קיימים. מי שהשם שלו עולה בתשובה, מקבל את הפנייה.',
  },
  {
    Icon: TrendingUp,
    title: 'החלון פתוח עכשיו',
    body: 'רוב העסקים הקטנים בארץ עדיין ישנים על זה. מי שייכנס עכשיו, יתפוס את המקום לפני שהתחום מתמלא.',
  },
];

const deliverables = [
  {
    Icon: ScanSearch,
    tag: 'תוצר 1',
    title: 'סריקת תוכן + מילון מושגים',
    body: 'סורקים את התוכן והכתבות שכבר יש לכם, ובונים מילון מושגים של העסק. זו המפה שמנוע ה-AI קורא כדי להבין בדיוק מי אתם, מה אתם עושים, ובאילו מילים, כדי לדעת מתי להמליץ עליכם.',
  },
  {
    Icon: FileText,
    tag: 'תוצר 2',
    title: 'כתבה ראשונה בנויה ל-AI',
    body: 'כתבה עם מבנה, סמכות ותשובות ברורות שמנועי הבינה המלאכותית אוהבים להרים ולצטט בתשובות שהם נותנים ללקוחות.',
  },
  {
    Icon: Bot,
    tag: 'תוצר 3',
    title: 'כתבה שנייה בנויה ל-AI',
    body: 'כתבה שנייה שמחזקת את התמונה: לא אזכור אקראי אחד, אלא כמה מקורות שמספרים ל-AI אותו סיפור עליכם. ככה הוא לומד לסמוך עליכם.',
  },
];

const steps = [
  {
    n: '1',
    title: 'מיפוי איך שואלים עליכם',
    body: 'מגלים איך הקהל שלכם באמת שואל את ה-AI בתחום. לא מילות מפתח לגוגל, שאלות שלמות בשפה טבעית.',
  },
  {
    n: '2',
    title: 'בונים תוכן שה-AI מצטט',
    body: 'כותבים את שלושת התוצרים במבנה שקל למנועי ה-AI לשלוף ולצטט.',
  },
  {
    n: '3',
    title: 'העסק מתחיל לעלות בתשובות',
    body: 'ה-AI מתחיל לזהות אתכם, וכשמישהו שואל על התחום, יש סיכוי טוב יותר שהשם שלכם יופיע.',
  },
];

// חבילת ההמשך שמוצעת אחרי המתנה. 4 שירותים בתשלום (~₪2,000 כל אחד) + CRM חינם.
const packageItems = [
  {
    Icon: FileText,
    title: '4 כתבות GEO בחודש',
    body: 'תוכן שוטף שבנוי כדי שמנועי ה-AI ימשיכו לזהות אתכם ולהמליץ עליכם, חודש אחרי חודש.',
    freeBadge: false,
  },
  {
    Icon: CalendarDays,
    title: 'פגישה שבועית',
    body: 'ליווי שבועי בשיווק, פיתוח עסקי ובינה מלאכותית. יד על הדופק של העסק שלכם.',
    freeBadge: false,
  },
  {
    Icon: MessageCircle,
    title: '2 אוטומציות וואטסאפ + תמיכה',
    body: 'שתי אוטומציות וואטסאפ שעובדות בשבילכם, עם תמיכה חודשית שוטפת שדואגת שהן ירוצו חלק.',
    freeBadge: false,
  },
  {
    Icon: Wrench,
    title: 'תחזוקת אתר אינטרנטי',
    body: 'אנחנו דואגים שהאתר שלכם מעודכן, מהיר ותקין. בלי שתצטרכו לחשוב על זה.',
    freeBadge: false,
  },
  {
    Icon: Database,
    title: 'מערכת CRM',
    body: 'מקום אחד מסודר לכל הלקוחות והלידים שלכם, בשיטת HubSpot. כלול בחבילה, בלי עלות.',
    freeBadge: true,
  },
];

// מכסה עצמית לחבילה (המחיר ₪2,000 שמור ל-X העסקים הראשונים שמצטרפים).
const PACKAGE_SPOTS = 20;

// 🔧 עדכנו לתאריך סיום אמיתי של מבצע החג (למשל '15.10'). ריק = נוסח כללי.
const GIFT_DEADLINE = '';

// מה חשיפה במנועי AI נותנת לבעל עסק (מבוסס מחקר, 2026).
const aiBenefits = [
  {
    Icon: Gift,
    title: 'חשיפה בלי תקציב מדיה',
    body: 'כל אזכור שלכם בתשובה של ChatGPT או Gemini הוא חשיפה שלא שילמתם עליה שקל. פרסום אורגני טהור.',
  },
  {
    Icon: ShieldCheck,
    title: 'אמון שבא מראש',
    body: 'כשה-AI ממליץ עליכם, הלקוח מקבל את זה כהמלצה אובייקטיבית, לא כפרסומת. האמון נבנה עוד לפני שדיברתם איתו.',
  },
  {
    Icon: Target,
    title: 'לידים איכותיים יותר',
    body: 'מי שמגיע דרך המלצת AI מגיע כבר משוכנע ובשל. יחס ההמרה גבוה בהרבה מלידים של חיפוש רגיל.',
  },
  {
    Icon: Award,
    title: 'מיצוב כמומחים בתחום',
    body: 'להופיע בתשובה של ה-AI ממצב אתכם כגורם מוביל ומהימן בתחום שלכם, בדיוק ברגע שהלקוח מחליט.',
  },
  {
    Icon: Rocket,
    title: 'ראשוניות שקשה להשיג אחר כך',
    body: 'ה-AI בונה אמון במי שהוא כבר מכיר. מי שה-AI למד להכיר קודם, נשאר ברירת המחדל שלו גם כשהתחרות מתעוררת.',
  },
  {
    Icon: BarChart3,
    title: 'הלקוחות כבר מחפשים ככה',
    body: 'הקהל שלכם כבר שואל את ה-AI על עסקים בתחום. השימוש בזה קפץ מ-6% ל-45% בשנה, המקור השלישי הכי נפוץ אחרי גוגל ופייסבוק. השאלה היחידה היא אם השם שלכם בתשובה.',
    source: 'Entrepreneur',
    url: 'https://www.entrepreneur.com/growing-a-business/is-your-small-business-invisible-to-chatgpt-and-google-ai/502677',
  },
];

// תוצאות אמיתיות מפורסמות מהעולם (עם מקורות), במקום המחשה.
const realResults = [
  {
    stat: '8,337%',
    label: 'צמיחה בהפניות מ-ChatGPT ב-90 יום',
    source: 'The Rank Masters',
    url: 'https://www.therankmasters.com/insights/ai-visibility/generative-engine-optimization-geo-case-study-trm-chatgpt',
  },
  {
    stat: '25X',
    label: 'יחס המרה גבוה יותר מליד שהגיע דרך AI, לעומת חיפוש רגיל',
    source: 'Go Fish Digital',
    url: 'https://gofishdigital.com/blog/generative-engine-optimization-geo-case-study-driving-leads/',
  },
  {
    stat: '340%+',
    label: 'עלייה בתנועה ממנועי AI אחרי GEO',
    source: 'Single Grain',
    url: 'https://www.singlegrain.com/search-everywhere-optimization/real-geo-optimization-case-studies/',
  },
];

const faqs = [
  {
    q: 'זה באמת בחינם?',
    a: 'כן. מתנת חג, בלי עלות ובלי התחייבות. מי שירצה להמשיך איתנו אחרי זה, נדבר. מי שלא, נשאר עם מתנה שווה ביד.',
  },
  {
    q: 'מה זה GEO ו-AEO?',
    a: 'Generative ו-Answer Engine Optimization. אופטימיזציה למנועי התשובות, לגרום ל-ChatGPT, Gemini ופרפלקסיטי להכיר את העסק שלכם ולהמליץ עליו כשמישהו שואל.',
  },
  {
    q: 'למה אתם צריכים את הדומיין והתחום?',
    a: 'כדי לבנות GEO ממוקד. אנחנו סורקים את התוכן הקיים שלכם ומתאימים את הכתבות לתחום, לאזור ולקהל שלכם. בלי זה אי אפשר להכין תוצר איכותי.',
  },
  {
    q: 'כמה מקומות יש?',
    a: 'מוגבל. אנחנו לוקחים כמות עסקים ומכינים לכל אחד את החבילה באופן אישי. ראשונים זוכים.',
  },
  {
    q: 'מי עומד מאחורי זה?',
    a: 'HELIX, בית תוכנה שבונה אוטומציות, בוטים וכלי AI לעסקים קטנים. את המתנה הזו אנחנו נותנים כדי להראות בפועל איך GEO עובד על העסק שלכם.',
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

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'HELIX',
  url: SITE.url,
  description:
    'בית תוכנה שבונה אוטומציות, בוטים וכלי AI לעסקים קטנים, כולל GEO/AEO (אופטימיזציה למנועי בינה מלאכותית).',
  founder: [
    { '@type': 'Person', name: 'ערן ליפשטיין' },
    { '@type': 'Person', name: 'רון קלי' },
  ],
};

const productJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Product',
  name: 'מתנת חג HELIX, 3 תוצרים תומכי GEO/AEO',
  description:
    'סריקת תוכן ומילון מושגים לעסק, ושתי כתבות בנויות כך שמנועי בינה מלאכותית (ChatGPT, Gemini) יזהו את העסק וימליצו עליו.',
  brand: { '@type': 'Brand', name: 'HELIX' },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'ILS',
    availability: 'https://schema.org/InStock',
    url: `${SITE.url}/matana`,
  },
};

export default function MatanaPage() {
  return (
    <div className="matana-page">
      <JsonLd
        data={[
          organizationJsonLd,
          productJsonLd,
          faqJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'מתנת חג', url: `${SITE.url}/matana` },
          ]),
        ]}
      />

      {/* הירו */}
      <section className="vc-hero matana-hero" id="top">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" />
          <div className="geo-orb geo-orb-2" />
          <div className="geo-orb geo-orb-3" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <span className="community-partner">
            <Sparkles size={16} aria-hidden="true" /> מתנת חג · מאת הילדים הטובים של עולם הדיגיטל, HELIX
          </span>
          <h1 className="vc-headline">
            כשלקוח שואל את ChatGPT &quot;מה מומלץ&quot;,
            <br />
            <span className="accent">הוא שומע את השם שלכם?</span>
          </h1>
          <p className="vc-subline">
            לכבוד החג אנחנו ב-HELIX מכינים לכם, חברי קהילת העסקים הקטנים הצומחים,{' '}
            <strong>3 תוצרים תומכי GEO/AEO</strong> על העסק שלכם.{' '}
            <span className="matana-free">בחינם לגמרי.</span>
          </p>
          <p className="vc-subline matana-subline-2">
            ככה, כשלקוח ישאל את ChatGPT או Gemini &quot;מה מומלץ בתחום&quot;, יש סיכוי אמיתי שהשם
            שלכם יהיה בתשובה. בלי להוציא שקל על פרסום.
          </p>
          <a href="#register" className="btn btn-primary vc-cta">
            שריינו את המתנה 🎁
          </a>
          <p className="matana-hero-note">
            מתנת חג מ-HELIX, בשיתוף קהילת הפייסבוק <strong>עסקים קטנים צומחים</strong>.
          </p>

          <div className="matana-hero-phone">
            <div className="matana-phone">
              <video
                src="/matana-hero.mp4"
                poster="/matana-hero-poster.jpg"
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label="הדגמה: שיחה עם ChatGPT שממליץ על עסק"
              />
            </div>
          </div>
        </div>
      </section>

      {/* וידאו (נחשף כשמוגדר heroVideo) */}
      {heroVideo && (
        <ScrollReveal direction="up">
          <section className="matana-video-section">
            <div className="container">
              <div className="matana-video">
                <iframe
                  src={heroVideo}
                  title="מתנת חג HELIX"
                  loading="lazy"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* למה זה חשוב */}
      <ScrollReveal direction="up">
        <section className="vc-learnings">
          <div className="container">
            <SectionHeader
              eyebrow="למה עכשיו"
              title="החיפוש עבר לבינה מלאכותית."
              description="השם שקובע היום הוא לא מי ראשון בגוגל, אלא את מי ה-AI בוחר להזכיר."
              as="h2"
            />
            <div className="matana-cards">
              {whyCards.map(({ Icon, title, body }) => (
                <div className="matana-card" key={title}>
                  <span className="matana-card-icon" aria-hidden="true">
                    <Icon size={26} />
                  </span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* מה זה נותן לעסק */}
      <ScrollReveal direction="up">
        <section className="vc-format">
          <div className="container">
            <SectionHeader
              eyebrow="למה זה שווה"
              title="מה חשיפה ב-AI נותנת לעסק שלכם."
              description="זה לא רק עוד ערוץ. זו דרך חדשה לגמרי שלקוחות מגלים, בוחרים, וסומכים על עסקים."
              as="h2"
            />
            <div className="matana-cards">
              {aiBenefits.map(({ Icon, title, body, source, url }) => (
                <div className="matana-card" key={title}>
                  <span className="matana-card-icon" aria-hidden="true">
                    <Icon size={26} />
                  </span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                  {source && url && (
                    <a className="matana-result-source" href={url} target="_blank" rel="noopener noreferrer">
                      מקור: {source}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* תוצאות אמיתיות */}
      <ScrollReveal direction="up">
        <section className="vc-learnings">
          <div className="container">
            <SectionHeader
              eyebrow="זה עובד"
              title="תוצאות אמיתיות מהשטח."
              description="לא הבטחות. ככה GEO עובד לעסקים בעולם, עם מקורות שאפשר לבדוק."
              as="h2"
            />
            <div className="matana-results">
              {realResults.map((r) => (
                <div className="matana-result" key={r.stat}>
                  <span className="matana-result-stat">{r.stat}</span>
                  <p className="matana-result-label">{r.label}</p>
                  <a className="matana-result-source" href={r.url} target="_blank" rel="noopener noreferrer">
                    מקור: {r.source}
                  </a>
                </div>
              ))}
            </div>
            <p className="matana-results-note">
              התוצאות תלויות בתחום ובנקודת הפתיחה של כל עסק. לא מבטיחים מספרים כאלה.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA ביניים */}
      <div className="matana-mid-cta">
        <a href="#register" className="btn btn-primary">שריינו את המתנה 🎁</a>
      </div>

      {/* מה כוללת המתנה */}
      <ScrollReveal direction="up">
        <section className="vc-format">
          <div className="container">
            <SectionHeader
              eyebrow="המתנה"
              title="מה יש במתנה."
              description="שלושה תוצרים, בנויים בדיוק כך שמנועי הבינה המלאכותית יזהו אתכם וימליצו עליכם."
              as="h2"
            />
            <div className="matana-deliverables">
              {deliverables.map(({ Icon, tag, title, body }) => (
                <div className="matana-deliverable" key={tag}>
                  <span className="matana-deliverable-icon" aria-hidden="true">
                    <Icon size={28} />
                  </span>
                  <span className="matana-deliverable-tag">{tag}</span>
                  <h3>{title}</h3>
                  <p>{body}</p>
                </div>
              ))}
            </div>
            <p className="community-content-note">
              הכל בחינם, בלי התחייבות ובלי אותיות קטנות. מתנה זה מתנה.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* איך זה עובד */}
      <ScrollReveal direction="up">
        <section className="vc-learnings">
          <div className="container">
            <SectionHeader eyebrow="איך זה עובד" title="שלושה צעדים." as="h2" />
            <ol className="matana-steps">
              {steps.map((s) => (
                <li key={s.n}>
                  <span className="matana-step-n" aria-hidden="true">{s.n}</span>
                  <div>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </ScrollReveal>

      {/* הטופס */}
      <ScrollReveal direction="up">
        <section className="vc-register" id="register">
          <div className="container">
            <SectionHeader
              eyebrow="קבלת המתנה"
              title="השאירו פרטים, ונתחיל להכין."
              description="ככל שנדע יותר על העסק, כך הכתבות יהיו ממוקדות יותר. השדות המסומנים ב-* הם מה שחייבים כדי להתחיל."
              as="h2"
            />
            <p className="matana-urgency">
              <span className="matana-urgency-dot" aria-hidden="true" />
              {GIFT_DEADLINE
                ? `מבצע החג פתוח עד ${GIFT_DEADLINE}. מספר המקומות מוגבל, ראשונים זוכים.`
                : 'מבצע החג לזמן מוגבל. מספר המקומות מוגבל, ראשונים זוכים.'}
            </p>
            <div className="community-hero-form">
              <MatanaForm endpoint="/api/matana-lead" />
            </div>
            <ul className="matana-trust" aria-label="למה לסמוך עלינו">
              <li>בחינם לגמרי</li>
              <li>בלי התחייבות</li>
              <li>מ-HELIX, בשיתוף קהילת עסקים קטנים צומחים</li>
            </ul>
          </div>
        </section>
      </ScrollReveal>

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
                />
              </div>
              <div className="community-about-text">
                <p>
                  אנחנו <strong>ערן ורון</strong>, המייסדים של HELIX, בית תוכנה שבונה אוטומציות,
                  בוטים וכלי AI לעסקים קטנים. מבטיחים פחות, מספקים יותר.
                </p>
                <p>
                  את המתנה הזו אנחנו נותנים מסיבה פשוטה: הכי קל להסביר את הכוח של GEO כשרואים
                  אותו עובד על העסק שלכם. אז במקום להסביר, אנחנו פשוט מראים.
                </p>
                {communityUrl && (
                  <p>
                    וזה חלק ממשהו גדול יותר, <strong>קהילת הפרגונים</strong> שלנו, בשיתוף קהילת
                    הפייסבוק עסקים קטנים צומחים.{' '}
                    <a href={communityUrl} target="_blank" rel="noopener noreferrer" className="matana-inline-link">
                      הצטרפו לקהילה
                    </a>{' '}
                    וקבלו פרגון אמיתי וצמיחה משותפת בכל הרשתות.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* החבילה שאחרי המתנה */}
      <ScrollReveal direction="up">
        <section className="vc-format matana-package-section">
          <div className="geo-atmos" aria-hidden="true">
            <div className="geo-grid" />
            <div className="geo-orb geo-orb-2" />
          </div>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <SectionHeader
              eyebrow="הצעת ההמשך"
              title="רוצים להמשיך את הכוח של GEO?"
              description="החבילה שלנו ששווה הרבה יותר ממה שתשלמו עליה. לחצו כדי למחוק את הטשטוש ולגלות."
              as="h2"
            />
            <SecretReveal>
            <div className="matana-package">
              <div className="matana-package-items">
                {packageItems.map(({ Icon, title, body, freeBadge }) => (
                  <div className={['matana-package-item', freeBadge ? 'matana-package-item-free' : ''].filter(Boolean).join(' ')} key={title}>
                    <span className="matana-package-icon" aria-hidden="true">
                      <Icon size={24} />
                    </span>
                    <div>
                      <h3>
                        {title}
                        {freeBadge && <span className="matana-package-free-pill">חינם</span>}
                      </h3>
                      <p>{body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="matana-package-value">
                <p className="matana-package-anchor">
                  סוכנויות גובות על כל השירותים האלה כ-<strong>₪6,000-8,000 בחודש</strong>, וגם אז
                  אתם מתנהלים מול כמה ספקים שונים במקביל.
                </p>
                <p className="matana-package-pitch">
                  אצלנו הכל במקום אחד, מצוות אחד שמכיר את העסק שלכם. וכי אנחנו הילדים הטובים של עולם
                  הדיגיטל ובא לנו לפרגן לעסקים ישראלים, המחיר הוא:
                </p>
                <div className="matana-package-price">
                  <span className="matana-package-price-was">₪8,000</span>
                  <span className="matana-package-price-now">₪2,000</span>
                  <span className="matana-package-price-per">לחודש</span>
                </div>
                <div className="matana-package-freemonth">
                  <span className="matana-package-freemonth-badge">🎁 והחודש הראשון עלינו</span>
                  מתחילים ב-₪0, משלמים רק מהחודש השני. בלי התחייבות, אפשר לעצור מתי שרוצים.
                </div>
                <p className="matana-package-spots">
                  <span className="matana-urgency-dot" aria-hidden="true" />
                  המחיר הזה שמור ל-<strong>{PACKAGE_SPOTS} העסקים הראשונים</strong> שמצטרפים.
                </p>
                <p className="matana-package-expectation">
                  GEO מתחיל להניב תוך 60-90 יום. ממליצים לתת לזה לפחות 3 חודשים, אבל לא כולאים אתכם.
                </p>
                <a
                  href="https://wa.me/972544468883?text=%D7%94%D7%99%D7%99%2C%20%D7%A8%D7%90%D7%99%D7%AA%D7%99%20%D7%90%D7%AA%20%D7%97%D7%91%D7%99%D7%9C%D7%AA%20%D7%94%D7%93%D7%99%D7%92%D7%99%D7%98%D7%9C%20%D7%95%D7%94%D7%91%D7%99%D7%A0%D7%94%20%D7%94%D7%9E%D7%9C%D7%90%D7%9B%D7%95%D7%AA%D7%99%D7%AA%20%D7%95%D7%90%D7%A9%D7%9E%D7%97%20%D7%9C%D7%A9%D7%9E%D7%95%D7%A2%20%D7%A2%D7%9C%20%D7%94%D7%9E%D7%97%D7%99%D7%A8%20%D7%94%D7%9E%D7%99%D7%95%D7%97%D7%93"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  לפרטים ולהצטרפות
                </a>
                <p className="matana-package-alt">
                  רק את ה-GEO אתם רוצים? יש גם מסלול <strong>המשך GEO</strong> (4 כתבות + דוח חשיפה)
                  ב-₪990 בחודש.
                </p>
              </div>
            </div>
            </SecretReveal>
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

      {/* CTA דביק במובייל, מסתיר את עצמו כשהטופס גלוי */}
      <StickyCta />
    </div>
  );
}
