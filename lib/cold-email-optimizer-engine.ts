import 'server-only';
import { buildSystemPrompt } from './prompt-kit';

// Cold-email optimizer engine for /free-tools/cold-email-optimizer. Merges the Cold-Email
// Grader and the Subject-line optimizer into one pass: grade a pasted cold email on five
// dimensions (subject, opener, relevance/personalization, CTA, length/readability), give
// concrete fixes, a full Hebrew rewrite, stronger subject lines, and deliverability/spam
// red flags. Claude-backed (claude-sonnet-5), same maker+critic convention as
// differentiation-engine.ts. Degrades to { status: 'unconfigured' } when ANTHROPIC_API_KEY
// is unset.
//
// Real agent team (Chief orchestrates a loop): a MAKER grades and rewrites, a CRITIC
// re-checks it against the hard rules (fixes must be concrete not generic, the rewrite must
// be dugri with no em-dash and no AI cliches, subject lines specific, no invented facts
// about the recipient) and returns a corrected analysis. Mirrors the site's צ'יף + Maker +
// מבקר pattern.

const MODEL = 'claude-sonnet-5';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

// Every field below reaches a paid Claude prompt from an anonymous caller, so each is
// capped at the source rather than trusted from the request body.
const MAX_EMAIL = 6_000;
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

export type EmailInput = {
  email?: string;     // the pasted cold email (subject + body)
  audience?: string;  // who this email was sent to
  goal?: string;      // the goal / offer of the email
};

// The structured analysis. Rendered as a teaser (scorecard) + downloadable full report.
export type EmailAnalysis = {
  scorecard: { score: number; label: string; dims: { label: string; value: number }[] }; // 0-100 for the gauge + bars
  diagnosis: { subject: string; opener: string; relevance: string; cta: string; length: string }; // per-dimension diagnosis
  fixes: string[];         // concrete, specific fixes
  rewrite: string;         // a full rewritten cold email in natural Israeli Hebrew
  subjectLines: string[];  // 6-8 stronger subject lines
  redFlags: string[];      // deliverability / spam red flags
  assumptions: string[];   // what was assumed about the recipient / needs confirming
};

const OUTPUT_CONTRACT =
  '{"scorecard":{"score":0,"label":"","dims":[{"label":"נושא","value":0},{"label":"פתיח","value":0},{"label":"רלוונטיות ופרסונליזציה","value":0},{"label":"CTA","value":0},{"label":"אורך וקריאוּת","value":0}]},' +
  '"diagnosis":{"subject":"","opener":"","relevance":"","cta":"","length":""},' +
  '"fixes":["",""],' +
  '"rewrite":"",' +
  '"subjectLines":["","","","","",""],' +
  '"redFlags":[""],' +
  '"assumptions":[""]}';

// ── MAKER: grades the pasted email + rewrites it ─────────────────────────────
const MAKER_SYSTEM = buildSystemPrompt({
  role: 'אתה מומחה מיילים קרים ישראלי מהשורה הראשונה. אתה מדרג מייל קר שהלקוח כתב, נותן תיקונים קונקרטיים, כותב אותו מחדש, ומציע שורות נושא חזקות יותר. אתה כן, לא מחמיא.',
  inputs: [
    'המייל הקר שהלקוח כתב (כולל שורת נושא אם יש)',
    'למי המייל נשלח (קהל היעד)',
    'מה המטרה או ההצעה של המייל',
  ],
  workflow: [
    'דרג את המייל על חמישה מימדים, כל אחד 0 עד 100: נושא, פתיח, רלוונטיות ופרסונליזציה, CTA, אורך וקריאוּת. תן גם ציון כולל 0 עד 100 (ממוצע משוקלל) ו-label קצר לציון',
    'לכל מימד תן משפט או שניים של אבחון קונקרטי: מה עובד, מה שבור, ולמה. לא כללי, אלא מצטט מהמייל עצמו',
    'תן רשימת תיקונים קונקרטיים, כל תיקון פעולה ספציפית שאפשר לבצע, לא עצה כללית כמו "תהיה יותר אישי"',
    'כתוב את המייל מחדש במלואו בעברית ישראלית טבעית ודוגרי: שורת פתיחה שמחברת ללקוח, ערך ברור, CTA אחד קטן וספציפי. קצר. בלי קלישאות של AI ובלי מקף ארוך',
    'הצע 6 עד 8 שורות נושא חזקות יותר, כל אחת ספציפית וקונקרטית, בלי clickbait ובלי מילות ספאם',
    'סמן דגלים אדומים של מסירוּת (deliverability) וספאם: מילים שמפעילות מסנני ספאם, יותר מדי לינקים, נושא באותיות גדולות, הבטחות מוגזמות, אורך לא סביר',
  ],
  constraints: [
    'התיקונים חייבים להיות קונקרטיים ומבוססים על המייל עצמו, לא עצות גנריות',
    'אל תמציא עובדות על הנמען. אם אתה מניח משהו על הנמען או החברה, זה נכנס ל-assumptions ולא לתוך הכתיבה מחדש כעובדה',
    'הכתיבה מחדש ושורות הנושא בעברית ישראלית טבעית בלבד. בלי מקף ארוך. בלי מילים שהן קלישאות של AI. דוגרי וקונקרטי',
    'אם הלקוח לא נתן שורת נושא, אבחן זאת ותן ציון נושא נמוך בהתאם',
    'החזר JSON תקין בלבד, בלי טקסט לפני או אחרי',
  ],
  outputContract: OUTPUT_CONTRACT,
});

