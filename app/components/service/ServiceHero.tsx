'use client';

import { useEffect, useRef } from 'react';
import { EmojiIcon } from '@/lib/emoji-icon';

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  marketPrice?: string;
  price?: string;
  priceNote?: string;
  ctaHref: string;
  ctaText?: string;
  gradient?: string;
  /** Optional "included free" chip row shown between the subtitle and CTA. */
  highlights?: string[];
  highlightsLabel?: string;
  children?: React.ReactNode;
}

export default function ServiceHero({ eyebrow, title, subtitle, marketPrice, price, priceNote, ctaHref, ctaText = 'דברו איתנו בוואטסאפ', gradient = 'from-emerald-950/40 via-transparent to-transparent', highlights, highlightsLabel, children }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const highlightsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const onScroll = () => {
      const y = window.scrollY;
      const bg = el.querySelector('.sp-hero-bg') as HTMLElement;
      if (bg) bg.style.transform = `translateY(${y * 0.3}px) scale(${1 + y * 0.0003})`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // GSAP stagger entrance
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const targets = [badgeRef.current, titleRef.current, subtitleRef.current, highlightsRef.current, pricingRef.current, ctaRef.current].filter(Boolean);
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from(targets, { y: 50, opacity: 0, duration: 0.9, stagger: 0.12 });
      cleanup = () => tl.kill();
    })();

    return () => cleanup?.();
  }, []);

  return (
    <section className="sp-hero-immersive" ref={heroRef}>
      <div className="sp-hero-grain" />
      <div className="container sp-hero-content">
        <div className={children ? 'sp-hero-split' : ''}>
          <div className="sp-hero-text">
            <div ref={badgeRef} className="sp-hero-badge-row">
              <span className="sp-hero-eyebrow">{eyebrow}</span>
            </div>
            <h1 ref={titleRef} className="sp-hero-title" dangerouslySetInnerHTML={{ __html: title }} />
            <p ref={subtitleRef} className="sp-hero-subtitle">{subtitle}</p>
            {highlights && highlights.length > 0 && (
              <div ref={highlightsRef} className="sp-hero-includes">
                <span className="sp-hero-includes-label"><EmojiIcon e="🎁" /> {highlightsLabel ?? 'כלול חינם'}</span>
                <span className="sp-hero-chips">
                  {highlights.map((h) => (
                    <span key={h} className="sp-hero-chip">{h}</span>
                  ))}
                </span>
              </div>
            )}
            <div ref={pricingRef} className="sp-hero-pricing">
              {marketPrice && <span className="sp-hero-market">בשוק: {marketPrice} ₪</span>}
              <span className="sp-hero-price">{price}</span>
              {priceNote && <span className="sp-hero-price-note">{priceNote}</span>}
            </div>
            <a ref={ctaRef} href={ctaHref} target="_blank" rel="noopener noreferrer" className="sp-hero-cta">
              {ctaText}
            </a>
          </div>
          {children && (
            <div className="sp-hero-visual">
              {children}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
