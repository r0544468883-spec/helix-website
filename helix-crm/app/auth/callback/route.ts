import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { locales, defaultLocale } from '@/lib/i18n';
import { publicOrigin } from '@/lib/public-origin';

/**
 * ?next= מגיע משורת הכתובת, אז הוא לא נאמן.
 * `${origin}${next}` נראה בטוח כי origin מוצמד מלפנים, אבל next='@evil.com'
 * נותן https://crm.helix.co.il@evil.com — כל מה שלפני ה-@ הוא userinfo,
 * וה-host הוא evil.com. מקבלים רק נתיב יחסי אמיתי.
 */
function safeNext(next: string | null): string {
  // התו השני הוא מה שקובע: '/' או '\\' אחרי ה-'/' הראשון הופכים את המשך
  // המחרוזת ל-authority אצל ה-parser של הדפדפן. תווי בקרה ורווחים נחתכים
  // לפני הפענוח, אז '/\tevil.com' מגיע כ-'/evil.com' — לא פרצה, אבל גם לא
  // נתיב שמישהו התכוון אליו.
  if (!next || !/^\/[^/\\]/.test(next) || /[\x00-\x20\x7f]/.test(next)) return `/${defaultLocale}`;
  return next;
}

function localeOf(next: string): string {
  const seg = next.split('/')[1];
  return locales.includes(seg as (typeof locales)[number]) ? seg : defaultLocale;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  // לא new URL(request.url).origin — ב-App Hosting הוא https://0.0.0.0:8080.
  // ראה lib/public-origin.ts.
  const origin = publicOrigin(request);
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
