'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 500, prefix: '₪', suffix: '', label: 'STARTING MONTHLY' },
  { value: 0, prefix: '₪', suffix: '', label: 'SETUP FEES' },
  { value: 100, prefix: '', suffix: '%', label: 'TRANSPARENCY' },
  { value: 24, prefix: '', suffix: '/7', label: 'AI OPTIMIZATION' },
];

function AnimatedNumber({ value, prefix, suffix }: { value: number; prefix: string; suffix: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        const duration = 1200;
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
    <div ref={ref} className="stat-item">
      <div className="stat-value">
        {prefix}<span className="stat-number">{display}</span>{suffix}
      </div>
      <div className="stat-label">{stats.find(s => s.value === value)?.label}</div>
    </div>
  );
}

export default function StatsBar() {
  return (
    <section className="stats-bar">
      <div className="container stats-grid">
        {stats.map((s) => (
          <AnimatedNumber key={s.label} value={s.value} prefix={s.prefix} suffix={s.suffix} />
        ))}
      </div>
    </section>
  );
}
