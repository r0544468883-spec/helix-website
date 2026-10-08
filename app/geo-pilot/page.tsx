import type { Metadata } from 'next';
import {
  MessageSquareText, Crown, Target, TrendingUp, ShieldCheck, Award, Layers, BarChart3,
  ScanSearch, FileText, CalendarCheck, LineChart, Sparkles,
} from 'lucide-react';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import JsonLd from '../components/JsonLd';
import SectionHeader from '../components/SectionHeader';
import ScrollReveal from '../components/ScrollReveal';
import AnimatedCounter from '../components/service/AnimatedCounter';
import GeoPilotForm from './GeoPilotForm';
import GeoStickyCta from './GeoStickyCta';

const PILOT_PRICE = '₪1,500';

export const metadata: Metadata = {
  title: 'GEO למותגים · שהמותג שלכם יעלה בשיחה עם ה-AI | HELIX',
  description:
    'הלקוחות כבר לא מחפשים בגוגל, הם מתייעצים עם ChatGPT. פיילוט GEO/AEO למותגים: אבחון נראות, כתבות שה-AI מצטט, שכתוב תוכן, קישור חיצוני וכתבות לינקדאין. כשלקוח מתייעץ על הבעיה שאתם פותרים, שהמותג שלכם יעלה בשיחה.',
  alternates: { canonical: '/geo-pilot' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'GEO למותגים · שהמותג שלכם יעלה בשיחה עם ה-AI',
    description:
      'הלקוחות מתייעצים עם ה-AI כמו עם חבר חכם, וה-AI ממליץ על מותג באמצע השיחה. בפיילוט GEO של HELIX אנחנו דואגים שהמותג שלכם ייכנס ראשון.',
    url: '/geo-pilot',
    type: 'website',
    locale: 'he_IL',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'GEO למותגים · HELIX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GEO למותגים · שהמותג שלכם יעלה בשיחה עם ה-AI',
    description: 'כשלקוח מתייעץ עם ChatGPT על הבעיה שאתם פותרים, שהמותג שלכם יעלה בשיחה. פיילוט GEO מ-HELIX.',
    images: ['/opengraph-image'],
  },
};

// למה עכשיו, במסגרת קבלת החלטות של מנהל שיווק
const whyCards = [
  {
    Icon: MessageSquareText,
    title: 'הלקוחות מתייעצים, לא מחפשים',
    body: 'אנשים כבר לא מקלידים "המותג הכי טוב ל..." כאילו זו גוגל. הם מתארים ל-AI בעיה בשפה חופשית, כמו לחבר חכם, וה-AI ממליץ להם על מותג באמצע השיחה. זו שיחה, לא חיפוש, וזה משנה הכל.',
  },
  {
    Icon: TrendingUp,
    title: 'הנוכחות בשיחה היא ה-Share of Voice החדש',
    body: 'פעם נלחמתם על המקום הראשון בגוגל. היום המדד הוא על כמה מהשיחות בקטגוריה שלכם ה-AI מזכיר דווקא אתכם. קוראים לזה Share of Answer, והיום כמעט אף מותג בישראל לא מנהל אותו.',
  },
  {
    Icon: Crown,
    title: 'מי שנכנס ראשון קובע את ברירת המחדל',
    body: 'מנועי ה-AI בונים אמון במותגים שהם כבר מכירים. המותג שה-AI למד להכיר קודם נשאר ברירת המחדל שלו בשיחות הבאות, גם כשהמתחרים יתעוררו. החלון הזה פתוח עכשיו, לא לנצח.',
  },
];

