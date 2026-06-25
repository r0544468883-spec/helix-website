'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Button from '../Button';
import FoundersCoin from '../FoundersCoin';
import { SITE } from '@/lib/site';

gsap.registerPlugin(ScrollTrigger);

const PeopleLottie = dynamic(() => import('../PeopleLottie'), {
  ssr: false,
  loading: () => <div style={{ width: '100%', height: '100%', minHeight: 320 }} />,
});

const whatsappHref = `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(SITE.whatsappMessage)}`;

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const sublineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const coinRef = useRef<HTMLDivElement>(null);
  const blob1 = useRef<HTMLDivElement>(null);
  const blob2 = useRef<HTMLDivElement>(null);
  const [coinFlipped, setCoinFlipped] = useState(false);
  const handleLoopComplete = useCallback(() => {
    setCoinFlipped((prev) => !prev);
  }, []);

  // Mouse-follow parallax blobs
  useEffect(() => {
    const blobs = [
      { el: blob1.current, speed: 22 },
      { el: blob2.current, speed: 14 },
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

  // GSAP entrance animations + scroll-driven expansion
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const section = sectionRef.current;
    const content = contentRef.current;
    const headline = headlineRef.current;
    const subtitle = subtitleRef.current;
    const subline = sublineRef.current;
    const cta = ctaRef.current;
    const coin = coinRef.current;
    if (!section || !content || !headline || !subtitle || !subline || !cta || !coin) return;

    // Entrance: staggered reveal
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.from(headline.children, { y: 80, opacity: 0, duration: 1, stagger: 0.15 })
      .from(subtitle, { y: 40, opacity: 0, duration: 0.8 }, '-=0.6')
      .from(subline, { y: 30, opacity: 0, duration: 0.7 }, '-=0.5')
      .from(cta, { y: 30, opacity: 0, duration: 0.7 }, '-=0.4')
      .from(coin, { scale: 0.8, opacity: 0, duration: 1, ease: 'back.out(1.7)' }, '-=0.8');

    // Scroll-driven: content expands width + subtle parallax
    gsap.to(content, {
      scale: 1.03,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1,
      },
    });

    // Blobs drift on scroll
    gsap.to(blob1.current, {
      y: -100,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
    gsap.to(blob2.current, {
      y: -60,
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });

    return () => {
      tl.kill();
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === section) t.kill();
      });
    };
  }, []);

  return (
    <section ref={sectionRef} className="hero" style={{ position: 'relative', overflow: 'hidden' }}>

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
      <div ref={contentRef} className="container" style={{ position: 'relative', zIndex: 3 }}>
        <div className="hero-layout">
          <div className="hero-text">
            <h1 ref={headlineRef} className="hero-headline">
              <span>מבטיחים פחות.</span>
              <span>מספקים יותר.</span>
            </h1>

            <h2 ref={subtitleRef} className="hero-subtitle">הילדים הטובים של עולם הדיגיטל.</h2>

            <p ref={sublineRef} className="hero-subline">
              ה-AI חתך לנו 60% מהעלויות. העברנו את החיסכון אליכם. שיווק, אתר ואוטומציה. החל מ-1,250 ₪ לחודש, בלי חוזה.
            </p>

            <div ref={ctaRef} className="hero-ctas">
              <Button href={whatsappHref} variant="primary">דברו איתנו בוואטסאפ</Button>
              <Button href="#packages" variant="text" arrow="down">לחבילות</Button>
            </div>
          </div>
          <div ref={coinRef} className="hero-coin">
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
