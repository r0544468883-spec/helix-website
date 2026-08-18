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

/** transparent-pricing: our price tag is open (₪199); the competitor's is blacked out. */
export function PriceReveal() {
  return (
    <Root mod="price" label="תג מחיר גלוי מול תג מחיר מצונזר של מתחרה">
      {/* ours — visible */}
      <g className="g-pop g-d1">
        <rect x="46" y="94" width="108" height="64" rx="10" fill="#0e2a20" stroke={AC} strokeWidth="2.4" />
        <circle cx="64" cy="112" r="5" fill="none" stroke={AC} strokeWidth="2" />
        <text x="104" y="136" textAnchor="middle" fontSize="26" fontWeight="800" fill={BRIGHT}>₪199</text>
      </g>
      <text x="100" y="182" textAnchor="middle" fontSize="12" fontWeight="700" fill={AC} className="g-fade g-d2">אנחנו</text>

      {/* competitor — censored */}
      <g className="g-fade g-d3">
        <rect x="176" y="100" width="98" height="58" rx="10" fill="#14140f" stroke={MUTE} strokeWidth="2" />
        <circle cx="192" cy="116" r="4.5" fill="none" stroke={MUTE} strokeWidth="1.8" />
        <rect x="204" y="120" width="46" height="7" rx="2" fill={MUTE} />
        <rect x="212" y="132" width="38" height="7" rx="2" fill={MUTE} />
      </g>
      <text x="225" y="182" textAnchor="middle" fontSize="12" fill={MUTE} className="g-fade g-d4">אחרים</text>
    </Root>
  );
}

/** icp: one arrow dead-center in the bullseye; scattered misses are "כולם". */
export function IcpBullseye() {
  return (
    <Root mod="icp" label="מטרת קליעה עם חץ בול במרכז מול חצים מפוזרים">
      {/* scattered misses */}
      <g className="g-fade g-d2" stroke={MUTE} strokeWidth="2" fill="none" opacity="0.7">
        <path d="M232 60 l16 -12 M244 50 l4 -2 -2 4" />
        <path d="M96 74 l-16 -10 M84 66 l-4 -2 2 4" />
        <path d="M250 176 l16 8 M262 182 l4 2 -4 1" />
      </g>
      {/* rings */}
      <g className="g-fade g-d1" fill="none">
        <circle cx="176" cy="118" r="46" stroke={AC} strokeWidth="2" opacity="0.35" />
        <circle cx="176" cy="118" r="32" stroke={AC} strokeWidth="2" opacity="0.55" />
        <circle cx="176" cy="118" r="18" stroke={AC} strokeWidth="2" opacity="0.8" />
        <circle cx="176" cy="118" r="5.5" fill={BRIGHT} />
      </g>
      {/* the arrow that hits */}
      <g className="g-pop g-d3">
        <line x1="118" y1="176" x2="171" y2="123" stroke={BRIGHT} strokeWidth="3.4" strokeLinecap="round" />
        <path d="M171 123 l-11 2 6 -10 z" fill={BRIGHT} />
        <path d="M118 176 l-3 -9 9 3 z" fill={BRIGHT} />
      </g>
      <text x="176" y="200" textAnchor="middle" fontSize="13" fontWeight="800" fill={AC} className="g-fade g-d4">ICP</text>
    </Root>
  );
}

/** attribution: threads from the customer trace back to the source channels. */
export function AttributionThreads() {
  return (
    <Root mod="attr" label="חוטים מהלקוח חוזרים לערוצי המקור">
      {/* customer */}
      <g className="g-fade g-d1">
        <circle cx="250" cy="120" r="15" fill="#0e2a20" stroke={AC} strokeWidth="2.2" />
        <circle cx="250" cy="115" r="4.5" fill={BRIGHT} />
        <path d="M241 128 a9 7 0 0 1 18 0" fill={BRIGHT} />
      </g>
      {/* threads back to sources */}
      <g fill="none" strokeWidth="2.4" strokeLinecap="round">
        <path className="g-draw g-d1" pathLength={1} d="M236 116 C170 92 120 84 78 74" stroke={BRIGHT} />
        <path className="g-draw g-d2" pathLength={1} d="M235 120 C170 120 120 120 82 120" stroke={AC} opacity="0.75" />
        <path className="g-draw g-d3" pathLength={1} d="M236 126 C170 150 120 158 78 168" stroke={AC} opacity="0.55" />
      </g>
      {/* source dots */}
      <g className="g-fade g-d4" fontSize="10" fill="#9fb4ad" textAnchor="end">
        <circle cx="72" cy="74" r="6" fill={BRIGHT} /><text x="64" y="78">חיפוש</text>
        <circle cx="72" cy="120" r="6" fill={AC} /><text x="64" y="124">סושיאל</text>
        <circle cx="72" cy="168" r="6" fill={AC} opacity="0.7" /><text x="64" y="172">מייל</text>
      </g>
      {/* magnifier on the winning source */}
      <g className="g-pop g-d4">
        <circle cx="72" cy="74" r="13" fill="none" stroke={BRIGHT} strokeWidth="2.4" />
        <line x1="82" y1="84" x2="92" y2="94" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round" />
      </g>
    </Root>
  );
}

/** ai-marketing-tools: a clean signal ("עובד") vs faint noise ("באזז"). */
export function SignalVsBuzz() {
  return (
    <Root mod="signal" label="גל אות נקי שעובד מול רעש דהוי של באזז">
      {/* signal */}
      <path className="g-draw g-d1" pathLength={1} d="M60 92 Q90 62 120 92 T180 92 T240 92" fill="none" stroke={BRIGHT} strokeWidth="3.2" strokeLinecap="round" />
      <g className="g-fade g-d2">
        <circle cx="262" cy="92" r="10" fill={AC} />
        <path d="M257 92 l4 4 6 -8" fill="none" stroke="#0e2a20" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="60" y="120" fontSize="13" fontWeight="700" fill={AC}>עובד</text>
      </g>
      {/* noise */}
      <path className="g-fade g-d3" d="M60 168 l14 -18 12 30 14 -34 12 26 14 -22 12 30 14 -26 12 20 14 -14" fill="none" stroke={MUTE} strokeWidth="2.2" strokeLinejoin="round" opacity="0.7" />
      <g className="g-fade g-d4">
        <circle cx="262" cy="160" r="10" fill="none" stroke={MUTE} strokeWidth="2" />
        <path d="M258 156 l8 8 M266 156 l-8 8" stroke={MUTE} strokeWidth="2" strokeLinecap="round" />
        <text x="60" y="196" fontSize="13" fill={MUTE}>באזז</text>
      </g>
    </Root>
  );
}
