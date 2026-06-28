'use client';

import { useEffect, useRef } from 'react';
import ScrollReveal from '../ScrollReveal';
import Button from '../Button';

interface Props {
  title: string;
  subtitle?: string;
  ctaHref: string;
  ctaText?: string;
}

export default function FinalCTA({ title, subtitle, ctaHref, ctaText = 'דברו איתנו בוואטסאפ' }: Props) {
  const ref = useRef<HTMLElement>(null);

  // Border-radius on scroll
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const el = ref.current;
      if (!el) return;

      gsap.fromTo(el,
        { borderRadius: '0px' },
        {
          borderRadius: '32px',
          scrollTrigger: {
            trigger: el,
            start: 'top 80%',
            end: 'top 40%',
            scrub: 0.5,
          },
        }
      );

      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === el) t.kill();
        });
      };
    })();

    return () => cleanup?.();
  }, []);

  return (
    <section ref={ref} className="sp2-final-cta" style={{ overflow: 'hidden' }}>
      <div className="sp2-final-glow" />
      <div className="container">
        <ScrollReveal direction="up">
          <h2 className="sp2-final-title">{title}</h2>
          {subtitle && <p className="sp2-final-subtitle">{subtitle}</p>}
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="sp2-final-btn">
              {ctaText}
            </a>
            <Button href={ctaHref} variant="minimal" arrow="left">או שלחו הודעה</Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
