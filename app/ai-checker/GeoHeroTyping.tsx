'use client';

import { useEffect, useState } from 'react';

const FULL = 'האם העסק שלי מופיע במנועי הבינה המלאכותית?';

/** AI-prompt mock that types the question letter-by-letter, holds, then restarts. */
export default function GeoHeroTyping() {
  const [n, setN] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setN(FULL.length);
      setDone(true);
      return;
    }
    let i = 0;
    let hold = 0;
    let phase: 'typing' | 'holding' = 'typing';
    const id = setInterval(() => {
      if (phase === 'typing') {
        i += 1;
        setN(i);
        if (i >= FULL.length) {
          phase = 'holding';
          hold = 0;
          setDone(true);
        }
      } else {
        hold += 1;
        if (hold > 34) {
          i = 0;
          phase = 'typing';
          setN(0);
          setDone(false);
        }
      }
    }, 65);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="geo-prompt" dir="rtl" aria-label={FULL}>
      <span className="geo-prompt-spark" aria-hidden="true">✦</span>
      <span className="geo-prompt-text">
        {FULL.slice(0, n)}
        <span className="geo-prompt-cursor" aria-hidden="true" />
      </span>
      <span className={`geo-prompt-send ${done ? 'ready' : ''}`} aria-hidden="true">↑</span>
    </div>
  );
}
