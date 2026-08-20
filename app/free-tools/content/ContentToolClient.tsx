'use client';

// The interactive content tool for /free-tools/content, three modes in one card:
//   1) ניתוח פוסטים (Content DNA)  2) בניית פוסט  3) מיילים (כתיבה/שכתוב, HE+EN)
// Calls /api/content-tool. Mirrors the role of ReadinessScanner on the readiness page.

import { useState, useEffect, type FormEvent } from 'react';
import { Dna, PenLine, Mail, Plus, X, Copy, Check, Loader2, Sparkles, Lock } from 'lucide-react';
import { EmojiIcon } from '@/lib/emoji-icon';

type Genes = { opener: string; topic: string; format: string; ending: string };
type ContentDna = {
  posts: ({ index: number } & Genes)[];
  formula: Genes;
  consistency: { opener: number; topic: number; format: number; ending: number; total: number };
  why: string[];
  template: Genes;
};
type BuildResult = { post: string; hooks: string[] };
type EmailResult = { subject: string; body: string };

type Tab = 'analyze' | 'build' | 'email';

const GENE_LABELS: Record<keyof Genes, string> = { opener: 'פתיח', topic: 'נושא', format: 'פורמט', ending: 'סיום' };

// Inline styles bound to the site's theme tokens (globals.css).
const S = {
  panel: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(18px,3vw,28px)' } as const,
  input: { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '11px 13px', color: 'var(--ink)', fontSize: 15, fontFamily: 'inherit', outline: 'none' } as const,
  label: { display: 'block', fontSize: 13, color: 'var(--ink-secondary)', marginBottom: 6 } as const,
  ghost: { display: 'inline-flex', alignItems: 'center', gap: 6, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-secondary)', padding: '8px 14px', borderRadius: 10, fontSize: 14, cursor: 'pointer' } as const,
  result: { background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: 16 } as const,
  err: { color: '#f87171', fontSize: 14, marginTop: 12 } as const,
};

function errorText(code: string): string {
  if (code === 'unconfigured') return 'הכלי מחובר אך ממתין למפתח ANTHROPIC_API_KEY בסביבת השרת.';
  if (code === 'rate_limited') return 'יותר מדי בקשות. המתן דקה ונסה שוב.';
  if (code === 'bad_request') return 'חסר קלט. מלא את השדות ונסה שוב.';
  if (code === 'gated') return 'צריך להשאיר אימייל כדי להשתמש בכלי.';
  if (code === 'quota_exceeded') return 'ניצלת את 4 השימושים החינמיים, שדרג ל-HELIX OPS.';
  return 'משהו השתבש. נסה שוב.';
}

const LEAD_KEY = 'helix_content_tool_email';

async function callTool(payload: object, leadEmail: string): Promise<{ ok: boolean; error?: string; dna?: ContentDna; result?: BuildResult & EmailResult; remaining?: number; limit?: number }> {
  try {
    const res = await fetch('/api/content-tool', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, leadEmail }) });
    return await res.json();
  } catch {
    return { ok: false, error: 'network' };
  }
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      style={S.ghost}
      onClick={() => navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); })}
    >
      {done ? <Check size={15} /> : <Copy size={15} />} {done ? 'הועתק' : 'העתק'}
    </button>
  );
}

const EXAMPLES = [
  'לפני שלוש שנים פיטרו אותי משלוש עבודות ברצף. חשבתי שאני לא טוב במה שאני עושה. התברר שהבעיה לא הייתה אני, הייתה המערכת. ברגע שהבנתי את זה, הקמתי עסק שמייצר 40K בחודש. ספרו לי בתגובות, איפה אתם תקועים היום?',
  'רוב היועצים יגידו לכם להתמקד בפיד. אני אגיד לכם בדיוק את ההפך. הלקוחות שלי לא מגיעים מהפיד. הם מגיעים מ-3 דקות שיחת DM ביום. מה הייתם שואלים את הלקוח האידיאלי שלכם?',
  'שאלה: למה רוב הקריאייטורים שורפים את עצמם? התשובה פשוטה, הם רודפים אחרי וויראליות. אני שיניתי כיוון, מעקב אחרי לקוחות, לא לייקים. ב-6 חודשים: 12 לקוחות פרימיום, אפס שעות שריפה. מה הייתם מוכנים לוותר עליו כדי לעבוד פחות?',
];

