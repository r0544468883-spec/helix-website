type Props = {
  accent: string;
  wa: string;
  result?: string;
  steps?: string[];
  offer?: string;
  badge?: string;
};

/** Above-the-fold offer band: quantified result + 3-step scannability strip +
 *  the buried free-offer surfaced as a real CTA + a trust/compliance badge.
 *  Implements the review doc's #1 CRO fix (offer above-the-fold) on every product. */
export default function ProductOfferBar({ accent, wa, result, steps, offer, badge }: Props) {
  if (!offer && !result && !steps) return null;
  return (
    <section className="pob" style={{ ['--pac' as string]: accent }}>
      <div className="container">
        <div className="pob-inner">
          {steps && steps.length > 0 && (
            <ol className="pob-steps">
              {steps.map((s, i) => (
                <li className="pob-step" key={s}>
                  <span className="pob-step-num">{i + 1}</span>
                  <span className="pob-step-label">{s}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="pob-action">
            {result && <span className="pob-result">{result}</span>}
            {offer && (
              <a className="pob-cta" href={wa} target="_blank" rel="noopener noreferrer">
                {offer}
                <span className="pob-cta-arrow" aria-hidden="true">←</span>
              </a>
            )}
            {badge && <span className="pob-badge">{badge}</span>}
          </div>
        </div>
      </div>
    </section>
  );
}
