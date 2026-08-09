'use client';

import { useState } from 'react';
import { SITE } from '@/lib/site';
import { submitContextLead } from '@/lib/context-lead';

/* ─────────────────────────────────────────────────────────────
   אבחון AI לעסק — שאלון מקצועי על פני 5 מימדי בשלות, מותאם לפי
   פרופיל העסק (תחום, גודל, מודל). הפלט: דוח בשלות + 3 הזדמנויות
   שכל אחת ממופה קודם כל לפתרון HELIX + תוכנית 90 יום. בונוס: קובץ
   אפיון. הכל client-side; ליד ל-Supabase.
   ───────────────────────────────────────────────────────────── */

type FieldType = 'text' | 'textarea' | 'url' | 'tel' | 'email' | 'segmented' | 'multi';
interface Field { key: string; type: FieldType; placeholder?: string; dir?: 'ltr' | 'rtl'; required?: boolean; options?: { value: string; label: string }[]; }
interface Step { section: string; q: string; hint?: string; fields: Field[]; }

const STEPS: Step[] = [
  // ── על העסק ──
  { section: 'על העסק', q: 'מה כתובת האתר של הארגון?', hint: 'כדי שנכיר אתכם. אפשר גם עמוד פייסבוק/לינקדאין.',
    fields: [{ key: 'website', type: 'url', placeholder: 'example.co.il', dir: 'ltr' }] },
  { section: 'על העסק', q: 'מה תחום העיסוק שלכם?',
    fields: [{ key: 'industry', type: 'segmented', required: true, options: [
      { value: 'services', label: 'שירותים מקצועיים' }, { value: 'ecommerce', label: 'מסחר ו-eCommerce' },
      { value: 'industry', label: 'תעשייה וייצור' }, { value: 'saas', label: 'טכנולוגיה / SaaS' },
      { value: 'health', label: 'בריאות' }, { value: 'realestate', label: 'נדל"ן' },
      { value: 'finance', label: 'פיננסים' }, { value: 'other', label: 'אחר' },
    ] }] },
  { section: 'על העסק', q: 'כמה עובדים בארגון?',
    fields: [{ key: 'size', type: 'segmented', required: true, options: [
      { value: '1-5', label: '1–5' }, { value: '6-20', label: '6–20' }, { value: '21-50', label: '21–50' },
      { value: '51-200', label: '51–200' }, { value: '200+', label: '200+' },
    ] }] },
  { section: 'על העסק', q: 'מי הלקוחות שלכם?',
    fields: [{ key: 'model', type: 'segmented', required: true, options: [
      { value: 'b2b', label: 'עסקים (B2B)' }, { value: 'b2c', label: 'צרכנים (B2C)' }, { value: 'both', label: 'שניהם' },
    ] }] },
  { section: 'על העסק', q: 'שם הארגון — ובמשפט, מה אתם עושים?',
    fields: [
      { key: 'org_name', type: 'text', placeholder: 'שם הארגון', required: true },
      { key: 'what_you_do', type: 'textarea', placeholder: 'אנחנו ארגון ש...', required: true },
    ] },

  // ── תשתית וכלים ──
  { section: 'תשתית וכלים', q: 'מה משמש אתכם לניהול לקוחות (CRM)?',
    fields: [{ key: 'crm', type: 'segmented', required: true, options: [
      { value: 'salesforce', label: 'Salesforce' }, { value: 'hubspot', label: 'HubSpot' }, { value: 'monday', label: 'Monday' },
      { value: 'pipedrive', label: 'Pipedrive' }, { value: 'zoho', label: 'Zoho' }, { value: 'sheets', label: 'גיליונות / אקסל' },
      { value: 'none', label: 'אין CRM' },
    ] }] },
  { section: 'תשתית וכלים', q: 'אילו כלים מרכזיים בסטאק שלכם?', hint: 'אפשר לבחור כמה.',
    fields: [{ key: 'stack', type: 'multi', options: [
      { value: 'email', label: 'אימייל מרקטינג' }, { value: 'phone', label: 'טלפוניה/מרכזייה' }, { value: 'whatsapp', label: 'WhatsApp Business' },
      { value: 'ecom', label: 'חנות / eCommerce' }, { value: 'pm', label: 'ניהול פרויקטים' }, { value: 'bi', label: 'BI / דאטה' }, { value: 'support', label: 'תמיכה / צ׳אט' },
    ] }] },

  // ── אוטומציה ותהליכים ──
  { section: 'אוטומציה ותהליכים', q: 'כמה מהעבודה החוזרת מתבצע אוטומטית היום?',
    fields: [{ key: 'automation', type: 'segmented', required: true, options: [
      { value: 'manual', label: 'הכל ידני' }, { value: 'few', label: 'מעט אוטומציות' }, { value: 'significant', label: 'חלק ניכר' }, { value: 'most', label: 'רוב התהליכים' },
    ] }] },
  { section: 'אוטומציה ותהליכים', q: 'יש אינטגרציות בין המערכות (CRM ↔ אימייל ↔ חנות)?',
    fields: [{ key: 'integrations', type: 'segmented', required: true, options: [
      { value: 'none', label: 'אין — כל מערכת לבד' }, { value: 'partial', label: 'חלקי' }, { value: 'full', label: 'מלא ומסונכרן' },
    ] }] },
  { section: 'אוטומציה ותהליכים', q: 'איפה התהליך הכי כואב לכם?', hint: 'זה מה שנתחיל לשפר.',
    fields: [{ key: 'pain', type: 'segmented', required: true, options: [
      { value: 'support', label: 'מענה ותמיכה בלקוחות' }, { value: 'content', label: 'יצירת תוכן ושיווק' }, { value: 'sales', label: 'מכירות ומעקב לידים' },
      { value: 'reports', label: 'דוחות וקבלת החלטות' }, { value: 'ops', label: 'תפעול ואדמיניסטרציה' }, { value: 'visibility', label: 'גיוס לקוחות ונראות' },
    ] }] },

  // ── דאטה ומדידה ──
  { section: 'דאטה ומדידה', q: 'איך אתם עוקבים אחרי ביצועים?',
    fields: [{ key: 'tracking', type: 'segmented', required: true, options: [
      { value: 'none', label: 'לא באמת' }, { value: 'excel', label: 'אקסלים ידניים' }, { value: 'basic', label: 'דשבורד בסיסי' }, { value: 'bi', label: 'BI בזמן אמת' },
    ] }] },
  { section: 'דאטה ומדידה', q: 'החלטות מתקבלות לפי...',
    fields: [{ key: 'decisions', type: 'segmented', required: true, options: [
      { value: 'gut', label: 'תחושה וניסיון' }, { value: 'partial', label: 'נתונים חלקיים' }, { value: 'full', label: 'נתונים מלאים' },
    ] }] },

  // ── שימוש AI וצוות ──
  { section: 'שימוש AI וצוות', q: 'כמה הצוות משתמש ב-AI היום?',
    fields: [{ key: 'ai_uses', type: 'segmented', required: true, options: [
      { value: 'none', label: 'עוד לא' }, { value: 'individuals', label: 'יחידים' }, { value: 'some', label: 'חלק מהצוות' }, { value: 'all', label: 'כל הצוות' },
    ] }] },
  { section: 'שימוש AI וצוות', q: 'היכן כבר משתמשים ב-AI?', hint: 'אפשר לבחור כמה.',
    fields: [{ key: 'ai_where', type: 'multi', options: [
      { value: 'content', label: 'כתיבת תוכן' }, { value: 'support', label: 'מענה ללקוחות' }, { value: 'data', label: 'ניתוח נתונים' },
      { value: 'code', label: 'קוד / פיתוח' }, { value: 'media', label: 'עיצוב / מדיה' }, { value: 'none', label: 'בכלל לא' },
    ] }] },
  { section: 'שימוש AI וצוות', q: 'הצוות עבר הדרכה מסודרת על AI?',
    fields: [{ key: 'training', type: 'segmented', required: true, options: [
      { value: 'yes', label: 'כן' }, { value: 'partial', label: 'חלקי' }, { value: 'no', label: 'לא' },
    ] }] },

  // ── ממשל ואבטחה ──
  { section: 'ממשל ואבטחה', q: 'יש מדיניות שימוש ואבטחת מידע ל-AI?',
    fields: [{ key: 'policy', type: 'segmented', required: true, options: [
      { value: 'defined', label: 'מוגדרת' }, { value: 'progress', label: 'בתהליך' }, { value: 'none', label: 'אין' },
    ] }] },

  // ── מטרה + קשר ──
  { section: 'המטרה שלכם', q: 'מה המטרה המרכזית ל-12 החודשים הקרובים?',
    fields: [{ key: 'goal', type: 'textarea', placeholder: 'למשל: להכפיל מכירות, לקצר זמני טיפול, להיכנס לשוק חדש...' }] },
  { section: 'כמעט סיימנו', q: 'לאן לשלוח את התוכנית?', hint: 'הכל נבנה אצלכם בדפדפן. הפרטים עוזרים לנו להתאים לכם ליווי אם תרצו.',
    fields: [
      { key: 'name', type: 'text', placeholder: 'שם מלא', required: true },
      { key: 'phone', type: 'tel', placeholder: 'טלפון', dir: 'ltr', required: true },
      { key: 'email', type: 'email', placeholder: 'אימייל', dir: 'ltr' },
    ] },
];

