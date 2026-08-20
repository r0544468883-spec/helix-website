'use client';

import { useEffect, useRef } from 'react';
import { EmojiIcon } from '@/lib/emoji-icon';

type Props = { slug: string; accent: string; view: string };

/** Scroll-driven "unfold": the main screen starts tilted back in 3D and
 *  rotates up to face the viewer as the user scrolls (progress-bar.co.il style). */
export default function ProductHeroUnfold({ slug, accent, view }: Props) {
  const secRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = secRef.current, frame = frameRef.current;
    if (!sec || !frame) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const START = 60; // deg, laid back but still readable, rises to upright
    let raf = 0;
    const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

    const frameLoop = () => {
      const rect = sec.getBoundingClientRect();
      const vh = window.innerHeight;
      // progress: 0 while the screen is still low (tilted), 1 once it rises to
      // the upper area. Higher threshold => stays tilted while visible under the hero.
      let p = clamp((vh * 0.9 - rect.top) / (vh * 0.5), 0, 1);
      p = p * p * (3 - 2 * p); // smoothstep, crisp snap
      const rx = reduce ? 0 : (1 - p) * START;
      const sc = 0.9 + p * 0.1;
      frame.style.transform = `rotateX(${rx}deg) scale(${sc})`;
      frame.style.boxShadow = `0 ${30 + (1 - p) * 50}px ${70 + (1 - p) * 50}px rgba(0,0,0,${0.5 + (1 - p) * 0.25})`;
      raf = requestAnimationFrame(frameLoop);
    };
    raf = requestAnimationFrame(frameLoop);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section className="ph-unfold" ref={secRef} style={{ ['--pac' as string]: accent }}>
      <div className="ph-unfold-orb ph-unfold-orb-a" aria-hidden="true" />
      <div className="ph-unfold-orb ph-unfold-orb-b" aria-hidden="true" />
      <div className="ph-unfold-persp">
        <div className="ph-unfold-frame" ref={frameRef}>
          <div className="ph-unfold-glow" aria-hidden="true" />
          <div className="ps-bar">
            <span className="ps-dot" style={{ background: '#FF5F57' }} />
            <span className="ps-dot" style={{ background: '#FEBC2E' }} />
            <span className="ps-dot" style={{ background: '#28C840' }} />
            <span className="ps-url"><EmojiIcon e="🔒" /> app.helix.co.il/<b>{slug}</b></span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/product-shots/${slug}-1.jpg`} alt={view} className="ph-unfold-img" />
        </div>
      </div>
    </section>
  );
}
