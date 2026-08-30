'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Props {
  flipped?: boolean; // controlled from outside (synced with Lottie)
}

export default function FoundersCoin({ flipped: controlledFlip }: Props) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    if (controlledFlip !== undefined) {
      setFlipped(controlledFlip);
    }
  }, [controlledFlip]);

  // Fallback: self-managed interval if not controlled
  useEffect(() => {
    if (controlledFlip !== undefined) return;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;
    const interval = setInterval(() => setFlipped((prev) => !prev), 5000);
    return () => clearInterval(interval);
  }, [controlledFlip]);

  return (
    <div className="founders-coin-wrapper">
      <div className={`founders-coin ${flipped ? 'flipped' : ''}`}>
        <div className="founders-coin-face founders-coin-front">
          <Image
            src="/eran.png"
            alt="ערן ליפשטיין"
            width={280}
            height={280}
            className="founders-coin-img"
          />
          <span className="founders-coin-name">ערן</span>
        </div>
        <div className="founders-coin-face founders-coin-back">
          <Image
            src="/ron.png"
            alt="רון קלי"
            width={280}
            height={280}
            className="founders-coin-img"
          />
          <span className="founders-coin-name">רון</span>
        </div>
      </div>
    </div>
  );
}
