'use client';

import { Check } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import Button from '../components/Button';
import FAQItem from '../components/FAQItem';
import { SITE } from '@/lib/site';
import VideoPhone from './VideoPhone';

const WA = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  'היי, ראיתי את ההצעה המיוחדת לליווי GEO (נראות ב-AI) ואשמח לפרטים',
)}`;

// ההצעה המדויקת כמו ב-AI CHECKER, אחרי הבדיקה
const OFFER_ITEMS = [
  'ניטור חודשי של הנראות שלכם ב-4 מנועי ה-AI + דוח התקדמות',
  'תיקון תשתית GEO (schema, זהות, קריאוּת ל-AI)',
  'יצירת תוכן שמנועי ה-AI מצטטים (מאמרים, תשובות, נכסים)',
  'חיזוק הזהות הדיגיטלית, שלא יבלבלו אתכם עם ישות אחרת',
  'ייעוץ PR לקישורים חיצוניים לחיזוק ה-GEO',
  'מעקב מול מתחרים + אופטימיזציה שוטפת',
  'פגישת מעקב שבועית, מה עשינו ומה הצעדים לשבוע הבא',
];

const CHECK_GET = [
  { n: '01', title: 'הציון המלא', text: 'סולם GEO מ-1 עד 10, עם פירוק מלא לכל קטגוריה, לא רק מספר.' },
  { n: '02', title: 'שמות המתחרים', text: 'מי מהמתחרים כבר מופיע ב-AI, ומה בנוי אצלם נכון שחסר אצלכם.' },
  { n: '03', title: 'תשובות ה-AI בפועל', text: 'מה ChatGPT, Gemini ו-Claude ענו כששאלנו עליכם, במילים שלהם.' },
];

const FAQS = [
  { q: 'מה המחיר, ולמה הוא מיוחד?', a: 'הליווי המלא הוא ₪3,500 לחודש. לבעלי עסקים במגזר החרדי אנחנו נותנים אותו ב-₪2,500 לחודש, מחיר קבוע, בלי חוזה ובלי התחייבות ל-3 חודשים.' },
  { q: 'מה בדיוק כולל הליווי החודשי?', a: 'ניטור חודשי של הנראות שלכם ב-4 מנועי AI עם דוח התקדמות, תיקון תשתית GEO, יצירת תוכן שה-AI מצטט, חיזוק הזהות הדיגיטלית, ייעוץ PR לקישורים, מעקב מול מתחרים, ופגישת מעקב שבועית.' },
  { q: 'אנחנו על אינטרנט כשר, זה בכלל רלוונטי לנו?', a: 'בהחלט. גם במסגרת האינטרנט הכשר והמסונן יש היום גישה ל-ChatGPT, ל-Gemini ול-Claude. יותר ויותר לקוחות שואלים את הבינה המלאכותית למי לפנות במקום לגלול בגוגל. השאלה היחידה היא אם היא מכירה אתכם או את המתחרה.' },
  { q: 'מה ההבדל בין הליווי לבין הבדיקה החינמית?', a: 'הבדיקה מראה לכם איפה אתם עומדים היום: הציון, המתחרים ומה חסר. הליווי החודשי הוא מי שסוגר את הפער בפועל, חודש אחרי חודש, עד שה-AI מכיר אתכם וממליץ עליכם.' },
  { q: 'כמה זמן לוקח לראות תוצאות?', a: 'תיקונים טכניים כמו schema וגישת בוטים משפיעים תוך שבועות, ככל שהמנועים סורקים מחדש. נוכחות מלאה נבנית לאורך זמן, ובדיוק בשביל זה הליווי הוא חודשי ומתמשך.' },
  { q: 'אתם משנים לנו את האתר בלי אישור?', a: 'לא. הבדיקה היא לקריאה בלבד, לא נוגעים באתר. כל תיקון במסגרת הליווי קורה רק אחרי שנתאם אתכם בדיוק מה עושים.' },
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
          <span className="geo-hero-badge"><span className="dot" /> הצעה ייחודית לבעלי עסקים במגזר החרדי</span>

          <div className="uo-hero-grid">
            <ScrollReveal direction="right">
              <div className="uo-hero-copy">
                <h1 className="uo-hero-title">
                  הלקוח מתייעץ עם הבינה המלאכותית, וה-AI נותן לו תשובה אחת.{' '}
                  <span className="uo-hl">מי עולה שם, אתה או המתחרים שלך?</span>
                </h1>
                <p className="geo-hero-sub" style={{ marginInline: 0 }}>
                  הלקוחות כבר מתייעצים עם ChatGPT, Gemini ו-Claude, גם באינטרנט הכשר. מי שה-AI מכיר,
                  מקבל את הפנייה. אנחנו דואגים שזה יהיו אתם, עם ליווי GEO חודשי מלא, ובמחיר מיוחד
                  לבעלי עסקים במגזר, <strong>₪2,500 לחודש במקום ₪3,500</strong>.
                </p>
                <div className="uo-hero-cta">
                  <a href={WA} target="_blank" rel="noopener noreferrer" className="sp2-final-btn">
                    דברו איתנו על ההצעה
                  </a>
                  <Button href="#offer" variant="minimal" arrow="left">מה כולל הליווי</Button>
                </div>
                <p className="geo-lead-note" style={{ marginTop: 14 }}>
                  אפשר להתחיל בבדיקת נראות חינם · בלי חוזה · בלי התחייבות
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <VideoPhone />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* WHY NOW */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why">
              <span className="geo-hero-badge"><span className="dot" /> למה עכשיו</span>
              <h2 className="sp2-section-title">החיפוש עובר לבינה המלאכותית</h2>
              <p className="sp2-lead">
                פעם חיפשו בגוגל וגללו בין התוצאות. היום שואלים את ChatGPT, את Gemini ואת Claude למי
                לפנות, והם עונים בשם אחד או שניים. מי שהם מכירים מקבל את הפנייה, מי שלא נעלם מהשיחה.
                זה קורה כבר עכשיו, גם בתוך האינטרנט הכשר והמסונן שבו יש גישה לכלים האלה.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* THE OFFER, the centerpiece */}
      <section id="offer" className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">הצעה ייחודית לבעלי עסקים במגזר החרדי</h2>
            <p className="sp2-lead">
              ליווי GEO חודשי מלא, מי שדואג שמנועי הבינה המלאכותית ימצאו, יבינו וימליצו על העסק
              שלכם, חודש אחרי חודש. במחיר מיוחד למגזר.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.05}>
            <div className="uo-offer-card">
              <span className="uo-offer-tag">מחיר מיוחד למגזר</span>
              <div className="uo-offer-price">
                <span className="uo-offer-was">₪3,500</span>
                <span className="uo-offer-amount">₪2,500</span>
                <span className="uo-offer-per">לחודש</span>
              </div>
              <p className="uo-offer-note">מחיר קבוע · בלי התחייבות ל-3 חודשים · אפשר לעצור בכל חודש</p>

              <ul className="uo-offer-list">
                {OFFER_ITEMS.map((item) => (
                  <li key={item}>
                    <span className="uo-offer-check"><Check size={16} strokeWidth={3} /></span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>

              <a href={WA} target="_blank" rel="noopener noreferrer" className="sp2-final-btn uo-offer-cta">
                דברו איתנו בוואטסאפ
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FIRST STEP, free check as the on-ramp */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <span className="geo-hero-badge"><span className="dot" /> הצעד הראשון</span>
            <h2 className="sp2-section-title">לא בטוחים איפה אתם עומדים? מתחילים בבדיקה חינם</h2>
            <p className="sp2-lead">
              לפני שמתחילים את הליווי, אנחנו בודקים בחינם איפה העסק שלכם עומד היום מול הבינה
              המלאכותית. בלי התחייבות, רק כדי שתדעו בדיוק מה המצב ומה אפשר להרוויח.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid sp-grid-3">
              {CHECK_GET.map((g) => (
                <div key={g.n} className="flip-card">
                  <div className="flip-card-inner">
                    <div className="flip-card-front">
                      <span className="flip-card-icon">{g.n}</span>
                      <h3>{g.title}</h3>
                    </div>
                    <div className="flip-card-back">
                      <span className="flip-card-icon">{g.n}</span>
                      <h3>{g.title}</h3>
                      <p>{g.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.1}>
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Button href="/ai-checker" variant="minimal" arrow="left">לבדיקת הנראות החינמית</Button>
            </div>
          </ScrollReveal>
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
            <h2 className="sp2-final-title">שנדאג שה-AI ימליץ עליכם, לא על המתחרה?</h2>
            <p className="sp2-final-subtitle">
              ליווי GEO חודשי, ₪2,500 לחודש במקום ₪3,500, מחיר מיוחד לבעלי עסקים במגזר. בלי
              התחייבות ארוכה, מתחילים בבדיקה חינם.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="sp2-final-btn">
                דברו איתנו על ההצעה
              </a>
              <Button href="/ai-checker" variant="minimal" arrow="left">בדיקת נראות חינם</Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
