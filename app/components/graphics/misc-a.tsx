'use client';

import { useInView } from './useInView';

const AC = '#10B981';
const BRIGHT = '#12d597';
const MUTE = '#5a6b64';

function Root({ mod, label, children }: { mod: string; label: string; children: React.ReactNode }) {
  const { ref, inView } = useInView<SVGSVGElement>();
  return (
    <svg ref={ref} className={`artgfx artgfx--${mod}${inView ? ' is-in' : ''}`} viewBox="0 0 320 240" role="img" aria-label={label}>
      {children}
    </svg>
  );
}

/** hebrew-ocr: a scan line sweeps a Hebrew document, resolving it to clean text. */
export function OcrScan() {
  return (
    <Root mod="ocr" label="קו סריקה עובר על מסמך עברי והופך אותו לטקסט נקי">
      <g className="g-fade g-d1">
        <rect x="92" y="64" width="136" height="108" rx="8" fill="#0e2a20" stroke={AC} strokeWidth="2.2" />
        <text x="160" y="106" textAnchor="middle" fontSize="17" fontWeight="700" fill={BRIGHT}>שלום עולם</text>
        <text x="160" y="136" textAnchor="middle" fontSize="13" fill={AC}>זיהוי עברית</text>
      </g>
      {/* scan line */}
      <rect className="g-scan g-fade g-d2" x="96" y="72" width="128" height="3" rx="1.5" fill={BRIGHT} />
      {/* accuracy check */}
      <g className="g-pop g-d3">
        <circle cx="214" cy="78" r="11" fill={AC} />
        <path d="M209 78 l4 4 6 -8" fill="none" stroke="#0e2a20" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="160" y="196" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">עברית, מדויק</text>
    </Root>
  );
}

/** plg-small-business: the product itself hands the user a key (self-serve). */
export function PlgKey() {
  return (
    <Root mod="plg" label="חלון מוצר שמחלק מפתח בעצמו, self-serve">
      <g className="g-fade g-d1">
        <rect x="70" y="72" width="150" height="100" rx="9" fill="#0e2a20" stroke={AC} strokeWidth="2.2" />
        <line x1="70" y1="92" x2="220" y2="92" stroke={AC} strokeWidth="1.4" opacity="0.6" />
        <circle cx="82" cy="82" r="2.6" fill={MUTE} /><circle cx="92" cy="82" r="2.6" fill={MUTE} /><circle cx="102" cy="82" r="2.6" fill={MUTE} />
      </g>
      {/* key */}
      <g className="g-pop g-d2">
        <circle cx="130" cy="132" r="12" fill="none" stroke={BRIGHT} strokeWidth="3.4" />
        <line x1="141" y1="132" x2="176" y2="132" stroke={BRIGHT} strokeWidth="3.4" strokeLinecap="round" />
        <line x1="166" y1="132" x2="166" y2="142" stroke={BRIGHT} strokeWidth="3.4" strokeLinecap="round" />
        <line x1="176" y1="132" x2="176" y2="144" stroke={BRIGHT} strokeWidth="3.4" strokeLinecap="round" />
      </g>
      {/* handed to a user */}
      <path className="g-draw g-d3" pathLength={1} d="M214 150 q28 6 44 22" fill="none" stroke={AC} strokeWidth="2" strokeDasharray="3 3" />
      <g className="g-pop g-d4">
        <circle cx="270" cy="178" r="9" fill="#0e2a20" stroke={AC} strokeWidth="2" />
        <circle cx="270" cy="175" r="3" fill={BRIGHT} />
      </g>
      <text x="140" y="196" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">self-serve</text>
    </Root>
  );
}

/** beachhead-market: a flag planted on the beachhead, territory expanding out. */
export function BeachheadFlag() {
  return (
    <Root mod="beach" label="דגל נעוץ בראש-גשר וטריטוריה שמתרחבת">
      {/* ground */}
      <path className="g-fade g-d1" d="M36 178 Q160 150 284 178 L284 210 L36 210 Z" fill={AC} opacity="0.16" />
      <path className="g-fade g-d1" d="M36 178 Q160 150 284 178" fill="none" stroke={AC} strokeWidth="2.2" />
      {/* expanding territory */}
      <g fill="none" stroke={AC} strokeDasharray="4 5">
        <path className="g-fade g-d2" d="M120 168 A44 24 0 0 1 200 168" strokeWidth="1.8" opacity="0.7" />
        <path className="g-fade g-d3" d="M96 166 A70 38 0 0 1 224 166" strokeWidth="1.6" opacity="0.5" />
      </g>
      {/* flag */}
      <g className="g-pop g-d2">
        <line x1="160" y1="158" x2="160" y2="96" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round" />
        <path d="M160 98 L200 108 L160 122 Z" fill={BRIGHT} />
      </g>
      <text x="160" y="70" textAnchor="middle" fontSize="13" fontWeight="800" fill={AC} className="g-fade g-d1">ראש-גשר</text>
    </Root>
  );
}

/** budget-loop: money auto-routes to the winning channel. */
export function BudgetPipes() {
  const bars = [
    { x: 96, h: 34, win: false }, { x: 156, h: 62, win: false }, { x: 214, h: 96, win: true },
  ];
  return (
    <Root mod="budget" label="כסף שזורם אוטומטית לערוץ המנצח">
      {/* hopper over the winner */}
      <g className="g-fade g-d1">
        <path d="M198 56 L246 56 L236 74 L208 74 Z" fill="none" stroke={AC} strokeWidth="2.2" />
        <text x="222" y="70" textAnchor="middle" fontSize="11" fontWeight="800" fill={BRIGHT}>₪</text>
      </g>
      {/* coins dropping into winner */}
      <text className="g-drip g-d1" x="222" y="90" textAnchor="middle" fontSize="12" fontWeight="800" fill={BRIGHT}>₪</text>
      <text className="g-drip g-d2" x="222" y="90" textAnchor="middle" fontSize="12" fontWeight="800" fill={BRIGHT}>₪</text>
      {/* channel bars */}
      {bars.map((b, i) => (
        <g key={b.x} className={`g-fade g-d${2 + i}`}>
          <rect x={b.x} y={176 - b.h} width="42" height={b.h} rx="4"
            fill={b.win ? BRIGHT : 'none'} stroke={b.win ? BRIGHT : MUTE} strokeWidth="2" opacity={b.win ? 1 : 0.6} />
        </g>
      ))}
      <text x="160" y="200" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d5">למנצח, אוטומטית</text>
    </Root>
  );
}
