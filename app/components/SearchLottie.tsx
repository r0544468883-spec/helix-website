'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function SearchLottie() {
  return (
    <DotLottieReact
      src="/magnify-question.json"
      loop
      autoplay
      style={{ width: 160, height: 160 }}
    />
  );
}
