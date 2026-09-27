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
