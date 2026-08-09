'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/business-dev-lottie.json';

export default function BusinessDevLottie({ className }: { className?: string }) {
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
