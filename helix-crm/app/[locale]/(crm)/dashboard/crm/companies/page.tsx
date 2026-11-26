import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Building2, Users, Handshake } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { getWorkspace } from '@/lib/crm-workspace';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;

// HubSpot methodology: companies are a first-class object. The index shows each
// company with its associated contacts count and open-deal value; the row opens
// the company record page (About + timeline + associations).
export default async function CrmCompaniesPage({ params }: { params: Params }) {
  const { locale } = await params;
  const t = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) {
    return <div className="max-w-[680px] mx-auto px-5 md:px-10 pt-20 text-center"><p className="text-ink-secondary">{t.setupPending}</p></div>;
  }
  const base = `/${locale}/dashboard`;

  const [{ data: cos }, { data: contacts }, { data: deals }] = await Promise.all([
    supabase.from('crm_companies').select('id, name, industry, website').eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(300),
    supabase.from('crm_contacts').select('company_id').eq('workspace_id', ws.workspaceId).not('company_id', 'is', null).limit(2000),
    supabase.from('crm_deals').select('company_id, value, status').eq('workspace_id', ws.workspaceId).not('company_id', 'is', null).limit(2000),
  ]);

  const contactCount = new Map<string, number>();
  for (const c of (contacts ?? []) as { company_id: string }[]) contactCount.set(c.company_id, (contactCount.get(c.company_id) ?? 0) + 1);
  const openValue = new Map<string, number>();
  for (const d of (deals ?? []) as { company_id: string; value: number | null; status: string }[]) {
    if (d.status === 'open') openValue.set(d.company_id, (openValue.get(d.company_id) ?? 0) + (d.value ?? 0));
  }
  const companies = (cos ?? []) as { id: string; name: string; industry: string | null; website: string | null }[];

  return (
    <div className="plug-ambient">
      <div className="max-w-[860px] mx-auto px-5 md:px-10 pt-8 md:pt-10 pb-20">
        <h1 className="font-display text-[26px] md:text-[30px] font-extrabold tracking-tight"><span className="plug-gradient-text">{t.coTitle}</span></h1>
        <p className="text-[14px] text-ink-secondary mt-1.5 mb-7">{t.coSub}</p>

        {companies.length === 0 ? (
          <div className="bg-surface border border-border rounded-2xl p-6 rise"><p className="text-ink-secondary text-[14px]">{t.coNoCompanies}</p></div>
        ) : (
          <div className="flex flex-col gap-2">
            {companies.map((c, i) => (
              <Link key={c.id} href={`${base}/crm/companies/${c.id}`}
                className="glow-hover rise flex items-center gap-3.5 bg-surface border border-border rounded-xl px-4 py-3.5 min-h-[56px]"
                style={{ ['--d' as string]: `${Math.min(i, 10) * 45}ms` }}>
                <span className="grid place-items-center size-10 rounded-xl bg-brand/10 text-brand-ink shrink-0"><Building2 size={19} aria-hidden /></span>
                <div className="flex-1 min-w-0">
                  <span className="block text-[15px] font-semibold text-ink truncate" dir="auto">{c.name}</span>
                  <span className="block text-[12.5px] text-ink-muted truncate" dir="auto">
                    {[c.industry, c.website?.replace(/^https?:\/\//, '')].filter(Boolean).join(' · ') || '—'}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-ink-secondary tabular-nums"><Users size={13} aria-hidden /> {contactCount.get(c.id) ?? 0}</span>
                {(openValue.get(c.id) ?? 0) > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold text-brand-ink tabular-nums"><Handshake size={13} aria-hidden /> ₪{Math.round(openValue.get(c.id)!).toLocaleString()}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
