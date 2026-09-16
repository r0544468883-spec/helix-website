import { NextResponse } from 'next/server';
import { recordContentLead } from '@/lib/content-leads';

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

  return NextResponse.json({ ok: true });
}
