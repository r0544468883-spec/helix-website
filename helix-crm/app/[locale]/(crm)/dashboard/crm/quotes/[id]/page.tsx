import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import { getDict } from '@/lib/i18n';
import { businessFrom } from '@/lib/crm-business';
import type { QuoteLine } from '@/lib/crm-quote';
import CrmQuoteEditor from '@/components/CrmQuoteEditor';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string; id: string }>;

// A malformed id must not reach Postgres as a uuid comparison.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * A draft quote, edited beside the document it becomes. A sent quote has no editor:
 * its address opens its page. A quote from another workspace reads as not found.
 * See DESIGN.md — Quote editor.
 */
export default async function QuoteEditorPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const tc = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 pt-20 text-center"><p className="text-ink-secondary">{tc.setupPending}</p></div>;
  }

  const notFoundNotice = (
    <div className="max-w-[680px] mx-auto px-5 pt-20 text-center">
      <p role="status" className="text-ink-secondary">{tc.quoteNotFound}</p>
    </div>
  );
  if (!UUID_RE.test(id)) return notFoundNotice;

  const { data: q } = await supabase.from('crm_quotes')
    .select('id, contact_id, deal_id, status, locale, subject, items, notes, valid_until, public_token')
    .eq('id', id).eq('workspace_id', ws.workspaceId).maybeSingle();
  if (!q || !q.contact_id) return notFoundNotice;
  if (q.status !== 'draft') redirect(`/${q.locale}/q/${q.public_token}`);

  const [{ data: contact }, { data: deals }] = await Promise.all([
    supabase.from('crm_contacts').select('id, full_name, phone, status, crm_companies(name)')
      .eq('id', q.contact_id).eq('workspace_id', ws.workspaceId).maybeSingle(),
    supabase.from('crm_deals').select('id, title, value')
      .eq('contact_id', q.contact_id).eq('workspace_id', ws.workspaceId).eq('status', 'open')
      .order('created_at', { ascending: false }),
  ]);
  if (!contact) return notFoundNotice;

  const admin = createAdminClient();
  const bizRow = admin ? (await admin.from('crm_workspaces').select('business').eq('id', ws.workspaceId).maybeSingle()).data : null;
  const cRel = contact.crm_companies as unknown;
  const company = (Array.isArray(cRel) ? (cRel[0] as { name: string } | undefined)?.name : (cRel as { name: string } | null)?.name) ?? null;

  return (
    <CrmQuoteEditor
      locale={locale}
      quote={{
        id: q.id as string,
        locale: q.locale === 'en' ? 'en' : 'he',
        token: q.public_token as string,
        deal_id: (q.deal_id as string) ?? null,
        subject: (q.subject as string) ?? '',
        items: ((q.items ?? []) as QuoteLine[]),
        notes: (q.notes as string) ?? '',
        valid_until: (q.valid_until as string) ?? null,
      }}
      contact={{
        id: contact.id as string,
        full_name: contact.full_name as string,
        phone: (contact.phone as string) ?? null,
        status: contact.status as string,
        company,
      }}
      deals={((deals ?? []) as { id: string; title: string; value: number }[])}
      business={businessFrom(bizRow?.business)}
      readOnly={!canWrite(ws.role)}
      t={tc}
    />
  );
}
