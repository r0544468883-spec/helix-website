'use client';

// GTM Intelligence tool = a bespoke two-lane intake over the same server engine
// (maker/critic team at /api/gtm-intelligence). Instead of one generic questionnaire the
// user first PICKS A LANE ("who is my customer" = ICP+TAM, or "research a company" =
// brief+battlecard), fills a short focused form, and gets a REPORT DASHBOARD that leads
// with the sections relevant to the chosen lane. The full report is still gated behind a
// .md download to the email the user left. run(), buildFile() and errText() are the same
// contract as before; only the UI around them changed.

import { useState, useEffect } from 'react';
import { Target, Building2, ArrowRight, Download, RefreshCw } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import { type Scorecard } from '../_shared/ScoreTeaser';

type Analysis = {
  scorecard: Scorecard;
  icp: {
    profile: string;
    firmographics: string[];
    personas: { title: string; pain: string }[];
    disqualifiers: string[];
  };
  tam: { definition: string; companies: string; sam: string; som: string; assumptions: string[] };
  target: { name: string; brief: string; signals: string[]; decisionMakers: string[] } | null;
  battlecard: {
    competitor: string;
    strengths: string[];
    weaknesses: string[];
    positioning: string;
    objectionHandling: { q: string; a: string }[];
  } | null;
  moves: string[];
  assumptions: string[];
  unverifiedFacts: string[];
};

type Lane = 'A' | 'B';
type Answers = Record<string, string>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function errText(code: string): string {
  if (code === 'unconfigured') return 'הכלי מחובר אך ממתין למפתח ANTHROPIC_API_KEY בשרת. מקומית, הוסיפו אותו ל-.env.local.';
  if (code === 'rate_limited') return 'יותר מדי בקשות. המתינו דקה ונסו שוב.';
  if (code === 'quota_exceeded') return 'ניצלתם את 2 הניתוחים החינמיים לכתובת הזו.';
  if (code === 'bad_request') return 'חסר קלט. מלאו לפחות מה אתם מוכרים ולמי.';
  return 'משהו השתבש. נסו שוב.';
}

async function run(answers: Answers) {
  const email = (answers.email || '').trim().toLowerCase();
  const input = {
    sells: answers.sells, customer: answers.customer, market: answers.market,
    dealBand: answers.dealBand, target: answers.target,
  };
  fetch('/api/content-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, source: '/free-tools/gtm-intelligence' }) }).catch(() => {});
  try {
    const res = await fetch('/api/gtm-intelligence', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'run', input, leadEmail: email }) });
    const j = await res.json();
    return j.ok && j.analysis ? { ok: true, data: j.analysis as Analysis } : { ok: false, error: j.error ?? '' };
  } catch { return { ok: false, error: 'network' }; }
}

