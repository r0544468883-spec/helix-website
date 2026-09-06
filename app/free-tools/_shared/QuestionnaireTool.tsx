'use client';

// Shared multi-step questionnaire for the free tools (differentiation + sales).
// UX: an ACCORDION, answered steps stay above the current one, dimmed and clickable
// (click to go back and edit); the next question opens BELOW. Supports field types
// text / textarea / email / segmented / multi / dealslider (a draggable bar + manual
// input + a "larger amounts" tier toggle). After the run it shows a small teaser on
// screen (gauge/score/headline) and gates the FULL report behind a file download.

import { useState, useRef, useEffect, type ReactNode } from 'react';

export type FieldType = 'text' | 'textarea' | 'email' | 'segmented' | 'multi' | 'dealslider';
export interface Field { key: string; type: FieldType; placeholder?: string; dir?: 'ltr' | 'rtl'; required?: boolean; options?: string[]; }
export interface Step { section: string; q: string; hint?: string; fields: Field[]; }

export type Answers = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TIERS = {
  low: { min: 10, max: 10000, step: 10, label: 'עשרות עד אלפי שקלים', toggle: 'סכומים גדולים יותר ←' },
  high: { min: 10000, max: 100000, step: 1000, label: 'אלפי עד עשרות אלפי שקלים', toggle: '→ סכומים קטנים יותר' },
} as const;
const shekel = (n: number) => `₪${Math.round(n).toLocaleString('en-US')}`;

