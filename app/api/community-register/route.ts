import { NextResponse } from 'next/server';
import { notifyLead } from '@/lib/notify-lead';
import { recordContentLead } from '@/lib/content-leads';
import { clientIp } from '@/lib/client-ip';
import { rateLimited } from '@/lib/rate-limit';

// לידים מדף קהילת הפרגונים. כל השדות אופציונליים. נשמר ל-Supabase
// (content_leads, source='community') בשיטת ה-degrade-gracefully: אם משתני
// הסביבה של Supabase לא מוגדרים, פשוט לא נשמר, והטופס עדיין מחזיר הצלחה כל עוד
// ההתראה במייל יצאה, כדי שכפתור ההצטרפות לקהילה יופיע. אחרי השמירה יוצאת גם
// התראה במייל, כי עד עכשיו הפרטים נכנסו ל-Supabase בשקט ואף אחד לא ידע שנרשם
// מישהו לקהילה. רק כששניהם נכשלו מחזירים שגיאה, כי אז הליד לא קיים בשום מקום.

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
  // נקודת קצה פתוחה ששולחת מייל, לכן תקרה של 10 בקשות בדקה לכל IP. שדה הפתיון
  // למטה תופס רק דפדפן שממלא את הטופס. סקריפט ששולח JSON ישירות לא נוגע בו.
  if (rateLimited('community-register', clientIp(req), 10)) {
    return NextResponse.json({ ok: false, error: 'rate_limited' }, { status: 429 });
  }

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

  // שומרים לפני ששולחים, כמו ב-app/api/lead/route.ts. recordContentLead בולע
  // את השגיאות שלו ומחזיר false במקום לזרוק, אז אין כאן מה לתפוס, ומספיק
  // לשמור את התוצאה כדי לדעת אם הליד באמת נכתב.
  const stored = await recordContentLead({
    // content_leads.email הוא not-null. אם לא הושאר מייל, שומרים מזהה מציין
    // כדי לא לאבד את הליד. שאר הפרטים נשמרים ב-details.
    email: email || `community-${Date.now()}@no-email.local`,
    source: 'community',
    name: name || undefined,
    details: Object.keys(details).length ? details : undefined,
  });

  // ההתראה מקבלת תוויות בעברית כדי שהמייל יהיה קריא בלי לפענח שמות שדות.
  // notifyLead לא זורק, אז אין כאן try/catch, רק בדיקה של התוצאה.
  const notified = await notifyLead({
    kind: 'הרשמה לקהילת הפרגונים',
    source: 'community',
    name: name || undefined,
    // רק מייל אמיתי. מייל ההצבה שנשמר ב-Supabase היה הופך את ה-replyTo
    // של ההתראה לכתובת שלא קיימת.
    email: email || undefined,
    phone: details.phone,
    details: {
      עסק: details.business,
      אתר: details.website,
      תחום: details.field,
      'הסכמה לדיוור': details.marketingConsent === 'true' ? 'כן' : 'לא',
    },
    req,
  });

  // כשגם השמירה וגם המייל נכשלו, הליד לא קיים בשום מקום. אסור להציג מסך תודה
  // שכתוב בו "שמרנו את הפרטים" על משהו שנזרק. כשאחד מהשניים הצליח הליד בידיים
  // שלנו, והטופס ממשיך להציג את הקישור לקהילה גם אם Resend נפל.
  if (!stored && !notified) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
