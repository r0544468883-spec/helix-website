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

/** transparent-pricing: our glossy price tag is open (₪199) and bobs; the
 *  competitor's is censored and faded. */
export function PriceReveal() {
  return (
    <Root mod="price" label="תג מחיר גלוי ₪199 מול תג מצונזר של מתחרה">
      <defs>
        <linearGradient id="pr-tag" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1f8a63" /><stop offset="100%" stopColor="#0a2b20" />
        </linearGradient>
        <radialGradient id="pr-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.3" /><stop offset="100%" stopColor={BRIGHT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="g-breathe" cx="106" cy="126" rx="78" ry="60" fill="url(#pr-halo)" />

      {/* competitor — censored, faded */}
      <g opacity="0.6" transform="rotate(7 222 132)" className="g-fade g-d3">
        <rect x="186" y="112" width="72" height="44" rx="8" fill="#141410" stroke={MUTE} strokeWidth="2" />
        <rect x="196" y="123" width="42" height="7" rx="3" fill={MUTE} /><rect x="204" y="135" width="34" height="7" rx="3" fill={MUTE} />
        <rect x="188" y="106" width="12" height="10" rx="2" fill="none" stroke={MUTE} strokeWidth="1.6" />
        <path d="M191 106 v-3 a3 3 0 0 1 6 0 v3" fill="none" stroke={MUTE} strokeWidth="1.4" />
      </g>
      <text x="224" y="172" textAnchor="middle" fontSize="11" fill={MUTE} className="g-fade g-d4">אחרים</text>

      {/* ours — open, bobbing */}
      <g className="g-bob g-fade g-d1">
        <path d="M74 100 L150 100 Q156 100 156 106 L156 144 Q156 150 150 150 L74 150 L56 125 Z" fill="url(#pr-tag)" stroke="#3fd39b" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="69" cy="125" r="4.5" fill="#0a2b20" stroke="#3fd39b" strokeWidth="1.6" />
        <rect x="80" y="105" width="66" height="9" rx="4" fill="#ffffff" opacity="0.08" />
        <text x="112" y="134" textAnchor="middle" fontSize="25" fontWeight="800" fill="#eafff6">₪199</text>
      </g>
      <text x="106" y="172" textAnchor="middle" fontSize="12" fontWeight="700" fill={BRIGHT} className="g-fade g-d2">גלוי לכולם</text>
    </Root>
  );
}

/** icp: a detailed target; a quivering arrow sits dead-center, misses scatter. */
export function IcpBullseye() {
  return (
    <Root mod="icp" label="מטרת קליעה עם חץ בול במרכז מול חצים מפוזרים">
      <defs>
        <radialGradient id="icp-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.26" /><stop offset="100%" stopColor={BRIGHT} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="g-breathe" cx="176" cy="116" r="70" fill="url(#icp-halo)" />

      {/* scattered misses */}
      <g stroke={MUTE} strokeWidth="2" fill="none" opacity="0.7" className="g-fade g-d2">
        <path d="M240 58 l14 -10 M251 50 l3 -2 -1 4" /><path d="M96 66 l-14 -8 M85 60 l-3 -2 1 4" />
      </g>

      {/* target rings */}
      <g className="g-fade g-d1">
        <circle cx="176" cy="116" r="50" fill="#0b241b" stroke={AC} strokeWidth="1" strokeOpacity="0.5" />
        <circle cx="176" cy="116" r="38" fill="#134a37" />
        <circle cx="176" cy="116" r="26" fill="#0b241b" />
        <circle cx="176" cy="116" r="14" fill="#155c44" />
        <circle className="g-pulse" cx="176" cy="116" r="6" fill={BRIGHT} />
        <path d="M156 96 q20 -8 40 0" fill="none" stroke="#fff" strokeWidth="1.6" opacity="0.08" />
      </g>

      {/* arrow that hit (quivers) */}
      <g className="g-sway">
        <g className="g-fade g-d3">
          <line x1="120" y1="172" x2="170" y2="122" stroke="#cfe9df" strokeWidth="3.2" strokeLinecap="round" />
          <path d="M170 122 l-12 1 6 -10 z" fill={BRIGHT} />
          <g stroke={BRIGHT} strokeWidth="2" strokeLinecap="round">
            <path d="M120 172 l-9 -1 4 8" fill="none" /><path d="M124 168 l-9 -1 4 8" fill="none" />
          </g>
        </g>
      </g>
      <text x="176" y="204" textAnchor="middle" fontSize="13" fontWeight="800" fill={BRIGHT} className="g-fade g-d4">ICP</text>
    </Root>
  );
}

/** attribution: source→customer threads with marching flow reveal the origin. */
export function AttributionThreads() {
  return (
    <Root mod="attr" label="חוטים מהמקורות אל הלקוח חושפים מאיפה הגיע">
      <defs>
        <radialGradient id="at-cust" cx="40%" cy="34%" r="70%">
          <stop offset="0%" stopColor="#8affd4" /><stop offset="100%" stopColor="#0c8f60" />
        </radialGradient>
      </defs>

      {/* flowing threads */}
      <g fill="none" strokeWidth="2.6" strokeLinecap="round" strokeDasharray="6 6">
        <path className="g-flow" d="M84 74 C150 84 190 100 236 116" stroke={BRIGHT} />
        <path className="g-flow" d="M84 120 C150 120 190 118 236 120" stroke={AC} opacity="0.7" />
        <path className="g-flow" d="M84 166 C150 156 190 138 236 124" stroke={AC} opacity="0.5" />
      </g>

      {/* source nodes */}
      <g className="g-fade g-d2" fontSize="10" fill="#9fb4ad" textAnchor="end">
        <circle cx="76" cy="74" r="7" fill={BRIGHT} /><text x="66" y="78">חיפוש</text>
        <circle cx="76" cy="120" r="7" fill={AC} /><text x="66" y="124">סושיאל</text>
        <circle cx="76" cy="166" r="7" fill={AC} opacity="0.7" /><text x="66" y="170">מייל</text>
      </g>

      {/* magnifier on the winning source */}
      <g className="g-pulse">
        <circle cx="76" cy="74" r="13" fill="none" stroke={BRIGHT} strokeWidth="2.4" />
        <line x1="86" y1="84" x2="95" y2="93" stroke={BRIGHT} strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* customer */}
      <g className="g-fade g-d1">
        <circle cx="248" cy="120" r="17" fill="url(#at-cust)" stroke="#eafff6" strokeOpacity="0.4" strokeWidth="1" />
        <circle cx="248" cy="114" r="5" fill="#06160f" opacity="0.55" />
        <path d="M238 130 a10 8 0 0 1 20 0" fill="#06160f" opacity="0.55" />
      </g>
    </Root>
  );
}

