#!/usr/bin/env node
// מפיק את ה-hash של קוד גישה לאיזור האישי, בדיוק כמו lib/portal.ts hashCode().
// שימוש:
//   PORTAL_CODE_SALT="<הסאלט מ-Secret Manager>" node scripts/portal-hash.mjs <code> <slug> "<name>"
// דוגמה:
//   PORTAL_CODE_SALT="s3cr3t" node scripts/portal-hash.mjs YOSSI-7X2Q brilliant-loan "משרד הייעוץ של יוסי ראובן"
import { createHash } from 'node:crypto';

const [, , code, slug = '<slug>', name = '<name>'] = process.argv;
const salt = process.env.PORTAL_CODE_SALT || '';

if (!code) {
  console.error('usage: PORTAL_CODE_SALT=... node scripts/portal-hash.mjs <code> <slug> "<name>"');
  process.exit(1);
}
if (!salt) {
  console.error('⚠  PORTAL_CODE_SALT ריק. חייב להיות זהה לערך ב-Secret Manager, אחרת הקוד לא יאומת.');
  process.exit(1);
}

const hash = createHash('sha256').update(`${salt}:${code.trim()}`).digest('hex');

console.log('\nhash:', hash, '\n');
console.log('-- SQL לזריעת הלקוח (להריץ ב-Supabase SQL Editor):');
console.log(
  `insert into public.portal_clients (name, slug, access_code_hash)\n` +
    `values ('${name.replace(/'/g, "''")}', '${slug}', '${hash}')\n` +
    `on conflict (slug) do update set access_code_hash = excluded.access_code_hash, name = excluded.name;\n`,
);
console.log(`-- ואז להעלות קבצים ל: client-files/${slug}/<filename>  (שטוח)\n`);
