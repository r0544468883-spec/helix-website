'use client';

import Lottie from 'lottie-react';
import data from '../../public/funnel-v2.json';

// Slow down by halving the framerate in the data
const animationData = { ...data, fr: data.fr * 0.5 };

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
