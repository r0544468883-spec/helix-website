import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import { scoreTier } from '@/lib/crm-score';
import { TIER_BADGE } from '@/lib/crm-tier';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import CrmContactPanel from '@/components/CrmContactPanel';
import CrmAiAssist from '@/components/CrmAiAssist';
import { getAiSettings } from '@/lib/crm-ai';
import BidiParts from '@/components/BidiParts';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string; id: string }>;

// The contact record, HubSpot-style: About panel (start side) · status path,
// activity logger, AI assistant and the timeline (center) · associations —
// company, deals, open tasks (end side).
export default async function CrmContactPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const t = getDict(locale);
  const tc = t.crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) notFound();
  const base = `/${locale}/dashboard`;

  const { data: contact } = await supabase
    .from('crm_contacts')
    .select('id, full_name, email, phone, role_title, linkedin_url, status, score, source, notes, company_id, crm_companies(name)')
    .eq('id', id)
    .eq('workspace_id', ws.workspaceId)
    .maybeSingle();
  if (!contact) notFound();

  const company = Array.isArray(contact.crm_companies) ? (contact.crm_companies[0] as { name: string } | undefined)?.name : (contact.crm_companies as { name: string } | null)?.name;

  const [{ data: acts }, { data: dls }, { data: tks }, ai] = await Promise.all([
    supabase.from('crm_activities').select('id, type, body, created_at').eq('contact_id', id).order('created_at', { ascending: false }).limit(50),
    supabase.from('crm_deals').select('id, title, value, stage, status').eq('contact_id', id).order('created_at', { ascending: false }),
    supabase.from('crm_tasks').select('id, title, due_date, priority').eq('contact_id', id).eq('status', 'open').order('due_date', { ascending: true }).limit(15),
    getAiSettings(ws.workspaceId),
  ]);
  const activities = (acts ?? []) as { id: string; type: string; body: string; created_at: string }[];
  const deals = (dls ?? []) as { id: string; title: string; value: number; stage: string; status: string }[];
  const tasks = (tks ?? []) as { id: string; title: string; due_date: string | null; priority: string }[];
  const tier = scoreTier(contact.score);

  const card = 'bg-surface border border-border rounded-2xl p-5';
  const h2 = 'font-display text-[14.5px] font-extrabold mb-3';

  return (
    <div className="plug-ambient">
      <div className="max-w-[1080px] mx-auto px-5 md:px-8 pt-8 pb-20">
        <Link href={`${base}/crm`} className="text-brand-ink text-[14px] font-semibold">← {tc.title}</Link>

        {/* header */}
        <div className="flex items-start gap-4 mt-4 mb-6 rise">
          <span className={`font-mono font-bold text-[20px] rounded-xl px-3 py-2 ${TIER_BADGE[tier]}`}>{contact.score}</span>
          <div className="min-w-0">
            <h1 className="font-display text-[clamp(22px,3.5vw,30px)] font-extrabold tracking-tight" dir="auto">{contact.full_name}</h1>
            <p className="text-ink-secondary text-[14px]"><BidiParts parts={[contact.role_title, company]} /></p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_280px] items-start">
          {/* About (start side) */}
          <aside className={`${card} rise`} style={{ ['--d' as string]: '60ms' }}>
            <h2 className={h2}>{tc.coAbout}</h2>
            <dl className="flex flex-col gap-3 text-[13.5px]">
              {contact.email && <div><dt className="text-ink-muted text-[12px] mb-0.5">אימייל</dt><dd><a href={`mailto:${contact.email}`} className="text-brand-ink break-all" dir="ltr">{contact.email}</a></dd></div>}
              {contact.phone && <div><dt className="text-ink-muted text-[12px] mb-0.5">טלפון</dt><dd><a href={`tel:${contact.phone}`} className="text-ink" dir="ltr">{contact.phone}</a></dd></div>}
              {contact.linkedin_url && <div><dd><a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-brand-ink">LinkedIn ↗</a></dd></div>}
              {contact.source && <div><dt className="text-ink-muted text-[12px] mb-0.5">מקור</dt><dd className="text-ink" dir="auto">{contact.source}</dd></div>}
              {contact.company_id && company && (
                <div><dt className="text-ink-muted text-[12px] mb-0.5">{tc.navCompanies}</dt>
                  <dd><Link href={`${base}/crm/companies/${contact.company_id}`} className="text-brand-ink inline-flex items-center gap-1.5" dir="auto"><Building2 size={13} aria-hidden />{company}</Link></dd></div>
              )}
              {contact.notes && <div><dt className="text-ink-muted text-[12px] mb-0.5">{tc.coNotes}</dt><dd className="text-ink-secondary whitespace-pre-line leading-relaxed" dir="auto">{String(contact.notes)}</dd></div>}
            </dl>
          </aside>

          {/* Center: status + logger, AI, timeline */}
          <div className="flex flex-col gap-4 min-w-0">
            <div className="rise" style={{ ['--d' as string]: '120ms' }}>
              <CrmContactPanel locale={locale} contactId={contact.id} contactName={contact.full_name} status={contact.status} readOnly={!canWrite(ws.role)} t={tc} />
            </div>
            <div className="rise" style={{ ['--d' as string]: '170ms' }}>
              <CrmAiAssist locale={locale} contactId={contact.id} configured={!!ai && ai.enabled} />
            </div>
            <section className={`${card} rise`} style={{ ['--d' as string]: '220ms' }}>
              <h2 className={h2}>{tc.timeline}</h2>
              {activities.length === 0 ? (
                <p className="text-ink-muted text-[14px]">{tc.noActivity}</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {activities.map((a) => (
                    <div key={a.id} className="flex gap-3">
                      <span className="text-[11px] font-bold uppercase text-brand-ink/80 w-16 shrink-0 pt-0.5">{(tc[`at_${a.type}` as keyof typeof tc] as string) ?? a.type}</span>
                      <div className="min-w-0 flex-1 border-s border-border ps-3">
                        <p className="text-[14px] text-ink whitespace-pre-line" dir="auto">{a.body}</p>
                        <span className="text-[11px] text-ink-muted">{formatDate(a.created_at, locale)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* Associations (end side) */}
          <aside className="flex flex-col gap-4">
            <div className={`${card} rise`} style={{ ['--d' as string]: '180ms' }}>
              <h2 className={h2}>{tc.relatedDeals} <span className="text-ink-muted font-semibold">{deals.length}</span></h2>
              <div className="flex flex-col">
                {deals.length === 0 && <p className="text-ink-muted text-[13px]">—</p>}
                {deals.map((d) => (
                  <div key={d.id} className="flex items-center justify-between gap-2 py-2 border-t first:border-t-0 border-border">
                    <span className="text-[13.5px] font-semibold text-ink truncate" dir="auto">{d.title}</span>
                    <span className="flex items-center gap-2 shrink-0 text-[12px]">
                      {d.value > 0 && <span className="text-brand-ink font-bold tabular-nums">₪{Math.round(d.value).toLocaleString()}</span>}
                      <span className="text-ink-muted border border-border rounded-full px-2 py-0.5">{(tc[`st_${d.stage}` as keyof typeof tc] as string) ?? d.stage}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${card} rise`} style={{ ['--d' as string]: '240ms' }}>
              <h2 className={h2}>{tc.coOpenTasks} <span className="text-ink-muted font-semibold">{tasks.length}</span></h2>
              <div className="flex flex-col">
                {tasks.length === 0 && <p className="text-ink-muted text-[13px]">—</p>}
                {tasks.map((tk) => (
                  <div key={tk.id} className="py-2 border-t first:border-t-0 border-border">
                    <span className="block text-[13.5px] text-ink truncate" dir="auto">
                      {tk.priority === 'high' && <span className="text-danger me-1">⚑</span>}{tk.title}
                    </span>
                    {tk.due_date && <span className="block text-[11.5px] text-ink-muted" dir="auto">{tk.due_date}</span>}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
