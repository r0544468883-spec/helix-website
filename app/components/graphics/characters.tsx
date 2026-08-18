'use client';

import { useInView } from './useInView';

const AC = '#10B981';
const BRIGHT = '#12d597';

/** HELIX CHIEF — a friendly "chief" mascot (crown = the head of all tools)
 *  that winks, with two faint orbiting tool chips it orchestrates. */
export function ChiefWink() {
  const { ref, inView } = useInView<SVGSVGElement>();
  return (
    <svg ref={ref} className={`artgfx artgfx--chief${inView ? ' is-in' : ''}`} viewBox="0 0 320 240" role="img" aria-label="מסקוט HELIX CHIEF קורץ, מעל כלים שהוא מתזמר">
      {/* faint orbiting tools it runs */}
      <g className="g-fade g-d3" opacity="0.5">
        <line x1="112" y1="84" x2="66" y2="60" stroke={AC} strokeWidth="1" strokeDasharray="3 4" />
        <rect x="44" y="46" width="26" height="20" rx="4" fill="none" stroke={AC} strokeWidth="1.4" />
        <line x1="50" y1="53" x2="64" y2="53" stroke={AC} strokeWidth="1.2" />
        <line x1="50" y1="59" x2="60" y2="59" stroke={AC} strokeWidth="1.2" />
      </g>
      <g className="g-fade g-d4" opacity="0.5">
        <line x1="208" y1="88" x2="256" y2="70" stroke={AC} strokeWidth="1" strokeDasharray="3 4" />
        <rect x="248" y="54" width="26" height="20" rx="4" fill="none" stroke={AC} strokeWidth="1.4" />
        <path d="M252 58 L261 66 L270 58" fill="none" stroke={AC} strokeWidth="1.4" />
      </g>

      {/* crown */}
      <g className="g-fade g-d1">
        <path d="M126 62 L134 42 L146 56 L160 38 L174 56 L186 42 L194 62 Z" fill={BRIGHT} />
        <rect x="126" y="60" width="68" height="7" rx="2" fill={BRIGHT} />
        <circle cx="160" cy="40" r="3.4" fill={AC} />
      </g>

      {/* head */}
      <g className="g-fade g-d2">
        <rect x="104" y="70" width="112" height="104" rx="34" fill="#0e2a20" stroke={AC} strokeWidth="2.4" />
        {/* left eye (open) */}
        <circle cx="140" cy="116" r="8" fill={BRIGHT} />
        <circle cx="142.5" cy="113.5" r="2.4" fill="#0e2a20" />
        {/* right eye (winks) */}
        <g className="g-wink">
          <circle cx="180" cy="116" r="8" fill={BRIGHT} />
          <circle cx="182.5" cy="113.5" r="2.4" fill="#0e2a20" />
        </g>
        {/* smile */}
        <path d="M136 140 Q160 158 184 140" fill="none" stroke={BRIGHT} strokeWidth="4" strokeLinecap="round" />
        {/* wink sparkle */}
        <g className="g-pulse">
          <path d="M198 104 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2 z" fill={BRIGHT} />
        </g>
      </g>

      {/* shoulders hint */}
      <path className="g-fade g-d3" d="M120 200 Q160 174 200 200" fill="none" stroke={AC} strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
    </svg>
  );
}

/** agentic-AI: a 3-position autonomy switch that slides advisor → approve →
 *  autopilot, landing (and glowing) on autopilot. */
export function AutonomyToggle() {
  const { ref, inView } = useInView<SVGSVGElement>();
  return (
    <svg ref={ref} className={`artgfx artgfx--toggle${inView ? ' is-in' : ''}`} viewBox="0 0 320 240" role="img" aria-label="מתג אוטונומיה בשלושה מצבים שמחליק לאוטופיילוט">
      <text x="160" y="70" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="1" fill={AC} className="g-fade g-d1">מתג אוטונומיה</text>

      {/* track */}
      <g className="g-fade g-d2">
        <rect x="70" y="104" width="180" height="40" rx="20" fill="#0e2a20" stroke={AC} strokeWidth="2" />
        {/* stop markers */}
        <circle cx="92" cy="124" r="2.5" fill={AC} opacity="0.6" />
        <circle cx="160" cy="124" r="2.5" fill={AC} opacity="0.6" />
        {/* autopilot bolt glows */}
        <path className="g-pulse" d="M231 116 l-6 10 5 0 -3 8 8 -11 -5 0 4 -7 z" fill={BRIGHT} />
      </g>

      {/* sliding knob */}
      <g className="g-fade g-d2">
        <circle className="g-knob" cx="92" cy="124" r="15" fill={BRIGHT} />
      </g>

      {/* labels */}
      <g className="g-fade g-d3" fontSize="11" fill="#9fb4ad" textAnchor="middle">
        <text x="92" y="172">יועץ</text>
        <text x="160" y="172">מאשר</text>
        <text x="228" y="172" fill={BRIGHT} fontWeight="700">אוטופיילוט</text>
      </g>
    </svg>
  );
}
