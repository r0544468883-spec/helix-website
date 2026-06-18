'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/rocket-mail.json';

export default function RocketLottie({ className }: { className?: string }) {
  return (
    <div className={`rocket-animation-wrap${className ? ` ${className}` : ''}`} aria-hidden="true">
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
        aria-hidden="true"
      />
    </div>
  );
}
