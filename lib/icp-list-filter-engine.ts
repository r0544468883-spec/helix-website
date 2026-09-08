import 'server-only';
import { buildSystemPrompt } from './prompt-kit';

// ICP list-filter engine for /free-tools/icp-list-filter. Takes an ICP definition,
// optional disqualifiers, and a pasted list of leads (one per line), and sorts every
// lead into match / needs-review / no-match with a one-line reason per row. Claude-backed
// (claude-sonnet-5), same convention as differentiation-engine.ts. Degrades to
// { status: 'unconfigured' } when ANTHROPIC_API_KEY is unset.
//
// Real agent team (Chief orchestrates a loop): a MAKER classifies every row, a CRITIC
// re-checks it against the hard rules (no lead silently dropped, the caller's own company
// and competitors flagged not counted as matches, reasons concrete, Hebrew dugri, no
// em-dash) and returns a corrected analysis. Mirrors the site's צ'יף + Maker + מבקר pattern.

const MODEL = 'claude-sonnet-5';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

// Every field below reaches a paid Claude prompt from an anonymous caller, so each is
// capped at the source rather than trusted from the request body.
const MAX_FIELD = 1_200;
const MAX_LIST = 6_000;
const MAX_ROWS = 40;
const cap = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export function isConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

async function callClaude(system: string, user: string, maxTokens = 3200): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: AbortSignal.timeout(90_000),
      headers: {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] }),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { content?: { text?: string }[] };
    return (json.content?.[0]?.text ?? '').trim() || null;
  } catch {
    return null;
  }
}

