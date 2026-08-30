import ScrollReveal from '../components/ScrollReveal';

type Data = {
  label: string;
  beforeTitle: string;
  before: string[];
  afterTitle: string;
  after: string[];
};
type Props = { accent: string; data: Data };

/** Framer/Linear-style before→after proof, two panels with an arrow between. */
export default function ProductBeforeAfter({ accent, data }: Props) {
  return (
    <section className="pba" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <h2 className="pba-title">
          לפני ואחרי, <em>{data.label}</em>
        </h2>
        <ScrollReveal className="pba-grid">
          <div className="pba-col pba-before">
            <span className="pba-col-tag">{data.beforeTitle}</span>
            <ul>
              {data.before.map((b) => (
                <li key={b}>
                  <span className="pba-x" aria-hidden="true">✕</span>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div className="pba-arrow" aria-hidden="true">←</div>
          <div className="pba-col pba-after">
            <span className="pba-col-tag">{data.afterTitle}</span>
            <ul>
              {data.after.map((a) => (
                <li key={a}>
                  <span className="pba-v" aria-hidden="true">✓</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
