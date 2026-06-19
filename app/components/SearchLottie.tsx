'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/magnify-question.json';

export default function SearchLottie() {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      style={{ width: 180, height: 135 }}
      aria-hidden="true"
    />
  );
}
