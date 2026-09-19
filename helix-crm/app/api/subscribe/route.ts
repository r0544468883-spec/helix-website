import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { rateLimit } from '@/lib/crm-api';

export const dynamic = 'force-dynamic';

// הרשמה ציבורית מטופס מוטמע: מוסיף איש קשר לרשימה של היזם לפי subscribe_token.
// הטוקן הוא הרשאת כתיבה לרשימת אנשי הקשר של מישהו, אז מ-v18 הוא יושב
// ב-profile_subscribe_tokens (deny-all, service_role בלבד) ולא בעמודה
// שכל אחד עם המפתח הפומבי היה יכול לקרוא.
export async function POST(request: Request) {
  try {
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    if (!rateLimit(`subscribe:${ip}`, 10, 60_000)) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }

    const body = await request.json().catch(() => ({}));
    const token = body.token as string | undefined;
    const email = (body.email as string | undefined)?.trim().toLowerCase();
    const name = (body.name as string | undefined)?.trim() || null;

    if (!token || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 });
    }
    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ error: 'config' }, { status: 500 });

    const { data: owner } = await admin
      .from('profile_subscribe_tokens')
      .select('profile_id')
      .eq('token', token)
      .maybeSingle();
    if (!owner) return NextResponse.json({ error: 'notfound' }, { status: 404 });

    await admin
      .from('contacts')
      .upsert(
        { owner_id: owner.profile_id, email, name, source: 'form' },
        { onConflict: 'owner_id,email', ignoreDuplicates: true }
      );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'failed' }, { status: 200 });
  }
}
