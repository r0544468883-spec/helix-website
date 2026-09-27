import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace } from '@/lib/crm-workspace';
import { getDict } from '@/lib/i18n';
import CrmApiKeys from '@/components/CrmApiKeys';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

export default async function CrmApiPage({ params }: { params: Params }) {
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
  let keys: {
    id: string; name: string; prefix: string; scopes: string[];
    last_used_at: string | null; revoked_at: string | null; created_at: string;
  }[] = [];
  if (admin) {
    const { data } = await admin
      .from('crm_api_keys')
      .select('id, name, prefix, scopes, last_used_at, revoked_at, created_at')
      .eq('workspace_id', ws.workspaceId)
      .order('created_at', { ascending: false });
    keys = (data ?? []) as typeof keys;
  }

  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://helix-stage.vercel.app').replace(/\/$/, '');

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <Link href={`/${locale}/dashboard/crm`} className="text-brand text-[14px] font-semibold">← {tc.title}</Link>
      <h1 className="font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight mt-3">{tc.apiTitle}</h1>
      <p className="text-ink-secondary text-[15px] mb-8">{tc.apiSubtitle}</p>

      <CrmApiKeys locale={locale} isAdmin={ws.role === 'admin'} keys={keys} baseUrl={baseUrl} t={tc} />
    </div>
  );
}
