import RevealOnScroll from './RevealOnScroll';

interface Props {
  title: string;
  subtitle?: string;
  ctaHref: string;
  ctaText?: string;
}

export default function FinalCTA({ title, subtitle, ctaHref, ctaText = 'דברו איתנו בוואטסאפ' }: Props) {
  return (
    <section className="sp2-final-cta">
      <div className="sp2-final-glow" />
      <div className="container">
        <RevealOnScroll>
          <h2 className="sp2-final-title">{title}</h2>
          {subtitle && <p className="sp2-final-subtitle">{subtitle}</p>}
          <a href={ctaHref} target="_blank" rel="noopener noreferrer" className="sp2-final-btn">
            {ctaText}
          </a>
        </RevealOnScroll>
      </div>
    </section>
  );
}
