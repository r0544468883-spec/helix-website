'use client';

import { Check, Phone, PhoneCall, Search, BarChart3 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import FAQItem from '../components/FAQItem';
import VideoPhone from './VideoPhone';
import UniqueOfferLeadForm from './UniqueOfferLeadForm';

const PHONE_DISPLAY = '054-446-8883';
const PHONE_TEL = 'tel:+972544468883';

// מה אנחנו עושים בשבילכם (ההצעה המדויקת מה-AI CHECKER, בניסוח done-for-you)
const OFFER_ITEMS = [
  'ניטור חודשי של הנראות שלכם בכל מנועי הבינה המלאכותית + דוח התקדמות',
  'בניית התשתית שגורמת ל-AI להבין מי אתם ומה אתם מציעים',
  'יצירת תוכן שמנועי ה-AI שואבים ממנו וממליצים עליכם',
  'חיזוק הזהות הדיגיטלית, שלא יבלבלו אתכם עם מישהו אחר',
  'דאגה לקישורים והזכרות שמחזקים אתכם מול ה-AI',
  'מעקב מול המתחרים, שתמיד תהיו צעד לפניהם',
  'עדכון שוטף בטלפון, מה עשינו ומה הצעדים הבאים',
];

const STEPS = [
  { icon: PhoneCall, n: '1', title: 'מתקשרים או משאירים מספר', text: 'שיחת טלפון אחת, או משאירים שם וטלפון וחוזרים אליכם. בלי טפסים מסובכים ובלי אונליין.' },
  { icon: Search, n: '2', title: 'אנחנו בודקים עבורכם', text: 'הצוות שלנו בודק איפה העסק שלכם עומד מול הבינה המלאכותית, ומתקשר אליכם עם התשובות. אתם לא צריכים לעשות כלום.' },
  { icon: BarChart3, n: '3', title: 'מנהלים את זה בשבילכם', text: 'אם תרצו, אנחנו דואגים לנראות שלכם ב-AI חודש אחרי חודש. בלי חוזה ובלי התחייבות.' },
];

const FAQS = [
  { q: 'מה המחיר, ולמה הוא מיוחד?', a: 'הליווי המלא הוא ₪3,500 לחודש. לבעלי עסקים במגזר אנחנו נותנים אותו ב-₪2,500 לחודש, מחיר קבוע, בלי חוזה ובלי התחייבות ל-3 חודשים.' },
  { q: 'אני צריך לעשות משהו באינטרנט או להתחבר למשהו?', a: 'לא. הכל נעשה על ידינו. אתם רק מתקשרים או משאירים מספר, ואנחנו עושים את הבדיקה ואת כל העבודה, ומעדכנים אתכם בטלפון. פשוט ונוח.' },
  { q: 'מה זה בעצם נראות בבינה המלאכותית?', a: 'כשלקוח שואל את ChatGPT, את Gemini או את Claude "מה הכי טוב ב___ באזור שלי", הם עונים בשם אחד או שניים. אנחנו דואגים שהשם שלכם יהיה שם, במקום של המתחרה.' },
  { q: 'אתם מבטיחים שה-AI ימליץ עליי?', a: 'אנחנו לא מבטיחים כתר. אנחנו בונים את התשתית שגורמת לבינה המלאכותית להכיר אתכם ולהמליץ עליכם, ומראים לכם את ההתקדמות בנתונים אמיתיים, חודש אחרי חודש.' },
  { q: 'צריך חוזה או התחייבות?', a: 'לא. מחיר קבוע חודשי, אפשר לעצור בכל חודש. מתחילים בבדיקה בחינם, ורק אם תראו ערך, ממשיכים.' },
];

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
          <span className="geo-hero-badge"><span className="dot" /> הצעה מיוחדת לבעלי עסקים במגזר</span>

          <div className="uo-hero-grid">
            <ScrollReveal direction="right">
              <div className="uo-hero-copy">
                <h1 className="uo-hero-title">
                  הלקוח מתייעץ עם הבינה המלאכותית, וה-AI נותן לו שם אחד.{' '}
                  <span className="uo-hl">מי עולה שם, אתה או המתחרים שלך?</span>
                </h1>
                <p className="geo-hero-sub" style={{ marginInline: 0 }}>
                  היום אנשים שואלים את ChatGPT מהטלפון למי לפנות, כמו ששואלים את החברים שלהם. מי
                  שה-AI מכיר מקבל את הפנייה, מי שלא, פשוט לא קיים. אנחנו דואגים שזה יהיה אתם.
                </p>
                <div className="uo-hero-cta">
                  <a href={PHONE_TEL} className="sp2-final-btn uo-call-btn">
                    <Phone size={18} /> התקשרו עכשיו
                  </a>
                  <a href="#lead" className="btn btn-minimal">השאירו מספר ונחזור אליכם</a>
                </div>
                <p className="geo-lead-note" style={{ marginTop: 14 }}>
                  כבר עובדים עם עסקים מהמגזר · הבדיקה בחינם · הכל טלפוני
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <VideoPhone />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* THE PROBLEM */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why">
              <span className="geo-hero-badge"><span className="dot" /> מה שקורה עכשיו</span>
              <h2 className="sp2-section-title">החיפוש עובר לבינה המלאכותית</h2>
              <p className="sp2-lead">
                פעם חיפשו בגוגל וגללו בין התוצאות. היום שואלים את ChatGPT, את Gemini ואת Claude
                מהטלפון, והם עונים בשם אחד או שניים. ל-ChatGPT לבדו כבר מעל מיליארד משתמשים בשבוע,
                וגם גוגל פותח את החיפוש בתשובה של בינה מלאכותית. מי שה-AI מכיר, מקבל את הפנייה.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHAT WE DO FOR YOU */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">אנחנו דואגים שה-AI ימליץ עליכם</h2>
            <p className="sp2-lead">
              אתם לא צריכים לגעת בכלום. הצוות שלנו עושה את כל העבודה שגורמת למנועי הבינה המלאכותית
              למצוא אתכם, להבין מי אתם, ולהמליץ עליכם.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <ul className="uo-do-list">
              {OFFER_ITEMS.map((item) => (
                <li key={item}>
                  <span className="uo-offer-check"><Check size={16} strokeWidth={3} /></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד</h2>
            <p className="sp2-lead">פשוט, וטלפוני. בלי אונליין, בלי טפסים מסובכים.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="uo-steps">
              {STEPS.map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.n} className="uo-step">
                    <span className="uo-step-num">{s.n}</span>
                    <span className="uo-step-icon"><Icon size={24} /></span>
                    <h3>{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* THE OFFER */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">הצעה מיוחדת לבעלי עסקים במגזר</h2>
            <p className="sp2-lead">ליווי מלא לנראות שלכם בבינה המלאכותית, במחיר מיוחד למגזר.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <div className="uo-offer-card">
              <span className="uo-offer-tag">מחיר מיוחד למגזר</span>
              <div className="uo-offer-price">
                <span className="uo-offer-was">₪3,500</span>
                <span className="uo-offer-amount">₪2,500</span>
                <span className="uo-offer-per">לחודש</span>
              </div>
              <p className="uo-offer-note">מחיר קבוע · בלי חוזה · בלי התחייבות ל-3 חודשים</p>
              <div className="uo-offer-actions">
                <a href={PHONE_TEL} className="sp2-final-btn uo-call-btn">
                  <Phone size={18} /> התקשרו עכשיו · {PHONE_DISPLAY}
                </a>
                <a href="#lead" className="btn btn-minimal">או השאירו מספר ונחזור אליכם</a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHY HELIX */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why">
              <span className="geo-hero-badge"><span className="dot" /> למה אנחנו</span>
              <h2 className="sp2-section-title">הילדים הטובים של עולם הדיגיטל</h2>
              <p className="sp2-lead">
                אנחנו כבר עובדים עם עסקים מהמגזר, בלי הבטחות באוויר. עובדים לפי נתונים, מסבירים הכל
                בשפה פשוטה, וזמינים בטלפון. לא מבטיחים לכם כתר, בונים לכם נוכחות אמיתית שאפשר למדוד.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* LEAD / CONTACT */}
      <section id="lead" className="sp2-section">
        <div className="container">
          <div className="uo-lead-layout">
            <ScrollReveal direction="right">
              <div>
                <h2 className="sp2-section-title" style={{ textAlign: 'right' }}>שנבדוק עבורכם? השאירו מספר</h2>
                <p className="sp2-lead" style={{ marginInline: 0, textAlign: 'right' }}>
                  משאירים שם וטלפון, ואנחנו חוזרים אליכם, עושים את הבדיקה בשבילכם ומראים לכם איפה
                  אתם עומדים מול הבינה המלאכותית. בחינם, בלי התחייבות.
                </p>
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
      <section className="sp2-section sp2-section-alt">
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
            <h2 className="sp2-final-title">שנבדוק על מי ה-AI ממליץ בתחום שלכם?</h2>
            <p className="sp2-final-subtitle">
              ליווי מלא, ₪2,500 לחודש במקום ₪3,500, מחיר מיוחד למגזר. הבדיקה בחינם, והכל טלפוני.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href={PHONE_TEL} className="sp2-final-btn uo-call-btn">
                <Phone size={18} /> התקשרו עכשיו · {PHONE_DISPLAY}
              </a>
              <a href="#lead" className="btn btn-minimal">השאירו מספר ונחזור אליכם</a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* STICKY MOBILE CALL BAR */}
      <div className="uo-sticky-call" aria-hidden="false">
        <a href={PHONE_TEL} className="uo-sticky-primary">
          <Phone size={18} /> התקשרו עכשיו
        </a>
        <a href="#lead" className="uo-sticky-secondary">השאירו מספר</a>
      </div>
      <div className="uo-sticky-spacer" aria-hidden="true" />
    </>
  );
}
