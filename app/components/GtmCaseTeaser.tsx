'use client';

import Link from 'next/link';
import { useState } from 'react';
import ScrollReveal from './ScrollReveal';
import { EmojiIcon } from '@/lib/emoji-icon';
import type { CaseStudy } from '@/app/services/gtm-engineering/case-studies-data';

export default function GtmCaseTeaser({ cs }: { cs: CaseStudy }) {
  const [imgOk, setImgOk] = useState(true);
  const href = `/services/gtm-engineering/case-study/${cs.slug}`;

  return (
    <section className="cst-section">
      <style>{`
        .cst-section { padding: clamp(40px, 7vw, 80px) 0; }
        .cst-card { max-width: 1000px; margin: 0 auto; display: grid; grid-template-columns: 0.85fr 1.15fr; gap: 0; border: 1px solid rgba(255,255,255,0.1); border-radius: 22px; overflow: hidden; background: linear-gradient(160deg, rgba(255,255,255,0.02), rgba(0,0,0,0.15)); }
        @media (max-width: 800px) { .cst-card { grid-template-columns: 1fr; } }
        .cst-visual { position: relative; min-height: 220px; background: radial-gradient(130% 130% at 30% 20%, color-mix(in srgb, var(--brand) 26%, transparent), #0a0e0d); }
        .cst-visual img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .cst-visual-fallback { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2.6rem; opacity: 0.5; }
        .cst-body { padding: clamp(24px, 3.5vw, 40px); }
        .cst-eyebrow { display: inline-block; font-size: 0.75rem; font-weight: 800; letter-spacing: 0.07em; color: var(--brand); text-transform: uppercase; margin-bottom: 10px; }
        .cst-body h2 { font-size: clamp(1.3rem, 3vw, 1.75rem); font-weight: 800; line-height: 1.2; margin-bottom: 10px; }
        .cst-company { color: var(--ink-muted); font-size: 0.9rem; margin-bottom: 18px; }
        .cst-metrics { display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 22px; }
        .cst-metric-v { font-size: 1.5rem; font-weight: 900; color: var(--brand); line-height: 1; }
        .cst-metric-l { color: var(--ink-muted); font-size: 0.78rem; margin-top: 4px; max-width: 130px; }
        .cst-link { display: inline-flex; align-items: center; gap: 6px; font-weight: 700; color: var(--brand); text-decoration: none; border: 1px solid color-mix(in srgb, var(--brand) 40%, transparent); border-radius: 12px; padding: 11px 22px; transition: background 0.2s; }
        .cst-link:hover { background: color-mix(in srgb, var(--brand) 12%, transparent); }
      `}</style>
      <div className="container">
        <ScrollReveal direction="up">
          <Link href={href} className="cst-card" style={{ textDecoration: 'none', color: 'inherit', display: 'grid' }}>
            <div className="cst-visual">
              {imgOk && <img src={cs.heroImage} alt="" onError={() => setImgOk(false)} />}
              {!imgOk && <div className="cst-visual-fallback"><EmojiIcon e="🧩" /></div>}
            </div>
            <div className="cst-body">
              <span className="cst-eyebrow">Case Study</span>
              <h2>{cs.title}</h2>
              <div className="cst-company">{cs.company}</div>
              <div className="cst-metrics">
                {cs.metrics.slice(0, 3).map((m) => (
                  <div key={m.l}>
                    <div className="cst-metric-v">{m.v}</div>
                    <div className="cst-metric-l">{m.l}</div>
                  </div>
                ))}
              </div>
              <span className="cst-link">לקריאת ה-Case Study המלא ←</span>
            </div>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}
