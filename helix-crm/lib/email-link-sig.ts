import { createHmac, timingSafeEqual } from 'node:crypto';

// חתימה על יעד ההפניה בקישורי מעקב ההקלקות.
//
// בלי זה /api/email/click?u=https://attacker.example הוא open redirect פתוח על
// הדומיין הממותג — פרימיטיב פישינג מוכן שמכוון בדיוק לאנשים שסומכים על
// crm.helix.co.il, ומלבין קישורים דרך מסננים שמאשרים helix.co.il.
//
// המפתח נגזר מ-DIGEST_SECRET כדי לא לדרוש סוד חדש ב-Secret Manager. אם הוא
// חסר, verifyLinkSig מחזיר false וההפניה נופלת לאתר עצמו.
function key(): string | null {
  return process.env.EMAIL_LINK_SECRET ?? process.env.DIGEST_SECRET ?? null;
}

export function signLink(url: string): string {
  const k = key();
  if (!k) return '';
  return createHmac('sha256', k).update(url).digest('base64url').slice(0, 32);
}

export function verifyLinkSig(url: string, sig: string | null): boolean {
  if (!sig) return false;
  const expected = signLink(url);
  if (!expected) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
