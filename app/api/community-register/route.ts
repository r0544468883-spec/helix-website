import { NextResponse } from 'next/server';
import { recordContentLead } from '@/lib/content-leads';
import { getResend } from '@/lib/resend';

// לידים מדף קהילת הפרגונים. כל השדות אופציונליים. נשמר ל-Supabase
// (content_leads, source='community') בשיטת ה-degrade-gracefully: אם משתני
// הסביבה של Supabase לא מוגדרים, פשוט לא נשמר, והטופס עדיין מחזיר הצלחה
// כדי שכפתור ההצטרפות לקהילה יופיע.

export const runtime = 'nodejs';

type Payload = {
  firstName?: string;
  lastName?: string;
  business?: string;
  phone?: string;
  website?: string;
  email?: string;
  field?: string;
  consent?: string; // הסכמה לחומר שיווקי
  company?: string; // honeypot
};

export async function POST(req: Request) {
  let body: Payload;
  try {
    body = (await req.json()) as Payload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  // בוט מילא את שדה הפתיון. מחזירים ok בלי לשמור.
  if (body.company && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const details: Record<string, string> = {};
  for (const key of ['firstName', 'lastName', 'business', 'phone', 'website', 'field'] as const) {
    const val = body[key]?.trim();
    if (val) details[key] = val;
  }
  details.marketingConsent = body.consent === 'true' ? 'true' : 'false';

  const email = body.email?.trim() || '';
  const name = [body.firstName?.trim(), body.lastName?.trim()].filter(Boolean).join(' ');

  try {
    await recordContentLead({
      // content_leads.email הוא not-null. אם לא הושאר מייל, שומרים מזהה מציין
      // כדי לא לאבד את הליד. שאר הפרטים נשמרים ב-details.
      email: email || `community-${Date.now()}@no-email.local`,
      source: 'community',
      name: name || undefined,
      details: Object.keys(details).length ? details : undefined,
    });
  } catch {
    // best-effort, לא מפילים את החוויה על המשתמש
  }

  // התראת מייל, מסלול נפרד מ-Supabase כדי שליד לא יאבד גם כשה-DB לא נגיש.
  const recipients = (process.env.RESEND_NOTIFY_TO || 'service@helix.co.il,r0544468883@gmail.com')
    .split(',').map((s) => s.trim()).filter(Boolean);
  if (recipients.length) {
    try {
      const resend = getResend();
      const lines = [
        `הרשמה חדשה לקהילת הפירגונים`,
        ``,
        name ? `שם: ${name}` : '',
        email ? `אימייל: ${email}` : '',
        details.phone ? `טלפון: ${details.phone}` : '',
        details.business ? `עסק: ${details.business}` : '',
        details.field ? `תחום: ${details.field}` : '',
        details.website ? `אתר: ${details.website}` : '',
        `הסכמה לשיווק: ${details.marketingConsent === 'true' ? 'כן' : 'לא'}`,
        `התקבל: ${new Date().toISOString()}`,
      ].filter(Boolean).join('\n');
      const { error } = await resend.emails.send({
        from: process.env.RESEND_FROM || 'onboarding@resend.dev',
        to: recipients,
        subject: `הרשמה לקהילה${name ? ` · ${name}` : ''}${email ? ` (${email})` : ''}`,
        text: lines,
      });
      if (error) console.error('community-register notify error', error);
    } catch (err) {
      console.error('community-register notify failed', err);
    }
  }

  return NextResponse.json({ ok: true });
}
