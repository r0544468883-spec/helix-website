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

/** dev-and-marketer: two gears finally mesh (dev + marketing in sync). */
export function GearsTalk() {
  return (
    <Root mod="gears" label="שני גלגלי שיניים, פיתוח ושיווק, שנכנסים להילוך יחד">
      <g className="g-pop g-d2">
        <circle cx="126" cy="116" r="22" fill="none" stroke={AC} strokeWidth="9" strokeDasharray="7 7" />
        <circle cx="126" cy="116" r="9" fill="#0e2a20" stroke={AC} strokeWidth="2.4" />
      </g>
      <g className="g-pop g-d3">
        <circle cx="178" cy="116" r="22" fill="none" stroke={BRIGHT} strokeWidth="9" strokeDasharray="7 7" />
        <circle cx="178" cy="116" r="9" fill="#0e2a20" stroke={BRIGHT} strokeWidth="2.4" />
      </g>
      <g className="g-pop g-d4">
        <circle cx="152" cy="72" r="11" fill={AC} />
        <path d="M147 72 l4 4 6 -8" fill="none" stroke="#0e2a20" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <g fontSize="12" textAnchor="middle" className="g-fade g-d4">
        <text x="118" y="170" fill={AC}>פיתוח</text>
        <text x="188" y="170" fill={BRIGHT}>שיווק</text>
      </g>
    </Root>
  );
}

/** ai-content-human: robotic text passes a "human" filter and comes out warm. */
export function RobotToHuman() {
  return (
    <Root mod="human" label="טקסט רובוטי שעובר מסנן אנושי ויוצא חם">
      {/* robot */}
      <g className="g-fade g-d1">
        <rect x="54" y="98" width="42" height="38" rx="7" fill="#14140f" stroke={MUTE} strokeWidth="2" />
        <line x1="75" y1="90" x2="75" y2="98" stroke={MUTE} strokeWidth="2" /><circle cx="75" cy="88" r="2.6" fill={MUTE} />
        <circle cx="67" cy="114" r="3.2" fill={MUTE} /><circle cx="83" cy="114" r="3.2" fill={MUTE} />
        <line x1="64" y1="126" x2="86" y2="126" stroke={MUTE} strokeWidth="2" />
      </g>
      {/* arrow through filter */}
      <path className="g-draw g-d2" pathLength={1} d="M104 117 L150 117" fill="none" stroke={AC} strokeWidth="2.4" strokeLinecap="round" />
      <g className="g-fade g-d2">
        <rect x="152" y="92" width="14" height="50" rx="7" fill="none" stroke={AC} strokeWidth="2" strokeDasharray="3 3" />
        <text x="159" y="162" textAnchor="middle" fontSize="10" fill={AC}>אנושי</text>
      </g>
      {/* warm handwriting */}
      <path className="g-draw g-d3" pathLength={1} d="M182 122 q10 -20 20 0 t20 0 q8 -14 18 -4 t16 2" fill="none" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round" />
      <path className="g-pop g-d4" d="M262 96 c-6 -8 -18 -2 -12 8 l12 12 12 -12 c6 -10 -6 -16 -12 -8 z" fill={BRIGHT} />
    </Root>
  );
}

/** reading-a-campaign: 300 leads sieved down to 3 that actually pay. */
export function SieveCoins() {
  const top = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  return (
    <Root mod="sieve" label="300 לידים שמסתננים ל-3 שמשלמים">
      <g className="g-fade g-d1">
        {top.map((i) => <circle key={i} cx={116 + (i % 5) * 22} cy={56 + Math.floor(i / 5) * 16} r="3" fill={MUTE} />)}
        <text x="96" y="62" textAnchor="end" fontSize="13" fontWeight="800" fill={MUTE}>300</text>
      </g>
      {/* sieve */}
      <g className="g-fade g-d2">
        <path d="M112 92 L208 92 L180 122 L140 122 Z" fill="none" stroke={AC} strokeWidth="2.4" strokeLinejoin="round" />
        <line x1="126" y1="100" x2="194" y2="100" stroke={AC} strokeWidth="1.2" opacity="0.6" />
        <line x1="132" y1="108" x2="188" y2="108" stroke={AC} strokeWidth="1.2" opacity="0.6" />
      </g>
      {/* 3 gold coins fall through */}
      <g fontSize="15" fontWeight="800" textAnchor="middle">
        <text className="g-pop g-d3" x="140" y="168" fill={BRIGHT}>₪</text>
        <text className="g-pop g-d4" x="160" y="176" fill={BRIGHT}>₪</text>
        <text className="g-pop g-d4" x="180" y="168" fill={BRIGHT}>₪</text>
      </g>
      <text x="160" y="204" textAnchor="middle" fontSize="13" fontWeight="800" fill={BRIGHT} className="g-fade g-d5">3 משלמים</text>
    </Root>
  );
}

