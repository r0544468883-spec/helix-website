'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { NAV_LINKS, SITE } from '@/lib/site';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const onHomepage = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <nav ref={navRef} className="nav" id="nav" aria-label="ראשי">
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="nav-logo">
            HELIX<span className="dot">.</span>
          </Link>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {NAV_LINKS.map((link) => {
              const isHash = link.href.startsWith('/#');
              const href = isHash && onHomepage ? link.href.slice(1) : link.href;
              const isActive = link.activeOn ? pathname === link.activeOn : false;
              const className = isActive ? 'nav-link active' : 'nav-link';

              return isHash ? (
                <a key={link.href} href={href} className={className} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={href} className={className} onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              );
            })}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-cta mobile-only"
              onClick={() => setMenuOpen(false)}
            >
              דברו איתנו בוואטסאפ
            </a>
          </div>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-cta desktop-only"
          >
            דברו איתנו
          </a>
          <button
            className={`hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? 'סגור תפריט' : 'פתח תפריט'}
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </nav>
  );
}
