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
    desc: 'להתחיל בקטן — כל היכולות המרכזיות, בהיקף מתאים לעסק קטן או צוות מתחיל.',
    target: 'עסק קטן / התחלה',
    items: ['עד 3 משתמשים', '500 פעולות בחודש', '100 הודעות וואטסאפ חינם', 'כל היכולות המרכזיות', 'תמיכה במייל'],
    benefits: ['בלי התחייבות', 'עברית מלאה'],
  },
  {
    name: 'Pro', price: '499', priceNote: 'לחודש · לכל תוכנה', popular: true,
    desc: 'המסלול שרוב הלקוחות בוחרים — היקף נדיב, ריבוי ערוצים ואנליטיקס מלא.',
    target: 'רוב העסקים והצוותים',
    items: ['עד 10 משתמשים', '5,000 פעולות בחודש', '500 הודעות וואטסאפ חינם', 'ריבוי ערוצים + אנליטיקס', 'תמיכה מהירה'],
    benefits: ['הכי משתלם', 'בול ב-WTP הישראלי'],
  },
  {
    name: 'Business', price: '999', priceNote: 'לחודש · לכל תוכנה',
    desc: 'לנפח גבוה וארגונים — בלי הגבלת משתמשים, גישת API ומיתוג לבן.',
    target: 'חברה גדולה / סוכנות',
    items: ['משתמשים ללא הגבלה', '25,000 פעולות בחודש', '2,000 הודעות וואטסאפ חינם', 'גישת API + SSO', 'מיתוג לבן (white-label)'],
    benefits: ['API מלא', 'מוכן לסוכנויות'],
  },
  {
    name: 'חבילת Trio', price: '1,090', priceNote: 'לחודש · 3 תוכנות',
    desc: 'בוחרים 3 תוכנות מהסוויטה במחיר אחד — חיסכון של כ-27% מול רכישה בנפרד.',
    target: 'מי שרוצה כמה כלים',
    items: ['3 תוכנות לבחירתכם', 'workspace מאוחד', 'חיוב אחד', 'מכסות הוואטסאפ מצטברות', 'חיסכון ~27%'],
    benefits: ['חיסכון מיידי', 'ניהול אחד'],
  },
  {
    name: 'חבילת Suite-5', price: '1,690', priceNote: 'לחודש · 5 תוכנות',
    desc: 'חמש תוכנות לבחירתכם — חיסכון של כ-34% מול רכישה בנפרד.',
    target: 'עסק שרוצה עומק',
    items: ['5 תוכנות לבחירתכם', 'workspace מאוחד', 'חיוב אחד', 'מכסות הוואטסאפ מצטברות', 'חיסכון ~34%'],
    benefits: ['הכי משתלם למרובי-כלים'],
  },
  {
    name: 'סוויטה מלאה', price: '2,490', priceNote: 'לחודש · כל התוכנות',
    desc: 'כל משפחת המוצרים של HELIX תחת מנוי אחד — למי שרוצה את הכל.',
    target: 'ארגון שרוצה את כל הערכה',
    items: ['כל התוכנות הפעילות', 'workspace מאוחד', 'עדיפות בתמיכה', 'מכסות וואטסאפ מוגדלות', 'חיסכון 40%+'],
    benefits: ['הערך המקסימלי'],
    footnote: '* חיוב שנתי — חודשיים חינם על כל מסלול.',
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

export default function PricingCarousel({ wa }: { wa: string }) {
  const [current, setCurrent] = useState(1); // start on Pro
  const wrapRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const n = plans.length;

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
          border: 1px solid rgba(16,185,129,0.15); border-radius: 16px; padding: 28px 24px;
          background: rgba(10,15,13,0.97);
          transition: all 0.6s cubic-bezier(0.25,0.8,0.25,1);
          backface-visibility: hidden;
        }
        .pc-card.center { transform: translateX(0) translateZ(0) rotateY(0deg) scale(1); z-index:30; opacity:1; border-color:rgba(16,185,129,0.4); box-shadow:0 0 50px rgba(16,185,129,0.12); cursor:default; }
        .pc-card.right { transform: translateX(66%) translateZ(-150px) rotateY(-18deg) scale(0.8); z-index:20; opacity:0.8; filter:blur(0.5px) brightness(0.93); cursor:pointer; }
        .pc-card.left { transform: translateX(-66%) translateZ(-150px) rotateY(18deg) scale(0.8); z-index:20; opacity:0.8; filter:blur(0.5px) brightness(0.93); cursor:pointer; }
        .pc-card.far-right { transform: translateX(118%) translateZ(-300px) rotateY(-28deg) scale(0.62); z-index:10; opacity:0.45; filter:blur(2px) brightness(0.85); cursor:pointer; }
        .pc-card.far-left { transform: translateX(-118%) translateZ(-300px) rotateY(28deg) scale(0.62); z-index:10; opacity:0.45; filter:blur(2px) brightness(0.85); cursor:pointer; }
        .pc-card.hidden-card { transform: translateX(0) translateZ(-500px) scale(0.4); z-index:1; opacity:0; pointer-events:none; }
        .pc-nav { display:flex; justify-content:center; gap:16px; margin-top:32px; }
        .pc-btn { width:44px; height:44px; border-radius:50%; border:1px solid rgba(16,185,129,0.3); background:rgba(16,185,129,0.05); color:#10B981; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
        .pc-btn:hover { background:rgba(16,185,129,0.15); border-color:#10B981; }
        .pc-dots { display:flex; justify-content:center; gap:8px; margin-top:16px; }
        .pc-dot { width:8px; height:8px; border-radius:50%; background:rgba(16,185,129,0.2); border:none; cursor:pointer; transition:all 0.3s; }
        .pc-dot.active { background:#10B981; width:24px; border-radius:4px; }
        .pc-popular { position:absolute; top:-12px; right:20px; background:#10B981; color:#000; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; }
        .pc-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
        .pc-name { font-size:1.15rem; font-weight:700; color:#fff; }
        .pc-price { font-size:1.5rem; font-weight:800; color:#10B981; text-align:left; line-height:1.1; }
        .pc-price small { font-size:0.9rem; font-weight:700; }
        .pc-price-note { font-size:0.68rem; color:#6b7280; text-align:left; }
        .pc-desc { font-size:0.82rem; color:#9ca3af; line-height:1.6; margin-bottom:14px; }
        .pc-target { font-size:0.75rem; color:#6b7280; font-style:italic; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.05); }
        .pc-items { list-style:none; margin-bottom:14px; padding:0; }
        .pc-items li { display:flex; align-items:flex-start; gap:8px; font-size:0.82rem; color:#d1d5db; padding:4px 0; }
        .pc-check { color:#10B981; flex-shrink:0; font-weight:700; }
        .pc-benefits { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:12px; }
        .pc-benefit { font-size:0.68rem; color:#34d399; background:rgba(16,185,129,0.08); padding:2px 7px; border-radius:12px; }
        .pc-cta { display:block; width:100%; padding:11px; background:#10B981; color:#000; font-weight:700; font-size:0.85rem; border:none; border-radius:10px; cursor:pointer; text-align:center; text-decoration:none; margin-top:8px; }
        .pc-cta:hover { background:#059669; }
        .pc-footnote { font-size:0.72rem; color:#10B981; font-style:italic; margin-top:10px; opacity:0.8; }
        @media (max-width:768px) { .pc-card { width:300px; margin-left:-150px; padding:22px 18px; } }
      `}</style>

      <div
        ref={wrapRef}
        className="pc-wrap"
        onClick={onWrapClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => { if (autoRef.current) clearInterval(autoRef.current); }}
        onMouseLeave={() => { autoRef.current = setInterval(() => setCurrent(c => (c + 1) % n), 5500); }}
      >
        {plans.map((pkg, i) => (
          <div
            key={pkg.name}
            className={`pc-card ${getPosition(i, current, n)}`}
            onClick={(e) => { if (i !== current) { e.stopPropagation(); goTo(i); } }}
          >
            {pkg.popular && <span className="pc-popular">הכי פופולרי</span>}
            <div className="pc-header">
              <div><div className="pc-name">{pkg.name}</div></div>
              <div><div className="pc-price">{pkg.price} <small>₪</small></div><div className="pc-price-note">{pkg.priceNote}</div></div>
            </div>
            <p className="pc-desc">{pkg.desc}</p>
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
        {plans.map((_, i) => (
          <button key={i} className={`pc-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} aria-label={`מסלול ${i + 1}`} />
        ))}
      </div>
    </>
  );
}
