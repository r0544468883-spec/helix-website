'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export default function GrowthHeroLottie() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/growth-hero.json?' + Date.now())
      .then(r => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  if (!data) return null;

  return (
    <Lottie
      animationData={data}
      loop
      autoplay
      style={{ width: '100%', height: '100%' }}
      aria-hidden="true"
    />
  );
}
