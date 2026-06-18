'use client';

import FloatingLogos from './FloatingLogos';

export default function LottoBall() {
  return (
    <section className="lotto-section">
      <div className="container">
        <h2 className="lotto-title">הכלים שעובדים בשבילנו</h2>
        <p className="lotto-subtitle">31 כלים. מערכת אחת. הכל תחת קורת גג אחת.</p>
      </div>
      <FloatingLogos />
    </section>
  );
}
