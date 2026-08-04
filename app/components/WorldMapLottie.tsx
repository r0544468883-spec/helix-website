'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/world-map.json';

export default function WorldMapLottie({ className }: { className?: string }) {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      className={className}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    />
  );
}
