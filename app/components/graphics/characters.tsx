'use client';

import { useInView } from './useInView';

const AC = '#10B981';
const BRIGHT = '#12d597';

/** One war-bonnet feather: white body, dark tip, rooted just above the head and
 *  rotated `a` degrees around the head so the whole set fans out like a halo. */
function Feather({ a, L }: { a: number; L: number }) {
  const bx = 160, by = 91;           // base point (before rotation)
  const w = 6.4;
  const tip = by - L;
  const white = `M${bx} ${by} C ${bx - w} ${by - 0.4 * L} ${bx - w} ${by - 0.82 * L} ${bx} ${tip} C ${bx + w} ${by - 0.82 * L} ${bx + w} ${by - 0.4 * L} ${bx} ${by} Z`;
  const dark = `M${bx} ${tip} C ${bx - 4.6} ${by - 0.86 * L} ${bx - 4.6} ${by - 0.71 * L} ${bx} ${by - 0.69 * L} C ${bx + 4.6} ${by - 0.71 * L} ${bx + 4.6} ${by - 0.86 * L} ${bx} ${tip} Z`;
  return (
    <g transform={`rotate(${a} 160 137)`}>
      <path d={white} fill="#eceadd" stroke="#a29e8d" strokeWidth="0.6" />
      <path d={dark} fill="#242424" />
      <line x1={bx} y1={by - 3} x2={bx} y2={tip + 3} stroke="#8f8b7c" strokeWidth="0.9" />
      <circle cx={bx} cy={by - 1} r="2.6" fill="#f4f2e8" />
    </g>
  );
}

/** HELIX CHIEF — a mascot wearing a full Native-American war bonnet (the chief
 *  of all your tools). Floats, winks, and the bonnet sways continuously. */
