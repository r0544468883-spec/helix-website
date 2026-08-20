import Link from 'next/link';
import { getProduct, type Product } from './products-data';

const strip = (name: string) => name.replace(/^HELIX\s*/i, '') || name;

// Rec 4 — Land & Expand cross-sell. Generic framing (per user): "you started with
// one of our products, great — in your personal area you'll get recommendations
// for products that work in synergy with it." Previews a few real siblings.
const SYNERGY: Record<string, string[]> = {
  'marketing-ops': ['sdr', 'dashboards', 'geo'],
  dashboards: ['marketing-ops', 'growth-doctor', 'shop'],
  sdr: ['crm', 'meeting', 'marketing-ops'],
  geo: ['marketing-ops', 'reputation', 'dashboards'],
  reputation: ['geo', 'sdr', 'marketing-ops'],
  assistant: ['crm', 'chief', 'dashboards'],
  'growth-doctor': ['dashboards', 'shop', 'marketing-ops'],
  forms: ['crm', 'sdr', 'meeting'],
  meeting: ['sdr', 'crm', 'forms'],
  shop: ['store-maintenance', 'growth-doctor', 'dashboards'],
  crm: ['sdr', 'meeting', 'marketing-ops'],
  chief: ['crm', 'assistant', 'dashboards'],
  'website-maintenance': ['store-maintenance', 'geo', 'dashboards'],
  'store-maintenance': ['shop', 'website-maintenance', 'growth-doctor'],
};

export default function ProductSynergy({ current }: { current: Product }) {
  const sibs = (SYNERGY[current.slug] || [])
    .map(getProduct)
    .filter((p): p is Product => Boolean(p))
    .slice(0, 3);
  if (sibs.length === 0) return null;
  const acc = current.accent || '#10B981';
  const name = strip(current.name);
  return (
    <div className="sp-synergy" style={{ ['--acc' as string]: acc }}>
      <div className="sp-synergy-head">
        <div className="sp-synergy-eyebrow">עובד לבד, מנצח בקבוצה</div>
        <h2 className="sp-synergy-title">התחלת ב-{name}? יופי.</h2>
        <p className="sp-synergy-text">
          כל מוצרי HELIX חולקים אותם לקוחות ואותה דאטה. באיזור האישי יחכו לך המלצות על
          המוצרים שעובדים הכי טוב בסינרגיה עם {name}, בלי להתחיל שום דבר מאפס. הנה כמה:
        </p>
      </div>

      <div className="sp-synergy-grid">
        {sibs.map((p) => (
          <Link
            key={p.slug}
            href={`/products/${p.slug}`}
            className="sp-synergy-card"
            style={{ ['--c' as string]: p.accent || '#10B981' }}
          >
            <span className="sp-synergy-card-name">{strip(p.name)}</span>
            <span className="sp-synergy-card-eye">{p.eyebrow}</span>
            <span className="sp-synergy-card-go">לגלות ←</span>
          </Link>
        ))}
      </div>

      <Link href="/products/crm" className="sp-synergy-cta">
        התחל חינם עם HELIX Core, וקבל המלצות מותאמות באיזור האישי ←
      </Link>
    </div>
  );
}
