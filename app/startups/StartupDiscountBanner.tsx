'use client';

import ScrollReveal from '../components/ScrollReveal';

// באנר שמובן בכל דפי הסטארטאפים: 20% הנחה אוטומטית + HELIX STAGE חינם.
export default function StartupDiscountBanner() {
  return (
    <section className="sdb-section">
      <style>{`
        .sdb-section { padding: clamp(28px, 5vw, 44px) 0; }
        .sdb-section .container { max-width: 1120px; margin: 0 auto; padding: 0 clamp(16px, 4vw, 32px); }
        .sdb { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 720px) { .sdb { grid-template-columns: 1fr; } }
        .sdb-card { position: relative; border: 1px solid rgba(16,185,129,0.28); border-radius: 18px; padding: 24px 26px; background: linear-gradient(150deg, rgba(16,185,129,0.09), rgba(0,0,0,0.18)); overflow: hidden; }
        .sdb-card::before { content: ''; position: absolute; top: -50px; inset-inline-start: -50px; width: 160px; height: 160px; border-radius: 50%; background: #10B981; filter: blur(70px); opacity: 0.16; pointer-events: none; }
        .sdb-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 0.72rem; font-weight: 800; color: #000; background: #10B981; border-radius: 999px; padding: 4px 12px; margin-bottom: 12px; }
        .sdb-title { font-size: clamp(1.4rem, 3vw, 1.9rem); font-weight: 800; color: #fff; line-height: 1.15; margin-bottom: 8px; }
        .sdb-title span { color: #34d399; }
        .sdb-text { font-size: 0.9rem; color: #b9c2bd; line-height: 1.6; }
      `}</style>
      <div className="container">
        <ScrollReveal direction="up" stagger staggerDelay={0.08}>
          <div className="sdb">
            <div className="sdb-card">
              <span className="sdb-badge">🚀 סטארטאפים ויזמים</span>
              <div className="sdb-title"><span>20% הנחה</span> אוטומטית</div>
              <p className="sdb-text">כל השירותים וכל התוכנות של HELIX, בהנחה קבועה של 20% לסטארטאפים ויזמים. בלי קוד, בלי תנאים.</p>
            </div>
            <div className="sdb-card">
              <span className="sdb-badge">🆓 חינם לגמרי</span>
              <div className="sdb-title"><span>HELIX STAGE</span> חינם</div>
              <p className="sdb-text">הבמה הקהילתית לסטארטאפים, פרסום, שותפים, לקוחות ראשונים ופידבק, חינמית לחלוטין לסטארטאפים ויזמים.</p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
