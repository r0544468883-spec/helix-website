import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict, plural } from '@/lib/i18n';
import { relativeDays } from '@/lib/crm-dates';
import { loadDrawerContact } from '@/lib/crm-drawer';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import CrmCompanyList, { type CompanyRow } from '@/components/CrmCompanyList';
import CrmAddCompany from '@/components/CrmAddCompany';
import CrmContactDrawer from '@/components/CrmContactDrawer';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<{ c?: string }>;

// What the screen loads. Far above today's volume (the contacts list loads 200),
// and said out loud when the companies run past theirs.
const COMPANY_LIMIT = 500;
const PEOPLE_LIMIT = 2000;
const DEAL_LIMIT = 1000;

type Person = { id: string; full_name: string; status: string; score: number; company_id: string; last_activity_at: string | null };
type Deal = { id: string; title: string; value: number | string | null; stage: string; status: string; contact_id: string | null; company_id: string | null };

/**
 * Companies: every company in the workspace with its people, open deals and last
 * activity. Grouped here, on the server, so counts and times have one clock; the
 * list opens a company in place (crm-sidebar-four-screens, option a). A deal is a
 * company's when it names the company, or when its person belongs to it. See
 * DESIGN.md — Companies list.
 */
export default async function CrmCompaniesPage({ params, searchParams }: { params: Params; searchParams: Search }) {
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

  const [coRes, peopleRes, dealsRes] = await Promise.all([
    // One more than the limit, to know there are more.
    supabase.from('crm_companies').select('id, name').eq('workspace_id', ws.workspaceId).order('name').limit(COMPANY_LIMIT + 1),
    supabase.from('crm_contacts').select('id, full_name, status, score, company_id, last_activity_at')
      .eq('workspace_id', ws.workspaceId).not('company_id', 'is', null).order('score', { ascending: false }).limit(PEOPLE_LIMIT),
    supabase.from('crm_deals').select('id, title, value, stage, status, contact_id, company_id')
      .eq('workspace_id', ws.workspaceId).in('status', ['open', 'won']).order('created_at', { ascending: false }).limit(DEAL_LIMIT),
  ]);
  // A count built on a failed lookup would read as a real zero, so any failure is
  // said once, in place of the list.
  const loadFailed = !!(coRes.error || peopleRes.error || dealsRes.error);
  if (loadFailed) console.error('[crm companies]', coRes.error?.message ?? peopleRes.error?.message ?? dealsRes.error?.message);

  const all = (coRes.data ?? []) as { id: string; name: string }[];
  const capped = all.length > COMPANY_LIMIT;
  const companies = all.slice(0, COMPANY_LIMIT);
  // The drawer's company field needs every company; past the limit it loads its own.
  const drawer = await loadDrawerContact({ supabase, ws, openId, locale, companies: capped ? undefined : companies });

  const people = (peopleRes.data ?? []) as Person[];
  const deals = (dealsRes.data ?? []) as Deal[];
  const companyOf = new Map(people.map((p) => [p.id, p.company_id]));
  const peopleBy = new Map<string, Person[]>();
  for (const p of people) peopleBy.set(p.company_id, [...(peopleBy.get(p.company_id) ?? []), p]);
  const dealsBy = new Map<string, Deal[]>();
  for (const d of deals) {
    const cid = d.company_id ?? (d.contact_id ? companyOf.get(d.contact_id) : undefined);
    if (cid) dealsBy.set(cid, [...(dealsBy.get(cid) ?? []), d]);
  }

  // Money as "12,000" on both renders, whatever the browser's locale.
  const money = (v: number) => v.toLocaleString('en-US');
  const valueOf = (d: Deal) => Number(d.value) || 0;
  const stageText = (d: Deal) =>
    d.status === 'won' ? tc.dealWonLabel : ((tc[`st_${d.stage}` as keyof typeof tc] as string) ?? d.stage);

  const built = companies.map((c) => {
    const ps = peopleBy.get(c.id) ?? [];   // already most promising first
    const ds = dealsBy.get(c.id) ?? [];
    const open = ds.filter((d) => d.status === 'open');
    const won = ds.filter((d) => d.status === 'won');
    const lastAt = ps.reduce<string | null>((m, p) => (p.last_activity_at && (!m || Date.parse(p.last_activity_at) > Date.parse(m)) ? p.last_activity_at : m), null);
    const row: CompanyRow = {
      id: c.id,
      name: c.name,
      people: ps.map((p) => ({ id: p.id, name: p.full_name, status: p.status })),
      deals: [...open, ...won].map((d) => ({
        id: d.id, title: d.title, contactId: d.contact_id,
        stageText: stageText(d), valueText: valueOf(d) > 0 ? `₪${money(valueOf(d))}` : null,
      })),
      // Hebrew agreement: "איש קשר אחד", "שני אנשי קשר", never "1 אנשי קשר".
      peopleText: ps.length > 0
        ? plural(locale, ps.length, { one: tc.figContactsOne, two: tc.figContactsTwo, other: tc.figContacts })
        : tc.coNone,
      dealsText: open.length > 0
        ? plural(locale, open.length, { one: tc.coDealsOne, two: tc.coDealsTwo, other: tc.coDealsOther })
            .replace('{v}', money(open.reduce((a, d) => a + valueOf(d), 0)))
        : tc.coNone,
      lastActivity: relativeDays(lastAt, locale, tc.neverTouched),
    };
    return { row, at: lastAt ? Date.parse(lastAt) : null };
  });
  // Most recent activity first; companies with none last, by name.
  const collator = new Intl.Collator(locale === 'en' ? 'en' : 'he');
  built.sort((a, b) => {
    if (a.at !== null && b.at !== null && a.at !== b.at) return b.at - a.at;
    if (a.at !== null && b.at === null) return -1;
    if (a.at === null && b.at !== null) return 1;
    return collator.compare(a.row.name, b.row.name);
  });

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-[20px] font-extrabold tracking-tight">{tc.navCompanies}</h1>
        {!readOnly && <CrmAddCompany locale={locale} t={tc} />}
      </div>

      <div className="mt-6">
        {readOnly && (
          <p role="status" className="text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.readonlyNotice}</p>
        )}
        {drawer.missing && (
          <p role="status" className="text-ink-muted text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.contactNotFound}</p>
        )}
        {loadFailed ? (
          <p role="alert" className="text-ink-secondary text-[15px]">{tc.coLoadFailed}</p>
        ) : (
          <>
            {capped && <p className="text-ink-muted text-[12px] mb-3">{tc.coCapped}</p>}
            <CrmCompanyList companies={built.map((b) => b.row)} readOnly={readOnly} locale={locale} t={tc} />
          </>
        )}
      </div>

      <CrmContactDrawer locale={locale} contact={drawer.contact} companies={drawer.companies} readOnly={readOnly} t={tc} />
    </div>
  );
}
