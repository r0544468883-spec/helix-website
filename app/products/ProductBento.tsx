'use client';

import type { ReactNode, MouseEvent } from 'react';

type Feature = { title: string; text: string };
type Props = { accent: string; features: Feature[]; title?: ReactNode };

/** Ramp-style bento grid (varying card sizes) with a Linear "FIG 0.X" label
 *  and a cursor-follow tilt on each card. */
export default function ProductBento({ accent, features, title }: Props) {
  const items = features.slice(0, 5);

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--rx', `${(-py * 6).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(px * 6).toFixed(2)}deg`);
  };
  const onLeave = (e: MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--rx', '0deg');
    e.currentTarget.style.setProperty('--ry', '0deg');
  };

  return (
    <section className="pbn" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pbn-title">
          {title || (
            <>
              כל מה שזה <em>עושה בשבילכם</em>
            </>
          )}
        </h2>
        <div className="pbn-grid">
          {items.map((f, i) => (
            <div
              className={`pbn-card pbn-c${i}`}
              key={f.title}
              onMouseMove={onMove}
              onMouseLeave={onLeave}
            >
              <div className="pbn-card-body">
                <h3 className="pbn-card-title">{f.title}</h3>
                <p className="pbn-card-text">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
