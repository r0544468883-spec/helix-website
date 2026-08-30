'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/people-lottie.json';

interface Props {
  className?: string;
  onLoopComplete?: () => void;
}

export default function PeopleLottie({ className, onLoopComplete }: Props) {
  return (
    <Lottie
      animationData={animationData}
      loop
      autoplay
      className={className}
      onLoopComplete={onLoopComplete}
      style={{ width: '100%', height: '100%', background: 'transparent' }}
    />
  );
}
