'use client';

import { useEffect, useRef, useState } from 'react';

type Kind = 'area' | 'bars' | 'funnel' | 'ring' | 'gauge' | 'loop' | 'stat' | 'milestones' | 'compare';
type Cfg = {
  type: Kind;
  label: string;
  value: string;
  delta?: string;
  series?: number[];
  pct?: number;
  steps?: { k: string; v: number }[];
  a?: { k: string; v: number };
  b?: { k: string; v: number };
  total?: number;
  done?: number;
  nodes?: string[];
};

// A varied dashboard-style tile per article, each tied to the article's subject.
const W: Record<string, Cfg> = {
  'transparent-pricing': { type: 'bars', label: 'מסלולי מוצר · גלוי', value: '₪199+', delta: '3 מסלולים', series: [40, 70, 100] },
  'reading-a-campaign': { type: 'funnel', label: 'מסע הליד', value: '3 סגירות', delta: 'מ-300', steps: [{ k: 'לידים', v: 300 }, { k: 'שיחות', v: 64 }, { k: 'הצעות', v: 22 }, { k: 'סגירות', v: 3 }] },
  'dev-and-marketer-not-talking': { type: 'compare', label: 'המרה', value: '+31%', delta: 'אחרי סנכרון', a: { k: 'לפני', v: 38 }, b: { k: 'אחרי', v: 82 } },
  'project-spec-guide': { type: 'milestones', label: 'שלבי אפיון', value: '5/5', delta: 'scope נעול', total: 5, done: 5 },
  'hebrew-ocr': { type: 'ring', label: 'דיוק OCR', value: '94%', delta: '+54pt', pct: 94 },
  'beachhead-market': { type: 'gauge', label: 'נתח בראש-הגשר', value: '86%', delta: 'שליטה', pct: 86 },
  'icp-target-audience': { type: 'bars', label: 'איכות ליד לפי פילוח', value: '×2.4', delta: 'ICP חד', series: [35, 45, 42, 58, 66, 72, 80, 88] },
  'gtm-israel': { type: 'area', label: 'צמיחה חודשית', value: '+90%', delta: 'בהדרגה', series: [20, 26, 30, 40, 52, 63, 76, 90] },
  'marketing-loop-vs-funnel': { type: 'loop', label: 'לולאת שיווק', value: 'מצטבר', delta: 'loop', nodes: ['תוכן', 'לקוח', 'המלצה', 'תנועה'] },
  'attribution-explained': { type: 'bars', label: 'המרות לפי ערוץ', value: '5 ערוצים', delta: 'מיוחס', series: [70, 40, 85, 55, 90, 45, 75, 60] },
  'budget-loop': { type: 'gauge', label: 'החזר על התקציב', value: '×3.1', delta: 'למנצחים', pct: 78 },
  'viral-loop': { type: 'area', label: 'k-factor מצטבר', value: '0.9', delta: 'ויראלי', series: [10, 14, 20, 28, 40, 55, 72, 94] },
  'plg-small-business': { type: 'ring', label: 'שיעור הפעלה', value: '64%', delta: '+15pt', pct: 64 },
  'cohort-retention': { type: 'area', label: 'שימור לאורך זמן', value: '49%', delta: 'churn ↓', series: [100, 82, 70, 62, 56, 52, 50, 49] },
  'ai-marketing-tools': { type: 'bars', label: 'תפוקת תוכן', value: '×3', delta: 'AI', series: [40, 48, 44, 60, 68, 74, 82, 90] },
  'ai-agents-bd': { type: 'stat', label: 'פגישות שנקבעו', value: '+84%', delta: 'סוכן AI', series: [20, 24, 30, 38, 48, 58, 70, 84] },
  'ai-content-human': { type: 'compare', label: 'זמן שהייה', value: '+61%', delta: 'אחרי גייט', a: { k: 'AI גולמי', v: 32 }, b: { k: 'אנושי', v: 78 } },
};
const FALLBACK: Cfg = { type: 'area', label: 'צמיחה', value: '+', series: [20, 30, 28, 42, 55, 64, 76, 88] };

function linePaths(series: number[]) {
  const n = series.length;
  const pts = series.map((v, i) => `${(i / (n - 1)) * 100},${40 - (v / 100) * 34 - 3}`);
  const line = `M ${pts.join(' L ')}`;
  return { line, fill: `${line} L 100,40 L 0,40 Z`, last: pts[pts.length - 1].split(',').map(Number) };
}

const AC = '#10B981';

export default function ArticleChart({ slug }: { slug: string }) {
  const c = W[slug] ?? FALLBACK;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setInView(true), io.disconnect()), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`achart achart--${c.type}${inView ? ' is-in' : ''}`} aria-hidden="true">
      <div className="achart-head">
        <span className="achart-label">{c.label}</span>
        {c.delta && <span className="achart-delta">{c.delta}</span>}
      </div>
      {c.type !== 'ring' && c.type !== 'gauge' && c.type !== 'loop' && <span className="achart-value">{c.value}</span>}
      <div className="achart-plot">{renderPlot(slug, c)}</div>
    </div>
  );
}

