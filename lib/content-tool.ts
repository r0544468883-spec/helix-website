import 'server-only';
import { buildSystemPrompt } from './prompt-kit';

// Content tool engine for /free-tools/content — one free "digital-asset check" alongside
// the GEO check (/ai-checker) and the venture-readiness check (/startups/readiness).
// Three modes, all Claude-backed (claude-sonnet-5, same convention as readiness-business.ts):
//   • analyze — decompose winning posts into their shared DNA / formula
//   • build   — write a new post (optionally on a learned formula)
//   • email   — write OR rewrite an email, in Hebrew or English
// Degrades gracefully to { status: 'unconfigured' } when ANTHROPIC_API_KEY is unset.

const MODEL = 'claude-sonnet-5';
const ENDPOINT = 'https://api.anthropic.com/v1/messages';

// Every string below reaches a paid Claude prompt from an anonymous caller, so
// each one is capped at the source rather than trusted from the request body.
const MAX_POST_CHARS = 4_000;
const MAX_TOTAL_CHARS = 32_000;
const cap = (v: unknown, n: number) => (typeof v === 'string' ? v.trim().slice(0, n) : '');

export function isConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

// ── shared Claude call ──────────────────────────────────────────────────────
async function callClaude(system: string, user: string, maxTokens = 1500): Promise<string | null> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: AbortSignal.timeout(60_000),
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

// ── mode: analyze (Content DNA) ─────────────────────────────────────────────
export type Genes = { opener: string; topic: string; format: string; ending: string };
export type PostDna = { index: number } & Genes;
export type ContentDna = {
  posts: PostDna[];
  formula: Genes;
  consistency: { opener: number; topic: number; format: number; ending: number; total: number };
  why: string[];
  template: Genes;
};

const ANALYZE_SYSTEM = buildSystemPrompt({
  role: 'אתה אנליסט תוכן ישראלי שמפרק פוסטים מנצחים ל־DNA שלהם.',
  inputs: ['כמה פוסטים (2–8) שקיבלו תגובות טובות, ממוספרים מ־0'],
  workflow: [
    'פרק כל פוסט ל־4 גנים קצרים בעברית: opener (סוג הפתיח), topic (הנושא/זווית), format (מבנה/פורמט), ending (סוג הסיום)',
    'זהה את הנוסחה המשותפת (formula) על פני כל הפוסטים',
    'ספור עקביות — כמה פוסטים חולקים כל גן',
    'כתוב 2–3 סיבות קצרות למה הקהל מגיב (why)',
    'בנה template למילוי־חוסר לפוסט הבא לפי הנוסחה, עם [סוגריים מרובעים] להשלמה',
  ],
  constraints: ['כל תווית = 2–5 מילים קונקרטיות', 'עברית בלבד', 'החזר JSON תקין בלבד — בלי טקסט לפני או אחרי'],
  outputContract:
    '{"posts":[{"index":0,"opener":"","topic":"","format":"","ending":""}],' +
    '"formula":{"opener":"","topic":"","format":"","ending":""},' +
    '"consistency":{"opener":0,"topic":0,"format":0,"ending":0,"total":0},"why":["",""],' +
    '"template":{"opener":"","topic":"","format":"","ending":""}}',
});

export async function analyzePosts(posts: string[]): Promise<{ status: ToolStatus; dna?: ContentDna }> {
  const clean = posts.map((p) => cap(p, MAX_POST_CHARS)).filter(Boolean).slice(0, 8);
  if (clean.length < 2) return { status: 'bad_request' };
  if (clean.reduce((n, p) => n + p.length, 0) > MAX_TOTAL_CHARS) return { status: 'bad_request' };
  if (!isConfigured()) return { status: 'unconfigured' };

  const user = 'הפוסטים לניתוח (ממוספרים מ־0):\n\n' + clean.map((p, i) => `### פוסט ${i}\n${p}`).join('\n\n');
  const dna = parseJson<ContentDna>(await callClaude(ANALYZE_SYSTEM, user, 1600));
  if (!dna || !Array.isArray(dna.posts) || !dna.formula) return { status: 'error' };

  const total = clean.length;
  const clamp = (n: unknown) => Math.max(0, Math.min(total, Number(n) || 0));
  return {
    status: 'ok',
    dna: {
      ...dna,
      consistency: {
        opener: clamp(dna.consistency?.opener),
        topic: clamp(dna.consistency?.topic),
        format: clamp(dna.consistency?.format),
        ending: clamp(dna.consistency?.ending),
        total,
      },
      why: (dna.why ?? []).filter(Boolean).slice(0, 3),
    },
  };
}

