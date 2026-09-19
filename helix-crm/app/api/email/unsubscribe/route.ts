import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// הסרה מרשימת התפוצה. מקבל ?s=sendId (מקמפיין) או ?t=unsubscribe_token (מהניוזלטר).
//
// GET רק מציג אישור; ההסרה עצמה ב-POST. קודם ה-GET היה כותב, כלומר כל
// prefetcher של לקוח מייל או sandbox שבודק קישורים הסיר את הנמען בשקט —
// והוא היה מגלה רק כשהמיילים מפסיקים להגיע.

function page(title: string, body: string, form?: string): Response {
  const html = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
  <meta name="viewport" content="width=device-width"><title>${title}</title></head>
  <body style="margin:0;background:#121413;font-family:Arial,sans-serif;color:#E2E3E1;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;">
    <div style="padding:32px;">
      <div style="font-size:22px;font-weight:900;">HELIX STAGE<span style="color:#10B981;">.</span></div>
      <p style="font-size:16px;color:#BBCABE;margin-top:16px;">${body}</p>
      ${form ?? ''}
    </div>
  </body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const qs = url.searchParams.toString();
  return page(
    'הסרה מרשימת התפוצה',
    'רוצים להפסיק לקבל מאיתנו מיילים?',
    `<form method="post" action="/api/email/unsubscribe?${qs}">
       <button type="submit" style="margin-top:20px;background:#10B981;color:#121413;font-weight:700;border:none;border-radius:10px;padding:12px 24px;font-size:15px;cursor:pointer;">
         כן, הסירו אותי
       </button>
     </form>`
  );
}

export async function POST(request: Request) {
  const params = new URL(request.url).searchParams;
  const sendId = params.get('s');
  const token = params.get('t');
  const admin = createAdminClient();

  let email: string | null = null;
  try {
    if (admin) {
      if (sendId) {
        const { data } = await admin.from('email_sends').select('email').eq('id', sendId).maybeSingle();
        email = data?.email ?? null;
      } else if (token) {
        const { data } = await admin
          .from('newsletter_subscribers')
          .select('email')
          .eq('unsubscribe_token', token)
          .maybeSingle();
        email = data?.email ?? null;
      }
      if (email) {
        // מסמן כמוסר; אם לא קיים ברשימה — יוצר רשומה מוסרת (רשימת השתקה)
        const { data: existing } = await admin
          .from('newsletter_subscribers')
          .select('id')
          .eq('email', email)
          .maybeSingle();
        if (existing) {
          await admin
            .from('newsletter_subscribers')
            .update({ unsubscribed_at: new Date().toISOString() })
            .eq('email', email);
        } else {
          await admin
            .from('newsletter_subscribers')
            .insert({ email, unsubscribed_at: new Date().toISOString() });
        }
      }
    }
  } catch {
    // ממשיכים לעמוד האישור
  }

  return page(
    'הוסרתם מרשימת התפוצה',
    'הוסרתם בהצלחה מרשימת התפוצה. לא נשלח אליכם עוד מיילים.'
  );
}
