'use client';

import { Sparkles, Target, Gauge, LineChart, Bot, Users } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import FAQItem from '../../components/FAQItem';
import ReadinessScanner from './ReadinessScanner';

const TIERS = [
  { range: '1–3', title: 'מוקדם', text: 'יש יסודות קריטיים לסדר לפני יציאה לשוק.' },
  { range: '4–6', title: 'כמעט', text: 'בדרך הנכונה — אבל יש פערים לסגור לפני שמזרימים תנועה.' },
  { range: '7–10', title: 'מוכן', text: 'הבסיס הטכני מוכן. עכשיו זה עניין של משתמשים ופידבק.' },
];

const CHECKS = [
  { icon: Sparkles, title: 'מסרים ומיצוב (AI)', items: ['האם המסר ברור', 'מבחן 5 שניות', 'קהל יעד ובידול', 'מה בדיוק אתם מוכרים'] },
  { icon: Target, title: 'שוק ומתחרים', items: ['מי המתחרים בשוק 🔓', 'הפיצ׳רים הבולטים 🔓', 'פערים עסקיים לסגור 🔓', 'תמחור והוכחה חברתית 🔓'] },
  { icon: Bot, title: 'נראות ב-AI', items: ['האם ChatGPT ימצא אתכם', 'llms.txt · Schema', 'גישת מנועי AI', 'נוכחות במאגרי אימון'] },
  { icon: Gauge, title: 'ביצועים ו-Lighthouse', items: ['מהירות (PageSpeed)', 'SEO', 'נגישות', 'Best-Practices'] },
  { icon: LineChart, title: 'פיקסלים ומדידה', items: ['Meta Pixel · GA4 · GTM', 'Hotjar · LinkedIn · TikTok', 'כלי המרה: צ׳אט/Calendly/Stripe', 'בלי מדידה אתם עיוורים'] },
  { icon: Users, title: 'קהילת STAGE', items: ['משתמשים ראשונים', 'פידבק אמיתי', 'שותפים / co-founder', 'תוכנית השקה'] },
];

const GET = [
  { n: '01', title: 'ציון מוכנות מלא + תיקונים', text: 'מדד מ-1 עד 10 עם פירוק לכל קטגוריה, וכל פער עם הפעולה המדויקת לתיקון.' },
  { n: '02', title: 'פיקסלים, מדידה וכלי המרה', text: 'אילו פיקסלים באמת מותקנים (Meta, GA4, Hotjar…), צ׳אט, Calendly, Stripe — ומה חסר.' },
  { n: '03', title: 'ציוני Lighthouse ומוכנות legal', text: 'SEO, נגישות ו-Best-Practices, ובדיקת עמודי פרטיות/תנאים/נגישות.' },
  { n: '04', title: 'ניתוח מסרים ומיצוב (AI)', text: 'האם המסרים ברורים, מבחן 5 שניות, ולמי המוצר מיועד — בשפה פשוטה.' },
  { n: '05', title: 'מתחרים, פיצ׳רים ופערים עסקיים', text: 'מי המתחרים בשוק, הפיצ׳רים הבולטים, והפערים לסגור. 🔓 נפתח בהרשמה חינם ל-STAGE.' },
  { n: '06', title: 'תוכנית השקה עם הקהילה', text: 'משתמשים ראשונים, פידבק אמיתי ושותפים — בקהילת HELIX STAGE.' },
];

/* Sample report rows shown in the "peek" panel — illustrative, not a real scan. */
const PEEK = {
  score: 7,
  cats: [
    {
      label: 'מסרים ומיצוב',
      score: 55,
      rows: [
        { label: 'בהירות המסר', status: 'partial', detail: 'לוקח יותר מ-5 שניות להבין מה המוצר עושה ולמי.', fix: 'כותרת אחת: מה זה + למי + התוצאה. בלי ז׳רגון.' },
        { label: 'בידול מול מתחרים', status: 'fail', detail: 'לא ברור במה אתם שונים מ-3 מתחרים דומים.', fix: 'משפט בידול אחד — מה יש לכם שאין להם.' },
      ],
    },
    {
      label: 'בסיס טכני',
      score: 82,
      rows: [
        { label: 'אבטחה (HTTPS)', status: 'pass', detail: 'האתר רץ על HTTPS.' },
        { label: 'מהירות טעינה', status: 'partial', detail: 'ציון מובייל 64/100 · LCP 3.1ש׳.', fix: 'לדחוס תמונות (WebP) ולהוסיף CDN.' },
        { label: 'התאמה למובייל', status: 'pass', detail: 'מוגדר viewport.' },
      ],
    },
    {
      label: 'מדידה והמרות',
      score: 40,
      rows: [
        { label: 'מדידת תנועה (Analytics)', status: 'fail', detail: 'לא זוהה קוד מדידה.', fix: 'להתקין GA4 / GTM כדי למדוד המרות.' },
        { label: 'פיקסל המרות', status: 'fail', detail: 'אין פיקסל — קמפיינים ירוצו עיוורים.', fix: 'להתקין פיקסל Meta / Google Ads.' },
      ],
    },
  ],
} as const;

