'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/funnel.json';

export default function FunnelLottie() {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}
