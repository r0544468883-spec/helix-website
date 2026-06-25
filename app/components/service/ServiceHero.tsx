'use client';

import { useEffect, useRef } from 'react';

interface Props {
  eyebrow: string;
  title: string;
  subtitle: string;
  marketPrice?: string;
  price: string;
  priceNote?: string;
  ctaHref: string;
  gradient?: string;
}

export default function ServiceHero({ eyebrow, title, subtitle, marketPrice, price, priceNote, ctaHref, gradient = 'from-emerald-950/40 via-transparent to-transparent' }: Props) {
  const heroRef = useRef<HTMLDivElement>(null);

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

  return (
    <section className="sp-hero-immersive" ref={heroRef}>
      <div className="sp-hero-grain" />
      <div className="container sp-hero-content">
        <div className="sp-hero-badge-row">
          <span className="sp-hero-eyebrow">{eyebrow}</span>
        </div>
        <h1 className="sp-hero-title" dangerouslySetInnerHTML={{ __html: title }} />
        <p className="sp-hero-subtitle">{subtitle}</p>
        <div className="sp-hero-pricing">
          {marketPrice && <span className="sp-hero-market">בשוק: {marketPrice} ₪</span>}
          <span className="sp-hero-price">{price}</span>
          {priceNote && <span className="sp-hero-price-note">{priceNote}</span>}
        </div>
        <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="sp-hero-cta">
          דברו איתנו בוואטסאפ
        </a>
      </div>
    </section>
  );
}
