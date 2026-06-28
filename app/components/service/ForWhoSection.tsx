'use client';

import ScrollReveal from '../ScrollReveal';

interface Props {
  yes: string[];
  no: string[];
}

export default function ForWhoSection({ yes, no }: Props) {
  return (
    <section className="sp2-section">
      <div className="container">
        <ScrollReveal direction="up">
          <h2 className="sp2-section-title">למי זה מתאים</h2>
        </ScrollReveal>
        <div className="sp2-for-grid">
          <ScrollReveal direction="right" delay={0}>
            <div className="sp2-for-card sp2-for-yes">
              <div className="sp2-for-icon">✓</div>
              <h3>מתאים</h3>
              <ul>{yes.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </ScrollReveal>
          <ScrollReveal direction="left" delay={0.15}>
            <div className="sp2-for-card sp2-for-no">
              <div className="sp2-for-icon">✕</div>
              <h3>לא מתאים</h3>
              <ul>{no.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
