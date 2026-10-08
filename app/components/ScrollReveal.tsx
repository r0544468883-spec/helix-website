'use client';

import { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right';
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: boolean;
  staggerDelay?: number;
}

export default function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 60,
  stagger = false,
  staggerDelay = 0.12,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let cleanup: (() => void) | undefined;

    // Fail-safe: if GSAP/ScrollTrigger never fires (import error, odd scroll
    // state), force the content visible after a few seconds instead of leaving
    // it stuck at opacity:0. This is the "blank black section" insurance.
    const failSafe = setTimeout(() => {
      if (!el) return;
      const stuck = parseFloat(getComputedStyle(el).opacity) < 0.05;
      const anyChildStuck = Array.from(el.children).some(
        (c) => parseFloat(getComputedStyle(c as HTMLElement).opacity) < 0.05
      );
      if (stuck || anyChildStuck) {
        el.style.opacity = '1';
        el.style.transform = 'none';
        Array.from(el.children).forEach((c) => {
          (c as HTMLElement).style.opacity = '1';
          (c as HTMLElement).style.transform = 'none';
        });
      }
    }, 4000);

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const from: gsap.TweenVars = { opacity: 0 };
      if (direction === 'up') from.y = distance;
      if (direction === 'down') from.y = -distance;
      if (direction === 'left') from.x = distance;
      if (direction === 'right') from.x = -distance;

      const targets = stagger ? el.children : el;

      gsap.set(targets, from);

      gsap.to(targets, {
        opacity: 1,
        x: 0,
        y: 0,
        duration,
        delay,
        ease: 'power3.out',
        stagger: stagger ? staggerDelay : 0,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (t.trigger === el) t.kill();
        });
      };
    })();

    return () => {
      clearTimeout(failSafe);
      cleanup?.();
    };
  }, [ready, direction, delay, duration, distance, stagger, staggerDelay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
