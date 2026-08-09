// Layer 2 of the readiness check — the BUSINESS/PRODUCT analysis.
// Sends the landing-page content to Claude and returns a founder-friendly
// diagnosis: value prop, audience, positioning, messaging clarity, standout
// features, likely competitors (to validate), and business/marketing gaps.
// Degrades gracefully to { status: 'unconfigured' } when ANTHROPIC_API_KEY is unset.

const LLM_TIMEOUT_MS = 30000;
const MODEL = 'claude-sonnet-5';

export interface BusinessAnalysis {
  productSummary: string;
  targetAudience: string;
  category: string;
  messagingClarity: { verdict: 'clear' | 'partial' | 'confusing'; note: string };
  fiveSecondTest: { pass: boolean; note: string };
  pricingModel: string;
  socialProof: { verdict: 'strong' | 'some' | 'none'; note: string };
  standoutFeatures: string[];
  likelyCompetitors: string[];
  gaps: string[];
}

export type BusinessResult =
  | { status: 'unconfigured' }
  | { status: 'error' }
  | { status: 'ok'; analysis: BusinessAnalysis };

export function isBusinessLayerConfigured(): boolean {
  return !!process.env.ANTHROPIC_API_KEY;
}

/** Extract the first balanced JSON object from a model response. */
function extractJson(raw: string): unknown | null {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).slice(0, 8);
}

function coerce(obj: Record<string, unknown>): BusinessAnalysis {
  const mc = (obj.messagingClarity ?? {}) as Record<string, unknown>;
  const verdictRaw = typeof mc.verdict === 'string' ? mc.verdict : 'partial';
  const verdict = (['clear', 'partial', 'confusing'] as const).includes(verdictRaw as never)
    ? (verdictRaw as BusinessAnalysis['messagingClarity']['verdict'])
    : 'partial';
  const fst = (obj.fiveSecondTest ?? {}) as Record<string, unknown>;
  const sp = (obj.socialProof ?? {}) as Record<string, unknown>;
  const spRaw = typeof sp.verdict === 'string' ? sp.verdict : 'none';
  const spVerdict = (['strong', 'some', 'none'] as const).includes(spRaw as never)
    ? (spRaw as BusinessAnalysis['socialProof']['verdict'])
    : 'none';
  return {
    productSummary: typeof obj.productSummary === 'string' ? obj.productSummary : 'לא הצלחנו לזהות מהדף.',
    targetAudience: typeof obj.targetAudience === 'string' ? obj.targetAudience : 'לא ברור מהדף.',
    category: typeof obj.category === 'string' ? obj.category : 'לא ברור מהדף.',
    messagingClarity: { verdict, note: typeof mc.note === 'string' ? mc.note : '' },
    fiveSecondTest: { pass: fst.pass === true, note: typeof fst.note === 'string' ? fst.note : '' },
    pricingModel: typeof obj.pricingModel === 'string' ? obj.pricingModel : 'לא נמצא מידע תמחור בדף.',
    socialProof: { verdict: spVerdict, note: typeof sp.note === 'string' ? sp.note : '' },
    standoutFeatures: asStringArray(obj.standoutFeatures),
    likelyCompetitors: asStringArray(obj.likelyCompetitors),
    gaps: asStringArray(obj.gaps),
  };
}

const PROMPT = (content: string, name: string) => `אתה יועץ Go-to-Market ומומחה מיצוב מוצר. קיבלת את תוכן דף הנחיתה של סטארטאפ${
  name ? ` בשם "${name}"` : ''
}. נתח אותו מנקודת מבט עסקית-שיווקית (לא טכנית) בסגנון אבחון ידידותי ליזם, והחזר JSON תקין בלבד, בעברית, במבנה המדויק הזה:
{
  "productSummary": "משפט אחד: מה המוצר עושה בפועל",
  "targetAudience": "מיהו קהל היעד ככל שברור מהדף",
  "category": "לאיזו קטגוריה המוצר שייך / איך הוא ממצב את עצמו",
  "messagingClarity": {"verdict": "clear|partial|confusing", "note": "האם ברור תוך כמה שניות מה זה ולמי — והסבר קצר"},
  "fiveSecondTest": {"pass": true, "note": "האם זר שנוחת לחמש שניות מבין מה זה ולמי — pass רק אם באמת ברור מיד"},
  "pricingModel": "מודל התמחור אם מופיע (freemium/מנוי/חד-פעמי/לא מצוין) + האם שקוף",
  "socialProof": {"verdict": "strong|some|none", "note": "עדויות/לוגואים/דירוגים/מספרי לקוחות — כמה וכמה משכנע"},
  "standoutFeatures": ["פיצ'ר בולט שמוזכר בדף", "..."],
  "likelyCompetitors": ["מתחרה סביר בשוק", "..."],
  "gaps": ["פער עסקי/שיווקי — מסרים, מיצוב, CTA, בידול או הוכחה חברתית", "..."]
}
כללים: אם משהו לא ברור מהדף, אמור זאת במפורש (למשל "לא ברור מהדף"). המתחרים הם הצעות לאימות בלבד — בסס על ידע/חיפוש. אל תמציא פיצ'רים שלא מופיעים בדף. החזר JSON בלבד — בלי טקסט לפני או אחרי, בלי סימוני קוד.

תוכן הדף:
"""
${content}
"""`;

export async function analyzeBusiness(content: string, businessName: string): Promise<BusinessResult> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { status: 'unconfigured' };
  if (!content || content.length < 120) return { status: 'error' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_TIMEOUT_MS);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: 'user', content: PROMPT(content, businessName) }],
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 2 }],
      }),
    });
    if (!res.ok) return { status: 'error' };
    const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
    const text = (data.content ?? [])
      .filter((b) => b.type === 'text' && b.text)
      .map((b) => b.text)
      .join('\n');
    const parsed = extractJson(text);
    if (!parsed || typeof parsed !== 'object') return { status: 'error' };
    return { status: 'ok', analysis: coerce(parsed as Record<string, unknown>) };
  } catch {
    return { status: 'error' };
  } finally {
    clearTimeout(timer);
  }
}
