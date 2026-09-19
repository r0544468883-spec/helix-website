// משלוח קמפיינים — משותף לשליחה הידנית מהמסך ולנתיב הקרון המתוזמן.
//
// למה מודול נפרד ולא app/actions.ts: כל export מקובץ 'use server' הופך ל-Server
// Action ציבורי עם action id, כלומר endpoint שאפשר לקרוא לו מבחוץ בלי בדיקת סשן.
// deliverCampaign מקבלת קליינט service_role, אז מקומה לא שם.
//
// כלל הזהב כאן: אימות ההרשאות לסגמנט חי ב-isCampaignSegmentAllowed בלבד, ושני
// נתיבי המשלוח חייבים לעבור דרכו. קודם הבדיקה ישבה רק ב-sendCampaign, והקרון
// שלח כל קמפיין מתוזמן בלי לבדוק כלום.

import { Resend } from 'resend';
import type { createAdminClient } from '@/lib/supabase/admin';
import { buildEmailHtml } from '@/lib/email';

type Admin = NonNullable<ReturnType<typeof createAdminClient>>;

const RESEND_FROM = process.env.RESEND_FROM ?? 'HELIX STAGE <onboarding@resend.dev>';

export type Recipient = { email: string; name?: string | null };

export function personalize(text: string, r: Recipient): string {
  const name = (r.name ?? '').trim();
  return text
    .replace(/\{\{\s*name\s*\}\}/g, name)
    .replace(/\{\{\s*email\s*\}\}/g, r.email);
}

/**
 * האם *הבעלים של הקמפיין* רשאי לשלוח לסגמנט הזה.
 * נגזר מ-campaign.owner_id ולא מהקורא, כדי שגם הקרון (שאין לו משתמש מחובר)
 * יאכוף בדיוק את אותם כללים כמו השליחה הידנית.
 */
export async function isCampaignSegmentAllowed(
  admin: Admin,
  campaign: Record<string, unknown>
): Promise<boolean> {
  const ownerId = campaign.owner_id as string | undefined;
  if (!ownerId) return false;
  const segment = campaign.segment as string;

  // 'all' = כל רשימת התפוצה. רק אדמין גלובלי.
  if (segment === 'all') {
    const { data: prof } = await admin
      .from('profiles')
      .select('is_admin')
      .eq('id', ownerId)
      .maybeSingle();
    return Boolean(prof?.is_admin);
  }

  // רשימת המתנה של מוצר — רק בעל המוצר.
  if (segment === 'product_waitlist') {
    if (!campaign.product_id) return false;
    const { data: p } = await admin
      .from('products')
      .select('id')
      .eq('id', campaign.product_id as string)
      .eq('owner_id', ownerId)
      .maybeSingle();
    return Boolean(p);
  }

  // אנשי הקשר של הבעלים עצמו — מותר. כל סגמנט אחר נדחה.
  return segment === 'my_contacts';
}

// בניית נמענים לקמפיין (admin client, לפי owner_id שבקמפיין)
export async function buildRecipients(
  admin: Admin,
  campaign: Record<string, unknown>
): Promise<Recipient[]> {
  const seg = campaign.segment as string;
  const ownerId = campaign.owner_id as string;

  if (seg === 'all') {
    let q = admin.from('newsletter_subscribers').select('email, name').is('unsubscribed_at', null);
    if (campaign.locale_filter) q = q.eq('locale', campaign.locale_filter as string);
    const { data } = await q.limit(5000);
    return (data ?? []) as Recipient[];
  }
  if (seg === 'my_contacts') {
    let q = admin.from('contacts').select('email, name').eq('owner_id', ownerId).is('unsubscribed_at', null);
    if (campaign.tag_filter) q = q.contains('tags', [campaign.tag_filter as string]);
    const { data } = await q.limit(5000);
    return (data ?? []) as Recipient[];
  }
  // product_waitlist
  const { data: wl } = await admin
    .from('waitlist_signups')
    .select('email')
    .eq('product_id', campaign.product_id as string)
    .limit(5000);
  const { data: unsub } = await admin
    .from('newsletter_subscribers')
    .select('email')
    .not('unsubscribed_at', 'is', null);
  const blocked = new Set((unsub ?? []).map((u: { email: string }) => u.email));
  const seen = new Set<string>();
  const out: Recipient[] = [];
  for (const r of (wl ?? []) as { email: string }[]) {
    if (blocked.has(r.email) || seen.has(r.email)) continue;
    seen.add(r.email);
    out.push({ email: r.email });
  }
  return out;
}

/**
 * שליחת קמפיין בפועל. מחזיר כמות שנשלחה, או -1 אם הבעלים לא מורשה לסגמנט
 * (הקמפיין מסומן 'blocked' ולא נשלח).
 */
export async function deliverCampaign(
  admin: Admin,
  campaign: Record<string, unknown>,
  locale: string
): Promise<number> {
  const campaignId = campaign.id as string;

  if (!(await isCampaignSegmentAllowed(admin, campaign))) {
    await admin.from('email_campaigns').update({ status: 'blocked' }).eq('id', campaignId);
    return -1;
  }

  const recipients = await buildRecipients(admin, campaign);
  if (recipients.length === 0) {
    await admin
      .from('email_campaigns')
      .update({ status: 'sent', recipients: 0, sent_at: new Date().toISOString() })
      .eq('id', campaignId);
    return 0;
  }
  await admin.from('email_campaigns').update({ status: 'sending' }).eq('id', campaignId);
  const resend = new Resend(process.env.RESEND_API_KEY!);
  const from = campaign.from_email
    ? `${campaign.from_name} <${campaign.from_email}>`
    : RESEND_FROM;
  const unsubLabel = locale === 'en' ? 'Unsubscribe' : 'הסרה מרשימת התפוצה';

  let sent = 0;
  for (const r of recipients) {
    try {
      const { data: send } = await admin
        .from('email_sends')
        .insert({ campaign_id: campaignId, email: r.email })
        .select('id')
        .single();
      if (!send) continue;
      const html = buildEmailHtml({
        bodyHtml: personalize(campaign.body_html as string, r),
        sendId: send.id,
        subject: campaign.subject as string,
        unsubscribeLabel: unsubLabel,
      });
      await resend.emails.send({ from, to: r.email, subject: personalize(campaign.subject as string, r), html });
      sent++;
    } catch {
      // ממשיכים
    }
  }
  await admin
    .from('email_campaigns')
    .update({ status: 'sent', sent_at: new Date().toISOString(), recipients: sent })
    .eq('id', campaignId);
  return sent;
}
