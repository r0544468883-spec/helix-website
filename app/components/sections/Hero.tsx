'use client';

import { useEffect, useRef } from 'react';
import Button from '../Button';
import FoundersCoin from '../FoundersCoin';
import HeroBubbles from '../HeroBubbles';
import { SITE } from '@/lib/site';

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function Hero() {
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blobs = [
      { el: blob1.current, speed: 22 },
      { el: blob2.current, speed: 14 },
    ];
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth)  - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      blobs.forEach(({ el, speed }) => {
        if (el) el.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section className="hero" style={{ position: 'relative', overflow: 'hidden' }}>

      {/* Rising bubbles background */}
      <HeroBubbles />

      {/* Large parallax glow blobs (mouse-follow) */}
      <div
        ref={blob1}
        aria-hidden="true"
        style={{
          position: 'absolute', top: '0%', right: '-5%',
          width: 620, height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.28) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          transition: 'transform 0.14s ease-out',
          zIndex: 2,
        }}
      />
      <div
        ref={blob2}
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '5%', left: '-8%',
          width: 680, height: 680,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,255,171,0.16) 0%, transparent 65%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          transition: 'transform 0.2s ease-out',
          zIndex: 2,
        }}
      />

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 3 }}>
        <div className="hero-layout">
          <div className="hero-text">
            <h1 className="hero-headline">
              <span>מבטיחים פחות.</span>
              <span>מספקים יותר.</span>
            </h1>

            <h2 className="hero-subtitle">הילדים הטובים של עולם הדיגיטל.</h2>

            <div className="hero-coin-mobile">
              <FoundersCoin />
            </div>

            <p className="hero-subline">
              כשהבינה המלאכותית חוסכת לנו זמן יקר, לא הגיוני שתמשיכו לשלם כאילו היא לא קיימת. אנחנו מציעים חבילות דיגיטל מלאות ומתקדמות, בלי סיפורים, בלי דמי הקמה, בלי אותיות קטנות ובעיקר בלי מחירים מנופחים.
            </p>

            <div className="hero-ctas">
              <Button href={whatsappHref} variant="primary">דברו איתנו בוואטסאפ</Button>
              <Button href="#packages" variant="text" arrow="down">לחבילות</Button>
            </div>
          </div>
          <div className="hero-coin">
            <FoundersCoin />
          </div>
        </div>
      </div>
    </section>
  );
}
