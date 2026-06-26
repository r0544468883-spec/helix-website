'use client';

import SectionHeader from '../SectionHeader';
import ScrollTextHighlight from '../ScrollTextHighlight';

interface CaseEntry {
  sector: string;
  title: string;
  brand: string;
  desc: string;
  tags: string[];
  metric: string;
  gradient: string;
}

interface RepoEntry {
  name: string;
  displayName: string;
  desc: string;
  tags: string[];
  lang: string;
  url: string;
  live?: string;
}

const cases: CaseEntry[] = [
  {
    sector: 'Wedding-tech',
    brand: 'MatchMe',
    title: 'פלטפורמת לידים חכמה לספקי חתונות',
    desc: 'התאמה אלגוריתמית בין זוגות לספקים לפי סגנון, תקציב, וצרכים. לידים חמים בלבד. שאלון מותאם, מנוע התאמה, ופאנל ניהול.',
    tags: ['פיתוח', 'UX', 'אוטומציה', 'לידים'],
    metric: 'פעיל באוויר · matchme.co.il',
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
  },
  {
    sector: 'AR / Mobile',
    brand: 'Show-me',
    title: 'אפליקציית AR לעיצוב פרגולות וחוץ',
    desc: 'אפליקציה שמאפשרת ללקוחות להציב מודלים תלת-ממדיים של פרגולות בגינה דרך הטלפון.',
    tags: ['מובייל', 'AR', '3D', 'UX'],
    metric: 'בייצור',
    gradient: 'linear-gradient(135deg, #1A1A1A 0%, #374151 50%, #4B5563 100%)',
  },
  {
    sector: 'DTC / Brand',
    brand: 'Conchi',
    title: 'e-commerce ומותג חוסן רגשי לילדים',
    desc: 'מערכת רגשית לילדים שמשלבת בובה פיזית עם תכנים דיגיטליים. חנות eCommerce, אפיון מוצר, ועיצוב מותג שלם.',
    tags: ['eCommerce', 'מיתוג', 'Shopify', 'תוכן'],
    metric: 'חנות פעילה עם הזמנות שוטפות',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #8B5CF6 50%, #A78BFA 100%)',
  },
  {
    sector: 'Fintech',
    brand: 'OM1000',
    title: 'leadgen + content לייעוץ משכנתאות',
    desc: 'אתר ייעוץ פיננסי: איחוד הלוואות, מסורבי בנק, משכנתאות עסקיות. מערך leadgen מלא, בלוג מקצועי, וקורסים מקוונים.',
    tags: ['לידים', 'SEO', 'תוכן', 'קורסים'],
    metric: 'פעיל עם leadgen וקורסים בתשלום',
    gradient: 'linear-gradient(135deg, #0369A1 0%, #0EA5E9 50%, #38BDF8 100%)',
  },
];

