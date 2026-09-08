'use client';

// Cold-email optimizer tool = a bespoke PASTE EDITOR (not the shared questionnaire).
// The user pastes their cold email, optionally names the audience + goal, leaves an email
// for the report, and gets a rich inline analysis on screen. Engine (maker/critic team)
// lives server-side at /api/cold-email-optimizer; here we collect the paste, gate on the
// required email (post /api/content-lead first), then render the full result inline.

import { useState, useEffect } from 'react';
import type { Scorecard } from '../_shared/ScoreTeaser';

type Analysis = {
  scorecard: Scorecard;
  diagnosis: { subject: string; opener: string; relevance: string; cta: string; length: string };
  fixes: string[];
  rewrite: string;
  subjectLines: string[];
  redFlags: string[];
  assumptions: string[];
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errText(code: string): string {
  if (code === 'unconfigured') return 'הכלי מחובר אך ממתין למפתח ANTHROPIC_API_KEY בשרת. מקומית, הוסיפו אותו ל-.env.local.';
  if (code === 'rate_limited') return 'יותר מדי בקשות. המתינו דקה ונסו שוב.';
  if (code === 'quota_exceeded') return 'ניצלתם את 3 הבדיקות החינמיות לכתובת הזו.';
  if (code === 'bad_request') return 'חסר המייל עצמו. הדביקו את המייל הקר שכתבתם.';
  return 'משהו השתבש. נסו שוב.';
}

async function run(input: { email: string; audience: string; goal: string }, leadEmailRaw: string) {
  const leadEmail = leadEmailRaw.trim().toLowerCase();
  fetch('/api/content-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: leadEmail, source: '/free-tools/cold-email-optimizer' }) }).catch(() => {});
  try {
    const res = await fetch('/api/cold-email-optimizer', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'run', input, leadEmail }) });
    const j = await res.json();
    return j.ok && j.analysis ? { ok: true, data: j.analysis as Analysis } : { ok: false, error: j.error ?? '' };
  } catch { return { ok: false, error: 'network' }; }
}

function buildFile(a: Analysis, leadEmail: string): string {
  const L: string[] = [];
  L.push(`# בדיקת המייל הקר שלכם`);
  L.push(`> נוצר בחינם ב-HELIX · ${leadEmail}`);
  L.push(`\n## ציון המייל הקר: ${a.scorecard.score}/100 (${a.scorecard.label})`);
  a.scorecard.dims.forEach((d) => L.push(`- ${d.label}: ${d.value}/100`));
  L.push(`\n## אבחון לפי מדד`);
  L.push(`נושא: ${a.diagnosis.subject}`);
  L.push(`פתיח: ${a.diagnosis.opener}`);
  L.push(`רלוונטיות ופרסונליזציה: ${a.diagnosis.relevance}`);
  L.push(`CTA: ${a.diagnosis.cta}`);
  L.push(`אורך וקריאוּת: ${a.diagnosis.length}`);
  L.push(`\n## תיקונים קונקרטיים`);
  a.fixes.forEach((f, i) => L.push(`${i + 1}. ${f}`));
  L.push(`\n## המייל כתוב מחדש`);
  L.push(a.rewrite);
  L.push(`\n## שורות נושא חזקות יותר`);
  a.subjectLines.filter(Boolean).forEach((s, i) => L.push(`${i + 1}. ${s}`));
  if (a.redFlags.filter(Boolean).length) L.push(`\n## דגלים אדומים של מסירוּת וספאם\n${a.redFlags.filter(Boolean).map((c) => `- ${c}`).join('\n')}`);
  if (a.assumptions.filter(Boolean).length) L.push(`\n## הנחות שהנחנו\n${a.assumptions.filter(Boolean).map((c) => `- ${c}`).join('\n')}`);
  L.push(`\n---\nHELIX · ${'https://www.helix.co.il'}`);
  return L.join('\n');
}

// ── small SVG gauge (same look as ScoreTeaser's Gauge) ──
function Gauge({ score, filled }: { score: number; filled: boolean }) {
  const r = 54, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div className="ctx-gauge">
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke="var(--ctx-track,#0a0f0d)" strokeWidth="11" />
        <circle cx="62" cy="62" r={r} fill="none" stroke="#10B981" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={filled ? off : c} transform="rotate(-90 62 62)" />
      </svg>
      <div className="ctx-gauge-val"><b>{score}</b><span>מתוך 100</span></div>
    </div>
  );
}

// ── copy-to-clipboard button with transient confirmation ──
function CopyButton({ text, label, className, style }: { text: string; label: string; className?: string; style?: React.CSSProperties }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className={className || 'btn btn-ghost'}
      style={style}
      onClick={() => { navigator.clipboard?.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1600); }).catch(() => {}); }}
    >
      {done ? '✓ הועתק' : label}
    </button>
  );
}

