import 'server-only';
import { buildSystemPrompt } from './prompt-kit';

// GTM Intelligence engine for /free-tools/gtm-intelligence. Merges three GTM jobs into one
// intake: (1) ICP + TAM ("who to sell to"), (2) a competitor battlecard, (3) an account
// research brief ("research a target"). Turns a short intake into a full GTM intelligence
// report. Domain layer = shared GTM skills (icp-builder + tam-builder + account-research-brief
// + battlecard, composed with helix-brand-voice). Claude-backed (claude-sonnet-5), same
// convention as differentiation-engine.ts. Degrades to { status: 'unconfigured' } when
// ANTHROPIC_API_KEY is unset.
//
// Real agent team (Chief orchestrates a loop): a MAKER builds the ICP, the TAM revenue model
// (from the deal band), and, when a target is named, the account brief + battlecard. A CRITIC
// re-checks it against the hard rules (no invented competitor / number / client stated as
// fact, evidence separated from inference, no em-dash) and returns a corrected report. This
// mirrors the site's צ'יף + Maker + מבקר pattern.

const MODEL = 'claude-sonnet-5';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

// Every field below reaches a paid Claude prompt from an anonymous caller, so each is
// capped at the source rather than trusted from the request body.
const MAX_FIELD = 1_200;
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

export type GtmInput = {
  sells?: string;    // what the company sells / builds
  customer?: string; // who the customer is today
  market?: string;   // market / segment in a sentence
  dealBand?: string; // typical deal size / price band (drives the TAM revenue model)
  target?: string;   // a specific company or competitor to research (optional)
};

// The structured report. Rendered as cards by the UI. target + battlecard are null when the
// user did not name a target to research.
export type GtmAnalysis = {
  scorecard: { score: number; label: string; dims: { label: string; value: number }[] }; // 0-100 for the gauge + bars
  icp: {
    profile: string;                    // the ideal-customer profile in one sentence
    firmographics: string[];            // size, sector, geo, stage, tech, budget signals
    personas: { title: string; pain: string }[]; // buying-committee roles + their pain
    disqualifiers: string[];            // who is NOT a fit, so reps stop wasting time
  };
  tam: {
    definition: string;                 // how the market was scoped, one sentence
    companies: string;                  // rough count of companies that fit the ICP
    sam: string;                        // serviceable available market, in ₪ (from the deal band)
    som: string;                        // realistic obtainable market, in ₪
    assumptions: string[];              // the math assumptions behind the numbers
  };
  target: {
    name: string;                       // the company/competitor researched
    brief: string;                      // a short account brief
    signals: string[];                  // buying / timing signals to look for
    decisionMakers: string[];           // likely roles to reach, not invented names
  } | null;
  battlecard: {
    competitor: string;                 // the rival named as target
    strengths: string[];                // where they are strong
    weaknesses: string[];               // where they are weak / exposed
    positioning: string;                // how to position against them in one line
    objectionHandling: { q: string; a: string }[]; // "they say X" -> "you say Y"
  } | null;
  moves: string[];                      // 2-3 concrete next moves
  assumptions: string[];                // what was assumed / needs the user to confirm
  unverifiedFacts: string[];            // any competitor / number / client the model raised, marked לאימות
};

const OUTPUT_CONTRACT =
  '{"scorecard":{"score":0,"label":"","dims":[{"label":"","value":0}]},' +
  '"icp":{"profile":"","firmographics":[""],"personas":[{"title":"","pain":""}],"disqualifiers":[""]},' +
  '"tam":{"definition":"","companies":"","sam":"","som":"","assumptions":[""]},' +
  '"target":{"name":"","brief":"","signals":[""],"decisionMakers":[""]},' +
  '"battlecard":{"competitor":"","strengths":[""],"weaknesses":[""],"positioning":"","objectionHandling":[{"q":"","a":""}]},' +
  '"moves":["",""],"assumptions":[""],"unverifiedFacts":[""]}';

