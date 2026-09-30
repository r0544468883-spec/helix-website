import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import { getDict } from '@/lib/i18n';
import { googleAuth, listPeople, markLapsed } from '@/lib/crm-google';
import { toRows, type GPerson } from '@/lib/crm-google-map';
import { workspaceMatchKeys } from '@/lib/crm-contact-keys';
import CrmGoogleImport from '@/components/CrmGoogleImport';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

/**
 * Picking Google contacts to import. Reads up to 2,000 from the connected account
 * (10 seconds at most), marks anyone already in the workspace, and hands the list
 * to the picker. Only roles that can write get here with a list.
 * See DESIGN.md §8 — Google import list. openspec: crm-connect-google-and-make, decision 5.
 */
export default async function GoogleImportPage({ params }: { params: Params }) {
  const { locale } = await params;
  const tc = getDict(locale).crm;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 pt-20 text-center"><p className="text-ink-secondary">{tc.setupPending}</p></div>;
  }

  const shell = (body: React.ReactNode) => (
    <div className="max-w-[760px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <Link href={`/${locale}/dashboard/crm/connections`} className="text-brand-ink text-[14px] font-semibold">← {tc.connTitle}</Link>
      <h1 className="font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight mt-3">{tc.gImpTitle}</h1>
      <p className="text-ink-secondary text-[15px] mb-6">{tc.gImpSubtitle}</p>
      {body}
    </div>
  );
  const notice = (text: string, retry = false) => shell(
    <div className="bg-surface border border-border rounded-xl px-4 py-3">
      <p role="status" className="text-ink-secondary text-[14px]">{text}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {retry && (
          <Link href={`/${locale}/dashboard/crm/connections/google/import`} className="inline-flex items-center border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 rounded-[10px] text-[14px] min-h-[44px]">
            {tc.gImpRetry}
          </Link>
        )}
        <Link href={`/${locale}/dashboard/crm/connections`} className="inline-flex items-center text-brand-ink font-semibold text-[14px] min-h-[44px] px-1">{tc.gToConnections}</Link>
      </div>
    </div>,
  );

  if (!canWrite(ws.role)) return notice(tc.gImpReadonly);
  const admin = createAdminClient();
  if (!admin) return notice(tc.gImpFailed, true);
  const g = await googleAuth(admin, ws.workspaceId);
  if (!g.ok) {
    if (g.reason === 'lapsed') return notice(tc.gLapsedNotice);
    if (g.reason === 'unavailable') return notice(tc.gImpFailed, true);
    return notice(tc.gNotConnectedNotice);
  }
  const list = await listPeople(g.auth);
  if (!list.ok) {
    if (list.lapsed) {
      await markLapsed(admin, ws.workspaceId, 'invalid_grant');
      return notice(tc.gLapsedNotice);
    }
    return notice(tc.gImpFailed, true);
  }
  const keys = await workspaceMatchKeys(supabase, ws.workspaceId);
  const rows = toRows(list.people as GPerson[], keys, locale);

  return shell(<CrmGoogleImport locale={locale} rows={rows} truncated={list.truncated} t={tc} />);
}