function buildFile(dataUnknown: unknown, answers: Answers): string {
  const a = dataUnknown as Analysis;
  const L: string[] = [];
  L.push(`# מודיעין GTM, ${answers.name || 'העסק שלכם'}`);
  L.push(`> נוצר בחינם ב-HELIX · ${answers.email || ''}`);
  L.push(`\n## ציון מודיעין GTM: ${a.scorecard.score}/100 (${a.scorecard.label})`);
  a.scorecard.dims.forEach((d) => L.push(`- ${d.label}: ${d.value}/100`));

  L.push(`\n## ICP, פרופיל הלקוח האידיאלי`);
  L.push(a.icp.profile);
  if (a.icp.firmographics.filter(Boolean).length) {
    L.push(`\n### פירמוגרפיה`);
    a.icp.firmographics.filter(Boolean).forEach((f) => L.push(`- ${f}`));
  }
  if (a.icp.personas.length) {
    L.push(`\n### פרסונות ועדת הקנייה`);
    a.icp.personas.forEach((p) => L.push(`- ${p.title}: ${p.pain}`));
  }
  if (a.icp.disqualifiers.filter(Boolean).length) {
    L.push(`\n### פוסלים, מי לא מתאים`);
    a.icp.disqualifiers.filter(Boolean).forEach((d) => L.push(`- ${d}`));
  }

  L.push(`\n## TAM, מודל השוק וההכנסה`);
  L.push(`הגדרה: ${a.tam.definition}`);
  L.push(`מספר חברות מתאימות (הערכה): ${a.tam.companies}`);
  L.push(`SAM (שוק בר-שירות): ${a.tam.sam}`);
  L.push(`SOM (שוק בר-השגה): ${a.tam.som}`);
  if (a.tam.assumptions.filter(Boolean).length) {
    L.push(`\n### הנחות החישוב`);
    a.tam.assumptions.filter(Boolean).forEach((x) => L.push(`- ${x}`));
  }

  if (a.target) {
    L.push(`\n## תדריך יעד: ${a.target.name}`);
    L.push(a.target.brief);
    if (a.target.signals.filter(Boolean).length) {
      L.push(`\n### סימני קנייה ותזמון`);
      a.target.signals.filter(Boolean).forEach((s) => L.push(`- ${s}`));
    }
    if (a.target.decisionMakers.filter(Boolean).length) {
      L.push(`\n### תפקידים להגיע אליהם`);
      a.target.decisionMakers.filter(Boolean).forEach((d) => L.push(`- ${d}`));
    }
  }

  if (a.battlecard) {
    L.push(`\n## Battlecard מול ${a.battlecard.competitor}`);
    L.push(`מיצוב: ${a.battlecard.positioning}`);
    if (a.battlecard.strengths.filter(Boolean).length) L.push(`חוזקות שלהם: ${a.battlecard.strengths.filter(Boolean).join('; ')}`);
    if (a.battlecard.weaknesses.filter(Boolean).length) L.push(`חולשות שלהם: ${a.battlecard.weaknesses.filter(Boolean).join('; ')}`);
    if (a.battlecard.objectionHandling.length) {
      L.push(`\n### טיפול בהתנגדויות`);
      a.battlecard.objectionHandling.forEach((o) => L.push(`- הם אומרים: ${o.q}\n  אתם עונים: ${o.a}`));
    }
  }

  L.push(`\n## המהלכים הבאים`);
  a.moves.forEach((m, i) => L.push(`${i + 1}. ${m}`));
  if (a.unverifiedFacts.filter(Boolean).length) L.push(`\n## נתונים טעונים אימות\n${a.unverifiedFacts.filter(Boolean).map((c) => `- ${c}`).join('\n')}`);
  if (a.assumptions.filter(Boolean).length) L.push(`\n## הנחות שהנחנו\n${a.assumptions.filter(Boolean).map((c) => `- ${c}`).join('\n')}`);
  L.push(`\n---\nHELIX · ${'https://www.helix.co.il'}`);
  return L.join('\n');
}

// ── small shared bits ──
const S = {
  card: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(18px,3vw,24px)' } as React.CSSProperties,
  h: { fontSize: 12, fontWeight: 700, color: 'var(--brand)', letterSpacing: '.04em', margin: '0 0 10px' } as React.CSSProperties,
  chip: { display: 'inline-block', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 999, padding: '5px 12px', fontSize: 13, color: 'var(--ink-secondary)' } as React.CSSProperties,
};

function Gauge({ score, filled }: { score: number; filled: boolean }) {
  const r = 54, c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div style={{ position: 'relative', width: 124, height: 124, flexShrink: 0 }}>
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke="var(--ctx-track,#0f1a15)" strokeWidth="11" />
        <circle cx="62" cy="62" r={r} fill="none" stroke="#10B981" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={filled ? off : c} transform="rotate(-90 62 62)"
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <b style={{ fontSize: 30, color: 'var(--ink)', lineHeight: 1 }}>{score}</b>
        <span style={{ fontSize: 11, color: 'var(--ink-muted)' }}>מתוך 100</span>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 'clamp(18px,3.5vw,24px)', fontWeight: 800, color: 'var(--brand)', wordBreak: 'break-word' }}>{value || '—'}</div>
      <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 4 }}>{label}</div>
    </div>
  );
}

