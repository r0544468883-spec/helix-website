'use client';

import ScrollReveal from '../ScrollReveal';
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
        <ScrollReveal direction="up">
          <h2 className="sp2-section-title">{title}</h2>
          {lead && <p className="sp2-lead">{lead}</p>}
        </ScrollReveal>

        {stats && stats.length > 0 && (
          <ScrollReveal direction="up" delay={0.1}>
            <div className="sp2-stats-row">
              {stats.map((stat) => (
                <div key={stat.label} className="sp2-stat">
                  <div className="sp2-stat-value">
                    <AnimatedCounter end={stat.value} suffix={stat.suffix || ''} />
                  </div>
                  <div className="sp2-stat-label">{stat.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal direction="up" stagger staggerDelay={0.1}>
          <div className="sp2-features-grid">
            {features.map((feat, i) => (
              <div key={feat.title} className="sp2-feature-card">
                <div className="sp2-feature-num">{String(i + 1).padStart(2, '0')}</div>
                <h3>{feat.title}</h3>
                <p>{feat.text}</p>
                <div className="sp2-feature-glow" />
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
