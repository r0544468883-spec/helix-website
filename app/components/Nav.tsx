'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { NAV_LINKS } from '@/lib/site';

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const onHomepage = pathname === '/';

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
          <Link href="/" className="nav-logo">
            HELIX<span className="dot">.</span>
          </Link>
          <div className="nav-links">
            {NAV_LINKS.map((link) => {
              // Hash links on the homepage stay as fragment-only (smooth scroll).
              // Hash links on other pages need the full /#anchor path.
              const isHash = link.href.startsWith('/#');
              const href = isHash && onHomepage ? link.href.slice(1) : link.href;
              const isActive = link.activeOn ? pathname === link.activeOn : false;
              const className = isActive ? 'nav-link active' : 'nav-link';

              return isHash ? (
                <a key={link.href} href={href} className={className}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={href} className={className}>
                  {link.label}
                </Link>
              );
            })}
          </div>
          <a href={onHomepage ? '#cta' : '/#cta'} className="nav-cta">
            קבע שיחה
          </a>
        </div>
      </div>
    </nav>
  );
}