// מה GEO נותן למותג (ערך למנהל שיווק)
const brandBenefits = [
  {
    Icon: Target,
    title: 'נוכחות בלי תקציב מדיה',
    body: 'כל אזכור של המותג שלכם בתשובה של ChatGPT הוא חשיפה שלא שילמתם עליה שקל מדיה. חשיפה אורגנית, בדיוק ברגע שבו הלקוח מחליט.',
  },
  {
    Icon: ShieldCheck,
    title: 'אמון שמגיע מראש',
    body: 'כשה-AI ממליץ עליכם, הלקוח מקבל את זה כהמלצה אובייקטיבית ולא כפרסומת. חלק גדול מהעבודה של בניית האמון כבר נעשה לפני שהוא הגיע אליכם.',
  },
  {
    Icon: Award,
    title: 'מיצוב כמוביל קטגוריה',
    body: 'להופיע בתשובה ממצב אתכם כגורם מוביל ומהימן בתחום. זה בונה את המותג בדיוק באותם מקומות שבהם מתקבלות החלטות הרכש.',
  },
  {
    Icon: Layers,
    title: 'נכס שמצטבר, לא קמפיין שנגמר',
    body: 'קמפיין מדיה נעלם ברגע שמפסיקים לשלם. כל כתבה ואזכור שאנחנו בונים נשארים ומחזקים את הבא. זה נכס מותג שממשיך לעבוד.',
  },
  {
    Icon: TrendingUp,
    title: 'לידים בשלים יותר',
    body: 'מי שמגיע דרך המלצת AI מגיע כבר משוכנע. בעולם מדווחים על יחס המרה גבוה בהרבה מלידים של חיפוש רגיל.',
  },
  {
    Icon: BarChart3,
    title: 'מדיד, לא הרגשה',
    body: 'עוקבים על אילו שאלות אתם עולים, באילו מנועים, ולצד אילו מתחרים. מראים את המגמה חודש אחרי חודש, לא הבטחות.',
  },
];

// תוצאות אמיתיות מהעולם, עם מקורות. end/prefix/suffix להנפשת המספר מ-0.
const realResults = [
  {
    end: 8337, prefix: '', suffix: '%',
    label: 'צמיחה בהפניות מ-ChatGPT ב-90 יום',
    source: 'The Rank Masters',
    url: 'https://www.therankmasters.com/insights/ai-visibility/generative-engine-optimization-geo-case-study-trm-chatgpt',
  },
  {
    end: 25, prefix: '', suffix: 'X',
    label: 'יחס המרה גבוה יותר מליד שהגיע דרך AI, לעומת חיפוש רגיל',
    source: 'Go Fish Digital',
    url: 'https://gofishdigital.com/blog/generative-engine-optimization-geo-case-study-driving-leads/',
  },
  {
    end: 340, prefix: '', suffix: '%+',
    label: 'עלייה בתנועה ממנועי AI אחרי GEO',
    source: 'Single Grain',
    url: 'https://www.singlegrain.com/search-everywhere-optimization/real-geo-optimization-case-studies/',
  },
];

// שלבי הפיילוט (4 חודשים)
const phases = [
  {
    tag: 'חודש 1',
    title: 'הקמה ואבחון',
    Icon: ScanSearch,
    items: [
      'ניתוח האתר והתוכן הקיים, ובדיקת נראות של המותג במנועי ה-AI היום',
      '2 פגישות זום KICKOFF: מיפוי השאלות שהקהל שלכם שואל את ה-AI, והחלטה על הנושאים לקידום',
      '3 כתבות תומכות-GEO: מילון מושגים של המותג + 2 כתבות ממוקדות לנושאים שתבחרו',
    ],
  },
  {
    tag: 'חודשים 2 עד 4',
    title: 'פיילוט, שלושה חודשים',
    Icon: LineChart,
    items: [
      '5 כתבות GEO בכל חודש, בנויות כך שמנועי ה-AI אוהבים לשלוף ולצטט',
      'שכתוב תוכן קיים כך שה-AI יוכל לקרוא אותו, להבין ולצטט',
      'קישור לאתרים חיצוניים: אזכורי צד-שלישי שנותנים ל-AI מקורות שמסכימים זה עם זה',
      'כתבות לינקדאין לחיזוק המותג ונוכחות ההנהלה',
    ],
  },
];

