'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/city-lights.json';

export default function CityLightsLottie() {
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
