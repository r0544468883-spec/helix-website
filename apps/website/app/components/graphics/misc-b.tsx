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

function Gear({ cx, cy, r, grad, spin }: { cx: number; cy: number; r: number; grad: string; spin: string }) {
  return (
    <g className={spin}>
      {Array.from({ length: 8 }).map((_, i) => (
        <rect key={i} x={cx - 3.5} y={cy - r - 7} width="7" height="10" rx="1.5" fill={`url(#${grad})`} transform={`rotate(${i * 45} ${cx} ${cy})`} />
      ))}
      <circle cx={cx} cy={cy} r={r} fill={`url(#${grad})`} stroke="#06160f" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r={r * 0.42} fill="#06160f" />
      <circle cx={cx} cy={cy} r={r * 0.42} fill="none" stroke={`url(#${grad})`} strokeWidth="2" />
    </g>
  );
}

/** dev-and-marketer: two meshing gears turn together, dev + marketing in sync. */
export function GearsTalk() {
  return (
    <Root mod="gears" label="שני גלגלי שיניים מסתובבים יחד, פיתוח ושיווק בסנכרון">
      <defs>
        <linearGradient id="gr-a" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#3fd39b" /><stop offset="100%" stopColor="#0c6f4f" /></linearGradient>
        <linearGradient id="gr-b" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#8affd4" /><stop offset="100%" stopColor="#0c8f60" /></linearGradient>
      </defs>
      <g className="g-fade g-d2"><Gear cx={126} cy={118} r={20} grad="gr-a" spin="g-spin" /></g>
      <g className="g-fade g-d3"><Gear cx={178} cy={118} r={20} grad="gr-b" spin="g-spin-rev" /></g>
      <g className="g-pop g-d4">
        <circle cx="152" cy="74" r="11" fill={AC} />
        <path d="M147 74 l4 4 6 -8" fill="none" stroke="#06160f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g fontSize="12" textAnchor="middle" className="g-fade g-d4">
        <text x="118" y="168" fill={AC} fontWeight="700">פיתוח</text>
        <text x="190" y="168" fill={BRIGHT} fontWeight="700">שיווק</text>
      </g>
    </Root>
  );
}

/** ai-content-human: robotic text passes a human filter, coming out warm. */
export function RobotToHuman() {
  const script = 'M182 122 q9 -18 18 0 t18 0 q7 -13 16 -4 t16 3';
  return (
    <Root mod="human" label="טקסט רובוטי שעובר מסנן אנושי ויוצא חם">
      <defs>
        <linearGradient id="rb-head" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2a2a2a" /><stop offset="100%" stopColor="#111" /></linearGradient>
      </defs>
      {/* robot */}
      <g className="g-fade g-d1">
        <line x1="75" y1="88" x2="75" y2="98" stroke={MUTE} strokeWidth="2" />
        <circle className="g-blink" cx="75" cy="86" r="3" fill={MUTE} />
        <rect x="54" y="98" width="42" height="38" rx="8" fill="url(#rb-head)" stroke={MUTE} strokeWidth="2" />
        <circle cx="67" cy="114" r="3.4" fill={MUTE} /><circle cx="83" cy="114" r="3.4" fill={MUTE} />
        <rect x="64" y="124" width="22" height="3" rx="1.5" fill={MUTE} />
      </g>
      {/* filter */}
      <path className="g-flow" d="M104 117 L150 117" fill="none" stroke={AC} strokeWidth="2.4" strokeLinecap="round" strokeDasharray="4 4" />
      <g className="g-fade g-d2">
        <rect x="151" y="94" width="16" height="48" rx="8" fill="#0e2a20" stroke={AC} strokeWidth="2" />
        <text x="159" y="160" textAnchor="middle" fontSize="10" fill={AC}>אנושי</text>
      </g>
      {/* warm handwriting continuously flowing */}
      <path className="g-flow" d={script} fill="none" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round" strokeDasharray="40 60" />
      <circle r="2.6" fill="#eafff6"><animateMotion dur="2.4s" repeatCount="indefinite" path={script} /></circle>
      {/* heart */}
      <path className="g-pulse" d="M262 96 c-6 -8 -18 -2 -12 8 l12 12 12 -12 c6 -10 -6 -16 -12 -8 z" fill={BRIGHT} />
    </Root>
  );
}