// ── mode: build (write a new post) ──────────────────────────────────────────
export type BuildInput = {
  topic: string;
  platform?: string; // LinkedIn / Instagram / Facebook / X / כללי
  tone?: string; // מקצועי / אישי / נועז / דוגרי…
  language?: 'he' | 'en';
  formula?: Partial<Genes> | null; // optional learned formula to follow
};
export type BuildResult = { post: string; hooks: string[] };

export async function buildPost(input: BuildInput): Promise<{ status: ToolStatus; result?: BuildResult }> {
  const topic = cap(input.topic, 2_000);
  if (!topic) return { status: 'bad_request' };
  if (!isConfigured()) return { status: 'unconfigured' };

  const lang = input.language === 'en' ? 'English' : 'Hebrew';
  const formulaLine = input.formula
    ? `עקוב אחרי הנוסחה המנצחת הזו: פתיח=${cap(input.formula.opener, 200)}, נושא=${cap(input.formula.topic, 200)}, פורמט=${cap(input.formula.format, 200)}, סיום=${cap(input.formula.ending, 200)}.`
    : 'בחר את המבנה הכי אפקטיבי לפלטפורמה.';

  const system = buildSystemPrompt({
    lang: input.language === 'en' ? 'en' : 'he',
    role: `אתה קופירייטר סושיאל ${lang} מהשורה הראשונה שכותב פוסטים שנשמעים כמו אדם אמיתי, לעולם לא כמו AI.`,
    inputs: [`פלטפורמה: ${cap(input.platform, 100) || 'סושיאל כללי'}`, `טון: ${cap(input.tone, 200) || 'אותנטי, ישיר'}`, 'נושא הפוסט (בהודעת המשתמש)'],
    workflow: [formulaLine, 'כתוב פוסט אחד מלא ומוכן לפרסום', 'הצע 3 פתיחים חלופיים (hooks)'],
    constraints: ['תוכן טבעי, בלי קלישאות AI', "בלי אימוג'ים מוגזמים", 'בלי הסברים מסביב ל-JSON'],
    outputContract: '{"post":"the full post text","hooks":["3 alternative opening-line hooks"]}',
  });
  const result = parseJson<BuildResult>(await callClaude(system, `הנושא: ${topic}`, 1200));
  if (!result?.post) return { status: 'error' };
  return { status: 'ok', result: { post: result.post, hooks: (result.hooks ?? []).slice(0, 3) } };
}

// ── mode: email (write or rewrite) ──────────────────────────────────────────
export type EmailInput = {
  action: 'write' | 'rewrite';
  language: 'he' | 'en';
  /** for write: what the email is about / goal; for rewrite: the existing email text */
  text: string;
  tone?: string;
  goal?: string; // optional extra context for either action
};
export type EmailResult = { subject: string; body: string };

export async function handleEmail(input: EmailInput): Promise<{ status: ToolStatus; result?: EmailResult }> {
  const text = cap(input.text, 8_000);
  if (!text) return { status: 'bad_request' };
  if (!isConfigured()) return { status: 'unconfigured' };

  const isEn = input.language === 'en';
  const langName = isEn ? 'English' : 'Hebrew';
  const rtlNote = isEn ? '' : 'כתוב עברית תקנית וטבעית, לא מתורגמת. ';

  const system = buildSystemPrompt({
    lang: isEn ? 'en' : 'he',
    role:
      input.action === 'rewrite'
        ? `אתה משכתב מיילים ב-${langName} כך שיהיו ברורים, חמים ואפקטיביים יותר — תוך שמירה על כוונת השולח.`
        : `אתה כותב מיילים ממירים ב-${langName} מתוך בריף קצר.`,
    inputs: [
      input.action === 'rewrite' ? 'המייל הקיים (בהודעת המשתמש)' : 'תיאור/מטרת המייל (בהודעת המשתמש)',
      ...(input.tone ? [`טון: ${cap(input.tone, 200)}`] : []),
      ...(input.goal ? [`הקשר/מטרה: ${cap(input.goal, 500)}`] : []),
    ],
    constraints: [...(rtlNote ? ['עברית תקנית וטבעית, לא מתורגמת'] : []), 'בלי טקסט מסביב ל-JSON'],
    outputContract: '{"subject":"","body":""}',
  });

  const user =
    input.action === 'rewrite'
      ? `שכתב את המייל הבא:\n\n${text}`
      : `כתוב מייל על סמך התיאור:\n\n${text}`;

  const result = parseJson<EmailResult>(await callClaude(system, user, 1200));
  if (!result?.body) return { status: 'error' };
  return { status: 'ok', result: { subject: result.subject ?? '', body: result.body } };
}
