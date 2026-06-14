import RevealOnScroll from './RevealOnScroll';

interface Props {
  yes: string[];
  no: string[];
}

export default function ForWhoSection({ yes, no }: Props) {
  return (
    <section className="sp2-section">
      <div className="container">
        <RevealOnScroll>
          <h2 className="sp2-section-title">למי זה מתאים</h2>
        </RevealOnScroll>
        <div className="sp2-for-grid">
          <RevealOnScroll delay={0}>
            <div className="sp2-for-card sp2-for-yes">
              <div className="sp2-for-icon">✓</div>
              <h3>מתאים</h3>
              <ul>{yes.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </RevealOnScroll>
          <RevealOnScroll delay={150}>
            <div className="sp2-for-card sp2-for-no">
              <div className="sp2-for-icon">✕</div>
              <h3>לא מתאים</h3>
              <ul>{no.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </RevealOnScroll>
        </div>
      </div>
    </section>
  );
}
