'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 60, prefix: '', suffix: '%', label: 'חיסכון בעלויות' },
  { value: 0, prefix: '₪', suffix: '', label: 'דמי הקמה' },
  { value: 150, prefix: '', suffix: '+', label: 'לקוחות מרוצים' },
  { value: 1250, prefix: '₪', suffix: '', label: 'מחיר התחלתי לחודש' },
];

function AnimatedStat({ value, prefix, suffix, label }: typeof stats[0]) {
  const [display, setDisplay] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // For value 0, just show immediately
    if (value === 0) {
      setDisplay(0);
      return;
    }

    const animate = () => {
      if (animated.current) return;
      animated.current = true;
      const duration = 1400;
      const start = performance.now();
      const step = (now: number) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplay(Math.round(eased * value));
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animate();
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);

    // Fallback: if not triggered after 3s, animate anyway
    const fallback = setTimeout(() => {
      if (!animated.current) animate();
    }, 3000);

    return () => {
      obs.disconnect();
      clearTimeout(fallback);
    };
  }, [value]);

  return (
    <div ref={ref} className="stat-card">
      <div className="stat-value">
        {prefix && <span className="stat-prefix">{prefix}</span>}
        <span className="stat-number">
          {display !== null ? display.toLocaleString('en-US') : value.toLocaleString('en-US')}
        </span>
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
