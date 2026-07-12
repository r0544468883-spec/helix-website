'use client';

import { Shield, Building2, MapPin, Bot, Database, Sparkles } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import Button from '../components/Button';
import FAQItem from '../components/FAQItem';
import GeoChecker from './GeoChecker';
import GeoSteps from './GeoSteps';
import GeoHeroTyping from './GeoHeroTyping';
import GeoCheckBand from './GeoCheckBand';
import { SITE } from '@/lib/site';

const LADDER_TIERS = [
  { range: '1–3', title: 'נמוך', text: 'ה-AI כמעט לא מוצא אותך. המתחרים מקבלים את הפנייה.' },
  { range: '4–6', title: 'בינוני', text: 'מופיע חלקית — מפספס אותך ברגעים הכי חשובים.' },
  { range: '7–10', title: 'גבוה', text: 'ה-AI מוצא וממליץ עליך בקלות. יש עוד מה למקסם.' },
];

const WA = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(
  'היי, בדקתי את הנראות שלי ב-AI ואשמח לאבחון',
)}`;

const CHECKS = [
  { icon: Shield, title: 'בסיס טכני', items: ['אבטחה (HTTPS)', 'מהירות טעינה', 'תוכן מרונדר (SSR)', 'כותרות והיררכיה', 'התאמה למובייל'] },
  { icon: Building2, title: 'מבנה וזהות', items: ['כרטיס ביקור דיגיטלי (Schema)', 'תגיות שיתוף (OpenGraph)', 'שפת האתר', 'תיאור ומטא-דאטה'] },
  { icon: MapPin, title: 'נראות מקומית', items: ['טלפון וכתובת גלויים', 'אותות NAP', 'שיוך אזורי', 'עסק מקומי מזוהה'] },
  { icon: Bot, title: 'גישת מנועי AI', items: ['קובץ robots.txt', 'קובץ llms.txt', 'גישה ל-GPTBot / ClaudeBot', 'גישה ל-PerplexityBot', 'הרשאת אינדוקס'] },
  { icon: Database, title: 'נוכחות במאגרי AI', items: ['נוכחות ב-Common Crawl', 'ישות ב-Wikidata', 'עומק תוכן לציטוט', 'מקורות מזהים'] },
  { icon: Sparkles, title: 'נראות חיה + מתחרים', items: ['שאילתת ChatGPT', 'שאילתת Claude', 'שאילתת Gemini', 'שאילתת Perplexity', 'זיהוי מתחרים שמופיעים'] },
];

const GET = [
  { n: '01', title: 'הציון המלא', text: 'סולם GEO מ-1 עד 10, עם פירוק מלא לכל קטגוריה — לא רק מספר.' },
  { n: '02', title: 'רשימת תיקונים מתועדפת', text: 'בדיוק מה לתקן, מסודר לפי ההשפעה הכי גדולה קודם.' },
  { n: '03', title: 'שמות המתחרים', text: 'מי מהמתחרים כבר מופיע ב-AI, ומה בנוי אצלם נכון שחסר אצלך.' },
  { n: '04', title: 'תשובות ה-AI בפועל', text: 'מה ChatGPT, Claude, Gemini ו-Perplexity ענו כששאלנו עליך — במילים שלהם.' },
  { n: '05', title: 'תוכנית פעולה', text: 'צעדים ברורים בשפה פשוטה — מה לעשות ובאיזה סדר.' },
  { n: '06', title: 'אבחון ראשוני חינם', text: 'שיחה עם HELIX לסגירת הפער. בלי חוזה, בלי התחייבות.' },
];

const FAQS = [
  { q: 'מה זה אומר ש-ChatGPT "ממליץ" עליך?', a: 'כשלקוח שואל בינה מלאכותית "מי הכי טוב ב___ באזור שלי", היא עונה בשמות ספציפיים. אם העסק שלך לא בנוי נכון, היא פשוט לא מכירה אותך — ומפנה את הלקוח למתחרה. הבדיקה מראה איפה אתה עומד.' },
  { q: 'הבדיקה באמת שואלת את הבינה המלאכותית?', a: 'כן. בנוסף לבדיקות הטכניות של האתר, אנחנו שולחים שאלות אמיתיות ל-ChatGPT, Claude, Gemini ו-Perplexity ובודקים אם אתה מופיע בתשובה — ומי כן מופיע. את התשובות המלאות תראה בדוח.' },
  { q: 'זה עולה כסף?', a: 'הבדיקה חינם. גם האבחון הראשוני מול הצוות חינם. אנחנו עובדים בלי חוזה ובלי דמי הקמה — אם תרצה שנטפל בזה בשבילך, נדבר על זה רק אחרי שתראה ערך.' },
  { q: 'למה האתר שלי לא מופיע בבינה מלאכותית?', a: 'ברוב המקרים זו לא אשמתך — ככה בנויים רוב האתרים. הם נבנו למנועי חיפוש ישנים, לא לעולם שבו לקוחות שואלים AI. הבדיקה מראה בדיוק מה חסר, וזה כמעט תמיד ניתן לתיקון.' },
  { q: 'כמה זמן לוקח לראות תוצאות?', a: 'הבדיקה עצמה לוקחת שניות. תיקונים טכניים (llms.txt, schema, גישת בוטים) משפיעים תוך שבועות ככל שהמנועים סורקים מחדש. נוכחות מלאה נבנית לאורך זמן — אבל הצעד הראשון הוא לדעת בדיוק מה חסר.' },
  { q: 'אני עסק מקומי קטן — זה רלוונטי לי?', a: 'דווקא הכי רלוונטי. לקוחות שואלים AI "מי הכי טוב ב___ באזור שלי", וזה בדיוק המקום שבו עסק מקומי יכול לנצח — אם ה-AI מכיר אותו. רוב העסקים הקטנים בכלל לא בנויים לזה, אז הפער קל יחסית לסגור.' },
  { q: 'מה ההבדל בין זה לבין קידום אתרים (SEO) רגיל?', a: 'SEO קלאסי מתמקד בדירוג בגוגל. כאן אנחנו בודקים גם את השכבה החדשה — האם מנועי הבינה המלאכותית מוצאים, מבינים וממליצים עליך. זה עולם משיק אבל שונה, עם כללים חדשים (כמו llms.txt וגישת בוטים).' },
  { q: 'האם אתם משנים לי את האתר בלי אישור?', a: 'לא. הבדיקה היא לקריאה בלבד — אנחנו לא נוגעים באתר שלך. אם תרצה שנבצע את התיקונים, זה קורה רק אחרי שנתאם איתך בדיוק מה עושים.' },
  { q: 'מה זה llms.txt?', a: 'קובץ קטן וחדש שיושב באתר ומכוון מנועי בינה מלאכותית לתוכן החשוב שלך — בערך כמו sitemap, אבל למודלים של AI. רוב האתרים עדיין בלי אחד, וזה אחד הדברים הראשונים שהבדיקה מזהה.' },
];

function Dot3() {
  return <span className="geo-dash-dots"><span /><span /><span /></span>;
}

export default function AiCheckerClient() {
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
          <h1 className="geo-sr-only">בדיקת נראות ב-AI — האם מנועי הבינה המלאכותית ממליצים על העסק שלך?</h1>
          <span className="geo-hero-badge"><span className="dot" /> בדיקת נראות ב-AI · חינם</span>

          {/* Typing prompt IS the hero */}
          <GeoHeroTyping />

          <p className="geo-hero-sub">
            בדקו בחינם אם ChatGPT, Claude, Gemini ו-Perplexity מכירים וממליצים עליכם — או על המתחרה.
          </p>

          {/* 3 dashboards under the hero (scaup-style) */}
          <div className="geo-dashboards">
            {/* Dashboard 1 — where AI mentions you */}
            <div className="geo-db-panel geo-db-3d">
              <div className="geo-db-titlebar">
                <Dot3 />
                <span className="geo-db-name">ai-visibility</span>
                <span className="geo-db-badge">30 ימים אחרונים</span>
              </div>
              <div className="geo-db-split">
                <div>
                  <h3 className="geo-db-h">איפה ה-AI מזכיר אותך</h3>
                  <div className="geo-db-metrics">
                    <div className="geo-db-metric"><div className="v accent">29</div><span className="l">אזכורים ב-AI</span><span className="up">▲ 12</span></div>
                    <div className="geo-db-metric"><div className="v">11.9K</div><span className="l">טווח הגעה משוער</span><span className="up">▲ 4.3K</span></div>
                  </div>
                  <div className="geo-db-sub">לפי פלטפורמה</div>
                  <div className="geo-db-list">
                    <div className="geo-db-list-row"><span className="plat">◆</span> ChatGPT <span className="rank">3.2K</span></div>
                    <div className="geo-db-list-row"><span className="plat">◆</span> Google AI Overviews <span className="rank">8.7K</span></div>
                  </div>
                </div>
                <div>
                  <div className="geo-db-sub">שאלות שמזכירות את העסק שלך</div>
                  <div className="geo-db-list">
                    <div className="geo-db-list-row">מרפאת שיניים מומלצת בתל אביב <span className="tag">מצוטט</span></div>
                    <div className="geo-db-list-row">עורך דין משפחה באזור המרכז <span className="tag">מצוטט</span></div>
                    <div className="geo-db-list-row">אינסטלטור זמין עכשיו</div>
                    <div className="geo-db-list-row">מספרה מומלצת בסביבה <span className="tag">מצוטט</span></div>
                    <div className="geo-db-list-row">רואה חשבון לעסק קטן</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Row of 2 */}
            <div className="geo-db-row2">
              {/* Dashboard 2 — search visibility */}
              <div className="geo-db-panel geo-db-3d">
                <div className="geo-db-titlebar">
                  <Dot3 />
                  <span className="geo-db-name">visibility</span>
                  <span className="geo-db-badge">השבוע</span>
                </div>
                <h3 className="geo-db-h">הנראות שלך בחיפוש</h3>
                <div className="geo-db-metrics">
                  <div className="geo-db-metric"><div className="v">2.4K</div><span className="l">מופיע בחיפוש</span><span className="up">▲ 340</span></div>
                  <div className="geo-db-metric"><div className="v">180</div><span className="l">קליקים</span><span className="up">▲ 28</span></div>
                  <div className="geo-db-metric"><div className="v accent">3</div><span className="l">שיפורים</span></div>
                </div>
                <div className="geo-db-sub">חיפושים שמובילים אליך</div>
                <div className="geo-db-list">
                  <div className="geo-db-list-row">מרפאת שיניים בקרבתי <span className="rank">#4</span></div>
                  <div className="geo-db-list-row">עורך דין משפחה מרכז <span className="rank">#7</span></div>
                  <div className="geo-db-list-row">אינסטלטור חירום <span className="rank">#12</span></div>
                  <div className="geo-db-list-row">מספרה באזור <span className="rank">#18</span></div>
                </div>
                <div className="geo-db-win">🏆 ניצחון השבוע: מילת מפתח ראשונה בעמוד 1</div>
              </div>

              {/* Dashboard 3 — market & competitors */}
              <div className="geo-db-panel geo-db-3d">
                <div className="geo-db-titlebar">
                  <Dot3 />
                  <span className="geo-db-name">market</span>
                </div>
                <h3 className="geo-db-h">ניתוח שוק ומתחרים</h3>
                <div className="geo-db-callout">
                  <div className="v">12.4K</div>
                  <div className="l">חיפושים/חודש — 47 מונחים שהמתחרים מדורגים עליהם ואתה לא.</div>
                </div>
                <div className="geo-db-sub">המתחרים הבולטים בתחום שלך</div>
                <div className="geo-db-list">
                  <div className="geo-db-list-row">dental-tlv.co.il <span className="tag">חופף ב-14</span></div>
                  <div className="geo-db-list-row">law-center.co.il <span className="tag">חופף ב-11</span></div>
                  <div className="geo-db-list-row">fix-now.co.il <span className="tag">חופף ב-9</span></div>
                  <div className="geo-db-list-row">hair-studio.co.il <span className="tag">חופף ב-7</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <GeoChecker />

      {/* GEO LADDER EXPLAINER */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <span className="geo-hero-badge"><span className="dot" /> שיטת המדידה</span>
            <h2 className="sp2-section-title">מה זה סולם ה-GEO של HELIX?</h2>
            <p className="sp2-lead">
              GEO — Generative Engine Optimization — זו הנראות שלך במנועי הבינה המלאכותית, בדיוק כמו
              ש-SEO היה הנראות בגוגל. סולם ה-GEO של HELIX נותן לך <strong>ציון אחד מ-1 עד 10</strong>{' '}
              ששוקלל משלוש שכבות: האם אפשר למצוא אותך, האם ה-AI מבין שאתה עסק, והאם הוא באמת ממליץ עליך.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <div className="geo-ladder-explain">
              <div className="geo-ladder-scale" aria-hidden="true">
                {Array.from({ length: 10 }, (_, i) => (
                  <span key={i} className={`geo-ladder-tick t${i < 3 ? 'low' : i < 6 ? 'mid' : 'high'}`}>{i + 1}</span>
                ))}
              </div>
              <div className="geo-ladder-tiers">
                {LADDER_TIERS.map((t) => (
                  <div key={t.range} className="geo-ladder-tier">
                    <span className="geo-ladder-range">{t.range}</span>
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <GeoCheckBand />

      {/* COMPETITORS-IN-AI SECTION */}
      <section className="sp2-section sp2-section-alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-2" />
        </div>
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
              <div className="geo-db-panel geo-db-3d">
                <div className="geo-db-titlebar">
                  <Dot3 />
                  <span className="geo-db-name">competitors.ai</span>
                  <span className="geo-db-badge">4 מנועי AI</span>
                </div>
                <p className="geo-db-sub">מופיעים כש-AI ממליץ בתחום שלך</p>
                <div className="geo-db-list">
                  <div className="geo-db-list-row">מתחרה א׳ · 4 מנועים <span className="tag">נמצא</span></div>
                  <div className="geo-db-list-row">מתחרה ב׳ · 3 מנועים <span className="tag">נמצא</span></div>
                  <div className="geo-db-list-row">מתחרה ג׳ · 2 מנועים <span className="tag">נמצא</span></div>
                  <div className="geo-db-list-row">אתה <span className="tag miss">לא נמצא</span></div>
                </div>

                <p className="geo-db-sub" style={{ marginTop: 18 }}>מה בנוי אצלם — וחסר אצלך</p>
                <div className="geo-vs">
                  <div className="geo-vs-row">
                    <span className="geo-vs-head" />
                    <span className="geo-vs-col-them">מתחרים</span>
                    <span className="geo-vs-col-you">אתה</span>
                  </div>
                  {[
                    ['מופיע ב-ChatGPT', true, false],
                    ['קובץ llms.txt', true, false],
                    ['נתונים מובנים (Schema)', true, false],
                    ['ישות מזוהה (Wikidata)', true, false],
                  ].map(([label, them, you]) => (
                    <div key={label as string} className="geo-vs-row">
                      <span className="geo-vs-label">{label as string}</span>
                      <span className={`geo-vs-cell ${them ? 'yes' : 'no'}`}>{them ? '✓' : '✕'}</span>
                      <span className={`geo-vs-cell ${you ? 'yes' : 'no'}`}>{you ? '✓' : '✕'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <GeoCheckBand label="גלו מי מהמתחרים כבר ב-AI — בדיקה חינם" />

      {/* HOW IT WORKS — HELIX timeline + steps Lottie */}
      <GeoSteps />

      <GeoCheckBand />

      {/* WHAT WE CHECK — hover-expand tabs */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בודקים</h2>
            <p className="sp2-lead">שש קטגוריות, עשרות בדיקות — מהיסודות הטכניים ועד לשאלה החיה מול מנועי ה-AI. רחפו על כרטיס כדי לראות מה בפנים.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
              {CHECKS.map((c) => {
                const Icon = c.icon;
                return (
                  <div key={c.title} className="flip-card">
                    <div className="flip-card-inner">
                      <div className="flip-card-front">
                        <span className="flip-card-icon"><Icon size={26} /></span>
                        <h3>{c.title}</h3>
                      </div>
                      <div className="flip-card-back">
                        <span className="flip-card-icon"><Icon size={20} /></span>
                        <h3>{c.title}</h3>
                        <p>{c.items.join(' · ')}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <GeoCheckBand />

      {/* WHAT YOU GET */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה מקבלים בדוח</h2>
            <p className="sp2-lead">לא עוד מספר בודד — דוח שלם שאומר לך בדיוק איפה אתה עומד ומה לעשות. רחפו על כרטיס.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid">
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

      <GeoCheckBand />

      {/* WHY */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why">
              <h2 className="sp2-section-title">החיפוש עובר לבינה המלאכותית. האם העסק שלך כבר מוכן?</h2>
              <p className="sp2-lead">
                מנוע החיפוש של גוגל כבר נותן באופציה הראשונה שלו, במהלך החיפוש, תשובה של הבינה
                המלאכותית של גוגל. יותר ויותר לקוחות מפסיקים לגלול בגוגל ופשוט שואלים את ה-AI למי
                לפנות. מי שה-AI מכיר — מקבל את הפנייה. מי שלא — נעלם. זה קורה עכשיו, בשקט, בלי שאתה
                רואה את זה.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <GeoCheckBand />

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

      {/* BOTTOM FREE CHECK — second entry point */}
      <section className="geo-bottom-check">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title" style={{ textAlign: 'center', marginInline: 'auto' }}>
              בדקו את האתר שלכם — עכשיו, בחינם
            </h2>
            <p className="sp2-lead" style={{ textAlign: 'center', marginInline: 'auto' }}>
              הכניסו כתובת וקבלו את סולם ה-GEO שלכם תוך שניות. ללא הרשמה.
            </p>
          </ScrollReveal>
        </div>
        <GeoChecker id="tool-bottom" />
      </section>
    </>
  );
}
