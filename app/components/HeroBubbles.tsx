// Pure-CSS rising bubbles — HELIX emerald theme
// Keyframe defined in globals.css (.helixBubble)
const bubbles = [
  { left: '8%',  size: 70,  delay: 0,  dur: 22 },
  { left: '18%', size: 18,  delay: 3,  dur: 14 },
  { left: '28%', size: 28,  delay: 6,  dur: 18 },
  { left: '38%', size: 55,  delay: 1,  dur: 20 },
  { left: '50%', size: 16,  delay: 0,  dur: 16 },
  { left: '60%', size: 100, delay: 4,  dur: 13 },
  { left: '70%', size: 130, delay: 8,  dur: 24 },
  { left: '78%', size: 22,  delay: 16, dur: 40 },
  { left: '85%', size: 14,  delay: 2,  dur: 28 },
  { left: '92%', size: 120, delay: 0,  dur: 12 },
];

const fills = [
  'rgba(16,185,129,0.18)',
  'rgba(22,255,171,0.10)',
  'rgba(16,185,129,0.07)',
  'rgba(22,255,171,0.14)',
  'rgba(16,185,129,0.22)',
];

export default function HeroBubbles() {
  return (
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
          className="hero-bubble"
          style={{
            left: b.left,
            width:  b.size,
            height: b.size,
            background: fills[i % fills.length],
            border: i % 3 === 0 ? '1px solid rgba(16,185,129,0.3)' : 'none',
            animationDuration: `${b.dur}s`,
            animationDelay: `${b.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
