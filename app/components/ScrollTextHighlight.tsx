'use client';

import { useEffect, useRef, Children, type ReactNode } from 'react';

interface ScrollTextHighlightProps {
  children: ReactNode;
  className?: string;
  /** Opacity of non-active lines (0-1) */
  dimOpacity?: number;
  /** Opacity of the active/visible line (0-1) */
  activeOpacity?: number;
  /** Blur in px for non-active lines */
  blurAmount?: number;
}

export default function ScrollTextHighlight({
  children,
  className = '',
  dimOpacity = 0.15,
  activeOpacity = 1,
  blurAmount = 2,
}: ScrollTextHighlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const lines = container.querySelectorAll('.sth-line');
      if (!lines.length) return;

      // Set initial state — all dim
      gsap.set(lines, {
        opacity: dimOpacity,
        filter: `blur(${blurAmount}px)`,
      });

      // Each line gets its own ScrollTrigger
      lines.forEach((line) => {
        gsap.to(line, {
          opacity: activeOpacity,
          filter: 'blur(0px)',
          duration: 0.4,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: line,
            start: 'top 75%',
            end: 'top 25%',
            scrub: 0.6,
          },
        });

        // Dim again after passing
        gsap.to(line, {
          opacity: dimOpacity,
          filter: `blur(${blurAmount}px)`,
          duration: 0.4,
          ease: 'power2.in',
          scrollTrigger: {
            trigger: line,
            start: 'bottom 35%',
            end: 'bottom 15%',
            scrub: 0.6,
          },
        });
      });

      cleanup = () => {
        ScrollTrigger.getAll().forEach((t) => {
          if (container.contains(t.trigger as Node)) t.kill();
        });
      };
    })();

    return () => cleanup?.();
  }, [dimOpacity, activeOpacity, blurAmount]);

  // Wrap each child in a .sth-line div
  const items = Children.toArray(children);

  return (
    <div ref={containerRef} className={`scroll-text-highlight ${className}`}>
      {items.map((child, i) => (
        <div key={i} className="sth-line">
          {child}
        </div>
      ))}
    </div>
  );
}
