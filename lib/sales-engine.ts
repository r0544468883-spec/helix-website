import 'server-only';
import { buildSystemPrompt } from './prompt-kit';

// Sales-playbook engine for /free-tools/sales. Turns a short intake about a company into a
// full B2B sales playbook (ICP, decision-map, funnel+triggers, ANUM, pipeline math, channels
// with §30א, rapport-first LinkedIn sequence, email, objections) plus a tailored phone-call
// script. Domain layer = skills/helix-sales-playbook (composes predictable-revenue +
// helix-call-script + helix-brand-voice). Claude-backed (claude-sonnet-5), same convention as
// content-tool.ts / differentiation-engine.ts. Real team: MAKER builds, CRITIC re-checks the
// hard rules (pipeline labeled as assumption, §30א honest, LinkedIn rapport-first not pitch,
// no unverified competitor as fact, no em-dash).

const MODEL = 'claude-sonnet-5';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

const MAX_FIELD = 1_200;
const cap = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export function isConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

async function callClaude(system: string, user: string, maxTokens = 2800): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: AbortSignal.timeout(90_000),
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
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

export type SalesInput = {
  sells?: string;     // what the company sells
  customer?: string;  // who the customer is (ICP hint)
  dealBand?: string;  // typical deal size / price band
  channels?: string;  // current channels, if any
  proof?: string;     // one proof / result they can cite
};

export type SalesPlaybook = {
  scorecard: { score: number; label: string; dims: { label: string; value: number }[] }; // 0-100 for the gauge + bars
  icp: { profile: string; pain: string; whyNow: string };
  decisionMap: { decides: string; influences: string; blocks: string; champion: string };
  funnel: { stage: string; whatHappens: string; trigger: string }[];
  anum: { authority: string; need: string; urgency: string; money: string };
  spin: { situation: string[]; problem: string[]; implication: string[]; needPayoff: string[] };
  anumQuestions: { authority: string; need: string; urgency: string; money: string };
  pipeline: { note: string; steps: { from: string; to: string; rate: string }[] };
  channels: { channel: string; note: string }[];
  spamNote: string;                      // §30א honest caveat
  linkedinSequence: { touch: string; message: string }[]; // rapport-first
  email: { subject: string; body: string };
  objections: { objection: string; response: string }[];
  callScript: { line: string; purpose: string }[];        // phone script, spoken Hebrew
  assumptions: string[];
  unverifiedCompetitors: string[];
};

const OUTPUT_CONTRACT =
  '{"scorecard":{"score":0,"label":"","dims":[{"label":"","value":0}]},' +
  '"icp":{"profile":"","pain":"","whyNow":""},' +
  '"decisionMap":{"decides":"","influences":"","blocks":"","champion":""},' +
  '"funnel":[{"stage":"","whatHappens":"","trigger":""}],' +
  '"anum":{"authority":"","need":"","urgency":"","money":""},' +
  '"spin":{"situation":["",""],"problem":["",""],"implication":["",""],"needPayoff":["",""]},' +
  '"anumQuestions":{"authority":"","need":"","urgency":"","money":""},' +
  '"pipeline":{"note":"","steps":[{"from":"","to":"","rate":""}]},' +
  '"channels":[{"channel":"","note":""}],"spamNote":"",' +
  '"linkedinSequence":[{"touch":"","message":""}],' +
  '"email":{"subject":"","body":""},' +
  '"objections":[{"objection":"","response":""}],' +
  '"callScript":[{"line":"","purpose":""}],' +
  '"assumptions":[""],"unverifiedCompetitors":[""]}';

