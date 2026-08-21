'use client';

import { useInView } from './useInView';

const MKT = '#10B981';   // שיווק (MQL) — brand green
const SALES = '#4B9FE1'; // מכירות (SQL) — cool blue
const CYCLE = '#F5A623'; // מיחזור — amber
const INK = '#E2E3E1';
const MUTE = '#869489';

/** mql-sql-loop: MQL⇄SQL closed loop. Green top arc = "בשל, עובר למכירות",
 *  amber bottom arc = "לא בשל, חוזר לטיפוח". The two arcs form one circulating
 *  loop (שיטת המעגלים). Marching dashes convey flow direction. */
export function MqlSqlLoop() {
  const { ref, inView } = useInView<SVGSVGElement>();
  return (
    <svg
      ref={ref}
      className={`artgfx artgfx--mqlsql${inView ? ' is-in' : ''}`}
      viewBox="0 0 320 240"
      role="img"
      aria-label="לולאת MQL ל-SQL וחזרה: ליד בשל עובר משיווק למכירות, וליד שלא בשל חוזר מ-SQL אל MQL לטיפוח נוסף"
    >
      <defs>
        <radialGradient id="ms-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={MKT} stopOpacity="0.18" />
          <stop offset="100%" stopColor={MKT} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="ms-mkt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12d597" />
          <stop offset="100%" stopColor="#0c8f60" />
        </linearGradient>
        <linearGradient id="ms-sales" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#66b2ea" />
          <stop offset="100%" stopColor="#2f7dc0" />
        </linearGradient>
      </defs>

      {/* soft halo */}
      <ellipse className="g-breathe" cx="160" cy="120" rx="150" ry="104" fill="url(#ms-halo)" />

      {/* ── forward arc: MQL → (top) → SQL, green ── */}
      <path
        className="g-draw g-d2"
        d="M 64,120 A 96,66 0 0 1 256,120"
        fill="none"
        stroke={MKT}
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        opacity="0.28"
      />
      <path
        className="g-flow"
        d="M 64,120 A 96,66 0 0 1 256,120"
        fill="none"
        stroke={MKT}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 12"
      />
      {/* green arrowhead at top apex, pointing right (travel MQL→SQL) */}
      <polygon className="g-pop g-d3" points="158,48 172,54 158,60" fill={MKT} />

      {/* ── recycle arc: SQL → (bottom) → MQL, amber ── */}
      <path
        className="g-draw g-d3"
        d="M 256,120 A 96,66 0 0 1 64,120"
        fill="none"
        stroke={CYCLE}
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1}
        opacity="0.28"
      />
      <path
        className="g-flow"
        d="M 256,120 A 96,66 0 0 1 64,120"
        fill="none"
        stroke={CYCLE}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 12"
      />
      {/* amber arrowhead at bottom apex, pointing left (travel SQL→MQL) */}
      <polygon className="g-pop g-d4" points="162,180 148,186 162,192" fill={CYCLE} />

      {/* arc labels */}
      <text className="g-fade g-d3" x="160" y="34" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={MKT}>
        בשל, עובר למכירות
      </text>
      <text className="g-fade g-d4" x="160" y="214" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={CYCLE}>
        לא בשל, חוזר לטיפוח
      </text>

      {/* ── MQL node (marketing) ── */}
      <g className="g-pop">
        <rect x="26" y="97" width="76" height="46" rx="12" fill="url(#ms-mkt)" stroke="#eafff6" strokeOpacity="0.3" />
        <text x="64" y="118" textAnchor="middle" fontSize="18" fontWeight="800" fill="#06160f">MQL</text>
        <text x="64" y="133" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#06160f" opacity="0.72">שיווק</text>
      </g>

      {/* ── SQL node (sales) ── */}
      <g className="g-pop g-d2">
        <rect x="218" y="97" width="76" height="46" rx="12" fill="url(#ms-sales)" stroke="#eaf4ff" strokeOpacity="0.3" />
        <text x="256" y="118" textAnchor="middle" fontSize="18" fontWeight="800" fill="#04121f">SQL</text>
        <text x="256" y="133" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#04121f" opacity="0.72">מכירות</text>
      </g>

      {/* pulsing life on each node */}
      <circle className="g-pulse" cx="64" cy="120" r="42" fill="none" stroke={MKT} strokeOpacity="0.0" />
      <circle className="g-pulse g-d2" cx="256" cy="120" r="42" fill="none" stroke={SALES} strokeOpacity="0.0" />
    </svg>
  );
}
