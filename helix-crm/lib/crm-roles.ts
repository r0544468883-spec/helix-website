// Client-safe: no server imports here, so both server actions and client
// components can read the role set. lib/crm-workspace.ts re-exports all of it.

export type Role = 'admin' | 'member' | 'agency_admin' | 'viewer';

/**
 * Roles an invite or a role change may carry — the v20 check constraint's set.
 * The team screen offers OFFERED_ROLES; agency_admin is normally inherited
 * from a parent agency, but an invite carrying it is valid.
 */
export const ASSIGNABLE_ROLES = ['admin', 'member', 'viewer', 'agency_admin'] as const;
export const OFFERED_ROLES = ['member', 'viewer', 'admin'] as const;
export type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];
export const isAssignableRole = (r: unknown): r is AssignableRole =>
  typeof r === 'string' && (ASSIGNABLE_ROLES as readonly string[]).includes(r);

// Mirrors the v20 RLS policies. RLS is the enforcement; these exist so the app can
// explain a refusal in Hebrew instead of surfacing a policy error.
export const canWrite = (r: Role) => r !== 'viewer';
export const isAdminRole = (r: Role) => r === 'admin' || r === 'agency_admin';

// Who may invite, with which role, and whose invite they may resend or cancel
// (openspec: crm-multi-workspace). A member invites below their own power: never
// an admin. Managing the team itself (roles, removal) stays isAdminRole.
export const canInvite = (r: Role) => r !== 'viewer';

/** The roles an invite from `r` may carry: every assignable role for an admin, member or viewer for a member. */
export function invitableRoles(r: Role): readonly AssignableRole[] {
  if (isAdminRole(r)) return ASSIGNABLE_ROLES;
  if (r === 'member') return ['member', 'viewer'];
  return [];
}

/** What the invite form offers `r`: OFFERED_ROLES, in its order, limited to invitableRoles. */
export function offeredInviteRoles(r: Role): readonly AssignableRole[] {
  const allowed = invitableRoles(r);
  return OFFERED_ROLES.filter((x) => allowed.includes(x));
}

/** Whether `r` (user `userId`) may resend or cancel an invite sent by `invitedBy`. */
export function canManageInvite(r: Role, invitedBy: string | null, userId: string): boolean {
  return isAdminRole(r) || (r === 'member' && invitedBy !== null && invitedBy === userId);
}