function BulletList({ items }: { items: string[] }) {
  const list = (items || []).filter(Boolean);
  if (!list.length) return null;
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
      {list.map((t, i) => (
        <li key={i} style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--ink-secondary)', lineHeight: 1.5 }}>
          <span style={{ color: 'var(--brand)', flexShrink: 0 }}>•</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}

// ── the two report cards ──
function IcpCard({ icp }: { icp: Analysis['icp'] }) {
  return (
    <div style={S.card}>
      <h4 style={S.h}>ICP, פרופיל הלקוח האידיאלי</h4>
      <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.6, margin: '0 0 14px' }}>{icp.profile}</p>
      {icp.firmographics?.filter(Boolean).length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {icp.firmographics.filter(Boolean).map((f, i) => <span key={i} style={S.chip}>{f}</span>)}
        </div>
      )}
      {icp.personas?.length > 0 && (
        <div style={{ display: 'grid', gap: 8, marginBottom: 14 }}>
          {icp.personas.map((p, i) => (
            <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)' }}>{p.title}</div>
              <div style={{ fontSize: 13, color: 'var(--ink-muted)', marginTop: 2 }}>{p.pain}</div>
            </div>
          ))}
        </div>
      )}
      {icp.disqualifiers?.filter(Boolean).length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-secondary)', margin: '4px 0 6px' }}>פוסלים, מי לא מתאים</div>
          <BulletList items={icp.disqualifiers} />
        </>
      )}
    </div>
  );
}

function TamCard({ tam }: { tam: Analysis['tam'] }) {
  return (
    <div style={S.card}>
      <h4 style={S.h}>TAM, גודל השוק וההכנסה</h4>
      <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.6, margin: '0 0 14px' }}>{tam.definition}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 14 }}>
        <StatTile label="חברות מתאימות" value={tam.companies} />
        <StatTile label="SAM, בר-שירות" value={tam.sam} />
        <StatTile label="SOM, בר-השגה" value={tam.som} />
      </div>
      {tam.assumptions?.filter(Boolean).length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-secondary)', margin: '4px 0 6px' }}>הנחות החישוב</div>
          <BulletList items={tam.assumptions} />
        </>
      )}
    </div>
  );
}

function TargetCard({ target }: { target: NonNullable<Analysis['target']> }) {
  return (
    <div style={S.card}>
      <h4 style={S.h}>תדריך יעד: {target.name}</h4>
      <p style={{ fontSize: 15, color: 'var(--ink)', lineHeight: 1.6, margin: '0 0 14px' }}>{target.brief}</p>
      {target.signals?.filter(Boolean).length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-secondary)', margin: '4px 0 6px' }}>סימני קנייה ותזמון</div>
          <div style={{ marginBottom: 14 }}><BulletList items={target.signals} /></div>
        </>
      )}
      {target.decisionMakers?.filter(Boolean).length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-secondary)', margin: '4px 0 6px' }}>תפקידים להגיע אליהם</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {target.decisionMakers.filter(Boolean).map((d, i) => <span key={i} style={S.chip}>{d}</span>)}
          </div>
        </>
      )}
    </div>
  );
}

