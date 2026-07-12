'use client';

import dynamic from 'next/dynamic';
import ScrollReveal from '../components/ScrollReveal';
import Button from '../components/Button';
import FAQItem from '../components/FAQItem';
import GeoChecker from './GeoChecker';
import { SITE } from '@/lib/site';

const StepsLottie = dynamic(() => import('../components/StepsLottie'), { ssr: false });

const WA = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  'היי, בדקתי את הנראות שלי ב-AI ואשמח לאבחון',
)}`;

const STEPS = [
  { n: '01', title: 'מכניסים כתובת אתר', text: 'בלי הרשמה, בלי חיבור חשבונות. רק הכתובת שלך.' },
  { n: '02', title: 'סורקים ושואלים את ה-AI', text: 'בודקים את האתר ושואלים את ChatGPT, Claude, Gemini ו-Perplexity ישירות.' },
  { n: '03', title: 'מקבלים ציון + פער מול המתחרים', text: 'סולם GEO מ-1 עד 10, ומי מהמתחרים כבר מופיע במקומך.' },
  { n: '04', title: 'מקבלים תוכנית פעולה', text: 'בדיוק מה לתקן, לפי סדר עדיפויות — בשפה פשוטה.' },
  { n: '05', title: 'HELIX סוגרת את הפער', text: 'אם תרצה — אבחון ראשוני חינם ואנחנו מטפלים בזה.' },
];

const LAYERS = [
  { n: '01', title: 'האם אפשר בכלל למצוא אותך', text: 'בודקים שהאתר נטען מהר, מאובטח, ובנוי כך שסוכני AI יכולים לקרוא אותו — לא רק דפדפן.' },
  { n: '02', title: 'האם ה-AI מבין שאתה עסק', text: 'בודקים אם יש לך "כרטיס ביקור דיגיטלי" ופרטי קשר שה-AI יודע לשייך לעסק אמיתי.' },
  { n: '03', title: 'האם ה-AI מוצא וממליץ', text: 'שואלים את ChatGPT, Claude, Gemini ו-Perplexity ישירות — ובודקים אם אתה עולה, או שהמתחרים.' },
];

const FAQS = [
  { q: 'מה זה אומר ש-ChatGPT "ממליץ" עליך?', a: 'כשלקוח שואל בינה מלאכותית "מי הכי טוב ב___ באזור שלי", היא עונה בשמות ספציפיים. אם העסק שלך לא בנוי נכון, היא פשוט לא מכירה אותך — ומפנה את הלקוח למתחרה. הבדיקה מראה איפה אתה עומד.' },
  { q: 'הבדיקה באמת שואלת את הבינה המלאכותית?', a: 'כן. בנוסף לבדיקות הטכניות של האתר, אנחנו שולחים שאלות אמיתיות ל-ChatGPT, Claude, Gemini ו-Perplexity ובודקים אם אתה מופיע בתשובה — ומי כן מופיע. את התשובות המלאות תראה בדוח.' },
  { q: 'זה עולה כסף?', a: 'הבדיקה חינם. גם האבחון הראשוני מול הצוות חינם. אנחנו עובדים בלי חוזה ובלי דמי הקמה — אם תרצה שנטפל בזה בשבילך, נדבר על זה רק אחרי שתראה ערך.' },
  { q: 'למה האתר שלי לא מופיע בבינה מלאכותית?', a: 'ברוב המקרים זו לא אשמתך — ככה בנויים רוב האתרים. הם נבנו למנועי חיפוש ישנים, לא לעולם שבו לקוחות שואלים AI. הבדיקה מראה בדיוק מה חסר, וזה כמעט תמיד ניתן לתיקון.' },
];

function Atmos() {
  return (
    <div className="geo-atmos" aria-hidden="true">
      <div className="geo-grid" />
      <div className="geo-orb geo-orb-1" />
      <div className="geo-orb geo-orb-2" />
      <div className="geo-orb geo-orb-3" />
    </div>
  );
}

export default function AiCheckerClient() {
  return (
    <>
      {/* HERO */}
      <section className="geo-hero">
        <Atmos />
        <div className="container">
          <span className="geo-hero-badge">
            <span className="dot" /> בדיקת נראות ב-AI · חינם
          </span>
          <h1 className="geo-hero-title">
            האם <span className="geo-shimmer">ChatGPT</span> ממליץ על העסק שלך — או על המתחרה?
          </h1>
          <p className="geo-hero-sub">
            היום לקוחות שואלים את הבינה המלאכותית &ldquo;מי הכי טוב ב___&rdquo; — והיא עונה בשם
            אחד. בדקו בחינם אם זה אתה.
          </p>

          <div className="geo-hero-preview">
            <div className="geo-dash">
              <div className="geo-dash-head">
                <div className="geo-dash-dots"><span /><span /><span /></div>
                <span className="geo-dash-title">ai-visibility.report</span>
              </div>
              <div className="geo-dash-grid">
                <div className="geo-metric">
                  <span className="geo-metric-label">סולם GEO</span>
                  <span className="geo-metric-value accent">3<span className="geo-dial-max">/10</span></span>
                </div>
                <div className="geo-metric">
                  <span className="geo-metric-label">ChatGPT מכיר אותך?</span>
                  <span className="geo-metric-value">לא</span>
                </div>
                <div className="geo-metric">
                  <span className="geo-metric-label">מתחרים שכבר מופיעים</span>
                  <span className="geo-metric-value accent">4</span>
                </div>
                <div className="geo-metric">
                  <span className="geo-metric-label">llms.txt</span>
                  <span className="geo-metric-value">חסר</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GeoChecker />

      {/* COMPETITORS-IN-AI SECTION */}
      <section className="sp2-section sp2-section-alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <Atmos />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="geo-steps-layout">
            <ScrollReveal direction="right">
              <div>
                <span className="geo-hero-badge"><span className="dot" /> ניתוח מתחרים</span>
                <h2 className="sp2-section-title">מי מהמתחרים שלך כבר בתוך מנועי ה-AI?</h2>
                <p className="sp2-lead">
                  הבדיקה לא רק בודקת אותך. היא שואלת את מנועי הבינה המלאכותית מי הכי טוב בתחום שלך —
                  ומראה לך בדיוק אילו מתחרים בולטים כבר מופיעים בתשובה. אלה העסקים שמקבלים את הפנייה
                  במקומך, בזמן שאתה לא יודע שזה קורה. בדוח המלא תראה את השמות שלהם, ומה יש להם שאין לך.
                </p>
                <ul className="geo-unlock-list" style={{ maxWidth: 480 }}>
                  <li>שמות המתחרים שה-AI ממליץ עליהם בתחום שלך</li>
                  <li>מה בנוי אצלם נכון וחסר אצלך (llms.txt, schema, ישות מזוהה)</li>
                  <li>איפה בדיוק אתה מפסיד להם את הלקוח</li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div className="geo-dash geo-hover-lift">
                <div className="geo-dash-head">
                  <div className="geo-dash-dots"><span /><span /><span /></div>
                  <span className="geo-dash-title">competitors.ai</span>
                </div>
                <p className="geo-metric-label" style={{ marginBottom: 12 }}>
                  מופיעים כש-AI ממליץ בתחום שלך:
                </p>
                {['מתחרה א׳ · מופיע ב-4 מנועים', 'מתחרה ב׳ · מופיע ב-3 מנועים', 'מתחרה ג׳ · מופיע ב-2 מנועים'].map((c, i) => (
                  <div key={c} className="geo-metric" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ color: 'var(--ink)' }}>{c}</span>
                    <span className="geo-metric-trend">✓ נמצא</span>
                  </div>
                ))}
                <div className="geo-metric" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderColor: 'rgba(220,38,38,0.3)' }}>
                  <span style={{ color: 'var(--ink)' }}>אתה</span>
                  <span style={{ color: '#f87171', fontSize: '0.8rem' }}>✕ לא נמצא</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS — staircase + steps Lottie */}
      <section className="geo-steps-section">
        <Atmos />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title" style={{ textAlign: 'center', marginInline: 'auto' }}>איך זה עובד</h2>
            <p className="sp2-lead" style={{ textAlign: 'center', marginInline: 'auto' }}>חמישה שלבים — משתי דקות ועד תוכנית פעולה מלאה.</p>
          </ScrollReveal>
          <div className="geo-steps-layout" style={{ marginTop: 40 }}>
            <ScrollReveal direction="up" stagger staggerDelay={0.1}>
              <div className="geo-staircase">
                {STEPS.map((s) => (
                  <div key={s.n} className="geo-step">
                    <span className="geo-step-num">{s.n}</span>
                    <div className="geo-step-body">
                      <h3>{s.title}</h3>
                      <p>{s.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollReveal>
            <div className="geo-steps-lottie" aria-hidden="true">
              <StepsLottie />
            </div>
          </div>
        </div>
      </section>

      {/* WHAT WE CHECK */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בודקים</h2>
            <p className="sp2-lead">שלוש שכבות — מהיסודות הטכניים ועד לשאלה הכי חשובה: האם ה-AI ממליץ עליך.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.1}>
            <div className="sp2-features-grid">
              {LAYERS.map((l) => (
                <div key={l.n} className="sp2-feature-card geo-hover-lift">
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

      {/* WHY */}
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

      {/* FINAL CTA */}
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
              <Button href="/#packages" variant="minimal" arrow="left">או צפו בחבילות</Button>
            </div>
          </ScrollReveal>
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
    </>
  );
}
