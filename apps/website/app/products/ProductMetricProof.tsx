import type { ReactNode } from 'react';
import ScrollReveal from '../components/ScrollReveal';

type Item = { stat: string; unit: string; quote: string; name: string; role: string };
type Props = { accent: string; items: Item[]; title?: ReactNode };

/** Retool-style metric-proof wall, hard-number outcome + short quote + attribution. */
export default function ProductMetricProof({ accent, items, title }: Props) {
  return (
    <section className="pmp" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pmp-title">
          {title || (
            <>
              תוצאות אמיתיות. <em>מספרים, לא הבטחות.</em>
            </>
          )}
        </h2>
        <ScrollReveal stagger staggerDelay={0.1} className="pmp-grid">
          {items.map((it) => (
            <figure className="pmp-card" key={it.name + it.stat}>
              <div className="pmp-metric">
                <span className="pmp-stat">{it.stat}</span>
                <span className="pmp-unit">{it.unit}</span>
              </div>
              <blockquote className="pmp-quote">”{it.quote}“</blockquote>
              <figcaption className="pmp-attr">
                <span className="pmp-name">{it.name}</span>
                <span className="pmp-role">{it.role}</span>
              </figcaption>
            </figure>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
