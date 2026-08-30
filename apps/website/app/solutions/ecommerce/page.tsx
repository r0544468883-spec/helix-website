import type { Metadata } from 'next';
import Link from 'next/link';
import { EmojiIcon } from '@/lib/emoji-icon';
import ScrollReveal from '../../components/ScrollReveal';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';

const ACCENT = '#FB7185'; // אקצנט האיקומרס (זהה ל-HELIX Shop)

export const metadata: Metadata = {
  title: 'כל כלי ה-AI לחנות האיקומרס שלך | HELIX',
  description:
    'ערכת ה-AI לחנויות אונליין: סוכן מכירות ושירות בכל ערוץ, רופא-המרות שסוגר עגלות נטושות, קידום מוצרים בגוגל ובמנועי AI, ודשבורד חנות יומי לוואטסאפ. הכל בעברית, מותקן ב-5 דקות.',
};

// ארבעת הכלים שמתאימים לחנות, עם קופי ממוקד-חנות (לא הקופי הגנרי של דף המוצר).
const TOOLS = [
  {
    slug: 'shop',
    icon: '🛍️',
    name: 'HELIX Shop',
    tag: 'סוכן המכירות',
    desc: 'עובד AI שמוכר ונותן שירות בכל ערוץ — צ׳אט באתר, וואטסאפ, אינסטגרם ומסנג׳ר. מאומן על הקטלוג, המלאי והתקנון האמיתיים: ממליץ על המוצר הנכון, סוגר עגלה, עונה על שירות ומעביר לנציג כשצריך.',
    points: ['המלצת מוצר חכמה מהקטלוג', 'מענה 24/7 בכל ערוץ', 'כל שיחה הופכת ללקוח ב-CRM'],
  },
  {
    slug: 'growth-doctor',
    icon: '📈',
    name: 'HELIX Growth Doctor',
    tag: 'המרות ועגלה נטושה',
    desc: 'רופא-הצמיחה מאבחן איפה הגולשים נוטשים — עמוד מוצר, עגלה, צ׳קאאוט — ומתקן בפועל: מפות-חום, משפכים, קוהורטות וניסויי A/B, בעברית ועם פרטיות מלאה.',
    points: ['מזהה נשירה בעגלה ובצ׳קאאוט', 'ניסויי A/B לשיפור המרה', 'קוהורטות שימור לקוחות'],
  },
  {
    slug: 'geo',
    icon: '🔎',
    name: 'HELIX GEO',
    tag: 'קידום מוצרים',
    desc: 'שהחנות תופיע גם בגוגל וגם בתשובות ה-AI: מחקר מילות-חיפוש קניות, תוכן מוצר וקטגוריה שנכתב ומתפרסם לבד, ומדידה של אזכורי המותג ב-ChatGPT ו-Perplexity.',
    points: ['SEO לעמודי מוצר וקטגוריה', 'נראות במנועי AI', 'תוכן שנכתב ומתפרסם אוטומטית'],
  },
  {
    slug: 'dashboards',
    icon: '📊',
    name: 'Helix ecommerce dashboards',
    tag: 'נתוני החנות',
    desc: 'כל המספרים של החנות במסך אחד בעברית — הכנסות לפי ערוץ ומוצר, שיעור המרה, נטישת עגלה ו-ROAS לכל קמפיין. סיכום חכם מגיע כל בוקר לוואטסאפ.',
    points: ['הכנסות לפי ערוץ ומוצר', 'שיעור המרה ונטישת עגלה', 'דייג׳סט יומי לוואטסאפ'],
  },
];