const MAKER_SYSTEM = buildSystemPrompt({
  role: 'אתה מנהל מכירות B2B ישראלי מנוסה. אתה בונה פלייבוק מכירות מלא לחברה, מתודולוגיה אמיתית ולא סיסמאות, כולל תסריט שיחה טלפונית מדובר.',
  inputs: ['מה החברה מוכרת', 'מי הלקוח', 'טווח גודל עסקה', 'ערוצים קיימים אם יש', 'הוכחה או תוצאה אחת'],
  workflow: [
    'הגדר ICP מדויק והכאב המרכזי שגורם לו לקנות עכשיו',
    'בנה מפת מקבלי החלטות: מי מחליט, מי משפיע, מי חוסם, ומי השמפיון הפנימי',
    'בנה משפך מלא עם טריגר קונקרטי לכל מעבר: מודעות, פנייה ראשונה, גילוי, הצעה או פיילוט, סגירה והרחבה',
    'הגדר שער ANUM: סמכות, צורך, דחיפות, תקציב',
    'בנה בנק שאלות לשיחת גילוי לפי SPIN, מותאם לעסק: שאלות מצב (מעט, 2 עד 3), שאלות בעיה, שאלות השלכה (החלק החשוב, הופכות את הכאב ליקר בשקלים ובזמן), ושאלות תועלת שגורמות ללקוח למכור לעצמו',
    'בנוסף תן ארבע שאלות ANUM טבעיות לשאול בשיחה, אחת לכל אות, מנוסחות כמו בן אדם ולא כמו שאלון',
    'מתמטיקת פייפליין: אחורה מיעד, פניות עד עסקאות. סמן את יחסי ההמרה כהנחה לאימות על 20 הפניות הראשונות, לא כעובדה',
    'תוכנית ערוצים עם הערת §30א כנה: החוק חל על וואטסאפ, סמס וגם מייל, חשיפה עד 1000 שקל להודעה, אין פטור גורף ל-B2B. וואטסאפ קר הוא הסיכון הגבוה. לינקדאין הכי נמוך בפועל אך לא פטור',
    'פנייה ראשונה בלינקדאין כרצף rapport-first: חימום, בקשת חיבור מותאמת בלי הצעה, הודעת ערך, ורק אז בקשת הפניה. בלי פיץ׳ בהודעה הראשונה. פלוס גרסת מייל בשיטת הרפרל',
    'טיפול ב-3 עד 4 התנגדויות צפויות של ה-ICP',
    'תסריט שיחה טלפונית מדובר, שורה אחר שורה: פתיח ורשות, רלוונטיות, הוכחה אחת, שאלות גילוי עם ANUM מובנה, וצעד הבא קונקרטי',
    'תן scorecard: ציון מוכנות-מכירה כולל מ-0 עד 100 (כמה מנוע המכירות שלהם מוכן ובנוי היום), label קצר, ו-4 מימדים עם ערך 0 עד 100: בהירות ה-ICP, בשלות המשפך, התאמת הערוצים, וחוזק ההוכחה החברתית',
  ],
  constraints: [
    'מספרי הפייפליין הם הנחה מסומנת, לא נתון מאומת',
    'ב-SPIN, מעט שאלות מצב והרבה שאלות השלכה ותועלת, לפי המחקר של Rackham. הכאב חייב להיות מכומת',
    'לינקדאין תמיד rapport-first, לא pitch-first',
    'אל תמליץ על וואטסאפ קר כערוץ בטוח. מייל גם מכוסה. לינקדאין הכי נמוך אך לא פטור',
    'אל תמציא מתחרה, לקוח או מספר. מתחרה שאתה מציע נכנס ל-unverifiedCompetitors ומסומן לאימות',
    'עברית ישראלית מדוברת בהודעות ובתסריט. בלי מקף ארוך. בלי קלישאות של AI. תמכור תוצאה, לא רשימת פיצ׳רים',
    'החזר JSON תקין בלבד, בלי טקסט לפני או אחרי',
  ],
  outputContract: OUTPUT_CONTRACT,
});

const CRITIC_SYSTEM = buildSystemPrompt({
  role: 'אתה מבקר מכירות. אתה מקבל פלייבוק שנוצר ובודק אותו נגד הכללים הקשיחים, מתקן במקום, ומחזיר גרסה מתוקנת. קפדן.',
  inputs: ['הקלט המקורי של הלקוח', 'הפלייבוק שה-Maker הפיק (JSON)'],
  workflow: [
    'ודא שמספרי הפייפליין מסומנים כהנחה ולא כעובדה',
    'ודא שרצף הלינקדאין הוא rapport-first, ושאין פיץ׳ בהודעה הראשונה',
    'ודא שהערת §30א כנה, שאין המלצה על וואטסאפ קר כבטוח',
    'ודא שאף מתחרה לא מאומת אינו נטען כעובדה',
    'ודא שאין מקף ארוך, שהעברית מדוברת וטבעית, ושהתסריט נשמע כמו בן אדם',
    'תקן במקום כל בעיה ושמור על אותו מבנה JSON בדיוק',
  ],
  constraints: ['החזר את אותו סכימת JSON בדיוק, מתוקן', 'אל תמציא מידע חדש', 'בלי מקף ארוך. עברית מדוברת', 'החזר JSON תקין בלבד'],
  outputContract: OUTPUT_CONTRACT,
});

function buildUser(input: SalesInput): string {
  return [
    `מה החברה מוכרת: ${cap(input.sells, MAX_FIELD) || '(לא צוין)'}`,
    `מי הלקוח: ${cap(input.customer, MAX_FIELD) || '(לא צוין)'}`,
    `טווח גודל עסקה: ${cap(input.dealBand, MAX_FIELD) || '(לא צוין)'}`,
    `ערוצים קיימים: ${cap(input.channels, MAX_FIELD) || '(לא צוינו)'}`,
    `הוכחה או תוצאה שאפשר לצטט: ${cap(input.proof, MAX_FIELD) || '(לא צוין)'}`,
  ].join('\n');
}

export async function runSalesPlaybook(input: SalesInput): Promise<{ status: ToolStatus; playbook?: SalesPlaybook }> {
  const hasAny = [input.sells, input.customer].some((v) => cap(v, MAX_FIELD).length > 0);
  if (!hasAny) return { status: 'bad_request' };
  if (!isConfigured()) return { status: 'unconfigured' };

  const user = buildUser(input);
  const made = parseJson<SalesPlaybook>(await callClaude(MAKER_SYSTEM, user, 2800));
  if (!made) return { status: 'error' };

  const critiqued = parseJson<SalesPlaybook>(
    await callClaude(CRITIC_SYSTEM, `${user}\n\n--- הפלייבוק שנוצר ---\n${JSON.stringify(made)}`, 2800),
  );

  return { status: 'ok', playbook: critiqued ?? made };
}
