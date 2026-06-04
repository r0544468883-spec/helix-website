'use client';

import { useEffect, useState } from 'react';

export default function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 600);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!visible) return null;

  return (
    <a href="#paths" className="floating-cta" aria-label="לחבילות">
      <span className="floating-cta-text">לחבילות</span>
      <span className="floating-cta-arrow">&#8595;</span>
    </a>
  );
}
