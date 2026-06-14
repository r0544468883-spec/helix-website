import RevealOnScroll from './RevealOnScroll';

interface Props {
  items: string[];
}

export default function TrustBar({ items }: Props) {
  return (
    <section className="sp2-section sp2-trust-section">
      <div className="container">
        <RevealOnScroll>
          <div className="sp2-trust-bar">
            {items.map((item) => (
              <span key={item} className="sp2-trust-item">
                <span className="sp2-trust-check">✓</span>
                {item}
              </span>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  );
}
