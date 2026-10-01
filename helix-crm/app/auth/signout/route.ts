import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { locales, defaultLocale } from '@/lib/i18n';
import { LEGACY_COOKIE_DOMAIN } from '@/lib/supabase/cookie-options';
import { publicOrigin } from '@/lib/public-origin';

export const dynamic = 'force-dynamic';

// התנתקות. חייבת להיות בצד שרת: signOut מהדפדפן מנקה רק את העוגייה ה-host-only
// ומשאיר סשן חי על .helix.co.il — התנתקות שמדווחת הצלחה בזמן שהסשן שורד.
// כאן משתמשים באותו createClient (ולכן באותם cookieOptions) שכתב אותה.
export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: 'global' });

  const url = new URL(request.url);
  const seg = url.searchParams.get('locale') ?? '';
  const locale = locales.includes(seg as (typeof locales)[number]) ? seg : defaultLocale;

  // url.origin כאן הוא כתובת ה-bind הפנימית של הקונטיינר. ראה lib/public-origin.ts.
  const response = NextResponse.redirect(new URL(`/${locale}/login`, publicOrigin(request)), {
    status: 303,
  });

  // ניקוי כפולות שנכתבו בעבר על .helix.co.il — signOut מוחק לפי שם ב-scope
  // הנוכחי בלבד ולא מגיע אליהן.
  for (const c of request.headers.get('cookie')?.split(';') ?? []) {
    const name = c.split('=')[0]?.trim();
    if (name?.startsWith('sb-')) {
      response.cookies.set(name, '', { domain: LEGACY_COOKIE_DOMAIN, path: '/', maxAge: 0 });
    }
  }

  return response;
}
