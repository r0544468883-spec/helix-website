'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site';
import { submitContextLead } from '@/lib/context-lead';

/* ─────────────────────────────────────────────────────────────
   שאלון AI לעסק — הפלט העיקרי: תוכנית פעולה מותאמת אישית לשיפור
   העבודה עם AI (Quick Win, מה לתקן, כלים, הצעד הבא) + ציון מוכנות.
   בונוס: קובץ אפיון להדבקה בכלי AI. הכל client-side; ליד ל-Supabase.
   "גם וגם": המלצות חוקיות מיידיות + מסלול ניתוח-AI מעמיק אופציונלי
   (אם NEXT_PUBLIC_AI_RECO_ENDPOINT מוגדר — אחרת נופל ל-CTA אנושי).
   ───────────────────────────────────────────────────────────── */

type FieldType = 'text' | 'textarea' | 'url' | 'tel' | 'email' | 'segmented';

interface Field {
  key: string;
  type: FieldType;
  placeholder?: string;
  dir?: 'ltr' | 'rtl';
  required?: boolean;
  options?: { value: string; label: string }[];
}
interface Step { q: string; hint?: string; fields: Field[]; }

const STEPS: Step[] = [
  { q: 'מה כתובת האתר של הארגון?', hint: 'כדי שנכיר אתכם. אפשר גם עמוד פייסבוק/לינקדאין.',
    fields: [{ key: 'website', type: 'url', placeholder: 'example.co.il', dir: 'ltr' }] },
  { q: 'מה העיסוק / התחום שלכם?',
    fields: [{ key: 'occupation', type: 'text', placeholder: 'למשל: משרד עו"ד, חנות אונליין, סטארטאפ B2B', required: true }] },
  { q: 'מה הכי גוזל לכם זמן ביום-יום?', hint: 'זה מה שנתחיל לשפר עם AI.',
    fields: [{ key: 'timesink', type: 'segmented', required: true, options: [
      { value: 'support', label: 'מענה ללקוחות' },
      { value: 'content', label: 'כתיבת תוכן' },
      { value: 'data', label: 'ניתוח נתונים ודוחות' },
      { value: 'admin', label: 'עבודה אדמיניסטרטיבית' },
      { value: 'sales', label: 'מכירות ומעקב לידים' },
    ] }] },
  { q: 'שם הארגון — ובמשפט-שניים, מה אתם עושים?', hint: 'הליבה של הזהות שלכם.',
    fields: [
      { key: 'org_name', type: 'text', placeholder: 'שם הארגון', required: true },
      { key: 'what_you_do', type: 'textarea', placeholder: 'אנחנו ארגון ש...', required: true },
    ] },
  { q: 'מי קהל היעד שלכם?',
    fields: [{ key: 'audience', type: 'textarea', placeholder: 'הקהל שלנו הוא...' }] },
  { q: 'מה השירותים/מוצרים המרכזיים?',
    fields: [{ key: 'offerings', type: 'textarea', placeholder: 'אנחנו מציעים...' }] },
  { q: 'איך אתם רוצים שה-AI יישמע? (טון וסגנון)', hint: 'למשל: ענייני אבל חם, בלי סופרלטיבים.',
    fields: [{ key: 'tone', type: 'textarea', placeholder: 'טון: ... אל תכתבו: ...' }] },
  { q: 'מה המטרה המרכזית שלכם עכשיו?', hint: 'לאן אתם רוצים להגיע ברבעון הקרוב.',
    fields: [{ key: 'goal', type: 'textarea', placeholder: 'המטרה שלנו...' }] },
  { q: 'כמה אתם משתמשים ב-AI היום?',
    fields: [{ key: 'ai_uses', type: 'segmented', required: true, options: [
      { value: 'none', label: 'עוד לא ממש' }, { value: 'some', label: 'קצת, פה ושם' }, { value: 'lots', label: 'הרבה, כל יום' },
    ] }] },
  { q: 'יש מדיניות שימוש / אבטחת מידע ל-AI בארגון?',
    fields: [{ key: 'ai_policy', type: 'segmented', required: true, options: [
      { value: 'yes', label: 'כן, מוגדרת' }, { value: 'no', label: 'עדיין לא' },
    ] }] },
  { q: 'הצוות עבר הדרכה מסודרת על AI?',
    fields: [{ key: 'ai_training', type: 'segmented', required: true, options: [
      { value: 'yes', label: 'כן' }, { value: 'no', label: 'לא' },
    ] }] },
  { q: 'לאן לשלוח את התוכנית? (וגם — נכיר אתכם)', hint: 'הכל נבנה אצלכם בדפדפן. הפרטים עוזרים לנו להתאים לכם ליווי אם תרצו.',
    fields: [
      { key: 'name', type: 'text', placeholder: 'שם מלא', required: true },
      { key: 'phone', type: 'tel', placeholder: 'טלפון', dir: 'ltr', required: true },
      { key: 'email', type: 'email', placeholder: 'אימייל', dir: 'ltr' },
    ] },
];

