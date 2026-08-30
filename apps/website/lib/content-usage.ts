import 'server-only';

// Free-usage metering for /free-tools/content. Counts billable uses (build post /
// write-or-rewrite email) per email in Supabase (content_tool_usage). After FREE_LIMIT
// the tool is gated behind an upgrade to HELIX OPS. Degrades to "unlimited" when Supabase
// isn't configured (localhost dev), so the tool still works without a DB.

export const FREE_LIMIT = 4;
export const ANALYZE_LIMIT = 20;
/** Sentinel: the count is UNKNOWABLE. Never treat this as "0 uses consumed". */
export const UNKNOWN_USES = -1;

const baseUrl = () => process.env.SUPABASE_URL;
const serviceKey = () => process.env.SUPABASE_SERVICE_KEY;

/**
 * Billable uses already consumed by this email, optionally filtered by mode.
 * Returns UNKNOWN_USES when the count cannot be established (Supabase unconfigured
 * or unreachable) in production, callers MUST deny billable work on that value,
 * or the quota fails open and the paid Claude modes are free for everyone. On
 * localhost it still returns 0 so the tool works without a DB.
 */
export async function countUses(email: string, modes?: string[]): Promise<number> {
  const base = baseUrl(), key = serviceKey();
  if (!email) return UNKNOWN_USES;
  if (!base || !key) {
    if (process.env.NODE_ENV === 'production') {
      console.error('content-usage: SUPABASE_* unset, free quota cannot be enforced');
      return UNKNOWN_USES;
    }
    return 0; // local dev only
  }
  const filter = modes?.length ? `&mode=in.(${modes.map(encodeURIComponent).join(',')})` : '';
  try {
    const url = `${base.replace(/\/$/, '')}/rest/v1/content_tool_usage?email=eq.${encodeURIComponent(email)}${filter}&select=id`;
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`supabase ${res.status}`); // a 401 used to parse as [] and fail open
    const cr = res.headers.get('content-range'); // e.g. "0-0/12"
    if (cr && cr.includes('/')) {
      const n = parseInt(cr.split('/')[1], 10);
      if (!Number.isNaN(n)) return n;
    }
    const arr = await res.json();
    if (!Array.isArray(arr)) throw new Error('unexpected body');
    return arr.length;
  } catch (err) {
    console.error('content-usage: countUses failed', err);
    return UNKNOWN_USES;
  }
}

/** Uses left before the paywall, or null when the count is unknowable. */
export async function remainingUses(email: string): Promise<number | null> {
  const used = await countUses(email, ['build', 'email']);
  return used === UNKNOWN_USES ? null : Math.max(0, FREE_LIMIT - used);
}

/** Record one billable use. No-op if DB not configured. */
export async function recordUse(email: string, mode: string): Promise<void> {
  const base = baseUrl(), key = serviceKey();
  if (!base || !key || !email) return;
  try {
    await fetch(`${base.replace(/\/$/, '')}/rest/v1/content_tool_usage`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ email, mode }),
      signal: AbortSignal.timeout(5000),
    });
  } catch {
    /* best-effort */
  }
}
