'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Button from '../Button';
import FoundersCoin from '../FoundersCoin';
import { SITE } from '@/lib/site';

const PeopleLottie = dynamic(() => import('../PeopleLottie'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', minHeight: 320 }} />,
});

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function Hero() {
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);
  const [coinFlipped, setCoinFlipped] = useState(false);
  const handleLoopComplete = useCallback(() => {
    setCoinFlipped((prev) => !prev);
  }, []);

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

            <p className="hero-subline">
              ה-AI חתך לנו 60% מהעלויות. העברנו את החיסכון אליכם. שיווק, אתר ואוטומציה. החל מ-1,250 ₪ לחודש, בלי חוזה.
            </p>

            <div className="hero-ctas">
              <Button href={whatsappHref} variant="primary">דברו איתנו בוואטסאפ</Button>
              <Button href="#packages" variant="text" arrow="down">לחבילות</Button>
            </div>
          </div>
          <div className="hero-coin">
            <div className="hero-lottie-frame">
              <PeopleLottie onLoopComplete={handleLoopComplete} />
              <div className="hero-lottie-coin">
                <FoundersCoin flipped={coinFlipped} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