const DIAG_LABELS: { key: keyof Analysis['diagnosis']; label: string }[] = [
  { key: 'subject', label: 'שורת הנושא' },
  { key: 'opener', label: 'הפתיח' },
  { key: 'relevance', label: 'רלוונטיות ופרסונליזציה' },
  { key: 'cta', label: 'הקריאה לפעולה' },
  { key: 'length', label: 'אורך וקריאוּת' },
];

export default function ColdEmailToolClient({ id = 'cold-email-tool' }: { id?: string }) {
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [email, setEmail] = useState('');
  const [phase, setPhase] = useState<'idle' | 'analyzing' | 'result'>('idle');
  const [data, setData] = useState<Analysis | null>(null);
  const [filled, setFilled] = useState(false);
  const [err, setErr] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => { if (data) requestAnimationFrame(() => setFilled(true)); }, [data]);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    setErr('');
    if (!body.trim()) { setErr('הדביקו את המייל הקר שכתבתם, כולל שורת הנושא.'); return; }
    if (!EMAIL_RE.test(email.trim())) { setErr('הזינו כתובת אימייל תקינה לקבלת הדוח.'); return; }
    setPhase('analyzing');
    const r = await run({ email: body, audience, goal }, email);
    if (r.ok && r.data) { setData(r.data); setPhase('result'); }
    else { setErr(errText(r.error ?? '')); setPhase('idle'); }
  }

  function reset() {
    setData(null); setFilled(false); setDownloaded(false); setErr('');
    setBody(''); setAudience(''); setGoal('');
    setPhase('idle');
  }

  function download() {
    if (!data) return;
    const text = buildFile(data, email.trim().toLowerCase());
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = `cold-email-helix.md`;
    document.body.appendChild(el); el.click(); el.remove(); URL.revokeObjectURL(url);
    setDownloaded(true);
  }

  // ── ANALYZING ──
  if (phase === 'analyzing') {
    return (
      <section className="ctx-tool" id={id}><div className="container"><div className="ctx-card" style={{ textAlign: 'center' }}>
        <div className="geo-scanning" aria-live="polite"><div className="geo-spinner" /><p>היוצר מריץ ניתוח, המבקר בודק. עוד רגע…</p></div>
      </div></div></section>
    );
  }

  // ── RESULT ──
  if (phase === 'result' && data) {
    const a = data;
    const dims = a.scorecard?.dims ?? [];
    const fixes = (a.fixes || []).filter(Boolean);
    const subjectLines = (a.subjectLines || []).filter(Boolean);
    const redFlags = (a.redFlags || []).filter(Boolean);
    return (
      <section className="ctx-tool" id={id}><div className="container">
        <div className="ctx-report" dir="rtl">
          {/* score header */}
          <div className="ctx-rep-top">
            <div className="ctx-rep-org"><b>ציון המייל הקר שלכם</b></div>
            <div className="ctx-score-row">
              <Gauge score={a.scorecard?.score ?? 0} filled={filled} />
              <div className="ctx-score-txt">
                <span className="ctx-badge">✓ הניתוח שלכם מוכן</span>
                <h3>{a.scorecard?.label || 'ציון'}</h3>
                <p>ציון כולל לפי חמישה מדדים: נושא, פתיח, רלוונטיות, CTA ואורך.</p>
              </div>
            </div>
          </div>

          <div className="ctx-rep-body">
            {/* dimension bars */}
            {dims.length > 0 && (
              <>
                <div className="ctx-rep-h">פירוק הציון לפי מדד</div>
                <div className="ctx-bars">
                  {dims.map((b) => (
                    <div key={b.label} className="ctx-bar">
                      <span className="ctx-bar-lbl">{b.label}</span>
                      <div className="ctx-track"><div className="ctx-fill" style={{ width: filled ? `${Math.max(0, Math.min(100, b.value))}%` : '0%' }} /></div>
                      <span className="ctx-bar-pct">{b.value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* fixes checklist */}
            {fixes.length > 0 && (
              <>
                <div className="ctx-rep-h">מה לתקן</div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
                  {fixes.map((f, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                      <span aria-hidden="true" style={{ flex: '0 0 auto', width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: '#0b0f0d', background: 'linear-gradient(135deg,#10B981,#34D399)' }}>✓</span>
                      <span style={{ fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.6 }}>{f}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* per-dimension diagnosis */}
            <div className="ctx-rep-h">אבחון לפי מדד</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {DIAG_LABELS.map(({ key, label }) => {
                const v = a.diagnosis?.[key];
                if (!v) return null;
                return (
                  <div key={key} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: '0.03em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontSize: '0.92rem', color: 'var(--ink-secondary)', lineHeight: 1.6 }}>{v}</div>
                  </div>
                );
              })}
            </div>

            {/* rewrite */}
            {a.rewrite && (
              <>
                <div className="ctx-rep-h">המייל המשוכתב</div>
                <div style={{ background: 'var(--bg)', border: '1px solid rgba(16,185,129,0.34)', borderRadius: 14, padding: '16px 18px' }}>
                  <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.95rem', color: 'var(--ink)', lineHeight: 1.75 }}>{a.rewrite}</div>
                  <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-start' }}>
                    <CopyButton text={a.rewrite} label="העתקה" style={{ padding: '8px 16px', fontSize: '0.9rem' }} />
                  </div>
                </div>
              </>
            )}

            {/* winning subject lines */}
            {subjectLines.length > 0 && (
              <>
                <div className="ctx-rep-h">שורות נושא מנצחות</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: 10 }}>לחצו על שורה כדי להעתיק אותה.</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  {subjectLines.map((s, i) => (
                    <CopyButton
                      key={i}
                      text={s}
                      label={s}
                      className="btn btn-ghost"
                      style={{ padding: '8px 14px', fontSize: '0.9rem', textAlign: 'right', maxWidth: '100%' }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* red flags */}
            {redFlags.length > 0 && (
              <>
                <div className="ctx-rep-h">דגלים אדומים</div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
                  {redFlags.map((c, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', background: 'rgba(245,184,67,0.1)', border: '1px solid rgba(245,184,67,0.45)', borderRadius: 12, padding: '12px 14px' }}>
                      <span aria-hidden="true" style={{ flex: '0 0 auto', color: '#f5b843', fontWeight: 800 }}>⚠</span>
                      <span style={{ fontSize: '0.92rem', color: '#f3d9a0', lineHeight: 1.6 }}>{c}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            {/* download + ctas + reset */}
            <div className="ctx-cta">
              <button type="button" className="btn btn-primary" onClick={download} style={{ justifyContent: 'center' }}>
                {downloaded ? '✓ הורד, הורידו שוב' : 'הורדת הדוח המלא ↓'}
              </button>
              <a className="btn btn-ghost" href="/free-tools/gtm-intelligence" style={{ justifyContent: 'center', marginTop: 10 }}>ואז, למודיעין GTM ←</a>
              <div style={{ marginTop: 14, textAlign: 'center' }}>
                <button type="button" onClick={reset} style={{ background: 'none', border: 'none', color: 'var(--ink-secondary)', fontSize: '0.88rem', cursor: 'pointer', textDecoration: 'underline' }}>נתחו מייל נוסף</button>
              </div>
            </div>
          </div>
        </div>
      </div></section>
    );
  }

  // ── IDLE: the paste editor ──
  return (
    <section className="ctx-tool" id={id}><div className="container">
      <form onSubmit={analyze} className="ctx-card" dir="rtl" style={{ display: 'grid', gap: 16 }}>
        <div>
          <span className="ctx-section-label">עורך ההדבקה</span>
          <h3 className="ctx-q" style={{ marginTop: 6 }}>הדביקו את המייל הקר שלכם</h3>
          <p className="ctx-hint">היוצר מדרג וכותב מחדש, המבקר בודק כל תיקון. תוך שניות תקבלו ציון, תיקונים ונוסח משוכתב.</p>
        </div>

        <textarea
          className="ctx-input ctx-textarea"
          placeholder="הדביקו כאן את המייל הקר, כולל שורת הנושא"
          dir="rtl"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          style={{ minHeight: 220, fontSize: '1rem', lineHeight: 1.7 }}
          aria-label="גוף המייל הקר"
        />

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <input className="ctx-input" type="text" placeholder="למי נשלח (אופציונלי)" dir="rtl" value={audience} onChange={(e) => setAudience(e.target.value)} aria-label="קהל היעד" />
          <input className="ctx-input" type="text" placeholder="המטרה או ההצעה (אופציונלי)" dir="rtl" value={goal} onChange={(e) => setGoal(e.target.value)} aria-label="המטרה או ההצעה" />
        </div>

        <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', alignItems: 'stretch' }}>
          <input className="ctx-input" type="email" placeholder="אימייל לקבלת הדוח" dir="ltr" value={email} onChange={(e) => setEmail(e.target.value)} required aria-label="אימייל לקבלת הדוח" style={{ textAlign: 'left' }} />
          <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center', minHeight: 48, fontSize: '1rem' }}>נתחו את המייל ←</button>
        </div>

        {err && <p style={{ color: '#f87171', fontSize: '0.9rem', margin: 0 }} role="alert">{err}</p>}
      </form>
    </div></section>
  );
}
