'use client';

// Sales tool = shared QuestionnaireTool + a sales-specific step list, teaser and full
// playbook file (incl. the phone-call script). Engine (maker/critic team) is server-side
// at /api/sales-playbook.

import QuestionnaireTool, { type Answers, type Step } from '../_shared/QuestionnaireTool';
import ScoreTeaser, { type Scorecard } from '../_shared/ScoreTeaser';

type Playbook = {
  scorecard: Scorecard;
  icp: { profile: string; pain: string; whyNow: string };
  decisionMap: { decides: string; influences: string; blocks: string; champion: string };
  funnel: { stage: string; whatHappens: string; trigger: string }[];
  anum: { authority: string; need: string; urgency: string; money: string };
  spin: { situation: string[]; problem: string[]; implication: string[]; needPayoff: string[] };
  anumQuestions: { authority: string; need: string; urgency: string; money: string };
  pipeline: { note: string; steps: { from: string; to: string; rate: string }[] };
  channels: { channel: string; note: string }[];
  spamNote: string;
  linkedinSequence: { touch: string; message: string }[];
  email: { subject: string; body: string };
  objections: { objection: string; response: string }[];
  callScript: { line: string; purpose: string }[];
  assumptions: string[];
  unverifiedCompetitors: string[];
};

const STEPS: Step[] = [
  { section: 'על העסק', q: 'מה אתם מוכרים?', fields: [{ key: 'sells', type: 'textarea', placeholder: 'למשל: מערכות AI בהזמנה לעסקים', required: true }] },
  { section: 'על העסק', q: 'מי הלקוח שלכם?', fields: [{ key: 'customer', type: 'text', placeholder: 'למשל: סוכנויות ביטוח עצמאיות', required: true }] },
  { section: 'העסקה', q: 'מה גודל העסקה הטיפוסית שלכם?', hint: 'גררו את המד, הקלידו סכום מדויק, או עברו לסכומים גדולים יותר.',
    fields: [{ key: 'dealBand', type: 'dealslider' }] },
  { section: 'ערוצים', q: 'מאיפה מגיעים אליכם לקוחות היום?', hint: 'אפשר לבחור כמה, או לדלג.',
    fields: [{ key: 'channels', type: 'multi', options: [
      'לינקדאין', 'פייסבוק', 'אינסטגרם', 'טיקטוק', 'טלגרם', 'וואטסאפ', 'מייל',
      'SEO אורגני', 'GEO, נראות ב-AI', 'גוגל ופרסום ממומן', 'המלצות מפה לאוזן', 'כניסה פיזית לחנות', 'טלפון קר', 'עוד אין',
    ] }] },
  { section: 'הוכחה', q: 'יש תוצאה או הוכחה שאפשר לצטט?', hint: 'זה מה שייכנס להודעות ולתסריט.',
    fields: [{ key: 'proof', type: 'text', placeholder: 'למשל: חסכנו לסוכנות 120 שעות בחודש' }] },
  { section: 'כמעט סיימנו', q: 'לאן לשלוח את הפלייבוק המלא?', hint: 'הפרטים עוזרים לנו להתאים לכם ליווי אם תרצו.',
    fields: [
      { key: 'name', type: 'text', placeholder: 'שם מלא', required: true },
      { key: 'email', type: 'email', placeholder: 'אימייל', dir: 'ltr', required: true },
    ] },
];

function errText(code: string): string {
  if (code === 'unconfigured') return 'הכלי מחובר אך ממתין למפתח ANTHROPIC_API_KEY בשרת. מקומית, הוסיפו אותו ל-.env.local.';
  if (code === 'rate_limited') return 'יותר מדי בקשות. המתינו דקה ונסו שוב.';
  if (code === 'quota_exceeded') return 'ניצלתם את 2 הפלייבוקים החינמיים לכתובת הזו.';
  if (code === 'bad_request') return 'חסר קלט. מלאו לפחות מה אתם מוכרים ולמי.';
  return 'משהו השתבש. נסו שוב.';
}

async function run(answers: Answers) {
  const email = (answers.email || '').trim().toLowerCase();
  const input = { sells: answers.sells, customer: answers.customer, dealBand: answers.dealBand, channels: (answers.channels || '').split(',').filter(Boolean).join(', '), proof: answers.proof };
  const details = {
    'מה מוכרים': answers.sells || '', 'לקוח': answers.customer || '', 'גודל עסקה': answers.dealBand || '',
    'ערוצים היום': (answers.channels || '').split(',').filter(Boolean).join(', '), 'הוכחה': answers.proof || '',
  };
  fetch('/api/content-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name: answers.name || '', source: '/free-tools/sales', details }) }).catch(() => {});
  try {
    const res = await fetch('/api/sales-playbook', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'run', input, leadEmail: email }) });
    const j = await res.json();
    return j.ok && j.playbook ? { ok: true, data: j.playbook as Playbook } : { ok: false, error: j.error ?? '' };
  } catch { return { ok: false, error: 'network' }; }
}

