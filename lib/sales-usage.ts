import 'server-only';

// Free-usage metering for /free-tools/sales. Counts runs per email in Supabase (reuses the
// content_tool_usage table with mode='sales'). Each run is two paid Claude calls (maker +
// critic), so the free limit is low. Degrades to "unlimited" on localhost (no Supabase).
// Same UNKNOWN_USES fail-closed discipline as content-usage.ts / differentiation-usage.ts.

export const FREE_LIMIT = 2;
export const MODE = 'sales';
export const UNKNOWN_USES = -1;

const baseUrl = () => process.env.SUPABASE_URL;
const serviceKey = () => process.env.SUPABASE_SERVICE_KEY;

export async function countUses(email: string): Promise<number> {
  const base = baseUrl(), key = serviceKey();
  if (!email) return UNKNOWN_USES;
  if (!base || !key) {
    if (process.env.NODE_ENV === 'production') {
      console.error('sales-usage: SUPABASE_* unset, free quota cannot be enforced');
      return UNKNOWN_USES;
    }
    return 0; // local dev only
  }
  try {
    const url = `${base.replace(/\/$/, '')}/rest/v1/content_tool_usage?email=eq.${encodeURIComponent(email)}&mode=eq.${MODE}&select=id`;
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Prefer: 'count=exact', Range: '0-0' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`supabase ${res.status}`);
    const cr = res.headers.get('content-range');
    if (cr && cr.includes('/')) {
      const n = parseInt(cr.split('/')[1], 10);
      if (!Number.isNaN(n)) return n;
    }
    const arr = await res.json();
    if (!Array.isArray(arr)) throw new Error('unexpected body');
    return arr.length;
  } catch (err) {
    console.error('sales-usage: countUses failed', err);
    return UNKNOWN_USES;
  }
}

export async function remainingUses(email: string): Promise<number | null> {
  const used = await countUses(email);
  return used === UNKNOWN_USES ? null : Math.max(0, FREE_LIMIT - used);
}

export async function recordUse(email: string): Promise<void> {
  const base = baseUrl(), key = serviceKey();
  if (!base || !key || !email) return;
  try {
    await fetch(`${base.replace(/\/$/, '')}/rest/v1/content_tool_usage`, {
      method: 'POST',
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
      body: JSON.stringify({ email, mode: MODE }),
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error('sales-usage: recordUse failed', err);
  }
}