const steps = [
  {
    n: '1',
    Icon: CalendarCheck,
    title: 'אבחון ו-2 פגישות KICKOFF',
    body: 'מנתחים את האתר, בודקים איפה אתם עולים היום במנועי ה-AI ואיפה לא, וממפים יחד את השאלות שהקהל שלכם באמת שואל.',
  },
  {
    n: '2',
    Icon: FileText,
    title: 'בונים את הנכסים',
    body: 'כתבות שה-AI מצטט, מילון מושגים, שכתוב התוכן הקיים, קישור לאתרים חיצוניים וכתבות לינקדאין. הכל במבנה שמנועי ה-AI יודעים לשלוף.',
  },
  {
    n: '3',
    Icon: BarChart3,
    title: 'מודדים ומשפרים',
    body: 'עוקבים על אילו שאלות המותג שלכם עולה, באילו מנועים ולצד אילו מתחרים. מראים את המגמה ומכוונים את החודש הבא לפיה.',
  },
];

const faqs = [
  {
    q: 'מה זה בעצם GEO ו-AEO?',
    a: 'Generative Engine Optimization ו-Answer Engine Optimization, או בפשטות: אופטימיזציה למנועי התשובות. במקום לדאוג שתהיו ראשונים בגוגל, דואגים שכשלקוח מתייעץ עם ChatGPT, עם Claude, עם Gemini או עם Perplexity על הבעיה שאתם פותרים, השם שלכם יעלה בשיחה.',
  },
  {
    q: 'איך מודדים הצלחה?',
    a: 'שני מדדים. הראשון דטרמיניסטי: האם מנועי ה-AI בכלל מצליחים להגיע לתוכן שלכם, לקרוא אותו ולהבין מי אתם. השני הוא נתח השיחה (Share of Answer): על כמה מהשיחות בקטגוריה שלכם ה-AI מזכיר אתכם. המנועים לא דטרמיניסטיים, אז עוקבים אחרי המגמה לאורך זמן, לא אחרי מספר בודד.',
  },
  {
    q: 'כמה זמן עד שרואים תוצאות?',
    a: 'GEO מתחיל להניב בדרך כלל תוך 60 עד 90 יום, ולכן הפיילוט בנוי לשלושה חודשים אחרי חודש ההקמה. חודש ההקמה מניח את התשתית, והחודשים שאחריו בונים את הנוכחות בהדרגה.',
  },
  {
    q: 'למה דווקא כתבות לינקדאין?',
    a: 'מנועי ה-AI סומכים יותר על מותג שמוזכר ביותר ממקום אחד. כתבות לינקדאין מחזקות את נוכחות המותג וההנהלה, ומוסיפות עוד מקור שמספר ל-AI את אותו סיפור. ככה נבנית ההסכמה שגורמת ל-AI להמליץ עליכם.',
  },
  {
    q: 'מה ההבדל בין זה לבין SEO רגיל?',
    a: 'SEO נלחם על דירוג של עמוד בגוגל. GEO נלחם על אזכור של המותג בתוך תשובה של AI. הם חופפים בחלקים (מבנה נקי, נתונים מובנים, תוכן עדכני עוזרים לשניהם), אבל ניצחון ב-SEO לא אומר שאתם מופיעים בתשובות של ה-AI. זה משחק נפרד שצריך לנהל במכוון.',
  },
  {
    q: 'מי כותב את התוכן?',
    a: 'HELIX, בית תוכנה שבונה כלי AI, אוטומציות ותוכן לעסקים. התוכן נבנה בעזרת מערכת הכלים שלנו ועובר הגהה אנושית, כך שהוא נקרא אנושי ונכתב מדויק לקטגוריה שלכם.',
  },
  {
    q: 'יש התחייבות ארוכה?',
    a: 'לא. חודש הקמה ואז פיילוט של שלושה חודשים. אחרי זה מחליטים יחד אם ממשיכים. הרעיון הוא שתראו תוצאות לפני שאתם מתחייבים לטווח ארוך.',
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
    'בית תוכנה שבונה כלי AI, אוטומציות ותוכן לעסקים, כולל GEO/AEO (אופטימיזציה למנועי בינה מלאכותית) למותגים.',
  founder: [
    { '@type': 'Person', name: 'ערן ליפשטיין' },
    { '@type': 'Person', name: 'רון קלי' },
  ],
};

const serviceJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'פיילוט GEO/AEO למותגים',
  serviceType: 'Generative Engine Optimization',
  provider: { '@type': 'Organization', name: 'HELIX', url: SITE.url },
  description:
    'פיילוט GEO/AEO למותגים: חודש הקמה (ניתוח אתר, 2 פגישות KICKOFF, 3 כתבות ומילון מושגים) ואז שלושה חודשי פיילוט (5 כתבות בחודש, שכתוב תוכן, קישור חיצוני וכתבות לינקדאין).',
  areaServed: 'IL',
  offers: {
    '@type': 'Offer',
    price: '1500',
    priceCurrency: 'ILS',
    availability: 'https://schema.org/InStock',
    url: `${SITE.url}/geo-pilot`,
    description: 'חודשי, בלי התחייבות ארוכה',
  },
};

