'use client';

import { useEffect, useRef, useState } from 'react';

type Chart = { label: string; value: string; delta?: string; series: number[]; kind?: 'area' | 'bars' };

// A live mini-chart per article, each tied to the article's actual subject
// (e.g. the OCR piece animates the real 40%→94% accuracy curve; the retention
// piece draws a declining cohort curve). Mirrors the Dashboards product tiles.
const CHART_BY_SLUG: Record<string, Chart> = {
  'no-price-on-site': { label: 'שווי עסקה ממוצע', value: '₪18.4K', delta: '+22%', series: [40, 44, 50, 48, 58, 64, 72, 80] },
  'reading-a-campaign': { label: 'המרה לליד משלם', value: '4.7%', delta: '+1.8pt', series: [22, 28, 26, 34, 40, 46, 52, 63] },
  'dev-and-marketer-not-talking': { label: 'המרה אחרי סנכרון', value: '+31%', delta: 'צוות אחד', series: [30, 32, 30, 45, 58, 66, 74, 82] },
  'project-spec-guide': { label: 'scope תחת שליטה', value: 'יציב', delta: 'בלי זחילה', kind: 'bars', series: [40, 52, 63, 70, 55, 50, 48, 47] },
  'hebrew-ocr': { label: 'דיוק OCR', value: '94%', delta: '+54pt', series: [40, 45, 52, 60, 70, 78, 88, 94] },
  'beachhead-market': { label: 'נתח בראש-הגשר', value: '86%', delta: 'שליטה', series: [15, 22, 30, 38, 50, 62, 74, 86] },
  'icp-target-audience': { label: 'איכות ליד לפי פילוח', value: '×2.4', delta: 'ICP חד', kind: 'bars', series: [35, 45, 42, 58, 66, 72, 80, 88] },
  'gtm-israel': { label: 'צמיחה חודשית', value: '+90%', delta: 'בהדרגה', series: [20, 26, 30, 40, 52, 63, 76, 90] },
  'marketing-loop-vs-funnel': { label: 'לקוחות מהלולאה', value: 'מצטבר', delta: 'loop', series: [12, 16, 22, 30, 42, 56, 72, 92] },
  'attribution-explained': { label: 'המרות לפי ערוץ', value: '5 ערוצים', delta: 'מיוחס', kind: 'bars', series: [70, 40, 85, 55, 90, 45, 75, 60] },
  'budget-loop': { label: 'החזר על התקציב', value: '×3.1', delta: 'למנצחים', series: [30, 36, 33, 44, 52, 60, 70, 82] },
  'viral-loop': { label: 'k-factor מצטבר', value: '0.9', delta: 'ויראלי', series: [10, 14, 20, 28, 40, 55, 72, 94] },
  'plg-small-business': { label: 'שיעור הפעלה', value: '64%', delta: '+15pt', series: [5, 8, 12, 18, 28, 40, 52, 64] },
  'cohort-retention': { label: 'שימור לאורך זמן', value: '49%', delta: 'churn ↓', series: [100, 82, 70, 62, 56, 52, 50, 49] },
  'ai-marketing-tools': { label: 'תפוקת תוכן', value: '×3', delta: 'AI', kind: 'bars', series: [40, 48, 44, 60, 68, 74, 82, 90] },
  'ai-agents-bd': { label: 'פגישות שנקבעו', value: '+84%', delta: 'סוכן AI', series: [20, 24, 30, 38, 48, 58, 70, 84] },
  'ai-content-human': { label: 'זמן שהייה בעמוד', value: '+61%', delta: 'אנושי', series: [30, 34, 38, 44, 50, 58, 66, 78] },
};

const FALLBACK: Chart = { label: 'צמיחה', value: '+', series: [20, 30, 28, 42, 55, 64, 76, 88] };

function areaPaths(series: number[]) {
  const n = series.length;
  const pts = series.map((v, i) => `${(i / (n - 1)) * 100},${40 - (v / 100) * 34 - 3}`);
  const line = `M ${pts.join(' L ')}`;
  return { line, fill: `${line} L 100,40 L 0,40 Z`, last: pts[pts.length - 1].split(',').map(Number) };
}

export default function ArticleChart({ slug, accent = '#10B981' }: { slug: string; accent?: string }) {
  const chart = CHART_BY_SLUG[slug] ?? FALLBACK;
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setInView(true), io.disconnect()),
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const bars = chart.kind === 'bars';
  const { line, fill, last } = areaPaths(chart.series);

  return (
    <div
      ref={ref}
      className={`achart${inView ? ' is-in' : ''}`}
      style={{ ['--ac' as string]: accent }}
      aria-hidden="true"
    >
      <div className="achart-head">
        <span className="achart-label">{chart.label}</span>
        {chart.delta && <span className="achart-delta">{chart.delta}</span>}
      </div>
      <span className="achart-value">{chart.value}</span>

      <div className="achart-plot">
        {bars ? (
          <div className="achart-bars">
            {chart.series.map((h, i) => (
              <span key={i} className="achart-bar" style={{ ['--h' as string]: `${h}%`, ['--d' as string]: `${i * 55}ms` }} />
            ))}
          </div>
        ) : (
          <svg className="achart-svg" viewBox="0 0 100 40" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`ac-${slug}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity="0.28" />
                <stop offset="100%" stopColor={accent} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path className="achart-fill" d={fill} fill={`url(#ac-${slug})`} />
            <path className="achart-line" d={line} pathLength={1} fill="none" stroke={accent} strokeWidth="1.6" vectorEffect="non-scaling-stroke" />
            <circle className="achart-dot" cx={last[0]} cy={last[1]} r="2.2" fill={accent} vectorEffect="non-scaling-stroke" />
          </svg>
        )}
      </div>
    </div>
  );
}