/** reading-a-campaign: 300 leads pour into a sieve; only 3 gold coins pass. */
export function SieveCoins() {
  const top = Array.from({ length: 9 });
  return (
    <Root mod="sieve" label="300 לידים שנשפכים למסננת ורק 3 משלמים עוברים">
      <defs>
        <linearGradient id="sv-coin" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#ffe08a" /><stop offset="100%" stopColor="#e0a422" /></linearGradient>
      </defs>
      <text x="94" y="60" textAnchor="end" fontSize="13" fontWeight="800" fill={MUTE} className="g-fade g-d1">300</text>
      {top.map((_, i) => (
        <circle key={i} className={`g-drip g-d${(i % 2) + 1}`} cx={116 + (i % 5) * 22} cy={50 + Math.floor(i / 5) * 14} r="3" fill={MUTE} />
      ))}
      {/* sieve */}
      <g className="g-fade g-d2">
        <path d="M108 90 L212 90 L182 122 L138 122 Z" fill="#0e2a20" stroke={AC} strokeWidth="2.4" strokeLinejoin="round" />
        <g stroke={AC} strokeWidth="1" opacity="0.5"><line x1="122" y1="100" x2="198" y2="100" /><line x1="130" y1="110" x2="190" y2="110" /></g>
      </g>
      {/* 3 gold coins */}
      <g className="g-bob">
        {[142, 160, 178].map((x, i) => (
          <g key={x}><circle cx={x} cy={i === 1 ? 168 : 160} r="8" fill="url(#sv-coin)" stroke="#b9821a" strokeWidth="1" />
            <text x={x} y={(i === 1 ? 168 : 160) + 4} textAnchor="middle" fontSize="9" fontWeight="800" fill="#7a5510">₪</text></g>
        ))}
      </g>
      <text x="160" y="204" textAnchor="middle" fontSize="13" fontWeight="800" fill="#f5c451" className="g-fade g-d5">3 משלמים</text>
    </Root>
  );
}

/** project-spec-guide: a blueprint sealed with a pulsing "scope locked" badge. */
export function BlueprintSeal() {
  return (
    <Root mod="spec" label="שרטוט אפיון חתום בחותמת scope נעול">
      <defs>
        <linearGradient id="bp-sheet" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#123f2f" /><stop offset="100%" stopColor="#081b14" /></linearGradient>
        <radialGradient id="bp-seal" cx="40%" cy="34%" r="70%"><stop offset="0%" stopColor="#3fd39b" /><stop offset="100%" stopColor="#0c6f4f" /></radialGradient>
      </defs>
      <g className="g-fade g-d1">
        <rect x="78" y="66" width="150" height="112" rx="6" fill="url(#bp-sheet)" stroke={AC} strokeWidth="2.2" />
        <g stroke={AC} strokeWidth="0.7" opacity="0.2">
          {[94, 122, 150].map((y) => <line key={y} x1="78" y1={y} x2="228" y2={y} />)}
          {[118, 158, 198].map((x) => <line key={x} x1={x} y1="66" x2={x} y2="178" />)}
        </g>
        <path d="M104 142 L104 104 L140 84 L176 104 L176 142" fill="none" stroke={BRIGHT} strokeWidth="2.4" strokeLinejoin="round" />
        <rect x="128" y="118" width="24" height="24" fill="none" stroke={BRIGHT} strokeWidth="1.8" />
        {/* dimension line */}
        <g stroke="#8affd4" strokeWidth="1" opacity="0.7"><line x1="104" y1="156" x2="176" y2="156" /><path d="M104 153 l0 6 M176 153 l0 6" /></g>
      </g>
      {/* seal */}
      <g className="g-pulse">
        <circle cx="206" cy="158" r="20" fill="url(#bp-seal)" stroke="#eafff6" strokeOpacity="0.4" strokeWidth="1" />
        <rect x="199" y="156" width="14" height="11" rx="2" fill="#06160f" />
        <path d="M202 156 v-3 a4 4 0 0 1 8 0 v3" fill="none" stroke="#06160f" strokeWidth="2" />
      </g>
      <text x="128" y="200" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">scope נעול</text>
    </Root>
  );
}

