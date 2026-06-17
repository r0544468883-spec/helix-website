import React from 'react';

// Pure-CSS rising bubbles — HELIX emerald theme
// Adapts the classic "floating circles" pattern to dark bg + emerald palette
const bubbles = [
  { left: '8%',  w: 70,  delay: 0,  dur: 22 },
  { left: '18%', w: 18,  delay: 3,  dur: 14 },
  { left: '28%', w: 28,  delay: 6,  dur: 18 },
  { left: '38%', w: 55,  delay: 1,  dur: 20 },
  { left: '50%', w: 16,  delay: 0,  dur: 16 },
  { left: '60%', w: 100, delay: 4,  dur: 13 },
  { left: '70%', w: 130, delay: 8,  dur: 24 },
  { left: '78%', w: 22,  delay: 16, dur: 40 },
  { left: '85%', w: 14,  delay: 2,  dur: 28 },
  { left: '92%', w: 120, delay: 0,  dur: 12 },
];

// Alternate between fill and outline style for variety
const styles = [
  'rgba(16,185,129,0.18)',   // soft fill
  'rgba(22,255,171,0.10)',   // neon fill
  'rgba(16,185,129,0.06)',   // very soft fill
  'rgba(22,255,171,0.14)',   // neon fill
  'rgba(16,185,129,0.22)',   // medium fill
];

export default function HeroBubbles() {
  return (
    <>
      <style>{`
        @keyframes helixBubble {
          0%   { transform: translateY(0)       rotate(0deg);   opacity: 0.85; border-radius: 4px; }
          100% { transform: translateY(-110vh)  rotate(720deg); opacity: 0;    border-radius: 50%; }
        }
      `}</style>

      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {bubbles.map((b, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              bottom: '-160px',
              left: b.left,
              display: 'block',
              width:  b.w,
              height: b.w,
              background: styles[i % styles.length],
              border: i % 3 === 0 ? '1px solid rgba(16,185,129,0.25)' : 'none',
              borderRadius: '4px',
              animation: `helixBubble ${b.dur}s linear ${b.delay}s infinite`,
              backdropFilter: 'blur(1px)',
            }}
          />
        ))}
      </div>
    </>
  );
}