function renderPlot(slug: string, c: Cfg) {
  switch (c.type) {
    case 'area': {
      const { line, fill, last } = linePaths(c.series ?? FALLBACK.series!);
      return (
        <svg className="achart-svg" viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`ac-${slug}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={AC} stopOpacity="0.28" />
              <stop offset="100%" stopColor={AC} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="achart-fill" d={fill} fill={`url(#ac-${slug})`} />
          <path className="achart-line" d={line} pathLength={1} fill="none" stroke={AC} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
          <circle className="achart-dot" cx={last[0]} cy={last[1]} r="2.2" fill={AC} vectorEffect="non-scaling-stroke" />
        </svg>
      );
    }
    case 'bars':
      return (
        <div className="achart-bars">
          {(c.series ?? []).map((h, i) => (
            <span key={i} className="achart-bar" style={{ ['--h' as string]: `${h}%`, ['--d' as string]: `${i * 55}ms` }} />
          ))}
        </div>
      );
    case 'funnel': {
      const max = Math.max(...(c.steps ?? []).map((s) => s.v));
      return (
        <div className="achart-funnel">
          {(c.steps ?? []).map((s, i) => (
            <div key={i} className="achart-fn-row" style={{ ['--d' as string]: `${i * 110}ms` }}>
              <span className="achart-fn-k">{s.k}</span>
              <span className="achart-fn-bar" style={{ ['--w' as string]: `${Math.max(14, (s.v / max) * 100)}%` }} />
            </div>
          ))}
        </div>
      );
    }
    case 'ring': {
      const pct = c.pct ?? 0;
      return (
        <div className="achart-ringwrap">
          <svg className="achart-ring" viewBox="0 0 36 36">
            <circle className="achart-ring-bg" cx="18" cy="18" r="15.915" />
            <circle className="achart-ring-fg" cx="18" cy="18" r="15.915" stroke={AC} style={{ ['--p' as string]: pct }} />
          </svg>
          <span className="achart-ring-val">{c.value}</span>
        </div>
      );
    }
    case 'gauge': {
      const pct = c.pct ?? 0;
      // semicircle: length ~ 100 via r so dashoffset maps to pct
      return (
        <div className="achart-gaugewrap">
          <svg className="achart-gauge" viewBox="0 0 100 54">
            <path className="achart-gauge-bg" d="M6 50 A44 44 0 0 1 94 50" fill="none" />
            <path className="achart-gauge-fg" d="M6 50 A44 44 0 0 1 94 50" fill="none" stroke={AC} pathLength={1} style={{ ['--p' as string]: pct / 100 }} />
          </svg>
          <span className="achart-gauge-val">{c.value}</span>
        </div>
      );
    }
    case 'loop': {
      const nodes = c.nodes ?? [];
      return (
        <div className="achart-loopwrap">
          <svg className="achart-loop" viewBox="0 0 40 40">
            <circle className="achart-loop-track" cx="20" cy="20" r="14" fill="none" />
            <circle className="achart-loop-run" cx="20" cy="20" r="14" fill="none" stroke={AC} pathLength={1} />
            {nodes.map((_, i) => {
              const a = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
              return <circle key={i} className="achart-loop-node" cx={20 + Math.cos(a) * 14} cy={20 + Math.sin(a) * 14} r="2.4" fill={AC} style={{ ['--d' as string]: `${i * 140}ms` }} />;
            })}
          </svg>
          <span className="achart-loop-val">{c.value}</span>
        </div>
      );
    }
    case 'stat': {
      const { line, fill } = linePaths(c.series ?? FALLBACK.series!);
      return (
        <svg className="achart-spark" viewBox="0 0 100 40" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`sp-${slug}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={AC} stopOpacity="0.22" />
              <stop offset="100%" stopColor={AC} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path className="achart-fill" d={fill} fill={`url(#sp-${slug})`} />
          <path className="achart-line" d={line} pathLength={1} fill="none" stroke={AC} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        </svg>
      );
    }
    case 'milestones': {
      const total = c.total ?? 5, done = c.done ?? total;
      return (
        <div className="achart-ms">
          <span className="achart-ms-track" />
          <span className="achart-ms-fill" style={{ ['--p' as string]: `${(done - 1) / (total - 1) * 100}%` }} />
          {Array.from({ length: total }).map((_, i) => (
            <span key={i} className={`achart-ms-dot${i < done ? ' on' : ''}`} style={{ ['--d' as string]: `${i * 120}ms` }} />
          ))}
        </div>
      );
    }
    case 'compare':
      return (
        <div className="achart-cmp">
          {[c.a, c.b].map((s, i) =>
            s ? (
              <div key={i} className={`achart-cmp-row${i === 1 ? ' hot' : ''}`}>
                <span className="achart-cmp-k">{s.k}</span>
                <span className="achart-cmp-bar" style={{ ['--w' as string]: `${s.v}%`, ['--d' as string]: `${i * 160}ms` }} />
              </div>
            ) : null,
          )}
        </div>
      );
    default:
      return null;
  }
}
