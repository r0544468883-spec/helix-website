'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function FoundersCoin() {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setFlipped((prev) => !prev);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="founders-coin-wrapper">
      <div className={`founders-coin ${flipped ? 'flipped' : ''}`}>
        <div className="founders-coin-face founders-coin-front">
          <Image
            src="/eran.jpg"
            alt="ערן ליפשטיין"
            width={280}
            height={280}
            className="founders-coin-img"
          />
          <span className="founders-coin-name">ערן</span>
        </div>
        <div className="founders-coin-face founders-coin-back">
          <Image
            src="/ron.jpg"
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