function buildFile(dataUnknown: unknown, answers: Answers): string {
  const p = dataUnknown as Playbook;
  const L: string[] = [];
  L.push(`# פלייבוק מכירות, ${answers.name || 'העסק שלכם'}`);
  L.push(`> נוצר בחינם ב-HELIX · ${answers.email || ''}`);
  L.push(`\n## ציון מוכנות מכירה: ${p.scorecard.score}/100 (${p.scorecard.label})`);
  p.scorecard.dims.forEach((d) => L.push(`- ${d.label}: ${d.value}/100`));
  L.push(`\n## ICP והכאב`);
  L.push(`פרופיל: ${p.icp.profile}\nהכאב: ${p.icp.pain}\nלמה עכשיו: ${p.icp.whyNow}`);
  L.push(`\n## מפת מקבלי החלטות`);
  L.push(`מחליט: ${p.decisionMap.decides}\nמשפיע: ${p.decisionMap.influences}\nחוסם: ${p.decisionMap.blocks}\nשמפיון: ${p.decisionMap.champion}`);
  L.push(`\n## המשפך, עם טריגר לכל מעבר`);
  L.push(`| שלב | מה קורה | הטריגר |`);
  L.push(`| --- | --- | --- |`);
  p.funnel.forEach((f) => L.push(`| ${f.stage} | ${f.whatHappens} | ${f.trigger} |`));
  L.push(`\n## שער ANUM`);
  L.push(`סמכות: ${p.anum.authority}\nצורך: ${p.anum.need}\nדחיפות: ${p.anum.urgency}\nתקציב: ${p.anum.money}`);
  if (p.spin) {
    L.push(`\n## שאלות שיחת גילוי, שיטת SPIN`);
    L.push(`### מצב (מעט, רק מה שלא גלוי מראש)`);
    p.spin.situation.forEach((q) => L.push(`- ${q}`));
    L.push(`### בעיה`);
    p.spin.problem.forEach((q) => L.push(`- ${q}`));
    L.push(`### השלכה (הכי חשוב, הופך את הכאב ליקר)`);
    p.spin.implication.forEach((q) => L.push(`- ${q}`));
    L.push(`### תועלת (הלקוח מוכר לעצמו)`);
    p.spin.needPayoff.forEach((q) => L.push(`- ${q}`));
  }
  if (p.anumQuestions) {
    L.push(`\n## שאלות ANUM לשאול בשיחה`);
    L.push(`- סמכות: ${p.anumQuestions.authority}`);
    L.push(`- צורך: ${p.anumQuestions.need}`);
    L.push(`- דחיפות: ${p.anumQuestions.urgency}`);
    L.push(`- תקציב: ${p.anumQuestions.money}`);
  }
  L.push(`\n## מתמטיקת פייפליין (הנחה לאימות)`);
  L.push(p.pipeline.note);
  p.pipeline.steps.forEach((s) => L.push(`- ${s.from} ← ${s.to} (${s.rate})`));
  L.push(`\n## ערוצים`);
  p.channels.forEach((c) => L.push(`- ${c.channel}: ${c.note}`));
  if (p.spamNote) L.push(`\nהערת §30א: ${p.spamNote}`);
  L.push(`\n## פנייה ראשונה בלינקדאין, רצף rapport-first`);
  p.linkedinSequence.forEach((t) => L.push(`\n### ${t.touch}\n${t.message}`));
  L.push(`\n## גרסת מייל\nנושא: ${p.email.subject}\n\n${p.email.body}`);
  L.push(`\n## טיפול בהתנגדויות`);
  p.objections.forEach((o) => L.push(`- ${o.objection}\n  ${o.response}`));
  L.push(`\n## תסריט שיחה טלפונית`);
  p.callScript.forEach((l) => L.push(`- ${l.line}  [${l.purpose}]`));
  if (p.unverifiedCompetitors.filter(Boolean).length) L.push(`\n## מתחרים שהוצעו, טעונים אימות\n${p.unverifiedCompetitors.filter(Boolean).map((c) => `- ${c}`).join('\n')}`);
  if (p.assumptions.filter(Boolean).length) L.push(`\n## הנחות שהנחנו\n${p.assumptions.filter(Boolean).map((c) => `- ${c}`).join('\n')}`);
  L.push(`\n---\nHELIX · https://www.helix.co.il`);
  return L.join('\n');
}

