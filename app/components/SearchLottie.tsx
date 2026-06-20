'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/magnify-question.json';

export default function SearchLottie() {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      style={{ width: 160, height: 160 }}
      aria-hidden="true"
    />
  );
}