function PhaseCard({ phase, className = '' }: { phase: (typeof phases)[number]; className?: string }) {
  const { tag, title, Icon, items } = phase;
  return (
    <div className={`geo-offer-card ${className}`.trim()}>
      <div className="geo-offer-head">
        <span className="geo-offer-icon" aria-hidden="true"><Icon size={24} /></span>
        <div>
          <span className="geo-offer-tag">{tag}</span>
          <h3>{title}</h3>
        </div>
      </div>
      <ul className="geo-offer-list">
        {items.map((it) => (
          <li key={it}>{it}</li>
        ))}
      </ul>
    </div>
  );
}

export default function GeoPilotPage() {
  return (
    <div className="matana-page geo-pilot-page">
      <JsonLd
        data={[
          organizationJsonLd,
          serviceJsonLd,
          faqJsonLd,
          breadcrumbSchema([
            { name: 'בית', url: SITE.url },
            { name: 'GEO למותגים', url: `${SITE.url}/geo-pilot` },
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
            <Sparkles size={16} aria-hidden="true" /> GEO למותגים · מאת HELIX
          </span>
          <h1 className="vc-headline">
            הלקוחות שלכם כבר לא מחפשים בגוגל. הם מתייעצים עם ה-AI.
            <br />
            <span className="accent">כשזה קורה, מי עולה בשיחה?</span>
          </h1>
          <p className="vc-subline">
            אנשים כבר לא מקלידים מילות חיפוש. הם מתייעצים עם ChatGPT, עם Claude, עם Gemini ועם Perplexity
            כמו עם חבר חכם: &quot;יש לי בעיה כזו, מה אתם ממליצים?&quot;, וה-AI עונה באמצע השיחה עם שם של מותג
            אחד או שניים. <strong>זו שיחה, לא חיפוש, וזה משנה הכל.</strong>
          </p>
          <p className="vc-subline matana-subline-2">
            השאלה שחשובה עכשיו היא לא איך אתם מדורגים בגוגל, אלא אם כשלקוח מתייעץ על מה שאתם פותרים,
            המותג שלכם הוא שעולה בשיחה, או שמתחרה תופס את המקום. ה-AI זוכר את המותג שפגש ראשון, והחלון
            הזה הולך ונסגר ככל שעוד מתחרים נכנסים. <strong>בפיילוט GEO של HELIX אנחנו דואגים שהמותג שלכם
            ייכנס ראשון.</strong>
          </p>
          <div className="geo-hero-ctas">
            <a href="#register" className="btn btn-primary vc-cta">קבעו שיחת GEO</a>
            <a href="#register" className="btn btn-ghost vc-cta">קבלו דוח נראות ב-AI, חינם</a>
          </div>
          <p className="matana-hero-note">
            פיילוט של 4 חודשים · <strong>{PILOT_PRICE} לחודש</strong> · בלי התחייבות ארוכה
          </p>
        </div>
      </section>

      {/* למה עכשיו */}
      <ScrollReveal direction="up">
        <section className="vc-learnings">
          <div className="container">
            <SectionHeader
              eyebrow="למה עכשיו"
              title="החיפוש הפך לשיחה."
              description="הלקוחות לא מחפשים אתכם, הם מתייעצים עם ה-AI. מי שה-AI מזכיר באמצע השיחה, מקבל את הלקוח."
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

      {/* מה GEO נותן למותג */}
      <ScrollReveal direction="up">
        <section className="vc-format">
          <div className="container">
            <SectionHeader
              eyebrow="למה זה שווה"
              title="מה נוכחות ב-AI נותנת למותג שלכם."
              description="זה לא עוד ערוץ. זו דרך חדשה שבה לקוחות מגלים מותגים, בוחרים, וסומכים, עוד לפני שדיברו איתכם."
              as="h2"
            />
            <div className="matana-cards">
              {brandBenefits.map(({ Icon, title, body }) => (
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

      {/* תוצאות אמיתיות */}
      <ScrollReveal direction="up">
        <section className="vc-learnings">
          <div className="container">
            <SectionHeader
              eyebrow="זה עובד"
              title="תוצאות אמיתיות מהשטח."
              description="לא הבטחות. ככה GEO עובד למותגים בעולם, עם מקורות שאפשר לבדוק."
              as="h2"
            />
            <div className="matana-results">
              {realResults.map((r) => (
                <div className="matana-result" key={r.label}>
                  <span className="matana-result-stat">
                    <AnimatedCounter end={r.end} prefix={r.prefix} suffix={r.suffix} />
                  </span>
                  <p className="matana-result-label">{r.label}</p>
                  <a className="matana-result-source" href={r.url} target="_blank" rel="noopener noreferrer">
                    מקור: {r.source}
                  </a>
                </div>
              ))}
            </div>
            <p className="matana-results-note">
              התוצאות תלויות בקטגוריה ובנקודת הפתיחה של כל מותג. לא מבטיחים מספרים כאלה.
            </p>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA ביניים */}
      <div className="matana-mid-cta">
        <a href="#register" className="btn btn-primary">קבעו שיחת GEO</a>
      </div>

      {/* ההצעה, 4 חודשים */}
      <ScrollReveal direction="up">
        <section className="vc-format">
          <div className="geo-atmos" aria-hidden="true">
            <div className="geo-grid" />
            <div className="geo-orb geo-orb-2" />
          </div>
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <SectionHeader
              eyebrow="ההצעה"
              title="פיילוט GEO של 4 חודשים."
              description="חודש הקמה שמניח את התשתית, ואז שלושה חודשי פיילוט שבונים נוכחות אמיתית בתשובות של ה-AI."
              as="h2"
            />
            {/* חודש ההקמה */}
            <div className="geo-offer-setup">
              <PhaseCard phase={phases[0]} />
            </div>

            {/* משפט מקשר שמכין לפיילוט */}
            <p className="geo-offer-leadin">
              חודש ההקמה מניח את היסודות. מכאן מתחיל החלק שבונה לכם נוכחות אמיתית בשיחות עם ה-AI,
              חודש אחרי חודש.
            </p>

            {/* הפיילוט, מודגש עם הילה וקו */}
            <div className="geo-offer-pilot-wrap">
              <PhaseCard phase={phases[1]} className="geo-offer-pilot" />
              <span className="geo-offer-underline" aria-hidden="true" />
            </div>

            <div className="geo-offer-price">
              <div className="geo-offer-price-main">
                <span className="geo-offer-price-num">{PILOT_PRICE}</span>
                <span className="geo-offer-price-per">לחודש</span>
              </div>
              <p className="geo-offer-price-note">
                מחיר אחיד לכל חודשי הפיילוט. בלי התחייבות ארוכה, אחרי הפיילוט מחליטים יחד אם ממשיכים.
              </p>
              <a href="#register" className="btn btn-primary">מתאים לי, בואו נדבר</a>
            </div>
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
              eyebrow="בואו נתחיל"
              title="שיחת GEO, או דוח נראות ב-AI, חינם."
              description="בוחרים דוח נראות? נבדוק את האתר שלכם ידנית מול מנועי ה-AI ונחזור אליכם בוואטסאפ עם הדוח. בוחרים שיחה? נחזור אליכם בוואטסאפ לתיאום. השדות המסומנים ב-* חובה."
              as="h2"
            />
            <div className="community-hero-form">
              <GeoPilotForm endpoint="/api/geo-pilot-lead" />
            </div>
            <ul className="matana-trust" aria-label="למה לסמוך עלינו">
              <li>דוח נראות ראשוני בלי עלות</li>
              <li>בלי התחייבות ארוכה</li>
              <li>מ-HELIX, בית תוכנה ו-AI לעסקים</li>
            </ul>
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

      <GeoStickyCta />
    </div>
  );
}