export default function EcommerceSolutionPage() {
  const crumbs = breadcrumbSchema([
    { name: 'בית', url: SITE.url },
    { name: 'התוכנות של HELIX', url: `${SITE.url}/products` },
    { name: 'לחנויות איקומרס', url: `${SITE.url}/solutions/ecommerce` },
  ]);

  return (
    <div className="ec-page">
      <JsonLd data={[crumbs]} />
      <style>{`
        .ec-page { --ec: ${ACCENT}; }
        .ec-hero { padding: clamp(64px, 12vw, 120px) 0 clamp(32px, 6vw, 56px); text-align: center; }
        .ec-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; color: var(--ec); border: 1px solid color-mix(in srgb, var(--ec) 40%, transparent); background: color-mix(in srgb, var(--ec) 12%, transparent); padding: 6px 16px; border-radius: 999px; margin-bottom: 20px; }
        .ec-hero h1 { font-size: clamp(2rem, 5.5vw, 3.4rem); font-weight: 800; line-height: 1.1; margin-bottom: 18px; }
        .ec-hero h1 .ec-accent { color: var(--ec); }
        .ec-lead { max-width: 640px; margin: 0 auto 28px; color: var(--ink-muted); font-size: clamp(1rem, 2.4vw, 1.2rem); line-height: 1.6; }
        .ec-cta-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
        .ec-btn { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; padding: 13px 26px; border-radius: 12px; text-decoration: none; transition: transform 0.2s, background 0.2s; }
        .ec-btn-primary { background: var(--ec); color: #1a0a0e; }
        .ec-btn-primary:hover { transform: translateY(-2px); }
        .ec-btn-ghost { border: 1px solid rgba(255,255,255,0.18); color: var(--ink); }
        .ec-btn-ghost:hover { border-color: var(--ec); color: #fff; }

        .ec-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 820px) { .ec-grid { grid-template-columns: 1fr; } }
        .ec-card { position: relative; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 28px; background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15)); overflow: hidden; transition: transform 0.3s, border-color 0.3s; }
        .ec-card:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--ec) 45%, transparent); }
        .ec-card-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .ec-card-icon { font-size: 1.7rem; width: 52px; height: 52px; display: inline-flex; align-items: center; justify-content: center; border-radius: 13px; background: color-mix(in srgb, var(--ec) 14%, transparent); }
        .ec-card-tag { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; color: var(--ec); text-transform: uppercase; }
        .ec-card-name { font-size: 1.25rem; font-weight: 700; }
        .ec-card-desc { color: var(--ink-muted); line-height: 1.6; margin-bottom: 16px; }
        .ec-card-points { list-style: none; padding: 0; margin: 0 0 18px; display: flex; flex-direction: column; gap: 8px; }
        .ec-card-points li { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; }
        .ec-card-points li::before { content: '✓'; color: var(--ec); font-weight: 800; }
        .ec-card-link { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--ec); text-decoration: none; }

        .ec-final { text-align: center; padding: clamp(48px, 9vw, 88px) 0; }
        .ec-final h2 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; margin-bottom: 14px; }
        .ec-final p { color: var(--ink-muted); max-width: 560px; margin: 0 auto 26px; line-height: 1.6; }
      `}</style>

      {/* HERO */}
      <section className="ec-hero">
        <div className="container">
          <ScrollReveal direction="up">
            <span className="ec-eyebrow"><EmojiIcon e="🛍️" /> לחנויות איקומרס</span>
            <h1>כל כלי ה-AI לחנות שלך, <span className="ec-accent">במקום אחד</span></h1>
            <p className="ec-lead">
              סוכן מכירות שמוכר בכל ערוץ, רופא-המרות שסוגר עגלות נטושות, קידום מוצרים בגוגל ובמנועי ה-AI,
              ודשבורד חנות יומי לוואטסאפ. הכל בעברית, מחובר לחנות שלכם ומותקן ב-5 דקות.
            </p>
            <div className="ec-cta-row">
              <Link href="/products/shop" className="ec-btn ec-btn-primary"><EmojiIcon e="🛍️" /> להתחיל עם HELIX Shop</Link>
              <Link href="/products" className="ec-btn ec-btn-ghost">לכל התוכנות ←</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* TOOLS */}
      <section className="sw-section">
        <div className="container">
          <ScrollReveal direction="up" stagger staggerDelay={0.06}>
            <div className="ec-grid">
              {TOOLS.map((t) => (
                <article key={t.slug} className="ec-card">
                  <div className="ec-card-head">
                    <span className="ec-card-icon"><EmojiIcon e={t.icon} /></span>
                    <div>
                      <div className="ec-card-tag">{t.tag}</div>
                      <div className="ec-card-name">{t.name}</div>
                    </div>
                  </div>
                  <p className="ec-card-desc">{t.desc}</p>
                  <ul className="ec-card-points">
                    {t.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <Link href={`/products/${t.slug}`} className="ec-card-link">לעמוד המלא ←</Link>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="ec-final">
        <div className="container">
          <ScrollReveal direction="up">
            <h2>מוכנים להפוך את החנות לחכמה?</h2>
            <p>מתחילים עם סוכן המכירות, ומרחיבים לשאר הכלים כשרוצים. בלי התחייבות, בלי סוכנות.</p>
            <div className="ec-cta-row">
              <Link href="/products/shop" className="ec-btn ec-btn-primary"><EmojiIcon e="🛍️" /> להתחיל עכשיו</Link>
              <a href={SITE.calendlyUrl} target="_blank" rel="noopener noreferrer" className="ec-btn ec-btn-ghost"><EmojiIcon e="📅" /> לתאם שיחה</a>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
