'use client';

import {
  Bot, MapPin, FileText, Users, CalendarCheck, ShieldCheck,
} from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import Button from '../components/Button';
import FAQItem from '../components/FAQItem';
import { SITE } from '@/lib/site';
import VideoPhone from './VideoPhone';

const WA = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  'היי, ראיתי את ההצעה הייחודית לנראות ב-AI ואשמח לבדיקה',
)}`;

const OFFER_INCLUDES = [
  { icon: Bot, title: 'ניטור חודשי ב-4 מנועי AI', text: 'בודקים כל חודש אם ChatGPT, Gemini, Claude ו-Google AI מוצאים וממליצים עליכם, עם דוח התקדמות.' },
  { icon: ShieldCheck, title: 'תיקון תשתית GEO', text: 'schema, זהות דיגיטלית וקריאוּת למנועי ה-AI, כך שהם יבינו בדיוק מי אתם ומה אתם עושים.' },
  { icon: FileText, title: 'תוכן שה-AI מצטט', text: 'מאמרים ותשובות שבנויים כך שמנועי הבינה המלאכותית ישאבו מהם וימליצו עליכם.' },
  { icon: MapPin, title: 'חיזוק נראות מקומית', text: 'שיוך אזורי ברור, כך שכשמחפשים עסק בבני ברק או בכל אזור, ה-AI יגיע אליכם.' },
  { icon: Users, title: 'מעקב מול מתחרים', text: 'מי מהמתחרים כבר מופיע בתשובות, ומה צריך כדי לעקוף אותם.' },
  { icon: CalendarCheck, title: 'פגישת מעקב שבועית', text: 'מה עשינו החודש, מה עובד, ומה הצעדים לשבוע הבא. בשפה פשוטה.' },
];

const GET = [
  { n: '01', title: 'הציון המלא', text: 'סולם GEO מ-1 עד 10, עם פירוק מלא לכל קטגוריה, לא רק מספר.' },
  { n: '02', title: 'רשימת תיקונים מתועדפת', text: 'בדיוק מה לתקן, מסודר לפי ההשפעה הכי גדולה קודם.' },
  { n: '03', title: 'שמות המתחרים', text: 'מי מהמתחרים כבר מופיע ב-AI, ומה בנוי אצלם נכון שחסר אצלכם.' },
  { n: '04', title: 'תשובות ה-AI בפועל', text: 'מה ChatGPT, Gemini ו-Claude ענו כששאלנו עליכם, במילים שלהם.' },
  { n: '05', title: 'תוכנית פעולה', text: 'צעדים ברורים בשפה פשוטה, מה לעשות ובאיזה סדר.' },
  { n: '06', title: 'אבחון ראשוני חינם', text: 'שיחה עם HELIX לסגירת הפער. בלי חוזה, בלי התחייבות.' },
];

const FAQS = [
  { q: 'אנחנו על אינטרנט כשר, זה בכלל רלוונטי לנו?', a: 'בהחלט. גם במסגרת האינטרנט הכשר והמסונן יש היום גישה ל-ChatGPT, ל-Gemini ול-Claude. יותר ויותר אנשים, גם בציבור החרדי, שואלים את הבינה המלאכותית למי לפנות במקום לגלול בגוגל. השאלה היחידה היא אם היא מכירה אתכם או את המתחרה.' },
  { q: 'מה זה אומר ש-ChatGPT "ממליץ" עלינו?', a: 'כשלקוח שואל בינה מלאכותית "מה הכי טוב ב___ באזור שלי", היא עונה בשמות ספציפיים. אם העסק שלכם לא בנוי נכון, היא פשוט לא מכירה אתכם, ומפנה את הלקוח למתחרה. אנחנו דואגים שהשם שלכם יהיה בתשובה.' },
  { q: 'אני עסק מקומי קטן בבני ברק או בירושלים, זה מתאים לי?', a: 'דווקא הכי מתאים. לקוחות שואלים AI "מי הכי טוב ב___ באזור שלי", וזה בדיוק המקום שבו עסק מקומי יכול לנצח, אם ה-AI מכיר אותו. רוב העסקים עדיין לא בנויים לזה, אז הפער קל יחסית לסגור.' },
  { q: 'כמה זה עולה?', a: 'השירות השוטף הוא ₪2,500 לחודש, בלי חוזה ובלי התחייבות ארוכה. הבדיקה הראשונית והאבחון מולנו, חינם. מתחילים רק אחרי שתראו בדיוק מה חסר ומה אפשר להרוויח.' },
  { q: 'כמה זמן לוקח לראות תוצאות?', a: 'תיקונים טכניים כמו schema וגישת בוטים משפיעים תוך שבועות, ככל שהמנועים סורקים מחדש. נוכחות מלאה נבנית לאורך זמן, אבל הצעד הראשון הוא לדעת בדיוק איפה אתם עומדים היום.' },
  { q: 'אתם משנים לנו את האתר בלי אישור?', a: 'לא. הבדיקה היא לקריאה בלבד, לא נוגעים באתר. כל תיקון קורה רק אחרי שנתאם אתכם בדיוק מה עושים.' },
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
          <span className="geo-hero-badge"><span className="dot" /> הצעה ייחודית · נראות ב-AI</span>

          <div className="uo-hero-grid">
            <ScrollReveal direction="right">
              <div className="uo-hero-copy">
                <h1 className="uo-hero-title">
                  הלקוח מקליד <span className="uo-hl">"חנות סלולר בבני ברק"</span>, והבינה המלאכותית נותנת שם אחד.
                  שלכם, או של המתחרה?
                </h1>
                <p className="geo-hero-sub" style={{ marginInline: 0 }}>
                  היום גם באינטרנט הכשר יש ChatGPT, Gemini ו-Claude. יותר ויותר אנשים שואלים אותם
                  למי לפנות, במקום לגלול בגוגל. מי שה-AI מכיר, מקבל את הפנייה. אנחנו דואגים שזה יהיו אתם.
                </p>
                <div className="uo-hero-cta">
                  <a href={WA} target="_blank" rel="noopener noreferrer" className="sp2-final-btn">
                    קבלו בדיקת נראות חינם
                  </a>
                  <Button href="#offer" variant="minimal" arrow="left">מה כולל השירות</Button>
                </div>
                <p className="geo-lead-note" style={{ marginTop: 14 }}>
                  בדיקה ואבחון ראשוני חינם · בלי חוזה · בלי התחייבות
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <VideoPhone />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* THE SHIFT */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why">
              <span className="geo-hero-badge"><span className="dot" /> מה שקורה עכשיו, בשקט</span>
              <h2 className="sp2-section-title">החיפוש עובר לבינה המלאכותית. גם אצלכם בקהילה.</h2>
              <p className="sp2-lead">
                פעם חיפשו בגוגל וגללו בין התוצאות. היום שואלים את ה-AI כמו ששואלים חבר חכם, והוא עונה
                בשם אחד או שניים. מי שהבינה המלאכותית מכירה, מקבל את הפנייה. מי שלא, פשוט נעלם מהשיחה.
                זה קורה כבר עכשיו, בלי שאתם רואים את זה, וזה רק הולך ומתרחב.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* THE OFFER */}
      <section id="offer" className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">ההצעה: ניהול הנראות שלכם ב-AI</h2>
            <p className="sp2-lead">
              אנחנו דואגים שמנועי הבינה המלאכותית ימצאו, יבינו וימליצו על העסק שלכם, חודש אחרי חודש.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={0.05}>
            <div className="uo-offer-card">
              <div className="uo-offer-price">
                <span className="uo-offer-amount">₪2,500</span>
                <span className="uo-offer-per">לחודש</span>
              </div>
              <p className="uo-offer-note">בלי חוזה · בלי התחייבות ארוכה · אפשר לעצור בכל חודש</p>
              <div className="uo-offer-grid">
                {OFFER_INCLUDES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="uo-offer-item">
                      <span className="uo-offer-icon"><Icon size={22} /></span>
                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="sp2-final-btn uo-offer-cta">
                דברו איתנו בוואטסאפ
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHAT YOU GET IN THE CHECK */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה מקבלים כבר בבדיקה החינמית</h2>
            <p className="sp2-lead">לא עוד מספר בודד, דוח שלם שאומר לכם בדיוק איפה אתם עומדים ומה לעשות. רחפו על כרטיס.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid sp-grid-3">
              {GET.map((g) => (
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
            <h2 className="sp2-final-title">שנבדוק על מי ה-AI ממליץ בתחום שלכם?</h2>
            <p className="sp2-final-subtitle">
              בדיקה ואבחון ראשוני חינם. נראה לכם בדיוק מה לתקן, ואם תרצו, נטפל בזה.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="sp2-final-btn">
                קבלו בדיקת נראות חינם
              </a>
              <Button href="/ai-checker" variant="minimal" arrow="left">בדיקת ה-AI של HELIX</Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
