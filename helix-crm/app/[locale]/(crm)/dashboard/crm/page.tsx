import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { scoreTier } from '@/lib/crm-score';
import { getWorkspace, listAccessibleWorkspaces, canWrite } from '@/lib/crm-workspace';
import CrmAddContact from '@/components/CrmAddContact';
import CrmDealBoard from '@/components/CrmDealBoard';
import CrmHeaderMenu from '@/components/CrmHeaderMenu';
import CrmContactList from '@/components/CrmContactList';
import CrmWorkspaceSwitcher from '@/components/CrmWorkspaceSwitcher';
import CrmContactDrawer, { type DrawerContact } from '@/components/CrmContactDrawer';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<{ c?: string }>;

// How many contacts the board loads. Above this the list discloses that it is capped.
const CONTACT_LIMIT = 200;
// A malformed id must not reach Postgres as a uuid comparison.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CrmPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  const { c: openId } = await searchParams;
  const t = getDict(locale);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return (
      <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 text-center">
        <p className="text-ink-secondary">{t.crm.setupPending}</p>
      </div>
    );
  }

  const [{ data: contactsData, count: contactCount }, { data: dealsData }, { data: companiesData }] = await Promise.all([
    supabase.from('crm_contacts').select('id, full_name, email, role_title, status, score, company_id, crm_companies(name)', { count: 'exact' }).eq('workspace_id', ws.workspaceId).order('score', { ascending: false }).limit(CONTACT_LIMIT),
    supabase.from('crm_deals').select('id, title, value, currency, stage, status, contact_id, crm_contacts(full_name)').eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(200),
    supabase.from('crm_companies').select('id, name').eq('workspace_id', ws.workspaceId).order('name'),
  ]);

  const contacts = (contactsData ?? []).map((c: Record<string, unknown>) => ({
    ...c,
    company: Array.isArray(c.crm_companies) ? (c.crm_companies[0] as { name: string } | undefined)?.name : (c.crm_companies as { name: string } | null)?.name,
  })) as {
    id: string; full_name: string; email: string | null; role_title: string | null;
    status: string; score: number; company?: string;
  }[];

  const deals = (dealsData ?? []).map((d: Record<string, unknown>) => ({
    ...d,
    contactName: Array.isArray(d.crm_contacts) ? (d.crm_contacts[0] as { full_name: string } | undefined)?.full_name : (d.crm_contacts as { full_name: string } | null)?.full_name,
  })) as { id: string; title: string; value: number; currency: string; stage: string; status: string; contactName?: string }[];

  const companies = (companiesData ?? []) as { id: string; name: string }[];
  const tc = t.crm;
  const readOnly = !canWrite(ws.role);

  // ?c=<id> opens a contact beside the list. Rendered here, on the server, so the
  // workspace check lives in one place and back/forward work for free.
  let drawerContact: DrawerContact | null = null;
  let drawerMissing = false;
  if (openId) {
    if (!UUID_RE.test(openId)) {
      drawerMissing = true;
    } else {
      const { data: one } = await supabase
        .from('crm_contacts')
        .select('id, full_name, role_title, email, phone, linkedin_url, status, score, crm_companies(name)')
        .eq('id', openId).eq('workspace_id', ws.workspaceId).maybeSingle();
      if (!one) {
        drawerMissing = true;
      } else {
        const [{ data: dls }, { data: acts }] = await Promise.all([
          supabase.from('crm_deals').select('id, title, value, stage, status').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }),
          supabase.from('crm_activities').select('id, type, body, created_at').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(50),
        ]);
        const cRel = one.crm_companies as unknown;
        drawerContact = {
          id: one.id as string,
          full_name: one.full_name as string,
          role_title: (one.role_title as string) ?? null,
          company: (Array.isArray(cRel) ? (cRel[0] as { name: string } | undefined)?.name : (cRel as { name: string } | null)?.name) ?? null,
          email: (one.email as string) ?? null,
          phone: (one.phone as string) ?? null,
          linkedin_url: (one.linkedin_url as string) ?? null,
          status: one.status as string,
          score: one.score as number,
          deals: (dls ?? []) as DrawerContact['deals'],
          activities: (acts ?? []) as DrawerContact['activities'],
        };
      }
    }
  }
  const workspaces = await listAccessibleWorkspaces({ id: user.id });

  // דשבורד CRM — מדדים
  const hotCount = contacts.filter((c) => scoreTier(c.score) === 'hot').length;
  const openDeals = deals.filter((d) => d.status === 'open');
  const openValue = openDeals.reduce((a, d) => a + (d.value || 0), 0);
  const won = deals.filter((d) => d.status === 'won');
  const wonValue = won.reduce((a, d) => a + (d.value || 0), 0);
  const lostCount = deals.filter((d) => d.status === 'lost').length;
  const winRate = won.length + lostCount > 0 ? Math.round((won.length / (won.length + lostCount)) * 100) : 0;
  const stats = [
    { label: tc.mLeads, value: contacts.length },
    { label: tc.mHot, value: hotCount, accent: true },
    { label: tc.mOpenValue, value: `₪${openValue.toLocaleString()}` },
    { label: tc.mWon, value: `₪${wonValue.toLocaleString()}` },
    { label: tc.mWinRate, value: `${winRate}%` },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <h1 className="font-display text-[clamp(28px,5vw,40px)] font-extrabold tracking-tight">{tc.title}</h1>
        <div className="flex items-center gap-2">
          <CrmWorkspaceSwitcher
            locale={locale}
            workspaces={workspaces}
            activeId={ws.workspaceId}
            canManage={ws.role === 'admin' || ws.role === 'agency_admin'}
          />
          <CrmHeaderMenu locale={locale} t={tc} />
          {!readOnly && <CrmAddContact locale={locale} companies={companies} t={tc} />}
        </div>
      </div>
      <p className="text-ink-secondary text-[15px] mb-8">{tc.subtitle}</p>

      {readOnly && (
        <p role="status" className="text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.readonlyNotice}</p>
      )}

      {drawerMissing && (
        <p role="status" className="text-ink-muted text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.contactNotFound}</p>
      )}

      {/* דשבורד — מדדים */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-12">
        {stats.map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-2xl p-4 text-center">
            <div className={`font-mono text-[24px] font-bold ${s.accent ? 'text-brand' : 'text-ink'}`}>
              {typeof s.value === 'number' ? s.value.toLocaleString() : s.value}
            </div>
            <div className="text-[12px] text-ink-secondary mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* לידים מתועדפים */}
      <div className="mb-12">
        <h2 className="font-bold text-[18px] mb-1">{tc.prioritized}</h2>
        <p className="text-ink-muted text-[12px] mb-4">{tc.prioritizedHint}</p>
        <CrmContactList
          locale={locale}
          contacts={contacts.map((c) => ({
            id: c.id,
            full_name: c.full_name,
            email: c.email,
            role_title: c.role_title,
            status: c.status,
            score: c.score,
            company: c.company,
          }))}
          capped={(contactCount ?? 0) > CONTACT_LIMIT}
          t={tc}
        />
      </div>

      {/* צינור עסקאות */}
      <div>
        <h2 className="font-bold text-[18px] mb-4">{tc.pipeline}</h2>
        <CrmDealBoard locale={locale} deals={deals} contacts={contacts.map((c) => ({ id: c.id, name: c.full_name }))} readOnly={readOnly} t={tc} />
      </div>

      <CrmContactDrawer locale={locale} contact={drawerContact} readOnly={readOnly} t={tc} />
    </div>
  );
}
