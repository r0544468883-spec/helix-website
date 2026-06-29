'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

const packages = [
  {
    name: 'צינור מכירה', price: '300', priceNote: 'חד פעמי · כולל תיעוד',
    desc: 'סטטוסים, תזכורות ודוח מסכם — תדעו בדיוק מה מתקדם ומה תקוע.',
    target: 'למי שרוצה שלבים, סטטוסים ותמונה ברורה',
    items: ['שלבים ברורים (חדש → שיחה → הצעה → סגירה)', 'עדכון סטטוס אוטומטי', 'תזכורות כשליד נתקע', 'דוח שבועי על התקדמות'],
    benefits: ['פחות עסקאות נופלות', 'סדר במכירות', 'תמונת מצב ברורה'],
    footnote: '* ניתן להוסיף תמיכה ותיקונים בעלות של 100 ₪ בחודש',
  },
  {
    name: 'קביעת פגישות', price: '650', priceNote: 'חד פעמי · כולל סנכרון',
    desc: 'קביעה אוטומטית, סנכרון יומן ותזכורות. פחות הלוך ושוב.',
    target: 'לעסקים שקובעים שיחות ופגישות כל הזמן',
    items: ['עמוד קביעת פגישה או חיבור לכלי קיים', 'סנכרון יומן ומניעת התנגשויות', 'תזכורות אוטומטיות לפני פגישה', 'שמירת פרטי פגישה ב-CRM'],
    benefits: ['פחות ביטולים', 'יותר פגישות בפועל', 'חוויית לקוח מקצועית'],
    footnote: '* ניתן להוסיף תמיכה ותיקונים בעלות של 100 ₪ בחודש',
  },
  {
    name: 'אוטומציית לידים', price: '980', priceNote: 'חד פעמי · כולל הטמעה', popular: true,
    desc: 'כל פנייה נשמרת אוטומטית עם פרטים מסודרים + הודעה מיידית ללקוח + תזכורת לטיפול.',
    target: 'לעסקים שמקבלים פניות ורוצים סדר מיידי',
    items: ['קליטת פנייה מטופס או WhatsApp', 'שמירה אוטומטית של ליד', 'הודעת תשובה מיידית ללקוח', 'פתיחת משימת מעקב ותזכורת'],
    benefits: ['פחות לידים נופלים', 'פולואפ מסודר', 'תגובה מיידית'],
    footnote: '* ניתן להוסיף תמיכה ותיקונים בעלות של 100 ₪ בחודש',
  },
  {
    name: 'תשלומים וגבייה', price: '1,000', priceNote: 'חד פעמי · לפי מערכות',
    desc: 'אחרי תשלום — אישור אוטומטי, עדכון סטטוס, והצעד הבא.',
    target: 'למי שעובד עם תשלומים ורוצה שקט',
    items: ['חיבור תשלום לתהליך הקיים', 'אישור אוטומטי אחרי תשלום', 'סטטוס: שולם / חסר / בוטל', 'תיעוד עסקה מסודר'],
    benefits: ['סדר בגבייה', 'פחות רדיפה', 'פחות טעויות'],
    footnote: '* ניתן להוסיף תמיכה ותיקונים בעלות של 100 ₪ בחודש',
  },
  {
    name: 'בהתאמה אישית', price: '300', priceNote: 'לפי שעות פיתוח',
    desc: 'לא מצאת את מה שצריך? בונים תהליך לפי הצורך המדויק שלך.',
    target: 'כשצריך משהו בדיוק כמו העסק שלך',
    items: ['פיתוח אוטומציות בהתאמה אישית', 'שיחת אפיון ללא עלות', 'פיתוח בהתאמה לצרכי העסק', 'בדיקות, שיפור ותיעוד'],
    benefits: ['מוריד עבודה חוזרת', 'מתאים לסקייל', 'בדיוק כמו העסק שלך'],
    footnote: '* לא מצאת את החבילה המתאימה? תמיד אפשר לחשוב ביחד.',
    bonusOverride: ['🎁 שיחת אפיון ללא עלות', '🎁 בלי חוזה, ביטול בכל עת', '🎁 בלי דמי הקמה', '🎁 20% הנחה לסטארטאפים ועסקים קטנים'],
  },
];

const positions = ['center', 'left', 'right', 'far-left', 'far-right', 'hidden-card'] as const;

