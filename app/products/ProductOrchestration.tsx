import ScrollReveal from '../components/ScrollReveal';

type Node = { name: string; sub: string; icon: string };
type Props = { accent: string; hub: string; nodes: Node[] };

/** Stripe-style orchestration diagram: a central hub wired to surrounding
 *  nodes with flowing dashed connectors, on a dotted-grid background. */
export default function ProductOrchestration({ accent, hub, nodes }: Props) {
  const items = nodes.slice(0, 8);
  const n = items.length;
  // polar layout — nodes evenly around the hub, first one at the top
  const R = 38; // radius as % of the box
  const placed = items.map((it, i) => {
    const ang = (-90 + (360 / n) * i) * (Math.PI / 180);
    return { ...it, x: 50 + R * Math.cos(ang), y: 50 + R * Math.sin(ang) };
  });

  return (
    <section className="por" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="por-title">
          הכל מתחבר ל-<em>{hub}</em>
        </h2>
        <ScrollReveal className="por-stage">
          <svg className="por-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {placed.map((p) => (
              <line key={p.name} x1="50" y1="50" x2={p.x} y2={p.y} className="por-line" />
            ))}
          </svg>

          <div className="por-hub" aria-hidden="true">
            <span className="por-hub-label">{hub}</span>
          </div>

          {placed.map((p, i) => (
            <div
              className="por-node"
              key={p.name}
              style={{ left: `${p.x}%`, top: `${p.y}%`, ['--d' as string]: `${i * 0.25}s` }}
            >
              <span className="por-node-icon" aria-hidden="true">{p.icon}</span>
              <span className="por-node-text">
                <span className="por-node-name">{p.name}</span>
                <span className="por-node-sub">{p.sub}</span>
              </span>
            </div>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}
