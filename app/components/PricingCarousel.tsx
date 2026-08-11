'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

type Plan = {
  name: string;
  price: string;
  priceNote: string;
  desc: string;
  target: string;
  items: string[];
  benefits: string[];
  popular?: boolean;
  footnote?: string;
};

const plans: Plan[] = [
  {
    name: 'Starter', price: '199', priceNote: 'לחודש · לכל תוכנה',
    desc: 'להתחיל בקטן, כל היכולות המרכזיות, בהיקף מתאים לעסק קטן או צוות מתחיל.',
    target: 'עסק קטן / התחלה',
    items: ['עד 3 משתמשים', '500 פעולות בחודש', '100 הודעות וואטסאפ חינם', 'כל היכולות המרכזיות', 'תמיכה במייל'],
    benefits: ['בלי התחייבות', 'עברית מלאה'],
  },
  {
    name: 'Pro', price: '449', priceNote: 'לחודש · לכל תוכנה', popular: true,
    desc: 'המסלול שרוב הלקוחות בוחרים, היקף נדיב, ריבוי ערוצים ואנליטיקס מלא.',
    target: 'רוב העסקים והצוותים',
    items: ['עד 10 משתמשים', '5,000 פעולות בחודש', '500 הודעות וואטסאפ חינם', 'ריבוי ערוצים + אנליטיקס', 'תמיכה מהירה'],
    benefits: ['הכי משתלם', 'בול ב-WTP הישראלי'],
  },
  {
    name: 'Business', price: '899', priceNote: 'לחודש · לכל תוכנה',
    desc: 'לנפח גבוה וארגונים, בלי הגבלת משתמשים, גישת API ומיתוג לבן.',
    target: 'חברה גדולה / סוכנות',
    items: ['משתמשים ללא הגבלה', '25,000 פעולות בחודש', '2,000 הודעות וואטסאפ חינם', 'גישת API + SSO', 'מיתוג לבן (white-label)'],
    benefits: ['API מלא', 'מוכן לסוכנויות'],
  },
  {
    name: 'חבילת Trio', price: '990', priceNote: 'לחודש · 3 תוכנות',
    desc: 'בוחרים 3 תוכנות מהסוויטה במחיר אחד, חיסכון של כ-27% מול רכישה בנפרד.',
    target: 'מי שרוצה כמה כלים',
    items: ['3 תוכנות לבחירתכם', 'workspace מאוחד', 'חיוב אחד', 'מכסות הוואטסאפ מצטברות', 'חיסכון ~27%'],
    benefits: ['חיסכון מיידי', 'ניהול אחד'],
  },
  {
    name: 'חבילת Suite-5', price: '1,490', priceNote: 'לחודש · 5 תוכנות',
    desc: 'חמש תוכנות לבחירתכם, חיסכון של כ-34% מול רכישה בנפרד.',
    target: 'עסק שרוצה עומק',
    items: ['5 תוכנות לבחירתכם', 'workspace מאוחד', 'חיוב אחד', 'מכסות הוואטסאפ מצטברות', 'חיסכון ~34%'],
    benefits: ['הכי משתלם למרובי-כלים'],
  },
  {
    name: 'סוויטה מלאה', price: '2,490', priceNote: 'לחודש · כל התוכנות',
    desc: 'כל משפחת המוצרים של HELIX תחת מנוי אחד, למי שרוצה את הכל.',
    target: 'ארגון שרוצה את כל הערכה',
    items: ['כל התוכנות הפעילות', 'workspace מאוחד', 'עדיפות בתמיכה', 'מכסות וואטסאפ מוגדלות', 'חיסכון 40%+'],
    benefits: ['הערך המקסימלי'],
    footnote: '* חיוב שנתי, חודשיים חינם על כל מסלול.',
  },
];

function getPosition(index: number, center: number, total: number) {
  const diff = ((index - center) % total + total) % total;
  if (diff === 0) return 'center';
  if (diff === 1) return 'left';
  if (diff === total - 1) return 'right';
  if (diff === 2) return 'far-left';
  if (diff === total - 2) return 'far-right';
  return 'hidden-card';
}

type ProductPricing = { name: string; starter: number; pro: number; business: number; recommend?: string[] };

