'use client';

import { useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

/**
 * The search-demo video framed in a phone, with an emerald glow and a live
 * caption chip. Autoplays muted + loops; tap the button to hear the narration.
 */
export default function VideoPhone() {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleSound() {
    const v = ref.current;
    if (!v) return;
    const next = !muted;
    v.muted = next;
    if (!next) {
      v.currentTime = 0;
      void v.play();
    }
    setMuted(next);
  }

  return (
    <div className="uo-phone-wrap">
      <span className="uo-live-chip" aria-hidden="true">
        <span className="uo-live-dot" /> חיפוש אמיתי ב-ChatGPT · בני ברק
      </span>
      <div className="uo-phone">
        <video
          ref={ref}
          src="/unique-offer.mp4"
          poster="/unique-offer-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="הדגמה: חיפוש חנות סלולר בבני ברק ב-ChatGPT, והתשובה שהוא נותן"
        />
        <button
          type="button"
          className="uo-sound-btn"
          onClick={toggleSound}
          aria-label={muted ? 'הפעלת הקול' : 'השתקה'}
        >
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          <span>{muted ? 'הפעילו קול' : 'השתיקו'}</span>
        </button>
      </div>
    </div>
  );
}
