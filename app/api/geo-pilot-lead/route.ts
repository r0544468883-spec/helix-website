import { NextResponse } from 'next/server';
import { recordCrmContact, enrichCrmContact } from '@/lib/crm-contacts';
import { getResend } from '@/lib/resend';

// לידים מדף הפיילוט ל-GEO למותגים (פנייה קרה בלינקדאין לסמנכ״לי/מנכ״לי שיווק).
// מבוסס על matana-lead, עם שלושה מסלולי קליטה בלתי-תלויים כדי שליד לעולם לא יאבד:
//   1. Supabase crm_contacts (source='geo-pilot') — best-effort
//   2. התראת מייל דרך Resend                       — best-effort
//   3. Webhook ל-Google Sheets (Apps Script)       — best-effort
// אף אחד מהם לא חוסם את המשתמש.

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// מייל בעבודה בלבד, חוסמים ספקי מייל חינמיים.
const FREE_EMAIL = /@(gmail|googlemail|hotmail|outlook|yahoo|ymail|walla|icloud|live|aol|protonmail|me)\./i;

type Payload = {
  intent?: string; // 'call' | 'report'
  name?: string;
  company?: string; // שם המותג / החברה
  email?: string;
  phone?: string;
  website?: string;
  role?: string; // תפקיד
  category?: string; // קטגוריה / תחום תחרות
  competitors?: string; // מתחרים עיקריים
  recommendFor?: string; // השאלה שה-AI ימליץ עליהם
  notes?: string;
  consent?: string;
  company_hp?: string; // honeypot
  enrich?: string; // שלב 2 של הטופס, מעדכן ליד קיים במקום ליצור חדש
};

const FIELD_LABELS: Record<string, string> = {
  name: 'שם',
  company: 'מותג / חברה',
  email: 'אימייל',
  phone: 'טלפון',
  website: 'אתר',
  role: 'תפקיד',
  category: 'קטגוריה',
  competitors: 'מתחרים',
  recommendFor: 'השאלה שה-AI ימליץ עליה',
  notes: 'הערות',
};

const INTENT_LABEL: Record<string, string> = {
  call: 'שיחת GEO',
  report: 'דוח נראות ב-AI (חינם)',
};

