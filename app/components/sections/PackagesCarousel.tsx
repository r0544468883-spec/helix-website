'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { SITE } from '@/lib/site';

const wa = (msg: string) => `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;

type Addon = [string, string];
type Pkg = {
  tag: string; name: string; price: string; market: string;
  pitch: string; items: string[]; bonuses: string[];
  addons?: Addon[]; href: string;
};

const packages: Pkg[] = [
  {
    tag: 'חבילה 01', name: 'שיווק דיגיטלי', price: '1,250', market: '5,000–8,000',
    pitch: 'קמפיין שפועל. לידים שמגיעים. דוח שאפשר לקרוא בלי תרגום.',
    items: ['אסטרטגיית שיווק, מחקר קהלים ומסרים', 'ניהול קמפיינים: Google · Meta · TikTok', 'SEO אורגני + GEO (מנועי AI)', 'ניהול סושיאל, תוכן וקריאייטיב', 'דוח חודשי מפורט', 'פגישה שבועית של 30 דקות'],
    bonuses: ['בלי חוזה', 'בלי דמי הקמה', 'שיחת אסטרטגיה ראשונה חינם', '20% הנחה לסטארטאפים'],
    addons: [['מאמר SEO מותאם','550 ₪'],['SEO בסיסי לעמוד','350 ₪'],['SEO מתקדם','1,200 ₪'],['שעת ייעוץ דיגיטלי','350 ₪'],['ניתוח אטריביוציה','1,400 ₪'],['ריטרגטינג דינמי','650 ₪'],['Brand Awareness','800 ₪/חודש']],
    href: '/services/marketing',
  },
  {
    tag: 'חבילה 02', name: 'אתרים ואיקומרס', price: '1,250', market: '8,000–15,000 חד פעמי',
    pitch: 'מאסטרטגיה ועד תחזוקה שוטפת. האתר עולה לאוויר ונשאר חי.',
    items: ['אפיון ואסטרטגיית אתר / חנות', 'עיצוב UX/UI ופיתוח מלא', 'חנות eCommerce · דף נחיתה · אתר תדמית', 'SEO בסיסי + תחזוקה שוטפת', 'דוח חודשי מפורט', 'פגישה שבועית של 30 דקות'],
    bonuses: ['בלי חוזה', 'בלי דמי הקמה', 'שיחת אפיון ראשונה חינם', '20% הנחה לסטארטאפים'],
    addons: [['עמוד נוסף','480 ₪'],['תשתית בלוג','550 ₪'],['תרגום שפה','480 ₪'],['תחזוקה מורחבת','350 ₪/חודש'],['נגישות 5568','1,200 ₪'],['PWA','1,500 ₪']],
    href: '/services/websites',
  },
  {
    tag: 'חבילה 03', name: 'אוטומציות חכמות', price: '300', market: '4,000–7,000',
    pitch: 'לידים נכנסים, הודעות נשלחות, סטטוסים מתעדכנים — הכל אוטומטי.',
    items: ['מיפוי תהליכים ואסטרטגיית אוטומציה', 'הטמעת כלים: CRM · Email · WhatsApp', 'בניית Funnel אוטומטי', 'שיחת אפיון ללא עלות'],
    bonuses: ['בלי חוזה', 'בלי דמי הקמה', 'מיפוי ראשוני חינם', '20% הנחה לסטארטאפים'],
    addons: [['איסוף לידים ל-Sheets','350 ₪'],['חיבור CRM','650 ₪'],['מערכת דיוור','750 ₪'],['WhatsApp API','1,200 ₪'],['בוט פגישות','550 ₪'],['חתימה דיגיטלית','450 ₪']],
    href: '/services/automation',
  },
  {
    tag: 'חבילה 04', name: 'Growth Hacking', price: '1,250', market: '5,000–8,000',
    pitch: 'ניסויים, אופטימיזציה, ו-AI שעובדים בשבילך על הצמיחה.',
    items: ['אסטרטגיית צמיחה מותאמת', 'A/B Testing ואופטימיזציית המרות', 'AI Chatbot לפלטפורמה לבחירה', 'דוח מתחרים ומיפוי שוק', 'דוח חודשי מפורט', 'פגישה שבועית של 30 דקות'],
    bonuses: ['בלי חוזה', 'בלי דמי הקמה', 'אבחון צמיחה ראשוני חינם', '20% הנחה לסטארטאפים'],
    addons: [['צ׳אטבוט נוסף','600 ₪/חודש'],['חיזוק לינקדין (4 פוסטים)','600 ₪/חודש'],['דוח מתחרים חודשי','350 ₪/חודש']],
    href: '/services/growth',
  },
  {
    tag: 'חבילה 05', name: 'תהליכי מכירה אוטומטיים', price: '1,250', market: '6,000–10,000',
    pitch: 'אוטומציית Outreach בלינקדין ובאימייל. לידים מגיעים אליך.',
    items: ['אסטרטגיית מכירות דיגיטלית', 'Data Enrichment + LinkedIn Sales Navigator', 'הקמת תהליכי SDR אוטומטיים', 'Outreach sequences מותאמים', 'דוח חודשי מפורט', 'פגישה שבועית של 30 דקות'],
    bonuses: ['בלי חוזה', 'בלי דמי הקמה', 'מיפוי ICP ראשוני חינם', '20% הנחה לסטארטאפים'],
    addons: [['העשרת רשומות B2B','490 ₪'],['ניהול תיבת LinkedIn','390 ₪/חודש'],['סדרת מסרים מותאמת','650 ₪'],['פולואפ אימייל קר','350 ₪/חודש']],
    href: '/services/sales',
  },
  {
    tag: 'פיתוח', name: 'בנק שעות פיתוח', price: '300', market: '',
    pitch: 'פיתוח, אפיון וייעוץ טרנספורמציה עסקית לבינה מלאכותית.',
    items: ['שעת פיתוח או ייעוץ — 300 ₪', '3 שעות — 800 ₪ (חוסכים 100 ₪)', 'ספרינט 5 שעות — 1,250 ₪ ⭐ מומלץ', 'Pay As You Go 10+ שעות — 220 ₪/שעה'],
    bonuses: ['בלי חוזה', 'MVP · אינטגרציה · ייעוץ AI', 'דוח חודשי מפורט'],
    href: '/services/development',
  },
  {
    tag: 'תוכנות', name: 'הכלים של HELIX', price: '1,250', market: '',
    pitch: 'התוכנות שכבר בנינו ושנמשיך לבנות. בתשלום חודשי, בלי לפתח מאפס.',
    items: ['גישה מלאה לתוכנה כולל עדכונים', 'פיצ׳רים נוספים ברכישת שעות פיתוח', 'דוח חודשי מפורט'],
    bonuses: ['בלי חוזה', 'או 500 ₪ לתוכנה בודדת'],
    href: '/services/tools',
  },
];

function getPosition(index: number, center: number, total: number) {
  const diff = ((index - center) % total + total) % total;
  if (diff === 0) return 'pkc-center';
  if (diff === 1) return 'pkc-left';
  if (diff === total - 1) return 'pkc-right';
  if (diff === 2) return 'pkc-far-left';
  if (diff === total - 2) return 'pkc-far-right';
  if (diff === 3) return 'pkc-far-far-left';
  if (diff === total - 3) return 'pkc-far-far-right';
  return 'pkc-hidden';
}

export default function PackagesCarousel() {
  const [current, setCurrent] = useState(0);
  const [modalIdx, setModalIdx] = useState<number | null>(null);
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
    autoRef.current = setInterval(() => setCurrent(c => (c + 1) % n), 6000);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [n]);

  // Keyboard
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (modalIdx !== null && e.key === 'Escape') { setModalIdx(null); return; }
      if (e.key === 'ArrowRight') go(-1);
      if (e.key === 'ArrowLeft') go(1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [go, modalIdx]);

  // Wheel
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const h = (e: WheelEvent) => { e.preventDefault(); go(e.deltaY > 0 ? 1 : -1); };
    el.addEventListener('wheel', h, { passive: false });
    return () => el.removeEventListener('wheel', h);
  }, [go]);

  // Touch
  const touchX = useRef(0);

  // Click half
  const onWrapClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.pkc-cta,.pkc-more,.pkc-expand')) return;
    if ((e.target as HTMLElement).closest('.pkc-card:not(.pkc-center)')) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    go(e.clientX - rect.left < rect.width / 2 ? 1 : -1);
  };

  const pkg = modalIdx !== null ? packages[modalIdx] : null;

  return (
    <section className="pkc-section" id="packages">
      {/* Modal */}
      {pkg && (
        <div className="pkc-overlay" onClick={(e) => { if (e.target === e.currentTarget) setModalIdx(null); }}>
          <div className="pkc-modal">
            <button className="pkc-modal-close" onClick={() => setModalIdx(null)}>✕</button>
            <span className="pkc-modal-tag">{pkg.tag}</span>
            <div className="pkc-modal-name">{pkg.name}</div>
            <p className="pkc-modal-pitch">{pkg.pitch}</p>
            <div className="pkc-modal-price">החל מ-{pkg.price} ₪</div>
            {pkg.market && <p className="pkc-modal-market">במקום <s>{pkg.market} ₪</s></p>}
            <div className="pkc-modal-label">מה כלול?</div>
            <ul className="pkc-modal-items">
              {pkg.items.map(it => <li key={it}><span className="pkc-check">✓</span> {it}</li>)}
            </ul>
            <div className="pkc-modal-bonuses">
              {pkg.bonuses.map(b => <span key={b} className="pkc-modal-bonus">🎁 {b}</span>)}
            </div>
            {pkg.addons && pkg.addons.length > 0 && (
              <>
                <div className="pkc-modal-label">אפשר להוסיף:</div>
                {pkg.addons.map(a => (
                  <div key={a[0]} className="pkc-addon-row"><span>{a[0]}</span><b>{a[1]}</b></div>
                ))}
              </>
            )}
            <a className="pkc-modal-cta" href={wa(`שלום, ראיתי את ${pkg.name} ב-helix.co.il`)} target="_blank" rel="noopener noreferrer">דברו איתנו</a>
            <a className="pkc-modal-more" href={`${pkg.href}#packages`}>לדף החבילה המלא ←</a>
          </div>
        </div>
      )}

      <div className="container">
        <div className="pkc-header">
          <span className="pkc-eyebrow">החבילות</span>
          <h2 className="pkc-title">הילדים הטובים של עולם הדיגיטל.</h2>
          <p className="pkc-subtitle">בלי חוזה, בלי דמי הקמה. החל מ-300 ₪.</p>
        </div>

        <div className="pkc-layout">
          {/* Sidebar nav — desktop */}
          <nav className="pkc-nav pkc-nav-desktop">
            {packages.map((p, i) => (
              <button key={p.tag} className={`pkc-nav-item ${i === current ? 'active' : ''}`} onClick={() => goTo(i)}>
                {p.name}
                <span className="pkc-nav-tag">{p.tag}</span>
              </button>
            ))}
          </nav>

          {/* Tabs — mobile */}
          <div className="pkc-nav pkc-nav-mobile">
            {packages.map((p, i) => (
              <button key={p.tag} className={`pkc-tab ${i === current ? 'active' : ''}`} onClick={() => goTo(i)}>
                {p.name}
              </button>
            ))}
          </div>

          {/* Carousel */}
          <div className="pkc-carousel-area">
            <div
              ref={wrapRef}
              className="pkc-wrap"
              onClick={onWrapClick}
              onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
              onTouchEnd={(e) => { const d = touchX.current - e.changedTouches[0].clientX; if (Math.abs(d) > 20) go(d > 0 ? 1 : -1); }}
              onMouseEnter={() => { if (autoRef.current) clearInterval(autoRef.current); }}
              onMouseLeave={() => { autoRef.current = setInterval(() => setCurrent(c => (c + 1) % n), 6000); }}
            >
              {packages.map((p, i) => (
                <div
                  key={p.tag}
                  className={`pkc-card ${getPosition(i, current, n)}`}
                  onClick={(e) => { if (i !== current) { e.stopPropagation(); goTo(i); } }}
                >
                  <span className="pkc-tag">{p.tag}</span>
                  <div className="pkc-name">{p.name}</div>
                  <p className="pkc-pitch">{p.pitch}</p>
                  <div className="pkc-price-row">
                    <span className="pkc-price-label">החל מ-</span>
                    <span className="pkc-price">{p.price} ₪</span>
                  </div>
                  {p.market && <p className="pkc-market">במקום <s>{p.market} ₪</s></p>}
                  <ul className="pkc-items">
                    {p.items.slice(0, 3).map(it => <li key={it}><span className="pkc-check">✓</span> {it}</li>)}
                    {p.items.length > 3 && <li className="pkc-items-more">+{p.items.length - 3} נוספים</li>}
                  </ul>
                  <div className="pkc-bonuses">
                    {p.bonuses.slice(0, 2).map(b => <span key={b} className="pkc-bonus">🎁 {b}</span>)}
                  </div>
                  <button className="pkc-expand" onClick={(e) => { e.stopPropagation(); setModalIdx(i); }}>כל הפרטים + אפשר להוסיף ▼</button>
                  <a className="pkc-cta" href={wa(`שלום, ראיתי את ${p.name} ב-helix.co.il`)} target="_blank" rel="noopener noreferrer">דברו איתנו</a>
                  <a className="pkc-more" href={`${p.href}#packages`}>פרטים נוספים ←</a>
                </div>
              ))}
            </div>

            <div className="pkc-controls">
              <button className="pkc-btn" onClick={() => go(-1)}>→</button>
              <div className="pkc-dots">
                {packages.map((_, i) => (
                  <button key={i} className={`pkc-dot ${i === current ? 'active' : ''}`} onClick={() => goTo(i)} />
                ))}
              </div>
              <button className="pkc-btn" onClick={() => go(1)}>←</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