// ── The full playbook, in-page (was download-only — lost on mobile). Every section
// the engine produced, rendered as cards; download stays as a secondary CTA. ──
const R = {
  card: { background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: 'clamp(16px,3vw,22px)', marginTop: 14 } as React.CSSProperties,
  h: { fontSize: 13, fontWeight: 800, color: 'var(--brand)', letterSpacing: '.03em', margin: '0 0 10px' } as React.CSSProperties,
  p: { margin: '0 0 6px', fontSize: 14.5, lineHeight: 1.65, color: 'var(--ink-secondary)' } as React.CSSProperties,
  li: { fontSize: 14, lineHeight: 1.6, color: 'var(--ink-secondary)', marginBottom: 5 } as React.CSSProperties,
  strong: { color: 'var(--ink)' } as React.CSSProperties,
};

function Grid({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 14 }}>{children}</div>;
}

function FullReport({ p }: { p: Playbook }) {
  return (
    <div>
      {/* ICP + decision map */}
      <div style={R.card}>
        <h4 style={R.h}>הלקוח האידיאלי (ICP) והכאב</h4>
        <p style={R.p}><b style={R.strong}>פרופיל:</b> {p.icp.profile}</p>
        <p style={R.p}><b style={R.strong}>הכאב שקונה:</b> {p.icp.pain}</p>
        <p style={R.p}><b style={{ color: 'var(--brand)' }}>למה עכשיו:</b> {p.icp.whyNow}</p>
      </div>
      <div style={R.card}>
        <h4 style={R.h}>מפת מקבלי ההחלטות</h4>
        <Grid>
          <p style={R.p}><b style={R.strong}>מחליט:</b> {p.decisionMap.decides}</p>
          <p style={R.p}><b style={R.strong}>משפיע:</b> {p.decisionMap.influences}</p>
          <p style={R.p}><b style={{ color: '#F59E0B' }}>חוסם:</b> {p.decisionMap.blocks}</p>
          <p style={R.p}><b style={{ color: 'var(--brand)' }}>שמפיון:</b> {p.decisionMap.champion}</p>
        </Grid>
      </div>

      {/* Funnel */}
      <div style={{ ...R.card, overflowX: 'auto' }}>
        <h4 style={R.h}>המשפך — טריגר לכל מעבר</h4>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead><tr style={{ color: 'var(--ink-muted)', fontSize: 12 }}>
            <th style={{ textAlign: 'start', padding: '6px 4px' }}>שלב</th><th style={{ textAlign: 'start' }}>מה קורה</th><th style={{ textAlign: 'start' }}>הטריגר</th>
          </tr></thead>
          <tbody>
            {p.funnel.map((f, i) => (
              <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 4px', color: 'var(--ink)', fontWeight: 600, whiteSpace: 'nowrap' }}>{f.stage}</td>
                <td style={{ padding: '8px 4px', color: 'var(--ink-secondary)' }}>{f.whatHappens}</td>
                <td style={{ padding: '8px 4px', color: 'var(--ink-secondary)' }}>{f.trigger}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ANUM gate */}
      <div style={R.card}>
        <h4 style={R.h}>שער ANUM</h4>
        <Grid>
          <p style={R.p}><b style={R.strong}>סמכות:</b> {p.anum.authority}</p>
          <p style={R.p}><b style={R.strong}>צורך:</b> {p.anum.need}</p>
          <p style={R.p}><b style={R.strong}>דחיפות:</b> {p.anum.urgency}</p>
          <p style={R.p}><b style={R.strong}>תקציב:</b> {p.anum.money}</p>
        </Grid>
      </div>

      {/* SPIN discovery */}
      {p.spin && (
        <div style={R.card}>
          <h4 style={R.h}>שאלות שיחת גילוי (SPIN)</h4>
          <Grid>
            {[
              { t: 'מצב', items: p.spin.situation }, { t: 'בעיה', items: p.spin.problem },
              { t: 'השלכה — הופך את הכאב ליקר', items: p.spin.implication }, { t: 'תועלת — הלקוח מוכר לעצמו', items: p.spin.needPayoff },
            ].map((g) => (
              <div key={g.t}>
                <b style={{ fontSize: 13, color: 'var(--ink)' }}>{g.t}</b>
                <ul style={{ margin: '6px 0 0', paddingInlineStart: 18 }}>{g.items.filter(Boolean).map((q, i) => <li key={i} style={R.li}>{q}</li>)}</ul>
              </div>
            ))}
          </Grid>
        </div>
      )}

      {/* Pipeline math */}
      <div style={R.card}>
        <h4 style={R.h}>מתמטיקת הפייפליין <span style={{ color: 'var(--ink-muted)', fontWeight: 500 }}>(הנחה לאימות)</span></h4>
        <p style={R.p}>{p.pipeline.note}</p>
        <ul style={{ margin: '6px 0 0', paddingInlineStart: 18 }}>{p.pipeline.steps.map((s, i) => <li key={i} style={R.li}>{s.from} ← {s.to} <b style={R.strong}>({s.rate})</b></li>)}</ul>
      </div>

      {/* Channels */}
      <div style={R.card}>
        <h4 style={R.h}>הערוצים שלכם</h4>
        {p.channels.map((c, i) => <p key={i} style={R.li}><b style={R.strong}>{c.channel}:</b> {c.note}</p>)}
        {p.spamNote && <p style={{ ...R.p, marginTop: 10, fontSize: 13, color: '#F59E0B' }}><b>הערת §30א:</b> {p.spamNote}</p>}
      </div>

      {/* LinkedIn sequence */}
      <div style={R.card}>
        <h4 style={R.h}>רצף פנייה בלינקדאין — rapport-first</h4>
        {p.linkedinSequence.map((t, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <b style={{ fontSize: 13.5, color: 'var(--brand)' }}>{t.touch}</b>
            <p style={{ ...R.p, whiteSpace: 'pre-wrap', margin: '3px 0 0' }}>{t.message}</p>
          </div>
        ))}
      </div>

      {/* Email */}
      <div style={R.card}>
        <h4 style={R.h}>גרסת מייל</h4>
        <p style={R.p}><b style={R.strong}>נושא:</b> {p.email.subject}</p>
        <p style={{ ...R.p, whiteSpace: 'pre-wrap' }}>{p.email.body}</p>
      </div>

      {/* Objections */}
      <div style={R.card}>
        <h4 style={R.h}>טיפול בהתנגדויות</h4>
        {p.objections.map((o, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <p style={{ ...R.p, margin: 0 }}><b style={R.strong}>“{o.objection}”</b></p>
            <p style={{ ...R.p, margin: '2px 0 0' }}>{o.response}</p>
          </div>
        ))}
      </div>

      {/* Call script */}
      <div style={R.card}>
        <h4 style={R.h}>תסריט שיחה טלפונית</h4>
        <ol style={{ margin: 0, paddingInlineStart: 20 }}>
          {p.callScript.map((l, i) => (
            <li key={i} style={{ ...R.li, marginBottom: 8 }}>
              <span style={{ color: 'var(--ink)' }}>{l.line}</span>
              <span style={{ display: 'block', fontSize: 12.5, color: 'var(--ink-muted)' }}>{l.purpose}</span>
            </li>
          ))}
        </ol>
      </div>

      {(p.unverifiedCompetitors.filter(Boolean).length > 0 || p.assumptions.filter(Boolean).length > 0) && (
        <div style={R.card}>
          {p.unverifiedCompetitors.filter(Boolean).length > 0 && <>
            <h4 style={R.h}>מתחרים שהוצעו — לאימות שלכם</h4>
            <ul style={{ margin: '0 0 8px', paddingInlineStart: 18 }}>{p.unverifiedCompetitors.filter(Boolean).map((c, i) => <li key={i} style={R.li}>{c}</li>)}</ul>
          </>}
          {p.assumptions.filter(Boolean).length > 0 && <>
            <h4 style={{ ...R.h, marginTop: 10 }}>הנחות שהנחנו</h4>
            <ul style={{ margin: 0, paddingInlineStart: 18 }}>{p.assumptions.filter(Boolean).map((x, i) => <li key={i} style={R.li}>{x}</li>)}</ul>
          </>}
        </div>
      )}
    </div>
  );
}

export default function SalesToolClient({ id = 'sales-tool' }: { id?: string }) {
  return (
    <QuestionnaireTool
      id={id}
      steps={STEPS}
      run={run}
      errorText={errText}
      analyzingText="הצוות עובד, היוצר בונה את הפלייבוק והמבקר בודק כל טענה. עוד רגע…"
      fileName={(a) => `sales-playbook-${(a.name || 'org').replace(/[^\w֐-׿]+/g, '-')}.md`}
      buildFile={buildFile}
      renderFull={(dataUnknown) => <FullReport p={dataUnknown as Playbook} />}
      renderTeaser={(dataUnknown, filled) => {
        const p = dataUnknown as Playbook;
        return (
          <ScoreTeaser
            org="הפלייבוק שלכם"
            scorecard={p.scorecard}
            filled={filled}
            sub="ציון מוכנות מכירה, כמה מנוע המכירות שלכם בנוי ומוכן היום."
            mapTitle="מפת המוכנות שלכם"
            highlightBadge="ICP והכאב"
            highlightTitle={p.icp.profile}
            highlightBody={<span><strong>הכאב:</strong> {p.icp.pain}<br /><strong>למה עכשיו:</strong> {p.icp.whyNow}</span>}
          />
        );
      }}
      ctas={<a className="btn btn-ghost" href="/free-tools/differentiation" style={{ justifyContent: 'center' }}>קודם לדעת מה מבדל אתכם ←</a>}
    />
  );
}
