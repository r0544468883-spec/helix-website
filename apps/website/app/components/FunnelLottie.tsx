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
      {/* Hearts and likes falling from top */}
      <div className="funnel-hearts" aria-hidden="true">
        <img src="/heart.png" alt="" className="funnel-heart" style={{ animationDelay: '0s' }} />
        <img src="/like.png" alt="" className="funnel-heart" style={{ animationDelay: '0.6s' }} />
        <img src="/heart.png" alt="" className="funnel-heart" style={{ animationDelay: '1.2s' }} />
        <img src="/like.png" alt="" className="funnel-heart" style={{ animationDelay: '1.8s' }} />
        <img src="/heart.png" alt="" className="funnel-heart" style={{ animationDelay: '2.4s' }} />
        <img src="/like.png" alt="" className="funnel-heart" style={{ animationDelay: '0.3s' }} />
      </div>

      {/* Funnel animation (no balls/output - just the funnel shape) */}
      <Lottie
        animationData={data}
        loop
        autoplay
        style={{ width: '100%', height: '100%', position: 'relative', zIndex: 1 }}
      />

      {/* Coins coming out bottom */}
      <div className="funnel-coins" aria-hidden="true">
        <img src="/coin.png" alt="" className="funnel-coin" style={{ animationDelay: '0s' }} />
        <img src="/coin.png" alt="" className="funnel-coin" style={{ animationDelay: '1s' }} />
        <img src="/coin.png" alt="" className="funnel-coin" style={{ animationDelay: '2s' }} />
      </div>
    </div>
  );
}
