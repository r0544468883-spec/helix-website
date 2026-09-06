'use client';

// A static, non-interactive "this is what the output looks like" preview for the free-tool
// landing pages, so visitors see the report shape before they start. Uses sample data.

function MiniGauge({ score }: { score: number }) {
  const r = 44, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return (
    <div style={{ position: 'relative', width: 104, height: 104, flexShrink: 0 }}>
      <svg width="104" height="104" viewBox="0 0 104 104">
        <circle cx="52" cy="52" r={r} fill="none" stroke="var(--border)" strokeWidth="9" />
        <circle cx="52" cy="52" r={r} fill="none" stroke="var(--brand)" strokeWidth="9" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 52 52)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
        <div><b style={{ fontSize: 26, color: 'var(--ink)' }}>{score}</b><div style={{ fontSize: 11, color: 'var(--ink-muted)' }}>מתוך 100</div></div>
      </div>
    </div>
  );
}

export default function SamplePreview({
  score, scoreLabel, dims, highlightBadge, highlightTitle, highlightBody,
}: {
  score: number; scoreLabel: string; dims: { label: string; value: number }[];
  highlightBadge: string; highlightTitle: string; highlightBody: string;
}) {
  return (
    <div dir="rtl" style={{ maxWidth: 620, margin: '0 auto', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, padding: 'clamp(18px,3vw,28px)', boxShadow: '0 20px 60px -30px rgba(0,0,0,0.3)' }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--brand)', fontWeight: 700, marginBottom: 14 }}>דוגמה לפלט</div>
      <div style={{ display: 'flex', gap: 18, alignItems: 'center', flexWrap: 'wrap' }}>
        <MiniGauge score={score} />
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 700 }}>✓ הניתוח שלכם מוכן</div>
          <h3 style={{ fontSize: 20, color: 'var(--ink)', margin: '4px 0 0' }}>{scoreLabel}</h3>
        </div>
      </div>
      <div style={{ display: 'grid', gap: 10, marginTop: 18 }}>
        {dims.map((b) => (
          <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 34px', gap: 10, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>{b.label}</span>
            <div style={{ height: 8, background: 'var(--bg-soft)', borderRadius: 99, overflow: 'hidden' }}><div style={{ height: '100%', width: `${b.value}%`, background: 'var(--brand)', borderRadius: 99 }} /></div>
            <span style={{ fontSize: 12, color: 'var(--ink-muted)', textAlign: 'left' }}>{b.value}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 18, background: 'color-mix(in srgb, var(--brand) 6%, var(--bg))', border: '1px solid var(--border)', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--brand)', fontWeight: 700, marginBottom: 6 }}><span style={{ width: 6, height: 6, borderRadius: 99, background: 'var(--brand)' }} />{highlightBadge}</div>
        <b style={{ display: 'block', fontSize: 15, color: 'var(--ink)' }}>{highlightTitle}</b>
        <p style={{ fontSize: 14, color: 'var(--ink-secondary)', margin: '4px 0 0', lineHeight: 1.6 }}>{highlightBody}</p>
      </div>
      <p style={{ fontSize: 12, color: 'var(--ink-muted)', textAlign: 'center', margin: '14px 0 0' }}>הדוח המלא, עם כל המודלים והטבלאות, מגיע כקובץ להורדה.</p>
    </div>
  );
}
