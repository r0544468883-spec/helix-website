'use client';

import { useEffect } from 'react';

export default function SmoothScroll() {
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    let cleanup: (() => void) | undefined;

    (async () => {
      const Lenis = (await import('lenis')).default;
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        touchMultiplier: 2,
      });

      lenis.on('scroll', ScrollTrigger.update);

      const rafCallback = (time: number) => {
        lenis.raf(time * 1000);
      };
      gsap.ticker.add(rafCallback);
      gsap.ticker.lagSmoothing(0);

      // Handle anchor links — Lenis blocks native scroll-to-anchor
      const handleAnchorClick = (e: MouseEvent) => {
        const target = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
        if (!target) return;
        const id = target.getAttribute('href')?.slice(1);
        if (!id) return;
        const el = document.getElementById(id);
        if (!el) return;
        e.preventDefault();
        lenis.scrollTo(el, { offset: -80 });
      };
      document.addEventListener('click', handleAnchorClick);

      cleanup = () => {
        lenis.destroy();
        gsap.ticker.remove(rafCallback);
        document.removeEventListener('click', handleAnchorClick);
      };
    })();

    return () => cleanup?.();
  }, []);

  return null;
}
