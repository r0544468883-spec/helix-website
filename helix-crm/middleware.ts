import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { locales, defaultLocale } from './lib/i18n';
import { cookieOptions } from './lib/supabase/cookie-options';

type CookieToSet = { name: string; value: string; options?: CookieOptions };

// נתיבים שדורשים משתמש מחובר. השמירה קיימת גם בכל דף בנפרד; זו רשת הביטחון
// המבנית, אחרי ש-/dashboard/crm/autonomy נשכח בלי redirect.
const PROTECTED = ['/dashboard', '/chief', '/onboarding', '/submit', '/profile/edit'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ניתובי auth, API וטפסים מוטמעים נשארים בלי locale.
  // /api ו-/embed לא קוראים סשן, אז חוסכים מהם גם את round-trip של getUser.
  if (pathname.startsWith('/api') || pathname.startsWith('/embed')) {
    return NextResponse.next({ request });
  }
  if (pathname.startsWith('/auth')) {
    return handleSession(request, NextResponse.next({ request }));
  }

  // הפניה לשפת ברירת מחדל אם אין locale בנתיב
  const firstSegment = pathname.split('/')[1];
  if (!locales.includes(firstSegment as (typeof locales)[number])) {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
    return NextResponse.redirect(url);
  }

  return handleSession(request, NextResponse.next({ request }), firstSegment);
}

async function handleSession(request: NextRequest, response: NextResponse, locale?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  let supabaseResponse = response;
  const supabase = createServerClient(url, key, {
    // אותו scope כמו server.ts ו-client.ts — ראה lib/supabase/cookie-options.ts.
    cookieOptions,
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // מרענן את הסשן אם פג תוקף. אין קוד בין createServerClient ל-getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (locale) {
    const rest = request.nextUrl.pathname.slice(`/${locale}`.length) || '/';
    if (!user && PROTECTED.some((p) => rest === p || rest.startsWith(`${p}/`))) {
      const login = request.nextUrl.clone();
      login.pathname = `/${locale}/login`;
      login.search = '';
      return NextResponse.redirect(login);
    }
  }

  return supabaseResponse;
}

// הטאטוא של עוגיות ה-.helix.co.il הישנות הוסר מכאן ב-2026-09-19, ואסור
// להחזיר אותו ל-middleware. הוא כתב sb-*='' לתוך response.cookies, ו-Next
// ממזג את x-middleware-set-cookie חזרה לתוך עוגיות ה*בקשה* שמגיעות
// ל-Server Components. התוצאה: כל דף קרא sb-* בלי ערך, getUser() החזיר null,
// וכל דף מוגן עשה redirect ל-login — בזמן שה-middleware עצמו עוד ראה סשן
// תקין, כי הוא קורא את request.cookies לפני הטאטוא. כלומר ההתחברות "הצליחה"
// ומיד נראתה ככישלון. ה-Domain לא הגן: המיזוג קורה בצד השרת.
// אי אפשר לתקן את זה בהדר set-cookie גולמי — בתגובת NextResponse.next()
// הערוץ היחיד שמגיע לדפדפן הוא x-middleware-set-cookie עצמו.
// הניקוי נשאר ב-app/auth/signout/route.ts, שרץ על תגובת redirect ולכן אין
// אחריו Server Component שאפשר להרעיל.

export const config = {
  // סיומת מעוגנת בסוף הנתיב בלבד. הדפוס הקודם (.*\..*) דילג על כל נתיב שמכיל
  // נקודה, כולל slug אמיתי כמו /he/alternatives/next.js — ושם הסשן לא רוענן.
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|.*\\.[^/]+$).*)'],
};
