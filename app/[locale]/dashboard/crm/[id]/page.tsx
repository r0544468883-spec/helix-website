import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import { scoreTier } from '@/lib/crm-score';
import { getWorkspace } from '@/lib/crm-workspace';
import CrmContactPanel from '@/components/CrmContactPanel';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string; id: string }>;

const TIER_STYLE: Record<string, string> = {
  hot: 'bg-brand/15 text-brand',
  warm: 'bg-yellow-500/15 text-yellow-500',
  cold: 'bg-white/5 text-ink-muted',
};

export default async function CrmContactPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const t = getDict(locale);
  const tc = t.crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) notFound();

  const { data: contact } = await supabase
    .from('crm_contacts')
    .select('id, full_name, email, phone, role_title, linkedin_url, lifecycle_stage, lead_status, score, source, crm_companies(name)')
    .eq('id', id)
    .eq('workspace_id', ws.workspaceId)
    .maybeSingle();
  if (!contact) notFound();

  const company = Array.isArray(contact.crm_companies) ? (contact.crm_companies[0] as { name: string } | undefined)?.name : (contact.crm_companies as { name: string } | null)?.name;

  const [{ data: acts }, { data: dls }] = await Promise.all([
    supabase.from('crm_activities').select('id, type, body, created_at').eq('contact_id', id).order('created_at', { ascending: false }).limit(50),
    supabase.from('crm_deals').select('id, title, value, stage, status').eq('contact_id', id).order('created_at', { ascending: false }),
  ]);
  const activities = (acts ?? []) as { id: string; type: string; body: string; created_at: string }[];
  const deals = (dls ?? []) as { id: string; title: string; value: number; stage: string; status: string }[];
  const tier = scoreTier(contact.score);

  return (
    <div className="max-w-[820px] mx-auto px-5 md:px-10 pt-12 pb-16">
      <Link href={`/${locale}/dashboard/crm`} className="text-brand text-[14px] font-semibold">← {tc.title}</Link>

      {/* header */}
      <div className="flex items-start gap-4 mt-4 mb-6">
        <span className={`font-mono font-bold text-[20px] rounded-xl px-3 py-2 ${TIER_STYLE[tier]}`}>{contact.score}</span>
        <div className="min-w-0">
          <h1 className="font-display text-[clamp(24px,4vw,34px)] font-extrabold tracking-tight" dir="auto">{contact.full_name}</h1>
          <p className="text-ink-secondary text-[15px]" dir="auto">{[contact.role_title, company].filter(Boolean).join(' · ')}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[13px]">
            {contact.email && <a href={`mailto:${contact.email}`} className="text-brand" dir="ltr">{contact.email}</a>}
            {contact.phone && <a href={`tel:${contact.phone}`} className="text-ink-secondary" dir="ltr">{contact.phone}</a>}
            {contact.linkedin_url && <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand">LinkedIn ↗</a>}
          </div>
        </div>
      </div>

      {/* stage + log activity panel */}
      <div className="mb-8">
        <CrmContactPanel locale={locale} contactId={contact.id} lifecycle={contact.lifecycle_stage} leadStatus={contact.lead_status} t={tc} />
      </div>

      {/* related deals */}
      {deals.length > 0 && (
        <div className="mb-8">
          <h2 className="font-bold text-[16px] mb-3">{tc.relatedDeals}</h2>
          <div className="flex flex-col gap-2">
            {deals.map((d) => (
              <div key={d.id} className="flex items-center justify-between bg-surface border border-border rounded-xl p-3">
                <span className="font-semibold text-[14px]" dir="auto">{d.title}</span>
                <span className="flex items-center gap-3 text-[13px]">
                  {d.value > 0 && <span className="text-brand font-mono">₪{d.value.toLocaleString()}</span>}
                  <span className="text-ink-muted border border-border rounded-full px-2 py-0.5">{tc[`st_${d.stage}` as keyof typeof tc] ?? d.stage}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* timeline */}
      <div>
        <h2 className="font-bold text-[16px] mb-3">{tc.timeline}</h2>
        {activities.length === 0 ? (
          <p className="text-ink-muted text-[14px]">{tc.noActivity}</p>
        ) : (
          <div className="flex flex-col gap-3">
            {activities.map((a) => (
              <div key={a.id} className="flex gap-3">
                <span className="text-[11px] font-bold uppercase text-ink-muted w-16 shrink-0 pt-0.5">{tc[`at_${a.type}` as keyof typeof tc] ?? a.type}</span>
                <div className="min-w-0 flex-1 border-s border-border ps-3">
                  <p className="text-[14px] text-ink whitespace-pre-line" dir="auto">{a.body}</p>
                  <span className="text-[11px] text-ink-muted">{formatDate(a.created_at, locale)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