function s(v: unknown): string {
  return typeof v === 'string' ? v.trim() : '';
}

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_json' }, { status: 400 });
  }

  // בוט מילא את שדה הפתיון. מחזירים ok בלי לשמור.
  if (s(body.company_hp)) return NextResponse.json({ ok: true });

  const email = s(body.email).toLowerCase();
  if (!EMAIL_RE.test(email) || email.length > 200) {
    return NextResponse.json({ ok: false, error: 'invalid_email' }, { status: 400 });
  }
  if (FREE_EMAIL.test(email)) {
    return NextResponse.json({ ok: false, error: 'free_email' }, { status: 400 });
  }
  const name = s(body.name).slice(0, 120);
  const phone = s(body.phone).slice(0, 40);
  const phoneDigits = phone.replace(/\D/g, '');
  if (!name) {
    return NextResponse.json({ ok: false, error: 'missing_required' }, { status: 400 });
  }
  if (phoneDigits.length !== 10 || phoneDigits[0] !== '0') {
    return NextResponse.json({ ok: false, error: 'invalid_phone' }, { status: 400 });
  }

  const intent = s(body.intent) === 'report' ? 'report' : 'call';

  const details: Record<string, string> = {};
  for (const key of ['company', 'phone', 'website', 'role', 'category', 'competitors', 'recommendFor', 'notes'] as const) {
    const val = s(body[key]).slice(0, 600);
    if (val) details[key] = val;
  }
  const marketingConsent = body.consent === 'true';
  details.marketingConsent = marketingConsent ? 'true' : 'false';
  const entryTime = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' });

  const noteLines = (): string[] =>
    [
      `פיילוט GEO למותגים · ${INTENT_LABEL[intent]}`,
      details.company ? `מותג: ${details.company}` : '',
      details.role ? `תפקיד: ${details.role}` : '',
      details.website ? `אתר: ${details.website}` : '',
      details.category ? `קטגוריה: ${details.category}` : '',
      details.competitors ? `מתחרים: ${details.competitors}` : '',
      details.recommendFor ? `שאלה לקידום: ${details.recommendFor}` : '',
      details.notes ? `הערות: ${details.notes}` : '',
      `נכנס: ${entryTime}`,
      `הסכמה לשיווק: ${marketingConsent ? 'כן' : 'לא'}`,
    ].filter(Boolean);

  const sourceData = () => ({
    intent,
    company: details.company || null,
    role: details.role || null,
    website: details.website || null,
    category: details.category || null,
    competitors: details.competitors || null,
    recommend_for: details.recommendFor || null,
    notes: details.notes || null,
    entry_time: entryTime,
    marketing_consent: marketingConsent,
  });

  // ── שלב 2: העשרת ליד קיים (מעדכן, לא יוצר חדש) ──────────────────
  if (body.enrich === 'true') {
    const enr = await enrichCrmContact(email, {
      notesLines: noteLines(),
      sourceData: sourceData(),
    }).catch(() => ({ stored: false, error: 'exception' as const }));
    const notify = (process.env.RESEND_NOTIFY_TO || 'service@helix.co.il,r0544468883@gmail.com')
      .split(',').map((x) => x.trim()).filter(Boolean);
    if (notify.length) {
      try {
        const resend = getResend();
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'onboarding@resend.dev',
          to: notify,
          subject: `GEO פיילוט · פרטים הושלמו · ${name}${details.company ? ` · ${details.company}` : ''} (${email})`,
          text: ['הליד השלים את שלב 2:', '',
            ...['company', 'role', 'website', 'category', 'competitors', 'recommendFor', 'notes']
              .filter((k) => details[k]).map((k) => `${FIELD_LABELS[k]}: ${details[k]}`),
          ].join('\n'),
        });
      } catch { /* best-effort */ }
    }
    return NextResponse.json({ ok: true, enriched: enr.stored, storeError: enr.stored ? undefined : enr.error });
  }

  // ── מסלול 1: CRM ────────────────────────────────────────────────
  const rec = await recordCrmContact({
    fullName: name,
    email,
    phone,
    source: 'geo-pilot',
    isBusiness: true,
    score: intent === 'call' ? 50 : 30,
    notesLines: noteLines(),
    sourceData: sourceData(),
  }).catch(() => ({ stored: false, error: 'exception' as const }));

  // ── מסלול 2: מייל ──────────────────────────────────────────────
  const recipients = (process.env.RESEND_NOTIFY_TO || 'service@helix.co.il,r0544468883@gmail.com')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);
  let mailError: string | undefined;
  if (recipients.length) {
    try {
      const resend = getResend();
      const lines = [
        `ליד חדש · פיילוט GEO למותגים · ${INTENT_LABEL[intent]}`,
        '',
        `${FIELD_LABELS.name}: ${name}`,
        `${FIELD_LABELS.email}: ${email}`,
        ...['phone', 'company', 'role', 'website', 'category', 'competitors', 'recommendFor', 'notes']
          .filter((k) => details[k])
          .map((k) => `${FIELD_LABELS[k]}: ${details[k]}`),
        `הסכמה לשיווק: ${marketingConsent ? 'כן' : 'לא'}`,
        `התקבל: ${new Date().toISOString()}`,
      ].filter(Boolean).join('\n');
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM || 'onboarding@resend.dev',
        to: recipients,
        subject: `GEO פיילוט · ${INTENT_LABEL[intent]} · ${name}${details.company ? ` · ${details.company}` : ''} (${email})`,
        text: lines,
      });
      if (error) mailError = `${error.name}: ${error.message}`.slice(0, 200);
    } catch (err) {
      mailError = err instanceof Error ? err.message.slice(0, 200) : 'exception';
      console.error('geo-pilot-lead notify failed', err);
    }
  }

  // ── מסלול 3: Google Sheets webhook ────────────────────────────
  let sheetError: string | undefined;
  const sheetUrl = process.env.GSHEET_WEBHOOK_URL;
  if (sheetUrl) {
    try {
      const res = await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'geo-pilot',
          receivedAt: new Date().toISOString(),
          intent,
          name,
          email,
          ...details,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) sheetError = `http_${res.status}`;
    } catch (err) {
      sheetError = err instanceof Error ? err.message.slice(0, 200) : 'exception';
      console.error('geo-pilot-lead sheet failed', err);
    }
  }

  return NextResponse.json({
    ok: true,
    stored: rec.stored,
    storeError: rec.stored ? undefined : rec.error,
    mailError,
    sheetError,
  });
}
