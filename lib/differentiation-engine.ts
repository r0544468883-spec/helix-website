import 'server-only';
import { buildSystemPrompt } from './prompt-kit';

// Differentiation engine for /free-tools/differentiation. Turns a short intake about a
// company into a full strategic differentiation analysis using the MBA model stack
// (Porter 5+1, strategic groups, VRINO, SWOT מנוף/בטן רכה, Blue Ocean, strategy statement).
// Domain layer = skills/helix-differentiation-analysis (composes business-strategy +
// competitive-intel + helix-brand-voice). Claude-backed (claude-sonnet-5), same convention
// as content-tool.ts. Degrades to { status: 'unconfigured' } when ANTHROPIC_API_KEY is unset.
//
// Real agent team (Chief orchestrates a loop): a MAKER runs the model stack, a CRITIC
// re-checks it against the hard rules (VRINO must expose table-stakes, no unverified
// competitor stated as fact, evidence separated from inference, no em-dash) and returns a
// corrected analysis. This mirrors the site's צ'יף + Maker + מבקר pattern.

const MODEL = 'claude-sonnet-5';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

// Every field below reaches a paid Claude prompt from an anonymous caller, so each is
// capped at the source rather than trusted from the request body.
const MAX_FIELD = 1_200;
const MAX_COMPETITOR = 120;
const cap = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export function isConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

async function callClaude(system: string, user: string, maxTokens = 2600): Promise<string | null> {
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

export type DiffInput = {
  sells?: string;      // what the company sells / builds
  customer?: string;   // who the customer is
  market?: string;     // market / industry in a sentence
  competitors?: string[]; // up to ~5 competitors the user knows
  advantages?: string; // advantages they believe they have
  dealBand?: string;   // deal size / price band (strategic-groups X axis)
};

// The structured analysis, one field per model in the stack. Rendered as cards by the UI.
export type DiffAnalysis = {
  scorecard: { score: number; label: string; dims: { label: string; value: number }[] }; // 0-100 for the gauge + bars
  industry: string;                       // the specific segment, one sentence
  porter: { forces: { name: string; note: string }[]; verdict: string }; // גיהינום/גן עדן
  groups: { axisX: string; axisY: string; cluster: string; whitespace: string; note: string };
  vrino: { asset: string; value: boolean; rare: boolean; inimitable: boolean; organized: boolean; verdict: string }[];
  passingAsset: string;                   // the single asset that passes VRINO
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[]; lever: string; softBelly: string };
  blueOcean: { eliminate: string[]; reduce: string[]; raise: string[]; create: string[]; space: string };
  statement: { objective: string; scope: string; advantage: string };
  moves: string[];                        // 2-3 concrete next moves
  assumptions: string[];                  // what was assumed / needs the user to confirm
  unverifiedCompetitors: string[];        // rivals the analysis suggested, marked לאימות
};

const OUTPUT_CONTRACT =
  '{"scorecard":{"score":0,"label":"","dims":[{"label":"","value":0}]},' +
  '"industry":"",' +
  '"porter":{"forces":[{"name":"","note":""}],"verdict":""},' +
  '"groups":{"axisX":"","axisY":"","cluster":"","whitespace":"","note":""},' +
  '"vrino":[{"asset":"","value":true,"rare":false,"inimitable":false,"organized":true,"verdict":""}],' +
  '"passingAsset":"",' +
  '"swot":{"strengths":["",""],"weaknesses":["",""],"opportunities":["",""],"threats":["",""],"lever":"","softBelly":""},' +
  '"blueOcean":{"eliminate":[""],"reduce":[""],"raise":[""],"create":[""],"space":""},' +
  '"statement":{"objective":"","scope":"","advantage":""},' +
  '"moves":["",""],"assumptions":[""],"unverifiedCompetitors":[""]}';