export default function ContentToolClient({ id }: { id?: string }) {
  const [tab, setTab] = useState<Tab>('analyze');

  // shared: a learned formula flows from analyze → build
  const [dna, setDna] = useState<ContentDna | null>(null);

  // email gate, leaving an email unlocks the free tool; remembered locally
  const [leadEmail, setLeadEmail] = useState('');
  const [hydrated, setHydrated] = useState(false);
  // free-usage quota (build/email). null = unknown yet.
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    let email = '';
    try { email = localStorage.getItem(LEAD_KEY) || ''; } catch { /* ignore */ }
    setLeadEmail(email);
    setHydrated(true);
    // Already unlocked from a previous visit → fetch how many free uses are left.
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      callTool({ mode: 'status' }, email).then((r) => {
        if (typeof r.remaining === 'number') setRemaining(r.remaining);
      });
    }
  }, []);
  const unlocked = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(leadEmail);

  function unlock(email: string, rem: number | null) {
    setLeadEmail(email);
    setRemaining(rem);
    try { localStorage.setItem(LEAD_KEY, email); } catch { /* ignore */ }
  }

  if (hydrated && !unlocked) {
    return (
      <section id={id} className="sp2-section" style={{ scrollMarginTop: 90 }}>
        <div className="container">
          <EmailGate onUnlock={unlock} />
        </div>
      </section>
    );
  }

  return (
    <section id={id} className="sp2-section" style={{ scrollMarginTop: 90 }}>
      <div className="container">
        <div style={{ ...S.panel, maxWidth: 900, margin: '0 auto' }} dir="rtl">
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
            {([
              ['analyze', 'ניתוח פוסטים', Dna],
              ['build', 'בניית פוסט', PenLine],
              ['email', 'מיילים', Mail],
            ] as const).map(([key, label, Icon]) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 16px', borderRadius: 10, fontSize: 15, cursor: 'pointer',
                    border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                    background: active ? 'var(--brand)' : 'transparent',
                    color: active ? '#04120c' : 'var(--ink-secondary)',
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  <Icon size={16} /> {label}
                </button>
              );
            })}
          </div>

          {/* Free-usage meter (build/email). Analysis stays free & unmetered. */}
          {remaining !== null && tab !== 'analyze' && (
            <div style={{ fontSize: 13, color: remaining > 0 ? 'var(--ink-muted)' : '#f59e0b', marginBottom: 12 }}>
              {remaining > 0
                ? `נותרו ${remaining} מתוך 4 שימושים חינמיים (בנייה ומיילים)`
                : 'ניצלת את 4 השימושים החינמיים'}
            </div>
          )}

          {tab === 'analyze' && <AnalyzeTab dna={dna} setDna={setDna} onUseFormula={() => setTab('build')} leadEmail={leadEmail} />}
          {tab === 'build' && <BuildTab formula={dna?.formula ?? null} leadEmail={leadEmail} remaining={remaining} setRemaining={setRemaining} />}
          {tab === 'email' && <EmailTab leadEmail={leadEmail} remaining={remaining} setRemaining={setRemaining} />}
        </div>
      </div>
    </section>
  );
}

// ── Email gate ────────────────────────────────────────────────────────────────
function EmailGate({ onUnlock }: { onUnlock: (email: string, remaining: number | null) => void }) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) { setErr('אימייל לא תקין'); return; }
    setErr(''); setBusy(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/content-lead', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: value, company: String(fd.get('company') ?? '') }),
      });
      const data = await res.json();
      setBusy(false);
      if (data.ok) onUnlock(value, typeof data.remaining === 'number' ? data.remaining : null);
      else setErr(data.error === 'invalid_email' ? 'אימייל לא תקין' : 'משהו השתבש. נסו שוב.');
    } catch {
      setBusy(false);
      setErr('תקלת רשת. נסו שוב.');
    }
  }

  return (
    <div style={{ ...S.panel, maxWidth: 520, margin: '0 auto', textAlign: 'center' }} dir="rtl">
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 48, height: 48, borderRadius: 12, background: 'color-mix(in srgb, var(--brand) 15%, transparent)', marginBottom: 14 }}>
        <Lock size={22} style={{ color: 'var(--brand)' }} />
      </div>
      <h3 style={{ fontSize: 22, color: 'var(--ink)', margin: '0 0 6px' }}>הכלי חינם, רק משאירים אימייל</h3>
      <p style={{ color: 'var(--ink-secondary)', fontSize: 15, margin: '0 0 18px' }}>
        הזינו אימייל וקבלו גישה מלאה: ניתוח פוסטים, בניית פוסטים וכתיבת מיילים, בלי עלות.
      </p>
      <form onSubmit={submit} noValidate style={{ display: 'grid', gap: 10 }}>
        <input
          type="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com"
          style={{ ...S.input, textAlign: 'center', direction: 'ltr' }} aria-invalid={!!err}
        />
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px' }} />
        {err && <p style={S.err}>{err}</p>}
        <button type="submit" className="btn btn-primary" disabled={busy} style={{ justifyContent: 'center', opacity: busy ? 0.6 : 1 }}>
          {busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} {busy ? 'פותח…' : 'קבלו גישה חינם'}
        </button>
        <p style={{ color: 'var(--ink-muted)', fontSize: 12, margin: 0 }}>בלי ספאם · אימייל אחד וזהו.</p>
      </form>
    </div>
  );
}

