import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';

// איזור אישי ללקוחות, יושב על POLICYHUB (ה-CRM של HELIX, פרויקט Supabase נפרד
// rymrafskckljgirrejqu), ביחד עם crm_contacts. אותו דפוס REST/server-only
// /degrade-gracefully של lib/crm-contacts.ts. אין תלות ב-SDK.
// גישה בקוד בלבד (בלי מייל): קוד -> hash -> שורה ב-portal_clients -> קבצים ב-Storage.

const baseUrl = () => process.env.CRM_SUPABASE_URL?.replace(/\/$/, '') || '';
const serviceKey = () => process.env.CRM_SUPABASE_SERVICE_KEY || '';
const codeSalt = () => process.env.PORTAL_CODE_SALT || '';
const sessionSecret = () => process.env.PORTAL_SESSION_SECRET || '';
const BUCKET = 'client-files';

export interface PortalClient {
  id: string;
  name: string;
  slug: string;
}

export interface PortalFile {
  name: string;
  url: string;
  size: number;
  updatedAt?: string;
}

/** sha256(salt + ':' + code). חייב להתאים ל-scripts/portal-hash.mjs. */
export function hashCode(code: string): string {
  return createHash('sha256').update(`${codeSalt()}:${code.trim()}`).digest('hex');
}

/** מאמת קוד גישה מול portal_clients. מחזיר את הלקוח או null. */
export async function verifyAccessCode(code: string): Promise<PortalClient | null> {
  const base = baseUrl();
  const key = serviceKey();
  const trimmed = (code || '').trim();
  if (!base || !key || !trimmed) return null;

  const h = hashCode(trimmed);
  try {
    const res = await fetch(
      `${base}/rest/v1/portal_clients?access_code_hash=eq.${h}&select=id,name,slug&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return null;
    const rows = (await res.json().catch(() => [])) as PortalClient[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

/** מחזיר את הקבצים של הלקוח (שטוח תחת slug/) עם קישורי הורדה חתומים לשעה. */
export async function listClientFiles(slug: string): Promise<PortalFile[]> {
  const base = baseUrl();
  const key = serviceKey();
  if (!base || !key || !slug) return [];

  let objects: Array<{ name: string; metadata?: { size?: number }; updated_at?: string }> = [];
  try {
    const listRes = await fetch(`${base}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ prefix: `${slug}/`, limit: 100, sortBy: { column: 'name', order: 'asc' } }),
      signal: AbortSignal.timeout(5000),
    });
    if (!listRes.ok) return [];
    objects = await listRes.json().catch(() => []);
  } catch {
    return [];
  }

  const files: PortalFile[] = [];
  for (const o of objects) {
    if (!o?.name || o.name.endsWith('/') || o.metadata == null) continue; // דלג על "תיקיות"
    const path = `${slug}/${o.name}`;
    try {
      const signRes = await fetch(`${base}/storage/v1/object/sign/${BUCKET}/${encodeURI(path)}`, {
        method: 'POST',
        headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ expiresIn: 3600 }),
        signal: AbortSignal.timeout(5000),
      });
      if (!signRes.ok) continue;
      const signed = (await signRes.json().catch(() => ({}))) as { signedURL?: string };
      if (signed.signedURL) {
        // &download=<name> גורם ל-Supabase להחזיר Content-Disposition: attachment,
        // כך שהקישור מוריד קובץ (גם חוצה-מקור) במקום להיפתח בטאב.
        files.push({
          name: o.name,
          url: `${base}/storage/v1${signed.signedURL}&download=${encodeURIComponent(o.name)}`,
          size: o.metadata?.size ?? 0,
          updatedAt: o.updated_at,
        });
      }
    } catch {
      /* best-effort: דלג על קובץ שנכשל */
    }
  }
  return files;
}

/** חותם ערך session (slug) ל-cookie httpOnly. */
export function signSession(slug: string): string {
  const mac = createHmac('sha256', sessionSecret()).update(slug).digest('base64url');
  return `${slug}.${mac}`;
}

/** מאמת את ה-cookie ומחזיר את ה-slug, או null אם מזויף. */
export function verifySession(token?: string | null): string | null {
  if (!token) return null;
  const i = token.lastIndexOf('.');
  if (i <= 0) return null;
  const slug = token.slice(0, i);
  const mac = token.slice(i + 1);
  const expected = createHmac('sha256', sessionSecret()).update(slug).digest('base64url');
  try {
    const a = Buffer.from(mac);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return slug;
}
