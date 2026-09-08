'use client';

// ICP list-filter tool — bespoke TWO-PANEL WORKBENCH + RTL RESULTS TABLE.
// The landing shell (IcpListClient), the API route (/api/icp-list-filter) and the
// server-side maker/critic engine are unchanged. Here we collect the ICP + pasted
// list in a single two-panel screen, run the same email-gated call, then render an
// RTL results table (right-to-left, Hebrew reads correctly) with client-side filter
// chips and a gated full-list .md download.

import { useState, type ReactNode } from 'react';
import { type Scorecard } from '../_shared/ScoreTeaser';

type Verdict = 'match' | 'review' | 'nomatch';
type Analysis = {
  scorecard: Scorecard;
  summary: { total: number; match: number; review: number; nomatch: number };
  rows: { lead: string; verdict: Verdict; reason: string }[];
  topPicks: string[];
  assumptions: string[];
};

type Answers = Record<string, string>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errText(code: string): string {
  if (code === 'unconfigured') return 'הכלי מחובר אך ממתין למפתח ANTHROPIC_API_KEY בשרת. מקומית, הוסיפו אותו ל-.env.local.';
  if (code === 'rate_limited') return 'יותר מדי בקשות. המתינו דקה ונסו שוב.';
  if (code === 'quota_exceeded') return 'ניצלתם את 3 הסינונים החינמיים לכתובת הזו.';
  if (code === 'bad_request') return 'חסר קלט. מלאו לפחות את ה-ICP והדביקו רשימה.';
  return 'משהו השתבש. נסו שוב.';
}

async function run(answers: Answers) {
  const email = (answers.email || '').trim().toLowerCase();
  const input = {
    icp: answers.icp,
    disqualifiers: answers.disqualifiers,
    list: answers.list,
  };
  fetch('/api/content-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: '/free-tools/icp-list-filter' }) }).catch(() => {});
  try {
    const res = await fetch('/api/icp-list-filter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'run', input, leadEmail: email }) });
    const j = await res.json();
    return j.ok && j.analysis ? { ok: true, data: j.analysis as Analysis } : { ok: false, error: j.error ?? '' };
  } catch { return { ok: false, error: 'network' }; }
}

const verdictLabel = (v: Verdict) => (v === 'match' ? 'מתאים' : v === 'review' ? 'לבדיקה' : 'לא מתאים');

function buildFile(dataUnknown: unknown, answers: Answers): string {
  const a = dataUnknown as Analysis;
  const L: string[] = [];
  L.push(`# רשימת לידים מסוננת מול ICP, ${answers.name || 'העסק שלכם'}`);
  L.push(`> נוצר בחינם ב-HELIX · ${answers.email || ''}`);
  L.push(`\n## ציון סינון: ${a.scorecard.score}/100 (${a.scorecard.label})`);
  a.scorecard.dims.forEach((d) => L.push(`- ${d.label}: ${d.value}/100`));
  L.push(`\n## סיכום`);
  L.push(`סה״כ לידים: ${a.summary.total}`);
  L.push(`מתאימים: ${a.summary.match} · לבדיקה: ${a.summary.review} · לא מתאימים: ${a.summary.nomatch}`);
  L.push(`\n## הרשימה, שורה אחר שורה`);
  L.push(`| ליד | סיווג | סיבה |`);
  L.push(`| --- | --- | --- |`);
  a.rows.forEach((r) => L.push(`| ${r.lead} | ${verdictLabel(r.verdict)} | ${r.reason} |`));
  if (a.topPicks.filter(Boolean).length) L.push(`\n## ההמלצות החמות\n${a.topPicks.filter(Boolean).map((p) => `- ${p}`).join('\n')}`);
  if (a.assumptions.filter(Boolean).length) L.push(`\n## הנחות שהנחנו\n${a.assumptions.filter(Boolean).map((c) => `- ${c}`).join('\n')}`);
  L.push(`\n---\nHELIX · ${'https://www.helix.co.il'}`);
  return L.join('\n');
}

// verdict → accent color for row signalling
const VERDICT_COLOR: Record<Verdict, string> = {
  match: 'var(--brand)',
  review: '#F59E0B',
  nomatch: '#EF4444',
};

// compact score gauge (mirrors ScoreTeaser's Gauge, sized down)
function Gauge({ score }: { score: number }) {
  const r = 40, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <svg width="96" height="96" viewBox="0 0 96 96" style={{ flexShrink: 0 }}>
      <circle cx="48" cy="48" r={r} fill="none" stroke="var(--ctx-track,#0f1a15)" strokeWidth="9" />
      <circle cx="48" cy="48" r={r} fill="none" stroke="var(--brand)" strokeWidth="9" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 48 48)" />
      <text x="48" y="46" textAnchor="middle" fontSize="24" fontWeight="800" fill="var(--ink)">{score}</text>
      <text x="48" y="62" textAnchor="middle" fontSize="10" fill="var(--ink-muted)">מתוך 100</text>
    </svg>
  );
}

