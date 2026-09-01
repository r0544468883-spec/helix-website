'use client';

// Shared on-screen teaser for the free-tool reports: a score gauge + dimension bars +
// one headline highlight. The FULL report stays in the downloadable file (see
// QuestionnaireTool). Reuses the ctx-report styling from the AI-context tool.

import ScrollReveal from '../../components/ScrollReveal';

export type Scorecard = { score: number; label: string; dims: { label: string; value: number }[] };

function Gauge({ score, filled }: { score: number; filled: boolean }) {
  const r = 54, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div className="ctx-gauge">
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke="var(--ctx-track,#0f1a15)" strokeWidth="11" />
        <circle cx="62" cy="62" r={r} fill="none" stroke="#10B981" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={filled ? off : c} transform="rotate(-90 62 62)" />
      </svg>
      <div className="ctx-gauge-val"><b>{score}</b><span>מתוך 100</span></div>
    </div>
  );
}

export default function ScoreTeaser({
  org, scorecard, filled, sub, mapTitle, highlightBadge, highlightTitle, highlightBody,
}: {
  org: string;
  scorecard: Scorecard;
  filled: boolean;
  sub: string;
  mapTitle: string;
  highlightBadge: string;
  highlightTitle: string;
  highlightBody: React.ReactNode;
}) {
  const dims = scorecard?.dims ?? [];
  return (
    <>
      <div className="ctx-rep-top">
        <div className="ctx-rep-org"><b>{org}</b></div>
        <div className="ctx-score-row">
          <Gauge score={scorecard?.score ?? 0} filled={filled} />
          <div className="ctx-score-txt">
            <span className="ctx-badge">✓ הניתוח שלכם מוכן</span>
            <h3>{scorecard?.label || 'ציון'}</h3>
            <p>{sub}</p>
          </div>
        </div>
      </div>
      <div className="ctx-rep-body">
        {dims.length > 0 && (
          <ScrollReveal direction="up">
            <div className="ctx-rep-h">{mapTitle}</div>
            <div className="ctx-bars">
              {dims.map((b) => (
                <div key={b.label} className="ctx-bar">
                  <span className="ctx-bar-lbl">{b.label}</span>
                  <div className="ctx-track"><div className="ctx-fill" style={{ width: filled ? `${Math.max(0, Math.min(100, b.value))}%` : '0%' }} /></div>
                  <span className="ctx-bar-pct">{b.value}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        )}
        <div className="ctx-opp"><div className="ctx-solve"><div className="ctx-helix-sol">
          <span className="ctx-sol-badge"><span className="dot" />{highlightBadge}</span>
          <b>{highlightTitle}</b>
          <div style={{ marginTop: 6 }}>{highlightBody}</div>
        </div></div></div>
      </div>
    </>
  );
}
