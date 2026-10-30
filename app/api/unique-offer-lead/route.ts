import { NextResponse } from 'next/server';
import { recordCrmContact } from '@/lib/crm-contacts';
import { getResend } from '@/lib/resend';

// לידים מדף "הצעה ייחודית לבעלי עסקים במגזר החרדי" (/unique-offer).
// המודל: המגזר סוגר הכל טלפונית. אין בדיקה עצמית, רק משאירים שם+טלפון ואנחנו חוזרים.
// לכן הטופס מינימלי (שם + טלפון בלבד, בלי אימייל, בלי חסימת Gmail), ושלושה מסלולי
// קליטה בלתי-תלויים כדי שליד לעולם לא יאבד:
//   1. Supabase crm_contacts (source='unique-offer') — best-effort
//   2. התראת מייל דרך Resend                           — best-effort
// אף אחד מהם לא חוסם את המשתמש.

export const runtime = 'nodejs';

type Payload = {
  name?: string;
  phone?: string;
  notes?: string;
  company_hp?: string; // honeypot
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

  const name = s(body.name).slice(0, 120);
  const phone = s(body.phone).slice(0, 40);
  const phoneDigits = phone.replace(/\D/g, '');
  if (!name) {
    return NextResponse.json({ ok: false, error: 'missing_name' }, { status: 400 });
  }
  if (phoneDigits.length !== 10 || phoneDigits[0] !== '0') {
    return NextResponse.json({ ok: false, error: 'invalid_phone' }, { status: 400 });
  }

  const notes = s(body.notes).slice(0, 600);
  const entryTime = new Date().toLocaleString('he-IL', { timeZone: 'Asia/Jerusalem', dateStyle: 'short', timeStyle: 'short' });

  const noteLines = [
    'הצעה ייחודית למגזר החרדי · בקשה לשיחה חוזרת',
    notes ? `הערות: ${notes}` : '',
    `נכנס: ${entryTime}`,
  ].filter(Boolean);

  // ── מסלול 1: CRM ────────────────────────────────────────────────
  const rec = await recordCrmContact({
    fullName: name,
    phone,
    source: 'unique-offer',
    isBusiness: true,
    score: 50,
    notesLines: noteLines,
    sourceData: { intent: 'callback', entry_time: entryTime },
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
        'ליד חדש · הצעה ייחודית למגזר החרדי · בקשה לשיחה חוזרת',
        '',
        `שם: ${name}`,
        `טלפון: ${phone}`,
        notes ? `הערות: ${notes}` : '',
        `התקבל: ${new Date().toISOString()}`,
      ].filter(Boolean).join('\n');
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM || 'onboarding@resend.dev',
        to: recipients,
        subject: `הצעה למגזר · שיחה חוזרת · ${name} · ${phone}`,
        text: lines,
      });
      if (error) mailError = `${error.name}: ${error.message}`.slice(0, 200);
    } catch (err) {
      mailError = err instanceof Error ? err.message.slice(0, 200) : 'exception';
      console.error('unique-offer-lead notify failed', err);
    }
  }

  return NextResponse.json({
    ok: true,
    stored: rec.stored,
    storeError: rec.stored ? undefined : rec.error,
    mailError,
  });
}
