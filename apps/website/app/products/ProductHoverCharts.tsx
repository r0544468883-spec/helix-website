'use client';

import { useState } from 'react';

type Card = {
  label: string;
  value: string;
  delta: string;
  bars: number[]; // 0..100 heights
  kind: 'bars' | 'area';
};

const CARDS: Card[] = [
  { label: 'הכנסות החודש', value: '₪248K', delta: '+18%', kind: 'bars', bars: [42, 55, 48, 63, 71, 66, 84, 92] },
  { label: 'שיעור המרה', value: '4.7%', delta: '+0.9pt', kind: 'area', bars: [30, 38, 34, 46, 52, 60, 58, 72] },
  { label: 'לקוחות פעילים', value: '3,120', delta: '+240', kind: 'bars', bars: [50, 46, 58, 54, 66, 70, 78, 88] },
];

/** Linear-style hover-reactive mini charts, bars grow / area draws + value reveals on hover. */
export default function ProductHoverCharts({ accent }: { accent: string }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="phc" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="phc-title">
          העבירו עכבר, <em>הדשבורד מגיב בזמן אמת</em>
        </h2>
        <div className="phc-grid">
          {CARDS.map((c, i) => {
            const on = active === i;
            return (
              <div
                key={c.label}
                className={`phc-card${on ? ' is-on' : ''}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive((a) => (a === i ? null : a))}
              >
                <div className="phc-head">
                  <span className="phc-label">{c.label}</span>
                  <span className="phc-delta">{c.delta}</span>
                </div>
                <span className="phc-value">{c.value}</span>
                <div className="phc-chart" aria-hidden="true">
                  {c.kind === 'bars' ? (
                    <div className="phc-bars">
                      {c.bars.map((h, bi) => (
                        <span
                          key={bi}
                          className="phc-bar"
                          style={{ ['--h' as string]: `${h}%`, ['--d' as string]: `${bi * 45}ms` }}
                        />
                      ))}
                    </div>
                  ) : (
                    <svg className="phc-area" viewBox="0 0 100 44" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id={`phcg-${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={accent} stopOpacity="0.32" />
                          <stop offset="100%" stopColor={accent} stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {(() => {
                        const pts = c.bars.map((h, bi) => `${(bi / (c.bars.length - 1)) * 100},${44 - (h / 100) * 40}`);
                        const line = `M ${pts.join(' L ')}`;
                        const fill = `${line} L 100,44 L 0,44 Z`;
                        return (
                          <>
                            <path className="phc-area-fill" d={fill} fill={`url(#phcg-${i})`} />
                            <path className="phc-area-line" d={line} fill="none" stroke={accent} strokeWidth="1.6" />
                          </>
                        );
                      })()}
                    </svg>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
