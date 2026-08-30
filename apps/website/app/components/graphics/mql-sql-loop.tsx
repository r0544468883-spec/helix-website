'use client';

import { useInView } from './useInView';

const MKT = '#10B981';   // משפך שיווק — brand green
const SALES = '#4B9FE1'; // משפך מכירות — cool blue
const CYCLE = '#F5A623'; // מיחזור — amber

function Chip({ x, y, label, tone, cls }: { x: number; y: number; label: string; tone: 'mkt' | 'sales'; cls: string }) {
  const fill = tone === 'mkt' ? 'url(#ms-mkt)' : 'url(#ms-sales)';
  const ink = tone === 'mkt' ? '#06160f' : '#04121f';
  const stroke = tone === 'mkt' ? '#eafff6' : '#eaf4ff';
  return (
    <g className={cls}>
      <rect x={x - 28} y={y - 15} width="56" height="30" rx="8" fill={fill} stroke={stroke} strokeOpacity="0.3" />
      <text x={x} y={y + 4} textAnchor="middle" fontSize="12.5" fontWeight="800" fill={ink}>{label}</text>
    </g>
  );
}

/** mql-sql-loop: full two-funnel loop. Marketing funnel MCL→MEL→MQL (green),
 *  handoff to Sales funnel SAL→SQL→SQO (blue). A lead that drops out of the
 *  sales funnel returns (amber) into the marketing funnel for re-nurturing. */
export function MqlSqlLoop() {
  const { ref, inView } = useInView<SVGSVGElement>();
  return (
    <svg
      ref={ref}
      className={`artgfx artgfx--mqlsql${inView ? ' is-in' : ''}`}
      viewBox="0 0 320 240"
      role="img"
      aria-label="שני משפכים מחוברים בלולאה: משפך השיווק MCL, MEL, MQL עובר במסירה למשפך המכירות SAL, SQL, SQO. ליד שנופל ממשפך המכירות חוזר אל משפך השיווק לטיפוח"
    >
      <defs>
        <linearGradient id="ms-mkt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12d597" /><stop offset="100%" stopColor="#0c8f60" />
        </linearGradient>
        <linearGradient id="ms-sales" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#66b2ea" /><stop offset="100%" stopColor="#2f7dc0" />
        </linearGradient>
      </defs>

      {/* ── funnel bands ── */}
      <rect className="g-fade" x="12" y="34" width="296" height="58" rx="14" fill="rgba(16,185,129,0.09)" stroke={MKT} strokeOpacity="0.28" />
      <rect className="g-fade g-d2" x="12" y="148" width="296" height="58" rx="14" fill="rgba(75,159,225,0.09)" stroke={SALES} strokeOpacity="0.28" />
      <text className="g-fade" x="160" y="26" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={MKT}>משפך שיווק</text>
      <text className="g-fade g-d2" x="160" y="226" textAnchor="middle" fontSize="11.5" fontWeight="700" fill={SALES}>משפך מכירות</text>

      {/* ── forward arrows: marketing lane (→) ── */}
      <line className="g-fade" x1="98" y1="63" x2="126" y2="63" stroke={MKT} strokeWidth="2" />
      <polygon className="g-fade" points="126,59 133,63 126,67" fill={MKT} />
      <line className="g-fade g-d2" x1="188" y1="63" x2="216" y2="63" stroke={MKT} strokeWidth="2" />
      <polygon className="g-fade g-d2" points="216,59 223,63 216,67" fill={MKT} />

      {/* ── handoff: MQL → SAL (down, on the right) ── */}
      <line className="g-draw g-d3" x1="250" y1="78" x2="250" y2="162" stroke={MKT} strokeWidth="2" pathLength={1} strokeDasharray="1" />
      <polygon className="g-pop g-d3" points="246,156 250,163 254,156" fill={MKT} />
      <text className="g-fade g-d3" x="238" y="124" textAnchor="end" fontSize="9" fontWeight="700" fill={MKT}>מסירה</text>

      {/* ── forward arrows: sales lane (←) ── */}
      <line className="g-fade g-d2" x1="222" y1="177" x2="194" y2="177" stroke={SALES} strokeWidth="2" />
      <polygon className="g-fade g-d2" points="194,173 187,177 194,181" fill={SALES} />
      <line className="g-fade g-d3" x1="132" y1="177" x2="104" y2="177" stroke={SALES} strokeWidth="2" />
      <polygon className="g-fade g-d3" points="104,173 97,177 104,181" fill={SALES} />

      {/* ── recycle: dropped out of sales → back into marketing (amber, left) ── */}
      <path
        className="g-flow"
        d="M 42,177 C 6,150 6,90 42,63"
        fill="none"
        stroke={CYCLE}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="2 11"
      />
      <path
        className="g-draw g-d4"
        d="M 42,177 C 6,150 6,90 42,63"
        fill="none"
        stroke={CYCLE}
        strokeWidth="2.5"
        strokeLinecap="round"
        pathLength={1}
        opacity="0.25"
      />
      <polygon className="g-pop g-d4" points="35,70 42,60 47,72" fill={CYCLE} />

      {/* recycle caption, in the gap between the funnels */}
      <text className="g-fade g-d4" x="168" y="122" textAnchor="middle" fontSize="11" fontWeight="700" fill={CYCLE}>נפל מהמכירות?</text>
      <text className="g-fade g-d5" x="168" y="136" textAnchor="middle" fontSize="11" fontWeight="700" fill={CYCLE}>חוזר לשיווק לטיפוח</text>

      {/* ── marketing funnel chips ── */}
      <Chip x={70} y={63} label="MCL" tone="mkt" cls="g-pop" />
      <Chip x={160} y={63} label="MEL" tone="mkt" cls="g-pop g-d2" />
      <Chip x={250} y={63} label="MQL" tone="mkt" cls="g-pop g-d3" />

      {/* ── sales funnel chips ── */}
      <Chip x={250} y={177} label="SAL" tone="sales" cls="g-pop g-d3" />
      <Chip x={160} y={177} label="SQL" tone="sales" cls="g-pop g-d4" />
      <Chip x={70} y={177} label="SQO" tone="sales" cls="g-pop g-d5" />
    </svg>
  );
}
