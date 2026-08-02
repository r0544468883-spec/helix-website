'use client';

import { useEffect, useState, type ReactNode } from 'react';

type Step = { action: string; detail: string };
type Props = { accent: string; steps: Step[]; title?: ReactNode; agentName?: string };

/** Framer/Linear-style live agent demo — a rolling log where each step
 *  "thinks" then completes with a checkmark, then loops. */
export default function ProductAgentDemo({ accent, steps, title, agentName = 'HELIX Agent' }: Props) {
  const [active, setActive] = useState(0); // index currently "thinking"; indices < active are done

  useEffect(() => {
    if (active < steps.length) {
      const t = setTimeout(() => setActive((a) => a + 1), 1050);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setActive(0), 2000);
    return () => clearTimeout(t);
  }, [active, steps.length]);

  return (
    <section className="pad2" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pad2-title">
          {title || (
            <>
              ה-agent עובד <em>מול העיניים שלכם</em>
            </>
          )}
        </h2>
        <div className="pad2-card">
          <div className="pad2-head">
            <span className="pad2-dot" /><span className="pad2-dot" /><span className="pad2-dot" />
            <span className="pad2-agent">{agentName}</span>
            <span className={`pad2-status${active >= steps.length ? ' is-done' : ''}`}>
              {active >= steps.length ? '✓ הושלם' : '● פועל'}
            </span>
          </div>
          <ol className="pad2-log">
            {steps.map((s, i) => {
              const state = i < active ? 'done' : i === active ? 'run' : 'wait';
              return (
                <li className={`pad2-row pad2-${state}`} key={s.action}>
                  <span className="pad2-mark" aria-hidden="true">
                    {state === 'done' ? '✓' : state === 'run' ? (
                      <span className="pad2-think"><i /><i /><i /></span>
                    ) : '○'}
                  </span>
                  <span className="pad2-body">
                    <span className="pad2-action">{s.action}</span>
                    {state === 'done' && <span className="pad2-detail">{s.detail}</span>}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