const repos: RepoEntry[] = [
  { name: 'plug-claude-new', displayName: 'Plug', desc: 'פלטפורמת AI לניהול חיפוש עבודה — מחיל אוטומציות, מעקב בקשות ו-AI לכל שלב.', tags: ['TypeScript', 'AI', 'SaaS'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/plug-claude-new', live: 'https://plug-claude-new-psi.vercel.app' },
  { name: 'squishy-kingdom', displayName: 'Squishy Kingdom', desc: 'חנות eCommerce מלאה לצעצועי סקווישי — קטלוג, עגלת קניות ותשלום.', tags: ['TypeScript', 'eCommerce', 'Next.js'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/squishy-kingdom', live: 'https://squishy-kingdom.vercel.app' },
  { name: 'tishma-gemini-code-creator-new', displayName: 'Tishma AI Legal', desc: 'כלי AI לסיוע משפטי — ניתוח מסמכים, ייעוץ ראשוני ומענה על שאלות חוקיות בעברית.', tags: ['TypeScript', 'AI', 'Legal-tech'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/tishma-gemini-code-creator-new', live: 'https://tishma-gemini-code-creator-new.vercel.app' },
  { name: 'grain-conftracker', displayName: 'Grain ConfTracker', desc: 'מערכת ניהול כנסים ואירועים — רישום משתתפים, סשנים ומעקב נוכחות.', tags: ['TypeScript', 'SaaS', 'Events'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/grain-conftracker', live: 'https://grain-conftracker.vercel.app' },
  { name: 'HELIX-proposal-templates', displayName: 'HELIX Proposals', desc: 'תבניות הצעות מחיר אינטראקטיביות — HTML יפה, מותאם מותג, שולחים ללקוח בלינק.', tags: ['HTML', 'Templates', 'B2B'], lang: 'HTML', url: 'https://github.com/r0544468883-spec/HELIX-proposal-templates', live: 'https://helix-proposal-templates.vercel.app' },
  { name: 'warp-speed-automation', displayName: 'Warp Speed', desc: 'תשתית אוטומציה מואצת — pipelines, webhooks וסדרות לידים בקוד.', tags: ['TypeScript', 'Automation', 'Backend'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/warp-speed-automation' },
  { name: 'AI-credit-counter', displayName: 'AI Credit Counter', desc: 'מעקב שימוש בקרדיטים של מודלי AI — dashboard לניהול עלויות API.', tags: ['TypeScript', 'AI', 'Dashboard'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/AI-credit-counter' },
  { name: 'tosaf.io', displayName: 'Tosaf', desc: 'אתר תדמית לחברה — עיצוב, קופי ופיתוח מלא.', tags: ['TypeScript', 'Branding', 'Web'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/tosaf.io' },
  { name: 'plug-extension', displayName: 'Plug Extension', desc: 'תוסף Chrome לאוטומציה של פניות עבודה — Easy Apply, ניתוח משרות ועוד.', tags: ['TypeScript', 'Chrome Extension', 'AI'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/plug-extension' },
  { name: 'tishma-legal-navigator', displayName: 'Tishma Navigator', desc: 'ניווט חכם בין פסקי דין ומסמכים משפטיים — חיפוש סמנטי ו-AI summary.', tags: ['TypeScript', 'Legal-tech', 'Search'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/tishma-legal-navigator' },
  { name: 'Plug-landing-page', displayName: 'Plug Landing', desc: 'דף נחיתה לפלטפורמת Plug — UX ממוקד המרות, RTL, אנימציות.', tags: ['TypeScript', 'Landing Page', 'CRO'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/Plug-landing-page' },
  { name: 'Plug-for-users', displayName: 'Plug Open', desc: 'קוד פתוח ומשאבים למשתמשי Plug — דוקומנטציה, קבצי קונפיגורציה וכלים.', tags: ['Open Source', 'Docs', 'Community'], lang: 'Markdown', url: 'https://github.com/r0544468883-spec/Plug-for-users' },
  { name: 'agents', displayName: 'AI Agents', desc: 'תשתית לבניית AI Agents — אוטומציה חכמה, pipelines מונחי-מטרה וכלים מחוברים.', tags: ['TypeScript', 'AI', 'Agents'], lang: 'TypeScript', url: 'https://github.com/r0544468883-spec/agents' },
];

export default function Cases() {
  return (
    <section className="cases-bento" id="cases">
      <div className="container">
        <SectionHeader
          eyebrow="פרויקטים"
          titleHtml="עבדנו עם."
          description="סקטורים שונים. מכנה משותף אחד: צריכים גם מוצר וגם שיווק שעובדים יחד."
        />

        {/* Main bento grid — featured cases */}
        <ScrollTextHighlight className="cases-bento-grid" dimOpacity={0.15} blurAmount={1.5}>
          {cases.map((c) => (
            <div key={c.brand} className="bento-card">
              <div className="bento-card-bg" style={{ background: c.gradient }} />
              <div className="bento-card-overlay" />
              <div className="bento-card-content">
                <span className="bento-card-sector">{c.sector}</span>
                <h3 className="bento-card-brand">{c.brand}</h3>
                <p className="bento-card-title">{c.title}</p>
                <div className="bento-card-tags">
                  {c.tags.map((t) => (
                    <span key={t} className="bento-card-tag">{t}</span>
                  ))}
                </div>
                <div className="bento-card-metric">{c.metric}</div>
              </div>
            </div>
          ))}
        </ScrollTextHighlight>

        {/* Repo grid — all GitHub projects */}
        <div className="cases-repo-grid">
          {repos.map((r) => (
            <a
              key={r.name}
              href={r.live ?? r.url}
              target="_blank"
              rel="noopener noreferrer"
              className="repo-card"
            >
              <div className="repo-card-top">
                <span className="repo-card-lang">{r.lang}</span>
                {r.live && <span className="repo-card-live">Live</span>}
              </div>
              <h4 className="repo-card-name">{r.displayName}</h4>
              <p className="repo-card-desc">{r.desc}</p>
              <div className="repo-card-tags">
                {r.tags.map((t) => (
                  <span key={t} className="repo-card-tag">{t}</span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
