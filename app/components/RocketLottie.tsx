'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function RocketLottie({ className }: { className?: string }) {
  return (
    <div className={`rocket-animation-wrap${className ? ` ${className}` : ''}`} aria-hidden="true">
      <DotLottieReact
        src="/cute-ticket.lottie"
        loop
        autoplay
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
