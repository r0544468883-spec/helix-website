'use client';

import { useEffect, useState } from 'react';
import Lottie from 'lottie-react';

const orbitIcons = [
  { emoji: '✦', label: 'ChatGPT' },
  { emoji: '◈', label: 'Claude' },
  { emoji: '🧠', label: 'AI' },
  { emoji: '⚡', label: 'Automation' },
  { emoji: '📚', label: 'Knowledge' },
  { emoji: '🔐', label: 'Security' },
];

export default function AIServiceLottie() {
  const [data, setData] = useState(null);

  useEffect(() => {
    fetch('/ai-service.json?' + Date.now())
      .then((r) => r.json())
      .then(setData)
      .catch(() => {});
  }, []);

  return (
    <div className="auto-hero-wrap">
      <div className="auto-hero-gears">
        {data && (
          <Lottie
            animationData={data}
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="auto-hero-orbit">
        {orbitIcons.map((icon, i) => (
          <div
            key={icon.label}
            className="auto-orbit-icon"
            style={{ '--i': i, '--total': orbitIcons.length } as React.CSSProperties}
            title={icon.label}
          >
            <span>{icon.emoji}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
