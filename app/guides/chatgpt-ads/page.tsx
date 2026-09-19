import type { Metadata } from 'next';
import GuideLeadClient from './GuideLeadClient';
import ScrollReveal from '../../components/ScrollReveal';
import HeroBubbles from '../../components/HeroBubbles';

const WA_HREF =
  'https://wa.me/972544468883?text=' +
  encodeURIComponent('היי, ראיתי את המדריך על פרסום ב-ChatGPT ואשמח לשמוע עוד');

export const metadata: Metadata = {
  title: 'מדריך פרסום ב-ChatGPT לעסק הישראלי, חינם | HELIX',
  description:
    'המדריך המעשי לפרסום ממומן ב-ChatGPT: התהליך המלא מ-robots.txt ועד קמפיין רץ ומדוד, עם צילומי מסך אמיתיים, תקציב, עלויות ו-benchmarks. הורדה חינם, בלי ספאם.',
  alternates: { canonical: '/guides/chatgpt-ads' },
  robots: { index: true, follow: true },
  openGraph: {
    title: 'פרסום ב-ChatGPT: המדריך המעשי לעסק הישראלי',
    description: 'התהליך המלא, מא׳ עד ת׳, עם צילומי מסך אמיתיים ומספרים אמיתיים. הורדה חינם.',
    url: '/guides/chatgpt-ads',
    type: 'website',
    images: [{ url: '/guides/chatgpt-ads-cover.png', width: 1280, height: 720 }],
  },
};

const INSIDE = [
  'התהליך המלא, מבדיקת robots.txt ועד קמפיין שרץ ונמדד.',
  'צילומי מסך אמיתיים מכל שלב בממשק ה-Ads Manager.',
  'איך כותבים Context Hints שבאמת מביאים לקוחות (עם דוגמאות).',
  'המספרים האמיתיים: תקציב מינימלי, עלויות ו-benchmarks.',
  'מפרטי הקריאייטיב: אורך כותרת, תמונה, וטון שמנצח.',
  '3 הטעויות ששורפות תקציב, ואיך להימנע מהן.',
];