type Answers = Record<string, string>;
const wa = (msg: string) => `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(msg)}`;

/* ── scoring: 5 dimensions, 0..100 ── */
const scoreMap = (v: string | undefined, m: Record<string, number>) => (v && v in m ? m[v] : 0);
function dims(a: Answers) {
  const crm = scoreMap(a.crm, { none: 0, sheets: 40, zoho: 80, pipedrive: 85, monday: 85, hubspot: 100, salesforce: 100 });
  const stackCount = (a.stack ? a.stack.split(',').filter(Boolean).length : 0);
  const stack = Math.min(100, Math.round((stackCount / 5) * 100));
  const infra = Math.round((crm + stack) / 2);
  const autom = Math.round((scoreMap(a.automation, { manual: 0, few: 33, significant: 66, most: 100 }) + scoreMap(a.integrations, { none: 0, partial: 50, full: 100 })) / 2);
  const data = Math.round((scoreMap(a.tracking, { none: 0, excel: 33, basic: 66, bi: 100 }) + scoreMap(a.decisions, { gut: 0, partial: 50, full: 100 })) / 2);
  const usage = Math.round((scoreMap(a.ai_uses, { none: 0, individuals: 33, some: 66, all: 100 }) + scoreMap(a.training, { no: 0, partial: 50, yes: 100 })) / 2);
  const gov = scoreMap(a.policy, { none: 0, progress: 50, defined: 100 });
  const overall = Math.round((infra + autom + data + usage + gov) / 5);
  return { infra, autom, data, usage, gov, overall };
}
function tierOf(n: number) {
  return n <= 20 ? 'מתחילים' : n <= 40 ? 'מתעוררים' : n <= 60 ? 'מיישמים' : n <= 80 ? 'מובילים' : 'חדשניים';
}

