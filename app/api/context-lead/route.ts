import { NextResponse } from 'next/server';
import { notifyLead } from '@/lib/notify-lead';
import { recordContentLead } from '@/lib/content-leads';
import { clientIp } from '@/lib/client-ip';
import { rateLimited } from '@/lib/rate-limit';

// The "מאפס ל-AI" questionnaire (/free-tools/ai-context). It is the richest
// capture on the site: a whole organisation profile plus a readiness score,
// filled by someone who just spent five minutes answering 18 questions.
//
// Until now the browser inserted it into Supabase directly with the public anon
// key and nobody was notified, so those answers sat in a table no one opens.
// Same contract as app/api/lead/route.ts: persist first, notify second, and
// only report a failure to the visitor when BOTH failed.

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Unauthenticated endpoint that sends mail, so it is capped per IP.
const RATE_MAX = 10;

/** readiness_score arrives as a number, every other answer as a string. */
function asText(v: unknown): string {
  if (typeof v === 'number' && Number.isFinite(v)) return String(v);
  return typeof v === 'string' ? v.trim() : '';
}

// The questionnaire's own wording, so the mail reads like the form the visitor
// filled instead of like our column names. A few ContextLead fields carry an
// answer the form asks differently: `tone` holds the pain point, `redlines`
// holds the 12-month goal, `offerings` holds the tool stack.
// Grouped by the form's own sections, in the order the visitor answered.
const LABELS: Array<[string, string]> = [
  // על העסק
  ['org_name', 'שם הארגון'],
  ['what_you_do', 'מה אתם עושים'],
  ['website', 'כתובת האתר'],
  ['occupation', 'תחום העיסוק'],
  ['audience', 'גודל הארגון והלקוחות'],
  // תשתית וכלים
  ['crm', 'מה משמש לניהול לקוחות (CRM)'],
  ['offerings', 'כלים מרכזיים בסטאק'],
  // אוטומציה ותהליכים
  ['automation', 'כמה מהעבודה החוזרת מתבצעת אוטומטית'],
  ['integrations', 'אינטגרציות בין המערכות'],
  ['tone', 'איפה התהליך הכי כואב'],
  // דאטה ומדידה
  ['tracking', 'איך עוקבים אחרי ביצועים'],
  ['decisions', 'החלטות מתקבלות לפי'],
  // שימוש AI וצוות
  ['ai_uses', 'כמה הצוות משתמש ב-AI'],
  ['ai_where', 'היכן כבר משתמשים ב-AI'],
  ['ai_training', 'הדרכה מסודרת לצוות על AI'],
  // ממשל ואבטחה
  ['ai_policy', 'מדיניות שימוש ואבטחת מידע ל-AI'],
  // המטרה
  ['redlines', 'המטרה המרכזית ל-12 החודשים הקרובים'],
  ['readiness_score', 'ציון בשלות AI (מתוך 100)'],
];

/** Every questionnaire answer, in form order, capped so nobody can stuff the mail. */
function answers(body: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, label] of LABELS) {
    const value = asText(body[key]).slice(0, 800);
    if (value) out[label] = value;
  }
  return out;
}

export async function POST(req: Request) {
  if (rateLimited('context-lead', clientIp(req), RATE_MAX)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // Honeypot.
  if (asText(body.company).length > 0) {
    return NextResponse.json({ ok: true });
  }

  const name = asText(body.name).slice(0, 120);
  const phone = asText(body.phone).replace(/\D/g, '').slice(0, 20);
  const email = asText(body.email).toLowerCase().slice(0, 200);
  const source = asText(body.source).slice(0, 80) || 'context-kit';

  const hasEmail = EMAIL_RE.test(email);
  // Looser than app/api/lead on purpose. There we validate a two-field form the
  // visitor can fix in a second; here we would be throwing away 18 answers
  // because someone typed a landline or a +972 prefix. Any plausible run of
  // digits counts as reachable, the mail carries it as typed.
  const hasPhone = phone.length >= 9;
  if (!hasEmail && !hasPhone) {
    return NextResponse.json({ ok: false, error: 'missing_contact' }, { status: 400 });
  }

  const details = answers(body);

  // Persist BEFORE notifying, so a Resend outage does not lose the lead.
  const { stored } = await recordContentLead({
    // content_leads.email is not-null, so a phone-only lead gets a placeholder
    // and keeps its real contact detail in `details`.
    email: hasEmail ? email : `context-${phone || 'unknown'}@no-email.local`,
    source,
    name,
    details: { ...details, ...(hasPhone ? { טלפון: phone } : {}) },
  });

  const sent = await notifyLead({
    kind: 'ליד משאלון מאפס ל-AI',
    source: '/free-tools/ai-context',
    name,
    email: hasEmail ? email : undefined,
    phone: hasPhone ? phone : undefined,
    details,
    req,
  });

  // Only a total loss is an error the visitor should see.
  if (!sent && !stored) {
    return NextResponse.json({ ok: false, error: 'send_failed' }, { status: 500 });
  }
  return NextResponse.json({ ok: true, stored, notified: sent });
}
