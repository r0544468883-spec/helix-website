import type { Metadata } from 'next';
import Link from 'next/link';
import { EmojiIcon } from '@/lib/emoji-icon';
import ScrollReveal from '../../components/ScrollReveal';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import StartupDiscountBanner from '../StartupDiscountBanner';

const ACCENT = '#10B981';

export const metadata: Metadata = {
  title: 'כל השירותים של HELIX לסטארטאפים | HELIX',
  description:
    'כל השירותים של HELIX בזווית של סטארטאפ: GTM Engineering, growth hacking, שיווק, מכירות, פיתוח MVP, אתרים, איקומרס, אוטומציות ו-AI. תקציב של סטארטאפ, 20% הנחה קבועה ליזמים, ו-HELIX STAGE חינם.',
};

const GROUPS = [
  {
    title: 'צמיחה, שיווק ומכירות',
    items: [
      { href: '/services/gtm-engineering', icon: '⚙️', name: 'GTM Engineering', badge: 'חדש', desc: 'מנוע ההכנסות מהונדס נכון מהיום הראשון, על HubSpot/Salesforce/Zoho, בלי חוב טכני שתשלמו עליו בסבב הבא.' },
      { href: '/services/growth', icon: '🚀', name: 'Growth Hacking', desc: 'ניסויים מהירים ולולאות צמיחה כדי למצוא ערוץ רכישה שעובד, בתקציב של סטארטאפ.' },
      { href: '/services/marketing', icon: '📣', name: 'שיווק דיגיטלי', desc: 'קמפיינים, תוכן ו-SEO שמביאים לידים אמיתיים, לא דוחות יפים.' },
      { href: '/services/sales-consulting', icon: '🤝', name: 'מכירות ופיתוח עסקי', desc: 'שיטת מכירה, תסריטים ו-CRM כדי לסגור את הלקוחות הראשונים.' },
    ],
  },
  {
    title: 'מוצר, פיתוח וטכנולוגיה',
    items: [
      { href: '/services/development', icon: '💻', name: 'פיתוח תוכנה ואפליקציות', desc: 'MVP וגרסאות ראשונות במהירות, עם קוד שלא תצטרכו לזרוק בהמשך.' },
      { href: '/services/websites', icon: '🌐', name: 'בניית אתרים', desc: 'אתר או לנדינג שממיר, מוכן לגיוס ולקמפיינים.' },
      { href: '/services/ecommerce', icon: '🛍️', name: 'איקומרס', desc: 'חנות שמוכרת, מחוברת לתשלומים, למשלוחים ולאופטימיזציית המרה.' },
      { href: '/services/automation', icon: '🤖', name: 'אוטומציות וסוכני AI', desc: 'אוטומציות ו-AI שמחליפים שלושה עובדים שאין לכם עדיין תקציב להם.' },
    ],
  },
  {
    title: 'ליווי ואסטרטגיה',
    items: [
      { href: '/services/ai-consulting', icon: '🧠', name: 'ליווי והטמעת AI', desc: 'מטמיעים AI בתהליכים כדי לרוץ רזה, מהר, ובלי לגייס צוות שלם.' },
    ],
  },
];

const TRACKS = [
  { href: '/startups/business-development', label: 'פיתוח עסקי · BDR/SDR' },
  { href: '/startups/market-entry', label: 'חדירה לשווקים חדשים' },
  { href: '/startups/readiness', label: 'בדיקת מוכנות למיזם' },
  { href: '/startups/stage', label: 'HELIX STAGE · חינם' },
];