function DealSlider({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [tier, setTier] = useState<'low' | 'high'>('low');
  const t = TIERS[tier];
  // parse a number out of the stored answer, default to a sensible mid value
  const parsed = parseInt((value || '').replace(/[^\d]/g, ''), 10);
  const num = Number.isFinite(parsed) && parsed > 0 ? parsed : 1500;
  const clamp = (n: number) => Math.min(t.max, Math.max(t.min, n));
  const commit = (n: number) => onChange(`${shekel(n)} לעסקה`);

  function switchTier(next: 'low' | 'high') {
    setTier(next);
    commit(Math.min(TIERS[next].max, Math.max(TIERS[next].min, num)));
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--brand)' }}>{shekel(num)} <span style={{ fontSize: 14, color: 'var(--ink-muted)', fontWeight: 500 }}>לעסקה</span></div>
        <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>{t.label}</span>
      </div>
      <input
        type="range" min={t.min} max={t.max} step={t.step} value={clamp(num)}
        onChange={(e) => commit(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--brand)', cursor: 'pointer' }}
        aria-label="גררו לקביעת גודל העסקה"
      />
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <label style={{ fontSize: 13, color: 'var(--ink-secondary)' }}>או הקלידו סכום מדויק:</label>
        <input
          type="number" inputMode="numeric" min={0} value={num}
          onChange={(e) => commit(clamp(Number(e.target.value) || 0))}
          style={{ width: 130, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', color: 'var(--ink)', fontSize: 15, direction: 'ltr', textAlign: 'right' }}
        />
        <button type="button" className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 13 }} onClick={() => switchTier(tier === 'low' ? 'high' : 'low')}>
          {t.toggle}
        </button>
      </div>
    </div>
  );
}

function summarize(step: Step, answers: Answers): string {
  const parts = step.fields.map((f) => {
    const v = (answers[f.key] || '').trim();
    if (!v) return '';
    if (f.type === 'multi') return v.split(',').filter(Boolean).join(', ');
    if (f.type === 'textarea') return v.length > 80 ? v.slice(0, 80) + '…' : v.replace(/\n/g, ', ');
    return v;
  }).filter(Boolean);
  return parts.join(' · ');
}

interface Props {
  id?: string;
  steps: Step[];
  run: (answers: Answers) => Promise<{ ok: boolean; data?: unknown; error?: string }>;
  renderTeaser: (data: unknown, filled: boolean) => ReactNode;
  buildFile: (data: unknown, answers: Answers) => string;
  fileName: (answers: Answers) => string;
  analyzingText?: string;
  errorText?: (code: string) => string;
  ctas?: ReactNode;
}

export default function QuestionnaireTool({ id, steps, run, renderTeaser, buildFile, fileName, analyzingText, errorText, ctas }: Props) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [data, setData] = useState<unknown>(null);
  const [filled, setFilled] = useState(false);
  const [err, setErr] = useState('');
  const [downloaded, setDownloaded] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);

  const total = steps.length;
  const step = steps[current];
  const set = (k: string, v: string) => setAnswers((p) => ({ ...p, [k]: v }));
  const toggleMulti = (k: string, v: string) => setAnswers((p) => {
    const cur = p[k] ? p[k].split(',').filter(Boolean) : [];
    return { ...p, [k]: (cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]).join(',') };
  });
  const canProceed = step.fields.every((f) => {
    if (!f.required) return true;
    const v = (answers[f.key] || '').trim();
    return f.type === 'email' ? EMAIL_RE.test(v) : !!v;
  });

  useEffect(() => { if (data) requestAnimationFrame(() => setFilled(true)); }, [data]);
  // keep the active question in view as the stack grows (skip the initial mount so we
  // don't yank the page down to the tool on load)
  useEffect(() => { if (current > 0) activeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }, [current]);

  async function proceed() {
    if (!canProceed) return;
    if (current < total - 1) { setCurrent((s) => s + 1); return; }
    setErr(''); setAnalyzing(true);
    const r = await run(answers);
    setAnalyzing(false);
    if (r.ok && r.data) setData(r.data);
    else setErr((errorText ?? ((c) => c))(r.error ?? ''));
  }

  function download() {
    const text = buildFile(data, answers);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = fileName(answers);
    document.body.appendChild(el); el.click(); el.remove(); URL.revokeObjectURL(url);
    setDownloaded(true);
  }

  if (analyzing) {
    return (
      <section className="ctx-tool" id={id}><div className="container"><div className="ctx-card" style={{ textAlign: 'center' }}>
        <div className="geo-scanning" aria-live="polite"><div className="geo-spinner" /><p>{analyzingText || 'הצוות עובד, עוד רגע…'}</p></div>
      </div></div></section>
    );
  }

  // ── RESULT: teaser on screen + gated full-report download ──
  if (data) {
    return (
      <section className="ctx-tool" id={id}><div className="container">
        <div className="ctx-report">
          {renderTeaser(data, filled)}
          <div className="ctx-rep-body">
            <div style={{ position: 'relative', marginTop: 8 }}>
              <div style={{ filter: 'blur(5px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.6 }} aria-hidden="true">
                <div className="ctx-rep-h">הדוח המלא</div>
                <div className="ctx-opp"><div className="ctx-opp-top"><div><h4>הניתוח המלא, מודל אחר מודל</h4><div className="ctx-opp-why">כל המודלים, הטבלאות, המהלכים והנספחים מחכים לכם בקובץ.</div></div></div></div>
                <div className="ctx-opp"><div className="ctx-opp-top"><div><h4>■■■■ ■■■■■■ ■■■</h4><div className="ctx-opp-why">■■■■■■ ■■■ ■■■■■■ ■■■■ ■■■■■■■ ■■■■ ■■■■■.</div></div></div></div>
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(20px,4vw,32px)', maxWidth: 460, boxShadow: '0 12px 40px -12px rgba(0,0,0,0.25)' }}>
                  <div style={{ fontSize: 26, marginBottom: 6 }}>🔓</div>
                  <h3 style={{ fontSize: 20, color: 'var(--ink)', margin: '0 0 8px' }}>הדוח המלא מוכן</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-secondary)', margin: '0 0 16px' }}>למעלה זו רק ההצצה. הורידו את הקובץ המלא עם כל המודלים, הטבלאות והמהלכים, לכתובת שהשארתם.</p>
                  <button type="button" className="btn btn-primary" onClick={download} style={{ justifyContent: 'center' }}>
                    {downloaded ? '✓ הורד, הורידו שוב' : 'הורדת הדוח המלא ↓'}
                  </button>
                  <p style={{ fontSize: 12, color: 'var(--brand)', margin: '12px 0 0' }}>קיבלנו את הפרטים, ניצור קשר תוך זמן קצר.</p>
                  {ctas && <div style={{ marginTop: 14 }}>{ctas}</div>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div></section>
    );
  }

  // ── QUESTIONNAIRE (accordion) ──
  return (
    <section className="ctx-tool" id={id}><div className="container">
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 12 }}>
        <div className="ctx-progress" aria-hidden="true" style={{ marginBottom: 4 }}><div className="ctx-progress-fill" style={{ width: `${((current + 1) / total) * 100}%` }} /></div>

        {steps.slice(0, current).map((s, i) => (
          <button key={i} type="button" onClick={() => setCurrent(i)}
            style={{ textAlign: 'right', width: '100%', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '14px 18px', cursor: 'pointer', opacity: 0.5, transition: 'opacity .2s' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')} onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.5')}
            aria-label={`חזרה לשאלה ${i + 1}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--brand)', fontWeight: 700 }}>{s.section}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-muted)' }}>שאלה {i + 1} · לחצו לעריכה</span>
            </div>
            <div style={{ fontSize: 15, color: 'var(--ink)', marginTop: 4 }}>{s.q}</div>
            <div style={{ fontSize: 14, color: 'var(--ink-secondary)', marginTop: 2 }}>{summarize(s, answers) || 'ללא תשובה'}</div>
          </button>
        ))}

        <div ref={activeRef} className="ctx-card" style={{ scrollMarginTop: 90 }}>
          <div className="ctx-anim" key={current}>
            <span className="ctx-section-label">{step.section}</span>
            <span className="ctx-step-count">שאלה {current + 1} מתוך {total}</span>
            <h3 className="ctx-q">{step.q}</h3>
            {step.hint && <p className="ctx-hint">{step.hint}</p>}
            <form className="ctx-fields" onSubmit={(e) => { e.preventDefault(); proceed(); }}>
              {step.fields.map((f) => {
                if (f.type === 'dealslider') return <DealSlider key={f.key} value={answers[f.key] || ''} onChange={(v) => set(f.key, v)} />;
                if (f.type === 'segmented') return <div key={f.key} className="rd-seg-btns ctx-seg">{f.options!.map((o) => <button type="button" key={o} className={`rd-seg-btn ${answers[f.key] === o ? 'on' : ''}`} onClick={() => set(f.key, o)}>{o}</button>)}</div>;
                if (f.type === 'multi') { const sel = answers[f.key] ? answers[f.key].split(',') : []; return <div key={f.key} className="rd-seg-btns ctx-seg ctx-multi">{f.options!.map((o) => <button type="button" key={o} className={`rd-seg-btn ${sel.includes(o) ? 'on' : ''}`} onClick={() => toggleMulti(f.key, o)}>{o}</button>)}</div>; }
                if (f.type === 'textarea') return <textarea key={f.key} className="ctx-input ctx-textarea" placeholder={f.placeholder} dir={f.dir || 'rtl'} value={answers[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} rows={3} />;
                return <input key={f.key} className="ctx-input" type={f.type === 'email' ? 'email' : 'text'} placeholder={f.placeholder} dir={f.dir || 'rtl'} value={answers[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />;
              })}
              {err && <p style={{ color: '#f87171', fontSize: 14, marginTop: 4 }}>{err}</p>}
              <div className="ctx-nav">
                {current > 0 && <button type="button" className="btn btn-ghost" onClick={() => setCurrent((s) => s - 1)}>→ הקודם</button>}
                <button type="submit" className="btn btn-primary ctx-next" disabled={!canProceed}>{current < total - 1 ? 'הבא ←' : 'הריצו לי את הניתוח ←'}</button>
              </div>
            </form>
            {!step.fields.some((f) => f.required) && <button type="button" className="ctx-skip" onClick={proceed}>דלגו על השאלה</button>}
          </div>
        </div>
      </div>
    </div></section>
  );
}
