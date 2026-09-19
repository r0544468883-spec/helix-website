import { timingSafeEqual } from 'node:crypto';

// אימות נתיבי הקרון (/api/digest, /api/email/run-scheduled).
//
// כותרת Authorization בלבד — לא ?secret= בשורת הכתובת, שנוחתת בלוגי Cloud Run,
// בלוגי פרוקסי, בהיסטוריית דפדפן ובכותרות Referer. שורת לוג אחת שדלפה נותנת
// לתוקף להפעיל את הדיוור ההמוני מתי שירצה.
//
// כל נתיב מקבל סוד משלו; DIGEST_SECRET נשאר כברירת מחדל לתאימות לאחור עד
// שיוגדרו סודות נפרדים ב-Secret Manager.
export function checkCronSecret(request: Request, secret: string | undefined): boolean {
  const expected = secret ?? process.env.DIGEST_SECRET;
  if (!expected) return false; // נכשל סגור כשלא מוגדר סוד

  const header = request.headers.get('authorization') ?? '';
  const m = header.match(/^Bearer\s+(.+)$/);
  if (!m) return false;

  const provided = Buffer.from(m[1]);
  const target = Buffer.from(expected);
  // timingSafeEqual דורש אורך זהה, אז משווים אורך קודם (לא סודי).
  if (provided.length !== target.length) return false;
  return timingSafeEqual(provided, target);
}
