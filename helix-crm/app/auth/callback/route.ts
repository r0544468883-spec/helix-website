import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { locales, defaultLocale } from '@/lib/i18n';

/**
 * ?next= מגיע משורת הכתובת, אז הוא לא נאמן.
 * `${origin}${next}` נראה בטוח כי origin מוצמד מלפנים, אבל next='@evil.com'
 * נותן https://crm.helix.co.il@evil.com — כל מה שלפני ה-@ הוא userinfo,
 * וה-host הוא evil.com. מקבלים רק נתיב יחסי אמיתי.
 */
function safeNext(next: string | null): string {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return `/${defaultLocale}`;
  return next;
}

function localeOf(next: string): string {
  const seg = next.split('/')[1];
  return locales.includes(seg as (typeof locales)[number]) ? seg : defaultLocale;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = safeNext(searchParams.get('next'));
  const locale = localeOf(next);

  const fail = (reason: string) =>
    NextResponse.redirect(`${origin}/${locale}/login?error=${encodeURIComponent(reason)}`);

  // OAuth שבוטל/נדחה חוזר עם ?error= ובלי code. קודם זה נפל בשקט להפניה
  // כאילו הכל תקין.
  const providerError = searchParams.get('error');
  if (providerError) {
    console.error('[auth/callback] provider error', providerError, searchParams.get('error_description'));
    return fail(providerError === 'access_denied' ? 'denied' : 'generic');
  }
  if (!code) return fail('generic');

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // הסיבה הנפוצה ביותר: הקישור נפתח בדפדפן אחר מזה שביקש אותו, אז עוגיית
    // ה-PKCE code verifier לא קיימת כאן. גם prefetch של סורק קישורים במייל
    // צורך את הקוד החד-פעמי לפני שמישהו לוחץ.
    console.error('[auth/callback] exchange failed', error.code ?? error.name, error.message);
    const missingVerifier = /verifier/i.test(error.message) || error.code === 'validation_failed';
    return fail(missingVerifier ? 'same_browser' : 'expired');
  }

  // לוגין ראשון (או משתמש ותיק לפני v2) → אונבורדינג
  const userId = data?.session?.user?.id;
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();
    if (profile && !profile.onboarding_completed) {
      return NextResponse.redirect(`${origin}/${locale}/onboarding`);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
