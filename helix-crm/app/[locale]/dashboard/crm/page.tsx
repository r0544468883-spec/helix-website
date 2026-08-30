import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { scoreTier } from '@/lib/crm-score';
import { getWorkspace, listAccessibleWorkspaces } from '@/lib/crm-workspace';
import CrmAddContact from '@/components/CrmAddContact';
import CrmDealBoard from '@/components/CrmDealBoard';
import CrmWorkspaceSwitcher from '@/components/CrmWorkspaceSwitcher';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

const TIER_STYLE: Record<string, string> = {
  hot: 'bg-brand/15 text-brand',
  warm: 'bg-yellow-500/15 text-yellow-500',
  cold: 'bg-white/5 text-ink-muted',
};

export default async function CrmPage({ params }: { params: Params }) {
  const { locale } = await params;
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

  const [{ data: contactsData }, { data: dealsData }, { data: companiesData }] = await Promise.all([
    supabase.from('crm_contacts').select('id, full_name, email, role_title, lifecycle_stage, lead_status, score, company_id, crm_companies(name)').eq('workspace_id', ws.workspaceId).order('score', { ascending: false }).limit(200),
    supabase.from('crm_deals').select('id, title, value, currency, stage, status, contact_id, crm_contacts(full_name)').eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(200),
    supabase.from('crm_companies').select('id, name').eq('workspace_id', ws.workspaceId).order('name'),
  ]);

  const contacts = (contactsData ?? []).map((c: Record<string, unknown>) => ({
    ...c,
    company: Array.isArray(c.crm_companies) ? (c.crm_companies[0] as { name: string } | undefined)?.name : (c.crm_companies as { name: string } | null)?.name,
  })) as {
    id: string; full_name: string; email: string | null; role_title: string | null;
    lifecycle_stage: string; lead_status: string; score: number; company?: string;
  }[];

  const deals = (dealsData ?? []).map((d: Record<string, unknown>) => ({
    ...d,
    contactName: Array.isArray(d.crm_contacts) ? (d.crm_contacts[0] as { full_name: string } | undefined)?.full_name : (d.crm_contacts as { full_name: string } | null)?.full_name,
  })) as { id: string; title: string; value: number; currency: string; stage: string; status: string; contactName?: string }[];

  const companies = (companiesData ?? []) as { id: string; name: string }[];
  const tc = t.crm;
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
          <Link href={`/${locale}/dashboard/automations`} className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors">
            אוטומציות
          </Link>
          <Link href={`/${locale}/dashboard/crm/api`} className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors">
            {tc.apiLink}
          </Link>
          <Link href={`/${locale}/dashboard/crm/team`} className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 py-2.5 rounded-[10px] transition-colors">
            {tc.team}
          </Link>
          <CrmAddContact locale={locale} companies={companies} t={tc} />
        </div>
      </div>
      <p className="text-ink-secondary text-[15px] mb-8">{tc.subtitle}</p>

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
        {contacts.length === 0 ? (
          <p className="text-ink-muted text-[15px]">{tc.emptyContacts}</p>
        ) : (
          <div className="flex flex-col gap-2">
            {contacts.map((c) => {
              const tier = scoreTier(c.score);
              return (
                <Link key={c.id} href={`/${locale}/dashboard/crm/${c.id}`} className="flex items-center gap-3 bg-surface border border-border rounded-xl p-3 hover:border-brand transition-colors">
                  <span className={`font-mono font-bold text-[15px] w-12 text-center rounded-lg py-1 ${TIER_STYLE[tier]}`}>{c.score}</span>
                  <span className={`text-[11px] font-bold uppercase w-14 ${tier === 'hot' ? 'text-brand' : tier === 'warm' ? 'text-yellow-500' : 'text-ink-muted'}`}>{tc[tier as 'hot' | 'warm' | 'cold']}</span>
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-[15px]" dir="auto">{c.full_name}</span>
                    <p className="text-ink-secondary text-[13px] truncate" dir="auto">
                      {[c.role_title, c.company, c.email].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <span className="text-[12px] text-ink-muted border border-border rounded-full px-2.5 py-0.5">{tc[`ls_${c.lifecycle_stage}` as keyof typeof tc] ?? c.lifecycle_stage}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* צינור עסקאות */}
      <div>
        <h2 className="font-bold text-[18px] mb-4">{tc.pipeline}</h2>
        <CrmDealBoard locale={locale} deals={deals} contacts={contacts.map((c) => ({ id: c.id, name: c.full_name }))} t={tc} />
      </div>

      <p className="text-ink-muted text-[12px] mt-10 pt-6 border-t border-border">
        <Link href={`/${locale}/dashboard`} className="text-brand">← {t.commandCenter.back}</Link>
      </p>
    </div>
  );
}
