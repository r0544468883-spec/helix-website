// העשרה קלה מבוססת-דומיין — בלי API חיצוני. מהמייל גוזרים את החברה ומסמנים
// עסקי מול אישי. נותן ליזם לדעת *מי* נרשם (חברות אמיתיות = אות B2B חזק).

const PERSONAL = new Set([
  'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'hotmail.com', 'outlook.com',
  'live.com', 'msn.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 'proton.me',
  'protonmail.com', 'gmx.com', 'gmx.net', 'zoho.com', 'yandex.com',
  'walla.com', 'walla.co.il', '012.net.il', 'bezeqint.net', 'nana.co.il', 'hotmail.co.il',
]);

export function enrichEmail(email: string): { domain: string; isBusiness: boolean; company: string } {
  const at = email.lastIndexOf('@');
  const domain = at >= 0 ? email.slice(at + 1).toLowerCase().trim() : '';
  if (!domain) return { domain: '', isBusiness: false, company: '' };
  const isBusiness = !PERSONAL.has(domain);
  // שם חברה מהדומיין: מסירים סיומת ולוקחים את החלק המשמעותי (acme.co.il -> Acme)
  const base = domain
    .replace(/\.(com|co|net|org|io|ai|app|dev|tech|xyz|me)(\.[a-z]{2})?$/i, '')
    .split('.')
    .filter(Boolean)
    .pop() || domain;
  const company = isBusiness && base ? base.charAt(0).toUpperCase() + base.slice(1) : '';
  return { domain, isBusiness, company };
}
