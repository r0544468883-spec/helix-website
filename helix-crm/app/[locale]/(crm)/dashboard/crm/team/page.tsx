import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace, listAccessibleWorkspaces, isAdminRole, canInvite, offeredInviteRoles, canManageInvite } from '@/lib/crm-workspace';
import { getDict } from '@/lib/i18n';
import CrmTeamManager, { type TeamInvite } from '@/components/CrmTeamManager';
import { inviteState, type InviteStateRow } from '@/lib/crm-invite-state';
import { refreshDeliveries } from '@/lib/crm-invite-delivery';
import CrmClientWorkspaces from '@/components/CrmClientWorkspaces';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

export default async function CrmTeamPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = getDict(locale);
  const tc = t.crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 pt-20 text-center"><p className="text-ink-secondary">{tc.setupPending}</p></div>;
  }

  const admin = createAdminClient();
  let members: { user_id: string; role: string; name: string; email: string }[] = [];
  let invites: TeamInvite[] = [];
  if (admin) {
    const { data: m } = await admin.from('crm_members').select('role, user_id, profiles(name, username, email)').eq('workspace_id', ws.workspaceId);
    members = (m ?? []).map((r: Record<string, unknown>) => {
      const p = (Array.isArray(r.profiles) ? r.profiles[0] : r.profiles) as { name: string | null; username: string | null; email: string | null } | null;
      return { user_id: r.user_id as string, role: r.role as string, name: p?.name ?? p?.username ?? '—', email: p?.email ?? '' };
    });
    // An admin's visit asks Resend what happened to unsettled invite emails
    // (bounded: 3 lookups, 3 seconds), then every invite shows one state.
    if (canInvite(ws.role)) await refreshDeliveries(admin, ws.workspaceId);
    const { data: inv } = await admin.from('crm_invites')
      .select('id, email, role, invited_by, created_at, expires_at, last_sent_at, last_error, email_id, delivery')
      .eq('workspace_id', ws.workspaceId).order('created_at', { ascending: true });
    const now = new Date();
    invites = ((inv ?? []) as (InviteStateRow & { id: string; email: string; role: string; invited_by: string | null })[]).map((r) => ({
      id: r.id, email: r.email, role: r.role, state: inviteState(r, now, locale, tc),
      // An admin manages every invite; a member, the ones they sent (crm-multi-workspace).
      canManage: canManageInvite(ws.role, r.invited_by, user.id),
    }));
  }

  // Client workspaces: only an admin of a workspace that is not itself a client
  // adds them (a client can't hold clients; the action refuses it too).
  const workspaces = await listAccessibleWorkspaces({ id: user.id });
  const isClientWorkspace = !!workspaces.find((w) => w.id === ws.workspaceId)?.parentWorkspaceId;
  const canAddClients = isAdminRole(ws.role) && !isClientWorkspace;
  const clients = workspaces
    .filter((w) => w.parentWorkspaceId === ws.workspaceId)
    .map((w) => ({ id: w.id, name: w.name }));

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <Link href={`/${locale}/dashboard/crm`} className="text-brand-ink text-[14px] font-semibold">← {tc.title}</Link>
      <h1 className="font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight mt-3">{tc.teamTitle}</h1>
      <p className="text-ink-secondary text-[15px] mb-8">{tc.teamSubtitle}</p>

      <CrmTeamManager
        locale={locale}
        isAdmin={isAdminRole(ws.role)}
        canInvite={canInvite(ws.role)}
        inviteRoles={offeredInviteRoles(ws.role)}
        currentUserId={user.id}
        members={members}
        invites={invites}
        t={tc}
      />

      {canAddClients && (
        <div className="mt-8">
          <CrmClientWorkspaces locale={locale} clients={clients} t={tc} />
        </div>
      )}
    </div>
  );
}