/* ── recommendation engine → HELIX-first opportunities ── */
interface Opp { icon: string; title: string; why: string; sev: 'high' | 'mid'; helix: { name: string; desc: string }; alt: string; }

const INDUSTRY_LABEL: Record<string, string> = { services: 'שירותים מקצועיים', ecommerce: 'מסחר ו-eCommerce', industry: 'תעשייה וייצור', saas: 'טכנולוגיה / SaaS', health: 'בריאות', realestate: 'נדל"ן', finance: 'פיננסים', other: 'עסק' };

function painOpp(a: Answers): Opp {
  const ind = a.industry;
  const map: Record<string, Opp> = {
    support: { icon: '🎧', title: 'מענה ללקוחות גוזל המון זמן', why: ind === 'ecommerce' ? 'שאלות על מוצרים, מלאי ומשלוחים חוזרות על עצמן — ורובן ניתנות לאוטומציה.' : 'רוב הפניות חוזרות על עצמן ואפשר לתת להן מענה מיידי 24/7.', sev: 'high',
      helix: { name: 'HELIX Assistant — סוכן AI לשירות', desc: 'סוכן שמכיר את המוצרים והמדיניות שלכם, עונה 24/7 בוואטסאפ ובאתר, מסנן פניות ומעביר לצוות רק את מה שדורש אדם.' }, alt: 'ChatGPT + בסיס-ידע ידני — דורש הקמה ותחזוקה עצמית, בלי חיבור למערכות.' },
    content: { icon: '✍️', title: 'יצירת תוכן ושיווק צורכת זמן ומשאבים', why: 'יצירה, אישור והפצה של תוכן לכל הערוצים — תהליך שאפשר לקצר דרמטית עם AI.', sev: 'high',
      helix: { name: 'HELIX Marketing OPS', desc: 'בקשה → יצירת תוכן מותאם-מותג ב-AI → אישור → הפצה ל-9 ערוצים, ממקום אחד. עברית-first.' }, alt: 'ChatGPT לכתיבה — טוב לטיוטות, אבל בלי תהליך אישור, מותג והפצה.' },
    sales: { icon: '💼', title: 'מכירות ומעקב לידים לא ממוקסמים', why: a.model === 'b2b' ? 'ב-B2B כל ליד יקר — פולואפ איטי = עסקאות שנופלות.' : 'לידים נכנסים אבל המעקב ידני, וחלק נופל בדרך.', sev: 'high',
      helix: { name: 'HELIX SDR', desc: 'זיהוי והעשרת לידים, פנייה רב-ערוצית אוטומטית, וסיכומי שיחות — SDR שעובד 24/7.' }, alt: 'לבנות רצף פולואפ ב-CRM ידנית — אפשרי, אבל לא לומד ולא מתעדף לבד.' },
    reports: { icon: '📊', title: 'החלטות בלי תמונת נתונים אחת', why: 'מעקב הביצועים מפוזר, ואין תצוגה אחת בזמן אמת של מכירות, שיווק ותפעול.', sev: 'high',
      helix: { name: 'HELIX Dashboards', desc: 'דשבורד אחד שמחבר את המערכות, עם AI שמסכם מגמות ומתריע. "שאלו את ה-AI" מרכיב תצוגה במילים.' }, alt: 'Looker/GA4 — עוצמתי, אבל דורש הטמעה טכנית ומומחה לתחזוקה.' },
    ops: { icon: '⚙️', title: 'עבודה תפעולית וחוזרת שוחקת את הצוות', why: 'סיכומים, תיאומים, מילוי טפסים ומעקב — עבודה ידנית שנעשית שוב ושוב.', sev: 'high',
      helix: { name: 'שירות אוטומציות וסוכני AI', desc: 'ממפים את התהליכים, מחברים את המערכות ובונים אוטומציות + סוכני AI שעושים את העבודה השחורה.' }, alt: 'Zapier/Make לבד — נהדר לחיבור אחד, פחות לתהליך מקצה-לקצה.' },
    visibility: { icon: '🔍', title: 'קשה ללקוחות חדשים למצוא אתכם', why: 'הנראות הדיגיטלית חלשה — גם בגוגל וגם במנועי ה-AI שכבר עונים ללקוחות.', sev: 'high',
      helix: { name: 'HELIX GEO', desc: 'הופכים את העסק לגלוי ומומלץ ב-ChatGPT, Gemini ו-Perplexity, ומשפרים נראות אורגנית.' }, alt: 'SEO קלאסי לבד — חשוב, אבל מפספס את שכבת ה-AI Search החדשה.' },
  };
  return map[a.pain] || map.ops;
}

