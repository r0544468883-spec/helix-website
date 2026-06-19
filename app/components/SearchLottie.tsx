'use client';

import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';

export default function SearchLottie() {
  const [animData, setAnimData] = useState<object | null>(null);

  useEffect(() => {
    fetch('/magnify-question.json')
      .then(r => r.json())
      .then(setAnimData);
  }, []);

  if (!animData) return null;

  return (
    <Lottie
      animationData={animData}
      loop
      autoplay
      style={{ width: 160, height: 160 }}
      aria-hidden="true"
    />
  );
}
