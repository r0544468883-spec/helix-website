import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace } from '@/lib/crm-workspace';
import { getDict } from '@/lib/i18n';
import CrmTeamManager from '@/components/CrmTeamManager';

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
  let invites: { id: string; email: string; role: string }[] = [];
  if (admin) {
    const { data: m } = await admin.from('crm_members').select('role, user_id, profiles(name, username, email)').eq('workspace_id', ws.workspaceId);
    members = (m ?? []).map((r: Record<string, unknown>) => {
      const p = (Array.isArray(r.profiles) ? r.profiles[0] : r.profiles) as { name: string | null; username: string | null; email: string | null } | null;
      return { user_id: r.user_id as string, role: r.role as string, name: p?.name ?? p?.username ?? '—', email: p?.email ?? '' };
    });
    const { data: inv } = await admin.from('crm_invites').select('id, email, role').eq('workspace_id', ws.workspaceId);
    invites = (inv ?? []) as { id: string; email: string; role: string }[];
  }

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <Link href={`/${locale}/dashboard/crm`} className="text-brand text-[14px] font-semibold">← {tc.title}</Link>
      <h1 className="font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight mt-3">{tc.teamTitle}</h1>
      <p className="text-ink-secondary text-[15px] mb-8">{tc.teamSubtitle}</p>

      <CrmTeamManager
        locale={locale}
        isAdmin={ws.role === 'admin'}
        currentUserId={user.id}
        members={members}
        invites={invites}
        t={tc}
      />
    </div>
  );
}
