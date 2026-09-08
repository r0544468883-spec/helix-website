import type { Metadata } from 'next';
import Link from 'next/link';
import { EmojiIcon } from '@/lib/emoji-icon';
import ScrollReveal from '../../components/ScrollReveal';
import JsonLd from '@/app/components/JsonLd';
import { SITE } from '@/lib/site';
import { serviceSchema, breadcrumbSchema } from '@/lib/schema';
import GtmLogoStrip from '../../components/GtmLogoStrip';
import GtmReviews from '../../components/GtmReviews';
import TrustBar from '../../components/service/TrustBar';
import GtmHubHeroLottie from '../../components/GtmHubHeroLottie';
import SectionHeader from '../../components/SectionHeader';
import FAQItem from '../../components/FAQItem';
import GtmUntangle from '../../components/GtmUntangle';
import GtmGuides from '../../components/GtmGuides';

const ACCENT = '#10B981'; // הירוק של HELIX. GTM Engineering הוא שירות, לא מוצר, ולכן באקצנט המותג.

export const metadata: Metadata = {
  title: 'GTM Engineering · הנדסת מנוע ההכנסות | HELIX',
  description:
    'צוות מהנדסי GTM שבונה את מנוע ההכנסות שלכם על HubSpot, Salesforce, Zoho ו-Pipedrive. משפכי שיווק ומכירה, אוטומציות, העשרת דאטה, ניקוד לידים, אינטגרציות וסוכני AI. חוצה פלטפורמות, מבוסס תוצאה. אבחון ארכיטקטורה ראשוני ללא עלות.',
};