/** project-spec-guide: a blueprint sheet sealed with a "scope locked" badge. */
export function BlueprintSeal() {
  return (
    <Root mod="spec" label="שרטוט אפיון עם חותמת scope נעול">
      <g className="g-fade g-d1">
        <rect x="78" y="66" width="150" height="112" rx="6" fill="#0e2a20" stroke={AC} strokeWidth="2.2" />
        <g stroke={AC} strokeWidth="0.8" opacity="0.25">
          <line x1="78" y1="94" x2="228" y2="94" /><line x1="78" y1="122" x2="228" y2="122" /><line x1="78" y1="150" x2="228" y2="150" />
          <line x1="118" y1="66" x2="118" y2="178" /><line x1="158" y1="66" x2="158" y2="178" /><line x1="198" y1="66" x2="198" y2="178" />
        </g>
        {/* plan sketch */}
        <path d="M104 140 L104 104 L140 84 L176 104 L176 140" fill="none" stroke={BRIGHT} strokeWidth="2.2" strokeLinejoin="round" />
        <rect x="128" y="118" width="24" height="22" fill="none" stroke={BRIGHT} strokeWidth="1.8" />
      </g>
      {/* locked seal */}
      <g className="g-pop g-d3">
        <circle cx="204" cy="158" r="19" fill={AC} />
        <rect x="197" y="156" width="14" height="11" rx="2" fill="#0e2a20" />
        <path d="M200 156 v-3 a4 4 0 0 1 8 0 v3" fill="none" stroke="#0e2a20" strokeWidth="2" />
      </g>
      <text x="130" y="200" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">scope נעול</text>
    </Root>
  );
}

/** marketing-loop-vs-funnel: a glowing loop beats a draining funnel. */
export function LoopVsFunnel() {
  return (
    <Root mod="loopvs" label="לולאה זוהרת מול משפך מתרוקן">
      {/* loop (winner) */}
      <g className="g-pulse">
        <path className="g-draw g-d1" pathLength={1} d="M96 130 C96 104 128 104 128 130 C128 156 160 156 160 130 C160 104 128 104 128 130" fill="none" stroke={BRIGHT} strokeWidth="3.2" strokeLinecap="round" />
      </g>
      <path className="g-fade g-d2" d="M158 124 l6 4 -7 4 z" fill={BRIGHT} />
      <text x="120" y="172" textAnchor="middle" fontSize="12" fontWeight="800" fill={BRIGHT} className="g-fade g-d2">לופ</text>

      {/* funnel (loser) */}
      <g className="g-fade g-d3" opacity="0.7">
        <path d="M198 96 L262 96 L246 124 L214 124 Z" fill="none" stroke={MUTE} strokeWidth="2.2" strokeLinejoin="round" />
        <line x1="230" y1="124" x2="230" y2="140" stroke={MUTE} strokeWidth="2.2" />
        <circle cx="230" cy="150" r="2.4" fill={MUTE} /><circle cx="224" cy="160" r="2" fill={MUTE} /><circle cx="237" cy="162" r="2" fill={MUTE} />
      </g>
      <text x="230" y="182" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">פאנל</text>
    </Root>
  );
}

/** ai-agents-bd: a lead card auto-enriches its fields. */
export function LeadAutofill() {
  const rows = [98, 120, 142];
  return (
    <Root mod="lead" label="כרטיס ליד שהשדות בו מתמלאים אוטומטית">
      <g className="g-fade g-d1">
        <rect x="84" y="70" width="152" height="106" rx="9" fill="#0e2a20" stroke={AC} strokeWidth="2.2" />
        <circle cx="108" cy="94" r="11" fill="none" stroke={BRIGHT} strokeWidth="2" />
        <circle cx="108" cy="90" r="3.4" fill={BRIGHT} /><path d="M100 102 a8 6 0 0 1 16 0" fill={BRIGHT} />
      </g>
      {/* auto-filling rows */}
      {rows.map((y, i) => (
        <g key={y}>
          <rect x="132" y={y} width="10" height="10" rx="2" fill={AC} className={`g-fade g-d${2 + i}`} />
          <rect x={148} y={y} width={i === 0 ? 74 : i === 1 ? 60 : 68} height="10" rx="3" fill={BRIGHT} opacity="0.85" className={`g-fade g-d${3 + i}`} />
        </g>
      ))}
      {/* bot spark */}
      <g className="g-pulse">
        <path d="M214 150 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2 z" fill={BRIGHT} />
      </g>
      <text x="160" y="196" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d5">העשרה אוטומטית</text>
    </Root>
  );
}
