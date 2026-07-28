'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { NAV_LINKS, NAV_SERVICES, NAV_CONTENT, SITE, type NavLink } from '@/lib/site';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function Nav() {
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();
  const onHomepage = pathname === '/';
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  // Close everything on route change
  useEffect(() => {
    setMenuOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Close open dropdown when clicking outside the nav, or pressing Escape
  useEffect(() => {
    if (!openDropdown) return;
    const onDocClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpenDropdown(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [openDropdown]);

  const closeAll = () => {
    setMenuOpen(false);
    setOpenDropdown(null);
  };

  const toggleDropdown = (name: string) => setOpenDropdown((cur) => (cur === name ? null : name));

  // Resolve /#anchor to #anchor when already on the homepage
  const resolveHref = (href: string) => (href.startsWith('/#') && onHomepage ? href.slice(1) : href);

  const renderLink = (link: NavLink, className = 'nav-link') => {
    const href = resolveHref(link.href);
    const isActive = link.activeOn ? pathname === link.activeOn : false;
    const cls = isActive ? `${className} active` : className;

    if (link.external) {
      return (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cls}
          onClick={closeAll}
        >
          {link.label}
        </a>
      );
    }
    if (link.href.startsWith('/#')) {
      return (
        <a key={link.href} href={href} className={cls} onClick={closeAll}>
          {link.label}
        </a>
      );
    }
    return (
      <Link key={link.href} href={href} className={cls} onClick={closeAll}>
        {link.label}
      </Link>
    );
  };

  return (
    <nav ref={navRef} className="nav" id="nav" aria-label="ראשי">
      <div className="container">
        <div className="nav-inner">
          <Link href="/" className="nav-logo" onClick={closeAll}>
            HELIX<span className="dot">.</span>
          </Link>
          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {/* שירותים — mega dropdown grouped by customer goal */}
            <div className={`nav-dropdown ${openDropdown === 'services' ? 'open' : ''}`}>
              <button
                type="button"
                className="nav-dropdown-trigger"
                aria-expanded={openDropdown === 'services'}
                aria-haspopup="true"
                onClick={() => toggleDropdown('services')}
              >
                שירותים
                <ChevronDown size={15} className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-panel nav-mega">
                  {NAV_SERVICES.map((group) => (
                    <div key={group.title} className="nav-mega-group">
                      {group.href ? (
                        <Link href={group.href} className="nav-mega-title nav-mega-title-link" onClick={closeAll}>
                          {group.title}
                        </Link>
                      ) : (
                        <p className="nav-mega-title">{group.title}</p>
                      )}
                      {group.items.map((item) => (
                        <Link key={item.href} href={item.href} className="nav-mega-link" onClick={closeAll}>
                          {item.label}
                          {item.badge === 'recommended' && (
                            <span className="nav-badge-recommended" aria-label="מומלץ">
                              <span className="nav-badge-star" aria-hidden="true">★</span> מומלץ
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* חבילות */}
            {renderLink(NAV_LINKS[0])}

            {/* תוכן — content hub dropdown */}
            <div className={`nav-dropdown ${openDropdown === 'content' ? 'open' : ''}`}>
              <button
                type="button"
                className="nav-dropdown-trigger"
                aria-expanded={openDropdown === 'content'}
                aria-haspopup="true"
                onClick={() => toggleDropdown('content')}
              >
                תוכן
                <ChevronDown size={15} className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-panel nav-menu-list">
                  {NAV_CONTENT.map((item) => renderLink(item, 'nav-mega-link'))}
                </div>
              </div>
            </div>

            {/* סטארטאפים, בדיקת AI, אודות */}
            {NAV_LINKS.slice(1).map((link) => renderLink(link))}

            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="nav-cta mobile-only"
              onClick={closeAll}
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