function buildOpps(a: Answers): Opp[] {
  const opps: Opp[] = [painOpp(a)];
  const used = new Set([a.pain]);

  // governance gap — foundational, high severity
  if (a.policy !== 'defined' || a.training === 'no') {
    opps.push({ icon: '🔐', title: a.policy === 'none' ? 'אין מדיניות AI — הסיכון מספר 1' : 'הצוות עובד עם AI בלי הדרכה מסודרת', why: 'שימוש ב-AI בלי כללים והדרכה = סיכון לדליפת מידע ואיכות לא אחידה.', sev: 'high',
      helix: { name: 'שירות ליווי והטמעת AI', desc: 'בונים מדיניות שימוש ואבטחת מידע, ומעבירים סדנת AI מעשית לצוות לפי תפקידים.' }, alt: 'לנסח מסמך מדיניות פנימי — עדיף מכלום, אבל בלי הטמעה נשאר על הנייר.' });
  }
  // data gap
  if (!used.has('reports') && (a.tracking === 'none' || a.tracking === 'excel' || a.decisions === 'gut')) {
    opps.push({ icon: '📊', title: 'אין תמונת נתונים לקבלת החלטות', why: 'קשה להחליט נכון בלי לראות את המספרים במקום אחד ובזמן אמת.', sev: 'mid',
      helix: { name: 'HELIX Dashboards', desc: 'מחברים את המערכות לדשבורד אחד עם תובנות AI והתראות — סוף לאקסלים הידניים.' }, alt: 'להרכיב דוחות ב-GA4/אקסל — עובד, אבל ידני ולא בזמן אמת.' });
  }
  // automation gap
  if (opps.length < 3 && !used.has('ops') && (a.automation === 'manual' || a.automation === 'few' || a.integrations === 'none')) {
    opps.push({ icon: '🔗', title: 'המערכות לא מדברות — הרבה עבודה ידנית', why: 'בלי אינטגרציות ואוטומציה, כל מעבר בין מערכות נעשה ביד ונופלים דברים.', sev: 'mid',
      helix: { name: 'שירות אוטומציות וסוכני AI', desc: 'מחברים CRM, אימייל, חנות ו-WhatsApp, ובונים זרימת ליד אוטומטית מקצה-לקצה.' }, alt: 'Zapier/Make עצמאי — טוב לחיבור בודד, מורכב לתהליך שלם.' });
  }
  // adoption gap (fallback to reach 3)
  if (opps.length < 3) {
    opps.push({ icon: '🚀', title: 'עוד לא מיציתם את ה-Quick Wins', why: 'יש תהליכים יומיומיים שאפשר לחסוך בהם זמן כבר השבוע.', sev: 'mid',
      helix: { name: 'שירות ליווי והטמעת AI', desc: 'מיפוי הזדמנויות + הטמעת Quick Win ראשון — ניצחון מהיר שמייצר מומנטום בצוות.' }, alt: 'לנסות כלים לבד — לרוב נתקע בלי ליווי ומדידה.' });
  }
  return opps.slice(0, 3);
}