// ── Tab 1: analyze ──────────────────────────────────────────────────────────
function AnalyzeTab({ dna, setDna, onUseFormula, leadEmail }: { dna: ContentDna | null; setDna: (d: ContentDna | null) => void; onUseFormula: () => void; leadEmail: string }) {
  const [posts, setPosts] = useState<string[]>(['', '', '']);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const filled = posts.filter((p) => p.trim()).length;

  async function run() {
    setErr(''); setDna(null); setBusy(true);
    const r = await callTool({ mode: 'analyze', posts }, leadEmail);
    setBusy(false);
    if (r.ok && r.dna) setDna(r.dna);
    else setErr(errorText(r.error ?? ''));
  }

  return (
    <div>
      <p style={{ color: 'var(--ink-secondary)', fontSize: 15, marginBottom: 14 }}>
        הדבק 2-8 פוסטים שעבדו, נחלץ את הנוסחה החוזרת ותוכל להשתמש בה כדי לבנות את הבא.
      </p>
      <div style={{ display: 'grid', gap: 10 }}>
        {posts.map((p, i) => (
          <div key={i} style={{ position: 'relative' }}>
            <textarea
              value={p}
              onChange={(e) => setPosts((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))}
              placeholder={`פוסט ${i + 1}, הדבק כאן תוכן שקיבל תגובות טובות…`}
              rows={2}
              style={{ ...S.input, resize: 'vertical', paddingLeft: 34 }}
            />
            {posts.length > 2 && (
              <button type="button" aria-label="הסר" onClick={() => setPosts((prev) => prev.filter((_, j) => j !== i))}
                style={{ position: 'absolute', top: 8, left: 8, background: 'none', border: 'none', color: 'var(--ink-muted)', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14, alignItems: 'center' }}>
        <button className="btn btn-primary" disabled={busy || filled < 2} onClick={run} style={{ opacity: busy || filled < 2 ? 0.6 : 1 }}>
          {busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} {busy ? 'מנתח…' : 'גלה את הנוסחה'}
        </button>
        {posts.length < 8 && <button type="button" style={S.ghost} onClick={() => setPosts((p) => [...p, ''])}><Plus size={15} /> פוסט</button>}
        <button type="button" style={S.ghost} onClick={() => setPosts([...EXAMPLES])}>נסה עם דוגמאות</button>
        <span style={{ marginInlineStart: 'auto', color: 'var(--ink-muted)', fontSize: 13 }}>{filled}/{posts.length} · צריך לפחות 2</span>
      </div>
      {err && <p style={S.err}>{err}</p>}

      {dna && (
        <div style={{ marginTop: 22, paddingTop: 22, borderTop: '1px solid var(--border)', display: 'grid', gap: 20 }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: 1, color: 'var(--brand)', fontWeight: 700, marginBottom: 6 }}>THE FORMULA</div>
            <div style={{ fontSize: 16, color: 'var(--ink)', fontWeight: 600 }}>
              {(['opener', 'topic', 'format', 'ending'] as const).map((k, i) => (
                <span key={k}>{dna.formula[k]}{i < 3 ? ' · ' : ''}</span>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))' }}>
            {(['opener', 'topic', 'format', 'ending'] as const).map((k) => {
              const n = dna.consistency[k]; const total = dna.consistency.total || 1;
              return (
                <div key={k} style={{ ...S.result, padding: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{GENE_LABELS[k]}</span>
                    <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>{n} מתוך {total}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', marginBottom: 8 }}>{dna.formula[k]}</div>
                  <div style={{ height: 6, background: 'var(--bg-soft)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${(n / total) * 100}%`, background: 'var(--brand)', borderRadius: 99 }} />
                  </div>
                </div>
              );
            })}
          </div>
          {dna.why.length > 0 && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--ink-secondary)', fontWeight: 600, marginBottom: 8 }}>למה הקהל מגיב</div>
              <ul style={{ display: 'grid', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                {dna.why.map((w, i) => (
                  <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--ink-secondary)' }}>
                    <span style={{ color: 'var(--brand)', fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</span>{w}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button className="btn btn-primary" onClick={onUseFormula}><PenLine size={16} /> בנה פוסט לפי הנוסחה הזו ←</button>
        </div>
      )}
    </div>
  );
}

// Paywall shown once the free quota is used up, upgrade to HELIX OPS.
const HELIX_OPS_URL = 'https://my.helix.co.il';
function UpgradeCTA() {
  return (
    <div style={{ ...S.result, textAlign: 'center', padding: 24 }}>
      <div style={{ fontSize: 22, marginBottom: 6 }}><EmojiIcon e="🚀" /></div>
      <h4 style={{ fontSize: 18, color: 'var(--ink)', margin: '0 0 6px' }}>ניצלת את 4 השימושים החינמיים</h4>
      <p style={{ color: 'var(--ink-secondary)', fontSize: 14, margin: '0 0 16px' }}>
        לבנייה וכתיבת מיילים בלתי מוגבלת, ולעוד עשרות כלי תוכן ואוטומציה, שדרג ל־HELIX OPS.
      </p>
      <a href={HELIX_OPS_URL} target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ justifyContent: 'center' }}>
        שדרג ל־HELIX OPS ←
      </a>
      <p style={{ color: 'var(--ink-muted)', fontSize: 12, marginTop: 10 }}>ניתוח פוסטים (DNA) נשאר חינם וללא הגבלה.</p>
    </div>
  );
}

// ── Tab 2: build ────────────────────────────────────────────────────────────
function BuildTab({ formula, leadEmail, remaining, setRemaining }: { formula: Genes | null; leadEmail: string; remaining: number | null; setRemaining: (n: number) => void }) {
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('LinkedIn');
  const [tone, setTone] = useState('אישי ודוגרי');
  const [language, setLanguage] = useState<'he' | 'en'>('he');
  const [useFormula, setUseFormula] = useState(!!formula);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<BuildResult | null>(null);

  async function run() {
    setErr(''); setResult(null); setBusy(true);
    const r = await callTool({ mode: 'build', build: { topic, platform, tone, language, formula: useFormula ? formula : null } }, leadEmail);
    setBusy(false);
    if (r.ok && r.result) { setResult(r.result); if (typeof r.remaining === 'number') setRemaining(r.remaining); }
    else if (r.error === 'quota_exceeded') setRemaining(0);
    else setErr(errorText(r.error ?? ''));
  }

  if (remaining !== null && remaining <= 0) return <UpgradeCTA />;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <p style={{ color: 'var(--ink-secondary)', fontSize: 15 }}>תאר נושא, ונכתוב פוסט טבעי, מוכן לפרסום{formula ? ', לפי הנוסחה שחילצת' : ''}.</p>
      <div>
        <label style={S.label}>על מה הפוסט?</label>
        <textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={3} style={{ ...S.input, resize: 'vertical' }} placeholder="למשל: איך סגרנו 3 לקוחות פרימיום בלי לפרסם פוסט אחד…" />
      </div>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))' }}>
        <div>
          <label style={S.label}>פלטפורמה</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={S.input}>
            {['LinkedIn', 'Instagram', 'Facebook', 'X / Twitter', 'כללי'].map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>
        <div>
          <label style={S.label}>טון</label>
          <input value={tone} onChange={(e) => setTone(e.target.value)} style={S.input} />
        </div>
        <div>
          <label style={S.label}>שפה</label>
          <select value={language} onChange={(e) => setLanguage(e.target.value as 'he' | 'en')} style={S.input}>
            <option value="he">עברית</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      {formula && (
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--ink-secondary)', cursor: 'pointer' }}>
          <input type="checkbox" checked={useFormula} onChange={(e) => setUseFormula(e.target.checked)} />
          כתוב לפי הנוסחה שחולצה ({formula.opener} · {formula.ending})
        </label>
      )}
      <div>
        <button className="btn btn-primary" disabled={busy || !topic.trim()} onClick={run} style={{ opacity: busy || !topic.trim() ? 0.6 : 1 }}>
          {busy ? <Loader2 size={16} className="spin" /> : <PenLine size={16} />} {busy ? 'כותב…' : 'כתוב לי פוסט'}
        </button>
      </div>
      {err && <p style={S.err}>{err}</p>}
      {result && (
        <div style={{ display: 'grid', gap: 14, marginTop: 6 }}>
          <div style={S.result}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: 'var(--ink-secondary)', fontWeight: 600 }}>הפוסט</span>
              <CopyBtn text={result.post} />
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', fontSize: 15, color: 'var(--ink)', lineHeight: 1.7, direction: language === 'en' ? 'ltr' : 'rtl' }}>{result.post}</pre>
          </div>
          {result.hooks.length > 0 && (
            <div>
              <div style={{ fontSize: 13, color: 'var(--ink-secondary)', fontWeight: 600, marginBottom: 8 }}>פתיחים חלופיים</div>
              <ul style={{ display: 'grid', gap: 6, listStyle: 'none', padding: 0, margin: 0 }}>
                {result.hooks.map((h, i) => <li key={i} style={{ fontSize: 14, color: 'var(--ink-secondary)', display: 'flex', gap: 8 }}><span style={{ color: 'var(--brand)' }}>‹</span>{h}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Tab 3: email ────────────────────────────────────────────────────────────
function EmailTab({ leadEmail, remaining, setRemaining }: { leadEmail: string; remaining: number | null; setRemaining: (n: number) => void }) {
  const [action, setAction] = useState<'write' | 'rewrite'>('write');
  const [language, setLanguage] = useState<'he' | 'en'>('he');
  const [tone, setTone] = useState('מקצועי וחם');
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const [result, setResult] = useState<EmailResult | null>(null);

  async function run() {
    setErr(''); setResult(null); setBusy(true);
    const r = await callTool({ mode: 'email', email: { action, language, tone, text } }, leadEmail);
    setBusy(false);
    if (r.ok && r.result) { setResult(r.result); if (typeof r.remaining === 'number') setRemaining(r.remaining); }
    else if (r.error === 'quota_exceeded') setRemaining(0);
    else setErr(errorText(r.error ?? ''));
  }

  if (remaining !== null && remaining <= 0) return <UpgradeCTA />;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {([['write', 'כתיבת מייל'], ['rewrite', 'שכתוב מייל']] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setAction(k)}
            style={{ ...S.ghost, borderColor: action === k ? 'var(--brand)' : 'var(--border)', color: action === k ? 'var(--brand)' : 'var(--ink-secondary)' }}>{l}</button>
        ))}
        <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 8 }}>
          {([['he', 'עברית'], ['en', 'English']] as const).map(([k, l]) => (
            <button key={k} type="button" onClick={() => setLanguage(k)}
              style={{ ...S.ghost, borderColor: language === k ? 'var(--brand)' : 'var(--border)', color: language === k ? 'var(--brand)' : 'var(--ink-secondary)' }}>{l}</button>
          ))}
        </div>
      </div>
      <div>
        <label style={S.label}>טון</label>
        <input value={tone} onChange={(e) => setTone(e.target.value)} style={S.input} />
      </div>
      <div>
        <label style={S.label}>{action === 'write' ? 'על מה המייל? (מטרה, נמען, נקודות עיקריות)' : 'הדבק את המייל הקיים לשכתוב'}</label>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={5} style={{ ...S.input, resize: 'vertical', direction: language === 'en' ? 'ltr' : 'rtl' }}
          placeholder={action === 'write' ? 'למשל: מייל מעקב ללקוח אחרי פגישה, להזכיר הצעת מחיר, לבקש סגירה השבוע…' : 'הדבק כאן…'} />
      </div>
      <div>
        <button className="btn btn-primary" disabled={busy || !text.trim()} onClick={run} style={{ opacity: busy || !text.trim() ? 0.6 : 1 }}>
          {busy ? <Loader2 size={16} className="spin" /> : <Mail size={16} />} {busy ? 'מעבד…' : action === 'write' ? 'כתוב מייל' : 'שכתב מייל'}
        </button>
      </div>
      {err && <p style={S.err}>{err}</p>}
      {result && (
        <div style={S.result}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--ink-secondary)', fontWeight: 600 }}>התוצאה</span>
            <CopyBtn text={`${result.subject}\n\n${result.body}`} />
          </div>
          {result.subject && <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 10, direction: language === 'en' ? 'ltr' : 'rtl' }}>נושא: {result.subject}</div>}
          <pre style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'inherit', fontSize: 15, color: 'var(--ink)', lineHeight: 1.7, direction: language === 'en' ? 'ltr' : 'rtl' }}>{result.body}</pre>
        </div>
      )}
    </div>
  );
}
