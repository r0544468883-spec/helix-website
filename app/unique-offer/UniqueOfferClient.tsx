'use client';

import { Check, Phone, Calendar, Clock, MapPin, Mic, Users, Coffee } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import FAQItem from '../components/FAQItem';
import VideoPhone from './VideoPhone';
import UniqueOfferLeadForm from './UniqueOfferLeadForm';

const PHONE_DISPLAY = '054-446-8883';
const PHONE_TEL = 'tel:+972544468883';

const EVENT_DATE = 'יום שלישי, 1.12.2026';
const EVENT_TIME = '17:00';

const WA_MISS = `https://wa.me/972544468883?text=${encodeURIComponent(
  'היי, לא אוכל להגיע לאירוע, אשמח לקבל את עיקרי ההרצאה',
)}`;

// לוגואים של עסקים שעבדנו איתם (הוכחה חברתית)
const CLIENT_LOGOS = [
  { src: '/clients/cob.png', alt: 'Career on Board' },
  { src: '/clients/datavision.jpg', alt: 'DATAVISION' },
  { src: '/clients/hakol-barosh.webp', alt: 'הכל בראש' },
  { src: '/clients/shoval.jpg', alt: 'שובל התנועה' },
  { src: '/clients/hatuka.webp', alt: 'חתוקה מנעולים' },
];

// מה יהיה בערב, עם דגש על תוצאות ולא על פורמט
const AGENDA = [
  { icon: Mic, title: 'הרצאה', text: 'רון קלי מראה איך לבדוק אם ChatGPT ממליץ על העסק שלכם היום, ומה לשנות כדי שכן. בשפה פשוטה, בלי רקע טכני.' },
  { icon: Users, title: 'ייעוץ אישי 1-על-1', text: 'שבו איתנו אחד-על-אחד על העסק שלכם, ותצאו עם צעד מעשי אחד ליישום כבר מחר. לא הרצאה כללית, תשובה ספציפית לעסק שלכם.' },
  { icon: Coffee, title: 'כיבוד', text: 'קפה, עוגה ומשהו קל לשתות. אווירה נינוחה, בלי מצגות מכירה.' },
];

// מה תיקחו מהערב, בניסוח תוצאה לבעל העסק (לא רשימת שירותים)
const TAKEAWAYS = [
  'איך לבדוק אם ChatGPT בכלל מכיר את העסק שלכם היום',
  'מה גורם לבינה המלאכותית להמליץ דווקא עליכם',
  'אילו אוטומציות פשוטות חוסכות לכם זמן ומביאות לקוחות',
  'איך לדעת איפה אתם עומדים מול המתחרים, ומה לעשות עם זה כבר מחר',
  'מאיפה מתחילים, בלי מתכנת ובלי תקציב גדול',
];

const FAQS = [
  { q: 'זה אירוע מכירות?', a: 'לא. באים ללמוד, לקבל ייעוץ אישי וכיוון מעשי. נספר בקצרה מה אנחנו עושים למי שישאל, אבל אין לחץ ואין חובה לקנות כלום. גם מי שילך בלי לקנות שום דבר, ייצא עם משהו ליישם כבר מחר.' },
  { q: 'כמה עולה להשתתף?', a: 'הכניסה חינם לגמרי. מספר המקומות מוגבל, אז כדאי להירשם מראש.' },
  { q: 'הייעוץ האישי, כולם מקבלים?', a: 'כן. כל מי שמגיע יושב איתנו אחד-על-אחד על העסק שלו. זו לא שיחת מכירה, זו פגישה קצרה שבה אתם יוצאים עם צעד מעשי אחד ליישום.' },
  { q: 'איפה זה בדיוק?', a: 'האירוע ייערך בצפון. המיקום המדויק יישלח לנרשמים בהודעה לפני האירוע.' },
  { q: 'למי האירוע מתאים?', a: 'לכל בעל עסק או עצמאי במגזר החרדי שרוצה להביא יותר לקוחות בעזרת שיווק, אוטומציה ובינה מלאכותית. לא צריך רקע טכני.' },
  { q: 'צריך להביא משהו או להתכונן?', a: 'לא. בואו כמו שאתם. אם בא לכם, תחשבו מראש על אתגר שיווקי אחד שתרצו להתייעץ עליו.' },
];