function buildRoadmap(a: Answers) {
  const pain = painOpp(a);
  const dataGap = a.tracking === 'none' || a.tracking === 'excel' || a.decisions === 'gut';
  return [
    { ph: 'ימים 1–30', title: 'Quick Win', text: `הטמעת ${pain.helix.name.split('—')[0].trim()} על נקודת הכאב — חיסכון מיידי ומדיד.`, pill: pain.helix.name.split('—')[0].trim() },
    { ph: 'ימים 31–60', title: 'יסודות', text: dataGap ? 'מדיניות AI + סדנת צוות, והקמת דשבורד ביצועים אחד.' : 'מדיניות AI + סדנת צוות להטמעה רוחבית.', pill: dataGap ? 'ליווי + Dashboards' : 'שירות ליווי' },
    { ph: 'ימים 61–90', title: 'סקייל', text: 'חיבור המערכות ואוטומציה של זרימת הליד מקצה-לקצה.', pill: 'שירות אוטומציות' },
  ];
}

function buildFile(a: Answers): string {
  const line = (v?: string) => (v && v.trim() ? v.trim() : '—');
  return `# קובץ אפיון ארגון — ${line(a.org_name)}
> נוצר בחינם ב-HELIX. הדביקו בכל כלי AI (Claude Projects, GPT מותאם, Gems) או שמרו כ-CLAUDE.md / AGENTS.md.

## מי אנחנו
${line(a.what_you_do)}
- תחום: ${INDUSTRY_LABEL[a.industry] || line(a.industry)}
- גודל: ${line(a.size)} עובדים · לקוחות: ${a.model === 'b2b' ? 'עסקים (B2B)' : a.model === 'b2c' ? 'צרכנים (B2C)' : 'B2B + B2C'}
- אתר: ${line(a.website)}

## מטרה נוכחית
${line(a.goal)}

---
נבנה עם HELIX — ליווי והטמעת AI · ${SITE.url}/services/ai-consulting
`;
}

