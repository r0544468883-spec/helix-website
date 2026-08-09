'use client';

import { useState, type ReactNode } from 'react';

type Vertical = { tab: string; headline: string; points: string[] };
type Props = { accent: string; verticals: Vertical[]; title?: ReactNode };

/** Retool-style vertical/use-case switcher — click a tab, the panel swaps. */
export default function ProductVerticalTabs({ accent, verticals, title }: Props) {
  const [active, setActive] = useState(0);
  const v = verticals[active];

  return (
    <section className="pvt" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pvt-title">
          {title || (
            <>
              מותאם <em>לתחום שלכם</em>
            </>
          )}
        </h2>
        <div className="pvt-tabs" role="tablist">
          {verticals.map((vt, i) => (
            <button
              key={vt.tab}
              role="tab"
              aria-selected={i === active}
              className={`pvt-tab${i === active ? ' is-on' : ''}`}
              onClick={() => setActive(i)}
            >
              {vt.tab}
            </button>
          ))}
        </div>
        <div className="pvt-panel" key={active} role="tabpanel">
          <h3 className="pvt-headline">{v.headline}</h3>
          <ul className="pvt-points">
            {v.points.map((p) => (
              <li key={p} className="pvt-point">
                <span className="pvt-check" aria-hidden="true">✓</span>
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
