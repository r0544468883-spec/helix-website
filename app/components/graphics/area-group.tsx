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

/** cohort-retention: a leaking bucket losing drops = silent churn. */
export function LeakyBucket() {
  return (
    <Root mod="bucket" label="דלי מחורר שמאבד טיפות, נטישה שקטה">
      <g className="g-fade g-d1">
        {/* water */}
        <path d="M118 116 L202 116 L194 176 L126 176 Z" fill={AC} opacity="0.28" />
        {/* bucket */}
        <path d="M110 94 L210 94 L194 178 L126 178 Z" fill="none" stroke={AC} strokeWidth="2.6" strokeLinejoin="round" />
        <rect x="104" y="88" width="112" height="9" rx="4" fill={AC} />
        {/* holes */}
        <circle cx="150" cy="150" r="3" fill="#0c1f19" />
        <circle cx="171" cy="160" r="3" fill="#0c1f19" />
      </g>
      {/* dripping loss */}
      <circle className="g-drip g-d1" cx="150" cy="156" r="3.4" fill={BRIGHT} />
      <circle className="g-drip g-d2" cx="171" cy="166" r="3.4" fill={BRIGHT} />
      <text x="160" y="204" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d3">נטישה שקטה</text>
    </Root>
  );
}

/** viral-loop: one node lights two, cascading into a spread tree. */
export function ViralSpread() {
  const L3 = [86, 134, 186, 234];
  return (
    <Root mod="viral" label="node אחד מדליק שניים, התפשטות ויראלית">
      {/* connectors */}
      <g stroke={AC} strokeWidth="1.6" opacity="0.45" className="g-fade g-d2">
        <line x1="160" y1="60" x2="112" y2="108" /><line x1="160" y1="60" x2="208" y2="108" />
        <line x1="112" y1="108" x2="86" y2="164" /><line x1="112" y1="108" x2="134" y2="164" />
        <line x1="208" y1="108" x2="186" y2="164" /><line x1="208" y1="108" x2="234" y2="164" />
      </g>
      {/* nodes cascade */}
      <g className="g-fade g-d1"><circle cx="160" cy="60" r="12" fill={BRIGHT} className="g-pulse" /></g>
      <circle className="g-fade g-d2" cx="112" cy="108" r="8" fill={AC} />
      <circle className="g-fade g-d3" cx="208" cy="108" r="8" fill={AC} />
      {L3.map((x, i) => (
        <circle key={x} className={`g-fade g-d${4 + (i % 2)}`} cx={x} cy="164" r="6" fill={AC} opacity="0.8" />
      ))}
      <text x="184" y="52" fontSize="12" fontWeight="800" fill={BRIGHT} className="g-fade g-d1">k↑</text>
    </Root>
  );
}

/** gtm-israel: an entry arrow threads the market gate, budget intact (no burn). */
export function MarketGate() {
  return (
    <Root mod="gate" label="חץ כניסה שחומק דרך שער צר לשוק, בלי לשרוף תקציב">
      {/* gate posts */}
      <g className="g-fade g-d1">
        <rect x="150" y="72" width="8" height="108" rx="3" fill={AC} />
        <rect x="182" y="72" width="8" height="108" rx="3" fill={AC} />
        <rect x="146" y="66" width="48" height="9" rx="3" fill={AC} />
      </g>
      {/* flag / market beyond */}
      <g className="g-pop g-d4">
        <line x1="238" y1="96" x2="238" y2="140" stroke={AC} strokeWidth="2.4" strokeLinecap="round" />
        <path d="M238 98 L262 106 L238 114 Z" fill={BRIGHT} />
      </g>
      {/* threading arrow */}
      <path className="g-draw g-d2" pathLength={1} d="M52 126 L222 126" fill="none" stroke={BRIGHT} strokeWidth="3.4" strokeLinecap="round" />
      <path className="g-fade g-d3" d="M222 126 l-12 -6 3 6 -3 6 z" fill={BRIGHT} />
      {/* budget coin intact */}
      <g className="g-fade g-d4">
        <circle cx="66" cy="172" r="13" fill="none" stroke={AC} strokeWidth="2.2" />
        <text x="66" y="177" textAnchor="middle" fontSize="13" fontWeight="800" fill={BRIGHT}>₪</text>
        <path d="M77 164 l4 -4 3 3" fill="none" stroke={BRIGHT} strokeWidth="2" strokeLinecap="round" />
      </g>
    </Root>
  );
}
