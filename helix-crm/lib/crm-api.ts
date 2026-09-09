// ה-API המאובטח של ה-CRM — אימות מפתחות, scopes, ו-rate-limit.
// אבטחה: המפתח הגולמי לעולם לא נשמר; שומרים רק את ה-SHA-256 שלו.
import crypto from 'node:crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export const API_SCOPES = [
  'contacts:read',
  'contacts:write',
  'deals:read',
  'deals:write',
  'activities:write',
] as const;
export type ApiScope = (typeof API_SCOPES)[number];

const SCOPE_SET = new Set<string>(API_SCOPES);
export function isScope(s: string): s is ApiScope {
  return SCOPE_SET.has(s);
}

export function hashKey(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/** מפתח חדש: hxk_live_<32 תווים url-safe>. מוחזר פעם אחת בלבד. */
export function generateKey(): { raw: string; hash: string; prefix: string } {
  const rand = crypto.randomBytes(24).toString('base64url');
  const raw = `hxk_live_${rand}`;
  return { raw, hash: hashKey(raw), prefix: raw.slice(0, 16) };
}

export type ApiAuth = { workspaceId: string; scopes: string[]; keyId: string };

/** מאמת Authorization: Bearer hxk_… → workspace + scopes. null אם לא תקין/מבוטל. */
export async function authApiKey(req: Request): Promise<ApiAuth | null> {
  const header = req.headers.get('authorization') || '';
  const m = header.match(/^Bearer\s+(hxk_[A-Za-z0-9_-]+)$/);
  if (!m) return null;
  const admin = createAdminClient();
  if (!admin) return null;
  const hash = hashKey(m[1]);
  const { data } = await admin
    .from('crm_api_keys')
    .select('id, workspace_id, scopes, revoked_at')
    .eq('key_hash', hash)
    .maybeSingle();
  if (!data || data.revoked_at) return null;
  // עדכון last_used בלי לחכות
  void admin.from('crm_api_keys').update({ last_used_at: new Date().toISOString() }).eq('id', data.id);
  return {
    workspaceId: data.workspace_id as string,
    scopes: (data.scopes as string[]) ?? [],
    keyId: data.id as string,
  };
}

export function hasScope(auth: ApiAuth, scope: ApiScope): boolean {
  return auth.scopes.includes(scope);
}

// rate-limit best-effort בזיכרון (per-key). serverless מאפס — שכבת הגנה, לא ערובה.
const BUCKET = new Map<string, { count: number; reset: number }>();
export function rateLimit(keyId: string, limit = 120, windowMs = 60_000): boolean {
  const now = Date.now();
  const e = BUCKET.get(keyId);
  if (!e || now > e.reset) {
    BUCKET.set(keyId, { count: 1, reset: now + windowMs });
    return true;
  }
  if (e.count >= limit) return false;
  e.count++;
  return true;
}
