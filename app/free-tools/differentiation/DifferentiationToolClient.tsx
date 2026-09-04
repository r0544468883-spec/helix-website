'use client';

// Differentiation tool = shared QuestionnaireTool + a differentiation-specific step list,
// teaser and full-report file. Engine (maker/critic team) lives server-side at
// /api/differentiation; here we only collect answers, show a teaser, and hand the full
// report over as a downloadable file.

import QuestionnaireTool, { type Answers, type Step } from '../_shared/QuestionnaireTool';
import ScoreTeaser, { type Scorecard } from '../_shared/ScoreTeaser';

type Analysis = {
  scorecard: Scorecard;
  industry: string;
  porter: { forces: { name: string; note: string }[]; verdict: string };
  groups: { axisX: string; axisY: string; cluster: string; whitespace: string; note: string };
  vrino: { asset: string; value: boolean; rare: boolean; inimitable: boolean; organized: boolean; verdict: string }[];
  passingAsset: string;
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[]; lever: string; softBelly: string };
  blueOcean: { eliminate: string[]; reduce: string[]; raise: string[]; create: string[]; space: string };
  statement: { objective: string; scope: string; advantage: string };
  moves: string[];
  assumptions: string[];
  unverifiedCompetitors: string[];
};

const STEPS: Step[] = [
  { section: 'על העסק', q: 'מה אתם מוכרים או בונים?', hint: 'במשפט או שניים, בשפה שלכם.',
    fields: [{ key: 'sells', type: 'textarea', placeholder: 'למשל: מערכות AI בהזמנה לעסקים, כולל התשתית להרצה בפרודקשן', required: true }] },
  { section: 'על העסק', q: 'מי הלקוח שלכם?',
    fields: [{ key: 'customer', type: 'text', placeholder: 'למשל: סוכנויות ביטוח עצמאיות', required: true }] },
  { section: 'השוק', q: 'איך תתארו את הענף במשפט?', hint: 'לא "AI", אלא הסגמנט המדויק.',
    fields: [{ key: 'market', type: 'text', placeholder: 'למשל: פיתוח AI בהזמנה בישראל' }] },
  { section: 'העסקה', q: 'מה גודל העסקה הטיפוסית שלכם?', hint: 'גררו את המד, הקלידו סכום מדויק, או עברו לסכומים גדולים יותר.',
    fields: [{ key: 'dealBand', type: 'dealslider' }] },
  { section: 'תחרות', q: 'אילו מתחרים אתם מכירים?', hint: 'שם אחד בכל שורה. אפשר גם לדלג.',
    fields: [{ key: 'competitors', type: 'textarea', placeholder: 'מתחרה 1\nמתחרה 2\nמתחרה 3', dir: 'rtl' }] },
  { section: 'היתרון שלכם', q: 'מה היתרונות שאתם חושבים שיש לכם?', hint: 'את אלה נעביר דרך VRINO, בכנות.',
    fields: [{ key: 'advantages', type: 'textarea', placeholder: 'למשל: צוות ותיק, ניסיון פינטק, מהירות' }] },
  { section: 'כמעט סיימנו', q: 'לאן לשלוח את הדוח המלא?', hint: 'הפרטים עוזרים לנו להתאים לכם ליווי אם תרצו.',
    fields: [
      { key: 'name', type: 'text', placeholder: 'שם מלא', required: true },
      { key: 'email', type: 'email', placeholder: 'אימייל', dir: 'ltr', required: true },
    ] },
];

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
    advantages: answers.advantages, dealBand: answers.dealBand,
    competitors: (answers.competitors || '').split('\n').map((c) => c.trim()).filter(Boolean).slice(0, 5),
  };
  const details = {
    'מה מוכרים': answers.sells || '', 'לקוח': answers.customer || '', 'ענף': answers.market || '',
    'מתחרים': input.competitors.join(', '), 'יתרונות נטענים': answers.advantages || '', 'גודל עסקה': answers.dealBand || '',
  };
  fetch('/api/content-lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, name: answers.name || '', source: '/free-tools/differentiation', details }) }).catch(() => {});
  try {
    const res = await fetch('/api/differentiation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'run', input, leadEmail: email }) });
    const j = await res.json();
    return j.ok && j.analysis ? { ok: true, data: j.analysis as Analysis } : { ok: false, error: j.error ?? '' };
  } catch { return { ok: false, error: 'network' }; }
}

const yn = (b: boolean) => (b ? 'כן' : 'לא');
function buildFile(dataUnknown: unknown, answers: Answers): string {
  const a = dataUnknown as Analysis;
  const L: string[] = [];
  L.push(`# ניתוח בידול עסקי, ${answers.name || 'העסק שלכם'}`);
  L.push(`> נוצר בחינם ב-HELIX · ${answers.email || ''}`);
  L.push(`\n## ציון בהירות בידול: ${a.scorecard.score}/100 (${a.scorecard.label})`);
  a.scorecard.dims.forEach((d) => L.push(`- ${d.label}: ${d.value}/100`));
  L.push(`\n## המשפט האסטרטגי`);
  L.push(`מטרה: ${a.statement.objective}\nסקופ: ${a.statement.scope}\nיתרון: ${a.statement.advantage}`);
  L.push(`\n## הענף\n${a.industry}`);
  L.push(`\n## פורטר 5+1, ${a.porter.verdict}`);
  a.porter.forces.forEach((f) => L.push(`- ${f.name}: ${f.note}`));
  L.push(`\n## קבוצות אסטרטגיה`);
  L.push(`צירים: ${a.groups.axisX} מול ${a.groups.axisY}\nהאשכול הצפוף: ${a.groups.cluster}\nהמרחב הפנוי: ${a.groups.whitespace}${a.groups.note ? `\n${a.groups.note}` : ''}`);
  L.push(`\n## VRINO, מבחן הכנות`);
  L.push(`| נכס | ערך | נדיר | קשה לחיקוי | מאורגן | שורה תחתונה |`);
  L.push(`| --- | --- | --- | --- | --- | --- |`);
  a.vrino.forEach((v) => L.push(`| ${v.asset} | ${yn(v.value)} | ${yn(v.rare)} | ${yn(v.inimitable)} | ${yn(v.organized)} | ${v.verdict} |`));
  if (a.passingAsset) L.push(`\nהנכס היחיד שעובר: ${a.passingAsset}`);
  L.push(`\n## SWOT`);
  L.push(`חוזקות: ${a.swot.strengths.join('; ')}`);
  L.push(`חולשות: ${a.swot.weaknesses.join('; ')}`);
  L.push(`הזדמנויות: ${a.swot.opportunities.join('; ')}`);
  L.push(`איומים: ${a.swot.threats.join('; ')}`);
  L.push(`מנוף: ${a.swot.lever}`);
  L.push(`בטן רכה: ${a.swot.softBelly}`);
  L.push(`\n## אוקיינוס כחול, ${a.blueOcean.space}`);
  L.push(`לבטל: ${a.blueOcean.eliminate.join('; ')}`);
  L.push(`להפחית: ${a.blueOcean.reduce.join('; ')}`);
  L.push(`להעלות: ${a.blueOcean.raise.join('; ')}`);
  L.push(`ליצור: ${a.blueOcean.create.join('; ')}`);
  L.push(`\n## המהלכים הבאים`);
  a.moves.forEach((m, i) => L.push(`${i + 1}. ${m}`));
  if (a.unverifiedCompetitors.filter(Boolean).length) L.push(`\n## מתחרים שהוצעו, טעונים אימות\n${a.unverifiedCompetitors.filter(Boolean).map((c) => `- ${c}`).join('\n')}`);
  if (a.assumptions.filter(Boolean).length) L.push(`\n## הנחות שהנחנו\n${a.assumptions.filter(Boolean).map((c) => `- ${c}`).join('\n')}`);
  L.push(`\n---\nHELIX · ${'https://www.helix.co.il'}`);
  return L.join('\n');
}

export default function DifferentiationToolClient({ id = 'diff-tool' }: { id?: string }) {
  return (
    <QuestionnaireTool
      id={id}
      steps={STEPS}
      run={run}
      errorText={errText}
      analyzingText="הצוות עובד, היוצר מריץ את המודלים והמבקר בודק כל טענה. בונה את הדוח שלכם…"
      fileName={(a) => `differentiation-${(a.name || 'org').replace(/[^\w֐-׿]+/g, '-')}.md`}
      buildFile={buildFile}
      renderTeaser={(dataUnknown, filled) => {
        const a = dataUnknown as Analysis;
        return (
          <ScoreTeaser
            org={`ניתוח הבידול שלכם · ${a.industry}`}
            scorecard={a.scorecard}
            filled={filled}
            sub="ציון בהירות בידול, כמה היתרון שלכם באמת מובחן וקשה לחיקוי."
            mapTitle="מפת הבידול שלכם"
            highlightBadge="המשפט האסטרטגי"
            highlightTitle={a.statement.objective}
            highlightBody={<span><strong>סקופ:</strong> {a.statement.scope}<br /><strong>יתרון:</strong> {a.statement.advantage}</span>}
          />
        );
      }}
      ctas={<a className="btn btn-ghost" href="/free-tools/sales" style={{ justifyContent: 'center' }}>ואז, לבנות משפך מכירות ←</a>}
    />
  );
}
