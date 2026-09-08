'use client';

import { useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { EmojiIcon } from '@/lib/emoji-icon';

/**
 * Drag-morph GTM architecture. קבוצת כרטיסים אחת שזזה בין שני מצבים לפי מיקום הידית (0..1):
 *  p=0 "לפני": הכלים מפוזרים ומחוברים כל-אחד-לכל-אחד (spaghetti אדום) + 💀.
 *  p=1 "אחרי": ארכיטקטורה אמיתית, מקורות משמאל → HubSpot במרכז → תהליך מסודר מימין.
 * תוכן שונה לשיווק ולמכירות (variant). כלים מיותרים נמוגים. הכרטיסים זזים, בלי כפילויות.
 */

type Content = { label: string; logo?: string; icon?: string };
type DataSet = { src: Content[]; redundant: Content[]; proc: Content[] };

const MARKETING: DataSet = {
  src: [
    { label: 'אתר / טפסים', icon: '📥' },
    { label: 'Clay', logo: '/logos/clay.png' },
    { label: 'Meta Ads', logo: '/logos/meta.png' },
    { label: 'Google Ads', logo: '/logos/google-ads.png' },
    { label: 'LinkedIn', logo: '/logos/linkedin.png' },
  ],
  redundant: [
    { label: 'Mailchimp', logo: '/logos/mailchimp.svg' },
    { label: 'גיליונות', icon: '📊' },
    { label: 'Calendly', logo: '/logos/calendly.svg' },
    { label: 'Hotjar', logo: '/logos/hotjar.png' },
    { label: 'Zapier', logo: '/logos/zapier.png' },
  ],
  proc: [
    { label: 'ניקוד לידים', icon: '🎯' },
    { label: 'Lifecycle', icon: '🧭' },
    { label: 'Nurture', icon: '🔄' },
    { label: 'רשימות', icon: '📇' },
    { label: 'Attribution', icon: '📈' },
  ],
};

const SALES: DataSet = {
  src: [
    { label: 'סיגנל כוונה', icon: '🛰️' },
    { label: 'Clay', logo: '/logos/clay.png' },
    { label: 'Apollo', logo: '/logos/apollo.png' },
    { label: 'ZoomInfo', logo: '/logos/zoominfo.png' },
    { label: 'Gong', logo: '/logos/gong.png' },
  ],
  redundant: [
    { label: 'Pipedrive', logo: '/logos/pipedrive.svg' },
    { label: 'גיליונות', icon: '📊' },
    { label: 'Aircall', logo: '/logos/aircall.svg' },
    { label: 'Lusha', logo: '/logos/lusha.png' },
    { label: 'Slack', logo: '/logos/slack.png' },
  ],
  proc: [
    { label: 'ניקוד', icon: '🎯' },
    { label: 'ניתוב + SLA', icon: '🧭' },
    { label: 'Outbound', icon: '📨' },
    { label: 'שלבי Deal', icon: '💼' },
    { label: 'Forecast', icon: '🔮' },
  ],
};

// תבניות מיקום (משותפות): מפוזר (mx,my) ← → מסודר (cx,cy)
const SRC_POS = [
  { mx: 21, my: 66, cx: 13, cy: 16 }, { mx: 33, my: 22, cx: 13, cy: 34 },
  { mx: 72, my: 18, cx: 13, cy: 52 }, { mx: 84, my: 44, cx: 13, cy: 70 }, { mx: 62, my: 78, cx: 13, cy: 88 },
];
const RED_POS = [
  { mx: 16, my: 32 }, { mx: 46, my: 13 }, { mx: 60, my: 40 }, { mx: 37, my: 54 }, { mx: 52, my: 86 },
];
const PROC_POS = [
  { cx: 76, cy: 16 }, { cx: 76, cy: 34 }, { cx: 76, cy: 52 }, { cx: 76, cy: 70 }, { cx: 76, cy: 88 },
];
const HUB = { mx: 50, my: 48, cx: 44, cy: 52 };

const SPAGHETTI: [string, string][] = [
  ['s0', 's2'], ['s1', 'r4'], ['s3', 'r2'], ['r0', 'r3'], ['s4', 'r1'], ['hub', 's0'], ['hub', 's4'],
  ['s2', 'r3'], ['s1', 'r2'], ['r1', 's4'], ['r0', 's3'], ['s0', 'r4'], ['hub', 'r2'],
];
const SKULLS = [{ x: 44, y: 40 }, { x: 60, y: 62 }];
const WARN = [{ x: 36, y: 64 }, { x: 64, y: 38 }];

const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

export default function GtmUntangle({
  variant = 'marketing',
  eyebrow = 'לפני / אחרי',
  title,
  caption = 'גררו ימינה כדי לארגן את הבלגן לארכיטקטורת GTM אחת',
}: {
  variant?: 'marketing' | 'sales';
  eyebrow?: string;
  title: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
}) {
  const data = variant === 'sales' ? SALES : MARKETING;
  const [p, setP] = useState(0.32);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const update = useCallback((clientX: number) => {
    const el = wrapRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    setP(Math.max(0, Math.min(1, (clientX - r.left) / r.width)));
  }, []);
  const down = (e: React.PointerEvent) => { dragging.current = true; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); update(e.clientX); };
  const move = (e: React.PointerEvent) => { if (dragging.current) update(e.clientX); };
  const up = () => { dragging.current = false; };

  // מיקום נוכחי + שקיפות לכל צומת
  const P: Record<string, { x: number; y: number; op: number }> = {};
  SRC_POS.forEach((pos, i) => (P['s' + i] = { x: lerp(pos.mx, pos.cx, p), y: lerp(pos.my, pos.cy, p), op: 1 }));
  RED_POS.forEach((pos, i) => (P['r' + i] = { x: pos.mx, y: pos.my, op: 1 - p }));
  PROC_POS.forEach((pos, i) => (P['p' + i] = { x: lerp(HUB.mx, pos.cx, p), y: lerp(HUB.my, pos.cy, p), op: Math.max(0, (p - 0.25) / 0.75) }));
  P['hub'] = { x: lerp(HUB.mx, HUB.cx, p), y: lerp(HUB.my, HUB.cy, p), op: 1 };

  const curve = (a: string, b: string) => { const s = P[a], t = P[b]; const mx = (s.x + t.x) / 2; return `M ${s.x} ${s.y} C ${mx} ${s.y}, ${mx} ${t.y}, ${t.x} ${t.y}`; };
  const spag = (a: string, b: string) => { const s = P[a], t = P[b]; const dx = (t.x - s.x) * 0.8 + 18; return `M ${s.x} ${s.y} C ${s.x - dx} ${s.y + 12}, ${t.x + dx} ${t.y - 12}, ${t.x} ${t.y}`; };

  const card = (id: string, c: Content, big = false) => {
    const cur = P[id];
    if (cur.op <= 0.02) return null;
    return (
      <span key={id} className={`um-node${big ? ' um-hub' : ''}`} style={{ left: `${cur.x}%`, top: `${cur.y}%`, opacity: cur.op }}>
        <span className="um-ico">{c.logo ? <Image src={c.logo} alt="" width={40} height={20} style={{ height: big ? 20 : 14, width: 'auto' }} /> : <EmojiIcon e={c.icon || '⚙️'} />}</span>
        <span className="um-lbl">{c.label}</span>
      </span>
    );
  };

  return (
    <section className="um-section">
      <style>{`
        .um-section { padding: clamp(48px, 8vw, 92px) 0; }
        .um-head { text-align: center; margin-bottom: 24px; }
        .um-eyebrow { display: inline-block; font-size: 0.8rem; font-weight: 800; letter-spacing: 0.08em; color: var(--brand); text-transform: uppercase; margin-bottom: 10px; }
        .um-head h2 { font-size: clamp(1.6rem, 4vw, 2.4rem); font-weight: 800; }
        .um-wrap { position: relative; max-width: 980px; margin: 0 auto; border-radius: 18px; overflow: hidden; border: 1px solid rgba(255,255,255,0.12); aspect-ratio: 16 / 9; user-select: none; touch-action: none; cursor: ew-resize; background: #0a0e10; background-image: radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px); background-size: 26px 26px; }
        @media (max-width: 640px) { .um-wrap { aspect-ratio: 3 / 4; } }
        .um-tint { position: absolute; inset: 0; pointer-events: none; }
        .um-tint-red { background: radial-gradient(120% 120% at 50% 45%, rgba(150,25,32,0.30), transparent 70%); }
        .um-tint-green { background: radial-gradient(120% 120% at 55% 48%, color-mix(in srgb, var(--brand) 20%, transparent), transparent 72%); }
        .um-svg { position: absolute; inset: 0; width: 100%; height: 100%; }
        .um-colhead { position: absolute; top: 8px; transform: translateX(-50%); font-size: 0.7rem; font-weight: 800; letter-spacing: 0.05em; color: color-mix(in srgb, var(--brand) 70%, #fff); text-transform: uppercase; }
        .um-node { position: absolute; transform: translate(-50%, -50%); display: inline-flex; align-items: center; gap: 7px; background: linear-gradient(160deg, #16231d, #0c1411); border: 1px solid rgba(255,255,255,0.16); border-radius: 10px; padding: 5px 10px 5px 6px; box-shadow: 0 5px 14px rgba(0,0,0,0.5); white-space: nowrap; z-index: 2; }
        .um-ico { width: 24px; height: 24px; border-radius: 6px; background: #fff; display: inline-flex; align-items: center; justify-content: center; flex: 0 0 auto; }
        .um-lbl { font-size: 0.74rem; font-weight: 700; color: #e8eef2; }
        .um-hub { padding: 9px 15px 9px 9px; border-color: color-mix(in srgb, var(--brand) 55%, transparent); box-shadow: 0 0 0 2px color-mix(in srgb, var(--brand) 30%, transparent), 0 0 26px color-mix(in srgb, var(--brand) 40%, transparent); z-index: 3; }
        .um-hub .um-ico { width: 30px; height: 30px; }
        .um-hub .um-lbl { font-size: 0.82rem; }
        .um-mark { position: absolute; transform: translate(-50%,-50%); font-size: 1rem; z-index: 2; filter: drop-shadow(0 0 6px rgba(200,40,50,0.6)); }
        .um-flow { stroke-dasharray: 2.5 3.5; animation: um-dash 1s linear infinite; }
        @keyframes um-dash { to { stroke-dashoffset: -12; } }
        .um-tag { position: absolute; top: 14px; left: 14px; font-size: 0.72rem; font-weight: 800; padding: 5px 12px; border-radius: 999px; z-index: 4; }
        .um-handle { position: absolute; top: 0; bottom: 0; width: 2px; background: rgba(255,255,255,0.5); transform: translateX(-50%); z-index: 5; }
        .um-knob { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); width: 42px; height: 42px; border-radius: 50%; background: #fff; color: #0c1015; display: flex; align-items: center; justify-content: center; font-weight: 900; box-shadow: 0 4px 16px rgba(0,0,0,0.5); }
        .um-caption { text-align: center; color: var(--ink-muted); font-size: 0.9rem; margin-top: 16px; }
        .um-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); }
        @media (max-width: 640px) { .um-lbl { display: none; } .um-node { padding: 5px; } .um-hub .um-lbl { display: inline; font-size: 0.7rem; } .um-colhead { display: none; } }
        @media (prefers-reduced-motion: reduce) { .um-flow { animation: none; } }
      `}</style>

      <div className="container">
        <div className="um-head">
          <span className="um-eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
        </div>

        <div ref={wrapRef} className="um-wrap" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          <div className="um-tint um-tint-red" style={{ opacity: 1 - p }} />
          <div className="um-tint um-tint-green" style={{ opacity: p }} />

          <svg className="um-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            {(1 - p) > 0.03 && SPAGHETTI.map(([a, b], i) => (
              <path key={'s' + i} d={spag(a, b)} fill="none" stroke="#e5545f" strokeWidth={1.4} strokeOpacity={(1 - p) * 0.7} vectorEffect="non-scaling-stroke" />
            ))}
            {p > 0.03 && [
              ...SRC_POS.map((_, i) => ['s' + i, 'hub'] as [string, string]),
              ...PROC_POS.map((_, i) => ['hub', 'p' + i] as [string, string]),
            ].map(([a, b], i) => (
              <path key={'c' + i} d={curve(a, b)} fill="none" stroke="var(--brand)" strokeWidth={1.4} strokeOpacity={p * 0.9} vectorEffect="non-scaling-stroke" className={p > 0.5 ? 'um-flow' : undefined} />
            ))}
          </svg>

          <span className="um-colhead" style={{ left: '13%', opacity: Math.max(0, (p - 0.4) / 0.6) }}>מקורות</span>
          <span className="um-colhead" style={{ left: '76%', opacity: Math.max(0, (p - 0.4) / 0.6) }}>תהליך ב-HubSpot</span>

          {(1 - p) > 0.05 && SKULLS.map((s, i) => <span key={'k' + i} className="um-mark" style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: 1 - p }}><EmojiIcon e="💀" /></span>)}
          {(1 - p) > 0.05 && WARN.map((s, i) => <span key={'w' + i} className="um-mark" style={{ left: `${s.x}%`, top: `${s.y}%`, opacity: 1 - p }}><EmojiIcon e="⚠️" /></span>)}

          {data.redundant.map((c, i) => card('r' + i, c))}
          {data.src.map((c, i) => card('s' + i, c))}
          {data.proc.map((c, i) => card('p' + i, c))}
          {card('hub', { label: p > 0.5 ? 'HubSpot · מקור אמת' : 'HubSpot', logo: '/logos/hubspot.png' }, true)}

          <div className="um-tag" style={{ background: p < 0.5 ? 'rgba(210,55,65,0.9)' : 'var(--brand)', color: p < 0.5 ? '#fff' : '#04150e' }}>
            {p < 0.5 ? 'לפני · בלגן' : 'אחרי · ארכיטקטורה אחת'}
          </div>
          <div className="um-handle" style={{ left: `${p * 100}%` }}><div className="um-knob">⇄</div></div>
          <input className="um-sr" type="range" min={0} max={100} value={Math.round(p * 100)} onChange={(e) => setP(Number(e.target.value) / 100)} aria-label="גררו כדי לארגן" />
        </div>

        <p className="um-caption">{caption}</p>
      </div>
    </section>
  );
}
