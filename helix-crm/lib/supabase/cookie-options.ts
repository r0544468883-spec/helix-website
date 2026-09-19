import type { CookieOptions } from '@supabase/ssr';

// מקור אמת יחיד ל-scope של עוגיות הסשן.
//
// קודם ה-domain הוזרק ידנית רק ב-server.ts, בזמן ש-middleware.ts ו-client.ts
// כתבו בלי domain. התוצאה הייתה שתי עוגיות באותו שם בשני scopes: הדפדפן קרא
// את הראשונה בצנצנת (זו עם ה-domain) אבל כתב את ה-host-only, והשרת בדיוק הפוך.
// מכיוון ש-refresh token מתחלף בסיבוב וחד-פעמי, צד אחד הציג טוקן שכבר נוצל
// וה-סשן נפל. וזה לא מתקן את עצמו: מחיקת עוגייה ב-@supabase/ssr היא לפי שם
// בלבד ונושאת את ה-scope של מקום הקריאה, אז אף צד לא יכול למחוק את הכפולה
// של הצד השני.
//
// לכן: אובייקט אחד שעובר לשלושת המפעלים (browser, server, middleware), והספרייה
// מחזיקה את ה-scope במקום קוד ידני.
//
// ה-domain נשאר host-only במכוון. עוגיית Supabase היא בהכרח httpOnly:false
// (הקליינט בדפדפן חייב לקרוא אותה), אז הרחבה ל-.helix.co.il הייתה חושפת את
// טוקן ה-CRM ל-document.cookie בכל תת-דומיין — כולל אתר השיווק. אף אפליקציה
// לא צורכת את העוגייה הזו היום, אז זה מחיר בלי תמורה.
export const cookieOptions: CookieOptions = {
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

// שמות ה-scopes שאליהם נכתבו בעבר עוגיות sb-*, לטאטוא חד-פעמי.
// אפשר להסיר את זה (ואת השימוש ב-middleware) אחרי כמה שבועות בפרודקשן.
export const LEGACY_COOKIE_DOMAIN = '.helix.co.il';
