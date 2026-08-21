'use client';

import { useInView } from './useInView';

const BRAND = '#10B981';

/** A person node: circle with a small head + shoulders silhouette. */
function Node({ x, y, r, cls }: { x: number; y: number; r: number; cls: string }) {
  return (
    <g className={cls}>
      <circle cx={x} cy={y} r={r} fill="url(#rl-node)" stroke="#eafff6" strokeOpacity="0.35" />
      <circle cx={x} cy={y - r * 0.32} r={r * 0.3} fill="#06160f" />
      <path d={`M ${x - r * 0.52} ${y + r * 0.6} a ${r * 0.52} ${r * 0.52} 0 0 1 ${r * 1.04} 0`} fill="#06160f" />
    </g>
  );
}

/** An arrow trimmed to sit between two circular nodes, with a bright glow
 *  pulse that travels along the line (referral energy flowing outward). */
function Link({
  ax, ay, ar, bx, by, br, cls, w = 2, color = BRAND, delay = '0s',
}: { ax: number; ay: number; ar: number; bx: number; by: number; br: number; cls: string; w?: number; color?: string; delay?: string }) {
  const ang = Math.atan2(by - ay, bx - ax);
  const sx = ax + Math.cos(ang) * (ar + 2);
  const sy = ay + Math.sin(ang) * (ar + 2);
  const ex = bx - Math.cos(ang) * (br + 4);
  const ey = by - Math.sin(ang) * (br + 4);
  const ah = 6.5;
  const p2x = ex - ah * Math.cos(ang - 0.42);
  const p2y = ey - ah * Math.sin(ang - 0.42);
  const p3x = ex - ah * Math.cos(ang + 0.42);
  const p3y = ey - ah * Math.sin(ang + 0.42);
  return (
    <g className={cls}>
      <line x1={sx} y1={sy} x2={ex} y2={ey} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${ex},${ey} ${p2x},${p2y} ${p3x},${p3y}`} fill={color} />
      {/* traveling glow pulse */}
      <line
        className="rl-pulse"
        x1={sx} y1={sy} x2={ex} y2={ey}
        stroke="#b9ffdf" strokeWidth={w + 1.4} strokeLinecap="round"
        pathLength={1} strokeDasharray="0.16 0.84"
        style={{ animationDelay: delay }}
      />
    </g>
  );
}

/** referral-loop: one customer refers two, who refer more (viral fan-out),
 *  with a green glow pulse that travels along each link. */
export function ReferralLoop() {
  const { ref, inView } = useInView<SVGSVGElement>();
  return (
    <svg
      ref={ref}
      className={`artgfx artgfx--referral${inView ? ' is-in' : ''}`}
      viewBox="0 0 320 240"
      role="img"
      aria-label="לולאת הפניות: לקוח אחד מביא שני חברים, שכל אחד מהם מביא עוד, ואור זורם החוצה לאורך הקווים"
    >
      <defs>
        <linearGradient id="rl-node" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12d597" /><stop offset="100%" stopColor="#0c8f60" />
        </linearGradient>
        <filter id="rl-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <style>{`
        .artgfx--referral .rl-pulse { opacity: 0; animation: rlPulse 1.7s linear infinite; animation-play-state: paused; }
        .artgfx--referral.is-in .rl-pulse { opacity: 1; animation-play-state: running; }
        @keyframes rlPulse { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @media (prefers-reduced-motion: reduce) {
          .artgfx--referral .rl-pulse { animation: none; opacity: 0; }
        }
      `}</style>

      {/* fan-out links with a green glow + traveling pulse: A -> B1,B2 ; B -> C */}
      <g filter="url(#rl-glow)">
        <Link ax={46} ay={120} ar={18} bx={158} by={74} br={14} cls="g-draw g-d2" delay="0s" />
        <Link ax={46} ay={120} ar={18} bx={158} by={166} br={14} cls="g-draw g-d2" delay="0.15s" />
        <Link ax={158} ay={74} ar={14} bx={262} by={44} br={9} cls="g-draw g-d3" w={1.6} delay="0.5s" />
        <Link ax={158} ay={74} ar={14} bx={262} by={92} br={9} cls="g-draw g-d3" w={1.6} delay="0.65s" />
        <Link ax={158} ay={166} ar={14} bx={262} by={148} br={9} cls="g-draw g-d4" w={1.6} delay="0.5s" />
        <Link ax={158} ay={166} ar={14} bx={262} by={196} br={9} cls="g-draw g-d4" w={1.6} delay="0.65s" />
      </g>

      {/* nodes */}
      <Node x={46} y={120} r={18} cls="g-pop" />
      <Node x={158} y={74} r={14} cls="g-pop g-d2" />
      <Node x={158} y={166} r={14} cls="g-pop g-d2" />
      <Node x={262} y={44} r={9} cls="g-pop g-d3" />
      <Node x={262} y={92} r={9} cls="g-pop g-d3" />
      <Node x={262} y={148} r={9} cls="g-pop g-d4" />
      <Node x={262} y={196} r={9} cls="g-pop g-d4" />

      {/* labels */}
      <text className="g-fade" x={46} y={150} textAnchor="middle" fontSize="11" fontWeight="700" fill={BRAND}>לקוח</text>
      <text className="g-fade g-d2" x={158} y={54} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={BRAND}>חבר</text>
      <text className="g-fade g-d2" x={158} y={190} textAnchor="middle" fontSize="10.5" fontWeight="700" fill={BRAND}>חבר</text>

      {/* caption */}
      <text className="g-fade g-d4" x={160} y={230} textAnchor="middle" fontSize="12" fontWeight="800" fill={BRAND}>כל לקוח מביא את הבא</text>
    </svg>
  );
}
