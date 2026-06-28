'use client';

import ScrollReveal from '../ScrollReveal';
import ScrollTextHighlight from '../ScrollTextHighlight';

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
        <ScrollReveal direction="up">
          <h2 className="sp2-section-title">{title}</h2>
        </ScrollReveal>
        <ScrollTextHighlight className="sp2-pain-grid" dimOpacity={0.12} blurAmount={1.5}>
          {cards.map((card, i) => (
            <div key={card.title} className="sp2-pain-card">
              <div className="sp2-pain-num">{String(i + 1).padStart(2, '0')}</div>
              <h3>{card.title}</h3>
              <p>{card.text}</p>
            </div>
          ))}
        </ScrollTextHighlight>
      </div>
    </section>
  );
}
