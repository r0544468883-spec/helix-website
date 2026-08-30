import Link from 'next/link';
import { PRODUCTS_DATA, type Product } from './products-data';

const CORE = ['crm', 'chief'];
const strip = (name: string) => name.replace(/^HELIX\s*/i, '') || name;

// Rec 1 — "series branding over one core layer": show every HELIX product as a
// sibling that sits on the shared HELIX Core (free CRM + CHIEF agent), with the
// current product highlighted. Mirrors the PowerGTM/PowerService/PowerPlan move:
// many branded products, one shared brain.
export default function ProductSuiteFamily({ current }: { current: Product }) {
  const products = PRODUCTS_DATA.filter((p) => !CORE.includes(p.slug));
  const acc = current.accent || '#10B981';
  return (
    <div className="sp-suite" style={{ ['--acc' as string]: acc }}>
      <div className="sp-suite-tier">
        <div className="sp-suite-tierhead">
          <span className="sp-suite-num">1</span> המוצרים · מה שאתה מפעיל
        </div>
        <div className="sp-suite-grid">
          {products.map((p) => {
            const on = p.slug === current.slug;
            return (
              <Link
                key={p.slug}
                href={`/products/${p.slug}`}
                className={`sp-suite-chip${on ? ' on' : ''}`}
                style={{ ['--c' as string]: p.accent || '#10B981' }}
              >
                <span className="sp-suite-chip-name">{strip(p.name)}</span>
                <span className="sp-suite-chip-eye">{p.eyebrow}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="sp-suite-connect"><span>כולם רצים על אותה שכבה</span></div>

      <div className="sp-suite-core">
        <div className="sp-suite-core-head">
          <span className="sp-suite-num">2</span> HELIX Core · המוח המשותף
        </div>
        <div className="sp-suite-core-layers">
          <Link href="/products/crm" className="sp-suite-core-item">
            <b>CRM</b><span>הלקוחות והדאטה · חינם</span>
          </Link>
          <Link href="/products/chief" className="sp-suite-core-item">
            <b>CHIEF</b><span>סוכן-העל שמתאם את כל המוצרים</span>
          </Link>
        </div>
      </div>

      <p className="sp-suite-benefit">
        {strip(current.name)} לא אי בודד. הוא יושב על אותם לקוחות, אותה דאטה ואותן הרשאות
        של כל שאר המוצרים. קונה מוצר אחד, וכל השאר כבר מכירים את העסק שלך. להוסיף מחלקה = לחיצה, לא פרויקט.
      </p>
    </div>
  );
}