function EventMeta() {
  return (
    <div className="uo-event-meta">
      <span className="uo-event-chip"><Calendar size={16} /> {EVENT_DATE}</span>
      <span className="uo-event-chip"><Clock size={16} /> {EVENT_TIME}</span>
      <span className="uo-event-chip"><MapPin size={16} /> בצפון · המיקום יישלח לנרשמים</span>
    </div>
  );
}

export default function UniqueOfferClient() {
  return (
    <>
      {/* INVITATION CARD */}
      <section className="uo-invite">
        <div className="uo-invite-atmos" aria-hidden="true" />
        <div className="container">
          <div className="uo-invite-card">
            {(['tl', 'tr', 'br', 'bl'] as const).map((c) => (
              <span key={c} className={`uo-invite-corner uo-corner-${c}`} aria-hidden="true">
                <svg viewBox="0 0 34 34" width="34" height="34" fill="none">
                  <path d="M2 2v11M2 2h11" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
                  <path d="M2 2c8 0 13 5 13 13" stroke="#34d399" strokeWidth="1" strokeLinecap="round" opacity="0.32" />
                  <circle cx="2" cy="2" r="1.7" fill="#34d399" opacity="0.7" />
                </svg>
              </span>
            ))}
            <div className="uo-invite-seal" aria-hidden="true">
              <svg viewBox="0 0 60 60" width="56" height="56" fill="none">
                <circle cx="30" cy="30" r="27" stroke="#34d399" strokeWidth="1.5" />
                <circle cx="30" cy="30" r="22" stroke="#34d399" strokeWidth="0.7" opacity="0.45" />
                <path d="M30 16l3.4 10.6L44 30l-10.6 3.4L30 44l-3.4-10.6L16 30l10.6-3.4z" fill="#34d399" />
              </svg>
            </div>
            <span className="uo-invite-eyebrow">הזמנה מבית HELIX</span>
            <h2 className="uo-invite-title">בעלי עסקים במגזר החרדי, אתם מוזמנים</h2>
            <p className="uo-invite-body">
              אנחנו ב-HELIX מזמינים אתכם לערב אחד בצפון, במיוחד לבעלי עסקים מהמגזר: שיווק, אוטומציה
              ובינה מלאכותית, בשפה פשוטה. הרצאה, ייעוץ אישי 1-על-1 וכוס קפה טובה. בלי עלות ובלי התחייבות.
            </p>
            <div className="uo-invite-divider"><span /></div>
            <div className="uo-invite-date">
              <span className="uo-invite-day">יום שלישי</span>
              <span className="uo-invite-dnum">1 בדצמבר 2026</span>
              <span className="uo-invite-dsub">17:00 · בצפון</span>
            </div>
            <a href="#register" className="sp2-final-btn uo-invite-cta">שריינו מקום</a>
          </div>
        </div>
      </section>

      {/* HERO */}
      <section className="geo-hero">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" />
          <div className="geo-orb geo-orb-2" />
          <div className="geo-orb geo-orb-3" />
        </div>
        <div className="container">
          <span className="geo-hero-badge"><span className="dot" /> אירוע חינם לבעלי עסקים במגזר החרדי · צפון</span>

          <div className="uo-hero-grid">
            <ScrollReveal direction="right">
              <div className="uo-hero-copy">
                <h1 className="uo-hero-title">
                  הלקוחות שלכם כבר שואלים את ChatGPT למי לפנות.{' '}
                  <span className="uo-hl">בואו נדאג שישמעו עליכם.</span>
                </h1>
                <p className="geo-hero-sub" style={{ marginInline: 0 }}>
                  ערב אחד בצפון עם רון קלי: הרצאה על שיווק ובינה מלאכותית, ייעוץ אישי 1-על-1 על העסק
                  שלכם, וכיוון מעשי שאפשר להתחיל איתו כבר מחר בבוקר. בשפה פשוטה, בלי רקע טכני.
                </p>
                <EventMeta />
                <div className="uo-hero-cta">
                  <a href="#register" className="sp2-final-btn">שריינו מקום</a>
                  <a href={PHONE_TEL} className="btn btn-minimal uo-call-btn"><Phone size={16} /> {PHONE_DISPLAY}</a>
                </div>
                <p className="geo-lead-note" style={{ marginTop: 14 }}>
                  בהנחיית רון קלי · 20 שנות שיווק בהייטק · בשיתוף צפון-טק וקרן רש״י
                </p>
                <p className="geo-lead-note" style={{ marginTop: 4 }}>
                  כניסה חינם · מספר המקומות מוגבל · בלי לחץ ובלי חובת קנייה
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <VideoPhone />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CLIENT LOGOS, moving marquee */}
      <section className="uo-logos-band">
        <div className="container">
          <p className="uo-logos-title">עסקים שכבר עובדים איתנו</p>
        </div>
        <div className="uo-logos-marquee">
          <div className="uo-logos-track">
            {[...CLIENT_LOGOS, ...CLIENT_LOGOS].map((l, i) => (
              <div key={`${l.alt}-${i}`} className="uo-logo-chip" aria-hidden={i >= CLIENT_LOGOS.length || undefined}>
                <img src={l.src} alt={l.alt} loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY COME */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why uo-why">
              <span className="geo-hero-badge"><span className="dot" /> למה כדאי לבוא</span>
              <h2 className="sp2-section-title">החיפוש עובר לבינה המלאכותית, והעסק שלכם צריך להיות שם</h2>
              <div className="uo-why-body">
                <p>
                  עד לא מזמן, לקוח שחיפש עסק פתח את גוגל וגלל בין התוצאות. היום הוא פשוט שואל את
                  ChatGPT, את Gemini או את Claude מהטלפון, בדיוק כמו ששואלים חבר טוב, והם עונים לו
                  בשם אחד או שניים. ל-ChatGPT לבדו כבר יותר ממיליארד משתמשים בשבוע, וגם גוגל פותח
                  את החיפוש בתשובה של בינה מלאכותית.
                </p>
                <p>
                  מי שהבינה המלאכותית מכירה, מקבל את הפנייה. מי שלא, פשוט לא עולה בשיחה, גם אם הוא
                  הכי טוב בתחום. זה קורה כבר עכשיו, בשקט, והפער בין מי שנמצא שם למי שלא רק הולך וגדל.
                </p>
                <p>
                  בערב הזה נראה לכם, בשפה פשוטה ובלי הבטחות באוויר, איך עסק קטן נכנס לתמונה הזאת:
                  מה עובד היום בשיווק, איך אוטומציה חוסכת לכם זמן, ואיך לגרום לבינה המלאכותית להמליץ
                  דווקא עליכם. בלי רקע טכני, ועם כיוון מעשי שאפשר להתחיל איתו כבר למחרת בבוקר.
                </p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* AGENDA */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה יהיה בערב</h2>
            <p className="sp2-lead">הרצאה, ייעוץ אישי וכיבוד. ערב אחד, הרבה כיוונים מעשיים להתחיל איתם.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="uo-steps">
              {AGENDA.map((a) => {
                const Icon = a.icon;
                return (
                  <div key={a.title} className="uo-step">
                    <span className="uo-step-icon"><Icon size={24} /></span>
                    <h3>{a.title}</h3>
                    <p>{a.text}</p>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SPEAKER */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <div className="uo-speaker-grid">
            <ScrollReveal direction="right">
              <div>
                <span className="geo-hero-badge"><span className="dot" /> מי מרצה</span>
                <h2 className="sp2-section-title" style={{ textAlign: 'right' }}>רון קלי</h2>
                <p className="sp2-lead" style={{ marginInline: 0, textAlign: 'right' }}>
                  בעל 20 שנות ניסיון בשיווק בעולם ההייטק והסטארטאפים, בעלים של קהילת הבית לעסקים
                  קטנים, ומרצה בכיר על שיווק ובינה מלאכותית מטעם צפון-טק וקרן רש״י.
                </p>
                <p className="sp2-lead" style={{ marginInline: 0, textAlign: 'right' }}>
                  בערב הזה הוא יראה לכם בשפה פשוטה מה עובד היום בשיווק לעסקים קטנים, ואיך בינה
                  מלאכותית ואוטומציה יכולות להביא לכם יותר לקוחות בלי להגדיל את הצוות.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left">
              <div className="uo-speaker-photo">
                <img src="/ron-keli-speaker.jpg" alt="רון קלי מרצה על שיווק ובינה מלאכותית על במה מול קהל" loading="lazy" />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* WHAT YOU TAKE HOME */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה תיקחו מהערב</h2>
            <p className="sp2-lead">
              לא תאוריה כללית. חמישה דברים מעשיים שתצאו איתם, ותוכלו להתחיל ליישם כבר למחרת.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <ul className="uo-do-list">
              {TAKEAWAYS.map((item) => (
                <li key={item}>
                  <span className="uo-offer-check"><Check size={16} strokeWidth={3} /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* REGISTER */}
      <section id="register" className="sp2-section sp2-section-alt">
        <div className="container">
          <div className="uo-lead-layout">
            <ScrollReveal direction="right">
              <div>
                <h2 className="sp2-section-title" style={{ textAlign: 'right' }}>שריינו את המקום שלכם</h2>
                <p className="sp2-lead" style={{ marginInline: 0, textAlign: 'right' }}>
                  הכניסה חינם, אבל מספר המקומות מוגבל. השאירו פרטים ונחזור אליכם לאישור ההגעה, ונשלח
                  את המיקום המדויק לפני האירוע.
                </p>
                <div className="uo-event-meta" style={{ justifyContent: 'flex-start' }}>
                  <span className="uo-event-chip"><Calendar size={16} /> {EVENT_DATE}</span>
                  <span className="uo-event-chip"><Clock size={16} /> {EVENT_TIME}</span>
                </div>
                <a href={PHONE_TEL} className="uo-call-inline">
                  <Phone size={20} /> <span>מעדיפים להתקשר? {PHONE_DISPLAY}</span>
                </a>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="left">
              <UniqueOfferLeadForm />
            </ScrollReveal>
          </div>
          <p className="uo-miss-note">
            לא יכולים להגיע הפעם?{' '}
            <a href={WA_MISS} target="_blank" rel="noopener noreferrer">שלחו לנו הודעה ונעביר לכם את עיקרי ההרצאה</a>
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">שאלות נפוצות</h2>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <div className="geo-faq">
              {FAQS.map((f) => (
                <FAQItem key={f.q} question={f.q}>
                  <p>{f.a}</p>
                </FAQItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="sp2-final-cta">
        <div className="sp2-final-glow" />
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-final-title">נתראה בערב ההכרה?</h2>
            <p className="sp2-final-subtitle">
              {EVENT_DATE} · {EVENT_TIME} · בצפון. כניסה חינם, מספר המקומות מוגבל.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href="#register" className="sp2-final-btn">שריינו מקום</a>
              <a href={PHONE_TEL} className="btn btn-minimal uo-call-btn"><Phone size={16} /> {PHONE_DISPLAY}</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* STICKY MOBILE BAR */}
      <div className="uo-sticky-call" aria-hidden="false">
        <a href="#register" className="uo-sticky-primary">שריינו מקום</a>
        <a href={PHONE_TEL} className="uo-sticky-secondary"><Phone size={16} /> התקשרו</a>
      </div>
      <div className="uo-sticky-spacer" aria-hidden="true" />
    </>
  );
}
