'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function StepsLottie({ className }: { className?: string }) {
  return (
    <DotLottieReact
      src="/step-color.lottie"
      loop
      autoplay
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  );
}
