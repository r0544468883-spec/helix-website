'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScrollReveal from './ScrollReveal';
import { EmojiIcon } from '@/lib/emoji-icon';
import { SITE } from '@/lib/site';
import type { CaseStudy } from '@/app/services/gtm-engineering/case-studies-data';

const wa = (t: string) => `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(t)}`;

export default function GtmCaseStudyPage({ cs }: { cs: CaseStudy }) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="cs-page">
      <style>{`
        .cs-page { --accent: var(--brand); }
        .cs-hero { padding: clamp(48px, 9vw, 96px) 0 clamp(24px, 4vw, 40px); }
        .cs-breadcrumb { font-size: 0.85rem; color: var(--ink-muted); margin-bottom: 18px; }
        .cs-breadcrumb a { color: var(--ink-secondary); text-decoration: none; }
        .cs-breadcrumb a:hover { color: var(--brand); }
        .cs-hero-grid { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 40px; align-items: center; }
        @media (max-width: 900px) { .cs-hero-grid { grid-template-columns: 1fr; gap: 24px; } }
        .cs-eyebrow { display: inline-block; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; color: var(--brand); text-transform: uppercase; margin-bottom: 12px; }
        .cs-hero h1 { font-size: clamp(1.9rem, 4.6vw, 3rem); font-weight: 800; line-height: 1.12; margin-bottom: 14px; }
        .cs-company { display: inline-flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 600; color: var(--ink-secondary); border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; padding: 6px 16px; margin-bottom: 18px; }
        .cs-summary { color: var(--ink-muted); line-height: 1.7; font-size: 1.05rem; }
        .cs-hero-visual { position: relative; aspect-ratio: 16/10; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); background: radial-gradient(130% 130% at 30% 20%, color-mix(in srgb, var(--brand) 24%, transparent), #0a0e0d); }
        .cs-hero-visual img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .cs-hero-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 3rem; opacity: 0.5; }

        .cs-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 1040px; margin: 0 auto; }
        @media (max-width: 760px) { .cs-metrics { grid-template-columns: repeat(2, 1fr); } }
        .cs-metric { text-align: center; border: 1px solid rgba(255,255,255,0.09); border-radius: 16px; padding: 26px 16px; background: rgba(16,185,129,0.04); }
        .cs-metric-v { font-size: clamp(1.6rem, 4.4vw, 2.3rem); font-weight: 900; color: var(--brand); margin-bottom: 6px; }
        .cs-metric-l { color: var(--ink-muted); font-size: 0.9rem; line-height: 1.4; }

        .cs-section { padding: clamp(36px, 6vw, 64px) 0; }
        .cs-grid { display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 24px; max-width: 1040px; margin: 0 auto; align-items: start; }
        @media (max-width: 860px) { .cs-grid { grid-template-columns: 1fr; } }
        .cs-card { border: 1px solid rgba(255,255,255,0.09); border-radius: 18px; padding: 28px; background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.14)); }
        .cs-card h2 { font-size: 1.25rem; font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 9px; }
        .cs-challenge ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 11px; }
        .cs-challenge li { display: flex; align-items: flex-start; gap: 9px; color: var(--ink-secondary); line-height: 1.5; }
        .cs-challenge li::before { content: '✕'; color: #e5606d; font-weight: 800; }
        .cs-steps { display: flex; flex-direction: column; gap: 15px; }
        .cs-step { display: flex; gap: 14px; }
        .cs-step-n { flex: 0 0 auto; font-size: 0.9rem; font-weight: 900; color: var(--brand); width: 30px; }
        .cs-step-t { font-weight: 800; margin-bottom: 2px; }
        .cs-step-d { color: var(--ink-muted); font-size: 0.94rem; line-height: 1.55; }

        .cs-hub { max-width: 1040px; margin: 0 auto; border: 1px solid color-mix(in srgb, var(--brand) 40%, transparent); border-radius: 18px; padding: 30px; background: color-mix(in srgb, var(--brand) 7%, transparent); }
        .cs-hub h2 { font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 800; margin-bottom: 8px; display: flex; align-items: center; gap: 10px; }
        .cs-hub > p { color: var(--ink-muted); line-height: 1.65; margin-bottom: 18px; max-width: 760px; }
        .cs-hub-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (max-width: 760px) { .cs-hub-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 460px) { .cs-hub-grid { grid-template-columns: 1fr; } }
        .cs-hub-item { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; padding: 10px 12px; border-radius: 10px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.06); }
        .cs-hub-item::before { content: '✓'; color: var(--brand); font-weight: 800; }

        .cs-quote { max-width: 820px; margin: 0 auto; text-align: center; padding: clamp(32px, 6vw, 56px) 0; }
        .cs-quote-mark { font-size: 3rem; color: var(--brand); line-height: 1; }
        .cs-quote p { font-size: clamp(1.2rem, 3vw, 1.6rem); font-weight: 700; line-height: 1.5; margin: 8px 0 16px; }
        .cs-quote-role { color: var(--ink-muted); font-size: 0.95rem; }

        .cs-cta { text-align: center; padding: clamp(40px, 8vw, 80px) 0; }
        .cs-cta h2 { font-size: clamp(1.5rem, 3.6vw, 2.2rem); font-weight: 800; margin-bottom: 14px; }
        .cs-cta p { color: var(--ink-muted); max-width: 540px; margin: 0 auto 24px; line-height: 1.6; }
        .cs-cta-row { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
        .cs-btn { display: inline-flex; align-items: center; gap: 8px; font-weight: 700; padding: 13px 26px; border-radius: 12px; text-decoration: none; transition: transform 0.2s; }
        .cs-btn-primary { background: var(--brand); color: #04150e; }
        .cs-btn-primary:hover { transform: translateY(-2px); }
        .cs-btn-ghost { border: 1px solid rgba(255,255,255,0.18); color: var(--ink); }
        .cs-btn-ghost:hover { border-color: var(--brand); }
      `}</style>

      {/* HERO */}
      <section className="cs-hero">
        <div className="container">
          <div className="cs-breadcrumb">
            <Link href="/services/gtm-engineering">GTM Engineering</Link> {' / '} Case Study
          </div>
          <div className="cs-hero-grid">
            <ScrollReveal direction="up">
              <div>
                <span className="cs-eyebrow">{cs.eyebrow}</span>
                <h1>{cs.title}</h1>
                <div className="cs-company"><EmojiIcon e="🏢" /> {cs.company}</div>
                <p className="cs-summary">{cs.summary}</p>
              </div>
            </ScrollReveal>
            <ScrollReveal direction="up" delay={0.1}>
              <div className="cs-hero-visual">
                {imgOk && (
                  <img src={cs.heroImage} alt="" onError={() => setImgOk(false)} />
                )}
                {!imgOk && <div className="cs-hero-fallback"><EmojiIcon e="🧩" /></div>}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* METRICS */}
      <section className="cs-section">
        <div className="container">
          <ScrollReveal direction="up" stagger staggerDelay={0.08}>
            <div className="cs-metrics">
              {cs.metrics.map((m) => (
                <div key={m.l} className="cs-metric">
                  <div className="cs-metric-v">{m.v}</div>
                  <div className="cs-metric-l">{m.l}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CHALLENGE + PROCESS */}
      <section className="cs-section">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="cs-grid">
              <div className="cs-card cs-challenge">
                <h2><EmojiIcon e="⚠️" /> האתגר</h2>
                <ul>{cs.challenge.map((c) => <li key={c}>{c}</li>)}</ul>
              </div>
              <div className="cs-card">
                <h2><EmojiIcon e="🛠️" /> התהליך שהנדסנו</h2>
                <div className="cs-steps">
                  {cs.process.map((s) => (
                    <div key={s.n} className="cs-step">
                      <span className="cs-step-n">{s.n}</span>
                      <div>
                        <div className="cs-step-t">{s.t}</div>
                        <div className="cs-step-d">{s.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CONSOLIDATION */}
      <section className="cs-section">
        <div className="container">
          <ScrollReveal direction="up">
            <div className="cs-hub">
              <h2><EmojiIcon e="🧡" /> {cs.consolidation.title}</h2>
              <p>{cs.consolidation.text}</p>
              <div className="cs-hub-grid">
                {cs.consolidation.items.map((h) => <span key={h} className="cs-hub-item">{h}</span>)}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* QUOTE */}
      <section>
        <div className="container">
          <ScrollReveal direction="up">
            <div className="cs-quote">
              <div className="cs-quote-mark">&ldquo;</div>
              <p>{cs.quote.text}</p>
              <div className="cs-quote-role">{cs.quote.role}</div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="cs-cta">
        <div className="container">
          <ScrollReveal direction="up">
            <h2>רוצים תוצאה כזו אצלכם?</h2>
            <p>נתחיל באבחון ארכיטקטורה חינם. נמפה איפה מפסידים הכנסה, ונחזור עם תוכנית הנדסית. בלי התחייבות.</p>
            <div className="cs-cta-row">
              <a href={wa('שלום, קראתי את ה-Case Study ורציתי לשמוע על GTM Engineering')} target="_blank" rel="noopener noreferrer" className="cs-btn cs-btn-primary"><EmojiIcon e="💬" /> לאבחון חינם</a>
              <Link href={cs.relatedHref} className="cs-btn cs-btn-ghost">{cs.relatedLabel} ←</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
