import type { ReactNode } from 'react';
import ScrollReveal from '../components/ScrollReveal';

type Step = { icon: string; label: string };
type Props = { accent: string; steps: Step[]; title?: ReactNode };

/** Attio-style animated workflow, connected nodes with a pulse traveling the connectors.
 *  Nodes reveal on scroll (staggered) via the site-wide ScrollReveal, matching every
 *  other section, they do NOT pop open on page load. */
export default function ProductWorkflowNodes({ accent, steps, title }: Props) {
  return (
    <section className="pwn" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pwn-title">
          {title || (
            <>
              איך זה עובד, <em>אוטומציה מקצה לקצה</em>
            </>
          )}
        </h2>
        <ScrollReveal stagger staggerDelay={0.1} className="pwn-flow">
          {steps.map((s, i) => (
            <div className="pwn-item" key={s.label}>
              <div className="pwn-node">
                <span className="pwn-node-icon" aria-hidden="true">{s.icon}</span>
                <span className="pwn-node-label">{s.label}</span>
              </div>
              {i < steps.length - 1 && (
                <div className="pwn-conn" aria-hidden="true">
                  <span className="pwn-pulse" style={{ ['--i' as string]: `${i}` }} />
                </div>
              )}
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
