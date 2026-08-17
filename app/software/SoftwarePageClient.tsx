'use client';

import Link from 'next/link';
import { SITE } from '@/lib/site';
import ScrollReveal from '../components/ScrollReveal';
import PricingCarousel from '../components/PricingCarousel';
import { integrationsFor } from '../products/integrations-data';
import { EmojiIcon } from '@/lib/emoji-icon';
import dynamic from 'next/dynamic';

const TechStartupLottie = dynamic(() => import('../components/TechStartupLottie'), { ssr: false });

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את דף התוכנות של HELIX ורציתי לשמוע פרטים ומחירים')}`;

type SW = { slug: string; name: string; cat: string; accent: string; desc: string; icon: string };

const SOFTWARE: SW[] = [
  { slug: 'chief', name: 'HELIX CHIEF', cat: 'מערכת הניהול הכללית', accent: '#6366F1', icon: '🧠',
    desc: 'שכבת ה-AI שיושבת מעל כל הכלים שכבר יש לך (CRM, Slack, Jira, חשבשבת, גוגל) ומנהלת אותם בעברית, בשליטת מתג האוטונומיה. מנהל אחד לכל ה-stack.' },
  { slug: 'crm', name: 'HELIX CHIEF CRM', cat: 'CRM · חינם', accent: '#10B981', icon: '📇',
    desc: 'ה-CRM החינמי לעסקים ישראלים — אנשי קשר, עסקאות, מצב כנסים ותיאום פגישות. ובתוכו HELIX CHIEF: סוכן ה-AI שמנהל לידים ופולואפים במקומך. הראש והידיים של כל כלי HELIX.' },
  { slug: 'marketing-ops', name: 'HELIX Marketing OPS', cat: 'אוטומציית שיווק', accent: '#A78BFA', icon: '🎯',
    desc: 'כל מחזור החיים של תוכן שיווקי במקום אחד, בקשה, יצירה ב-AI, אישור והפצה ל-9 ערוצים כולל וואטסאפ. עברית-first, בנוי למחלקות שיווק ולסוכנויות.' },
  { slug: 'dashboards', name: 'HELIX Dashboards', cat: 'דשבורדים ו-BI', accent: '#60A5FA', icon: '📊',
    desc: 'כל המספרים של העסק במסך אחד בעברית. מחברים כל מקור, מקבלים דשבורד מוכן או בונים בגרירה, וסיכום חכם מגיע כל בוקר לוואטסאפ.' },
  { slug: 'sdr', name: 'HELIX SDR', cat: 'מכירות ו-outbound', accent: '#38BDF8', icon: '🤝',
    desc: 'נציג מכירות שלא ישן, מזהה איתות, חוקר את הליד, כותב פנייה מותאמת ושולח בכל ערוץ, עם אישור אנושי וחסימת ציות מובנית.' },
  { slug: 'geo', name: 'HELIX GEO', cat: 'SEO ו-GEO', accent: '#FBBF24', icon: '🔎',
    desc: 'בוט שמדרג אתכם גם בגוגל וגם במנועי ה-AI. מחקר מילים, כתיבת תוכן אנושי, פרסום לכל CMS ומדידת ציטוטים ב-ChatGPT ו-Perplexity.' },
  { slug: 'reputation', name: 'HELIX Reputation', cat: 'ניקוי שם ומוניטין', accent: '#FB7185', icon: '🛡️',
    desc: 'השם שלכם תחת שליטה, מנטר, מסיר, דוחק ומתקן את מה שמופיע עליכם בגוגל, ברשתות ובתשובות ה-AI. מוצר, לא ריטיינר של אלפי שקלים.' },
  { slug: 'assistant', name: 'HELIX Assistant', cat: 'עובדי AI מתוזמנים', accent: '#10B981', icon: '🧠',
    desc: 'קו של עובדי-AI מתוזמנים, פיננסים, מזכירות, דדליינים ועוד. במקום דשבורד שנכנסים אליו, דייג׳סט או פעולה מגיעים ישר לוואטסאפ.' },
  { slug: 'growth-doctor', name: 'HELIX Growth Doctor', cat: 'המרה ושימור', accent: '#34D399', icon: '📈',
    desc: 'רופא-צמיחה שמאבחן איפה אתם מאבדים לקוחות ומתקן בפועל, מפת-חום, משפכים, קוהורטות וניסויי A/B. בעברית, עם פרטיות מלאה.' },
  { slug: 'forms', name: 'HELIX Forms', cat: 'טפסים וחתימה דיגיטלית', accent: '#2DD4BF', icon: '✍️',
    desc: 'בונים טופס או חוזה, שולחים לחתימה בוואטסאפ, ומקבלים מסמך חתום חזרה. עברית מלאה, מחיר שקוף, ו-AI שמנסח את החוזה מ-prompt.' },
  { slug: 'meeting', name: 'HELIX Meeting', cat: 'פגישות והקלטות', accent: '#22D3EE', icon: '🎙️',
    desc: 'מקליט ומתמלל פגישות, הודעות קוליות וקבצי אודיו בעברית, ומזהה סיגנלים (הבטחות, כוונות קנייה, תיאומים) שהופכים לפעולות: מייל פולואפ, ליד ל-SDR, משימה ב-CRM. בשליטת מתג האוטונומיה. תיאום פגישות מובנה.' },
  { slug: 'shop', name: 'HELIX Shop', cat: 'מכירות ושירות לחנות', accent: '#FB7185', icon: '🛍️',
    desc: 'עובד AI שמוכר ונותן שירות לחנות איקומרס בכל ערוץ, צ׳אט באתר, וואטסאפ, אינסטגרם ומסנג׳ר. מאומן על הקטלוג, המלאי והתקנון האמיתיים, ממליץ על המוצר הנכון, סוגר עגלה, עונה על שירות, ומעביר לנציג כשצריך. כל שיחה הופכת ללקוח ב-CRM ולתובנה. מתקין ב-5 דקות.' },
];

