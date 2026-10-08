'use client';

import { useEffect, useState } from 'react';

// CTA דביק במובייל. מסתיר את עצמו כשהטופס (#register) גלוי במסך.
export default function GeoStickyCta() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = document.getElementById('register');
    if (!target || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { rootMargin: '0px 0px -20% 0px' },
    );
    io.observe(target);
    return () => io.disconnect();
  }, []);

  return (
    <a
      href="#register"
      className={`matana-sticky-cta${hidden ? ' is-hidden' : ''}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      קבעו שיחת GEO
    </a>
  );
}
