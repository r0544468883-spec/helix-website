'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

export default function ProductHeroLottie({ src }: { src: string }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then((r) => r.json())
      .then((d) => alive && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [src]);

  if (!data) return null;

  return (
    <Lottie animationData={data} loop autoplay style={{ width: '100%', height: '100%' }} aria-hidden="true" />
  );
}
