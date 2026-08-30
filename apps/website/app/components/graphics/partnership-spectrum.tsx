'use client';

import { useInView } from './useInView';

const MKT = '#10B981';  // תוכנית שותפים — green
const MID = '#F5A623';  // משווק — amber
const WL = '#6366F1';   // White Label — indigo

/** partnership-spectrum: the "customer-ownership axis". A gradient bar runs from
 *  the referral end (you own the customer, green) to the White-Label end (the
 *  partner owns the customer, indigo), with the in-between styles marked. */
export function PartnershipSpectrum() {
  const { ref, inView } = useInView<SVGSVGElement>();
  return (
    <svg
      ref={ref}
      className={`artgfx artgfx--partnership${inView ? ' is-in' : ''}`}
      viewBox="0 0 320 240"
      role="img"
      aria-label="ציר הבעלות על הלקוח: מצד תוכנית שותפים (אתה מחזיק בלקוח ובמותג) ועד White Label (השותף מחזיק בלקוח ובמותג), עם שלבי הביניים אפיליאייט, הפניה, משווק ומיתוג פרטי"
    >
      <defs>
        <linearGradient id="ps-bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={MKT} />
          <stop offset="50%" stopColor={MID} />
          <stop offset="100%" stopColor={WL} />
        </linearGradient>
        <linearGradient id="ps-mkt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#12d597" /><stop offset="100%" stopColor="#0c8f60" />
        </linearGradient>
        <linearGradient id="ps-wl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8b8ff5" /><stop offset="100%" stopColor="#4f52d4" />
        </linearGradient>
      </defs>

      <text className="g-fade" x="160" y="30" textAnchor="middle" fontSize="12" fontWeight="700" fill="#BBCABE">
        מי מחזיק בקשר עם הלקוח
      </text>

      {/* two anchor chips */}
      <g className="g-pop">
        <rect x="16" y="48" width="126" height="36" rx="11" fill="url(#ps-mkt)" stroke="#eafff6" strokeOpacity="0.3" />
        <text x="79" y="71" textAnchor="middle" fontSize="12.5" fontWeight="800" fill="#06160f">תוכנית שותפים</text>
      </g>
      <g className="g-pop g-d2">
        <rect x="178" y="48" width="126" height="36" rx="11" fill="url(#ps-wl)" stroke="#eef0ff" strokeOpacity="0.3" />
        <text x="241" y="71" textAnchor="middle" fontSize="13.5" fontWeight="800" fill="#0b0d2a">White Label</text>
      </g>

      {/* connectors from chips down to the bar ends */}
      <line className="g-fade g-d2" x1="79" y1="84" x2="40" y2="118" stroke={MKT} strokeWidth="1.5" strokeOpacity="0.5" />
      <line className="g-fade g-d3" x1="241" y1="84" x2="280" y2="118" stroke={WL} strokeWidth="1.5" strokeOpacity="0.5" />

      {/* who-owns end labels */}
      <text className="g-fade g-d2" x="26" y="108" textAnchor="start" fontSize="9" fontWeight="700" fill={MKT}>אתה מחזיק</text>
      <text className="g-fade g-d3" x="294" y="108" textAnchor="end" fontSize="9" fontWeight="700" fill={WL}>השותף מחזיק</text>

      {/* the spectrum bar */}
      <rect className="g-draw g-d2" x="24" y="120" width="272" height="15" rx="7.5" fill="url(#ps-bar)" pathLength={1} />
      {/* outward arrowheads at the extremes */}
      <polygon className="g-fade g-d2" points="24,120 14,127.5 24,135" fill={MKT} />
      <polygon className="g-fade g-d3" points="296,120 306,127.5 296,135" fill={WL} />

      {/* stage ticks on the bar */}
      <circle className="g-pop g-d3" cx="62" cy="127.5" r="3.4" fill="#fff" stroke={MKT} strokeWidth="1.5" />
      <circle className="g-pop g-d4" cx="160" cy="127.5" r="3.4" fill="#fff" stroke={MID} strokeWidth="1.5" />
      <circle className="g-pop g-d5" cx="258" cy="127.5" r="3.4" fill="#fff" stroke={WL} strokeWidth="1.5" />

      {/* traveling marker: rides the bar left↔right, reads the whole spectrum */}
      <g className="g-travel">
        <g className="g-fadeonly g-d5">
          <circle cx="30" cy="127.5" r="9" fill="#fff" opacity="0.16" />
          <circle cx="30" cy="127.5" r="5.2" fill="#fff" stroke="#0b0d2a" strokeOpacity="0.2" strokeWidth="1" />
        </g>
      </g>

      {/* zone labels under the bar */}
      <text className="g-fade g-d3" x="62" y="158" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={MKT}>הפניה</text>
      <text className="g-fade g-d4" x="160" y="158" textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#c98a1e">משווק · VAR</text>
      <text className="g-fade g-d5" x="258" y="158" textAnchor="middle" fontSize="9.5" fontWeight="700" fill={WL}>מיתוג פרטי</text>

      {/* bottom caption */}
      <text className="g-fade g-d5" x="160" y="192" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#869489">
        ככל שמימין, מוותרים על המותג תמורת נפח
      </text>
    </svg>
  );
}
