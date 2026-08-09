import 'server-only';

// Free-usage metering for /free-tools/content. Counts billable uses (build post /
// write-or-rewrite email) per email in Supabase (content_tool_usage). After FREE_LIMIT
// the tool is gated behind an upgrade to HELIX OPS. Degrades to "unlimited" when Supabase
// isn't configured (localhost dev), so the tool still works without a DB.

export const FREE_LIMIT = 4;

const baseUrl = () => process.env.SUPABASE_URL;
const serviceKey = () => process.env.SUPABASE_SERVICE_KEY;

/** How many billable uses this email has already consumed (0 if DB not configured). */
export async function countUses(email: string): Promise<number> {
  const base = baseUrl(), key = serviceKey();
  if (!base || !key || !email) return 0;
  try {
    const url = `${base.replace(/\/$/, '')}/rest/v1/content_tool_usage?email=eq.${encodeURIComponent(email)}&select=id`;
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
    });
    const cr = res.headers.get('content-range'); // e.g. "0-0/12"
    if (cr && cr.includes('/')) {
      const n = parseInt(cr.split('/')[1], 10);
      if (!Number.isNaN(n)) return n;
    }
    const arr = await res.json();
    return Array.isArray(arr) ? arr.length : 0;
  } catch {
    return 0;
  }
}

/** Uses left before the paywall (FREE_LIMIT when DB not configured). */
export async function remainingUses(email: string): Promise<number> {
  return Math.max(0, FREE_LIMIT - (await countUses(email)));
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
    });
  } catch {
    /* best-effort */
  }
}
