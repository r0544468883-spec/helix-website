'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export default function FunnelLottie() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/funnel-original.json')
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Hearts falling from top */}
      <div className="funnel-hearts" aria-hidden="true">
        {[0, 1, 2, 3, 4].map(i => (
          <img
            key={i}
            src="/heart.png"
            alt=""
            className="funnel-heart"
            style={{ animationDelay: `${i * 0.7}s` }}
          />
        ))}
      </div>

      {/* Funnel animation */}
      <Lottie
        animationData={data}
        loop
        autoplay
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
      />

      {/* Coins rising from bottom */}
      <div className="funnel-coins" aria-hidden="true">
        {[0, 1, 2].map(i => (
          <img
            key={i}
            src="/coin.png"
            alt=""
            className="funnel-coin"
            style={{ animationDelay: `${i * 1.2}s` }}
          />
        ))}
      </div>
    </div>
  );
}