const wa = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent('שלום, ראיתי את helix.co.il ורציתי לשמוע על שירותי GTM Engineering')}`;

const TRACKS = [
  {
    slug: 'marketing',
    icon: '🧲',
    tag: 'משפך שיווק',
    name: 'GTM Engineering לשיווק',
    desc: 'הצד ההנדסי של השיווק. לכידת לידים, העשרת דאטה, ניקוד, אוטומציות nurture, שלבי מחזור-חיים, ו-attribution שמראה מאיפה באמת מגיעה ההכנסה. חוצה HubSpot, Salesforce ו-Zoho.',
    points: ['לכידת לידים והעשרה חוצת-פלטפורמות', 'ניקוד לידים ו-lifecycle stages', 'אוטומציות nurture ו-attribution אמיתי'],
  },
  {
    slug: 'sales',
    icon: '🎯',
    tag: 'משפך מכירה',
    name: 'GTM Engineering למכירות',
    desc: 'הצד ההנדסי של המכירות. ארכיטקטורת pipeline, ניתוב לידים ו-speed-to-lead, אוטומציות מכירה, outbound מבוסס סיגנלים, forecasting ו-CPQ. שכל ליד יטופל וכל דיל יהיה נראה.',
    points: ['ארכיטקטורת pipeline ו-deal stages', 'ניתוב, SLA ו-speed-to-lead', 'Outbound עם Clay וסוכני AI'],
  },
];

const STEPS = [
  { n: '01', title: 'אבחון', text: 'ממפים את הסטאק הקיים, נקודות הדליפה והדאטה. בלי פאזת discovery אינסופית.' },
  { n: '02', title: 'ארכיטקטורה', text: 'מתכננים את מודל הדאטה, המשפכים והאוטומציות, חוצה כל הפלטפורמות שלכם.' },
  { n: '03', title: 'בנייה', text: 'בונים, מחברים אינטגרציות, מטמיעים AI ומכשירים את הצוות. משלוחים שבועיים.' },
  { n: '04', title: 'אופטימיזציה', text: 'מודדים, מכווננים ומרחיבים. שותף שנשאר, לא פרויקט שנעלם.' },
];

const REVIEWS = [
  { name: 'מיכל ברנע', role: 'VP Marketing, חברת SaaS', headline: 'לראשונה יודעים מה מייצר pipeline', text: 'היו לנו אלפי אנשי קשר בלי מקור ובלי שלב. HELIX בנו מודל דאטה, ניקוד ו-attribution. עכשיו אנחנו יודעים איזה קמפיין באמת מחזיר.' },
  { name: 'תומר רז', role: 'VP Sales, חברת SaaS', headline: 'זמן המגע הראשון ירד לדקות', text: 'בלי ניתוב אוטומטי לידים חמים ישבו שעות. בנו routing ו-SLA, ואחוז הסגירה עלה תוך חודש.' },
  { name: 'רותם אלוני', role: 'RevOps Lead, חברת סייבר', headline: 'שיווק ומכירות מדברים אותה שפה', text: 'לא הייתה הגדרה מוסכמת של ליד איכותי. בנו lifecycle וניקוד, וההעברות בין הצוותים הפסיקו להיות מלחמה.' },
  { name: 'אורי בן-חיים', role: 'מייסד, סטארטאפ B2B', headline: 'בנינו outbound מאפס', text: 'רצינו pipeline יזום בלי לנפח צוות. הקימו מנוע Clay עם העשרה, סיגנלים וסוכני AI. פגישות נכנסות כל שבוע.' },
  { name: 'עידו פלד', role: 'Head of Growth, פינטק', headline: 'ה-CAC ירד בחודשיים', text: 'שרפנו מדיה בלי דיווח אמיתי. חיברו קמפיין-לליד-לעסקה, והזזנו תקציב לפי מה שבאמת סוגר.' },
  { name: 'יונתן שור', role: 'CRO, חברת בריאות', headline: 'מנהלים לפי מספרים, לא תחושה', text: 'ההנהלה לא ראתה מה קורה ב-pipeline. בנו דשבורדים ותחזית אמינה, ועכשיו יש שליטה מלאה.' },
];

export default function GtmEngineeringHubPage() {
  const crumbs = breadcrumbSchema([
    { name: 'בית', url: SITE.url },
    { name: 'GTM Engineering', url: `${SITE.url}/services/gtm-engineering` },
  ]);
  const svc = serviceSchema({
    name: 'GTM Engineering',
    description:
      'הנדסת מנוע ההכנסות לעסקים. בניית משפכי שיווק ומכירה, אוטומציות, אינטגרציות וסוכני AI על HubSpot, Salesforce, Zoho ו-Pipedrive.',
    path: '/services/gtm-engineering',
    serviceType: 'Go-To-Market Engineering',
  });

  return (
    <div className="gtm-hub">
      <JsonLd data={[svc, crumbs]} />
      <style>{`
        .gtm-hub { --gtm: ${ACCENT}; }
        .gtm-hero { padding: clamp(56px, 10vw, 104px) 0 clamp(28px, 5vw, 48px); }
        .gtm-hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px; align-items: center; }
        .gtm-hero-text { text-align: right; }
        .gtm-hero-visual { max-width: 460px; margin-inline: auto; width: 100%; }
        @media (max-width: 880px) { .gtm-hero-grid { grid-template-columns: 1fr; gap: 20px; } .gtm-hero-text { text-align: center; } .gtm-hero-visual { order: -1; max-width: 320px; } }
        .gtm-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem; font-weight: 700; color: var(--gtm); border: 1px solid color-mix(in srgb, var(--gtm) 40%, transparent); background: color-mix(in srgb, var(--gtm) 12%, transparent); padding: 6px 16px; border-radius: 999px; margin-bottom: 20px; }
        .gtm-hero h1 { font-size: clamp(2rem, 5.5vw, 3.4rem); font-weight: 800; line-height: 1.12; margin-bottom: 18px; }
        .gtm-hero h1 .gtm-accent { color: var(--gtm); }
        .gtm-lead { max-width: 680px; margin: 0 auto 28px; color: var(--ink-muted); font-size: clamp(1rem, 2.4vw, 1.2rem); line-height: 1.65; }
        .gtm-cta-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
        .gtm-btn { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; padding: 13px 26px; border-radius: 12px; text-decoration: none; transition: transform 0.2s, background 0.2s, border-color 0.2s; }
        .gtm-btn-primary { background: var(--gtm); color: #04150e; }
        .gtm-btn-primary:hover { transform: translateY(-2px); }
        .gtm-btn-ghost { border: 1px solid rgba(255,255,255,0.18); color: var(--ink); }
        .gtm-btn-ghost:hover { border-color: var(--gtm); color: #fff; }

        .gtm-platforms { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 30px; }
        .gtm-platform { font-size: 0.9rem; font-weight: 600; color: var(--ink-secondary); border: 1px solid rgba(255,255,255,0.1); border-radius: 999px; padding: 7px 16px; background: rgba(255,255,255,0.02); }

        .gtm-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 820px) { .gtm-grid { grid-template-columns: 1fr; } }
        .gtm-card { position: relative; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 30px; background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15)); overflow: hidden; transition: transform 0.3s, border-color 0.3s; }
        .gtm-card:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--gtm) 45%, transparent); }
        .gtm-card-head { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
        .gtm-card-icon { font-size: 1.7rem; width: 52px; height: 52px; display: inline-flex; align-items: center; justify-content: center; border-radius: 13px; background: color-mix(in srgb, var(--gtm) 14%, transparent); }
        .gtm-card-tag { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; color: var(--gtm); text-transform: uppercase; }
        .gtm-card-name { font-size: 1.3rem; font-weight: 700; }
        .gtm-card-desc { color: var(--ink-muted); line-height: 1.65; margin-bottom: 16px; }
        .gtm-card-points { list-style: none; padding: 0; margin: 0 0 18px; display: flex; flex-direction: column; gap: 8px; }
        .gtm-card-points li { display: flex; align-items: flex-start; gap: 8px; font-size: 0.95rem; }
        .gtm-card-points li::before { content: '✓'; color: var(--gtm); font-weight: 800; }
        .gtm-card-link { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--gtm); text-decoration: none; }

        .gtm-steps { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        @media (max-width: 900px) { .gtm-steps { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 520px) { .gtm-steps { grid-template-columns: 1fr; } }
        .gtm-step { border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 22px; background: rgba(255,255,255,0.02); }
        .gtm-step-n { font-size: 0.9rem; font-weight: 800; color: var(--gtm); margin-bottom: 8px; }
        .gtm-step h3 { font-size: 1.1rem; font-weight: 700; margin-bottom: 6px; }
        .gtm-step p { color: var(--ink-muted); font-size: 0.92rem; line-height: 1.55; }

        .gtm-section-head { text-align: center; margin-bottom: 34px; }
        .gtm-section-head h2 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; margin-bottom: 12px; }
        .gtm-section-head p { color: var(--ink-muted); max-width: 620px; margin: 0 auto; line-height: 1.6; }

        .gtm-final { text-align: center; padding: clamp(48px, 9vw, 88px) 0; }
        .gtm-final h2 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; margin-bottom: 14px; }
        .gtm-final p { color: var(--ink-muted); max-width: 580px; margin: 0 auto 26px; line-height: 1.6; }
      `}</style>

      {/* HERO */}
      <section className="gtm-hero">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="gtm-hero-grid">
              <div className="gtm-hero-text">
                <span className="gtm-eyebrow"><EmojiIcon e="⚙️" /> GTM Engineering</span>
                <h1>מנוע ההכנסות שלכם, <span className="gtm-accent">מהונדס כמו שצריך</span></h1>
                <p className="gtm-lead">
                  רוב החברות קונות עוד כלי. אנחנו מהנדסים את המערכת. צוות מהנדסי GTM שבונה את משפכי השיווק
                  והמכירה, האוטומציות, העשרת הדאטה וסוכני ה-AI, חוצה HubSpot, Salesforce ו-Zoho.
                  מתחילים מהשאלה &quot;איפה מפסידים הכנסה?&quot; ומשם מהנדסים אחורה.
                </p>
                <div className="gtm-cta-row">
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="gtm-btn gtm-btn-primary"><EmojiIcon e="💬" /> לאבחון ארכיטקטורה חינם</a>
                  <a href={SITE.calendlyUrl} target="_blank" rel="noopener noreferrer" className="gtm-btn gtm-btn-ghost"><EmojiIcon e="📅" /> לתאם שיחה</a>
                </div>
              </div>
              <div className="gtm-hero-visual" aria-hidden="true">
                <GtmHubHeroLottie />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* TWO TRACKS */}
      <section className="sw-section">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="gtm-section-head">
              <h2>שני משפכים, מערכת אחת</h2>
              <p>מחלקים לפי פונקציה, לא לפי כלי. כל מסלול חותך את כל הפלטפורמות, וההבדל הוא שיווק מול מכירות.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="gtm-grid">
              {TRACKS.map((t) => (
                <article key={t.slug} className="gtm-card">
                  <div className="gtm-card-head">
                    <span className="gtm-card-icon"><EmojiIcon e={t.icon} /></span>
                    <div>
                      <div className="gtm-card-tag">{t.tag}</div>
                      <div className="gtm-card-name">{t.name}</div>
                    </div>
                  </div>
                  <p className="gtm-card-desc">{t.desc}</p>
                  <ul className="gtm-card-points">
                    {t.points.map((p) => <li key={p}>{p}</li>)}
                  </ul>
                  <Link href={`/services/gtm-engineering/${t.slug}`} className="gtm-card-link">לעמוד המלא ←</Link>
                </article>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* BEFORE / AFTER (untangle) */}
      <GtmUntangle
        variant="marketing"
        title="מ-GTM מפוצל למנוע הכנסות אחד"
        beforeLabel="לפני · חיווט מסובך"
        afterLabel="אחרי · תהליך אחד"
      />

      {/* LOGO STRIP */}
      <GtmLogoStrip />

      {/* HOW WE WORK */}
      <section className="sw-section">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="gtm-section-head">
              <h2>איך אנחנו עובדים</h2>
              <p>ארבעה שלבים, ליווי שנשאר. משלוחים ראשונים תוך ימים, לא חודשים.</p>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="up" stagger staggerDelay={0.06}>
            <div className="gtm-steps">
              {STEPS.map((s) => (
                <div key={s.n} className="gtm-step">
                  <div className="gtm-step-n">{s.n}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* REVIEWS */}
      <ScrollReveal direction="up">
        <GtmReviews
          reviews={REVIEWS}
          eyebrow="לקוחות GTM"
          titleHtml="מה קרה אחרי שהנדסו<br>מחדש את מנוע ההכנסות."
          description="חברות B2B, SaaS וסטארטאפים שהפכו CRM מבולגן למנוע צמיחה שאפשר לסמוך עליו."
        />
      </ScrollReveal>

      {/* TRUST BAR */}
      <TrustBar items={[
        'חוצה HubSpot · Salesforce · Zoho',
        'אבחון ארכיטקטורה ראשוני חינם',
        'משלוחים שבועיים',
        'ליווי שוטף',
        'הדאטה והמערכת נשארים שלכם',
      ]} />

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="container">
          <SectionHeader eyebrow="שאלות נפוצות" titleHtml="מה שחברות שואלות<br>לפני שמתחילים GTM Engineering." />
          <ScrollReveal direction="up">
            <div className="faq-list">
              <FAQItem question="מה זה GTM Engineering ובמה זה שונה מ-RevOps?">
                <p>GTM Engineering הוא הצד ההנדסי של מנוע ההכנסות: בנייה בפועל של משפכים, אוטומציות, אינטגרציות וסוכני AI בתוך ה-CRM. RevOps היא הדיסציפלינה הרחבה שמנהלת את התהליך, ואנחנו הידיים שבונות אותו. בפועל אנחנו עושים את שניהם.</p>
              </FAQItem>
              <FAQItem question="על אילו פלטפורמות אתם עובדים?">
                <p>HubSpot, Salesforce, Zoho ו-Pipedrive כליבת ה-CRM, ומעליהן Clay, Apollo, ZoomInfo, Gong ו-Lusha להעשרה ו-outbound, ו-Make, n8n ו-Slack לאוטומציה. אנחנו מחברים חוצה-פלטפורמות, לא נעולים על ספק אחד.</p>
              </FAQItem>
              <FAQItem question="מה ההבדל בין המסלול לשיווק למסלול למכירות?">
                <p>אותה גישה הנדסית, פונקציה אחרת. השיווק מתמקד בלכידה, העשרה, ניקוד, nurture ו-attribution. המכירות מתמקדות ב-pipeline, ניתוב, speed-to-lead, אוטומציות, outbound ו-forecasting. הרבה חברות לוקחות את שניהם.</p>
              </FAQItem>
              <FAQItem question="יש לנו כבר CRM מסובך. אתם נכנסים לזה?">
                <p>כן. אנחנו עושים אבחון, מסדרים את מודל הדאטה ואת המשפכים, בונים את מה שחסר ומנקים את מה שמבולגן, בלי לשבור את מה שעובד.</p>
              </FAQItem>
              <FAQItem question="כמה זמן עד שרואים תוצאות?">
                <p>משלוחים ראשונים תוך ימים ספורים, בלי פאזת discovery אינסופית. תשתית ראשונה עומדת תוך שבועות, ומשם ממשיכים לכוונן ולהרחיב בליווי שוטף.</p>
              </FAQItem>
              <FAQItem question="כמה זה עולה?">
                <p>לפי היקף. פרויקט חד-פעמי או ריטיינר חודשי. השיחה הראשונה ואבחון הארכיטקטורה הם ללא עלות, ואז חוזרים עם תמחור ברור.</p>
              </FAQItem>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* GUIDES */}
      <GtmGuides
        guides={[
          { title: 'GTM Engineering לשיווק: הצד ההנדסי', href: '/articles/gtm-marketing-what-is', readTime: '9 דקות קריאה' },
          { title: 'GTM Engineering למכירות: להנדס את ה-Pipeline', href: '/articles/gtm-sales-what-is', readTime: '9 דקות קריאה' },
          { title: 'לאחד 15 כלי שיווק לתוך HubSpot', href: '/articles/consolidate-marketing-hubspot', readTime: '8 דקות קריאה' },
          { title: 'מודל ניקוד לידים 40/30/30', href: '/articles/lead-scoring-40-30-30', readTime: '8 דקות קריאה' },
          { title: 'שלבי Lifecycle: מ-Subscriber ל-SQL', href: '/articles/lifecycle-stages-mql-sql', readTime: '7 דקות קריאה' },
          { title: 'Speed-to-Lead: דקות שוות עסקאות', href: '/articles/speed-to-lead-sla', readTime: '7 דקות קריאה' },
          { title: 'Outbound Engineering עם Clay', href: '/articles/outbound-engineering-clay', readTime: '9 דקות קריאה' },
          { title: 'Pipeline נקי ו-Forecast אמין', href: '/articles/pipeline-forecast-hygiene', readTime: '8 דקות קריאה' },
        ]}
      />

      {/* FINAL CTA */}
      <section className="gtm-final">
        <div className="container">
          <ScrollReveal direction="up">
            <h2>יש לכם CRM. חסר לכם מנוע.</h2>
            <p>נתחיל באבחון ארכיטקטורה חינם. נמפה איפה מפסידים הכנסה, ונחזור עם תוכנית הנדסית ברורה. בלי התחייבות.</p>
            <div className="gtm-cta-row">
              <a href={wa} target="_blank" rel="noopener noreferrer" className="gtm-btn gtm-btn-primary"><EmojiIcon e="💬" /> בואו נדבר</a>
              <Link href="/services/gtm-engineering/sales" className="gtm-btn gtm-btn-ghost">GTM למכירות ←</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
