import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import CrmNewWorkspaceForm from '@/components/CrmNewWorkspaceForm';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

/**
 * "workspace חדש" from the side menu: a workspace of your own, whatever role you
 * hold where you are now. It needs a signed-in user and nothing else.
 * See DESIGN.md §8 — New workspace form. openspec: crm-multi-workspace.
 */
export default async function NewWorkspacePage({ params }: { params: Params }) {
  const { locale } = await params;
  const tc = getDict(locale).crm;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);

  return (
    <div className="max-w-[640px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <Link href={`/${locale}/dashboard/crm`} className="text-brand-ink text-[14px] font-semibold">← {tc.title}</Link>
      <h1 className="font-display text-[clamp(26px,4vw,36px)] font-extrabold tracking-tight mt-3">{tc.wsNewTitle}</h1>
      <p className="text-ink-secondary text-[15px] mb-8">{tc.wsNewSubtitle}</p>
      <div className="bg-surface border border-border rounded-2xl p-5">
        <CrmNewWorkspaceForm locale={locale} t={tc} />
      </div>
    </div>
  );
}