/** ai-marketing-tools: a live glowing signal ("עובד") vs faint noise ("באזז"). */
export function SignalVsBuzz() {
  const wave = 'M56 92 Q86 62 116 92 T176 92 T236 92';
  return (
    <Root mod="signal" label="גל אות חי שעובד מול רעש דהוי של באזז">
      <defs>
        <linearGradient id="sig-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BRIGHT} stopOpacity="0.28" /><stop offset="100%" stopColor={BRIGHT} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* signal */}
      <path className="g-fade g-d1" d={`${wave} L236 116 L56 116 Z`} fill="url(#sig-fill)" />
      <path className="g-fade g-d1" d={wave} fill="none" stroke={BRIGHT} strokeWidth="3.2" strokeLinecap="round" />
      <circle r="3.6" fill="#eafff6">
        <animateMotion dur="2.6s" repeatCount="indefinite" path={wave} />
      </circle>
      <g className="g-fade g-d2">
        <circle cx="260" cy="92" r="10" fill={AC} />
        <path d="M255 92 l4 4 6 -8" fill="none" stroke="#06160f" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <text x="56" y="118" fontSize="13" fontWeight="700" fill={AC}>עובד</text>
      </g>
      {/* noise */}
      <path className="g-blink" d="M56 168 l14 -18 12 30 14 -34 12 26 14 -22 12 30 14 -26 12 20 14 -14" fill="none" stroke={MUTE} strokeWidth="2.2" strokeLinejoin="round" opacity="0.65" />
      <g className="g-fade g-d4">
        <circle cx="260" cy="160" r="10" fill="none" stroke={MUTE} strokeWidth="2" />
        <path d="M256 156 l8 8 M264 156 l-8 8" stroke={MUTE} strokeWidth="2" strokeLinecap="round" />
        <text x="56" y="196" fontSize="13" fill={MUTE}>באזז</text>
      </g>
    </Root>
  );
}
