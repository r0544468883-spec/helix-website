import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { loadDrawerContact } from '@/lib/crm-drawer';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import CrmDealBoard from '@/components/CrmDealBoard';
import CrmAddDeal from '@/components/CrmAddDeal';
import CrmContactDrawer from '@/components/CrmContactDrawer';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<{ c?: string }>;

/**
 * Deals: the pipeline board on a screen of its own, with the one action that adds a
 * deal and the money figures that used to sit on the contacts screen. A card opens
 * its person in the drawer over this screen (?c=<id>). See DESIGN.md — Deals screen.
 */
export default async function CrmDealsPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  const { c: openId } = await searchParams;
  const tc = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  // No workspace yet: the contacts screen offers the form that creates one.
  if (!ws) redirect(`/${locale}/dashboard/crm`);
  const readOnly = !canWrite(ws.role);

  const [{ data: dealsData }, { data: contactsData }, drawer] = await Promise.all([
    supabase.from('crm_deals').select('id, title, value, currency, stage, status, contact_id, crm_contacts(full_name)').eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(200),
    // Who a new deal can be for: the 200 the contacts screen lists, most promising first.
    readOnly
      ? Promise.resolve({ data: [] as { id: string; full_name: string }[] })
      : supabase.from('crm_contacts').select('id, full_name').eq('workspace_id', ws.workspaceId).order('score', { ascending: false }).limit(200),
    loadDrawerContact({ supabase, ws, openId, locale }),
  ]);

  const deals = (dealsData ?? []).map((d: Record<string, unknown>) => ({
    ...d,
    contactName: Array.isArray(d.crm_contacts) ? (d.crm_contacts[0] as { full_name: string } | undefined)?.full_name : (d.crm_contacts as { full_name: string } | null)?.full_name,
  })) as { id: string; title: string; value: number; currency: string; stage: string; status: string; contact_id: string | null; contactName?: string }[];
  const contacts = ((contactsData ?? []) as { id: string; full_name: string }[]).map((c) => ({ id: c.id, name: c.full_name }));

  // One line of money figures. A zero reads like a result, so each figure waits for
  // something to count: open value for an open deal, won value for a won one, and a
  // win rate for a deal that was won or lost. No deals, no line.
  const open = deals.filter((d) => d.status === 'open');
  const won = deals.filter((d) => d.status === 'won');
  const lostCount = deals.filter((d) => d.status === 'lost').length;
  const sum = (ds: typeof deals) => ds.reduce((a, d) => a + (Number(d.value) || 0), 0);
  const figures: string[] = [];
  if (open.length > 0) figures.push(tc.figOpen.replace('{v}', sum(open).toLocaleString()));
  if (won.length > 0) figures.push(tc.figWon.replace('{v}', sum(won).toLocaleString()));
  if (won.length + lostCount > 0) figures.push(tc.figWinRate.replace('{p}', String(Math.round((won.length / (won.length + lostCount)) * 100))));

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-[20px] font-extrabold tracking-tight">{tc.navDeals}</h1>
        {!readOnly && <CrmAddDeal locale={locale} contacts={contacts} t={tc} />}
      </div>
      {figures.length > 0 && (
        <p className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-ink-secondary mt-3">
          {figures.map((f, i) => (
            <span key={i} className="whitespace-nowrap">{i > 0 && <span aria-hidden="true" className="text-ink-soft me-2">·</span>}{f}</span>
          ))}
        </p>
      )}

      <div className="mt-6">
        {readOnly && (
          <p role="status" className="text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.readonlyNotice}</p>
        )}
        {drawer.missing && (
          <p role="status" className="text-ink-muted text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.contactNotFound}</p>
        )}
        <CrmDealBoard locale={locale} deals={deals} readOnly={readOnly} t={tc} />
      </div>

      <CrmContactDrawer locale={locale} contact={drawer.contact} companies={drawer.companies} readOnly={readOnly} t={tc} />
    </div>
  );
}
