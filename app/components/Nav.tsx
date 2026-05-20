'use client';

import { useEffect, useRef } from 'react';
import { NAV_LINKS } from '@/lib/site';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 20);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav ref={navRef} className="nav" id="nav" aria-label="ראשי">
      <div className="container">
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            HELIX<span className="dot">.</span>
          </a>
          <div className="nav-links">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="nav-link">
                {link.label}
              </a>
            ))}
          </div>
          <a href="#cta" className="nav-cta">
            קבע שיחה
          </a>
        </div>
      </div>
    </nav>
  );
}
