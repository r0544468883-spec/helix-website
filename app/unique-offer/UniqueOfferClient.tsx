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

// מה יהיה בערב
const AGENDA = [
  { icon: Mic, title: 'הרצאה', text: 'רון קלי על שיווק ובינה מלאכותית, מה באמת עובד היום ואיך עסק קטן מתחיל.' },
  { icon: Users, title: 'ייעוץ אישי 1-על-1', text: 'פגישות ייעוץ פרטניות: שיווק, אוטומציה, וכניסה למנועי הבינה המלאכותית.' },
  { icon: Coffee, title: 'כיבוד', text: 'שתייה קלה, קפה ועוגה. בואו רגועים, נדבר בשפה פשוטה.' },
];

// מה אנחנו עושים (הרקע, נשאר מהשירות)
const DO_ITEMS = [
  'ניטור הנראות שלכם בכל מנועי הבינה המלאכותית',
  'בניית התשתית שגורמת ל-AI להבין מי אתם ומה אתם מציעים',
  'יצירת תוכן שמנועי ה-AI שואבים ממנו וממליצים עליכם',
  'אוטומציות שיווק שחוסכות לכם זמן ומביאות לקוחות',
  'מעקב מול המתחרים, שתמיד תהיו צעד לפניהם',
];

const FAQS = [
  { q: 'כמה עולה להשתתף?', a: 'הכניסה חינם לגמרי. מספר המקומות מוגבל, אז כדאי להירשם מראש.' },
  { q: 'איפה זה בדיוק?', a: 'האירוע ייערך בצפון. המיקום המדויק יישלח לנרשמים בהודעה לפני האירוע.' },
  { q: 'למי האירוע מתאים?', a: 'לכל בעל עסק קטן או עצמאי שרוצה להביא יותר לקוחות בעזרת שיווק, אוטומציה ובינה מלאכותית. לא צריך רקע טכני.' },
  { q: 'מה אני מקבל חוץ מההרצאה?', a: 'ייעוץ אישי 1-על-1 בשיווק, אוטומציה וכניסה למנועי ה-AI, כיבוד, וכיוון מעשי להתחיל איתו כבר למחרת.' },
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
      {/* HERO */}
      <section className="geo-hero">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" />
          <div className="geo-orb geo-orb-2" />
          <div className="geo-orb geo-orb-3" />
        </div>
        <div className="container">
          <span className="geo-hero-badge"><span className="dot" /> אירוע חינם לבעלי עסקים · צפון</span>

          <div className="uo-hero-grid">
            <ScrollReveal direction="right">
              <div className="uo-hero-copy">
                <h1 className="uo-hero-title">
                  ערב הכרה לבעלי עסקים: שיווק, אוטומציה{' '}
                  <span className="uo-hl">ובינה מלאכותית</span>
                </h1>
                <p className="geo-hero-sub" style={{ marginInline: 0 }}>
                  הלקוחות שלכם כבר שואלים את ChatGPT מהטלפון למי לפנות. בואו ללמוד איך העסק שלכם
                  מופיע שם ראשון, בהרצאה, בייעוץ אישי ובכוס קפה טובה.
                </p>
                <EventMeta />
                <div className="uo-hero-cta">
                  <a href="#register" className="sp2-final-btn">שריינו מקום</a>
                  <a href={PHONE_TEL} className="btn btn-minimal uo-call-btn"><Phone size={16} /> {PHONE_DISPLAY}</a>
                </div>
                <p className="geo-lead-note" style={{ marginTop: 14 }}>
                  כניסה חינם · מספר המקומות מוגבל
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <VideoPhone />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* WHY COME */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why">
              <span className="geo-hero-badge"><span className="dot" /> למה כדאי לבוא</span>
              <h2 className="sp2-section-title">החיפוש עובר לבינה המלאכותית, והעסק שלכם צריך להיות שם</h2>
              <p className="sp2-lead">
                פעם חיפשו בגוגל וגללו בין התוצאות. היום שואלים את ChatGPT, את Gemini ואת Claude
                מהטלפון, והם עונים בשם אחד או שניים. ל-ChatGPT לבדו כבר מעל מיליארד משתמשים בשבוע.
                בערב הזה נראה לכם איך עסק קטן נכנס לתמונה, עם שיווק חכם, אוטומציה ובינה מלאכותית.
              </p>
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
          <ScrollReveal direction="up">
            <div className="geo-why">
              <span className="geo-hero-badge"><span className="dot" /> מי מרצה</span>
              <h2 className="sp2-section-title">רון קלי</h2>
              <p className="sp2-lead">
                מרצה על שיווק ובינה מלאכותית, ומוביל את קורס השיווק והבינה המלאכותית בטק-צפון. בערב
                הזה הוא יראה לכם בשפה פשוטה מה עובד היום בשיווק לעסקים קטנים, ואיך בינה מלאכותית
                ואוטומציה יכולות להביא לכם יותר לקוחות בלי להגדיל את הצוות.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHAT WE DO (service background, kept) */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">ועל זה בדיוק נדבר, וגם עושים בשבילכם</h2>
            <p className="sp2-lead">
              מעבר להרצאה, אנחנו מלווים עסקים קטנים בדרך למנועי הבינה המלאכותית, מהבדיקה ועד הביצוע.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <ul className="uo-do-list">
              {DO_ITEMS.map((item) => (
                <li key={item}>
                  <span className="uo-offer-check"><Check size={16} strokeWidth={3} /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* EVENT DETAILS + REGISTER */}
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
