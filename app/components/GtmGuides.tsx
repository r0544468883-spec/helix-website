'use client';

import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import { EmojiIcon } from '@/lib/emoji-icon';

export type Guide = { title: string; href: string; readTime: string };

export default function GtmGuides({
  title = 'מדריכי GTM Engineering',
  subtitle = 'מדריכי עומק על הצד ההנדסי של ההכנסות, מבוססי שיטה ומקורות.',
  guides,
}: {
  title?: string;
  subtitle?: string;
  guides: Guide[];
}) {
  return (
    <section className="gtg-section">
      <style>{`
        .gtg-section { padding: clamp(44px, 7vw, 80px) 0; }
        .gtg-head { text-align: center; margin-bottom: 28px; }
        .gtg-eyebrow { display: inline-block; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.07em; color: var(--brand); text-transform: uppercase; margin-bottom: 10px; }
        .gtg-head h2 { font-size: clamp(1.5rem, 3.6vw, 2.1rem); font-weight: 800; margin-bottom: 8px; }
        .gtg-head p { color: var(--ink-muted); max-width: 560px; margin: 0 auto; line-height: 1.55; }
        .gtg-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; max-width: 900px; margin: 0 auto; }
        @media (max-width: 720px) { .gtg-grid { grid-template-columns: 1fr; } }
        .gtg-card { display: flex; align-items: center; gap: 14px; border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; padding: 18px 20px; background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.14)); text-decoration: none; color: inherit; transition: transform 0.2s, border-color 0.2s; }
        .gtg-card:hover { transform: translateY(-3px); border-color: color-mix(in srgb, var(--brand) 45%, transparent); }
        .gtg-card-icon { font-size: 1.2rem; width: 40px; height: 40px; flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; border-radius: 11px; background: color-mix(in srgb, var(--brand) 14%, transparent); }
        .gtg-card-body { flex: 1; }
        .gtg-card-title { font-weight: 700; line-height: 1.35; margin-bottom: 3px; }
        .gtg-card-meta { color: var(--ink-muted); font-size: 0.82rem; }
        .gtg-card-arrow { color: var(--brand); font-weight: 800; }
        .gtg-all { text-align: center; margin-top: 22px; }
        .gtg-all a { color: var(--brand); font-weight: 700; text-decoration: none; }
      `}</style>
      <div className="container">
        <ScrollReveal direction="up">
          <div className="gtg-head">
            <span className="gtg-eyebrow">מרכז הלמידה</span>
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
        </ScrollReveal>
        <ScrollReveal direction="up" stagger staggerDelay={0.06}>
          <div className="gtg-grid">
            {guides.map((g) => (
              <Link key={g.href} href={g.href} className="gtg-card">
                <span className="gtg-card-icon"><EmojiIcon e="📘" /></span>
                <span className="gtg-card-body">
                  <span className="gtg-card-title">{g.title}</span>
                  <span className="gtg-card-meta">{g.readTime}</span>
                </span>
                <span className="gtg-card-arrow">←</span>
              </Link>
            ))}
          </div>
        </ScrollReveal>
        <div className="gtg-all">
          <Link href="/learn">לכל מרכז הלמידה ←</Link>
        </div>
      </div>
    </section>
  );
}