const panelStyle: React.CSSProperties = {
  background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 20,
  display: 'grid', gap: 12, alignContent: 'start',
};
const fieldStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10,
  padding: '11px 13px', color: 'var(--ink)', fontSize: 15, fontFamily: 'inherit',
};
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--brand)' };

export default function IcpListToolClient({ id = 'icp-list-tool' }: { id?: string }) {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'result'>('idle');
  const [answers, setAnswers] = useState<Answers>({ icp: '', disqualifiers: '', list: '', name: '', email: '' });
  const [data, setData] = useState<Analysis | null>(null);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState<'all' | Verdict>('all');
  const [downloaded, setDownloaded] = useState(false);

  const set = (k: string, v: string) => setAnswers((p) => ({ ...p, [k]: v }));

  async function submit() {
    const icp = answers.icp.trim();
    const list = answers.list.trim();
    const email = answers.email.trim();
    if (!icp) { setErr('כתבו קודם מי הלקוח האידיאלי שלכם.'); return; }
    if (!list) { setErr('הדביקו רשימה, שורה לכל ליד.'); return; }
    if (!EMAIL_RE.test(email)) { setErr('צריך אימייל תקין כדי לשלוח לכם את הרשימה המלאה.'); return; }
    setErr(''); setStatus('analyzing');
    const r = await run(answers);
    if (r.ok && r.data) { setData(r.data as Analysis); setStatus('result'); }
    else { setErr(errText(r.error ?? '')); setStatus('idle'); }
  }

  function download() {
    if (!data) return;
    const text = buildFile(data, answers);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = `icp-list-${(answers.name || 'org').replace(/[^\w֐-׿]+/g, '-')}.md`;
    document.body.appendChild(el); el.click(); el.remove(); URL.revokeObjectURL(url);
    setDownloaded(true);
  }

  function reset() {
    setAnswers({ icp: '', disqualifiers: '', list: '', name: '', email: '' });
    setData(null); setErr(''); setFilter('all'); setDownloaded(false); setStatus('idle');
  }

  // ── ANALYZING ──
  if (status === 'analyzing') {
    return (
      <section className="ctx-tool" id={id}><div className="container"><div className="ctx-card" style={{ textAlign: 'center' }}>
        <div className="geo-scanning" aria-live="polite"><div className="geo-spinner" /><p>עובר על כל ליד מול ה-ICP שלכם…</p></div>
      </div></div></section>
    );
  }

  // ── RESULT ──
  if (status === 'result' && data) {
    const a = data;
    const s = a.summary;
    const dims = a.scorecard?.dims ?? [];
    const picks = a.topPicks.filter(Boolean);
    const rows = filter === 'all' ? a.rows : a.rows.filter((r) => r.verdict === filter);
    const chip = (key: 'all' | Verdict, label: string, count: number): ReactNode => {
      const on = filter === key;
      const accent = key === 'all' ? 'var(--brand)' : VERDICT_COLOR[key];
      return (
        <button key={key} type="button" onClick={() => setFilter(key)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7, cursor: 'pointer',
            padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600, fontFamily: 'inherit',
            background: on ? accent : 'var(--bg-surface)', color: on ? '#08110d' : 'var(--ink-secondary)',
            border: `1px solid ${on ? accent : 'var(--border)'}`, transition: 'all .15s',
          }}>
          {label}<span style={{ opacity: 0.7 }}>{count}</span>
        </button>
      );
    };

    return (
      <section className="ctx-tool" id={id} dir="rtl"><div className="container">
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 20 }}>

          {/* summary strip */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12 }}>
            {[
              { label: 'התאמה', value: s.match, color: 'var(--brand)', hi: true },
              { label: 'לבדיקה', value: s.review, color: '#F59E0B', hi: false },
              { label: 'לא מתאים', value: s.nomatch, color: '#EF4444', hi: false },
              { label: 'סה״כ לידים', value: s.total, color: 'var(--ink-secondary)', hi: false },
            ].map((t) => (
              <div key={t.label} style={{
                background: t.hi ? 'rgba(16,185,129,0.08)' : 'var(--bg-surface)',
                border: `1px solid ${t.hi ? 'var(--brand)' : 'var(--border)'}`,
                borderRadius: 14, padding: '16px 18px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 30, fontWeight: 800, color: t.color, lineHeight: 1 }}>{t.value}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 6 }}>{t.label}</div>
              </div>
            ))}
          </div>

          {/* compact scorecard */}
          <div style={{ ...panelStyle, gridTemplateColumns: '96px 1fr', gap: 18, alignItems: 'center' }}>
            <Gauge score={a.scorecard?.score ?? 0} />
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>{a.scorecard?.label || 'ציון סינון'}</div>
              {dims.length > 0 && (
                <div style={{ display: 'grid', gap: 6 }}>
                  {dims.map((b) => (
                    <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 34px', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{b.label}</span>
                      <div style={{ height: 7, borderRadius: 999, background: 'var(--ctx-track,#0f1a15)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${Math.max(0, Math.min(100, b.value))}%`, background: 'var(--brand)', borderRadius: 999 }} />
                      </div>
                      <span style={{ fontSize: 12, color: 'var(--ink-muted)', textAlign: 'left' }}>{b.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* filter chips */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {chip('all', 'הכל', s.total)}
            {chip('match', 'התאמה', s.match)}
            {chip('review', 'לבדיקה', s.review)}
            {chip('nomatch', 'לא מתאים', s.nomatch)}
          </div>

          {/* RTL results table */}
          <div style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 14, background: 'var(--bg-surface)' }}>
            <table dir="rtl" style={{ width: '100%', minWidth: 520, borderCollapse: 'collapse', textAlign: 'right' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textAlign: 'right' }}>ליד</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textAlign: 'right', whiteSpace: 'nowrap' }}>סיווג</th>
                  <th style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: 'var(--ink-muted)', textAlign: 'right' }}>סיבה</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const c = VERDICT_COLOR[r.verdict];
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', borderInlineStart: `3px solid ${c}` }}>
                      <td style={{ padding: '12px 16px', fontSize: 14, color: 'var(--ink)', textAlign: 'right' }}>{r.lead}</td>
                      <td style={{ padding: '12px 16px', fontSize: 13, textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: c, fontWeight: 600 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block' }} />
                          {verdictLabel(r.verdict)}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--ink-secondary)', textAlign: 'right', lineHeight: 1.5 }}>{r.reason}</td>
                    </tr>
                  );
                })}
                {rows.length === 0 && (
                  <tr><td colSpan={3} style={{ padding: '24px 16px', textAlign: 'center', fontSize: 14, color: 'var(--ink-muted)' }}>אין לידים בסיווג הזה.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* top picks */}
          {picks.length > 0 && (
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>ההמלצות החמות</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {picks.map((p, i) => (
                  <span key={i} style={{
                    padding: '7px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                    background: 'rgba(16,185,129,0.1)', color: 'var(--brand)', border: '1px solid rgba(16,185,129,0.4)',
                  }}>{p}</span>
                ))}
              </div>
            </div>
          )}

          {/* actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', paddingTop: 4 }}>
            <button type="button" className="btn btn-primary" onClick={download} style={{ justifyContent: 'center' }}>
              {downloaded ? '✓ הורד, הורידו שוב' : 'הורדת הרשימה המלאה ↓'}
            </button>
            <a className="btn btn-ghost" href="/free-tools/gtm-intelligence" style={{ justifyContent: 'center' }}>ואז, למודיעין GTM על הלידים ←</a>
            <button type="button" className="btn btn-ghost" onClick={reset} style={{ justifyContent: 'center' }}>סננו רשימה נוספת</button>
          </div>

        </div>
      </div></section>
    );
  }

  // ── IDLE: two-panel workbench ──
  return (
    <section className="ctx-tool" id={id} dir="rtl"><div className="container">
      <div style={{ maxWidth: 900, margin: '0 auto', display: 'grid', gap: 16 }}>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 16 }}>
          {/* Panel 1 (right in RTL): the ICP */}
          <div style={panelStyle}>
            <div>
              <span style={labelStyle}>ה-ICP שלכם</span>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '4px 0 0' }}>מי הלקוח האידיאלי שאותו נחפש בכל שורה ברשימה.</p>
            </div>
            <textarea
              value={answers.icp} onChange={(e) => set('icp', e.target.value)} dir="rtl" rows={5}
              placeholder="תחום, גודל חברה, תפקיד וכאב. למשל: מסעדות עם 20-200 עובדים, מנהל תפעול, כאב: שיבוץ משמרות ידני"
              style={{ ...fieldStyle, minHeight: 130, resize: 'vertical', lineHeight: 1.6 }}
            />
            <input
              value={answers.disqualifiers} onChange={(e) => set('disqualifiers', e.target.value)} dir="rtl"
              placeholder="מי לפסול (אופציונלי) — למשל: עסקים מתחת ל-10 עובדים, סטודנטים"
              style={fieldStyle}
            />
          </div>

          {/* Panel 2 (left in RTL): the list */}
          <div style={panelStyle}>
            <div>
              <span style={labelStyle}>הרשימה</span>
              <p style={{ fontSize: 13, color: 'var(--ink-muted)', margin: '4px 0 0' }}>הדביקו כאן את הלידים, שורה לכל אחד. עד 40 שורות.</p>
            </div>
            <textarea
              value={answers.list} onChange={(e) => set('list', e.target.value)} dir="rtl"
              placeholder={'שורה לכל ליד: שם, חברה, תפקיד\nדנה כהן, מסעדת X, מנהלת תפעול\nיוסי לוי, סטארטאפ Y, מפתח'}
              style={{ ...fieldStyle, minHeight: 220, resize: 'vertical', lineHeight: 1.7 }}
            />
          </div>
        </div>

        {/* action row: name + email + submit */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, alignItems: 'end' }}>
          <input
            value={answers.name} onChange={(e) => set('name', e.target.value)} dir="rtl"
            placeholder="שם מלא" style={fieldStyle}
          />
          <input
            value={answers.email} onChange={(e) => set('email', e.target.value)} type="email" dir="ltr"
            placeholder="אימייל" style={{ ...fieldStyle, textAlign: 'left' }}
          />
          <button type="button" className="btn btn-primary" onClick={submit} style={{ justifyContent: 'center', height: 46 }}>
            סננו את הרשימה ←
          </button>
        </div>

        {err && <p style={{ color: '#f87171', fontSize: 14, margin: 0 }}>{err}</p>}
      </div>
    </div></section>
  );
}
