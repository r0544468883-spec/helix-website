'use client';

import ScrollReveal from '../ScrollReveal';

// Below-the-hero discount strip on the homepage (mirrors the product/software
// pages): 20% off every service + system for startups, founders & small biz.
export default function HomeDiscountBar() {
  return (
    <section className="hdb-section" aria-label="הנחה לסטארטאפים, יזמים ועסקים קטנים">
      <style>{`
        .hdb-section { padding: clamp(16px, 3vw, 26px) 0; }
        .hdb-section .container { max-width: 1120px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px); }
        .hdb {
          position: relative; overflow: hidden;
          display: flex; align-items: center; justify-content: center; flex-wrap: wrap;
          gap: 10px 18px; text-align: center;
          border: 1px solid rgba(16,185,129,0.30); border-radius: 999px;
          padding: 14px 26px;
          background: linear-gradient(120deg, rgba(16,185,129,0.12), rgba(0,0,0,0.18));
        }
        .hdb::before {
          content: ''; position: absolute; inset-inline-start: -40px; top: -60px;
          width: 180px; height: 180px; border-radius: 50%;
          background: #10B981; filter: blur(75px); opacity: 0.16; pointer-events: none;
        }
        .hdb-badge {
          flex-shrink: 0;
          font-size: 0.72rem; font-weight: 800; color: #000; background: #10B981;
          border-radius: 999px; padding: 5px 13px;
        }
        .hdb-text { font-size: clamp(0.95rem, 2vw, 1.12rem); font-weight: 700; color: #fff; line-height: 1.4; }
        .hdb-text b { color: #34d399; }
        .hdb-sub { font-size: 0.85rem; color: #b9c2bd; font-weight: 500; }
        @media (max-width: 560px) { .hdb { border-radius: 20px; padding: 16px 18px; } }
      `}</style>
      <div className="container">
        <ScrollReveal direction="up">
          <div className="hdb">
            <span className="hdb-badge">סטארטאפים · יזמים · עסקים קטנים</span>
            <span className="hdb-text">
              <b>20% הנחה</b> על כל השירותים והמערכות של HELIX
            </span>
            <span className="hdb-sub">אוטומטית · בלי קוד · בלי תנאים</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
