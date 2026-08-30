'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { EmojiIcon } from '@/lib/emoji-icon';
import { NAV_LINKS, NAV_SERVICES, NAV_PRODUCTS, NAV_PRODUCTS_FLAGSHIP, NAV_PRODUCTS_FREE, NAV_PRODUCTS_DEPARTMENTS, NAV_PRODUCTS_VERTICALS, NAV_STARTUPS, NAV_CONTENT, NAV_CHECKS, NAV_LEARN, SITE, type NavLink } from '@/lib/site';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;
const portalHref = 'https://my.helix.co.il';

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
        {link.badge === 'soon' && <span className="nav-account-soon">COMING SOON</span>}
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
            {/* אודות */}
            {renderLink(NAV_LINKS[1])}

            {/* שירותים, mega dropdown grouped by customer goal */}
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
                          {item.badge === 'soon' && <span className="nav-account-soon">COMING SOON</span>}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* חבילות */}
            {renderLink(NAV_LINKS[0])}

            {/* תכנית שותפים, פריט עליון עצמאי */}
            {renderLink(NAV_LINKS[2])}

            {/* סטארטאפים ויזמים, dropdown עצמאי */}
            <div className={`nav-dropdown ${openDropdown === 'startups' ? 'open' : ''}`}>
              <button
                type="button"
                className="nav-dropdown-trigger"
                aria-expanded={openDropdown === 'startups'}
                aria-haspopup="true"
                onClick={() => toggleDropdown('startups')}
              >
                {NAV_STARTUPS.title}
                <ChevronDown size={15} className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-panel nav-menu-list">
                  <Link href={NAV_STARTUPS.href ?? '/startups'} className="nav-mega-title nav-mega-title-link" onClick={closeAll}>
                    כל השירותים לסטארטאפים ←
                  </Link>
                  {NAV_STARTUPS.items.map((item) => (
                    <Link key={item.href} href={item.href} className="nav-mega-link" onClick={closeAll}>
                      {item.label}
                      {item.badge === 'recommended' && (
                        <span className="nav-badge-recommended" aria-label="מומלץ">
                          <span className="nav-badge-star" aria-hidden="true">★</span> מומלץ
                        </span>
                      )}
                      {item.badge === 'soon' && <span className="nav-account-soon">COMING SOON</span>}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* בדיקות חינם לנכסים דיגיטליים, dropdown עצמאי */}
            <div className={`nav-dropdown ${openDropdown === 'checks' ? 'open' : ''}`}>
              <button
                type="button"
                className="nav-dropdown-trigger"
                aria-expanded={openDropdown === 'checks'}
                aria-haspopup="true"
                onClick={() => toggleDropdown('checks')}
              >
                {NAV_CHECKS.title}
                <ChevronDown size={15} className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-panel nav-menu-list">
                  {NAV_CHECKS.items.map((item) => renderLink(item, 'nav-mega-link'))}
                </div>
              </div>
            </div>

            {/* מרכז למידה, dropdown עצמאי, מכונת התוכן (Learn Hub, השוואות, use-cases, כלים) */}
            <div className={`nav-dropdown ${openDropdown === 'learn' ? 'open' : ''}`}>
              <button
                type="button"
                className="nav-dropdown-trigger"
                aria-expanded={openDropdown === 'learn'}
                aria-haspopup="true"
                onClick={() => toggleDropdown('learn')}
              >
                {NAV_LEARN.title}
                <ChevronDown size={15} className="nav-dropdown-caret" aria-hidden="true" />
              </button>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-panel nav-menu-list">
                  {NAV_LEARN.items.map((item) => renderLink(item, 'nav-mega-link'))}
                </div>
              </div>
            </div>

            {/* התוכנות של HELIX, dropdown עצמאי — הכותרת מקשרת לדף כל התוכנות (/products),
                והחץ פותח את התפריט (בדסקטופ נפתח גם ב-hover). */}
            <div className={`nav-dropdown ${openDropdown === 'products' ? 'open' : ''}`}>
              <div className="nav-dropdown-trigger" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <Link
                  href={NAV_PRODUCTS.href ?? '/products'}
                  className="nav-dropdown-trigger-label"
                  onClick={closeAll}
                  style={{ color: 'inherit', font: 'inherit', textDecoration: 'none' }}
                >
                  התוכנות של HELIX
                </Link>
                <button
                  type="button"
                  aria-label="פתח את תפריט התוכנות"
                  aria-expanded={openDropdown === 'products'}
                  aria-haspopup="true"
                  onClick={() => toggleDropdown('products')}
                  style={{ background: 'none', border: 0, padding: 0, margin: 0, cursor: 'pointer', color: 'inherit', display: 'inline-flex', alignItems: 'center' }}
                >
                  <ChevronDown size={15} className="nav-dropdown-caret" aria-hidden="true" />
                </button>
              </div>
              <div className="nav-dropdown-menu">
                <div className="nav-dropdown-panel nav-mega-products">
                  {/* קישור בולט לדף כל התוכנות — בראש התפריט */}
                  <Link href={NAV_PRODUCTS.href ?? '/products'} className="nav-mega-title-link nav-mega-alllink nav-mega-alllink-top" onClick={closeAll}>
                    כל התוכנות ←
                  </Link>

                  {/* דגל-על — CHIEF מעל כל המחלקות */}
                  <Link href={NAV_PRODUCTS_FLAGSHIP.href} className="nav-mega-flagship" onClick={closeAll}>
                    <EmojiIcon e="🧠" /> {NAV_PRODUCTS_FLAGSHIP.label}
                  </Link>

                  {/* מוצר חינם מודגש — שורה ישירות מתחת ל-CHIEF */}
                  <Link href={NAV_PRODUCTS_FREE.href} className="nav-mega-free" onClick={closeAll}>
                    <span className="nav-mega-free-label">
                      <EmojiIcon e="📇" /> {NAV_PRODUCTS_FREE.label}
                    </span>
                    <span className="nav-mega-free-badge">חינם</span>
                  </Link>

                  {/* מחלקות פונקציונליות — כל אחת עמודה/סאב-הדר משלה */}
                  <div className="nav-mega">
                    {NAV_PRODUCTS_DEPARTMENTS.map((group) => (
                      <div key={group.title} className="nav-mega-group">
                        <p className="nav-mega-title">
                          {group.icon && <EmojiIcon e={group.icon} />} {group.title}
                        </p>
                        {group.items.map((item) => renderLink(item, 'nav-mega-link'))}
                      </div>
                    ))}
                  </div>

                  {/* קטגוריות-תחום — פס תחתון: מוצר ייעודי + הכלים שמתאימים לתחום */}
                  {NAV_PRODUCTS_VERTICALS.map((group) => (
                    <div key={group.title} className="nav-mega-vertical">
                      {group.href ? (
                        <Link href={group.href} className="nav-mega-vertical-title nav-mega-title-link" onClick={closeAll}>
                          {group.icon && <EmojiIcon e={group.icon} />} {group.title} ←
                        </Link>
                      ) : (
                        <span className="nav-mega-vertical-title">
                          {group.icon && <EmojiIcon e={group.icon} />} {group.title}
                        </span>
                      )}
                      <div className="nav-mega-vertical-links">
                        {group.items.map((item) => renderLink(item, 'nav-mega-link'))}
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>

            {/* תוכן, content hub dropdown */}
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

            {/* האיזור האישי, mobile (SOON: portal not live yet, don't navigate) */}
            <a
              href={portalHref}
              className="nav-account mobile-only"
              aria-disabled="true"
              title="בקרוב, האיזור האישי בבנייה"
              onClick={(e) => {
                e.preventDefault();
                closeAll();
              }}
            >
              <User size={15} aria-hidden="true" /> האיזור האישי
              <span className="nav-account-soon">COMING SOON</span>
            </a>

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
          {/* האיזור האישי, desktop (SOON: portal not live yet, don't navigate) */}
          <a
            href={portalHref}
            className="nav-account desktop-only"
            aria-disabled="true"
            title="בקרוב, האיזור האישי בבנייה"
            onClick={(e) => e.preventDefault()}
          >
            <User size={15} aria-hidden="true" /> האיזור האישי
            <span className="nav-account-soon">COMING SOON</span>
          </a>
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
