'use client';

import { useEffect, useState } from 'react';

interface Props {
  price: string;
  label: string;
  ctaHref: string;
  ctaText?: string;
}

export default function StickyPricing({ price, label, ctaHref, ctaText = 'דברו איתנו בוואטסאפ' }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`sticky-pricing ${visible ? 'sticky-pricing-visible' : ''}`}>
      <div className="sticky-pricing-inner">
        <div className="sticky-pricing-info">
          <span className="sticky-pricing-price">{price}</span>
          <span className="sticky-pricing-label">{label}</span>
        </div>
        <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="sticky-pricing-cta">
          {ctaText}
        </a>
      </div>
    </div>
  );
}
