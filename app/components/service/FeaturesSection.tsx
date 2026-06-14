import RevealOnScroll from './RevealOnScroll';
import AnimatedCounter from './AnimatedCounter';

interface Feature {
  title: string;
  text: string;
}

interface Stat {
  value: number;
  suffix?: string;
  label: string;
}

interface Props {
  title?: string;
  lead?: string;
  features: Feature[];
  stats?: Stat[];
}

export default function FeaturesSection({ title = 'מה כלול', lead, features, stats }: Props) {
  return (
    <section className="sp2-section sp2-section-alt">
      <div className="container">
        <RevealOnScroll>
          <h2 className="sp2-section-title">{title}</h2>
          {lead && <p className="sp2-lead">{lead}</p>}
        </RevealOnScroll>

        {stats && stats.length > 0 && (
          <div className="sp2-stats-row">
            {stats.map((stat) => (
              <RevealOnScroll key={stat.label} className="sp2-stat">
                <div className="sp2-stat-value">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix || ''} />
                </div>
                <div className="sp2-stat-label">{stat.label}</div>
              </RevealOnScroll>
            ))}
          </div>
        )}

        <div className="sp2-features-grid">
          {features.map((feat, i) => (
            <RevealOnScroll key={feat.title} delay={i * 100}>
              <div className="sp2-feature-card">
                <div className="sp2-feature-num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{feat.title}</h3>
                <p>{feat.text}</p>
                <div className="sp2-feature-glow" />
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
