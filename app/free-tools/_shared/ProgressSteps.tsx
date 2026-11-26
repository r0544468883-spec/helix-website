'use client';

import { useEffect, useState } from 'react';

/**
 * Staged progress for the long AI runs (1-3 minutes): the message advances
 * through real pipeline stages on a timer, and the bar eases toward ~90% and
 * holds — it signals "alive and working", it never claims done. Replaces the
 * bare spinner that made people think the tool was stuck.
 */
export default function ProgressSteps({ steps, stepMs = 9000 }: { steps: string[]; stepMs?: number }) {
  const [i, setI] = useState(0);
  const [pct, setPct] = useState(4);

  useEffect(() => {
    const step = setInterval(() => setI((x) => Math.min(x + 1, steps.length - 1)), stepMs);
    const bar = setInterval(() => setPct((p) => Math.min(p + Math.max(0.35, (90 - p) * 0.025), 90)), 300);
    return () => { clearInterval(step); clearInterval(bar); };
  }, [steps.length, stepMs]);

  return (
    <div className="geo-scanning" aria-live="polite" style={{ width: '100%' }}>
      <div className="geo-spinner" />
      <p style={{ minHeight: '1.6em' }}>{steps[Math.min(i, steps.length - 1)]}</p>
      <div style={{ height: 6, borderRadius: 999, background: 'rgba(127,127,127,.18)', overflow: 'hidden', maxWidth: 340, margin: '14px auto 0' }}>
        <span style={{ display: 'block', height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg,#10B981,#A78BFA)', borderRadius: 999, transition: 'width .3s ease' }} />
      </div>
      <p style={{ fontSize: 12.5, opacity: 0.65, marginTop: 8 }}>בדרך כלל בין דקה לשתיים. שווה לחכות.</p>
    </div>
  );
}
