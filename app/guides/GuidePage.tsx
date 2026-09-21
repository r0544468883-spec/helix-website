import ScrollReveal from '../components/ScrollReveal';
import HeroBubbles from '../components/HeroBubbles';
import GuideLeadClient from './GuideLeadClient';
import type { GuideConfig } from '@/lib/guides';

// Reusable free-guide landing page. Each guide is just a GuideConfig object
// (see lib/guides.ts) plus its PDF. The brand block and the "מי אנחנו" section
// are constant across the whole series so every guide feels the same.

const WA_NUMBER = '972544468883';
const DEFAULT_TRUST =
  'כתבנו את זה כי אנחנו הילדים הטובים של עולם הדיגיטל, ובא לנו שתדעו לפני כולם. בלי גלולות קסם, בלי טריקים. רק מה שבאמת עובד.';

export default function GuidePage({ config }: { config: GuideConfig }) {
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(config.waText)}`;
  const source = `/guides/${config.slug}`;

  return (
    <main className="guide-lp" dir="rtl">
      <section className="guide-hero">
        <HeroBubbles />
        <ScrollReveal>
          <div className="guide-hero-inner">
            <span className="guide-badge">{config.badge}</span>
            <h1 className="guide-h1">{config.h1}</h1>
            <p className="guide-sub">{config.sub}</p>
            <div className="guide-hero-brand">
              <p className="guide-brand-lead">HELIX, כל מה שעסק קטן צריך, במקום אחד.</p>
              <p>
                שיווק, פיתוח עסקי ומכירות, לצד כלים, תוכנות, בוטים ואוטומציות. ה-AI חתך לנו 60% מהעלויות,
                וההנחה עוברת ישר אליכם: החל מ-1,250 ₪ לחודש, בלי חוזה.
              </p>
              <p className="guide-brand-tag">מבטיחים פחות, מספקים יותר.</p>
            </div>
            <GuideLeadClient pdfUrl={config.pdfUrl} pdfName={config.pdfName} source={source} />
            <div className="guide-alt">
              <span className="guide-or">או, אם אתם כבר מוכנים</span>
              <a className="guide-wa" href={waHref} target="_blank" rel="noopener noreferrer">
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
              {config.inside.map((item) => (
                <li key={item}><span className="guide-check" aria-hidden="true">✓</span>{item}</li>
              ))}
            </ul>
            <p className="guide-trust">{config.trust || DEFAULT_TRUST}</p>
            <a className="guide-community" href="/community">
              רוצים עוד ידע כזה? הצטרפו לקהילת הפרגונים של HELIX ←
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
    </main>
  );
}