const TIERS = [
  { name: 'Starter', price: '199', users: 'עד 3 משתמשים', usage: '500 פעולות', wa: '100 הודעות', extra: 'היכולות המרכזיות' },
  { name: 'Pro', price: '449', users: 'עד 10 משתמשים', usage: '5,000 פעולות', wa: '500 הודעות', extra: 'ריבוי ערוצים + אנליטיקס', popular: true },
  { name: 'Business', price: '899', users: 'ללא הגבלה', usage: '25,000 פעולות', wa: '2,000 הודעות', extra: 'API + SSO + מיתוג לבן' },
];

export default function SoftwarePageClient() {
  return (
    <div className="sw-page">
      <style>{`
        .sw-hero-split { display: grid; grid-template-columns: 1.05fr 0.95fr; align-items: center; gap: clamp(20px, 5vw, 60px); }
        .sw-hero-text { text-align: right; }
        .sw-hero-text .intro { margin-inline: 0; }
        .sw-hero-visual { height: clamp(280px, 32vw, 420px); }
        @media (max-width: 900px) {
          .sw-hero-split { grid-template-columns: 1fr; }
          .sw-hero-text { text-align: center; }
          .sw-hero-text .intro { margin-inline: auto; }
          .sw-hero-visual { height: clamp(220px, 56vw, 320px); order: -1; }
        }
        .sw-jumpnav { position: sticky; top: 68px; z-index: 40; background: rgba(8,12,10,0.85); backdrop-filter: blur(12px); border-block: 1px solid rgba(16,185,129,0.12); padding: 12px 0; }
        .sw-jumpnav-inner { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; }
        .sw-jumpnav-inner::-webkit-scrollbar { display: none; }
        .sw-chip { flex-shrink: 0; display: inline-flex; align-items: center; min-height: 40px; font-size: 0.8rem; color: #d1d5db; border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 6px 16px; text-decoration: none; transition: all 0.2s; white-space: nowrap; }
        .sw-chip:hover { border-color: var(--c, #10B981); color: #fff; background: color-mix(in srgb, var(--c, #10B981) 12%, transparent); }

        .sw-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 820px) { .sw-grid { grid-template-columns: 1fr; } }
        .sw-card { position: relative; scroll-margin-top: 130px; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 28px; background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15)); overflow: hidden; transition: transform 0.3s, border-color 0.3s; }
        .sw-card::before { content: ''; position: absolute; inset: 0; border-radius: 18px; padding: 1px; background: linear-gradient(140deg, var(--c), transparent 55%); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0.5; transition: opacity 0.3s; pointer-events: none; }
        .sw-card:hover { transform: translateY(-4px); }
        .sw-card:hover::before { opacity: 1; }
        .sw-card-glow { position: absolute; top: -40px; inset-inline-start: -40px; width: 160px; height: 160px; border-radius: 50%; background: var(--c); filter: blur(70px); opacity: 0.18; pointer-events: none; }
        .sw-card-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .sw-card-icon { width: 46px; height: 46px; display: flex; align-items: center; justify-content: center; font-size: 24px; border-radius: 12px; background: color-mix(in srgb, var(--c) 14%, transparent); border: 1px solid color-mix(in srgb, var(--c) 30%, transparent); }
        .sw-card-cat { font-size: 0.72rem; color: var(--c); font-weight: 600; letter-spacing: 0.02em; }
        .sw-card-name { font-size: 1.2rem; font-weight: 800; color: #fff; }
        .sw-card-desc { font-size: 0.92rem; line-height: 1.7; color: #9ca3af; margin-bottom: 18px; }
        .sw-card-link { font-size: 0.85rem; font-weight: 700; color: var(--c); text-decoration: none; display: inline-flex; align-items: center; gap: 4px; }
        .sw-card-link:hover { gap: 8px; }
        .sw-card-int { margin: 0 0 16px; }
        .sw-card-int-label { font-size: 0.7rem; font-weight: 700; color: #6b7280; letter-spacing: 0.02em; margin-bottom: 8px; }
        .sw-card-int-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .sw-card-int-chip { font-size: 0.72rem; font-weight: 600; color: #cbd5e1; padding: 3px 9px; border-radius: 999px; border: 1px solid color-mix(in srgb, var(--c) 26%, transparent); background: color-mix(in srgb, var(--c) 8%, transparent); white-space: nowrap; }
        .sw-card-int-more { font-size: 0.72rem; font-weight: 700; color: var(--c); padding: 3px 4px; }

        .sw-section { padding: clamp(56px, 8vw, 88px) 0; }
        .sw-section-title { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; color: #fff; text-align: center; margin-bottom: 12px; }
        .sw-section-lead { text-align: center; color: #9ca3af; max-width: 620px; margin: 0 auto 40px; line-height: 1.7; }

        .sw-tiers { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        @media (max-width: 820px) { .sw-tiers { grid-template-columns: 1fr; } }
        .sw-tier { position: relative; border: 1px solid rgba(16,185,129,0.15); border-radius: 16px; padding: 28px 24px; background: rgba(10,15,13,0.6); }
        .sw-tier.pop { border-color: rgba(16,185,129,0.5); box-shadow: 0 0 40px rgba(16,185,129,0.1); }
        .sw-tier-badge { position: absolute; top: -12px; right: 20px; background: #10B981; color: #000; font-size: 11px; font-weight: 700; padding: 4px 12px; border-radius: 20px; }
        .sw-tier-name { font-size: 1.1rem; font-weight: 700; color: #fff; margin-bottom: 6px; }
        .sw-tier-price { font-size: 2.4rem; font-weight: 800; color: #10B981; line-height: 1; }
        .sw-tier-price small { font-size: 1rem; color: #6b7280; font-weight: 600; }
        .sw-tier-sub { font-size: 0.75rem; color: #6b7280; margin: 4px 0 18px; }
        .sw-tier ul { list-style: none; padding: 0; margin: 0; }
        .sw-tier li { display: flex; gap: 8px; font-size: 0.86rem; color: #d1d5db; padding: 6px 0; border-top: 1px solid rgba(255,255,255,0.04); }
        .sw-tier li:first-child { border-top: none; }
        .sw-tier li b { color: #fff; }

        .sw-usage-note { text-align:center; font-size: 0.82rem; color: #6b7280; margin-top: 22px; }
        .sw-usage-note b { color: #34d399; }

        .sw-wa { border: 1px solid rgba(37,211,102,0.25); border-radius: 20px; padding: clamp(28px, 5vw, 44px); background: linear-gradient(160deg, rgba(37,211,102,0.06), rgba(0,0,0,0.2)); }
        .sw-wa-head { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
        .sw-wa-badge { font-size: 0.72rem; font-weight: 700; color: #25D366; border: 1px solid rgba(37,211,102,0.4); border-radius: 999px; padding: 4px 12px; }
        .sw-wa-title { font-size: clamp(1.4rem, 3.5vw, 2rem); font-weight: 800; color: #fff; }
        .sw-wa-body { color: #b9c2bd; line-height: 1.8; font-size: 0.95rem; }
        .sw-wa-body strong { color: #fff; }
        .sw-wa-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 26px; }
        @media (max-width: 720px) { .sw-wa-cols { grid-template-columns: 1fr; } }
        .sw-wa-opt { border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 22px; background: rgba(0,0,0,0.2); }
        .sw-wa-opt h4 { font-size: 1.02rem; color: #fff; margin-bottom: 6px; font-weight: 700; }
        .sw-wa-opt p { font-size: 0.84rem; color: #9ca3af; line-height: 1.6; margin-bottom: 12px; }
        .sw-wa-opt table { width: 100%; border-collapse: collapse; }
        .sw-wa-opt td { font-size: 0.84rem; color: #d1d5db; padding: 6px 0; border-top: 1px solid rgba(255,255,255,0.05); }
        .sw-wa-opt td:last-child { text-align: left; color: #34d399; font-weight: 700; }
        .sw-wa-opt tr:first-child td { border-top: none; }
        .sw-wa-note { font-size: 0.78rem; color: #6b7280; margin-top: 18px; line-height: 1.6; }
      `}</style>

      {/* ──── HERO ──── */}
      <section className="page-header sw-hero">
        <div className="container sw-hero-split">
          <div className="sw-hero-text">
            <span className="eyebrow">התוכנות של HELIX</span>
            <h1>כל התוכנות שלנו.<br />במקום אחד, במחיר שקוף.</h1>
            <p className="intro">
              משפחת מוצרי ה-SaaS של HELIX, כל אחד פותר כאב אמיתי, בעברית מלאה, במחיר שקוף.
              בחרו תוכנה כדי לקרוא עליה, או דלגו למטה למחירים ולחבילות.
            </p>
          </div>
          <div className="sw-hero-visual" aria-hidden="true">
            <TechStartupLottie />
          </div>
        </div>
      </section>

      {/* ──── JUMP NAV ──── */}
      <nav className="sw-jumpnav" aria-label="ניווט בין התוכנות">
        <div className="container">
          <div className="sw-jumpnav-inner">
            {SOFTWARE.map((s) => (
              <a key={s.slug} href={`#${s.slug}`} className="sw-chip" style={{ ['--c' as string]: s.accent }}>
                <EmojiIcon e={s.icon} /> {s.name.replace('HELIX ', '')}
              </a>
            ))}
            <a href="#pricing" className="sw-chip" style={{ ['--c' as string]: '#10B981' }}><EmojiIcon e="💳" /> מחירים</a>
            <a href="#whatsapp" className="sw-chip" style={{ ['--c' as string]: '#25D366' }}><EmojiIcon e="💬" /> וואטסאפ</a>
          </div>
        </div>
      </nav>

      {/* ──── PRODUCT BLOCKS ──── */}
      <section className="sw-section">
        <div className="container">
          <ScrollReveal direction="up" stagger staggerDelay={0.06}>
            <div className="sw-grid">
              {SOFTWARE.map((s) => (
                <article key={s.slug} id={s.slug} className="sw-card" style={{ ['--c' as string]: s.accent }}>
                  <span className="sw-card-glow" />
                  <div className="sw-card-head">
                    <span className="sw-card-icon"><EmojiIcon e={s.icon} /></span>
                    <div>
                      <div className="sw-card-cat">{s.cat}</div>
                      <div className="sw-card-name">{s.name}</div>
                    </div>
                  </div>
                  <p className="sw-card-desc">{s.desc}</p>
                  {(() => {
                    const ints = integrationsFor(s.slug);
                    if (ints.length === 0) return null;
                    const shown = ints.slice(0, 6);
                    const rest = ints.length - shown.length;
                    return (
                      <div className="sw-card-int">
                        <div className="sw-card-int-label"><EmojiIcon e="🔗" /> אינטגרציות</div>
                        <div className="sw-card-int-chips">
                          {shown.map((n) => (
                            <span key={n} className="sw-card-int-chip">{n}</span>
                          ))}
                          {rest > 0 && <span className="sw-card-int-more">+{rest}</span>}
                        </div>
                      </div>
                    );
                  })()}
                  <Link href={`/products/${s.slug}`} className="sw-card-link">לעמוד המלא של המוצר ←</Link>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── PRICING MODEL ──── */}
      <section className="sw-section" id="pricing" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sw-section-title">תמחור שקוף. שלושה מסלולים.</h2>
            <p className="sw-section-lead">
              רוב התוכנות במסלול הליבה (למטה). מוצרי ההכנסה, SDR, GEO ו-Assistant, במסלול פרימיום
              (299 / 699 / 1,490 ₪) בגלל עלויות ה-AI הגבוהות. ההבדל בין מסלול למסלול הוא כמה משתמשים
              וכמה שימוש חודשי אתם מקבלים.
            </p>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="sw-tiers">
              {TIERS.map((t) => (
                <div key={t.name} className={`sw-tier${t.popular ? ' pop' : ''}`}>
                  {t.popular && <span className="sw-tier-badge">הכי פופולרי</span>}
                  <div className="sw-tier-name">{t.name}</div>
                  <div className="sw-tier-price">{t.price} <small>₪ / חודש</small></div>
                  <div className="sw-tier-sub">מסלול ליבה · ללא התחייבות</div>
                  <ul>
                    <li><b>{t.users}</b></li>
                    <li><b>{t.usage}</b> בחודש</li>
                    <li>{t.wa} וואטסאפ חינם</li>
                    <li>{t.extra}</li>
                  </ul>
                </div>
              ))}
            </div>
          </ScrollReveal>
          <p className="sw-usage-note">
            <b>מה זו "פעולה"?</b> היחידה שהתוכנה סופרת, ליד ב-SDR, מילת-מפתח ב-GEO, מסמך ב-Forms, דוח ב-Dashboards.
            עד המכסה משלמים מחיר קבוע; מעליה, תוספת קטנה או שדרוג מסלול.
          </p>
        </div>
      </section>

      {/* ──── WHATSAPP COSTS ──── */}
      <section className="sw-section" id="whatsapp">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="sw-wa">
              <div className="sw-wa-head">
                <span className="sw-wa-badge"><EmojiIcon e="💬" /> WhatsApp Business API הרשמי</span>
              </div>
              <h3 className="sw-wa-title">עלויות וואטסאפ, שקוף לחלוטין</h3>
              <p className="sw-wa-body">
                המערכת שולחת הודעות דרך <strong>ה-API הרשמי והמקורי של וואטסאפ (Meta Cloud API)</strong>, ולא דרך
                כלים אפורים. זו החלטה מודעת: שליחה בשיטות לא-רשמיות מובילה ל<strong>חסימת מספרי הטלפון של הלקוחות שלכם</strong>, ואנחנו לא
                מוכנים לסכן את העסק שלכם. הדרך הרשמית שומרת על המספרים בטוחים ומאושרים.
              </p>
              <p className="sw-wa-body" style={{ marginTop: '12px' }}>
                בתמורה, <strong>מטא מחייבת על כל הודעה שהבוט שולח</strong>, התעריפים נקבעים על ידי מטא, משתנים לפי
                מדינה וסוג הודעה, <strong>ואינם בשליטתנו</strong>. לכן עלות ההודעות נפרדת מהמנוי, ואתם בוחרים איך לשלם:
              </p>

              <div className="sw-wa-cols">
                <div className="sw-wa-opt">
                  <h4>לפי שימוש (Pay-as-you-go)</h4>
                  <p>טוענים קרדיט מראש ומשלמים רק על מה ששלחתם. מתאים לנפח נמוך או משתנה.</p>
                  <table>
                    <tbody>
                      <tr><td>מחיר להודעה</td><td>₪0.20</td></tr>
                      <tr><td>טעינה מינימלית</td><td>₪50</td></tr>
                      <tr><td>הבוט מושהה כשנגמר</td><td>✓</td></tr>
                    </tbody>
                  </table>
                </div>
                <div className="sw-wa-opt">
                  <h4>חבילה חודשית</h4>
                  <p>מכסת הודעות קבועה במחיר נמוך יותר להודעה. מתאים לנפח גבוה וקבוע.</p>
                  <table>
                    <tbody>
                      <tr><td>1,000 הודעות</td><td>₪149</td></tr>
                      <tr><td>5,000 הודעות</td><td>₪590</td></tr>
                      <tr><td>25,000 הודעות</td><td>₪2,400</td></tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <p className="sw-wa-note">
                ✓ כל מסלול כולל מכסת הודעות חינם (100 / 500 / 2,000). התשלום מתחיל רק מעליה.<br />
                עדכון מטא: החל מ-1 באוקטובר 2026 גם תגובות הבוט בחלון 24 השעות יחויבו על ידי מטא (היום הן חינם), נעדכן את המכסות בהתאם.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ──── PRICING CAROUSEL ──── */}
      <section className="sw-section" id="packages" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="container">
          <ScrollReveal direction="up">
            <h2 className="sw-section-title">מסלולים וחבילות</h2>
            <p className="sw-section-lead">
              מתחילים מתוכנה אחת, או חוסכים עם חבילה של 3 / 5 / כל התוכנות. חיוב שנתי, חודשיים חינם.
            </p>
          </ScrollReveal>
        </div>
        <PricingCarousel wa={wa} />
      </section>

      {/* ──── FINAL CTA ──── */}
      <section className="sw-section">
        <div className="container" style={{ textAlign: 'center' }}>
          <ScrollReveal direction="up">
            <h2 className="sw-section-title">לא בטוחים איזו תוכנה מתאימה לכם?</h2>
            <p className="sw-section-lead">ספרו לנו על העסק ונרכיב לכם את החבילה הנכונה, בלי התחייבות, בלי דמי הקמה.</p>
            <a href={wa} className="pc-cta" style={{ display: 'inline-block', width: 'auto', padding: '14px 32px' }}>דברו איתנו בוואטסאפ</a>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