/** marketing-loop-vs-funnel: a glowing loop (particle circling) beats a draining funnel. */
export function LoopVsFunnel() {
  const loop = 'M96 120 C96 98 130 98 130 120 C130 142 164 142 164 120 C164 98 130 98 130 120 C130 142 96 142 96 120 Z';
  return (
    <Root mod="loopvs" label="לולאה זוהרת עם ניצוץ שמקיף מול משפך מתרוקן">
      <g className="g-fade g-d1">
        <path d={loop} fill="none" stroke={BRIGHT} strokeWidth="3.4" strokeLinecap="round" />
        <circle r="4" fill="#eafff6"><animateMotion dur="2.6s" repeatCount="indefinite" path={loop} /></circle>
      </g>
      <text x="128" y="172" textAnchor="middle" fontSize="12" fontWeight="800" fill={BRIGHT} className="g-fade g-d2">לופ</text>

      <g className="g-fade g-d3" opacity="0.7">
        <path d="M196 92 L262 92 L246 122 L212 122 Z" fill="#0e2a20" stroke={MUTE} strokeWidth="2.2" strokeLinejoin="round" />
        <line x1="229" y1="122" x2="229" y2="138" stroke={MUTE} strokeWidth="2.2" />
        <circle className="g-drip g-d1" cx="229" cy="146" r="2.6" fill={MUTE} />
        <circle className="g-drip g-d2" cx="229" cy="146" r="2.6" fill={MUTE} />
      </g>
      <text x="229" y="182" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">פאנל</text>
    </Root>
  );
}

/** ai-agents-bd: a lead card whose fields auto-enrich on a loop. */
export function LeadAutofill() {
  const rows = [{ y: 100, w: 74 }, { y: 122, w: 60 }, { y: 144, w: 68 }];
  return (
    <Root mod="lead" label="כרטיס ליד שהשדות בו מתמלאים אוטומטית שוב ושוב">
      <defs>
        <linearGradient id="ld-card" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#123f2f" /><stop offset="100%" stopColor="#081b14" /></linearGradient>
        <radialGradient id="ld-av" cx="40%" cy="34%" r="70%"><stop offset="0%" stopColor="#8affd4" /><stop offset="100%" stopColor="#0c8f60" /></radialGradient>
      </defs>
      <g className="g-fade g-d1">
        <rect x="84" y="70" width="152" height="106" rx="10" fill="url(#ld-card)" stroke={AC} strokeWidth="2.2" />
        <circle cx="108" cy="94" r="12" fill="url(#ld-av)" />
        <circle cx="108" cy="90" r="3.6" fill="#06160f" opacity="0.5" /><path d="M100 102 a8 6 0 0 1 16 0" fill="#06160f" opacity="0.5" />
      </g>
      {rows.map((r, i) => (
        <g key={r.y}>
          <rect x="132" y={r.y} width="10" height="10" rx="2" fill={AC} className={`g-fade g-d${2 + i}`} />
          <rect x="148" y={r.y} width={r.w} height="10" rx="3" fill={BRIGHT} opacity="0.9" className={`g-cycle g-d${i + 1}`} />
        </g>
      ))}
      <g className="g-pulse"><path d="M214 156 l2.4 6 6 2.4 -6 2.4 -2.4 6 -2.4 -6 -6 -2.4 6 -2.4 z" fill={BRIGHT} /></g>
      <text x="160" y="196" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d5">העשרה אוטומטית</text>
    </Root>
  );
}
