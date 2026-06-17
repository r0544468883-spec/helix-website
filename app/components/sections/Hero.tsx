'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Button from '../Button';
import FoundersCoin from '../FoundersCoin';
import { SITE } from '@/lib/site';

const HeroShader = dynamic(() => import('../HeroShader'), { ssr: false });

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function Hero() {
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);
  const blob3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const blobs = [
      { el: blob1.current, speed: 18 },
      { el: blob2.current, speed: 30 },
      { el: blob3.current, speed: 12 },
    ];

    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
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
      {/* WebGL animated background */}
      <HeroShader />

      {/* Parallax emerald blobs */}
      <div
        ref={blob1}
        aria-hidden="true"
        style={{
          position: 'absolute', top: '-10%', right: '-8%',
          width: 520, height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          transition: 'transform 0.12s ease-out',
          zIndex: 1,
        }}
      />
      <div
        ref={blob2}
        aria-hidden="true"
        style={{
          position: 'absolute', bottom: '5%', left: '-12%',
          width: 640, height: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(22,255,171,0.10) 0%, transparent 70%)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
          transition: 'transform 0.18s ease-out',
          zIndex: 1,
        }}
      />
      <div
        ref={blob3}
        aria-hidden="true"
        style={{
          position: 'absolute', top: '40%', left: '30%',
          width: 380, height: 380,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          transition: 'transform 0.08s ease-out',
          zIndex: 1,
        }}
      />

      {/* Content */}
      <div className="container" style={{ position: 'relative', zIndex: 2 }}>
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
