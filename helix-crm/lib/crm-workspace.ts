import type { SupabaseClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createAdminClient } from '@/lib/supabase/admin';

import type { Role } from '@/lib/crm-roles';
export * from '@/lib/crm-roles';
export type WorkspaceCtx = { workspaceId: string; role: Role } | null;

export const ACTIVE_WS_COOKIE = 'helix_active_ws';
/** How the active workspace is remembered: httpOnly, for 30 days. */
export const ACTIVE_WS_COOKIE_OPTIONS = { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 30 } as const;

export type Branding = { brand_name?: string; logo_url?: string; primary_color?: string; footer?: string };

/**
 * Effective branding for the user's ACTIVE workspace, with agency inheritance:
 * a client workspace with no branding of its own falls back to the agency's brand.
 * Empty object → the app's default HELIX brand.
 */
export async function getActiveBranding(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<Branding> {
  const ws = await getWorkspace(supabase, user);
  if (!ws) return {};
  const db = createAdminClient() ?? supabase;
  const { data: child } = await db
    .from('crm_workspaces').select('branding, parent_workspace_id').eq('id', ws.workspaceId).maybeSingle();
  let b = (child?.branding ?? {}) as Branding;
  if ((!b || Object.keys(b).length === 0) && child?.parent_workspace_id) {
    const { data: parent } = await db
      .from('crm_workspaces').select('branding').eq('id', child.parent_workspace_id).maybeSingle();
    b = (parent?.branding ?? {}) as Branding;
  }
  return b ?? {};
}

export type AccessibleWorkspace = {
  id: string;
  name: string;
  role: Role;
  isClient: boolean;            // true = a client workspace reached via agency rights
  parentWorkspaceId: string | null;
};

/**
 * Can `userId` act inside workspace `wsId`?
 * True if they are a direct member, OR an admin/agency_admin of its parent agency.
 * Returns the effective role to use, or null if no access.
 */
export async function accessRole(
  admin: SupabaseClient,
  userId: string,
  wsId: string
): Promise<Role | null> {
  const { data: mem } = await admin
    .from('crm_members').select('role').eq('workspace_id', wsId).eq('user_id', userId).maybeSingle();
  if (mem) return mem.role as Role;

  // agency path: is the caller an admin of this workspace's parent?
  const { data: ws } = await admin
    .from('crm_workspaces').select('parent_workspace_id').eq('id', wsId).maybeSingle();
  if (ws?.parent_workspace_id) {
    const { data: pmem } = await admin
      .from('crm_members').select('role')
      .eq('workspace_id', ws.parent_workspace_id).eq('user_id', userId)
      .in('role', ['admin', 'agency_admin']).maybeSingle();
    if (pmem) return 'agency_admin';
  }
  return null;
}

/**
 * Resolve the CRM workspace for the current STAGE user, honoring an agency's
 * "active workspace" selection:
 * 1) if the active-workspace cookie is set AND the user may act there → use it
 * 2) else already a member → return their home workspace
 * 3) else pending invite for their email → join it (claim)
 * 4) else none → null: the CRM home offers "workspace חדש" (crm-multi-workspace)
 * Workspace/member writes go through service_role (secure, no RLS recursion).
 */
export async function getWorkspace(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<WorkspaceCtx> {
  const admin = createAdminClient();

  // (1) honor an explicit active-workspace selection, if authorized
  if (admin) {
    const active = (await cookies()).get(ACTIVE_WS_COOKIE)?.value;
    if (active) {
      const role = await accessRole(admin, user.id, active);
      if (role) return { workspaceId: active, role };
      // stale/unauthorized cookie → fall through to the home workspace
    }
  }

  // (2) home membership (oldest)
  const { data: mem } = await supabase
    .from('crm_members')
    .select('workspace_id, role')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (mem) return { workspaceId: mem.workspace_id as string, role: mem.role as Role };

  if (!admin) return null;

  // (3) no workspace yet: claim the oldest pending invite for this address.
  const claimed = await claimInvite(admin, user);
  if (claimed) return claimed;

  // (4) אין חברות ואין הזמנה → אין workspace.
  // קודם נוצר כאן workspace חדש שבו המשתמש הוא admin, כלומר כל מי שהצליח
  // להתחבר קיבל דריסת רגל בפרודקשן. המערכת בהזמנה בלבד.
  return null;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Claims one pending invite for `user`: the one named by `inviteId` (an invite
 * email's link, openspec: crm-multi-workspace), or else their oldest. Only an
 * unexpired invite addressed to the user's own address is ever claimed, so an
 * edited id can't reach another address's invite. The membership insert ignores
 * a duplicate, so someone already on that team keeps the role they have; the
 * invite is removed either way. Returns the workspace and the role now held there.
 */
export async function claimInvite(
  admin: SupabaseClient,
  user: { id: string; email?: string | null },
  inviteId?: string | null,
): Promise<WorkspaceCtx> {
  // eq ולא ilike: postgrest-js לא בורח מתווי LIKE, אז מייל שנרשם עם _ או %
  // היה משמש כתבנית ותובע הזמנה שנשלחה לכתובת אחרת (dana_cohen תופס את
  // dana.cohen). התאמת המייל היא כל ההרשאה להצטרף ל-tenant, אז היא חייבת
  // להיות שוויון מדויק. הנרמול ל-lowercase נשען על האינדקס lower(email) מ-v14.
  const email = user.email?.trim().toLowerCase();
  if (!email) return null;
  if (inviteId != null && !UUID_RE.test(inviteId)) return null;
  const now = new Date().toISOString();
  const { data: inv } = inviteId
    ? await admin.from('crm_invites').select('id, workspace_id, role')
      .eq('id', inviteId).eq('email', email).gt('expires_at', now).maybeSingle()
    : await admin.from('crm_invites').select('id, workspace_id, role')
      .eq('email', email).gt('expires_at', now)
      .order('created_at', { ascending: true }).limit(1).maybeSingle();
  if (!inv) return null;

  const { error } = await admin.from('crm_members').upsert(
    { workspace_id: inv.workspace_id, user_id: user.id, role: inv.role },
    { onConflict: 'workspace_id,user_id', ignoreDuplicates: true },
  );
  if (error) return null;
  await admin.from('crm_invites').delete().eq('id', inv.id);
  const { data: mem } = await admin.from('crm_members').select('role')
    .eq('workspace_id', inv.workspace_id).eq('user_id', user.id).maybeSingle();
  return { workspaceId: inv.workspace_id as string, role: ((mem?.role ?? inv.role) as Role) };
}

/**
 * Every workspace the user can act in: their own memberships + every CLIENT
 * workspace under any agency where they are admin/agency_admin. Powers the
 * workspace switcher. Uses service_role so the agency→client join isn't blocked
 * by RLS; access itself is still derived from the user's real memberships.
 */
export async function listAccessibleWorkspaces(
  user: { id: string }
): Promise<AccessibleWorkspace[]> {
  const admin = createAdminClient();
  if (!admin) return [];

  const { data: mems } = await admin
    .from('crm_members').select('workspace_id, role').eq('user_id', user.id);
  const memberByWs = new Map<string, Role>();
  for (const m of mems ?? []) memberByWs.set(m.workspace_id as string, m.role as Role);

  // agencies where the user is admin/agency_admin → pull their client workspaces
  const agencyIds = (mems ?? [])
    .filter((m) => m.role === 'admin' || m.role === 'agency_admin')
    .map((m) => m.workspace_id as string);

  const out = new Map<string, AccessibleWorkspace>();

  // direct memberships
  if (memberByWs.size) {
    const { data: own } = await admin
      .from('crm_workspaces').select('id, name, parent_workspace_id')
      .in('id', [...memberByWs.keys()]);
    for (const w of own ?? [])
      out.set(w.id as string, {
        id: w.id as string, name: (w.name as string) || 'ה-CRM שלי',
        role: memberByWs.get(w.id as string)!, isClient: false,
        parentWorkspaceId: (w.parent_workspace_id as string) ?? null,
      });
  }

  // client workspaces under managed agencies
  if (agencyIds.length) {
    const { data: clients } = await admin
      .from('crm_workspaces').select('id, name, parent_workspace_id')
      .in('parent_workspace_id', agencyIds);
    for (const w of clients ?? [])
      if (!out.has(w.id as string))
        out.set(w.id as string, {
          id: w.id as string, name: (w.name as string) || 'לקוח',
          role: 'agency_admin', isClient: true,
          parentWorkspaceId: (w.parent_workspace_id as string) ?? null,
        });
  }

  return [...out.values()];
}
