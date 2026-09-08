'use client';

import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import { EmojiIcon } from '@/lib/emoji-icon';

/**
 * בלוק "שירות משלים" — קישור פנימי מדף GTM (התשתית הטכנית) אל שירות הליווי/האסטרטגיה
 * המקביל, ובחזרה. מחזק את מסע המשתמש ואת ה-internal linking ל-SEO.
 */
export default function GtmRelatedService({
  eyebrow = 'שירות משלים',
  icon,
  title,
  desc,
  href,
  linkLabel,
}: {
  eyebrow?: string;
  icon: string;
  title: string;
  desc: string;
  href: string;
  linkLabel: string;
}) {
  return (
    <section className="gtm-related-section">
      <style>{`
        .gtm-related-section { padding: clamp(32px, 6vw, 56px) 0; }
        .gtm-related-card { max-width: 860px; margin: 0 auto; display: flex; flex-wrap: wrap; align-items: center; gap: 18px; border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; padding: 26px 30px; background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.12)); }
        .gtm-related-icon { font-size: 1.6rem; width: 54px; height: 54px; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; border-radius: 14px; background: color-mix(in srgb, var(--brand) 14%, transparent); }
        .gtm-related-body { flex: 1 1 320px; }
        .gtm-related-eyebrow { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; color: var(--brand); text-transform: uppercase; margin-bottom: 4px; }
        .gtm-related-body h3 { font-size: 1.2rem; font-weight: 800; margin-bottom: 6px; }
        .gtm-related-body p { color: var(--ink-muted); line-height: 1.55; font-size: 0.96rem; }
        .gtm-related-link { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--brand); text-decoration: none; white-space: nowrap; border: 1px solid color-mix(in srgb, var(--brand) 40%, transparent); border-radius: 12px; padding: 11px 20px; transition: background 0.2s; }
        .gtm-related-link:hover { background: color-mix(in srgb, var(--brand) 12%, transparent); }
      `}</style>
      <div className="container">
        <ScrollReveal direction="up">
          <div className="gtm-related-card">
            <span className="gtm-related-icon"><EmojiIcon e={icon} /></span>
            <div className="gtm-related-body">
              <div className="gtm-related-eyebrow">{eyebrow}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
            <Link href={href} className="gtm-related-link">{linkLabel} ←</Link>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
