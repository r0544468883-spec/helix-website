import 'server-only';

// Per-IP rate limiting for the unauthenticated endpoints that send mail.
//
// Every route used to hand-roll this with its own Map and its own constants,
// which meant a route that grew a Resend call later (community-register,
// content-lead) silently shipped without one.
//
// The counter lives in the instance's memory, so it is per Cloud Run instance
// and resets on cold start. That is enough to stop a script hammering one
// endpoint; it is not a defence against a distributed flood, and it should not
// be mistaken for one.
const buckets = new Map<string, Map<string, { count: number; at: number }>>();

/**
 * Returns true when this IP has exceeded `max` requests in `windowMs` for the
 * given bucket. Separate buckets do not share a budget.
 */
export function rateLimited(bucket: string, ip: string, max: number, windowMs = 60 * 1000): boolean {
  let hits = buckets.get(bucket);
  if (!hits) {
    hits = new Map();
    buckets.set(bucket, hits);
  }
  const now = Date.now();
  const cur = hits.get(ip);
  if (!cur || now - cur.at > windowMs) {
    // Opportunistic sweep so a long-lived instance does not accumulate an entry
    // per IP forever.
    if (hits.size > 5000) {
      for (const [k, v] of hits) if (now - v.at > windowMs) hits.delete(k);
    }
    hits.set(ip, { count: 1, at: now });
    return false;
  }
  cur.count += 1;
  return cur.count > max;
}
