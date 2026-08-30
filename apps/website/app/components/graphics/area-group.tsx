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

/** cohort-retention: a metal bucket leaks drops (silent churn) into a rippling puddle. */
export function LeakyBucket() {
  return (
    <Root mod="bucket" label="דלי מחורר שמאבד טיפות, נטישה שקטה">
      <defs>
        <linearGradient id="bk-metal" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0a2318" /><stop offset="45%" stopColor="#1c5b45" /><stop offset="100%" stopColor="#0a2318" />
        </linearGradient>
        <linearGradient id="bk-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3fd39b" stopOpacity="0.6" /><stop offset="100%" stopColor={AC} stopOpacity="0.25" />
        </linearGradient>
      </defs>

      {/* bucket */}
      <g className="g-fade g-d1">
        <path d="M118 116 L202 116 L194 172 L126 172 Z" fill="url(#bk-water)" />
        <path d="M120 116 Q160 122 200 116" fill="none" stroke="#8affd4" strokeWidth="1.6" opacity="0.7" />
        <path d="M110 94 L210 94 L194 174 L126 174 Z" fill="url(#bk-metal)" fillOpacity="0.35" stroke="#3fd39b" strokeWidth="2.4" strokeLinejoin="round" />
        <ellipse cx="160" cy="94" rx="50" ry="8" fill="none" stroke="#3fd39b" strokeWidth="2.4" />
        <ellipse cx="160" cy="94" rx="50" ry="8" fill="#0a2318" fillOpacity="0.5" />
        <circle cx="149" cy="150" r="3" fill="#06120d" /><circle cx="171" cy="158" r="3" fill="#06120d" />
      </g>

      {/* drips */}
      <circle className="g-drip g-d1" cx="149" cy="156" r="3.4" fill={BRIGHT} />
      <circle className="g-drip g-d2" cx="171" cy="164" r="3.4" fill={BRIGHT} />

      {/* puddle + ripple */}
      <ellipse cx="160" cy="198" rx="26" ry="5" fill={AC} opacity="0.3" />
      <ellipse className="g-ping" cx="160" cy="198" rx="18" ry="4" fill="none" stroke={BRIGHT} strokeWidth="1.6" />
      <text x="160" y="222" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d3">נטישה שקטה</text>
    </Root>
  );
}

/** viral-loop: sparks travel the tree continuously as each node lights the next. */
export function ViralSpread() {
  const edges = [
    'M160 62 L112 106', 'M160 62 L208 106',
    'M112 106 L86 160', 'M112 106 L134 160', 'M208 106 L186 160', 'M208 106 L234 160',
  ];
  const L3 = [86, 134, 186, 234];
  return (
    <Root mod="viral" label="ניצוצות שרצים בעץ, כל node מדליק את הבא">
      <defs>
        <radialGradient id="v-node" cx="40%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#8affd4" /><stop offset="100%" stopColor="#0c8f60" />
        </radialGradient>
        <radialGradient id="v-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.4" /><stop offset="100%" stopColor={BRIGHT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="g-breathe" cx="160" cy="66" r="34" fill="url(#v-halo)" />

      {/* connectors */}
      <g stroke={AC} strokeWidth="1.6" opacity="0.4" className="g-fade g-d1">
        {edges.map((d, i) => <path key={i} d={d} fill="none" />)}
      </g>
      {/* traveling sparks */}
      {edges.map((d, i) => (
        <circle key={i} r="2.6" fill={BRIGHT}>
          <animateMotion dur="1.6s" begin={`${(i % 2) * 0.5}s`} repeatCount="indefinite" path={d} />
        </circle>
      ))}

      {/* nodes */}
      <circle className="g-fade g-d2" cx="112" cy="106" r="8" fill="url(#v-node)" />
      <circle className="g-fade g-d2" cx="208" cy="106" r="8" fill="url(#v-node)" />
      {L3.map((x) => <circle key={x} className="g-fade g-d3" cx={x} cy="160" r="6" fill={AC} opacity="0.85" />)}
      <circle className="g-fade g-d1 g-pulse" cx="160" cy="62" r="12" fill="url(#v-node)" stroke="#eafff6" strokeOpacity="0.4" strokeWidth="1" />
      <text x="186" y="52" fontSize="12" fontWeight="800" fill={BRIGHT} className="g-fade g-d1">k↑</text>
    </Root>
  );
}

/** gtm-israel: a spark threads the market gate to a waving flag; budget stays intact. */
export function MarketGate() {
  const arrow = 'M52 126 L214 126';
  return (
    <Root mod="gate" label="ניצוץ שחומק דרך שער השוק לדגל, בלי לשרוף תקציב">
      <defs>
        <linearGradient id="gt-post" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0a2318" /><stop offset="50%" stopColor="#1c6b51" /><stop offset="100%" stopColor="#0a2318" />
        </linearGradient>
      </defs>

      {/* gate */}
      <g className="g-fade g-d1">
        <path d="M146 78 Q160 62 174 78" fill="none" stroke={AC} strokeWidth="3" />
        <rect x="147" y="76" width="9" height="104" rx="3" fill="url(#gt-post)" stroke="#3fd39b" strokeWidth="1.4" />
        <rect x="164" y="76" width="9" height="104" rx="3" fill="url(#gt-post)" stroke="#3fd39b" strokeWidth="1.4" />
      </g>

      {/* flag beyond, waving */}
      <g className="g-fade g-d4">
        <line x1="238" y1="94" x2="238" y2="150" stroke={AC} strokeWidth="2.6" strokeLinecap="round" />
        <path className="g-sway" d="M238 96 L264 104 L238 112 Z" fill={BRIGHT} />
      </g>

      {/* threading arrow + spark */}
      <path className="g-flow g-fade g-d2" d={arrow} fill="none" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round" strokeDasharray="7 7" />
      <path className="g-fade g-d3" d="M214 126 l-12 -6 3 6 -3 6 z" fill={BRIGHT} />
      <circle r="3.4" fill="#eafff6"><animateMotion dur="2s" repeatCount="indefinite" path={arrow} /></circle>

      {/* budget intact */}
      <g className="g-fade g-d4">
        <circle cx="66" cy="176" r="14" fill="#0a2318" stroke={AC} strokeWidth="2" />
        <text x="66" y="181" textAnchor="middle" fontSize="14" fontWeight="800" fill={BRIGHT}>₪</text>
        <path d="M78 168 l4 -4 3 3" fill="none" stroke={BRIGHT} strokeWidth="2" strokeLinecap="round" />
      </g>
      <text x="160" y="206" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">חדירה לשוק</text>
    </Root>
  );
}
