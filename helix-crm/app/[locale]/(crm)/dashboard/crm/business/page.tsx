import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace, isAdminRole } from '@/lib/crm-workspace';
import { getDict } from '@/lib/i18n';
import { businessFrom } from '@/lib/crm-business';
import CrmBusinessForm from '@/components/CrmBusinessForm';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

// What a quote carries about the business. An admin edits; every other role reads.
// See DESIGN.md — Business details.
export default async function CrmBusinessPage({ params }: { params: Params }) {
  const { locale } = await params;
  const tc = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 pt-20 text-center"><p className="text-ink-secondary">{tc.setupPending}</p></div>;
  }

  // Read with the service role once the workspace is known: the same path the
  // actions write through. A read that fails shows the empty defaults.
  const admin = createAdminClient();
  const row = admin ? (await admin.from('crm_workspaces').select('business').eq('id', ws.workspaceId).maybeSingle()).data : null;
  const business = businessFrom(row?.business);

  return (
    <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <h1 className="font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight">{tc.businessTitle}</h1>
      <p className="text-ink-secondary text-[15px] mb-8">{tc.businessSubtitle}</p>
      <CrmBusinessForm locale={locale} initial={business} canEdit={isAdminRole(ws.role)} t={tc} />
    </div>
  );
}
