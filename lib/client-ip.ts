import 'server-only';

// Derives the client IP from x-forwarded-for.
//
// NEVER take entry [0]: Google's load balancer APPENDS to this header, it does
// not replace it, so the first entry is whatever the caller chose to send and
// every IP-keyed rate limit is bypassable by rotating it.
//
// How many trailing entries to skip depends on the topology:
//   Cloud Run, direct        -> "<caller-supplied…>, <client>"        hops = 1
//   Cloud Run behind an LB   -> "<caller-supplied…>, <client>, <lb>"  hops = 2
// Default 1. After the first App Hosting deploy, log the FULL header once and
// set XFF_TRUSTED_HOPS=2 if the last entry is a Google infrastructure address.
export function clientIp(req: Request): string {
  const parts = (req.headers.get('x-forwarded-for') || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return 'unknown';
  const hops = Math.max(1, Number(process.env.XFF_TRUSTED_HOPS) || 1);
  return parts[Math.max(0, parts.length - hops)] ?? parts[parts.length - 1];
}