type Answers = Record<string, string>;
const wa = (msg: string) => `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;

/* ── recommendation engine (rule-based, client-side) ── */

interface Reco { icon: string; title: string; body: string; }

const TIMESINK: Record<string, Reco> = {
  support: { icon: '🎧', title: 'סוכן AI למענה ללקוחות', body: 'עוזר AI שמנסח תשובות, מסכם פניות ובונה בסיס-ידע חכם — מקצר זמן טיפול ומשחרר את הצוות ל-20% שדורש מגע אנושי.' },
  content: { icon: '✍️', title: 'פייפליין תוכן ב-AI', body: 'ספריית פרומפטים לפוסטים ומיילים בטון שלכם — מרעיון לתוכן מוכן בדקות, בלי שיישמע כמו רובוט.' },
  data: { icon: '📊', title: 'ניתוח נתונים בשפה חופשית', body: 'לחבר AI לדוחות שלכם ולשאול שאלות במילים — סיכומים, מגמות ותובנות בלי לגעת בנוסחאות.' },
  admin: { icon: '⚙️', title: 'אוטומציה של העבודה החוזרת', body: 'סיכומי פגישות, תמלול, מילוי טפסים ומעקב — AI שעושה את העבודה השחורה כדי שתתמקדו במה שחשוב.' },
  sales: { icon: '💼', title: 'AI למכירות ומעקב לידים', body: 'הכנה לשיחות, ניסוח הצעות, סיכומי שיחות ומעקב אוטומטי — פחות לידים נופלים, יותר סגירות.' },
};

const TOOLKIT: Record<string, string[]> = {
  support: ['ChatGPT / Claude לצוות', 'עוזר AI על בסיס-הידע (RAG)', 'צ׳אטבוט לאתר/WhatsApp'],
  content: ['ChatGPT / Claude', 'Gamma למצגות', 'ElevenLabs / Runway למדיה'],
  data: ['ChatGPT (Advanced Data Analysis)', 'NotebookLM לידע פנימי', 'Claude לניתוח מסמכים'],
  admin: ['Fireflies / Zoom AI לפגישות', 'Zapier / Make לאוטומציה', 'ChatGPT / Claude'],
  sales: ['HubSpot AI', 'Claude / ChatGPT להצעות', 'Fireflies לסיכומי שיחות'],
};

function buildReport(a: Answers) {
  const uses = a.ai_uses === 'lots' ? 2 : a.ai_uses === 'some' ? 1 : 0;
  const policy = a.ai_policy === 'yes' ? 1 : 0;
  const training = a.ai_training === 'yes' ? 1 : 0;
  const raw = uses + policy + training;              // 0..4
  const score = Math.round((raw / 4) * 10);          // 0..10
  const tier = raw <= 1 ? 'בתחילת הדרך' : raw <= 3 ? 'בדרך הנכונה' : 'מתקדמים';

  const quickWin = TIMESINK[a.timesink] || TIMESINK.admin;
  const tools = TOOLKIT[a.timesink] || TOOLKIT.admin;

  const fixFirst: Reco[] = [];
  if (a.ai_uses === 'none')
    fixFirst.push({ icon: '🚀', title: 'התחילו מ-Quick Win אחד', body: 'אל תנסו הכל בבת אחת. בחרו תהליך יומיומי אחד (מלמעלה) והטמיעו אותו עד שהוא הרגל — ואז הרחיבו.' });
  if (a.ai_policy !== 'yes')
    fixFirst.push({ icon: '🔐', title: 'בנו מדיניות שימוש ואבטחת מידע', body: 'הגדירו מה מותר להזין ל-AI ומה אסור, ואיפה מידע רגיש נשמר. בלי זה, כל הטמעה היא סיכון.' });
  if (a.ai_training !== 'yes')
    fixFirst.push({ icon: '🧑‍🏫', title: 'העבירו סדנת AI לצוות', body: 'הדרכה מעשית לפי תפקידים — כדי שכל אחד ידע לעבוד עם AI ביום-יום, לא רק ישמע עליו. הטמעה זה תהליך, לא אירוע.' });
  if (fixFirst.length === 0)
    fixFirst.push({ icon: '📈', title: 'עברו למדידה והרחבה', body: 'אתם מתקדמים — השלב הבא הוא לכמת שעות שנחסכו, להרחיב לתהליכים נוספים ולחבר AI לליבת המערכות.' });

  const nextStep = a.ai_uses === 'lots'
    ? 'אתם כבר בפנים — כדאי להעמיק: לחבר AI למערכות הליבה ולמדוד ROI. שיחת אבחון תמפה לכם איפה הערך הבא.'
    : 'הצעד הבא: לבחור תהליך אחד ולהטמיע אותו נכון. אבחון ראשוני חינם ימפה לכם מאיפה להתחיל בלי סיכון.';

  return { score, tier, quickWin, tools, fixFirst, nextStep };
}
type Report = ReturnType<typeof buildReport>;

function buildFile(a: Answers): string {
  const line = (v?: string) => (v && v.trim() ? v.trim() : '—');
  return `# קובץ אפיון ארגון — ${line(a.org_name)}