function getPosition(index: number, center: number, total: number) {
  const diff = ((index - center) % total + total) % total;
  if (diff === 0) return 'center';
  if (diff === 1) return 'left';
  if (diff === total - 1) return 'right';
  if (diff === 2) return 'far-left';
  if (diff === total - 2) return 'far-right';
  return 'hidden-card';
}

export default function AutomationCarousel({ wa }: { wa: string }) {
  const [current, setCurrent] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<ReturnType<typeof setInterval>>(undefined);
  const n = packages.length;

  const go = useCallback((dir: 1 | -1) => {
    setCurrent(c => (c + dir + n) % n);
    if (autoRef.current) clearInterval(autoRef.current);
  }, [n]);

  const goTo = useCallback((i: number) => {
    setCurrent(i);
    if (autoRef.current) clearInterval(autoRef.current);
  }, []);

  // Auto-rotate
  useEffect(() => {
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % n), 5000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [n]);

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(-1);
      if (e.key === 'ArrowLeft') go(1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [go]);

  // Wheel
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      go(e.deltaY > 0 || e.deltaX > 0 ? 1 : -1);
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, [go]);

  // Touch
  const touchStart = useRef(0);
  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 20) go(diff > 0 ? 1 : -1);
  };

  // Click left/right half
  const onWrapClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.auto-pkg-cta')) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    go(x < rect.width / 2 ? 1 : -1);
  };

  return (
    <>
      <style>{`
        .auto-carousel-wrap { perspective: 1200px; position: relative; height: 540px; overflow: visible; }
        .auto-carousel-card {
          position: absolute; top: 0; left: 50%; width: 380px; margin-left: -190px;
          border: 1px solid rgba(16,185,129,0.15); border-radius: 16px; padding: 28px 24px;
          background: rgba(10,15,13,0.97);
          transition: all 0.6s cubic-bezier(0.25,0.8,0.25,1);
          backface-visibility: hidden;
        }
        .auto-carousel-card.center { transform: translateX(0) translateZ(0) rotateY(0deg) scale(1); z-index:30; opacity:1; border-color:rgba(16,185,129,0.4); box-shadow:0 0 50px rgba(16,185,129,0.1); cursor:default; }
        .auto-carousel-card.right { transform: translateX(68%) translateZ(-150px) rotateY(-18deg) scale(0.8); z-index:20; opacity:0.8; filter:blur(0.5px) brightness(0.93); pointer-events:auto; cursor:pointer; }
        .auto-carousel-card.left { transform: translateX(-68%) translateZ(-150px) rotateY(18deg) scale(0.8); z-index:20; opacity:0.8; filter:blur(0.5px) brightness(0.93); pointer-events:auto; cursor:pointer; }
        .auto-carousel-card.far-right { transform: translateX(120%) translateZ(-300px) rotateY(-28deg) scale(0.62); z-index:10; opacity:0.5; filter:blur(2px) brightness(0.85); pointer-events:auto; cursor:pointer; }
        .auto-carousel-card.far-left { transform: translateX(-120%) translateZ(-300px) rotateY(28deg) scale(0.62); z-index:10; opacity:0.5; filter:blur(2px) brightness(0.85); pointer-events:auto; cursor:pointer; }
        .auto-carousel-card.hidden-card { transform: translateX(0) translateZ(-500px) scale(0.4); z-index:1; opacity:0; pointer-events:none; }
        .auto-carousel-nav { display:flex; justify-content:center; gap:16px; margin-top:32px; }
        .auto-carousel-btn { width:44px; height:44px; border-radius:50%; border:1px solid rgba(16,185,129,0.3); background:rgba(16,185,129,0.05); color:#10B981; font-size:20px; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
        .auto-carousel-btn:hover { background:rgba(16,185,129,0.15); border-color:#10B981; }
        .auto-carousel-dots { display:flex; justify-content:center; gap:8px; margin-top:16px; }
        .auto-carousel-dot { width:8px; height:8px; border-radius:50%; background:rgba(16,185,129,0.2); border:none; cursor:pointer; transition:all 0.3s; }
        .auto-carousel-dot.active { background:#10B981; width:24px; border-radius:4px; }
        .auto-pkg-popular { position:absolute; top:-12px; right:20px; background:#10B981; color:#000; font-size:11px; font-weight:700; padding:4px 12px; border-radius:20px; }
        .auto-pkg-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; }
        .auto-pkg-name { font-size:1.15rem; font-weight:700; color:#fff; }
        .auto-pkg-price { font-size:1.2rem; font-weight:800; color:#10B981; text-align:left; }
        .auto-pkg-price-note { font-size:0.68rem; color:#6b7280; text-align:left; }
        .auto-pkg-desc { font-size:0.82rem; color:#9ca3af; line-height:1.6; margin-bottom:14px; }
        .auto-pkg-target { font-size:0.75rem; color:#6b7280; font-style:italic; margin-bottom:14px; padding-bottom:14px; border-bottom:1px solid rgba(255,255,255,0.05); }
        .auto-pkg-items { list-style:none; margin-bottom:14px; padding:0; }
        .auto-pkg-items li { display:flex; align-items:flex-start; gap:8px; font-size:0.82rem; color:#d1d5db; padding:4px 0; }
        .auto-pkg-check { color:#10B981; flex-shrink:0; font-weight:700; }
        .auto-pkg-bonuses { margin-bottom:12px; }
        .auto-pkg-bonus { display:inline-flex; align-items:center; gap:4px; font-size:0.72rem; color:#10B981; background:rgba(16,185,129,0.08); border-radius:20px; padding:3px 9px; margin:2px 2px 2px 0; }
        .auto-pkg-benefits { display:flex; flex-wrap:wrap; gap:5px; margin-bottom:12px; }
        .auto-pkg-benefit { font-size:0.68rem; color:#34d399; background:rgba(16,185,129,0.08); padding:2px 7px; border-radius:12px; }
        .auto-pkg-cta { display:block; width:100%; padding:11px; background:#10B981; color:#000; font-weight:700; font-size:0.85rem; border:none; border-radius:10px; cursor:pointer; text-align:center; text-decoration:none; margin-top:8px; }
        .auto-pkg-cta:hover { background:#059669; }
        .auto-pkg-footnote { font-size:0.72rem; color:#10B981; font-style:italic; margin-top:10px; opacity:0.8; }
        @media (max-width:768px) { .auto-carousel-card { width:320px; margin-left:-160px; padding:22px 18px; } }
      `}</style>

      <div
        ref={wrapRef}
        className="auto-carousel-wrap"
        onClick={onWrapClick}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => { if (autoRef.current) clearInterval(autoRef.current); }}
        onMouseLeave={() => { autoRef.current = setInterval(() => setCurrent(c => (c + 1) % n), 5000); }}
      >
        {packages.map((pkg, i) => (
          <div
            key={pkg.name}
            className={`auto-carousel-card ${getPosition(i, current, n)}`}
            onClick={(e) => { if (i !== current) { e.stopPropagation(); goTo(i); } }}
          >
            {pkg.popular && <span className="auto-pkg-popular">הכי פופולרי</span>}
            <div className="auto-pkg-header">
              <div><div className="auto-pkg-name">{pkg.name}</div></div>
              <div><div className="auto-pkg-price">החל מ-{pkg.price} ₪</div><div className="auto-pkg-price-note">{pkg.priceNote}</div></div>
            </div>
            <p className="auto-pkg-desc">{pkg.desc}</p>
            <p className="auto-pkg-target">{pkg.target}</p>
            <ul className="auto-pkg-items">
              {pkg.items.map(item => <li key={item}><span className="auto-pkg-check">✓</span> {item}</li>)}
            </ul>
            <div className="auto-pkg-bonuses">
              {(pkg.bonusOverride || ['🎁 מיפוי ראשוני חינם', '🎁 בלי חוזה, ביטול בכל עת', '🎁 בלי דמי הקמה', '🎁 20% הנחה לסטארטאפים ועסקים קטנים']).map(b => (
                <span key={b} className="auto-pkg-bonus">{b}</span>
              ))}
            </div>
            <div className="auto-pkg-benefits">
              {pkg.benefits.map(b => <span key={b} className="auto-pkg-benefit">{b}</span>)}
            </div>
            {pkg.footnote && <p className="auto-pkg-footnote">{pkg.footnote}</p>}
            <a className="auto-pkg-cta" href={wa}>דברו איתנו</a>
          </div>
        ))}
      </div>

      <div className="auto-carousel-nav">
        <button className="auto-carousel-btn" onClick={() => go(-1)}>→</button>
        <button className="auto-carousel-btn" onClick={() => go(1)}>←</button>
      </div>
      <div className="auto-carousel-dots">
        {packages.map((_, i) => (
          <button key={i} className={`auto-carousel-dot${i === current ? ' active' : ''}`} onClick={() => goTo(i)} aria-label={`חבילה ${i + 1}`} />
        ))}
      </div>
    </>
  );
}
