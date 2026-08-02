import type { ReactNode } from 'react';

type Step = { icon: string; label: string };
type Props = { accent: string; steps: Step[]; title?: ReactNode };

/** Attio-style animated workflow — connected nodes with a pulse traveling the connectors. */
export default function ProductWorkflowNodes({ accent, steps, title }: Props) {
  return (
    <section className="pwn" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pwn-title">
          {title || (
            <>
              איך זה עובד — <em>אוטומציה מקצה לקצה</em>
            </>
          )}
        </h2>
        <div className="pwn-flow" role="list">
          {steps.map((s, i) => (
            <div className="pwn-item" key={s.label} role="listitem">
              <div className="pwn-node" style={{ ['--i' as string]: `${i}` }}>
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
        </div>
      </div>
    </section>
  );
}
