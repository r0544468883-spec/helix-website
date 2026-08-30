'use client';

import { useInView } from './useInView';

const AC = '#10B981';
const BRIGHT = '#12d597';
const WARN = '#e2564a';

function Node({ x, y, label, cls }: { x: number; y: number; label: string; cls: string }) {
  return (
    <g className={cls}>
      <circle cx={x} cy={y} r="16" fill="url(#as-node)" stroke="#eafff6" strokeOpacity="0.35" strokeWidth="1" />
      <text x={x} y={y + 3.5} textAnchor="middle" fontSize="9" fontWeight="800" fill="#06160f">{label}</text>
    </g>
  );
}

/** agent-symphony: agents ring a verification loop; a claim circles and gets ✓,
 *  while a hallucination is filtered out. Continuous motion. */
export function AgentSymphony() {
  const { ref, inView } = useInView<SVGSVGElement>();
  const loop = 'M160 60 A56 56 0 1 1 160 172 A56 56 0 1 1 160 60';
  return (
    <svg ref={ref} className={`artgfx artgfx--symphony${inView ? ' is-in' : ''}`} viewBox="0 0 320 240" role="img" aria-label="סוכני AI סביב לולאת אימות: טענה מקבלת אישור, הזיה מסוננת החוצה">
      <defs>
        <radialGradient id="as-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.32" /><stop offset="100%" stopColor={BRIGHT} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="as-node" cx="40%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#8affd4" /><stop offset="100%" stopColor="#0c8f60" />
        </radialGradient>
        <radialGradient id="as-core" cx="40%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#8affd4" /><stop offset="100%" stopColor="#0b7a52" />
        </radialGradient>
        <linearGradient id="as-ring" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#3fd39b" /><stop offset="100%" stopColor="#0c6f4f" />
        </linearGradient>
      </defs>

      <circle className="g-breathe" cx="160" cy="116" r="86" fill="url(#as-halo)" />

      {/* the verification loop */}
      <circle cx="160" cy="116" r="56" fill="none" stroke="url(#as-ring)" strokeWidth="2.4" strokeDasharray="2 7" opacity="0.8" />

      {/* claim traveling the loop */}
      <g>
        <circle r="6" fill="#eafff6"><animateMotion dur="4.5s" repeatCount="indefinite" path={loop} /></circle>
      </g>

      {/* agents on the ring */}
      <Node x={160} y={60} label="חוקר" cls="g-fade g-d1 g-pulse" />
      <Node x={216} y={116} label="מנסח" cls="g-fade g-d2" />
      <Node x={160} y={172} label="מבקר" cls="g-fade g-d3" />
      <Node x={104} y={116} label="מאמת" cls="g-fade g-d4 g-pulse" />

      {/* orchestrator core */}
      <g className="g-fade g-d1">
        <circle cx="160" cy="116" r="20" fill="url(#as-core)" stroke="#eafff6" strokeOpacity="0.4" strokeWidth="1" />
        <text x="160" y="119" textAnchor="middle" fontSize="9" fontWeight="800" fill="#06160f">מתזמר</text>
      </g>

      {/* verified check by the verifier */}
      <g className="g-pop g-d4">
        <circle cx="86" cy="150" r="10" fill={AC} />
        <path d="M81 150 l4 4 6 -8" fill="none" stroke="#06160f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* hallucination filtered out */}
      <g className="g-drip g-d2">
        <circle cx="238" cy="176" r="9" fill="none" stroke={WARN} strokeWidth="2" />
        <path d="M234 172 l8 8 M242 172 l-8 8" stroke={WARN} strokeWidth="2" strokeLinecap="round" />
      </g>
      <text x="238" y="204" textAnchor="middle" fontSize="9" fill={WARN} opacity="0.8" className="g-fade g-d4">הזיה</text>
    </svg>
  );
}
