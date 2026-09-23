'use client';

import { useEffect, useRef, useState, useId, type FormEvent } from 'react';
import { Crosshair, Target, Repeat, Search, Gauge, LineChart, DollarSign, ListChecks, Wrench, Plug, MessageCircle, BarChart3 } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import Button from '../../components/Button';
import FAQItem from '../../components/FAQItem';
import { EmojiIcon } from '@/lib/emoji-icon';
import { SITE } from '@/lib/site';

// Ads Free Scan — mirrors the /ai-checker landing structure and look (geo-* / sp2-* classes).
// Two scan modes share one tool card: A) URL marketing-readiness, B) CSV ad-waste.

// ── tiny local bus so the under-section bands can drive the primary scanner ──
let adsListener: ((u: string) => void) | null = null;
function requestAdsScan(u: string) { adsListener?.(u); }
function registerAdsScanner(cb: (u: string) => void) { adsListener = cb; return () => { if (adsListener === cb) adsListener = null; }; }

const WA = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('היי, בדקתי כמה אני מבזבז בפרסום ואשמח לאבחון')}`;
// The wedge funnels into HELIX Marketing OPS — the paid product that fixes the waste this
// free check detects (negative keywords, pixel/conversion setup, monitoring).
const OPS = '/products/marketing-ops';

// Lightweight GA4 funnel events (no-op if gtag absent). Instruments the wedge's 4 steps —
// scan_started → partial_shown → email_submitted → ops_cta_click — so activation and
// conversion are measurable (CRO: can't optimize what you don't track).
function track(event: string, params: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
  try { g?.('event', event, params); } catch { /* ignore */ }
}

const CHECKS = [
  { icon: Crosshair, title: 'פיקסל ומדידה', items: ['Meta Pixel', 'תג Google Ads', 'Conversions API', 'מעקב אירועים'] },
  { icon: Target, title: 'מעקב-המרות', items: ['GA4', 'ייחוס תוצאות', 'ערך-המרה', 'יעדי-קמפיין'] },
  { icon: Repeat, title: 'רימרקטינג', items: ['קהלי-רימרקטינג', 'פיקסל פעיל', 'רשימות-קהל', 'רדיפה אחרי נוטשים'] },
  { icon: Search, title: 'בזבוז מונחי-חיפוש', items: ['מונחים ללא המרות', 'מועמדי-שלילה', 'הגנת-מותג', 'זליגת-תקציב'] },
  { icon: Gauge, title: 'איכות-נחיתה', items: ['מהירות טעינה', 'CTA ברור', 'לכידת-לידים', 'best-practices'] },
  { icon: LineChart, title: 'ניתוח-התנהגות', items: ['Hotjar / Clarity', 'מפות-חום', 'הקלטות', 'נקודות-נטישה'] },
];

const GET = [
  { icon: DollarSign, title: 'הערכת בזבוז', text: 'כמה מהתקציב זולג היום, ולאן, במספרים.' },
  { icon: ListChecks, title: 'רשימת מונחים לשלילה', text: 'כל מונחי החיפוש שמבזבזים כסף בלי להמיר, עם ראיה.' },
  { icon: Wrench, title: 'תוכנית תיקון', text: 'בדיוק מה לתקן קודם — פיקסל, מעקב, נחיתה — לפי השפעה.' },
  { icon: BarChart3, title: 'בנצ׳מרק לתעשייה', text: 'איך המדדים שלך נראים מול הממוצע בענף שלך.' },
  { icon: Plug, title: 'חיבור אוטומטי ל-OPS', text: 'רוצה שנתקן במקומך? OPS מחבר, שולל ומנטר אוטומטית.' },
  { icon: MessageCircle, title: 'אבחון ראשוני חינם', text: 'שיחה עם HELIX לסגירת הפער. בלי חוזה, בלי התחייבות.' },
];

// Readiness score bands on the HELIX 1-10 ladder (same scale as the GEO check).
const BANDS = [
  { range: '1-3', title: 'קריטי', text: 'אתה מפרסם עיוור, בלי מעקב-המרות. כסף זולג בלי שתדע כמה.' },
  { range: '4-6', title: 'חלקי', text: 'יש מדידה בסיסית אבל פערים שמבזבזים תקציב בשקט.' },
  { range: '7-10', title: 'תקין', text: 'התשתית טובה. נשאר רק לחדד אופטימיזציה שוטפת.' },
];

// How it works — 4 steps (even group).
const STEPS = [
  { n: '01', title: 'הדביקו כתובת או דוח', text: 'כתובת אתר לבדיקת מוכנות, או דוח מונחי-חיפוש מ-Google Ads לבדיקת בזבוז.' },
  { n: '02', title: 'מקבלים ציון וממצאים', text: 'תוך שניות: ציון מוכנות או סכום הבזבוז, עם פירוט מלא של כל ממצא.' },
  { n: '03', title: 'פותחים דוח מלא', text: 'הערכת הבזבוז החודשי, רשימת המונחים לשלילה ותוכנית תיקון.' },
  { n: '04', title: 'OPS סוגר את הפער', text: 'רוצה? OPS מתקן, שולל ומנטר אוטומטית, מאחורי אישור שלך.' },
];

// What the full report contains (for the report-preview section).
const REPORT_BULLETS = [
  'הערכת הבזבוז החודשי במספרים',
  'כל מונחי-החיפוש לשלילה, עם ראיה',
  'סטטוס מלא: פיקסל, מעקב-המרות, רימרקטינג',
  'תוכנית תיקון מסודרת לפי סדר עדיפויות',
];

const FAQS = [
  { q: 'מה הבדיקה בעצם בודקת?', a: 'שני דברים. בדיקת המוכנות סורקת את האתר שלך ומזהה אם יש פיקסל, מעקב-המרות, רימרקטינג וניתוח-התנהגות — כלומר האם אתה בכלל יכול למדוד ולמקסם את הפרסום. בדיקת הבזבוז מנתחת דוח מונחי-חיפוש מ-Google Ads ומראה כמה כסף זולג על מונחים שלא ממירים.' },
  { q: 'צריך לחבר את חשבון הפרסום שלי?', a: 'לא. בדיקת המוכנות צריכה רק כתובת אתר. בדיקת הבזבוז צריכה שתדביק דוח מונחי-חיפוש (CSV) שאתה מייצא לבד מ-Google Ads. אנחנו לא נכנסים לחשבון שלך ולא נוגעים בו. חיבור חשבון חי הוא אופציה בתוך OPS, רק אם תבחר.' },
  { q: 'איך אני מוציא דוח מונחי-חיפוש מ-Google Ads?', a: 'ב-Google Ads: תפריט "דוחות" ← "מונחי חיפוש", בוחרים טווח תאריכים (30-90 יום), ומורידים כ-CSV. מדביקים את התוכן בבדיקה. זהו.' },
  { q: 'זה עולה כסף?', a: 'הבדיקה חינם, וגם האבחון הראשוני מול הצוות חינם. אנחנו עובדים בלי חוזה ובלי דמי הקמה. אם תרצה ש-OPS יתקן וינטר במקומך, נדבר על זה רק אחרי שתראה ערך.' },
  { q: 'אתם משנים לי משהו בחשבון בלי אישור?', a: 'לא. הבדיקה היא לקריאה בלבד — היא מזהה ומדווחת, לא נוגעת בחשבון ולא שוללת מונחים. כל שינוי קורה רק בתוך OPS, מאחורי אישור שלך.' },
  { q: 'מה ההבדל בין זה לבדיקות האחרות שלכם?', a: 'בדיקת ה-GEO בודקת אם מנועי AI ממליצים עליך, ובדיקת המוכנות של המיזם בודקת אם אתה מוכן לשוק. הבדיקה הזו מתמקדת בכסף שאתה כבר מוציא על פרסום ממומן — וכמה ממנו מבוזבז.' },
  { q: 'הבדיקה מדויקת?', a: 'היא שמרנית בכוונה. מונח מסומן לשלילה רק על ראיה (עלות עם אפס המרות מעל סף), מונחי-מותג מוגנים, ומונחים בנפח-נמוך מסומנים "לבדיקה אנושית" ולא לשלילה כפויה. אותה משמעת שיש לסוכני ה-OPS.' },
];

function Dot3() { return <span className="geo-dash-dots"><span /><span /><span /></span>; }

export default function AdsScanClient() {
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
          <span className="geo-hero-badge"><span className="dot" /> בדיקת בזבוז בפרסום · חינם</span>
          <h1 className="geo-hero-title">כמה כסף אתה מבזבז<br />בפרסום הממומן?</h1>
          <p className="geo-hero-sub">
            בדיקה חינמית: גלו איפה התקציב זולג — בפיקסל, במעקב-ההמרות, וברשימת מונחי-החיפוש
            של Google Ads. תוצאות תוך שניות, בלי לחבר חשבון.
          </p>

          {/* dashboard mockups under the hero */}
          <div className="geo-dashboards">
            <div className="geo-db-panel geo-db-3d">
              <div className="geo-db-titlebar">
                <Dot3 /><span className="geo-db-name">ad-spend</span><span className="geo-db-badge">30 ימים אחרונים</span>
              </div>
              <div className="geo-db-split">
                <div>
                  <h3 className="geo-db-h">לאן הולך התקציב</h3>
                  <div className="geo-db-metrics">
                    <div className="geo-db-metric"><div className="v accent">₪3,240</div><span className="l">בזבוז מוערך</span><span className="up">▲ 27%</span></div>
                    <div className="geo-db-metric"><div className="v">47</div><span className="l">מונחים לשלילה</span></div>
                  </div>
                  <div className="geo-db-sub">מונחים שמבזבזים הכי הרבה</div>
                  <div className="geo-db-list">
                    <div className="geo-db-list-row">נעליים ריצה זול <span className="rank">₪311</span></div>
                    <div className="geo-db-list-row">חנות נעליים ליד <span className="rank">₪204</span></div>
                    <div className="geo-db-list-row">מבצע סוף עונה <span className="rank">₪95</span></div>
                  </div>
                </div>
                <div>
                  <div className="geo-db-sub">מדידה ומעקב</div>
                  <div className="geo-db-list">
                    <div className="geo-db-list-row">Meta Pixel <span className="tag">מותקן</span></div>
                    <div className="geo-db-list-row">מעקב-המרות <span className="tag miss">חסר</span></div>
                    <div className="geo-db-list-row">רימרקטינג <span className="tag miss">חסר</span></div>
                    <div className="geo-db-list-row">GA4 <span className="tag">מותקן</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* row of 2 */}
            <div className="geo-db-row2">
              <div className="geo-db-panel geo-db-3d">
                <div className="geo-db-titlebar"><Dot3 /><span className="geo-db-name">readiness</span><span className="geo-db-badge">ציון מוכנות</span></div>
                <h3 className="geo-db-h">כמה טוב אתה מודד</h3>
                <div className="geo-db-callout"><div className="v">5<small>/10</small></div><div className="l">אתה מפרסם, אבל בלי מעקב-המרות מלא. אי אפשר לדעת אילו מודעות באמת עובדות.</div></div>
                <div className="geo-db-sub">מה חסר</div>
                <div className="geo-db-list">
                  <div className="geo-db-list-row">מעקב-המרות (Conversions API) <span className="tag miss">חסר</span></div>
                  <div className="geo-db-list-row">קהלי-רימרקטינג <span className="tag miss">חסר</span></div>
                  <div className="geo-db-list-row">ניתוח-התנהגות <span className="tag miss">חסר</span></div>
                </div>
              </div>

              <div className="geo-db-panel geo-db-3d">
                <div className="geo-db-titlebar"><Dot3 /><span className="geo-db-name">search-terms</span><span className="geo-db-badge">90 יום</span></div>
                <h3 className="geo-db-h">מונחים שמבזבזים כסף</h3>
                <div className="geo-db-list">
                  <div className="geo-db-list-row">נעליים ריצה זול <span className="tag miss">לשלילה ₪311</span></div>
                  <div className="geo-db-list-row">חנות נעליים ליד <span className="tag miss">לשלילה ₪204</span></div>
                  <div className="geo-db-list-row">מבצע סוף עונה <span className="tag miss">לשלילה ₪95</span></div>
                  <div className="geo-db-list-row">קניית נעליים ריצה <span className="tag">ממיר</span></div>
                </div>
                <div className="geo-db-win">חיסכון פוטנציאלי: ₪3,240 בחודש</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AdsScanner id="tool" />

      {/* HOW IT WORKS / TWO CHECKS */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <span className="geo-hero-badge"><span className="dot" /> שתי בדיקות, דקה אחת</span>
            <h2 className="sp2-section-title">שתי דרכים לגלות איפה הכסף נשרף</h2>
            <p className="sp2-lead">
              <strong>בדיקת מוכנות</strong> — מדביקים כתובת אתר, ומגלים אם בכלל אפשר למדוד ולמקסם
              את הפרסום (פיקסל, מעקב-המרות, רימרקטינג). <strong>בדיקת בזבוז</strong> — מדביקים דוח
              מונחי-חיפוש מ-Google Ads, ומקבלים את סכום הבזבוז ואת המונחים לשלילה.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* READINESS BANDS EXPLAINER */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <span className="geo-hero-badge"><span className="dot" /> שיטת המדידה</span>
            <h2 className="sp2-section-title">ציון מוכנות-הפרסום של HELIX</h2>
            <p className="sp2-lead">
              ציון אחד מ-1 עד 10 ששוקלל משלוש שכבות: האם אתה בכלל <strong>מודד</strong> (פיקסל,
              מעקב-המרות), האם אתה <strong>ממקסם</strong> (רימרקטינג, ניתוח-התנהגות), וכמה
              <strong> תקציב זולג</strong> על מונחים שלא ממירים.
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
                {BANDS.map((t) => (
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

      <AdsBand />

      {/* HOW IT WORKS — 4 steps */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">איך זה עובד</h2>
            <p className="sp2-lead">ארבעה צעדים, דקה אחת, בלי הרשמה ובלי לחבר חשבון.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="ads-steps">
              {STEPS.map((s) => (
                <div key={s.n} className="ads-step">
                  <span className="ads-step-n">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <AdsBand />

      {/* WHAT WE CHECK */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה אנחנו בודקים</h2>
            <p className="sp2-lead">שש קטגוריות, מהפיקסל ועד למונחי-החיפוש. רחפו על כרטיס כדי לראות מה בפנים.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid sp-grid-3">
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

      <AdsBand />

      {/* REPORT PREVIEW — the "image of the report" */}
      <section className="sp2-section" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="geo-atmos" aria-hidden="true"><div className="geo-grid" /><div className="geo-orb geo-orb-2" /></div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="geo-steps-layout">
            <ScrollReveal direction="right">
              <div>
                <span className="geo-hero-badge"><span className="dot" /> הדוח המלא</span>
                <h2 className="sp2-section-title">איך נראה הדוח שאתה מקבל</h2>
                <p className="sp2-lead">
                  לא עוד מספר בודד. דוח שלם שאומר לך בדיוק כמה כסף זולג, לאן, ומה לתקן קודם, בשפה פשוטה.
                </p>
                <ul className="geo-unlock-list" style={{ maxWidth: 480 }}>
                  {REPORT_BULLETS.map((b) => <li key={b}>{b}</li>)}
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div className="geo-db-panel geo-db-3d">
                <div className="geo-db-titlebar"><Dot3 /><span className="geo-db-name">ads-report.pdf</span><span className="geo-db-badge">דוגמה</span></div>
                <div className="geo-db-callout"><div className="v">₪3,240</div><div className="l">בזבוז מוערך לחודש · ציון מוכנות 5/10</div></div>

                <p className="geo-db-sub">מונחים לשלילה</p>
                <div className="geo-db-list">
                  <div className="geo-db-list-row">נעליים ריצה זול <span className="tag miss">₪311</span></div>
                  <div className="geo-db-list-row">חנות נעליים ליד <span className="tag miss">₪204</span></div>
                  <div className="geo-db-list-row">מבצע סוף עונה <span className="tag miss">₪95</span></div>
                </div>

                <p className="geo-db-sub" style={{ marginTop: 18 }}>מדידה ומעקב</p>
                <div className="geo-vs">
                  {[
                    ['Meta Pixel', true],
                    ['מעקב-המרות (Conversions API)', false],
                    ['קהלי-רימרקטינג', false],
                    ['ניתוח-התנהגות', false],
                  ].map(([label, ok]) => (
                    <div key={label as string} className="geo-vs-row">
                      <span className="geo-vs-label">{label as string}</span>
                      <span className={`geo-vs-cell ${ok ? 'yes' : 'no'}`}>{ok ? '✓' : '✕'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      <AdsBand />

      {/* WHAT YOU GET */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה מקבלים</h2>
            <p className="sp2-lead">לא עוד מספר בודד — הערכת-בזבוז, רשימת מונחים לשלילה ותוכנית תיקון. רחפו על כרטיס.</p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sp-services-grid sp-grid-3">
              {GET.map((g) => {
                const Icon = g.icon;
                return (
                  <div key={g.title} className="flip-card">
                    <div className="flip-card-inner">
                      <div className="flip-card-front">
                        <span className="flip-card-icon"><Icon size={26} /></span>
                        <h3>{g.title}</h3>
                      </div>
                      <div className="flip-card-back">
                        <span className="flip-card-icon"><Icon size={20} /></span>
                        <h3>{g.title}</h3>
                        <p>{g.text}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <AdsBand />

      {/* WHY */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why" style={{ marginInline: 'auto', textAlign: 'center' }}>
              <h2 className="sp2-section-title">רוב העסקים משלמים על פרסום שהם לא באמת מודדים</h2>
              <p className="sp2-lead">
                פיקסל מותקן חצי, מעקב-המרות שלא הוגדר, מונחי-חיפוש שאף אחד לא בדק חודשים. כל אלה
                גורמים לתקציב לזלוג בשקט — בלי שאתה רואה כמה, ולאן. הבדיקה מראה בדיוק את הפער, וכמה
                הוא עולה לך בכל חודש.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <AdsBand />

      {/* FINAL CTA */}
      <section className="sp2-final-cta">
        <div className="sp2-final-glow" />
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-final-title">שנסגור את הבזבוז במקומך?</h2>
            <p className="sp2-final-subtitle">
              אבחון ראשוני חינם. בלי חוזה, בלי דמי הקמה. נראה לך בדיוק איפה הכסף זולג, ואם תרצה, OPS יתקן וינטר.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="sp2-final-btn">קבלו אבחון ראשוני חינם</a>
              <Button href={OPS} variant="minimal" arrow="left">הכירו את HELIX OPS</Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up"><h2 className="sp2-section-title">שאלות נפוצות</h2></ScrollReveal>
          <ScrollReveal direction="up" delay={0.05}>
            <div className="geo-faq">
              {FAQS.map((f) => (<FAQItem key={f.q} question={f.q}><p>{f.a}</p></FAQItem>))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* BOTTOM CHECK, second entry point */}
      <section className="geo-bottom-check">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title" style={{ textAlign: 'center', marginInline: 'auto' }}>בדקו את הפרסום שלכם, עכשיו, בחינם</h2>
            <p className="sp2-lead" style={{ textAlign: 'center', marginInline: 'auto' }}>הכניסו כתובת או הדביקו דוח, וקבלו תוצאה תוך שניות. ללא הרשמה.</p>
          </ScrollReveal>
        </div>
        <AdsScanner id="tool-bottom" />
      </section>
    </>
  );
}

// ── the tool card — one continuous flow (URL readiness → offer waste check inline) ──
function AdsScanner({ id = 'tool' }: { id?: string }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [urlSeed, setUrlSeed] = useState('');

  useEffect(() => {
    if (id !== 'tool') return;
    return registerAdsScanner((u) => {
      setUrlSeed(u);
      sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [id]);

  return (
    <section className="geo-tool" id={id} ref={sectionRef}>
      <div className="container">
        <UrlScan seed={urlSeed} />
      </div>
      <TabStyles />
    </section>
  );
}

type Signal = { key: string; label: string; status: 'ok' | 'warn' | 'bad'; detail: string; fix: string };
type UrlResult = { ok: boolean; error?: string; runsAds: boolean; score: number; summary: string; signals: Signal[]; wasteBand: string | null; wasteNote: string | null; gated: boolean };

// Step 1 — URL readiness (zero friction). After a result the waste check (Step 2) is offered
// inline — one flow, not competing tabs (CRO: reduce choice at the entry; lead with the aha).
function UrlScan({ seed }: { seed: string }) {
  const [url, setUrl] = useState('');
  const [res, setRes] = useState<UrlResult | null>(null);
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'error'>('idle');
  const [err, setErr] = useState('');
  const [showWaste, setShowWaste] = useState(false);

  useEffect(() => { if (seed) { setUrl(seed); void run(seed); } }, [seed]); // eslint-disable-line react-hooks/exhaustive-deps

  async function run(target: string, email?: string, company?: string) {
    if (!target.trim()) return;
    setPhase('scanning'); setErr('');
    track(email ? 'email_submitted' : 'scan_started', { tool: 'ads-readiness', kind: 'url' });
    try {
      // `company` is the honeypot from the gate. The route has always checked it;
      // until now nothing ever sent it, so the trap caught nothing.
      const r = await fetch('/api/ads-scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: target, email, company }) });
      const d = (await r.json()) as UrlResult;
      if (!d.ok) { setErr(mapErr(d.error)); setPhase('error'); }
      else { setRes(d); setPhase('idle'); if (!email) track('partial_shown', { tool: 'ads-readiness', score: d.score }); }
    } catch { setErr('תקלת רשת. נסו שוב.'); setPhase('error'); }
  }

  return (
    <>
      <form className="geo-input-row" onSubmit={(e) => { e.preventDefault(); void run(url); }}>
        <input type="text" className="geo-url-input" placeholder="הכניסו כתובת אתר, לדוגמה: example.co.il" value={url} onChange={(e) => setUrl(e.target.value)} dir="ltr" aria-label="כתובת האתר לבדיקה" />
        <button type="submit" className="btn btn-primary geo-scan-btn" disabled={phase === 'scanning'}>{phase === 'scanning' ? 'סורק…' : 'בדקו בחינם'}</button>
      </form>
      <p className="geo-input-note">
        ללא הרשמה · תוצאות תוך שניות
        {!showWaste && !res && <> · <button type="button" className="ads-link" onClick={() => setShowWaste(true)}>כבר יש דוח Google Ads? לבדיקת הבזבוז ←</button></>}
      </p>

      {phase === 'error' && <p className="geo-error">{err}</p>}
      {phase === 'scanning' && <div className="geo-scanning" aria-live="polite"><div className="geo-spinner" /><p>בודקים איפה התקציב שלך זולג…</p></div>}

      {res && (
        <div className="geo-results">
          <div className="geo-teaser">
            <div className="geo-score-card geo-db-3d">
              <Dial100 value={res.score} />
              <div className="geo-score-verdict">
                <span className="geo-score-eyebrow">ציון מוכנות-פרסום</span>
                <h3>כמה טוב אתה מודד וממקסם את הפרסום</h3>
                <p>{res.summary}</p>
              </div>
            </div>
          </div>

          <div className="geo-fixes">
            <h3>מה מצאנו</h3>
            <ul className="geo-fix-list">
              {res.signals.map((s) => (
                <li key={s.key} className={`geo-fix-item ${s.status === 'ok' ? 'pass' : s.status === 'warn' ? 'partial' : 'fail'}`}>
                  <span className="geo-fix-icon">{s.status === 'ok' ? '✓' : s.status === 'warn' ? '~' : '✕'}</span>
                  <div>
                    <strong>{s.label}</strong>
                    <span className="geo-fix-detail">{s.detail}</span>
                    {s.fix && <span className="geo-fix-todo">← {s.fix}</span>}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {res.gated ? (
            <Gate
              title="כמה תקציב בסיכון? קבלו את ההערכה + תוכנית תיקון"
              bullets={['הערכת הבזבוז החודשי במספרים', 'תוכנית תיקון לפי סדר עדיפויות', 'איך OPS סוגר את הפער — אבחון חינם']}
              onSubmit={(email, company) => run(url, email, company)}
            />
          ) : (
            <div className="geo-report">
              <div className="geo-report-badge">✓ הדוח נפתח, שלחנו את הפרטים לצוות HELIX</div>
              <div className={`ads-money band-${res.wasteBand ?? 'none'}`}>
                <span className="ads-money-band">סיכון בזבוז: {bandLabel(res.wasteBand)}</span>
                <p>{res.wasteNote}</p>
              </div>
              <div className="geo-report-cta">
                <p>רוצה ש-HELIX OPS יסגור את הפערים האלה במקומך — מעקב-המרות, רימרקטינג וניטור אוטומטי?</p>
                <a href={OPS} className="btn btn-primary" onClick={() => track('ops_cta_click', { tool: 'ads-readiness' })}>הכירו את HELIX OPS ←</a>
                <a href={WA} target="_blank" rel="noopener noreferrer" className="geo-report-packages">או דברו איתנו לאבחון חינם</a>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 2 — waste check, inline after the readiness result (or on demand for power users) */}
      {(res || showWaste) && <CsvScan asStep />}
    </>
  );
}

// ── Tab B: CSV waste ──
type WasteRow = { term: string; cost: number; clicks: number; conversions: number; klass: string; evidence: string };
type WasteResult = { ok: boolean; error?: string; totals: { terms: number; spend: number; wasteEstimate: number; negativeCandidates: number; needsReview: number }; teaser: WasteRow[]; topWaste: WasteRow[]; rows: WasteRow[] | null; gated: boolean };

function CsvScan({ asStep = false }: { asStep?: boolean }) {
  const [csv, setCsv] = useState('');
  const [res, setRes] = useState<WasteResult | null>(null);
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'error'>('idle');
  const [err, setErr] = useState('');

  async function run(email?: string, company?: string) {
    if (!csv.trim()) return;
    setPhase('scanning'); setErr('');
    track(email ? 'email_submitted' : 'scan_started', { tool: 'ads-waste', kind: 'csv' });
    try {
      // `company` is the honeypot from the gate, see UrlScan.
      const r = await fetch('/api/ads-waste', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ csv, email, company }) });
      const d = (await r.json()) as WasteResult;
      if (!d.ok) { setErr(mapErr(d.error)); setPhase('error'); }
      else { setRes(d); setPhase('idle'); if (!email) track('partial_shown', { tool: 'ads-waste', waste: d.totals.wasteEstimate }); }
    } catch { setErr('תקלת רשת. נסו שוב.'); setPhase('error'); }
  }

  return (
    <div className={asStep ? 'ads-step2' : undefined}>
      {asStep && (
        <div className="ads-step2-head">
          <span className="ads-step2-badge">שלב 2 · בונוס</span>
          <h3>רוצה לראות כמה ₪ אתה מבזבז על מונחי-חיפוש?</h3>
          <p>הדביקו דוח מונחי-חיפוש מ-Google Ads ונראה לכם בדיוק כמה תקציב זולג — בחינם.</p>
        </div>
      )}
      <p className="geo-input-note" style={{ marginTop: 0, marginBottom: 12 }}>ב-Google Ads: דוחות ← מונחי חיפוש ← הורדה כ-CSV, ואז הדביקו כאן.</p>
      <textarea className="ads-textarea" rows={6} placeholder={'Search term,Clicks,Cost,Conversions\nנעליים זול,42,₪310,0\n...'} value={csv} onChange={(e) => setCsv(e.target.value)} dir="ltr" aria-label="דוח מונחי חיפוש" />
      <div className="geo-input-row" style={{ justifyContent: 'center' }}>
        <button className="btn btn-primary geo-scan-btn" onClick={() => run()} disabled={phase === 'scanning' || !csv.trim()}>{phase === 'scanning' ? 'מנתח…' : 'בדקו בזבוז בחינם'}</button>
      </div>

      {phase === 'error' && <p className="geo-error">{err}</p>}
      {phase === 'scanning' && <div className="geo-scanning" aria-live="polite"><div className="geo-spinner" /><p>מנתחים את מונחי-החיפוש…</p></div>}

      {res && (
        <div className="geo-results">
          <div className="ads-waste-hero geo-db-3d">
            <span className="ads-waste-num">₪{Math.round(res.totals.wasteEstimate).toLocaleString()}</span>
            <span className="ads-waste-label">בזבוז מוערך · {res.totals.negativeCandidates} מונחים לשלילה מתוך {res.totals.terms}</span>
          </div>

          <div className="geo-fixes">
            <h3>{res.gated ? 'דוגמאות (המונחים היקרים ביותר)' : 'כל המונחים'}</h3>
            <div className="ads-table-wrap">
              <table className="ads-table">
                <thead><tr><th>מונח</th><th>עלות</th><th>המרות</th><th>סיווג</th></tr></thead>
                <tbody>
                  {(res.rows ?? res.topWaste).map((r, i) => (
                    <tr key={i}><td>{r.term}</td><td>₪{Math.round(r.cost)}</td><td>{r.conversions}</td><td><span className={`ads-tag k-${r.klass}`}>{klassLabel(r.klass)}</span></td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {res.gated ? (
            <Gate
              title={`קבלו את כל ${res.totals.negativeCandidates} מונחי-השלילה + חיבור אוטומטי ל-OPS`}
              bullets={['רשימת כל המונחים לשלילה, עם ראיה', 'סיווג מלא: לשלילה / לבדיקה / מותג', 'OPS שולל אותם אוטומטית — אבחון חינם']}
              onSubmit={(email, company) => run(email, company)}
            />
          ) : (
            <div className="geo-report-cta">
              <p>רוצה ש-HELIX OPS ישלול את המונחים האלה אוטומטית וינטר בזבוז חדש?</p>
              <a href={OPS} className="btn btn-primary" onClick={() => track('ops_cta_click', { tool: 'ads-waste' })}>הכירו את HELIX OPS ←</a>
              <a href={WA} target="_blank" rel="noopener noreferrer" className="geo-report-packages">או דברו איתנו לאבחון חינם</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── /10 dial (matches the HELIX ladder used across the other free checks) ──
function Dial100({ value }: { value: number }) {
  const r = 72;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - value / 10);
  return (
    <div className="geo-dial" role="img" aria-label={`ציון ${value} מתוך 10`}>
      <svg viewBox="0 0 168 168">
        <defs><linearGradient id="adsGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#16FFAB" /></linearGradient></defs>
        <circle className="geo-dial-track" cx="84" cy="84" r={r} />
        <circle className="geo-dial-fill" cx="84" cy="84" r={r} style={{ strokeDasharray: c, strokeDashoffset: offset } as React.CSSProperties} />
      </svg>
      <div className="geo-dial-center"><div><span className="geo-dial-num">{value}</span><span className="geo-dial-max">/10</span></div></div>
    </div>
  );
}

// ── email gate (geo-locked style) — email-only, lowest-friction (CRO: fewer fields) ──
function Gate({ title, bullets, onSubmit }: { title: string; bullets: string[]; onSubmit: (email: string, company: string) => void }) {
  const [busy, setBusy] = useState(false);
  const uid = useId();
  return (
    <div className="geo-locked geo-locked-tilt">
      <div className="geo-locked-blur" aria-hidden="true">
        <div className="geo-locked-line" /><div className="geo-locked-line" /><div className="geo-locked-line short" /><div className="geo-locked-line" /><div className="geo-locked-line short" /><div className="geo-locked-line" />
      </div>
      <div className="geo-locked-overlay">
        <span className="geo-locked-lock" aria-hidden="true"><EmojiIcon e="🔒" /></span>
        <h3>{title}</h3>
        <ul className="geo-unlock-list">{bullets.map((b) => <li key={b}>{b}</li>)}</ul>
        <form className="vc-form geo-lead-form ads-gate-form" onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); setBusy(true); const f = new FormData(e.currentTarget); onSubmit(String(f.get('email') ?? ''), String(f.get('company') ?? '')); }}>
          <div className="vc-field"><label htmlFor={uid}>אימייל</label><input id={uid} name="email" type="email" autoComplete="email" required placeholder="name@company.com" /></div>
          {/* Honeypot, same field and same .vc-honeypot pattern as the other HELIX forms:
              off-screen rather than display:none, because password managers skip hidden
              fields and we want them to fill this one. A human never sees or tabs into it. */}
          <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="vc-honeypot" />
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'פותח…' : 'קבלו את התוצאה המלאה, חינם'}</button>
          <p className="geo-lead-note">מייל בלבד · לא נשלח ספאם ולא נמכור את הפרטים · בלי חוזה ובלי התחייבות.</p>
        </form>
      </div>
    </div>
  );
}

// ── under-section band (mirrors GeoCheckBand) ──
function AdsBand({ label }: { label?: string }) {
  const [url, setUrl] = useState('');
  return (
    <div className="geo-band">
      <div className="container">
        <form className="geo-band-inner" onSubmit={(e) => { e.preventDefault(); if (url.trim()) requestAdsScan(url.trim()); }}>
          <span className="geo-band-label">{label ?? 'בדקו את הפרסום שלכם בחינם'}</span>
          <div className="geo-band-row">
            <input type="text" className="geo-url-input" placeholder="example.co.il" value={url} onChange={(e) => setUrl(e.target.value)} dir="ltr" aria-label="כתובת האתר לבדיקה" />
            <button type="submit" className="btn btn-primary geo-scan-btn">בדקו בחינם</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function mapErr(e?: string) {
  const m: Record<string, string> = { invalid_url: 'הכתובת לא תקינה. נסו שוב (למשל example.co.il).', fetch_failed: 'לא הצלחנו להגיע לאתר. בדקו את הכתובת ונסו שוב.', no_header: 'לא זוהתה כותרת דוח מונחי-חיפוש. ודאו שהעמודות כוללות "Search term" ו-"Cost".', no_rows: 'לא נמצאו שורות בדוח.', too_large: 'הקובץ גדול מדי.', rate_limited: 'יותר מדי בדיקות. המתינו דקה ונסו שוב.' };
  return m[e ?? ''] ?? 'משהו השתבש. נסו שוב.';
}
function bandLabel(b: string | null) { return ({ high: 'גבוה', medium: 'בינוני', low: 'נמוך', none: 'אין' } as Record<string, string>)[b ?? 'none'] ?? '—'; }
function klassLabel(k: string) { return ({ keep: 'משאירים', negative_candidate: 'לשלילה', needs_review: 'לבדיקה', do_not_touch: 'מותג' } as Record<string, string>)[k] ?? k; }

// Minimal scoped styles ONLY for the bits the design system doesn't already cover
// (tabs, csv textarea, waste hero, money band, table). Everything else uses geo-*/sp2-*.
function TabStyles() {
  return (
    <style>{`
      .ads-tabs { display:flex; gap:8px; max-width:720px; margin:0 auto 18px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:14px; padding:6px; }
      .ads-tab { flex:1; padding:12px; border:0; background:transparent; color:var(--muted,#9fb8ac); font:inherit; font-weight:600; font-size:14.5px; border-radius:10px; cursor:pointer; transition:.15s; }
      .ads-tab.on { background:linear-gradient(120deg,#059669,#10b981); color:#fff; box-shadow:0 4px 16px rgba(16,185,129,.3); }
      .ads-textarea { width:100%; max-width:820px; margin:0 auto 14px; display:block; background:rgba(0,0,0,.28); border:1px solid rgba(255,255,255,.12); color:#eaf5ef; border-radius:12px; padding:14px 16px; font-family:ui-monospace,monospace; font-size:13px; resize:vertical; }
      .ads-textarea:focus { outline:none; border-color:#34d399; }
      .ads-waste-hero { text-align:center; padding:26px; border-radius:16px; margin-bottom:20px; background:linear-gradient(135deg,rgba(248,113,113,.12),rgba(251,191,36,.06)); border:1px solid rgba(251,191,36,.25); }
      .ads-waste-num { display:block; font-size:clamp(40px,7vw,54px); font-weight:800; color:#fbbf24; line-height:1; }
      .ads-waste-label { color:var(--muted,#c8dbd1); font-size:15px; }
      .ads-table-wrap { overflow-x:auto; }
      .ads-table { width:100%; border-collapse:collapse; font-size:14px; }
      .ads-table th { text-align:right; color:var(--muted,#7d968b); font-weight:600; padding:9px 10px; border-bottom:1px solid rgba(255,255,255,.1); font-size:13px; }
      .ads-table td { padding:11px 10px; border-bottom:1px solid rgba(255,255,255,.05); }
      .ads-tag { font-size:12px; padding:3px 10px; border-radius:6px; background:rgba(255,255,255,.06); white-space:nowrap; }
      .ads-tag.k-negative_candidate { background:rgba(248,113,113,.18); color:#fca5a5; }
      .ads-tag.k-keep { background:rgba(52,211,153,.15); color:#6ee7b7; }
      .ads-tag.k-do_not_touch { background:rgba(96,165,250,.15); color:#93c5fd; }
      .ads-tag.k-needs_review { background:rgba(251,191,36,.15); color:#fcd34d; }
      .ads-money { border-radius:14px; padding:20px; margin-bottom:20px; }
      .ads-money.band-high { background:linear-gradient(135deg,rgba(248,113,113,.14),rgba(248,113,113,.05)); border:1px solid rgba(248,113,113,.3); }
      .ads-money.band-medium { background:linear-gradient(135deg,rgba(251,191,36,.12),rgba(251,191,36,.04)); border:1px solid rgba(251,191,36,.28); }
      .ads-money.band-low, .ads-money.band-none { background:linear-gradient(135deg,rgba(16,185,129,.12),rgba(5,150,105,.05)); border:1px solid rgba(52,211,153,.25); }
      .ads-money-band { display:inline-block; font-weight:700; font-size:14px; margin-bottom:10px; }
      .ads-money p { color:var(--muted,#d5e7dd); line-height:1.65; margin:0; }
      .ads-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
      .ads-step { background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08); border-radius:16px; padding:22px; }
      .ads-step-n { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:11px; font-weight:800; font-size:15px; color:#0b3; background:linear-gradient(120deg,rgba(16,185,129,.18),rgba(52,211,153,.1)); border:1px solid rgba(52,211,153,.28); color:#34d399; margin-bottom:14px; }
      .ads-step h3 { font-size:16px; margin:0 0 6px; }
      .ads-step p { color:var(--muted,#9fb8ac); font-size:14px; line-height:1.6; margin:0; }
      @media (max-width:900px){ .ads-steps{grid-template-columns:repeat(2,1fr)} }
      @media (max-width:560px){ .ads-tabs{flex-direction:column} .ads-steps{grid-template-columns:1fr} }
      .ads-link { background:none; border:0; color:#34d399; font:inherit; cursor:pointer; padding:0; text-decoration:underline; }
      .ads-step2 { margin-top:30px; padding-top:26px; border-top:1px dashed rgba(255,255,255,.14); }
      .ads-step2-head { text-align:center; margin-bottom:16px; }
      .ads-step2-badge { display:inline-block; font-size:12.5px; color:#34d399; background:rgba(52,211,153,.1); border:1px solid rgba(52,211,153,.25); padding:4px 12px; border-radius:999px; margin-bottom:10px; }
      .ads-step2-head h3 { font-size:21px; font-weight:800; margin:0 0 6px; }
      .ads-step2-head p { color:var(--muted,#9fb8ac); font-size:14.5px; margin:0; }
      .ads-gate-form .vc-field { max-width:360px; margin-inline:auto; text-align:right; }
    `}</style>
  );
}