// ── MAKER: builds ICP + TAM + (if target given) account brief + battlecard ───
const MAKER_SYSTEM = buildSystemPrompt({
  role: 'אתה אנליסט GTM ישראלי ברמת בכיר. אתה בונה מודיעין מכירות מלא לחברה: פרופיל לקוח אידיאלי, מודל שוק והכנסה, וכשנתון יעד ספציפי, תדריך חשבון ו-battlecard מולו. אתה כן עם הלקוח, לא מחמיא, ולא ממציא.',
  inputs: [
    'מה החברה מוכרת או בונה',
    'מי הלקוח היום',
    'הענף או השוק במשפט',
    'טווח גודל העסקה או המחיר',
    'יעד לתחקיר: חברה או מתחרה ספציפי (יכול להיות ריק)',
  ],
  workflow: [
    'בנה ICP חד: פרופיל לקוח אידיאלי במשפט אחד, פירמוגרפיה (גודל, סקטור, גאוגרפיה, שלב, תקציב, סימני טכנולוגיה), פרסונות של ועדת הקנייה עם הכאב של כל אחת, ורשימת פוסלים, מי לא מתאים כדי שלא יבזבזו זמן',
    'בנה מודל TAM: הגדר איך תוחם השוק במשפט, אמוד גס את מספר החברות שמתאימות ל-ICP, וגזור SAM ו-SOM בשקלים מתוך טווח גודל העסקה. הצג את הנחות החישוב מפורשות',
    'אם ניתן יעד לתחקיר: בנה תדריך חשבון קצר עליו, סימני קנייה ותזמון לחפש, ותפקידים סבירים להגיע אליהם (תפקידים, לא שמות מומצאים). אם היעד הוא מתחרה, בנה גם battlecard: חוזקות, חולשות, שורת מיצוב מולו, וטיפול בהתנגדויות בפורמט "הם אומרים X, אתם אומרים Y"',
    'אם לא ניתן יעד: החזר target ו-battlecard כ-null, ואל תמציא יעד',
    'סיים ב-2-3 מהלכים קונקרטיים, כל אחד פעולה שמישהו עושה, לא חזון',
    'תן scorecard: ציון מודיעין GTM כולל מ-0 עד 100, label קצר, ו-4 מימדים עם ערך 0 עד 100: התאמת ICP, בשלות השוק (TAM), חוזק היעד, ובהירות הפנייה. אם לא ניתן יעד, חוזק היעד נמוך ומשקף שאין יעד לתחקיר',
  ],
  constraints: [
    'אל תמציא מתחרה, מספר, סלוגן, לקוח או שם אדם. שם יעד שהלקוח נתן, השתמש כפי שנתן. כל מתחרה, מספר או לקוח שאתה מעלה מעצמך נכנס ל-unverifiedFacts ומסומן לאימות, לא נטען כעובדה',
    'הפרד בין מה שהלקוח אמר, הסקה סבירה, ולא ידוע. כל הנחה נכנסת ל-assumptions. מספרי TAM הם הערכות מסומנות, לא עובדות',
    'עברית ישראלית טבעית בלבד. בלי מקף ארוך. בלי מילים שהן קלישאות של AI. דוגרי וקונקרטי',
    'החזר JSON תקין בלבד, בלי טקסט לפני או אחרי',
  ],
  outputContract: OUTPUT_CONTRACT,
});

// ── CRITIC: reviews and corrects the maker output ───────────────────────────
const CRITIC_SYSTEM = buildSystemPrompt({
  role: 'אתה מבקר מודיעין GTM. אתה מקבל דוח מודיעין שנוצר, ובודק אותו נגד הכללים הקשיחים, מתקן במקום, ומחזיר גרסה מתוקנת. אתה קפדן ולא מרחם.',
  inputs: ['הקלט המקורי של הלקוח', 'הדוח שה-Maker הפיק (JSON)'],
  workflow: [
    'ודא שאף מתחרה, מספר או לקוח שהמנוע העלה מעצמו אינו נטען כעובדה. העבר כל פריט כזה ל-unverifiedFacts',
    'ודא שמספרי ה-TAM (SAM/SOM/מספר חברות) מסומנים כהערכות עם הנחות, ושהראיה מופרדת מההסקה',
    'ודא שאם לא ניתן יעד לתחקיר, target ו-battlecard הם null ולא הומצא יעד. אם ניתן יעד, ודא שלא הומצאו שמות אנשים',
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

function buildUser(input: GtmInput): string {
  return [
    `מה החברה מוכרת/בונה: ${cap(input.sells, MAX_FIELD) || '(לא צוין)'}`,
    `מי הלקוח היום: ${cap(input.customer, MAX_FIELD) || '(לא צוין)'}`,
    `הענף/השוק: ${cap(input.market, MAX_FIELD) || '(לא צוין)'}`,
    `טווח גודל עסקה/מחיר: ${cap(input.dealBand, MAX_FIELD) || '(לא צוין)'}`,
    `יעד לתחקיר: ${cap(input.target, MAX_FIELD) || '(לא צוין)'}`,
  ].join('\n');
}

export async function runGtmIntelligence(input: GtmInput): Promise<{ status: ToolStatus; analysis?: GtmAnalysis }> {
  const hasCore = [input.sells, input.customer].some((v) => cap(v, MAX_FIELD).length > 0);
  if (!hasCore) return { status: 'bad_request' };
  if (!isConfigured()) return { status: 'unconfigured' };

  const user = buildUser(input);

  // Maker pass
  const made = parseJson<GtmAnalysis>(await callClaude(MAKER_SYSTEM, user, 2600));
  if (!made) return { status: 'error' };

  // Critic pass (Chief runs the loop once; the Maker output is fed back for correction)
  const critiqued = parseJson<GtmAnalysis>(
    await callClaude(CRITIC_SYSTEM, `${user}\n\n--- הדוח שנוצר ---\n${JSON.stringify(made)}`, 2600),
  );

  // If the critic pass fails to return valid JSON, fall back to the maker output rather than erroring.
  return { status: 'ok', analysis: critiqued ?? made };
}
