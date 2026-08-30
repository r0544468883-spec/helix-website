'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/scissors-ticket.json';

export default function ScissorsLottie({ className }: { className?: string }) {
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
