'use client';

import { useEffect, useRef, useState } from 'react';

// CTA דביק במובייל. מסתיר את עצמו כשהטופס (#register) גלוי במסך,
// כדי לא להציג כפתור כפול שצף מעל כפתור השליחה של הטופס.
export default function StickyCta() {
  const [hidden, setHidden] = useState(false);
  const ref = useRef<HTMLAnchorElement | null>(null);

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
      ref={ref}
      href="#register"
      className={`matana-sticky-cta${hidden ? ' is-hidden' : ''}`}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      שריינו את המתנה 🎁
    </a>
  );
}
