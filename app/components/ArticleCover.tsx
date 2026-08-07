'use client';

import { useEffect, useRef, useState } from 'react';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

type DotLottie = { play: () => void; pause: () => void } | null;

/**
 * Lottie cover for a blog card. Loaded by URL (lazy) so large JSONs are only
 * fetched when a card scrolls in, plays only while on screen (perf with many
 * cards), and rests on the first frame when the user prefers reduced motion.
 */
export default function ArticleCover({ src }: { src: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [dot, setDot] = useState<DotLottie>(null);

  useEffect(() => {
    if (!dot || !wrapRef.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const el = wrapRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) dot.play();
        else dot.pause();
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [dot]);

  return (
    <div ref={wrapRef} className="article-cover" aria-hidden="true">
      <DotLottieReact
        src={src}
        loop
        autoplay={false}
        dotLottieRefCallback={(instance) => setDot(instance as unknown as DotLottie)}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
