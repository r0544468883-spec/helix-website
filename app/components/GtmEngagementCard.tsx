'use client';

import ScrollReveal from './ScrollReveal';
import { EmojiIcon } from '@/lib/emoji-icon';

export type EngagementOption = {
  tag: string;
  name: string;
  desc: string;
  points: string[];
  featured?: boolean;
};

export default function GtmEngagementCard({
  title = 'איך עובדים יחד',
  subtitle = 'בוחרים מסלול לפי היקף. מתחילים תמיד באבחון ארכיטקטורה ללא עלות.',
  options,
  ctaHref,
  ctaText = 'לאבחון ארכיטקטורה חינם',
}: {
  title?: string;
  subtitle?: string;
  options: EngagementOption[];
  ctaHref: string;
  ctaText?: string;
}) {
  return (
    <section className="gtm-engage-section" id="packages">
      <style>{`
        .gtm-engage-section { padding: clamp(48px, 8vw, 88px) 0; }
        .gtm-engage-head { text-align: center; margin-bottom: 34px; }
        .gtm-engage-head h2 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; margin-bottom: 12px; }
        .gtm-engage-head p { color: var(--ink-muted); max-width: 600px; margin: 0 auto; line-height: 1.6; }
        .gtm-engage-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; max-width: 860px; margin: 0 auto 24px; }
        @media (max-width: 760px) { .gtm-engage-grid { grid-template-columns: 1fr; } }
        .gtm-engage-card { position: relative; border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; padding: 30px; background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15)); transition: transform 0.3s, border-color 0.3s; }
        .gtm-engage-card:hover { transform: translateY(-4px); border-color: color-mix(in srgb, var(--brand) 45%, transparent); }
        .gtm-engage-card.featured { border-color: color-mix(in srgb, var(--brand) 55%, transparent); background: linear-gradient(160deg, color-mix(in srgb, var(--brand) 8%, transparent), rgba(0,0,0,0.15)); }
        .gtm-engage-badge { position: absolute; top: -12px; inset-inline-start: 24px; background: var(--brand); color: #04150e; font-size: 0.72rem; font-weight: 800; padding: 4px 12px; border-radius: 999px; }
        .gtm-engage-tag { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; color: var(--brand); text-transform: uppercase; margin-bottom: 6px; }
        .gtm-engage-name { font-size: 1.35rem; font-weight: 800; margin-bottom: 10px; }
        .gtm-engage-desc { color: var(--ink-muted); line-height: 1.6; margin-bottom: 16px; }
        .gtm-engage-points { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .gtm-engage-points li { display: flex; align-items: flex-start; gap: 9px; font-size: 0.95rem; line-height: 1.5; }
        .gtm-engage-points li::before { content: '✓'; color: var(--brand); font-weight: 800; }
        .gtm-engage-audit { max-width: 860px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px; border: 1px dashed color-mix(in srgb, var(--brand) 40%, transparent); border-radius: 16px; padding: 22px 26px; background: color-mix(in srgb, var(--brand) 6%, transparent); }
        .gtm-engage-audit-text { display: flex; align-items: center; gap: 12px; }
        .gtm-engage-audit-text strong { font-size: 1.05rem; font-weight: 800; }
        .gtm-engage-audit-text span { color: var(--ink-muted); font-size: 0.92rem; }
        .gtm-engage-cta { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; padding: 13px 26px; border-radius: 12px; background: var(--brand); color: #04150e; text-decoration: none; transition: transform 0.2s; white-space: nowrap; }
        .gtm-engage-cta:hover { transform: translateY(-2px); }
        @media (max-width: 560px) { .gtm-engage-audit { flex-direction: column; text-align: center; } .gtm-engage-audit-text { flex-direction: column; } }
      `}</style>
      <div className="container">
        <ScrollReveal direction="up">
          <div className="gtm-engage-head">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </ScrollReveal>
        <ScrollReveal direction="up" stagger staggerDelay={0.1}>
          <div className="gtm-engage-grid">
            {options.map((o) => (
              <div key={o.name} className={`gtm-engage-card${o.featured ? ' featured' : ''}`}>
                {o.featured && <span className="gtm-engage-badge">הכי נפוץ</span>}
                <div className="gtm-engage-tag">{o.tag}</div>
                <div className="gtm-engage-name">{o.name}</div>
                <p className="gtm-engage-desc">{o.desc}</p>
                <ul className="gtm-engage-points">
                  {o.points.map((p) => <li key={p}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </ScrollReveal>
        <ScrollReveal direction="up">
          <div className="gtm-engage-audit">
            <div className="gtm-engage-audit-text">
              <EmojiIcon e="🧭" />
              <div>
                <strong>אבחון ארכיטקטורה ראשוני, ללא עלות</strong>
                <br />
                <span>נמפה את הסטאק והמשפך, ונחזור עם תוכנית הנדסית ותמחור ברור. בלי התחייבות.</span>
              </div>
            </div>
            <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="gtm-engage-cta">
              <EmojiIcon e="💬" /> {ctaText}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
