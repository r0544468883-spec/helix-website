import type { Metadata } from 'next';
import Link from 'next/link';
import { PRODUCTS_DATA } from './products-data';
import ScrollReveal from '../components/ScrollReveal';

export const metadata: Metadata = {
  title: 'התוכנות של HELIX — מוצרי SaaS לעסקים ישראליים | HELIX',
  description:
    'משפחת מוצרי ה-SaaS של HELIX — אוטומציית שיווק, דשבורדים, SDR, GEO, ניהול מוניטין, עוזר AI, Growth Doctor וטפסים דיגיטליים. בעברית מלאה, לעסקים ישראליים.',
};

export default function ProductsHubPage() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <span className="eyebrow">התוכנות של HELIX</span>
          <h1>
            הכלים שבנינו.
            <br />
            מוכנים לעבוד בשבילכם.
          </h1>
          <p className="intro">
            משפחת מוצרי ה-SaaS של HELIX — כל אחד פותר כאב אמיתי, בעברית מלאה, ומחובר לשאר המערכת.
          </p>
        </div>
      </section>

      <section className="products-hub">
        <div className="container">
          <ScrollReveal direction="up" stagger staggerDelay={0.06}>
            <div className="products-hub-grid">
              {PRODUCTS_DATA.map((p) => (
                <Link key={p.slug} href={`/products/${p.slug}`} className="product-hub-card">
                  <span className="product-hub-eyebrow">{p.eyebrow}</span>
                  <h2 className="product-hub-name">{p.name}</h2>
                  <p className="product-hub-desc">{p.subtitle}</p>
                  <span className="product-hub-link">לפרטים ←</span>
                </Link>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
