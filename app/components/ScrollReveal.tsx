'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  /** Animation direction: 'up' | 'down' | 'left' | 'right' */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Delay in seconds */
  delay?: number;
  /** Duration in seconds */
  duration?: number;
  /** Distance in pixels */
  distance?: number;
  /** If true, staggers children elements */
  stagger?: boolean;
  /** Stagger delay between children */
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

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

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

    return () => {
      ScrollTrigger.getAll().forEach((t) => {
        if (t.trigger === el) t.kill();
      });
    };
  }, [direction, delay, duration, distance, stagger, staggerDelay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
