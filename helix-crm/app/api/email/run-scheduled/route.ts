import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { deliverCampaign } from '@/lib/email-deliver';
import { checkCronSecret } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

// שולח קמפיינים מתוזמנים שהגיע זמנם. נקרא ע"י Cloud Scheduler.
// deliverCampaign מאמת בעצמו שהבעלים רשאי לסגמנט — בלי זה כל משתמש רשום
// היה יכול לתזמן קמפיין segment='all' ולדוור לכל רשימת התפוצה.
export async function GET(request: Request) {
  if (!checkCronSecret(request, process.env.SCHEDULED_EMAIL_SECRET)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin || !process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'missing config' }, { status: 500 });
  }

  const nowIso = new Date().toISOString();
  const { data: due } = await admin
    .from('email_campaigns')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', nowIso)
    .limit(20);

  let total = 0;
  let blocked = 0;
  for (const campaign of (due ?? []) as Record<string, unknown>[]) {
    try {
      const locale = (campaign.locale_filter as string) || 'he';
      const sent = await deliverCampaign(admin, campaign, locale);
      if (sent === -1) blocked++;
      else total += sent;
    } catch {
      // ממשיכים לקמפיין הבא
    }
  }

  return NextResponse.json({ ok: true, campaigns: (due ?? []).length, sent: total, blocked });
}