function peekIcon(s: string): string {
  return s === 'pass' ? '✓' : s === 'partial' ? '~' : '✕';
}

export default function ReadinessClient({
  faqs,
}: {
  faqs: { q: string; a: string }[];
}) {
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
          <span className="geo-hero-badge"><span className="dot" /> בדיקת מוכנות למיזם בחינם <span className="rd-soon">בקרוב</span></span>
          <h1 className="geo-hero-title">
            המוצר עובד.<br />אבל האם ההשקה תצליח?
          </h1>
          <p className="geo-hero-sub">
            הכניסו כתובת וגלו תוך שניות כמה הסטארטאפ שלכם מוכן לצאת לשוק — ומה חסר. בלי הרשמה.
          </p>

          {/* Example result dashboards — lead with the business/messaging angle */}
          <div className="geo-dashboards">
            <div className="geo-db-panel geo-db-3d">
              <div className="geo-db-titlebar">
                <span className="geo-dash-dots"><span /><span /><span /></span>
                <span className="geo-db-name">launch-readiness</span>
                <span className="geo-db-badge">לפני השקה</span>
              </div>
              <div className="geo-db-split">
                <div>
                  <h3 className="geo-db-h">מסרים, מיצוב ושוק</h3>
                  <div className="geo-db-list">
                    <div className="geo-db-list-row">בהירות המסר <span className="tag miss">מבלבל</span></div>
                    <div className="geo-db-list-row">מבחן 5 שניות <span className="tag miss">נכשל</span></div>
                    <div className="geo-db-list-row">קהל יעד ברור <span className="tag">חלקי</span></div>
                    <div className="geo-db-list-row">מתחרים בשוק <span className="tag">4 זוהו</span></div>
                    <div className="geo-db-list-row">בידול מול המתחרים <span className="tag miss">חסר</span></div>
                  </div>
                  <div className="geo-db-sub" style={{ marginTop: 12 }}>בסיס טכני</div>
                  <div className="geo-db-list">
                    <div className="geo-db-list-row">מהירות · מדידה · מובייל <span className="tag">7/10</span></div>
                  </div>
                </div>
                <div>
                  <h3 className="geo-db-h">מה לחדד לפני השקה</h3>
                  <div className="geo-db-list">
                    <div className="geo-db-list-row">חידוד המסר המרכזי <span className="rank">#1</span></div>
                    <div className="geo-db-list-row">בידול מול המתחרה <span className="rank">#2</span></div>
                    <div className="geo-db-list-row">הבהרת קהל היעד <span className="rank">#3</span></div>
                    <div className="geo-db-list-row">התקנת מדידת המרות</div>
                    <div className="geo-db-list-row">שיפור מהירות מובייל</div>
                  </div>
                  <div className="geo-db-win">🎯 המוצר מוכן — עכשיו שהמסר יהיה חד כמוהו</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ReadinessScanner />

      {/* READINESS SCALE EXPLAINER */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <span className="geo-hero-badge"><span className="dot" /> שיטת המדידה</span>
            <h2 className="sp2-section-title">מדד המוכנות של HELIX</h2>
            <p className="sp2-lead">
              ציון אחד מ-1 עד 10 ששוקלל מכל מה שקובע השקה — <strong>בהירות המסרים והמיצוב מול
              המתחרים</strong>, ולצידם גם הבסיס הטכני (ביצועים, מדידה, נראות ב-AI). לא כדי להלחיץ,
              אלא כדי לדעת בדיוק מה לחדד קודם.
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
                {TIERS.map((t) => (
                  <div key={t.range} className="geo-ladder-tier">
                    <span className="geo-ladder-range" dir="ltr">{t.range}</span>
                    <h3>{t.title}</h3>
                    <p>{t.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* WHAT WE CHECK */}
      <section className="sp2-section sp2-section-alt">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה בודקים לפני השקה</h2>
            <p className="sp2-lead">
              מתחילים במה שבאמת מכריע — <strong>המסר, המיצוב והשוק</strong> — וממשיכים לבסיס הטכני.
              רחפו על כרטיס. (🔓 = נפתח בהרשמה חינם ל-STAGE)
            </p>
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

      {/* WHAT YOU GET IN THE REPORT */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title">מה מקבלים בבדיקה</h2>
            <p className="sp2-lead">
              שתי שכבות — טכני ועסקי — כבר בסריקה הראשונה. חלק מהתובנות העמוקות (מתחרים, פיצ׳רים,
              פערים עסקיים) נפתחות בהרשמה חינם ל-STAGE. רחפו על כרטיס.
            </p>
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

      {/* PEEK AT THE REPORT — example detail rows, like the GEO report */}
      <section className="sp2-section sp2-section-alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-2" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="geo-steps-layout">
            <ScrollReveal direction="right">
              <div>
                <span className="geo-hero-badge"><span className="dot" /> הצצה לדוח</span>
                <h2 className="sp2-section-title">ככה נראה הדוח שתקבלו</h2>
                <p className="sp2-lead">
                  כל פער מגיע עם הסבר בשפה פשוטה ועם הפעולה המדויקת לתיקון — מסודר לפי קטגוריה,
                  עם ציון לכל אחת, כדי שתדעו בדיוק מאיפה להתחיל.
                </p>
                <ul className="geo-unlock-list" style={{ maxWidth: 480 }}>
                  <li>ציון לכל קטגוריה — רואים מיד איפה החולשה</li>
                  <li>לכל פער: מה קורה עכשיו + מה בדיוק לעשות</li>
                  <li>מסומן לפי חומרה: תקין · חלקי · חסר</li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="left">
              <div className="geo-db-panel geo-db-3d">
                <div className="geo-db-titlebar">
                  <span className="geo-dash-dots"><span /><span /><span /></span>
                  <span className="geo-db-name">readiness-report</span>
                  <span className="geo-db-badge">ציון {PEEK.score}/10</span>
                </div>
                {PEEK.cats.map((c) => (
                  <div key={c.label} className="rd-peek-cat">
                    <div className="geo-fix-cat-head">
                      <span>{c.label}</span>
                      <span className="geo-cat-score">{c.score}%</span>
                    </div>
                    <ul className="geo-fix-list">
                      {c.rows.map((r) => (
                        <li key={r.label} className={`geo-fix-item ${r.status}`}>
                          <span className="geo-fix-icon">{peekIcon(r.status)}</span>
                          <div>
                            <strong>{r.label}</strong>
                            <span className="geo-fix-detail">{r.detail}</span>
                            {'fix' in r && r.fix && <span className="geo-fix-todo">→ {r.fix}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS — value, single-goal (no competing CTA) */}
      <section className="sp2-section">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="geo-why">
              <h2 className="sp2-section-title">רוב הסטארטאפים משיקים עיוורים</h2>
              <p className="sp2-lead">
                מוצר טוב לא מספיק. השקה שמזרימה תנועה לאתר איטי, בלי פיקסל שמודד המרות, בלי שמנועי AI
                מכירים אותך — שורפת תקציב ולידים בשקט. הבדיקה מראה לך <strong>בדיוק מה לסדר קודם</strong>,
                בשפה פשוטה, לפני שאתה יוצא לשוק — כדי שכל שקל שיווקי יעבוד.
              </p>
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
              {faqs.map((f) => (
                <FAQItem key={f.q} question={f.q}>
                  <p>{f.a}</p>
                </FAQItem>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* BOTTOM SCANNER — second entry point */}
      <section className="geo-bottom-check">
        <div className="geo-atmos" aria-hidden="true">
          <div className="geo-grid" />
          <div className="geo-orb geo-orb-1" />
        </div>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <ScrollReveal direction="up">
            <h2 className="sp2-section-title" style={{ textAlign: 'center', marginInline: 'auto' }}>
              בדקו את המוכנות שלכם — עכשיו, בחינם
            </h2>
            <p className="sp2-lead" style={{ textAlign: 'center', marginInline: 'auto' }}>
              הכניסו כתובת וקבלו את ציון המוכנות שלכם תוך שניות. ללא הרשמה.
            </p>
          </ScrollReveal>
        </div>
        <ReadinessScanner id="tool-bottom" />
      </section>
    </>
  );
}
