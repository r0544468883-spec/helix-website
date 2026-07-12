'use client';

import ScrollReveal from '../components/ScrollReveal';
import Button from '../components/Button';
import FAQItem from '../components/FAQItem';
import GeoChecker from './GeoChecker';
import { SITE } from '@/lib/site';

const WA = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  'היי, בדקתי את הנראות שלי ב-AI ואשמח לאבחון',
)}`;

const LAYERS = [
  {
    n: '01',
    title: 'האם אפשר בכלל למצוא אותך',
    text: 'בודקים שהאתר נטען מהר, מאובטח, ובנוי כך שסוכני AI יכולים לקרוא אותו — לא רק דפדפן.',
  },
  {
    n: '02',
    title: 'האם ה-AI מבין שאתה עסק',
    text: 'בודקים אם יש לך "כרטיס ביקור דיגיטלי" ופרטי קשר שה-AI יודע לשייך לעסק אמיתי.',
  },
  {
    n: '03',
    title: 'האם ה-AI מוצא וממליץ',
    text: 'שואלים את ChatGPT, Claude, Gemini ו-Perplexity ישירות — ובודקים אם אתה עולה, או שהמתחרים.',
  },
];

const FAQS = [
  {
    q: 'מה זה אומר ש-ChatGPT "ממליץ" עליך?',
    a: 'כשלקוח שואל בינה מלאכותית "מי הכי טוב ב___ באזור שלי", היא עונה בשמות ספציפיים. אם העסק שלך לא בנוי נכון, היא פשוט לא מכירה אותך — ומפנה את הלקוח למתחרה. הבדיקה מראה איפה אתה עומד.',
  },
  {
    q: 'הבדיקה באמת שואלת את הבינה המלאכותית?',
    a: 'כן. בנוסף לבדיקות הטכניות של האתר, אנחנו שולחים שאלות אמיתיות ל-ChatGPT, Claude, Gemini ו-Perplexity ובודקים אם אתה מופיע בתשובה — ומי כן מופיע. את התשובות המלאות תראה בדוח.',
  },
  {
    q: 'זה עולה כסף?',
    a: 'הבדיקה חינם. גם האבחון הראשוני מול הצוות חינם. אנחנו עובדים בלי חוזה ובלי דמי הקמה — אם תרצה שנטפל בזה בשבילך, נדבר על זה רק אחרי שתראה ערך.',
  },
  {
    q: 'למה האתר שלי לא מופיע בבינה מלאכותית?',
    a: 'ברוב המקרים זו לא אשמתך — ככה בנויים רוב האתרים. הם נבנו למנועי חיפוש ישנים, לא לעולם שבו לקוחות שואלים AI. הבדיקה מראה בדיוק מה חסר, וזה כמעט תמיד ניתן לתיקון.',
  },
];

export default function AiCheckerClient() {
  return (
    <>
      <section className="geo-hero">
        <div className="geo-hero-grain" />
        <div className="container">
          <ScrollReveal direction="up">
            <span className="geo-hero-eyebrow">בדיקת נראות ב-AI · חינם</span>
            <h1 className="geo-hero-title">
              האם <span className="accent">ChatGPT</span> ממליץ על העסק שלך —
              <br />
              או על המתחרה?
            </h1>
            <p className="geo-hero-sub">
              היום לקוחות שואלים את הבינה המלאכותית &ldquo;מי הכי טוב ב___&rdquo; — והיא עונה בשם
              אחד. בדקו בחינם אם זה אתה.
            </p>
          </ScrollReveal>
        </div>
      </section>

      <GeoChecker />

      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בודקים</h2>
            <p className="sp2-lead">שלוש שכבות — מהיסודות הטכניים ועד לשאלה הכי חשובה: האם ה-AI ממליץ עליך.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.1}>
            <div className="sp2-features-grid">
              {LAYERS.map((l) => (
                <div key={l.n} className="sp2-feature-card">
                  <div className="sp2-feature-num">{l.n}</div>
                  <h3>{l.title}</h3>
                  <p>{l.text}</p>
                  <div className="sp2-feature-glow" />
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why">
              <h2 className="sp2-section-title">חיפוש עובר לבינה מלאכותית. העסק שלך מוכן?</h2>
              <p className="sp2-lead">
                יותר ויותר לקוחות מפסיקים לגלול בגוגל ופשוט שואלים את ה-AI למי לפנות. מי שה-AI מכיר —
                מקבל את הפנייה. מי שלא — נעלם. זה קורה עכשיו, בשקט, בלי שאתה רואה את זה.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="sp2-final-cta">
        <div className="sp2-final-glow" />
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-final-title">שנסגור את הפער במקומך?</h2>
            <p className="sp2-final-subtitle">
              אבחון ראשוני חינם. בלי חוזה, בלי דמי הקמה. נראה לך בדיוק מה לתקן — ואם תרצה, נטפל בזה.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="sp2-final-btn">
                קבלו אבחון ראשוני חינם
              </a>
              <Button href="/#packages" variant="minimal" arrow="left">
                או צפו בחבילות
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

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
    </>
  );
}
