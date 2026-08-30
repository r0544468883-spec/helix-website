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

/** first-month-free: a glossy credit card charged ₪0 bobs, a "30 days free"
 *  seal pulses beside it. The offer in one image: full month, card, zero now. */
export function FirstMonthFreeCard() {
  return (
    <Root mod="fmf" label="כרטיס אשראי מחויב ₪0 עם חותמת חודש ראשון חינם">
      <defs>
        <linearGradient id="fmf-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1f8a63" /><stop offset="100%" stopColor="#0a2b20" />
        </linearGradient>
        <linearGradient id="fmf-chip" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8affd4" /><stop offset="100%" stopColor="#0c8f60" />
        </linearGradient>
        <radialGradient id="fmf-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.28" /><stop offset="100%" stopColor={BRIGHT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="g-breathe" cx="132" cy="122" rx="92" ry="68" fill="url(#fmf-halo)" />

      {/* credit card, gently bobbing */}
      <g className="g-bob g-fade g-d1" transform="rotate(-7 132 122)">
        <rect x="52" y="80" width="160" height="100" rx="14" fill="url(#fmf-card)" stroke="#3fd39b" strokeWidth="2" />
        {/* gloss */}
        <rect x="60" y="88" width="144" height="10" rx="5" fill="#ffffff" opacity="0.07" />
        {/* chip */}
        <rect x="70" y="104" width="26" height="20" rx="4" fill="url(#fmf-chip)" stroke="#0a2b20" strokeWidth="1" />
        <line x1="70" y1="114" x2="96" y2="114" stroke="#0a2b20" strokeWidth="1" opacity="0.5" />
        <line x1="83" y1="104" x2="83" y2="124" stroke="#0a2b20" strokeWidth="1" opacity="0.5" />
        {/* number dots */}
        <g fill="#eafff6" opacity="0.55">
          <circle cx="112" cy="114" r="2.2" /><circle cx="120" cy="114" r="2.2" /><circle cx="128" cy="114" r="2.2" /><circle cx="136" cy="114" r="2.2" />
        </g>
        {/* the charge */}
        <text x="132" y="164" textAnchor="middle" fontSize="30" fontWeight="800" fill="#eafff6">₪0</text>
      </g>

      {/* "30 days free" seal, pulsing */}
      <g className="g-pulse">
        <circle cx="238" cy="70" r="30" fill="#0b241b" stroke={BRIGHT} strokeWidth="2.2" />
        <text x="238" y="66" textAnchor="middle" fontSize="18" fontWeight="800" fill={BRIGHT}>30</text>
        <text x="238" y="82" textAnchor="middle" fontSize="10" fontWeight="700" fill="#9fe9cf">יום חינם</text>
      </g>

      <text x="132" y="212" textAnchor="middle" fontSize="13" fontWeight="800" fill={BRIGHT} className="g-fade g-d2">חודש ראשון חינם</text>
    </Root>
  );
}