const AI_ENDPOINT = process.env.NEXT_PUBLIC_AI_RECO_ENDPOINT;

/* ── gauge ── */
function Gauge({ score }: { score: number }) {
  const r = 54, c = 2 * Math.PI * r, off = c * (1 - score / 100);
  return (
    <div className="ctx-gauge">
      <svg width="124" height="124" viewBox="0 0 124 124">
        <circle cx="62" cy="62" r={r} fill="none" stroke="var(--ctx-track,#0f1a15)" strokeWidth="11" />
        <circle cx="62" cy="62" r={r} fill="none" stroke="#10B981" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 62 62)" />
      </svg>
      <div className="ctx-gauge-val"><b>{score}</b><span>מתוך 100</span></div>
    </div>
  );
}

export default function ContextQuestionnaire({ id = 'context-tool' }: { id?: string }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [file, setFile] = useState('');
  const [copied, setCopied] = useState(false);
  const [showFile, setShowFile] = useState(false);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  const total = STEPS.length;
  const current = STEPS[step];
  const set = (k: string, v: string) => setAnswers((a) => ({ ...a, [k]: v }));
  const toggleMulti = (k: string, v: string) => setAnswers((a) => {
    const cur = a[k] ? a[k].split(',').filter(Boolean) : [];
    const nextArr = cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v];
    return { ...a, [k]: nextArr.join(',') };
  });
  const canProceed = current.fields.every((f) => !f.required || (answers[f.key] && answers[f.key].trim()));

  const d = done ? dims(answers) : null;
  const opps = done ? buildOpps(answers) : [];
  const roadmap = done ? buildRoadmap(answers) : [];

  function next() {
    if (!canProceed || advancing) return;
    const last = step >= total - 1;
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { last ? finish() : setStep((s) => s + 1); return; }
    setAdvancing(true);
    window.setTimeout(() => { setAdvancing(false); if (last) finish(); else setStep((s) => s + 1); }, 280);
  }

  function finish() {
    const dd = dims(answers);
    setFile(buildFile(answers));
    setDone(true);
    void submitContextLead({
      website: answers.website, occupation: INDUSTRY_LABEL[answers.industry] || answers.industry,
      org_name: answers.org_name, what_you_do: answers.what_you_do,
      audience: `${answers.size} עובדים · ${answers.model}`, offerings: answers.stack,
      tone: answers.pain, redlines: answers.goal,
      ai_uses: answers.ai_uses, ai_policy: answers.policy, ai_training: answers.training,
      readiness_score: dd.overall,
      name: answers.name, phone: answers.phone, email: answers.email,
    });
  }

  function download() {
    const blob = new Blob([file], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const el = document.createElement('a');
    el.href = url; el.download = `context-${(answers.org_name || 'org').replace(/[^\w֐-׿]+/g, '-')}.md`;
    document.body.appendChild(el); el.click(); el.remove(); URL.revokeObjectURL(url);
  }
  async function copyAll() { try { await navigator.clipboard.writeText(file); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ } }
  async function deepAnalyze() {
    if (!AI_ENDPOINT) { window.open(wa('שלום, מילאתי את אבחון ה-AI ורוצה ניתוח מעמיק ומותאם אישית'), '_blank'); return; }
    setAiLoading(true);
    try { const res = await fetch(AI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(answers) }); const data = await res.json(); setAiText(data.text || data.recommendations || ''); }
    catch { window.open(wa('שלום, מילאתי את אבחון ה-AI ורוצה ניתוח מעמיק'), '_blank'); }
    finally { setAiLoading(false); }
  }

  /* ── RESULT ── */
  if (done && d) {
    const DIMS = [
      { lbl: 'תשתית וכלים', v: d.infra }, { lbl: 'אוטומציה ותהליכים', v: d.autom },
      { lbl: 'דאטה ומדידה', v: d.data }, { lbl: 'שימוש AI וצוות', v: d.usage }, { lbl: 'ממשל ואבטחה', v: d.gov },
    ];
    return (
      <section className="ctx-tool" id={id}>
        <div className="container">
          <div className="ctx-report">
            <div className="ctx-rep-top">
              <div className="ctx-rep-org">
                <b>{answers.org_name || 'הארגון שלכם'}</b>
                <span>· {INDUSTRY_LABEL[answers.industry] || 'עסק'}</span>
                <span>· {answers.size} עובדים</span>
              </div>
              <div className="ctx-score-row">
                <Gauge score={d.overall} />
                <div className="ctx-score-txt">
                  <span className="ctx-badge">✓ האבחון שלכם מוכן</span>
                  <h3>רמת בשלות: <span className="ctx-tier">{tierOf(d.overall)}</span></h3>
                  <p>תוכנית פעולה מותאמת אישית — לפי הפרופיל והתשובות שלכם.</p>
                </div>
              </div>
            </div>

            <div className="ctx-rep-body">
              <div className="ctx-rep-h">מפת הבשלות שלכם</div>
              <div className="ctx-bars">
                {DIMS.map((b) => (
                  <div key={b.lbl} className="ctx-bar">
                    <span className="ctx-bar-lbl">{b.lbl}</span>
                    <div className="ctx-track"><div className="ctx-fill" style={{ width: `${b.v}%` }} /></div>
                    <span className="ctx-bar-pct">{b.v}</span>
                  </div>
                ))}
              </div>

              <div className="ctx-rep-h">3 ההזדמנויות הגדולות שלכם</div>
              {opps.map((o) => (
                <div key={o.title} className="ctx-opp">
                  <div className="ctx-opp-top">
                    <span className="ctx-opp-ico">{o.icon}</span>
                    <div><h4>{o.title}</h4><div className="ctx-opp-why">{o.why}</div></div>
                    <span className={`ctx-sev ${o.sev}`}>{o.sev === 'high' ? 'אימפקט גבוה' : 'אימפקט בינוני'}</span>
                  </div>
                  <div className="ctx-solve">
                    <div className="ctx-helix-sol">
                      <span className="ctx-sol-badge"><span className="dot" />פתרון HELIX</span>
                      <b>{o.helix.name}</b><p>{o.helix.desc}</p>
                    </div>
                    <div className="ctx-alt"><div className="ctx-alt-k">חלופה עצמאית</div><p>{o.alt}</p></div>
                  </div>
                </div>
              ))}

              <div className="ctx-rep-h">תוכנית 90 יום</div>
              <div className="ctx-road">
                {roadmap.map((p) => (
                  <div key={p.ph} className="ctx-phase">
                    <div className="ctx-ph">{p.ph}</div><h4>{p.title}</h4><p>{p.text}</p>
                    <span className="ctx-pill">{p.pill}</span>
                  </div>
                ))}
              </div>

              <div className="ctx-deep">
                <button className="btn btn-ghost" onClick={deepAnalyze} disabled={aiLoading}>
                  {aiLoading ? 'מנתח…' : '✨ רוצים ניתוח AI מעמיק ומותאם אישית?'}
                </button>
                {aiText && <pre className="ctx-file-preview" dir="rtl">{aiText}</pre>}
              </div>

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

              <div className="ctx-cta">
                <h3>רוצים שנעבור על זה יחד? אבחון עומק — חינם.</h3>
                <div className="ctx-actions">
                  <a className="btn btn-primary" href={wa('שלום, מילאתי את אבחון ה-AI ב-HELIX ורציתי לשמוע על ליווי והטמעת AI')} target="_blank" rel="noopener noreferrer">דברו איתנו בוואטסאפ</a>
                  <a className="btn btn-ghost" href="/services/ai-consulting">לדף הליווי וההטמעה</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── QUESTION ── */
  return (
    <section className="ctx-tool" id={id}>
      <div className="container">
        <div className={`ctx-card ${advancing ? 'is-advancing' : ''}`}>
          <div className="ctx-progress" aria-hidden="true">
            <div className="ctx-progress-fill" style={{ width: `${((step + 1) / total) * 100}%` }} />
          </div>

          {advancing && <div className="ctx-confirm" aria-hidden="true"><span className="ctx-confirm-mark">✓</span></div>}

          <div className="ctx-anim" key={step}>
            <span className="ctx-section-label">{current.section}</span>
            <span className="ctx-step-count">שאלה {step + 1} מתוך {total}</span>
            <h3 className="ctx-q">{current.q}</h3>
            {current.hint && <p className="ctx-hint">{current.hint}</p>}

            <form className="ctx-fields" onSubmit={(e) => { e.preventDefault(); next(); }}>
              {current.fields.map((f) => {
                if (f.type === 'segmented') {
                  return (
                    <div key={f.key} className="rd-seg-btns ctx-seg">
                      {f.options!.map((o) => (
                        <button type="button" key={o.value} className={`rd-seg-btn ${answers[f.key] === o.value ? 'on' : ''}`} onClick={() => set(f.key, o.value)}>{o.label}</button>
                      ))}
                    </div>
                  );
                }
                if (f.type === 'multi') {
                  const sel = answers[f.key] ? answers[f.key].split(',') : [];
                  return (
                    <div key={f.key} className="rd-seg-btns ctx-seg ctx-multi">
                      {f.options!.map((o) => (
                        <button type="button" key={o.value} className={`rd-seg-btn ${sel.includes(o.value) ? 'on' : ''}`} onClick={() => toggleMulti(f.key, o.value)}>{o.label}</button>
                      ))}
                    </div>
                  );
                }
                if (f.type === 'textarea') {
                  return <textarea key={f.key} className="ctx-input ctx-textarea" placeholder={f.placeholder} dir={f.dir || 'rtl'} value={answers[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} rows={3} />;
                }
                return <input key={f.key} className="ctx-input" type={f.type === 'url' ? 'text' : f.type} placeholder={f.placeholder} dir={f.dir || 'rtl'} value={answers[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />;
              })}

              <div className="ctx-nav">
                {step > 0 && <button type="button" className="btn btn-ghost" onClick={() => setStep((s) => s - 1)}>→ הקודם</button>}
                <button type="submit" className="btn btn-primary ctx-next" disabled={!canProceed || advancing}>
                  {step < total - 1 ? 'הבא ←' : 'בנו לי את התוכנית ←'}
                </button>
              </div>
            </form>

            {!current.fields.some((f) => f.required) && <button type="button" className="ctx-skip" onClick={next}>דלגו על השאלה</button>}
          </div>
        </div>
      </div>
    </section>
  );
}
