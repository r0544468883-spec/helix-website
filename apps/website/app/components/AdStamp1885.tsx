'use client';

import { useEffect, useRef, useState } from 'react';

// Bespoke graphic for the "Rule of Seven / 1885" article card.
// A vintage newspaper-ad clipping, stamped over and over ("נראה") until it
// finally lands on a bold emerald "×20 · נמכר" rubber stamp, the visual thesis
// of Thomas Smith's 1885 rule: nobody buys on the first sight.
// On scroll-in, the faint stamps fade up and the hero stamp "slams" onto the ad.
export default function AdStamp1885() {
  const ref = useRef<SVGSVGElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setInView(true), io.disconnect()),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <svg
      ref={ref}
      className={`adstamp-svg${inView ? ' is-in' : ''}`}
      viewBox="0 0 320 240"
      role="img"
      aria-label="מודעת פרסום מ-1885 עם חותמות ״נראה״ חוזרות וחותמת ״SOLD ×20״"
    >
      {/* aged paper clipping */}
      <g className="adstamp-paper">
        <g transform="rotate(-2.6 160 120)">
          <rect x="52" y="40" width="216" height="160" rx="3" fill="#ece0c4" />
          <rect x="52" y="40" width="216" height="160" rx="3" fill="none" stroke="#b7a884" strokeWidth="1.4" />
          <rect x="60" y="48" width="200" height="144" rx="1.5" fill="none" stroke="#8f7f57" strokeWidth="0.9" />

          <text x="160" y="74" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="9.5" letterSpacing="2.5" fill="#7c6c47">· ESTABLISHED 1885 ·</text>
          <text x="160" y="106" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="25" fontWeight="700" letterSpacing="0.5" fill="#2b2415">SUCCESSFUL</text>
          <text x="160" y="132" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="19" letterSpacing="1.5" fill="#2b2415">ADVERTISING</text>
          <line x1="98" y1="146" x2="222" y2="146" stroke="#8f7f57" strokeWidth="0.9" />
          <text x="160" y="164" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="10" letterSpacing="1" fill="#7c6c47">THOS. SMITH — LONDON</text>
          <text x="160" y="182" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="8.5" fontStyle="italic" fill="#9a8a63">the original manual of advertising</text>
        </g>
      </g>

      {/* faint prior "seen" stamps, fade up in sequence */}
      <g className="adstamp-seen adstamp-seen-1" stroke="#c15b3c" fill="none">
        <g transform="rotate(-19 92 88)">
          <circle cx="92" cy="88" r="26" strokeWidth="1.6" />
          <circle cx="92" cy="88" r="21" strokeWidth="0.8" />
          <text x="92" y="86" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="700" fill="#c15b3c" stroke="none">נראה</text>
          <text x="92" y="98" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#c15b3c" stroke="none">×7</text>
        </g>
      </g>
      <g className="adstamp-seen adstamp-seen-2" stroke="#c15b3c" fill="none">
        <g transform="rotate(13 250 78)">
          <circle cx="250" cy="78" r="23" strokeWidth="1.5" />
          <circle cx="250" cy="78" r="18.5" strokeWidth="0.8" />
          <text x="250" y="76" textAnchor="middle" fontFamily="Georgia, serif" fontSize="10" fontWeight="700" fill="#c15b3c" stroke="none">נראה</text>
          <text x="250" y="87" textAnchor="middle" fontFamily="Georgia, serif" fontSize="7.5" fill="#c15b3c" stroke="none">×14</text>
        </g>
      </g>

      {/* hero "sold ×20" stamp, slams onto the ad on scroll-in */}
      <g className="adstamp-hero">
        <circle cx="214" cy="176" r="47" fill="#0c1f19" fillOpacity="0.55" />
        <circle cx="214" cy="176" r="45" fill="none" stroke="#10B981" strokeWidth="2.6" />
        <circle cx="214" cy="176" r="38.5" fill="none" stroke="#10B981" strokeWidth="1" />
        <text x="214" y="170" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="30" fontWeight="800" fill="#12d597" letterSpacing="0.5">×20</text>
        <text x="214" y="192" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="15" fontWeight="700" letterSpacing="4" fill="#12d597">SOLD</text>
        <line x1="180" y1="178" x2="248" y2="178" stroke="#10B981" strokeWidth="0.8" opacity="0.5" />
      </g>
    </svg>
  );
}
