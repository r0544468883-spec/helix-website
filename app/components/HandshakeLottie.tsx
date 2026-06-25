'use client';

import Lottie from 'lottie-react';
import animationData from '../../public/handshake.json';

export default function HandshakeLottie() {
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