export default function PricingCarousel({ wa, product }: { wa: string; product?: ProductPricing }) {
  const [current, setCurrent] = useState(1); // start on Pro
  const wrapRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval>>(undefined);

  // The three single-software tiers show this product's class prices; bundle
  // tiers stay fixed. Falls back to the class-B ladder when no product given.
  const activePlans = product
    ? plans.map((pl) => {
        const note = `לחודש · ל-${product.name}`;
        const fmt = (v: number) => v.toLocaleString('en-US');
        if (pl.name === 'Starter') return { ...pl, price: fmt(product.starter), priceNote: note };
        if (pl.name === 'Pro') return { ...pl, price: fmt(product.pro), priceNote: note };
        if (pl.name === 'Business') return { ...pl, price: fmt(product.business), priceNote: note };
        return pl;
      })
    : plans;
  const n = activePlans.length;

  const go = useCallback((dir: 1 | -1) => {
    setCurrent(c => (c + dir + n) % n);
    if (autoRef.current) clearInterval(autoRef.current);
  }, [n]);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);

  useEffect(() => {
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % n), 5500);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [n]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(-1);
      if (e.key === 'ArrowLeft') go(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 20) go(diff > 0 ? 1 : -1);
  };

  const onWrapClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.pc-cta')) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    go(x < rect.width / 2 ? 1 : -1);
  };

  return (
    <>
      <style>{`
        .pc-wrap { perspective: 1200px; position: relative; height: 560px; overflow: visible; }
        .pc-card {
          position: absolute; top: 0; left: 50%; width: 360px; margin-left: -180px;
          border: 1px solid color-mix(in srgb, var(--brand) 15%, transparent); border-radius: 16px; padding: 28px 24px;
          background: rgba(10,15,13,0.97);
          transition: all 0.6s cubic-bezier(0.25,0.8,0.25,1);
          backface-visibility: hidden;
        }
        .pc-card.center { transform: translateX(0) translateZ(0) rotateY(0deg) scale(1); z-index:30; opacity:1; border-color:color-mix(in srgb, var(--brand) 40%, transparent); box-shadow:0 0 50px color-mix(in srgb, var(--brand) 12%, transparent); cursor:default; }
        .pc-card.right { transform: translateX(66%) translateZ(-150px) rotateY(-18deg) scale(0.8); z-index:20; opacity:0.8; filter:blur(0.5px) brightness(0.93); cursor:pointer; }
        .pc-card.left { transform: translateX(-66%) translateZ(-150px) rotateY(18deg) scale(0.8); z-index:20; opacity:0.8; filter:blur(0.5px) brightness(0.93); cursor:pointer; }
        .pc-card.far-right { transform: translateX(118%) translateZ(-300px) rotateY(-28deg) scale(0.62); z-index:10; opacity:0.45; filter:blur(2px) brightness(0.85); cursor:pointer; }
        .pc-card.far-left { transform: translateX(-118%) translateZ(-300px) rotateY(28deg) scale(0.62); z-index:10; opacity:0.45; filter:blur(2px) brightness(0.85); cursor:pointer; }
        .pc-card.hidden-card { transform: translateX(0) translateZ(-500px) scale(0.4); z-index:1; opacity:0; pointer-events:none; }
        .pc-nav { display:flex; justify-content:center; gap:16px; margin-top:32px; }
        .pc-btn { width:44px; height:44px; border-radius:50%; border:1px solid color-mix(in srgb, var(--brand) 30%, transparent); background:color-mix(in srgb, var(--brand) 5%, transparent); color:var(--brand); font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
        .pc-btn:hover { background:color-mix(in srgb, var(--brand) 15%, transparent); border-color:var(--brand); }
        .pc-dots { display:flex; justify-content:center; gap:8px; margin-top:16px; }
        .pc-dot { width:8px; height:8px; border-radius:50%; background:color-mix(in srgb, var(--brand) 20%, transparent); border:none; cursor:pointer; transition:all 0.3s; }
        .pc-dot.active { background:var(--brand); width:24px; border-radius:4px; }
        .pc-popular { position:absolute; top:-12px; right:20px; background:var(--brand); color:#000; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; }
        .pc-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
        .pc-name { font-size:1.15rem; font-weight:700; color:#fff; }
        .pc-price { font-size:1.5rem; font-weight:800; color:var(--brand); text-align:left; line-height:1.1; }
        .pc-price small { font-size:0.9rem; font-weight:700; }
        .pc-price-note { font-size:0.68rem; color:#6b7280; text-align:left; }
        .pc-desc { font-size:0.82rem; color:#9ca3af; line-height:1.6; margin-bottom:14px; }
        .pc-target { font-size:0.75rem; color:#6b7280; font-style:italic; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.05); }
        .pc-items { list-style:none; margin-bottom:14px; padding:0; }
        .pc-items li { display:flex; align-items:flex-start; gap:8px; font-size:0.82rem; color:#d1d5db; padding:4px 0; }
        .pc-check { color:var(--brand); flex-shrink:0; font-weight:700; }
        .pc-benefits { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:12px; }
        .pc-benefit { font-size:0.68rem; color:color-mix(in srgb, var(--brand) 75%, white); background:color-mix(in srgb, var(--brand) 8%, transparent); padding:2px 7px; border-radius:12px; }
        .pc-cta { display:block; width:100%; padding:11px; background:var(--brand); color:#000; font-weight:700; font-size:0.85rem; border:none; border-radius:10px; cursor:pointer; text-align:center; text-decoration:none; margin-top:8px; }
        .pc-cta:hover { background:#059669; }
        .pc-footnote { font-size:0.72rem; color:var(--brand); font-style:italic; margin-top:10px; opacity:0.8; }
        .pc-recommend { display:flex; flex-wrap:wrap; align-items:center; gap:5px; margin:-2px 0 14px; padding:9px 11px; border-radius:10px; background:color-mix(in srgb, var(--brand) 7%, transparent); border:1px dashed color-mix(in srgb, var(--brand) 32%, transparent); }
        .pc-recommend-label { font-size:0.72rem; font-weight:700; color:var(--brand); width:100%; margin-bottom:2px; }
        .pc-recommend-chip { font-size:0.7rem; color:#e5e7eb; background:rgba(255,255,255,0.06); padding:3px 9px; border-radius:10px; }
        /* Layout: sidebar nav + carousel (matches the home PackagesCarousel, accent-aware) */
        .pc-layout { display:grid; grid-template-columns:200px 1fr; gap:28px; align-items:start; max-width:1000px; margin:0 auto; }
        .pc-carousel-area { position:relative; }
        .pc-side-desktop { position:sticky; top:100px; display:flex; flex-direction:column; gap:3px; }
        .pc-side-mobile { display:none; }
        .pc-side-item { text-align:right; padding:10px 14px; border:none; border-right:2px solid transparent; background:transparent; color:#9ca3af; font-size:0.9rem; font-weight:600; cursor:pointer; border-radius:8px 0 0 8px; transition:all 0.2s; font-family:inherit; }
        .pc-side-item:hover { background:color-mix(in srgb, var(--brand) 5%, transparent); color:#fff; }
        .pc-side-item.active { background:color-mix(in srgb, var(--brand) 8%, transparent); color:var(--brand); border-right-color:var(--brand); font-weight:700; }
        .pc-side-tag { display:block; font-size:0.66rem; color:#6b7280; margin-top:1px; font-weight:400; }
        .pc-side-item.active .pc-side-tag { color:var(--brand); opacity:0.6; }
        @media (max-width:900px) {
          .pc-layout { grid-template-columns:1fr; gap:0; }
          .pc-side-desktop { display:none; }
          .pc-side-mobile { display:flex; gap:8px; overflow-x:auto; padding-bottom:12px; margin-bottom:4px; scrollbar-width:none; }
          .pc-side-mobile::-webkit-scrollbar { display:none; }
          .pc-tab { flex-shrink:0; padding:8px 14px; border-radius:999px; border:1px solid color-mix(in srgb, var(--brand) 20%, transparent); background:transparent; color:#9ca3af; font-size:0.8rem; cursor:pointer; white-space:nowrap; font-family:inherit; }
          .pc-tab.active { background:color-mix(in srgb, var(--brand) 10%, transparent); color:var(--brand); border-color:var(--brand); font-weight:700; }
        }
        /* Mobile: the 3D coverflow reads as broken on a phone. Replace it with a
           clean vertical stack of ALL plans (standard mobile pricing) so every
           tier is fully visible, same clarity as the desktop sidebar+card. */
        @media (max-width:768px) {
          .pc-layout { display:block; }
          .pc-side-mobile, .pc-side-desktop { display:none; }      /* stack shows every plan → tabs redundant */
          .pc-wrap {
            perspective:none; height:auto !important; min-height:0; overflow:visible;
            display:flex; flex-direction:column; gap:16px; cursor:default;
          }
          .pc-card {
            position:relative !important; top:auto; left:auto; width:100%; max-width:420px;
            margin:0 auto; padding:24px 20px;
            display:block !important;
            transform:none !important; opacity:1 !important; filter:none !important;
            border-color:color-mix(in srgb, var(--brand) 18%, transparent) !important;
            box-shadow:none !important;
            cursor:default;
          }
          /* highlight the popular plan, not the (autoplaying) carousel center */
          .pc-card.is-popular {
            border-color:color-mix(in srgb, var(--brand) 45%, transparent) !important;
            box-shadow:0 0 34px color-mix(in srgb, var(--brand) 12%, transparent) !important;
          }
          .pc-nav, .pc-dots { display:none; }                       /* stacked → no carousel controls */
        }
      `}</style>

      <div className="pc-layout">
        {/* Sidebar nav, desktop */}
        <nav className="pc-side pc-side-desktop">
          {activePlans.map((pkg, i) => (
            <button key={pkg.name} className={`pc-side-item${i === current ? ' active' : ''}`} onClick={() => goTo(i)}>
              {pkg.name}
              <span className="pc-side-tag">{pkg.price} ₪</span>
            </button>
          ))}
        </nav>
        {/* Tabs, mobile */}
        <div className="pc-side pc-side-mobile">
          {activePlans.map((pkg, i) => (
            <button key={pkg.name} className={`pc-tab${i === current ? ' active' : ''}`} onClick={() => goTo(i)}>{pkg.name}</button>
          ))}
        </div>

        <div className="pc-carousel-area">
      <div
        ref={wrapRef}
        className="pc-wrap"
        onClick={onWrapClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => { if (autoRef.current) clearInterval(autoRef.current); }}
        onMouseLeave={() => { autoRef.current = setInterval(() => setCurrent(c => (c + 1) % n), 5500); }}
      >
        {activePlans.map((pkg, i) => (
          <div
            key={pkg.name}
            className={`pc-card ${getPosition(i, current, n)}${pkg.popular ? ' is-popular' : ''}`}
            onClick={(e) => { if (i !== current) { e.stopPropagation(); goTo(i); } }}
          >
            {pkg.popular && <span className="pc-popular">הכי פופולרי</span>}
            <div className="pc-header">
              <div><div className="pc-name">{pkg.name}</div></div>
              <div><div className="pc-price">{pkg.price} <small>₪</small></div><div className="pc-price-note">{pkg.priceNote}</div></div>
            </div>
            <p className="pc-desc">{pkg.desc}</p>
            {(pkg.name.includes('חבילת') || pkg.name.includes('סוויטה')) && product?.recommend?.length ? (
              <div className="pc-recommend">
                <span className="pc-recommend-label">מומלץ לשלב עם:</span>
                {product.recommend.map(s => <span key={s} className="pc-recommend-chip">{s}</span>)}
              </div>
            ) : null}
            <p className="pc-target">{pkg.target}</p>
            <ul className="pc-items">
              {pkg.items.map(item => <li key={item}><span className="pc-check">✓</span> {item}</li>)}
            </ul>
            <div className="pc-benefits">
              {pkg.benefits.map(b => <span key={b} className="pc-benefit">{b}</span>)}
            </div>
            {pkg.footnote && <p className="pc-footnote">{pkg.footnote}</p>}
            <a className="pc-cta" href={wa}>דברו איתנו</a>
          </div>
        ))}
      </div>

      <div className="pc-nav">
        <button className="pc-btn" onClick={() => go(-1)} aria-label="הקודם">→</button>
        <button className="pc-btn" onClick={() => go(1)} aria-label="הבא">←</button>
      </div>
      <div className="pc-dots">
        {activePlans.map((_, i) => (
          <button key={i} className={`pc-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} aria-label={`מסלול ${i + 1}`} />
        ))}
      </div>
        </div>
      </div>
    </>
  );
}
