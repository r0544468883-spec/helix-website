'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

type Step = { kicker: string; title: string; text: string; icon: string };
type Props = { accent: string; steps: Step[]; title?: ReactNode };

/** Framer-style pinned scrollytelling: a sticky visual panel that swaps as
 *  you scroll through the step markers. */
export default function ProductScrollytelling({ accent, steps, title }: Props) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  // rAF-polled (Lenis on this site uses transform-based scroll and does not
  // emit native 'scroll' events — same pattern as ProductHeroUnfold).
  // Map the viewport center's progress through the track onto a step index.
  useEffect(() => {
    let raf = 0;
    const tick = () => {
      const track = trackRef.current;
      if (track) {
        const r = track.getBoundingClientRect();
        const p = (window.innerHeight / 2 - r.top) / r.height; // 0 at top, 1 at bottom
        const idx = Math.max(0, Math.min(steps.length - 1, Math.floor(p * steps.length)));
        setActive((prev) => (prev === idx ? prev : idx));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [steps.length]);

  const s = steps[active];

  return (
    <section className="pst" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pst-title">
          {title || (
            <>
              איך זה עובד — <em>צעד אחר צעד</em>
            </>
          )}
        </h2>
        <div className="pst-layout">
          {/* sticky visual */}
          <div className="pst-sticky">
            <div className="pst-panel" key={active}>
              <span className="pst-panel-icon" aria-hidden="true">{s.icon}</span>
              <span className="pst-panel-kicker">{s.kicker}</span>
              <h3 className="pst-panel-title">{s.title}</h3>
              <p className="pst-panel-text">{s.text}</p>
              <div className="pst-dots" aria-hidden="true">
                {steps.map((_, i) => (
                  <span key={i} className={`pst-dot${i === active ? ' is-on' : ''}`} />
                ))}
              </div>
            </div>
          </div>
          {/* scroll markers */}
          <div className="pst-track" ref={trackRef}>
            {steps.map((st, i) => (
              <div className={`pst-marker${i === active ? ' is-on' : ''}`} key={st.title}>
                <span className="pst-marker-num">{i + 1}</span>
                <div>
                  <h4 className="pst-marker-title">{st.title}</h4>
                  <p className="pst-marker-text">{st.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
