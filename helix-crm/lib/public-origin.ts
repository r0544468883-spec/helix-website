/**
 * מקור אמת יחיד ל-origin הציבורי של בקשה נכנסת.
 *
 * ב-Firebase App Hosting, `new URL(request.url).origin` בתוך Route Handler
 * מחזיר את כתובת ההאזנה הפנימית של הקונטיינר — https://0.0.0.0:8080 — ולא את
 * הדומיין שהמשתמש ביקש. כל redirect שנבנה ממנו שלח את המשתמש לכתובת מתה:
 * הקישור מהמייל ומסלול גוגל שניהם חוזרים ל-/auth/callback, ומשם הופנו ל-
 * https://0.0.0.0:8080/he/login. ההתחברות עצמה הצליחה, רק הצעד האחרון נשלח
 * לשום מקום.
 *
 * ה-middleware לא נפגע כי NextRequest.nextUrl כן נבנה מה-headers של ה-proxy,
 * ולכן /he/dashboard דווקא הפנה נכון ל-crm.helix.co.il/he/login. זה מה שהסתיר
 * את התקלה: חלק מההפניות עבדו.
 *
 * סדר העדיפויות:
 *   1. x-forwarded-host — מה ש-envoy באמת קיבל. נכון גם בכתובת ה-*.run.app של
 *      rollout טרי, שם הצמדה לדומיין הקבוע הייתה שולחת את המשתמש להוסט אחר
 *      מזה שכתב את עוגיית ה-PKCE code verifier, וההתחברות הייתה נכשלת שוב.
 *   2. host — הדפדפן פונה ישירות, כלומר dev מקומי.
 *   3. NEXT_PUBLIC_SITE_URL — כשה-headers חסרים או מצביעים על כתובת bind.
 */

// כתובות האזנה של התהליך. הן אף פעם לא ה-host שהדפדפן ביקש.
const BIND_ADDRESS = /^(0\.0\.0\.0|\[::\]|\[::0\])(:\d+)?$/;

function canonicalUrl(): URL | null {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return null;
  try {
    return new URL(raw);
  } catch {
    return null;
  }
}

// ה-host מה-headers הוא קלט מהלקוח, אז הוא נבדק מול allowlist לפני שהוא נכנס
// ל-Location. בלי זה `Host: evil.com` היה מייצר open redirect.
function isTrusted(host: string, canonical: URL): boolean {
  const bare = host.split(':')[0].toLowerCase();
  if (bare === 'localhost' || bare === '127.0.0.1' || bare === '[::1]') return true;
  if (bare.endsWith('.run.app') || bare.endsWith('.hosted.app')) return true;
  return bare === canonical.hostname.toLowerCase();
}

function fromHeaders(headers: Headers): string | null {
  const forwarded = headers.get('x-forwarded-host');
  const host = (forwarded ?? headers.get('host') ?? '').split(',')[0].trim();
  const canonical = canonicalUrl();

  if (host && !BIND_ADDRESS.test(host)) {
    // בלי NEXT_PUBLIC_SITE_URL אין מול מה לאמת, אז ה-header עדיף על כתובת
    // bind: הפניה לדומיין לא נכון לפחות מגיעה לדפדפן, 0.0.0.0 לא.
    if (!canonical || isTrusted(host, canonical)) {
      const proto =
        headers.get('x-forwarded-proto')?.split(',')[0]?.trim() ??
        (/^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(host) ? 'http' : 'https');
      return `${proto}://${host}`;
    }
  }

  return canonical ? canonical.origin : null;
}

export function publicOrigin(request: Request): string {
  // אין דרך טובה יותר — עדיף origin שגוי מאשר לזרוק ב-new URL().
  return fromHeaders(request.headers) ?? new URL(request.url).origin;
}

/**
 * אותם כללים לקוד שיש לו headers ואין לו Request: server actions, שבונים
 * קישורים למייל ולווטסאפ. מחזיר מחרוזת ריקה רק כשאין לא header שימושי ולא
 * NEXT_PUBLIC_SITE_URL.
 */
export function publicOriginFromHeaders(headers: Headers): string {
  return fromHeaders(headers) ?? '';
}
