import { NextResponse } from 'next/server';
import { recordCrmContact, enrichCrmContact } from '@/lib/crm-contacts';
import { getResend } from '@/lib/resend';

// לידים מדף "מתנת החג" (3 כתבות תומכות GEO/AEO). מבוסס על community-register,
// עם שלושה מסלולי קליטה בלתי-תלויים כדי שליד לעולם לא יאבד (הלקח מהפאדיחה
// הקודמת שבה כל הלידים אבדו כי ה-Supabase של האתר היה מת):
//   1. Supabase content_leads (source='matana')  — best-effort
//   2. התראת מייל דרך Resend                       — best-effort
//   3. Webhook ל-Google Sheets (Apps Script)       — best-effort
// אף אחד מהם לא חוסם את המשתמש. התשובה מחזירה אילו מסלולים הצליחו כדי
// שנוכל לוודא לפני שמשיקים.

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// מייל עסקי בלבד, חוסמים ספקי מייל חינמיים.
const FREE_EMAIL = /@(gmail|googlemail|hotmail|outlook|yahoo|ymail|walla|icloud|live|aol|protonmail|me)\./i;

type Payload = {
  name?: string;
  phone?: string;
  email?: string;
  business?: string;
  website?: string;
  field?: string;
  area?: string; // אזור גיאוגרפי
  audience?: string; // קהל יעד
  recommendFor?: string; // במה שה-AI ימליץ עליהם
  notes?: string; // כל דבר נוסף רלוונטי
  consent?: string;
  community?: string; // חבר/ה בקהילת הפרגונים → עדיפות
  company?: string; // honeypot
  enrich?: string; // שלב 2 של הטופס, מעדכן ליד קיים במקום ליצור חדש
};

