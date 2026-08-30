'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/burning-money.json';

export default function BurningMoneyLottie() {
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
