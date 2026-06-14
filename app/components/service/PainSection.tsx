import RevealOnScroll from './RevealOnScroll';

interface PainCard {
  title: string;
  text: string;
}

interface Props {
  title?: string;
  cards: PainCard[];
}

export default function PainSection({ title = 'הבעיה שאתה מכיר', cards }: Props) {
  return (
    <section className="sp2-section">
      <div className="container">
        <RevealOnScroll>
          <h2 className="sp2-section-title">{title}</h2>
        </RevealOnScroll>
        <div className="sp2-pain-grid">
          {cards.map((card, i) => (
            <RevealOnScroll key={card.title} delay={i * 120}>
              <div className="sp2-pain-card">
                <div className="sp2-pain-num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{card.title}</h3>
                <p>{card.text}</p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
