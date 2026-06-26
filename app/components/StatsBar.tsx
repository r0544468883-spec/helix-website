'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 60, prefix: '', suffix: '%', label: 'חיסכון בעלויות' },
  { value: 150, prefix: '', suffix: '+', label: 'לקוחות מרוצים' },
  { value: 1250, prefix: '₪', suffix: '', label: 'מחיר התחלתי לחודש' },
  { value: 24, prefix: '', suffix: 'שעות', label: 'זמן תגובה ממוצע' },
];

function AnimatedStat({ value, prefix, suffix, label }: typeof stats[0]) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const duration = 1400;
        const start = performance.now();
        const step = (now: number) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="stat-card">
      <div className="stat-value">
        {prefix && <span className="stat-prefix">{prefix}</span>}
        <span className="stat-number">{display.toLocaleString('en-US')}</span>
        {suffix && <span className="stat-suffix">{suffix}</span>}
      </div>
      <div className="stat-divider" />
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section className="stats-bar">
      <div className="container stats-grid">
        {stats.map((s) => (
          <AnimatedStat key={s.label} {...s} />
        ))}
      </div>
    </section>
  );
}