> נוצר בחינם ב-HELIX. הדביקו בכל כלי AI (Claude Projects, GPT מותאם, Gems) או שמרו כ-CLAUDE.md / AGENTS.md.

## מי אנחנו
${line(a.what_you_do)}
- תחום: ${line(a.occupation)}
- אתר: ${line(a.website)}

## קהל היעד
${line(a.audience)}

## מה אנחנו מציעים
${line(a.offerings)}

## טון וסגנון
${line(a.tone)}

## מטרה נוכחית
${line(a.goal)}

---
נבנה עם HELIX — ליווי והטמעת AI · ${SITE.url}/services/ai-consulting
`;
}

const AI_ENDPOINT = process.env.NEXT_PUBLIC_AI_RECO_ENDPOINT;

export default function ContextQuestionnaire({ id = 'context-tool' }: { id?: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [report, setReport] = useState<Report | null>(null);
  const [file, setFile] = useState('');
  const [copied, setCopied] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const total = STEPS.length;
  const current = STEPS[step];
  const set = (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v }));
  const canProceed = current.fields.every((f) => !f.required || (answers[f.key] && answers[f.key].trim()));

  function next() {
    if (!canProceed || advancing) return;
    const last = step >= total - 1;
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { last ? finish() : setStep((s) => s + 1); return; }
    // quick "✓" confirmation, then the next question slides in
    setAdvancing(true);
    window.setTimeout(() => {
      setAdvancing(false);
      if (last) finish(); else setStep((s) => s + 1);
    }, 280);
  }

  function finish() {
    setReport(buildReport(answers));
    setFile(buildFile(answers));
    setDone(true);
    void submitContextLead({
      website: answers.website, occupation: answers.occupation, org_name: answers.org_name,
      what_you_do: answers.what_you_do, audience: answers.audience, offerings: answers.offerings,
      tone: answers.tone, redlines: answers.goal, ai_uses: answers.ai_uses,
      ai_policy: answers.ai_policy, ai_training: answers.ai_training,
      readiness_score: buildReport(answers).score,
      name: answers.name, phone: answers.phone, email: answers.email,
    });
  }

  function download() {
    const blob = new Blob([file], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url;
    el.download = `context-${(answers.org_name || 'org').replace(/[^\w֐-׿]+/g, '-')}.md`;
    document.body.appendChild(el); el.click(); el.remove(); URL.revokeObjectURL(url);
  }
  async function copyAll() {
    try { await navigator.clipboard.writeText(file); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* download still works */ }
  }
  async function deepAnalyze() {
    if (!AI_ENDPOINT) { window.open(wa('שלום, מילאתי את שאלון ה-AI ורוצה ניתוח מעמיק ומותאם אישית'), '_blank'); return; }
    setAiLoading(true);
    try {
      const res = await fetch(AI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(answers) });
      const data = await res.json();
      setAiText(data.text || data.recommendations || '');
    } catch {
      window.open(wa('שלום, מילאתי את שאלון ה-AI ורוצה ניתוח מעמיק'), '_blank');
    } finally { setAiLoading(false); }
  }

  /* ── RESULT: the action plan is the centerpiece ── */
  if (done && report) {
    return (
      <section className="ctx-tool" id={id}>
        <div className="container">
          <div className="ctx-result">
            <span className="ctx-badge">✓ התוכנית שלכם מוכנה</span>
            <h2 className="ctx-result-title">תוכנית ה-AI של {answers.org_name || 'הארגון שלכם'}</h2>
            <p className="ctx-result-sub">המלצות מותאמות אישית לשיפור העבודה שלכם עם AI — לפי מה שעניתם.</p>

            {/* score */}
            <div className="ctx-scorebar">
              <span className="ctx-diag-score">{report.score}<small>/10</small></span>
              <div><strong>מוכנות ה-AI שלכם: {report.tier}</strong><p>ככל שתתקדמו — הציון עולה.</p></div>
            </div>

            {/* Quick Win */}
            <div className="ctx-reco ctx-reco--hero">
              <span className="ctx-reco-eyebrow">⚡ ההזדמנות המיידית שלכם</span>
              <div className="ctx-reco-row">
                <span className="ctx-reco-icon">{report.quickWin.icon}</span>
                <div><h3>{report.quickWin.title}</h3><p>{report.quickWin.body}</p></div>
              </div>
            </div>

            {/* Fix first */}
            <h3 className="ctx-reco-h">מה כדאי לתקן קודם</h3>
            <div className="ctx-reco-grid">
              {report.fixFirst.map((r) => (
                <div key={r.title} className="ctx-reco">
                  <div className="ctx-reco-row">
                    <span className="ctx-reco-icon">{r.icon}</span>
                    <div><h3>{r.title}</h3><p>{r.body}</p></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tools */}
            <h3 className="ctx-reco-h">כלים מומלצים לכם</h3>
            <div className="ctx-tools">
              {report.tools.map((t) => <span key={t} className="ctx-tool-pill">{t}</span>)}
            </div>

            {/* Deep AI analysis (optional) */}
            <div className="ctx-deep">
              <button className="btn btn-ghost" onClick={deepAnalyze} disabled={aiLoading}>
                {aiLoading ? 'מנתח…' : '✨ רוצים ניתוח AI מעמיק ומותאם אישית?'}
              </button>
              {aiText && <pre className="ctx-file-preview" dir="rtl">{aiText}</pre>}
            </div>

            {/* Bonus: context file */}
            <div className="ctx-bonus">
              <button className="ctx-bonus-toggle" onClick={() => setShowFile((s) => !s)}>
                🎁 בונוס: קובץ אפיון ארגון להדבקה בכל כלי AI {showFile ? '▲' : '▼'}
              </button>
              {showFile && (
                <>
                  <p className="ctx-bonus-sub">הדביקו ב-Claude Projects / GPT מותאם / Gems, או שמרו כ-CLAUDE.md / AGENTS.md.</p>
                  <div className="ctx-actions">
                    <button className="btn btn-primary" onClick={download}>⬇ הורדת הקובץ</button>
                    <button className="btn btn-ghost" onClick={copyAll}>{copied ? '✓ הועתק' : 'העתק הכל'}</button>
                  </div>
                  <pre className="ctx-file-preview" dir="rtl">{file}</pre>
                </>
              )}
            </div>

            {/* CTA → consulting */}
            <div className="ctx-cta">
              <h3>{report.nextStep}</h3>
              <div className="ctx-actions">
                <a className="btn btn-primary" href={wa('שלום, מילאתי את שאלון ה-AI ב-HELIX ורציתי לשמוע על ליווי והטמעת AI')} target="_blank" rel="noopener noreferrer">דברו איתנו בוואטסאפ</a>
                <a className="btn btn-ghost" href="/services/ai-consulting">לדף הליווי וההטמעה</a>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── QUESTION view ── */
  return (
    <section className="ctx-tool" id={id}>
      <div className="container">
        <div className={`ctx-card ${advancing ? 'is-advancing' : ''}`}>
          <div className="ctx-progress" aria-hidden="true">
            <div className="ctx-progress-fill" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>

          {advancing && (
            <div className="ctx-confirm" aria-hidden="true"><span className="ctx-confirm-mark">✓</span></div>
          )}

          <div className="ctx-anim" key={step}>
          <span className="ctx-step-count">שאלה {step + 1} מתוך {total}</span>
          <h3 className="ctx-q">{current.q}</h3>
          {current.hint && <p className="ctx-hint">{current.hint}</p>}

          <form className="ctx-fields" onSubmit={(e) => { e.preventDefault(); next(); }}>
            {current.fields.map((f) => {
              if (f.type === 'segmented') {
                return (
                  <div key={f.key} className="rd-seg-btns ctx-seg">
                    {f.options!.map((o) => (
                      <button type="button" key={o.value}
                        className={`rd-seg-btn ${answers[f.key] === o.value ? 'on' : ''}`}
                        onClick={() => set(f.key, o.value)}>{o.label}</button>
                    ))}
                  </div>
                );
              }
              if (f.type === 'textarea') {
                return (
                  <textarea key={f.key} className="ctx-input ctx-textarea" placeholder={f.placeholder}
                    dir={f.dir || 'rtl'} value={answers[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} rows={3} />
                );
              }
              return (
                <input key={f.key} className="ctx-input" type={f.type === 'url' ? 'text' : f.type}
                  placeholder={f.placeholder} dir={f.dir || 'rtl'} value={answers[f.key] || ''}
                  onChange={(e) => set(f.key, e.target.value)} />
              );
            })}

            <div className="ctx-nav">
              {step > 0 && (
                <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>→ הקודם</button>
              )}
              <button type="submit" className="btn btn-primary ctx-next" disabled={!canProceed || advancing}>
                {step < total - 1 ? 'הבא ←' : 'בנו לי את התוכנית ←'}
              </button>
            </div>
          </form>

          {!current.fields.some((f) => f.required) && (
            <button type="button" className="ctx-skip" onClick={next}>דלגו על השאלה</button>
          )}
          </div>
        </div>
      </div>
    </section>
  );
}