// ── MAKER: runs the full model stack ────────────────────────────────────────
const MAKER_SYSTEM = buildSystemPrompt({
  role: 'אתה אסטרטג עסקי ישראלי ברמת MBA. אתה מריץ ניתוח בידול מלא לחברה לפי מחסנית המודלים של הקורס, ואתה כן עם הלקוח, לא מחמיא.',
  inputs: [
    'מה החברה מוכרת או בונה',
    'מי הלקוח',
    'הענף או השוק במשפט',
    'עד חמישה מתחרים שהלקוח מכיר',
    'היתרונות שהחברה חושבת שיש לה',
    'טווח גודל העסקה או המחיר',
  ],
  workflow: [
    'הגדר את הענף הספציפי במשפט אחד. לא "AI", אלא הסגמנט המדויק',
    'הרץ פורטר 5+1 (חסמי כניסה, יריבות, תחליפים, כוח קונים, כוח ספקים, משלימים) ותן ורדיקט: האם זה ענף של מלחמת מחירים (גיהינום אסטרטגי) או מוגן (גן עדן אסטרטגי)',
    'בנה מפת קבוצות אסטרטגיה: בחר שני צירים שבאמת מפרידים בין השחקנים (למשל גודל עסקה מול עומק טכני), מקם את החברה והמתחרים, ושם את האשכול הצפוף ואת המרחב הפנוי',
    'הרץ VRINO על כל יתרון שהחברה טוענת לו. המטרה לחשוף אילו יתרונות הם בעצם תנאי סף של הקטגוריה (נכשלים בנדיר או בקשה-לחיקוי) ואיזה נכס אחד באמת עובר. ציין מפורשות את הנכס היחיד שעובר',
    'בנה SWOT ואז שלב: מנוף = חוזקה שפוגשת הזדמנות, בטן רכה = חולשה שפוגשת איום. השילוב הוא התוצר, לא רשימה שטוחה',
    'אוקיינוס כחול לפי Four Actions: לבטל, להפחית, להעלות, ליצור, ושם את המרחב הפנוי',
    'נסח משפט אסטרטגי אחד: מטרה, סקופ, יתרון (היתרון בא מה-VRINO, מהנכס שעבר)',
    'סיים ב-2-3 מהלכים קונקרטיים, כל אחד פעולה שמישהו עושה, לא חזון',
    'תן scorecard: ציון בהירות-בידול כולל מ-0 עד 100 (כמה היתרון שלהם באמת מובחן ולא-מחיק, ציון נמוך אם הכל תנאי סף), label קצר לציון, ו-4 מימדים עם ערך 0 עד 100: חוזק הנכס שעובר VRINO, מיצוב מול האשכול הצפוף, גודל המרחב הפנוי, ובהירות המסר',
  ],
  constraints: [
    'מבחן הכנות של VRINO הוא הלב. אל תחמיא. אם "בידול" הוא בעצם תנאי סף של הקטגוריה, אמור זאת וסמן אותו כנכשל',
    'אל תמציא מתחרה, סלוגן, מספר או לקוח. במתחרים שהלקוח נתן, השתמש כפי שנתן. מתחרה שאתה מציע בעצמך נכנס ל-unverifiedCompetitors ומסומן לאימות, לא נטען כעובדה',
    'הפרד בין מה שהלקוח אמר, הסקה סבירה, ולא ידוע. כל הנחה נכנסת ל-assumptions',
    'עברית ישראלית טבעית בלבד. בלי מקף ארוך. בלי מילים שהן קלישאות של AI. דוגרי וקונקרטי',
    'החזר JSON תקין בלבד, בלי טקסט לפני או אחרי',
  ],
  outputContract: OUTPUT_CONTRACT,
});

// ── CRITIC: reviews and corrects the maker output ───────────────────────────
const CRITIC_SYSTEM = buildSystemPrompt({
  role: 'אתה מבקר אסטרטגי. אתה מקבל ניתוח בידול שנוצר, ובודק אותו נגד הכללים הקשיחים, מתקן במקום, ומחזיר גרסה מתוקנת. אתה קפדן ולא מרחם.',
  inputs: ['הקלט המקורי של הלקוח', 'הניתוח שה-Maker הפיק (JSON)'],
  workflow: [
    'ודא שה-VRINO באמת חשף תנאי סף. אם יתרון גנרי (צוות סניורי, רקע צבאי, "לא צ׳אטבוט") סומן כעובר, הפל אותו',
    'ודא שאף מתחרה שלא אומת אינו נטען כעובדה. העבר כל מתחרה מוצע ל-unverifiedCompetitors',
    'ודא שהפייפליין וההנחות מסומנים, שהראיה מופרדת מההסקה',
    'ודא שאין מקף ארוך ואין מילות קלישאה של AI, ושהעברית דוגרי',
    'תקן במקום כל בעיה, ושמור על אותו מבנה JSON בדיוק',
  ],
  constraints: [
    'החזר את אותו סכימת JSON בדיוק, מתוקן',
    'אל תמציא מידע חדש. רק חדד, הפל טענות לא מבוססות, וסמן הנחות',
    'בלי מקף ארוך. עברית טבעית',
    'החזר JSON תקין בלבד',
  ],
  outputContract: OUTPUT_CONTRACT,
});

function buildUser(input: DiffInput): string {
  const competitors = (input.competitors ?? [])
    .map((c) => cap(c, MAX_COMPETITOR))
    .filter(Boolean)
    .slice(0, 5);
  return [
    `מה החברה מוכרת/בונה: ${cap(input.sells, MAX_FIELD) || '(לא צוין)'}`,
    `מי הלקוח: ${cap(input.customer, MAX_FIELD) || '(לא צוין)'}`,
    `הענף/השוק: ${cap(input.market, MAX_FIELD) || '(לא צוין)'}`,
    `מתחרים שהלקוח מכיר: ${competitors.length ? competitors.join(', ') : '(לא צוינו)'}`,
    `היתרונות שהחברה חושבת שיש לה: ${cap(input.advantages, MAX_FIELD) || '(לא צוין)'}`,
    `טווח גודל עסקה/מחיר: ${cap(input.dealBand, MAX_FIELD) || '(לא צוין)'}`,
  ].join('\n');
}

export async function runDifferentiation(input: DiffInput): Promise<{ status: ToolStatus; analysis?: DiffAnalysis }> {
  const hasAny = [input.sells, input.customer, input.market, input.advantages].some((v) => cap(v, MAX_FIELD).length > 0);
  if (!hasAny) return { status: 'bad_request' };
  if (!isConfigured()) return { status: 'unconfigured' };

  const user = buildUser(input);

  // Maker pass
  const made = parseJson<DiffAnalysis>(await callClaude(MAKER_SYSTEM, user, 2600));
  if (!made) return { status: 'error' };

  // Critic pass (Chief runs the loop once; the Maker output is fed back for correction)
  const critiqued = parseJson<DiffAnalysis>(
    await callClaude(CRITIC_SYSTEM, `${user}\n\n--- הניתוח שנוצר ---\n${JSON.stringify(made)}`, 2600),
  );

  // If the critic pass fails to return valid JSON, fall back to the maker output rather than erroring.
  return { status: 'ok', analysis: critiqued ?? made };
}