export default function ChatGptAdsGuidePage() {
  return (
    <main className="guide-lp" dir="rtl">
      <section className="guide-hero">
        <HeroBubbles />
        <ScrollReveal>
          <div className="guide-hero-inner">
            <span className="guide-badge">מתנה מהילדים הטובים של עולם הדיגיטל</span>
            <h1 className="guide-h1">פרסום ב-ChatGPT: המדריך המעשי לעסק הישראלי</h1>
            <p className="guide-sub">
              הפרסום הממומן ב-ChatGPT הגיע לישראל. קבלו את התהליך המלא, מא׳ עד ת׳,
              עם צילומי מסך אמיתיים ומספרים אמיתיים, לפני שכולם נכנסים והמחיר עולה.
            </p>
            <GuideLeadClient />
            <div className="guide-alt">
              <span className="guide-or">או, אם אתם כבר מוכנים</span>
              <a className="guide-wa" href={WA_HREF} target="_blank" rel="noopener noreferrer">
                דברו איתנו עכשיו בוואטסאפ
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="guide-inside">
        <ScrollReveal>
          <div>
            <h2 className="guide-h2">מה יש בפנים</h2>
            <ul className="guide-inside-list">
              {INSIDE.map((item) => (
                <li key={item}><span className="guide-check" aria-hidden="true">✓</span>{item}</li>
              ))}
            </ul>
            <p className="guide-trust">
              כתבנו את זה כי אנחנו הילדים הטובים של עולם הדיגיטל, ובא לנו שתדעו לפני כולם.
              בלי גלולות קסם, בלי טריקים. רק מה שבאמת עובד.
            </p>
            <a className="guide-community" href="/community">
              רוצים עוד ידע כזה? הצטרפו לקהילת הפירגונים של HELIX ←
            </a>
          </div>
        </ScrollReveal>
      </section>

      <section className="guide-about">
        <ScrollReveal>
          <div>
            <h2 className="guide-h2">מי אנחנו</h2>
            <p className="guide-about-lead">
              אנחנו HELIX, הילדים הטובים של עולם הדיגיטל. מבטיחים פחות, מספקים יותר.
            </p>
            <div className="guide-about-grid">
              <div className="guide-about-card">
                <h3>מה אנחנו עושים</h3>
                <p>מביאים לעסקים לקוחות. פיתוח עסקי, שיווק, מכירות ואוטומציות, הכל עם בינה מלאכותית שעובדת בשטח, לא בסלייד.</p>
              </div>
              <div className="guide-about-card">
                <h3>בשביל מי אנחנו כאן</h3>
                <p>לעסקים קטנים, יזמים וסטארטאפים שרוצים לגדול, בלי לשרוף תקציב על ניחושים ובלי באזוורדס.</p>
              </div>
              <div className="guide-about-card">
                <h3>מה אנחנו לא</h3>
                <p>לא מבטיחים קסמים, לא מוכרים אוויר, ולא נועלים אתכם בחוזים. אם משהו לא מתאים לכם, נגיד לכם.</p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <style>{`
        .guide-lp { background: var(--bg); color: var(--ink); overflow-x: clip; }
        .guide-hero { position: relative; overflow: hidden; padding: 88px 24px 48px; text-align: center; }
        .guide-hero::before {
          content: ''; position: absolute; top: -28%; left: 50%; transform: translateX(-50%);
          width: 920px; height: 720px; max-width: 130vw; pointer-events: none; z-index: 0;
          background: radial-gradient(circle at center, rgba(22,255,171,0.14), rgba(16,185,129,0.06) 40%, transparent 68%);
        }
        .guide-hero-inner { position: relative; z-index: 2; min-width: 0; max-width: 820px; margin: 0 auto; }
        .guide-badge {
          display: inline-block; border: 1.5px solid var(--brand); border-radius: 999px;
          padding: 7px 16px; color: var(--neon); font-size: 14px; font-weight: 800; margin-bottom: 22px;
        }
        .guide-h1 { font-size: clamp(30px, 5vw, 52px); font-weight: 900; line-height: 1.14; letter-spacing: -0.5px; margin: 0 0 18px; }
        .guide-sub { font-size: clamp(17px, 2vw, 20px); line-height: 1.6; color: var(--ink-secondary); margin: 0 auto 30px; max-width: 620px; }
        .guide-form { max-width: 520px; margin: 0 auto; }
        .guide-form-row { display: flex; gap: 10px; }
        .guide-form-row input {
          flex: 1; min-width: 0; padding: 14px 16px; border-radius: 8px;
          background: var(--bg-surface); border: 1px solid var(--bg-soft); color: var(--ink);
          font-size: 16px; font-family: inherit; text-align: right;
        }
        .guide-form-row input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px rgba(16,185,129,.2); }
        .guide-form-row .btn-primary { white-space: nowrap; }
        .guide-form-two { display: flex; gap: 10px; margin-bottom: 10px; }
        .guide-form-two input {
          flex: 1; min-width: 0; padding: 14px 16px; border-radius: 8px;
          background: var(--bg-surface); border: 1px solid var(--bg-soft); color: var(--ink);
          font-size: 16px; font-family: inherit; text-align: right;
        }
        .guide-form-two input:focus { outline: none; border-color: var(--brand); box-shadow: 0 0 0 3px rgba(16,185,129,.2); }
        .guide-form-error { color: #f87171; font-size: 14px; margin: 10px 2px 0; }
        .guide-nospam { color: var(--ink-muted); font-size: 14px; margin: 12px 2px 0; }
        .guide-alt { margin-top: 22px; display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .guide-or { color: var(--ink-muted); font-size: 14px; }
        .guide-wa {
          display: inline-flex; align-items: center; gap: 8px; padding: 12px 24px; border-radius: 8px;
          border: 1.5px solid var(--brand); color: var(--neon); font-weight: 700; text-decoration: none; transition: background .2s;
        }
        .guide-wa:hover { background: rgba(16,185,129,.12); }
        .guide-cta-done { max-width: 520px; margin: 0 auto; }
        .guide-done-title { font-size: 22px; font-weight: 800; color: var(--neon); margin: 0 0 8px; }
        .guide-done-sub { color: var(--ink-secondary); font-size: 16px; margin: 0; }
        .guide-done-link { color: var(--brand); text-decoration: underline; }
        .guide-inside { max-width: 900px; margin: 0 auto; padding: 20px 24px 88px; }
        .guide-h2 { font-size: clamp(24px, 3vw, 32px); font-weight: 800; margin: 0 0 24px; text-align: center; }
        .guide-inside-list { list-style: none; padding: 0; margin: 0 auto 28px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px 40px; max-width: 820px; }
        .guide-inside-list li { display: flex; gap: 12px; align-items: flex-start; font-size: 18px; line-height: 1.5; color: var(--ink-secondary); }
        .guide-check { color: var(--brand); font-weight: 900; flex: none; }
        .guide-trust { font-size: 17px; line-height: 1.6; color: var(--ink-muted); max-width: 760px; margin: 0 auto; border-right: 3px solid var(--brand); padding-right: 16px; }
        .guide-community { display: block; text-align: center; margin-top: 28px; color: var(--brand); font-weight: 700; text-decoration: none; }
        .guide-community:hover { text-decoration: underline; }
        .guide-about { max-width: 960px; margin: 0 auto; padding: 8px 24px 96px; }
        .guide-about-lead { font-size: clamp(19px, 2.2vw, 24px); font-weight: 800; color: var(--neon); text-align: center; margin: 0 auto 34px; max-width: 640px; line-height: 1.4; }
        .guide-about-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
        .guide-about-card { background: var(--bg-surface); border: 1px solid var(--bg-soft); border-radius: 12px; padding: 22px; text-align: right; }
        .guide-about-card h3 { color: var(--brand); font-size: 18px; font-weight: 800; margin: 0 0 10px; }
        .guide-about-card p { color: var(--ink-secondary); font-size: 16px; line-height: 1.55; margin: 0; }
        @media (max-width: 860px) {
          .guide-form-row { flex-direction: column; }
          .guide-form-row .btn-primary { width: 100%; justify-content: center; }
          .guide-form-two { flex-direction: column; }
          .guide-inside-list { grid-template-columns: 1fr; }
          .guide-about-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
