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

/** hebrew-ocr: a glowing scan line continuously sweeps a Hebrew document. */
export function OcrScan() {
  return (
    <Root mod="ocr" label="קו סריקה זוהר שסורק מסמך עברי ומזהה טקסט נקי">
      <defs>
        <linearGradient id="ocr-doc" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123f2f" /><stop offset="100%" stopColor="#081b14" />
        </linearGradient>
        <linearGradient id="ocr-scan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0" /><stop offset="100%" stopColor={BRIGHT} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <g className="g-fade g-d1">
        <path d="M92 64 H210 L228 82 V172 H92 Z" fill="url(#ocr-doc)" stroke={AC} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M210 64 V82 H228 Z" fill="#0a2318" stroke={AC} strokeWidth="1.4" />
        <text x="158" y="108" textAnchor="middle" fontSize="17" fontWeight="700" fill="#eafff6">שלום עולם</text>
        <text x="158" y="136" textAnchor="middle" fontSize="13" fill={BRIGHT}>זיהוי עברית</text>
      </g>
      {/* sweeping scan */}
      <g className="g-scan">
        <rect x="96" y="52" width="128" height="22" fill="url(#ocr-scan)" opacity="0.9" />
        <rect x="96" y="72" width="128" height="2.6" rx="1.3" fill="#eafff6" />
      </g>
      {/* accuracy badge */}
      <g className="g-pulse">
        <circle cx="216" cy="76" r="12" fill={AC} />
        <path d="M210 76 l4 4 7 -9" fill="none" stroke="#06160f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text x="158" y="196" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">עברית, מדויק</text>
    </Root>
  );
}

/** plg-small-business: the product hands the user a glowing key (self-serve). */
export function PlgKey() {
  return (
    <Root mod="plg" label="חלון מוצר שמחלק מפתח בעצמו, self-serve">
      <defs>
        <linearGradient id="plg-win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#123f2f" /><stop offset="100%" stopColor="#081b14" />
        </linearGradient>
        <linearGradient id="plg-key" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8affd4" /><stop offset="100%" stopColor="#0c8f60" />
        </linearGradient>
      </defs>
      <g className="g-fade g-d1">
        <rect x="72" y="72" width="156" height="102" rx="10" fill="url(#plg-win)" stroke={AC} strokeWidth="2.2" />
        <path d="M72 92 H228" stroke={AC} strokeWidth="1.4" opacity="0.6" />
        <circle cx="84" cy="82" r="2.6" fill="#e2564a" /><circle cx="94" cy="82" r="2.6" fill="#e8b34a" /><circle cx="104" cy="82" r="2.6" fill={AC} />
      </g>
      {/* glowing key */}
      <g className="g-pulse">
        <circle cx="128" cy="134" r="13" fill="none" stroke="url(#plg-key)" strokeWidth="5" />
        <circle cx="128" cy="134" r="5" fill="#081b14" />
        <line x1="140" y1="134" x2="178" y2="134" stroke="url(#plg-key)" strokeWidth="5" strokeLinecap="round" />
        <line x1="168" y1="134" x2="168" y2="145" stroke="url(#plg-key)" strokeWidth="5" strokeLinecap="round" />
        <line x1="178" y1="134" x2="178" y2="147" stroke="url(#plg-key)" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* handed to a user */}
      <path className="g-flow" d="M216 152 q26 6 42 22" fill="none" stroke={AC} strokeWidth="2.2" strokeDasharray="4 4" />
      <g className="g-fade g-d4">
        <circle cx="270" cy="180" r="10" fill="#0a2318" stroke={AC} strokeWidth="2" />
        <circle cx="270" cy="177" r="3.4" fill={BRIGHT} /><path d="M263 188 a7 5 0 0 1 14 0" fill={BRIGHT} />
      </g>
      <text x="140" y="196" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">self-serve</text>
    </Root>
  );
}

/** beachhead-market: a flag on the beachhead; territory pings expand outward. */
export function BeachheadFlag() {
  return (
    <Root mod="beach" label="דגל נעוץ בראש-גשר וטריטוריה שמתרחבת">
      <defs>
        <linearGradient id="bh-land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={AC} stopOpacity="0.32" /><stop offset="100%" stopColor={AC} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {/* territory pings */}
      <g fill="none" stroke={BRIGHT} strokeWidth="1.8" strokeDasharray="4 5">
        <ellipse className="g-ping" cx="160" cy="158" rx="60" ry="30" />
        <ellipse className="g-ping g-d2" cx="160" cy="158" rx="60" ry="30" />
        <ellipse className="g-ping g-d3" cx="160" cy="158" rx="60" ry="30" />
      </g>
      {/* land */}
      <g className="g-fade g-d1">
        <path d="M36 176 Q160 148 284 176 L284 210 L36 210 Z" fill="url(#bh-land)" />
        <path d="M36 176 Q160 148 284 176" fill="none" stroke={AC} strokeWidth="2.4" />
      </g>
      {/* flag */}
      <g className="g-fade g-d2">
        <line x1="160" y1="158" x2="160" y2="92" stroke="#cfe9df" strokeWidth="3" strokeLinecap="round" />
        <path className="g-sway" d="M160 94 L202 106 L160 120 Z" fill={BRIGHT} />
      </g>
      <text x="160" y="72" textAnchor="middle" fontSize="13" fontWeight="800" fill={AC} className="g-fade g-d1">ראש-גשר</text>
    </Root>
  );
}

/** budget-loop: coins continuously pour into the winning channel. */
export function BudgetPipes() {
  const bars = [{ x: 96, h: 34, win: false }, { x: 156, h: 62, win: false }, { x: 214, h: 96, win: true }];
  return (
    <Root mod="budget" label="כסף שזורם אוטומטית לערוץ המנצח">
      <defs>
        <linearGradient id="bp-win" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8affd4" /><stop offset="100%" stopColor="#0c8f60" />
        </linearGradient>
      </defs>
      {/* hopper over the winner */}
      <g className="g-fade g-d1">
        <path d="M198 54 L248 54 L237 74 L209 74 Z" fill="#0a2318" stroke={AC} strokeWidth="2.2" strokeLinejoin="round" />
        <text x="223" y="70" textAnchor="middle" fontSize="12" fontWeight="800" fill={BRIGHT}>₪</text>
      </g>
      {/* pouring coins */}
      <text className="g-drip g-d1" x="223" y="88" textAnchor="middle" fontSize="13" fontWeight="800" fill={BRIGHT}>₪</text>
      <text className="g-drip g-d2" x="223" y="88" textAnchor="middle" fontSize="13" fontWeight="800" fill={BRIGHT}>₪</text>
      {/* bars */}
      {bars.map((b, i) => (
        <g key={b.x} className={`g-fade g-d${2 + i}`}>
          <rect x={b.x} y={176 - b.h} width="42" height={b.h} rx="5"
            fill={b.win ? 'url(#bp-win)' : 'none'} stroke={b.win ? '#8affd4' : MUTE} strokeWidth="2" opacity={b.win ? 1 : 0.55}
            className={b.win ? 'g-pulse' : undefined} />
        </g>
      ))}
      <text x="160" y="200" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d5">למנצח, אוטומטית</text>
    </Root>
  );
}