function BattlecardCard({ bc }: { bc: NonNullable<Analysis['battlecard']> }) {
  return (
    <div style={S.card}>
      <h4 style={S.h}>Battlecard מול {bc.competitor}</h4>
      <p style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6, margin: '0 0 14px' }}><strong>מיצוב:</strong> {bc.positioning}</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 14 }}>
        {bc.strengths?.filter(Boolean).length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: 6 }}>החוזקות שלהם</div>
            <BulletList items={bc.strengths} />
          </div>
        )}
        {bc.weaknesses?.filter(Boolean).length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: 6 }}>החולשות שלהם</div>
            <BulletList items={bc.weaknesses} />
          </div>
        )}
      </div>
      {bc.objectionHandling?.length > 0 && (
        <>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-secondary)', margin: '4px 0 8px' }}>טיפול בהתנגדויות</div>
          <div style={{ display: 'grid', gap: 8 }}>
            {bc.objectionHandling.map((o, i) => (
              <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px' }}>
                <div style={{ fontSize: 13, color: 'var(--ink-muted)' }}>הם אומרים: {o.q}</div>
                <div style={{ fontSize: 14, color: 'var(--ink)', marginTop: 4 }}>אתם עונים: {o.a}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

const LANES: { id: Lane; title: string; sub: string; Icon: typeof Target }[] = [
  { id: 'A', title: 'מי הלקוח שלי', sub: 'ICP + TAM: הגדרת הלקוח האידיאלי וגודל השוק', Icon: Target },
  { id: 'B', title: 'תחקיר על חברה', sub: 'תדריך חברה + Battlecard על מתחרה', Icon: Building2 },
];

export default function GtmIntelligenceToolClient({ id = 'gtm-tool' }: { id?: string }) {
  const [stage, setStage] = useState<'pick' | 'form' | 'analyzing' | 'result'>('pick');
  const [lane, setLane] = useState<Lane>('A');
  const [answers, setAnswers] = useState<Answers>({});
  const [dealNum, setDealNum] = useState<number>(1500);
  const [data, setData] = useState<Analysis | null>(null);
  const [filled, setFilled] = useState(false);
  const [err, setErr] = useState('');
  const [downloaded, setDownloaded] = useState(false);

  const set = (k: string, v: string) => setAnswers((p) => ({ ...p, [k]: v }));
  useEffect(() => { if (data) requestAnimationFrame(() => setFilled(true)); }, [data]);

  function pickLane(l: Lane) {
    setLane(l);
    setStage('form');
    setErr('');
  }

  function validate(): string {
    if (!(answers.sells || '').trim()) return 'כתבו מה אתם מוכרים.';
    if (lane === 'B' && !(answers.target || '').trim()) return 'כתבו שם חברה או מתחרה לתחקיר.';
    if (!(answers.name || '').trim()) return 'הוסיפו שם.';
    if (!EMAIL_RE.test((answers.email || '').trim())) return 'הכניסו אימייל תקין.';
    return '';
  }

  async function submit() {
    const v = validate();
    if (v) { setErr(v); return; }
    const dealBand = lane === 'A' ? `₪${Math.round(dealNum).toLocaleString('en-US')} לעסקה` : (answers.dealBand || '');
    const payload: Answers = { ...answers, dealBand };
    setAnswers(payload);
    setErr('');
    setStage('analyzing');
    const r = await run(payload);
    if (r.ok && r.data) { setData(r.data as Analysis); setStage('result'); }
    else { setErr(errText(r.error ?? '')); setStage('form'); }
  }

  function download() {
    if (!data) return;
    const text = buildFile(data, answers);
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = `gtm-intelligence-${(answers.name || 'org').replace(/[^\w֐-׿]+/g, '-')}.md`;
    document.body.appendChild(el); el.click(); el.remove(); URL.revokeObjectURL(url);
    setDownloaded(true);
  }

  function reset() {
    setStage('pick'); setData(null); setFilled(false); setAnswers({}); setDealNum(1500);
    setErr(''); setDownloaded(false);
  }

  const input: React.CSSProperties = { width: '100%', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 14px', color: 'var(--ink)', fontSize: 15, boxSizing: 'border-box' };
  const fieldLabel: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: 'var(--ink-secondary)', marginBottom: 6, display: 'block' };

  // ── ANALYZING ──
  if (stage === 'analyzing') {
    return (
      <section className="ctx-tool" id={id}><div className="container"><div className="ctx-card" style={{ textAlign: 'center' }}>
        <div className="geo-scanning" aria-live="polite"><div className="geo-spinner" /><p>אוסף מודיעין, היוצר מריץ והמבקר מאמת…</p></div>
      </div></div></section>
    );
  }

  // ── RESULT DASHBOARD ──
  if (stage === 'result' && data) {
    const a = data;
    const laneA = lane === 'A';
    const hasTarget = !!a.target;
    const hasBattlecard = !!a.battlecard;
    return (
      <section className="ctx-tool" id={id}><div className="container" dir="rtl">
        <div style={{ maxWidth: 860, margin: '0 auto', display: 'grid', gap: 16 }}>
          {/* scorecard */}
          <div style={{ ...S.card, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
            <Gauge score={a.scorecard?.score ?? 0} filled={filled} />
            <div style={{ flex: '1 1 280px', minWidth: 240 }}>
              <span style={{ ...S.chip, background: 'color-mix(in srgb, var(--brand) 14%, transparent)', border: '1px solid color-mix(in srgb, var(--brand) 30%, transparent)', color: 'var(--brand)', marginBottom: 8 }}>המודיעין שלכם מוכן</span>
              <h3 style={{ fontSize: 22, color: 'var(--ink)', margin: '8px 0 12px' }}>{a.scorecard?.label || 'ציון מודיעין GTM'}</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {(a.scorecard?.dims ?? []).map((b) => (
                  <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '120px 1fr 34px', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: 'var(--ink-secondary)' }}>{b.label}</span>
                    <div style={{ height: 8, background: 'var(--bg)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--border)' }}>
                      <div style={{ height: '100%', width: filled ? `${Math.max(0, Math.min(100, b.value))}%` : '0%', background: 'var(--brand)', borderRadius: 99, transition: 'width 1s ease' }} />
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--ink-muted)', textAlign: 'left' }}>{b.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* lane-led sections */}
          <ScrollReveal direction="up">
            <div style={{ display: 'grid', gap: 16 }}>
              {laneA ? (
                <>
                  <IcpCard icp={a.icp} />
                  <TamCard tam={a.tam} />
                </>
              ) : (
                <>
                  {hasTarget && a.target ? <TargetCard target={a.target} /> : null}
                  {hasBattlecard && a.battlecard ? <BattlecardCard bc={a.battlecard} /> : null}
                  {!hasTarget && !hasBattlecard && (
                    <p style={{ fontSize: 13, color: 'var(--ink-muted)', textAlign: 'center', margin: 0 }}>לא נמצא מספיק מידע ציבורי לתחקיר ממוקד. מציגים במקום את ה-ICP וה-TAM שנבנו מהקלט שלכם.</p>
                  )}
                  {(!hasTarget || !hasBattlecard) && (
                    <>
                      <IcpCard icp={a.icp} />
                      <TamCard tam={a.tam} />
                    </>
                  )}
                </>
              )}
            </div>
          </ScrollReveal>

          {/* moves */}
          {a.moves?.filter(Boolean).length > 0 && (
            <div style={S.card}>
              <h4 style={S.h}>המהלכים הבאים</h4>
              <ol style={{ margin: 0, paddingInlineStart: 20, display: 'grid', gap: 8 }}>
                {a.moves.filter(Boolean).map((m, i) => <li key={i} style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.5 }}>{m}</li>)}
              </ol>
            </div>
          )}

          {/* unverified */}
          {a.unverifiedFacts?.filter(Boolean).length > 0 && (
            <div style={{ ...S.card, background: 'var(--bg)' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink-secondary)', marginBottom: 6 }}>טעון אימות</div>
              <BulletList items={a.unverifiedFacts} />
            </div>
          )}

          {/* actions */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginTop: 4 }}>
            <button type="button" className="btn btn-primary" onClick={download} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Download size={16} /> {downloaded ? 'הורד, הורידו שוב' : 'הורדת הדוח המלא ↓'}
            </button>
            <a className="btn btn-ghost" href="/free-tools/cold-email-optimizer" style={{ display: 'inline-flex', alignItems: 'center' }}>ואז, לכתוב את המייל הקר ←</a>
            <button type="button" className="btn btn-ghost" onClick={reset} style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={16} /> מודיעין חדש
            </button>
          </div>
        </div>
      </div></section>
    );
  }

  // ── PICK LANE + FORM ──
  return (
    <section className="ctx-tool" id={id}><div className="container" dir="rtl">
      <div style={{ maxWidth: 720, margin: '0 auto', display: 'grid', gap: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'clamp(22px,4vw,28px)', color: 'var(--ink)', margin: 0 }}>מה תרצו?</h2>
        </div>

        {/* two choice cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
          {LANES.map(({ id: lid, title, sub, Icon }) => {
            const active = stage === 'form' && lane === lid;
            return (
              <button key={lid} type="button" onClick={() => pickLane(lid)}
                style={{
                  textAlign: 'right', cursor: 'pointer', display: 'grid', gap: 8,
                  background: active ? 'color-mix(in srgb, var(--brand) 10%, var(--bg-surface))' : 'var(--bg-surface)',
                  border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                  borderRadius: 16, padding: '20px 18px', transition: 'border-color .2s, background .2s',
                }}>
                <span style={{ width: 42, height: 42, borderRadius: 12, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'color-mix(in srgb, var(--brand) 14%, transparent)', color: 'var(--brand)' }}>
                  <Icon size={22} />
                </span>
                <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>{title}</span>
                <span style={{ fontSize: 13, color: 'var(--ink-muted)', lineHeight: 1.5 }}>{sub}</span>
              </button>
            );
          })}
        </div>

        {/* focused form */}
        {stage === 'form' && (
          <div className="ctx-card" style={{ maxWidth: '100%', margin: 0 }}>
            <form onSubmit={(e) => { e.preventDefault(); submit(); }} style={{ display: 'grid', gap: 16 }}>
              <div>
                <label style={fieldLabel}>מה אתם מוכרים</label>
                <textarea style={{ ...input, minHeight: 78, resize: 'vertical' }} dir="rtl" placeholder="למשל: תוכנת ניהול משמרות למסעדות"
                  value={answers.sells || ''} onChange={(e) => set('sells', e.target.value)} />
              </div>

              {lane === 'B' && (
                <div>
                  <label style={fieldLabel}>שם החברה או המתחרה לתחקיר</label>
                  <input style={input} dir="rtl" placeholder="שם חברה או מתחרה"
                    value={answers.target || ''} onChange={(e) => set('target', e.target.value)} />
                </div>
              )}

              <div>
                <label style={fieldLabel}>מי הלקוח היום</label>
                <input style={input} dir="rtl" placeholder="למשל: מסעדות עם 20-200 עובדים"
                  value={answers.customer || ''} onChange={(e) => set('customer', e.target.value)} />
              </div>

              <div>
                <label style={fieldLabel}>השוק במשפט</label>
                <input style={input} dir="rtl" placeholder="הסגמנט המדויק, לא AI"
                  value={answers.market || ''} onChange={(e) => set('market', e.target.value)} />
              </div>

              {lane === 'A' && (
                <div>
                  <label style={fieldLabel}>גודל עסקה טיפוסית</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--brand)', minWidth: 120 }}>
                      ₪{Math.round(dealNum).toLocaleString('en-US')} <span style={{ fontSize: 13, color: 'var(--ink-muted)', fontWeight: 500 }}>לעסקה</span>
                    </div>
                    <input type="range" min={100} max={100000} step={100} value={dealNum}
                      onChange={(e) => setDealNum(Number(e.target.value))}
                      style={{ flex: '1 1 200px', accentColor: 'var(--brand)', cursor: 'pointer' }} aria-label="גררו לקביעת גודל העסקה" />
                    <input type="number" inputMode="numeric" min={0} value={dealNum}
                      onChange={(e) => setDealNum(Math.max(0, Number(e.target.value) || 0))}
                      style={{ width: 120, background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', color: 'var(--ink)', fontSize: 15, direction: 'ltr', textAlign: 'right' }} />
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                <div>
                  <label style={fieldLabel}>שם מלא</label>
                  <input style={input} dir="rtl" placeholder="שם מלא"
                    value={answers.name || ''} onChange={(e) => set('name', e.target.value)} />
                </div>
                <div>
                  <label style={fieldLabel}>אימייל</label>
                  <input style={{ ...input, direction: 'ltr', textAlign: 'left' }} type="email" dir="ltr" placeholder="name@company.com"
                    value={answers.email || ''} onChange={(e) => set('email', e.target.value)} />
                </div>
              </div>

              {err && <p style={{ color: '#f87171', fontSize: 14, margin: 0 }}>{err}</p>}

              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                <button type="submit" className="btn btn-primary">הריצו מודיעין ←</button>
                <button type="button" className="btn btn-ghost" onClick={() => { setStage('pick'); setErr(''); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ArrowRight size={15} /> החלפת מצב
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div></section>
  );
}
