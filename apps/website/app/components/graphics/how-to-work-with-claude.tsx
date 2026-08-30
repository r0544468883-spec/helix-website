'use client';

import { useInView } from './useInView';

const AC = '#10B981';
const BRIGHT = '#12d597';

/** how-to-work-with-claude: a structured prompt card streams into a bright
 *  Claude-style spark (the great answer) with a ✓. The thesis in one image:
 *  clear, structured input → excellent output. */
export function HowToClaude() {
  const { ref, inView } = useInView<SVGSVGElement>();
  const ray = (a: number) => {
    const r = a * (Math.PI / 180);
    const x1 = 238 + Math.cos(r) * 8, y1 = 110 + Math.sin(r) * 8;
    const x2 = 238 + Math.cos(r) * 26, y2 = 110 + Math.sin(r) * 26;
    return { x1, y1, x2, y2 };
  };
  return (
    <svg
      ref={ref}
      className={`artgfx artgfx--howclaude${inView ? ' is-in' : ''}`}
      viewBox="0 0 320 240"
      role="img"
      aria-label="כרטיס פרומפט מובנה שזורם לתוך ניצוץ זוהר עם סימן אישור: קלט ברור, פלט מצוין"
    >
      <defs>
        <linearGradient id="hc-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#123b2c" /><stop offset="100%" stopColor="#0a221a" />
        </linearGradient>
        <radialGradient id="hc-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.30" /><stop offset="100%" stopColor={BRIGHT} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="hc-spark" cx="42%" cy="36%" r="70%">
          <stop offset="0%" stopColor="#c9ffe9" /><stop offset="55%" stopColor="#3fd39b" /><stop offset="100%" stopColor="#0c8f60" />
        </radialGradient>
      </defs>

      <ellipse className="g-breathe" cx="238" cy="110" rx="86" ry="72" fill="url(#hc-halo)" />

      {/* structured prompt card, gently bobbing */}
      <g className="g-bob g-fade g-d1">
        <rect x="34" y="60" width="132" height="112" rx="12" fill="url(#hc-card)" stroke="#3fd39b" strokeWidth="2" />
        {/* header: dot + title bar */}
        <circle cx="48" cy="76" r="4" fill={BRIGHT} />
        <rect x="58" y="72" width="52" height="7" rx="3.5" fill="#9fe9cf" opacity="0.7" />
        {/* structured instruction lines */}
        <rect x="48" y="94" width="104" height="7" rx="3.5" fill="#eafff6" opacity="0.18" />
        <rect x="48" y="108" width="88" height="7" rx="3.5" fill="#eafff6" opacity="0.18" />
        {/* the accented line: the specific instruction */}
        <rect className="g-pulse" x="48" y="122" width="96" height="8" rx="4" fill={AC} />
        <rect x="48" y="138" width="72" height="7" rx="3.5" fill="#eafff6" opacity="0.18" />
        <rect x="48" y="152" width="58" height="7" rx="3.5" fill="#eafff6" opacity="0.18" />
      </g>

      {/* stream from card to spark */}
      <g>
        <circle r="3.2" fill="#eafff6">
          <animateMotion dur="2.6s" repeatCount="indefinite" path="M170 116 C196 116 200 110 210 110" />
        </circle>
        <circle r="2.6" fill={BRIGHT}>
          <animateMotion dur="2.6s" begin="0.9s" repeatCount="indefinite" path="M170 116 C196 116 200 110 210 110" />
        </circle>
      </g>

      {/* Claude-style spark: 8 rays + glowing core */}
      <g className="g-fade g-d2">
        <g className="g-spin" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
            const p = ray(a);
            return <line key={a} x1={p.x1} y1={p.y1} x2={p.x2} y2={p.y2} />;
          })}
        </g>
        <circle className="g-pulse" cx="238" cy="110" r="14" fill="url(#hc-spark)" stroke="#eafff6" strokeOpacity="0.4" strokeWidth="1" />
      </g>

      {/* verified check badge on the spark */}
      <g className="g-pop g-d3">
        <circle cx="262" cy="86" r="11" fill={AC} stroke="#06160f" strokeWidth="1.5" />
        <path d="M256.5 86 l3.5 4 6 -8" fill="none" stroke="#06160f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      <text x="160" y="212" textAnchor="middle" fontSize="13" fontWeight="800" fill={BRIGHT} className="g-fade g-d3">קלט ברור, פלט מצוין</text>
    </svg>
  );
}