// תוויות עבריות לשדות, לשימוש במייל ההתראה ובגיליון.
const FIELD_LABELS: Record<string, string> = {
  name: 'שם',
  phone: 'טלפון',
  email: 'אימייל',
  business: 'שם העסק',
  website: 'אתר / דומיין',
  field: 'תחום',
  area: 'אזור גיאוגרפי',
  audience: 'קהל יעד',
  recommendFor: 'במה שה-AI ימליץ',
  notes: 'הערות',
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
  if (s(body.company)) return NextResponse.json({ ok: true });

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

  // שאר השדות, לשימוש במייל ההתראה ובגיליון.
  const details: Record<string, string> = {};
  for (const key of ['phone', 'business', 'website', 'field', 'area', 'audience', 'recommendFor', 'notes'] as const) {
    const val = s(body[key]).slice(0, 600);
    if (val) details[key] = val;
  }
  const marketingConsent = body.consent === 'true';
  details.marketingConsent = marketingConsent ? 'true' : 'false';
  const isCommunity = body.community === 'true';
  details.community = isCommunity ? 'true' : 'false';

  // ── שלב 2: העשרת ליד קיים (מעדכן, לא יוצר חדש) ──────────────────
  if (body.enrich === 'true') {
    const enr = await enrichCrmContact(email, {
      notesLines: [
        isCommunity ? '⭐ חבר/ה בקהילת הפרגונים, עדיפות' : '',
        'מתנת חג: 3 כתבות תומכות GEO/AEO',
        details.business ? `עסק: ${details.business}` : '',
        details.website ? `אתר: ${details.website}` : '',
        details.field ? `תחום: ${details.field}` : '',
        details.area ? `אזור: ${details.area}` : '',
        details.audience ? `קהל יעד: ${details.audience}` : '',
        details.recommendFor ? `במה שה-AI ימליץ: ${details.recommendFor}` : '',
        details.notes ? `הערות: ${details.notes}` : '',
        `חבר קהילה: ${isCommunity ? 'כן' : 'לא'}`,
        `הסכמה לשיווק: ${marketingConsent ? 'כן' : 'לא'}`,
      ].filter(Boolean),
      sourceData: {
        business: details.business || null,
        website: details.website || null,
        field: details.field || null,
        area: details.area || null,
        audience: details.audience || null,
        recommend_for: details.recommendFor || null,
        notes: details.notes || null,
        community: isCommunity,
        marketing_consent: marketingConsent,
      },
    }).catch(() => ({ stored: false, error: 'exception' as const }));
    // התראת העשרה קצרה (best-effort), כדי שתדע שהליד השלים פרטים.
    const notify = (process.env.RESEND_NOTIFY_TO || 'service@helix.co.il,r0544468883@gmail.com')
      .split(',').map((x) => x.trim()).filter(Boolean);
    if (notify.length) {
      try {
        const resend = getResend();
        await resend.emails.send({
          from: process.env.RESEND_FROM || 'onboarding@resend.dev',
          to: notify,
          subject: `מתנת החג · פרטים הושלמו · ${name} (${email})`,
          text: ['הליד השלים את שלב 2 (פרטי GEO):', '',
            ...['business', 'website', 'field', 'area', 'audience', 'recommendFor', 'notes']
              .filter((k) => details[k]).map((k) => `${FIELD_LABELS[k]}: ${details[k]}`),
          ].join('\n'),
        });
      } catch { /* best-effort */ }
    }
    return NextResponse.json({ ok: true, enriched: enr.stored, storeError: enr.stored ? undefined : enr.error });
  }

  // ── מסלול 1: CRM (POLICYHUB · crm_contacts) ─────────────────────
  const rec = await recordCrmContact({
    fullName: name,
    email,
    phone,
    source: 'matana',
    isBusiness: true,
    score: isCommunity ? 40 : 0,
    notesLines: [
      isCommunity ? '⭐ חבר/ה בקהילת הפרגונים, עדיפות' : '',
      'מתנת חג: 3 כתבות תומכות GEO/AEO',
      details.business ? `עסק: ${details.business}` : '',
      details.website ? `אתר: ${details.website}` : '',
      details.field ? `תחום: ${details.field}` : '',
      details.area ? `אזור: ${details.area}` : '',
      details.audience ? `קהל יעד: ${details.audience}` : '',
      details.recommendFor ? `במה שה-AI ימליץ: ${details.recommendFor}` : '',
      details.notes ? `הערות: ${details.notes}` : '',
      `חבר קהילה: ${isCommunity ? 'כן' : 'לא'}`,
      `הסכמה לשיווק: ${marketingConsent ? 'כן' : 'לא'}`,
    ].filter(Boolean),
    sourceData: {
      business: details.business || null,
      website: details.website || null,
      field: details.field || null,
      area: details.area || null,
      audience: details.audience || null,
      recommend_for: details.recommendFor || null,
      notes: details.notes || null,
      community: isCommunity,
      marketing_consent: marketingConsent,
    },
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
        isCommunity ? '⭐ חבר/ה בקהילת הפרגונים, עדיפות' : '',
        'ליד חדש · מתנת החג (3 כתבות GEO/AEO)',
        '',
        `${FIELD_LABELS.name}: ${name}`,
        `${FIELD_LABELS.email}: ${email}`,
        ...['phone', 'business', 'website', 'field', 'area', 'audience', 'recommendFor', 'notes']
          .filter((k) => details[k])
          .map((k) => `${FIELD_LABELS[k]}: ${details[k]}`),
        `חבר קהילה: ${isCommunity ? 'כן' : 'לא'}`,
        `הסכמה לשיווק: ${details.marketingConsent === 'true' ? 'כן' : 'לא'}`,
        `התקבל: ${new Date().toISOString()}`,
      ].filter(Boolean).join('\n');
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM || 'onboarding@resend.dev',
        to: recipients,
        subject: `${isCommunity ? '⭐ ' : ''}מתנת החג · ליד חדש · ${name}${details.business ? ` · ${details.business}` : ''} (${email})`,
        text: lines,
      });
      if (error) mailError = `${error.name}: ${error.message}`.slice(0, 200);
    } catch (err) {
      mailError = err instanceof Error ? err.message.slice(0, 200) : 'exception';
      console.error('matana-lead notify failed', err);
    }
  }

  // ── מסלול 3: Google Sheets webhook ────────────────────────────
  // הדבק URL של Google Apps Script Web App ב-GSHEET_WEBHOOK_URL כדי להפעיל.
  let sheetError: string | undefined;
  const sheetUrl = process.env.GSHEET_WEBHOOK_URL;
  if (sheetUrl) {
    try {
      const res = await fetch(sheetUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'matana',
          receivedAt: new Date().toISOString(),
          name,
          email,
          ...details,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) sheetError = `http_${res.status}`;
    } catch (err) {
      sheetError = err instanceof Error ? err.message.slice(0, 200) : 'exception';
      console.error('matana-lead sheet failed', err);
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