export function ChiefWink() {
  const { ref, inView } = useInView<SVGSVGElement>();
  const feathers = [-100, -85, -70, -55, -40, -26, -13, 0, 13, 26, 40, 55, 70, 85, 100]
    .map((a) => ({ a, L: 44 + Math.round((1 - Math.abs(a) / 100) * 20) }));
  return (
    <svg ref={ref} className={`artgfx artgfx--chief${inView ? ' is-in' : ''}`} viewBox="0 0 320 240" role="img" aria-label="מסקוט HELIX CHIEF כמפקד אינדיאני עם מצנפת נוצות, קורץ ומרחף">
      <defs>
        <radialGradient id="chief-halo" cx="50%" cy="52%" r="55%">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.34" />
          <stop offset="72%" stopColor={BRIGHT} stopOpacity="0.05" />
          <stop offset="100%" stopColor={BRIGHT} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="chief-head" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1f7256" />
          <stop offset="100%" stopColor="#0a2318" />
        </linearGradient>
        <linearGradient id="chief-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0f3a2c" />
          <stop offset="100%" stopColor="#06160f" />
        </linearGradient>
      </defs>

      {/* breathing halo */}
      <circle className="g-breathe" cx="160" cy="132" r="94" fill="url(#chief-halo)" />

      <g className="g-fadeonly">
        <g className="g-float">
          {/* war bonnet — behind the head, gently swaying */}
          <g className="g-sway">
            {/* red felt base arc */}
            <path d="M114 148 A47 47 0 1 1 206 148" fill="none" stroke="#a5352f" strokeWidth="12" strokeLinecap="round" />
            {feathers.map((f) => <Feather key={f.a} a={f.a} L={f.L} />)}
          </g>

          {/* braids */}
          <path d="M126 150 q-10 22 -8 40" fill="none" stroke="#2e2620" strokeWidth="7" strokeLinecap="round" />
          <path d="M194 150 q10 22 8 40" fill="none" stroke="#2e2620" strokeWidth="7" strokeLinecap="round" />
          <circle cx="119" cy="192" r="3.2" fill="#a5352f" /><circle cx="201" cy="192" r="3.2" fill="#a5352f" />

          {/* head shell */}
          <rect x="120" y="96" width="80" height="84" rx="26" fill="url(#chief-head)" stroke="#3fd39b" strokeWidth="2" />
          <rect x="124" y="100" width="72" height="42" rx="22" fill="#ffffff" opacity="0.06" />

          {/* beaded headband */}
          <path d="M124 112 Q160 105 196 112 L196 122 Q160 115 124 122 Z" fill="#e7e2d1" stroke="#2a2a2a" strokeWidth="0.8" />
          {[138, 152, 166, 180].map((x) => (
            <path key={x} d={`M${x} 110 l4 5 -4 5 -4 -5 z`} fill="#a5352f" />
          ))}
          <circle cx="131" cy="115" r="1.6" fill="#2a2a2a" /><circle cx="189" cy="115" r="1.6" fill="#2a2a2a" />

          {/* face screen */}
          <rect x="132" y="124" width="56" height="46" rx="17" fill="url(#chief-face)" stroke="#0a2318" strokeWidth="1.4" />
          <path d="M138 134 q22 -11 44 0" fill="none" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.10" />

          {/* calm, composed brows (gentle arch, not angled inward) */}
          <path d="M142 138 Q149 135 157 137" fill="none" stroke="#3fd39b" strokeWidth="3" strokeLinecap="round" />
          <path d="M178 138 Q171 135 163 137" fill="none" stroke="#3fd39b" strokeWidth="3" strokeLinecap="round" />

          {/* narrowed, focused eyes */}
          <g>
            <ellipse cx="150" cy="146" rx="6" ry="3.4" fill={BRIGHT} />
            <circle cx="151.6" cy="144.8" r="1.5" fill="#eafff6" />
          </g>
          <g className="g-wink">
            <ellipse cx="170" cy="146" rx="6" ry="3.4" fill={BRIGHT} />
            <circle cx="171.6" cy="144.8" r="1.5" fill="#eafff6" />
          </g>

          {/* war paint under the eyes */}
          <g stroke="#a5352f" strokeWidth="2.2" strokeLinecap="round">
            <line x1="146" y1="152" x2="146" y2="157" />
            <line x1="154" y1="152" x2="154" y2="156" />
            <line x1="166" y1="152" x2="166" y2="156" />
            <line x1="174" y1="152" x2="174" y2="157" />
          </g>

          {/* firm, serious mouth */}
          <path d="M151 163 L169 163" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

/** agentic-AI: a glossy 3-position autonomy switch whose knob glides
 *  advisor → approve → autopilot on a loop; autopilot bolt glows. */
export function AutonomyToggle() {
  const { ref, inView } = useInView<SVGSVGElement>();
  return (
    <svg ref={ref} className={`artgfx artgfx--toggle${inView ? ' is-in' : ''}`} viewBox="0 0 320 240" role="img" aria-label="מתג אוטונומיה בשלושה מצבים שמחליק לאוטופיילוט">
      <defs>
        <linearGradient id="tg-track" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06160f" /><stop offset="100%" stopColor="#0f3527" />
        </linearGradient>
        <radialGradient id="tg-knob" cx="38%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#8affd4" /><stop offset="60%" stopColor={BRIGHT} /><stop offset="100%" stopColor="#0c8f60" />
        </radialGradient>
        <radialGradient id="tg-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.28" /><stop offset="100%" stopColor={BRIGHT} stopOpacity="0" />
        </radialGradient>
      </defs>

      <text x="160" y="66" textAnchor="middle" fontSize="13" fontWeight="700" letterSpacing="1" fill={BRIGHT} className="g-fade g-d1">מתג אוטונומיה</text>

      <g className="g-fade g-d2">
        {/* track */}
        <rect x="86" y="100" width="148" height="42" rx="21" fill="url(#tg-track)" stroke={AC} strokeWidth="2" />
        <rect x="90" y="104" width="140" height="14" rx="7" fill="#ffffff" opacity="0.05" />
        {/* stop icons: advisor (eye), approve (check), autopilot (bolt) */}
        <g fill="none" stroke="#6f8b82" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M92 121 q6 -6 12 0 q-6 6 -12 0 z" /><circle cx="98" cy="121" r="1.8" fill="#6f8b82" stroke="none" />
          <path d="M154 121 l4 4 8 -9" />
        </g>
        <path className="g-pulse" d="M226 112 l-8 12 6 0 -4 10 10 -14 -6 0 5 -8 z" fill={BRIGHT} />
      </g>

      {/* halo under knob + gliding knob */}
      <g className="g-knob">
        <circle cx="98" cy="121" r="26" fill="url(#tg-halo)" />
        <circle cx="98" cy="121" r="16" fill="url(#tg-knob)" stroke="#eafff6" strokeOpacity="0.5" strokeWidth="1" />
        <circle cx="93" cy="115" r="4.5" fill="#eafff6" opacity="0.55" />
      </g>

      <g className="g-fade g-d3" fontSize="11" fill="#9fb4ad" textAnchor="middle">
        <text x="98" y="170">יועץ</text>
        <text x="160" y="170">מאשר</text>
        <text x="224" y="170" fill={BRIGHT} fontWeight="700">אוטופיילוט</text>
      </g>
    </svg>
  );
}