export default function StartupsServicesPage() {
  const crumbs = breadcrumbSchema([
    { name: 'בית', url: SITE.url },
    { name: 'סטארטאפים ויזמים', url: `${SITE.url}/startups` },
    { name: 'כל השירותים', url: `${SITE.url}/startups/services` },
  ]);

  return (
    <div className="sus-page">
      <JsonLd data={[crumbs]} />
      <style>{`
        .sus-page { --sus: ${ACCENT}; }
        .sus-hero { padding: clamp(60px, 11vw, 116px) 0 clamp(24px, 5vw, 44px); text-align: center; }
        .sus-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; color: var(--sus); border: 1px solid color-mix(in srgb, var(--sus) 40%, transparent); background: color-mix(in srgb, var(--sus) 12%, transparent); padding: 6px 16px; border-radius: 999px; margin-bottom: 20px; }
        .sus-hero h1 { font-size: clamp(2rem, 5.5vw, 3.3rem); font-weight: 800; line-height: 1.12; margin-bottom: 18px; }
        .sus-hero h1 span { color: var(--sus); }
        .sus-lead { max-width: 660px; margin: 0 auto 28px; color: var(--ink-muted); font-size: clamp(1rem, 2.4vw, 1.18rem); line-height: 1.65; }
        .sus-cta-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
        .sus-btn { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; padding: 13px 26px; border-radius: 12px; text-decoration: none; transition: transform 0.2s, border-color 0.2s; }
        .sus-btn-primary { background: var(--sus); color: #04150e; }
        .sus-btn-primary:hover { transform: translateY(-2px); }
        .sus-btn-ghost { border: 1px solid rgba(255,255,255,0.18); color: var(--ink); }
        .sus-btn-ghost:hover { border-color: var(--sus); color: #fff; }

        .sus-group { margin-top: clamp(32px, 5vw, 52px); }
        .sus-group-title { font-size: 0.8rem; font-weight: 800; letter-spacing: 0.06em; color: var(--sus); text-transform: uppercase; text-align: center; margin-bottom: 20px; }
        .sus-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 18px; max-width: 960px; margin: 0 auto; }
        @media (max-width: 760px) { .sus-grid { grid-template-columns: 1fr; } }
        .sus-card { position: relative; display: flex; gap: 15px; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 22px 24px; background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15)); text-decoration: none; color: inherit; transition: transform 0.25s, border-color 0.25s; }
        .sus-card:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--sus) 45%, transparent); }
        .sus-card-icon { font-size: 1.5rem; width: 48px; height: 48px; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; border-radius: 12px; background: color-mix(in srgb, var(--sus) 14%, transparent); }
        .sus-card-name { font-size: 1.12rem; font-weight: 700; margin-bottom: 5px; display: flex; align-items: center; gap: 8px; }
        .sus-card-badge { font-size: 0.65rem; font-weight: 800; background: var(--sus); color: #04150e; border-radius: 999px; padding: 2px 8px; }
        .sus-card-desc { color: var(--ink-muted); font-size: 0.93rem; line-height: 1.55; }
        .sus-card-arrow { color: var(--sus); font-weight: 800; align-self: center; }

        .sus-tracks { max-width: 960px; margin: clamp(36px, 6vw, 60px) auto 0; text-align: center; }
        .sus-tracks h2 { font-size: clamp(1.3rem, 3vw, 1.8rem); font-weight: 800; margin-bottom: 8px; }
        .sus-tracks p { color: var(--ink-muted); margin-bottom: 20px; }
        .sus-tracks-row { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .sus-track { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; font-size: 0.92rem; border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; padding: 10px 18px; text-decoration: none; color: var(--ink); transition: border-color 0.2s, background 0.2s; }
        .sus-track:hover { border-color: var(--sus); background: color-mix(in srgb, var(--sus) 10%, transparent); }

        .sus-final { text-align: center; padding: clamp(44px, 8vw, 84px) 0; }
        .sus-final h2 { font-size: clamp(1.6rem, 4vw, 2.3rem); font-weight: 800; margin-bottom: 14px; }
        .sus-final p { color: var(--ink-muted); max-width: 560px; margin: 0 auto 24px; line-height: 1.6; }
      `}</style>

      {/* HERO */}
      <section className="sus-hero">
        <div className="container">
          <ScrollReveal direction="up">
            <span className="sus-eyebrow"><EmojiIcon e="🚀" /> סטארטאפים ויזמים</span>
            <h1>כל השירותים של HELIX, <span>בזווית של סטארטאפ</span></h1>
            <p className="sus-lead">
              תקציב מוגבל, לחץ זמן, וצריך traction אתמול. ריכזנו את כל השירותים במקום אחד, עם המסגור הנכון לסטארטאפ:
              מהיר, רזה, ומדיד. 20% הנחה קבועה ליזמים, ו-HELIX STAGE חינם.
            </p>
            <div className="sus-cta-row">
              <a href={SITE.calendlyUrl} target="_blank" rel="noopener noreferrer" className="sus-btn sus-btn-primary"><EmojiIcon e="📅" /> לשיחת ייעוץ חינם</a>
              <Link href="/startups" className="sus-btn sus-btn-ghost">למסלול הסטארטאפים ←</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* SERVICE GROUPS */}
      <section className="sw-section">
        <div className="container">
          {GROUPS.map((g) => (
            <div key={g.title} className="sus-group">
              <ScrollReveal direction="up">
                <div className="sus-group-title">{g.title}</div>
              </ScrollReveal>
              <ScrollReveal direction="up" stagger staggerDelay={0.06}>
                <div className="sus-grid">
                  {g.items.map((s) => (
                    <Link key={s.href} href={s.href} className="sus-card">
                      <span className="sus-card-icon"><EmojiIcon e={s.icon} /></span>
                      <div style={{ flex: 1 }}>
                        <div className="sus-card-name">{s.name}{s.badge && <span className="sus-card-badge">{s.badge}</span>}</div>
                        <div className="sus-card-desc">{s.desc}</div>
                      </div>
                      <span className="sus-card-arrow">←</span>
                    </Link>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          ))}
        </div>
      </section>

      {/* DISCOUNT BANNER (reused) */}
      <StartupDiscountBanner />

      {/* STARTUP-SPECIFIC TRACKS */}
      <section className="sw-section">
        <div className="container">
          <div className="sus-tracks">
            <ScrollReveal direction="up">
              <h2>מסלולים ייעודיים לסטארטאפים</h2>
              <p>מעבר לשירותים, יש לנו גם מסלולים שנבנו במיוחד ל-founders.</p>
              <div className="sus-tracks-row">
                {TRACKS.map((t) => (
                  <Link key={t.href} href={t.href} className="sus-track">{t.label}</Link>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="sus-final">
        <div className="container">
          <ScrollReveal direction="up">
            <h2>לא בטוחים מאיפה להתחיל?</h2>
            <p>ספרו לנו איפה הסטארטאפ נמצא, ונגיד לכם בכנות מה הכי ישפיע עכשיו. בלי התחייבות.</p>
            <div className="sus-cta-row">
              <a href={SITE.calendlyUrl} target="_blank" rel="noopener noreferrer" className="sus-btn sus-btn-primary"><EmojiIcon e="📅" /> לתאם שיחה</a>
              <Link href="/services/gtm-engineering" className="sus-btn sus-btn-ghost">GTM Engineering ←</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