// ── CRITIC: reviews and corrects the maker output ────────────────────────────
const CRITIC_SYSTEM = buildSystemPrompt({
  role: 'אתה מבקר קופי של מיילים קרים. אתה מקבל דירוג וכתיבה מחדש של מייל, ובודק אותם נגד הכללים הקשיחים, מתקן במקום, ומחזיר גרסה מתוקנת. אתה קפדן ולא מרחם.',
  inputs: ['הקלט המקורי של הלקוח', 'הניתוח שה-Maker הפיק (JSON)'],
  workflow: [
    'ודא שכל תיקון קונקרטי ומבוסס על המייל, לא עצה כללית. הפל תיקון גנרי והחלף בקונקרטי',
    'ודא שהכתיבה מחדש דוגרי, בלי מקף ארוך, בלי קלישאות של AI, ושהיא באמת קצרה עם CTA אחד ספציפי',
    'ודא ששורות הנושא ספציפיות, לא clickbait, בלי מילות ספאם',
    'ודא שאין עובדות מומצאות על הנמען. כל הנחה עוברת ל-assumptions',
    'תקן במקום כל בעיה, ושמור על אותו מבנה JSON בדיוק',
  ],
  constraints: [
    'החזר את אותו סכימת JSON בדיוק, מתוקן',
    'אל תמציא מידע חדש. רק חדד, הפל תיקונים גנריים, וסמן הנחות',
    'בלי מקף ארוך. עברית טבעית',
    'החזר JSON תקין בלבד',
  ],
  outputContract: OUTPUT_CONTRACT,
});

function buildUser(input: EmailInput): string {
  return [
    `המייל הקר שהלקוח כתב:\n${cap(input.email, MAX_EMAIL) || '(לא צוין)'}`,
    `\nלמי המייל נשלח: ${cap(input.audience, MAX_FIELD) || '(לא צוין)'}`,
    `המטרה או ההצעה: ${cap(input.goal, MAX_FIELD) || '(לא צוין)'}`,
  ].join('\n');
}

export async function runColdEmailOptimizer(input: EmailInput): Promise<{ status: ToolStatus; analysis?: EmailAnalysis }> {
  const hasEmail = cap(input.email, MAX_EMAIL).length > 0;
  if (!hasEmail) return { status: 'bad_request' };
  if (!isConfigured()) return { status: 'unconfigured' };

  const user = buildUser(input);

  // Maker pass
  const made = parseJson<EmailAnalysis>(await callClaude(MAKER_SYSTEM, user, 2600));
  if (!made) return { status: 'error' };

  // Critic pass (Chief runs the loop once; the Maker output is fed back for correction)
  const critiqued = parseJson<EmailAnalysis>(
    await callClaude(CRITIC_SYSTEM, `${user}\n\n--- הניתוח שנוצר ---\n${JSON.stringify(made)}`, 2600),
  );

  // If the critic pass fails to return valid JSON, fall back to the maker output rather than erroring.
  return { status: 'ok', analysis: critiqued ?? made };
}