function parseJson<T>(text: string | null): T | null {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export type ToolStatus = 'ok' | 'unconfigured' | 'bad_request' | 'error';

export type ListInput = {
  icp?: string;           // the ideal customer profile definition
  disqualifiers?: string; // who to reject immediately (optional)
  list?: string;          // raw pasted rows, one lead per line
};

export type Verdict = 'match' | 'review' | 'nomatch';

// The structured analysis. Rendered as a teaser + downloadable table by the UI.
export type ListAnalysis = {
  scorecard: { score: number; label: string; dims: { label: string; value: number }[] }; // 0-100 gauge + bars
  summary: { total: number; match: number; review: number; nomatch: number };
  rows: { lead: string; verdict: Verdict; reason: string }[];
  topPicks: string[];      // the hottest leads to start with
  assumptions: string[];   // what was assumed / needs the user to confirm
};

const OUTPUT_CONTRACT =
  '{"scorecard":{"score":0,"label":"","dims":[{"label":"אחוז התאמה","value":0},{"label":"איכות הרשימה","value":0},{"label":"ריכוז ICP","value":0},{"label":"כיסוי פרסונות","value":0}]},' +
  '"summary":{"total":0,"match":0,"review":0,"nomatch":0},' +
  '"rows":[{"lead":"","verdict":"match","reason":""}],' +
  '"topPicks":[""],"assumptions":[""]}';

// ── MAKER: classifies every pasted lead ─────────────────────────────────────
const MAKER_SYSTEM = buildSystemPrompt({
  role: 'אתה אנליסט מכירות ישראלי. אתה מקבל הגדרת ICP ורשימת לידים, ומסווג כל ליד להתאמה, בדיקה נוספת, או פסילה, עם סיבה קצרה לכל שורה. אתה כן ומדויק, לא מנפח.',
  inputs: [
    'ה-ICP: מי הלקוח האידיאלי (תחום, גודל, תפקיד, כאב)',
    'פוסלים: מי לפסול מיד (לא חובה)',
    'הרשימה: ליד אחד בכל שורה, לרוב שם, חברה, תפקיד',
  ],
  workflow: [
    'קרא את ה-ICP והבן מה הופך ליד למתאים: תחום, גודל חברה, תפקיד וכאב',
    'עבור על כל שורה ברשימה בדיוק כפי שנתקבלה. אל תשמיט אף שורה. כל שורת קלט חייבת להופיע ב-rows',
    'סווג כל ליד: match אם הוא עונה על ה-ICP, review אם חסר מידע או יש ספק, nomatch אם הוא לא מתאים או נופל על פוסל',
    'תן סיבה אחת קונקרטית לכל שורה, למה סווג ככה, בהתבסס על מה שכתוב בשורה מול ה-ICP',
    'סמן כ-review כל ליד שנראה כמו החברה של הפונה עצמו או מתחרה. אל תספור אותו כ-match',
    'ספור את summary: total הוא מספר השורות, ו-match+review+nomatch מסתכמים ל-total',
    'בחר topPicks: הלידים הכי חמים להתחיל מהם, שמות בלבד, עד חמישה',
    'תן scorecard: score מ-0 עד 100 שמשקלל בעיקר את יחס ההתאמה (match חלקי total), label קצר, ו-4 מימדים 0 עד 100: אחוז התאמה, איכות הרשימה, ריכוז ICP, כיסוי פרסונות',
  ],
  constraints: [
    'אל תשמיט אף ליד. כל שורת קלט מופיעה ב-rows, גם אם היא נפסלת',
    'אל תמציא לידים, חברות או פרטים שלא נמצאים ברשימה',
    'החברה של הפונה עצמו ומתחרים מסומנים review, לא נספרים כ-match',
    'סיבות קונקרטיות וקצרות, לא כלליות. עברית ישראלית טבעית ודוגרי. בלי מקף ארוך. בלי קלישאות של AI',
    'כל הנחה שהנחת נכנסת ל-assumptions',
    'החזר JSON תקין בלבד, בלי טקסט לפני או אחרי',
  ],
  outputContract: OUTPUT_CONTRACT,
});

// ── CRITIC: reviews and corrects the maker output ───────────────────────────
const CRITIC_SYSTEM = buildSystemPrompt({
  role: 'אתה מבקר מכירות. אתה מקבל סינון רשימה שנוצר, ובודק אותו נגד הכללים הקשיחים, מתקן במקום, ומחזיר גרסה מתוקנת. אתה קפדן ולא מרחם.',
  inputs: ['הקלט המקורי של הלקוח (ICP, פוסלים, הרשימה)', 'הסינון שה-Maker הפיק (JSON)'],
  workflow: [
    'ודא שכל שורת קלט מופיעה ב-rows. אם ליד הושמט בשקט, הוסף אותו',
    'ודא שהחברה של הפונה עצמו ומתחרים סומנו review ולא נספרו כ-match',
    'ודא שכל סיבה קונקרטית ונשענת על מה שכתוב בשורה מול ה-ICP, לא כללית',
    'ודא ש-summary נכון: total שווה למספר השורות, ו-match+review+nomatch מסתכמים ל-total',
    'ודא שאין מקף ארוך ואין מילות קלישאה של AI, ושהעברית דוגרי',
    'תקן במקום כל בעיה, ושמור על אותו מבנה JSON בדיוק',
  ],
  constraints: [
    'החזר את אותו סכימת JSON בדיוק, מתוקן',
    'אל תמציא לידים חדשים. רק חדד, תקן סיווגים שגויים, וסמן הנחות',
    'בלי מקף ארוך. עברית טבעית',
    'החזר JSON תקין בלבד',
  ],
  outputContract: OUTPUT_CONTRACT,
});

function parseRows(list: string): string[] {
  return cap(list, MAX_LIST)
    .split('\n')
    .map((r) => r.trim())
    .filter(Boolean)
    .slice(0, MAX_ROWS);
}

function buildUser(input: ListInput): string {
  const rows = parseRows(input.list ?? '');
  return [
    `ה-ICP: ${cap(input.icp, MAX_FIELD) || '(לא צוין)'}`,
    `פוסלים: ${cap(input.disqualifiers, MAX_FIELD) || '(לא צוינו)'}`,
    `הרשימה (${rows.length} שורות):`,
    ...rows.map((r, i) => `${i + 1}. ${r}`),
  ].join('\n');
}

export async function runIcpListFilter(input: ListInput): Promise<{ status: ToolStatus; analysis?: ListAnalysis }> {
  const hasIcp = cap(input.icp, MAX_FIELD).length > 0;
  const rows = parseRows(input.list ?? '');
  if (!hasIcp || rows.length === 0) return { status: 'bad_request' };
  if (!isConfigured()) return { status: 'unconfigured' };

  const user = buildUser(input);

  // Maker pass
  const made = parseJson<ListAnalysis>(await callClaude(MAKER_SYSTEM, user, 3200));
  if (!made) return { status: 'error' };

  // Critic pass (Chief runs the loop once; the Maker output is fed back for correction)
  const critiqued = parseJson<ListAnalysis>(
    await callClaude(CRITIC_SYSTEM, `${user}\n\n--- הסינון שנוצר ---\n${JSON.stringify(made)}`, 3200),
  );

  // If the critic pass fails to return valid JSON, fall back to the maker output rather than erroring.
  return { status: 'ok', analysis: critiqued ?? made };
}
