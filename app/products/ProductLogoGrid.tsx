import type { ReactNode } from 'react';

type Props = { accent: string; logos: string[]; title?: ReactNode };

/** Ramp-style integrations grid — logo cards with faded edges + hover highlight. */
export default function ProductLogoGrid({ accent, logos, title }: Props) {
  return (
    <section className="plg" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="plg-title">
          {title || (
            <>
              מתחבר <em>לכלים שאתם כבר עובדים איתם</em>
            </>
          )}
        </h2>
        <div className="plg-wrap">
          <div className="plg-grid">
            {logos.concat(logos).map((name, i) => (
              <div className="plg-cell" key={name + i} aria-hidden={i >= logos.length}>
                {/* plain <img>: tiny static brand marks, no need for next/image optimization */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/logos/${name}.png`} alt={name} loading="lazy" className="plg-logo" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
