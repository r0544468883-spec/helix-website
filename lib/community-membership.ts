import 'server-only';

// Community perk: members get UNLIMITED free-tool runs. Each *-usage.ts calls
// this at the top of countUses — if the email is a community member, 0 uses are
// counted, so the quota is never hit.
//
// SAFE BY DEFAULT: returns false instantly unless BOTH COMMUNITY_MEMBERSHIP_URL
// and COMMUNITY_MEMBERSHIP_SECRET are set, so wiring it in changes nothing on the
// live site until the community app is deployed and these env vars are added.
// Fails closed (false) on any error, with a short timeout, so it can never block
// or slow a tool run meaningfully.
export async function isCommunityMember(email: string): Promise<boolean> {
  const url = process.env.COMMUNITY_MEMBERSHIP_URL; // e.g. https://community.helix.co.il/api/membership
  const secret = process.env.COMMUNITY_MEMBERSHIP_SECRET;
  if (!url || !secret || !email) return false;
  try {
    const res = await fetch(`${url}?email=${encodeURIComponent(email)}`, {
      headers: { 'x-membership-secret': secret },
      signal: AbortSignal.timeout(2500),
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { member?: boolean };
    return data.member === true;
  } catch {
    return false;
  }
}
