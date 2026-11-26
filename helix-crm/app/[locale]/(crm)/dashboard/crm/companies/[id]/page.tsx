import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { Building2, Globe } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getDict, formatDate } from '@/lib/i18n';
import { getWorkspace } from '@/lib/crm-workspace';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string; id: string }>;

// The company record, HubSpot-style: About panel (start side) · engagement
// timeline of all associated contacts (center) · associations — contacts,
// deals, open tasks (end side).
export default async function CrmCompanyPage({ params }: { params: Params }) {
  const { locale, id } = await params;
  const tc = getDict(locale).crm;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  if (!ws) notFound();
  const base = `/${locale}/dashboard`;

  const { data: co } = await supabase
    .from('crm_companies')
    .select('id, name, industry, size, website, notes, lifecycle_stage')
    .eq('id', id).eq('workspace_id', ws.workspaceId).maybeSingle();
  if (!co) notFound();

  const { data: ppl } = await supabase
    .from('crm_contacts')
    .select('id, full_name, role_title, status, score, email, phone')
    .eq('workspace_id', ws.workspaceId).eq('company_id', id)
    .order('score', { ascending: false }).limit(50);
  const contacts = (ppl ?? []) as { id: string; full_name: string; role_title: string | null; status: string; score: number; email: string | null; phone: string | null }[];
  const contactIds = contacts.map((c) => c.id);

  const [{ data: dls }, { data: acts }, { data: tks }] = await Promise.all([
    supabase.from('crm_deals').select('id, title, value, stage, status, contact_id')
      .eq('workspace_id', ws.workspaceId)
      .or(`company_id.eq.${id}${contactIds.length ? `,contact_id.in.(${contactIds.join(',')})` : ''}`)
      .order('created_at', { ascending: false }).limit(50),
    contactIds.length
      ? supabase.from('crm_activities').select('id, type, body, created_at, contact_id')
          .eq('workspace_id', ws.workspaceId).in('contact_id', contactIds)
          .order('created_at', { ascending: false }).limit(40)
      : Promise.resolve({ data: [] as never[] }),
    contactIds.length
      ? supabase.from('crm_tasks').select('id, title, due_date, contact_id')
          .eq('workspace_id', ws.workspaceId).eq('status', 'open').in('contact_id', contactIds)
          .order('due_date', { ascending: true }).limit(20)
      : Promise.resolve({ data: [] as never[] }),
  ]);
  const deals = (dls ?? []) as { id: string; title: string; value: number; stage: string; status: string; contact_id: string | null }[];
  const activities = (acts ?? []) as { id: string; type: string; body: string; created_at: string; contact_id: string | null }[];
  const tasks = (tks ?? []) as { id: string; title: string; due_date: string | null; contact_id: string | null }[];
  const nameOf = (cid: string | null) => contacts.find((c) => c.id === cid)?.full_name ?? null;
  const openValue = deals.filter((d) => d.status === 'open').reduce((s, d) => s + (d.value ?? 0), 0);

  const card = 'bg-surface border border-border rounded-2xl p-5';
  const h2 = 'font-display text-[14.5px] font-extrabold mb-3';

  return (
    <div className="plug-ambient">
      <div className="max-w-[1080px] mx-auto px-5 md:px-8 pt-8 pb-20">
        <Link href={`${base}/crm/companies`} className="text-brand-ink text-[14px] font-semibold">← {tc.coTitle}</Link>

        {/* header */}
        <div className="flex items-center gap-4 mt-4 mb-6 rise">
          <span className="grid place-items-center size-14 rounded-2xl bg-brand/10 text-brand-ink shrink-0"><Building2 size={26} aria-hidden /></span>
          <div className="min-w-0">
            <h1 className="font-display text-[clamp(22px,3.5vw,30px)] font-extrabold tracking-tight" dir="auto">{co.name}</h1>
            <p className="text-ink-secondary text-[13.5px]">
              {[co.industry, co.size].filter(Boolean).join(' · ')}
              {openValue > 0 && <span className="text-brand-ink font-bold tabular-nums"> · ₪{Math.round(openValue).toLocaleString()} {tc.coOpenValue}</span>}
            </p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_280px] items-start">
          {/* About (start side) */}
          <aside className={`${card} rise`} style={{ ['--d' as string]: '60ms' }}>
            <h2 className={h2}>{tc.coAbout}</h2>
            <dl className="flex flex-col gap-3 text-[13.5px]">
              {co.website && (
                <div><dt className="text-ink-muted text-[12px] mb-0.5">{tc.coWebsite}</dt>
                  <dd><a href={co.website.startsWith('http') ? co.website : `https://${co.website}`} target="_blank" rel="noopener noreferrer" className="text-brand-ink inline-flex items-center gap-1.5" dir="ltr"><Globe size={13} aria-hidden />{co.website.replace(/^https?:\/\//, '')}</a></dd></div>
              )}
              {co.industry && <div><dt className="text-ink-muted text-[12px] mb-0.5">{tc.coIndustry}</dt><dd className="text-ink" dir="auto">{co.industry}</dd></div>}
              {co.size && <div><dt className="text-ink-muted text-[12px] mb-0.5">{tc.coSize}</dt><dd className="text-ink" dir="auto">{co.size}</dd></div>}
              {co.notes && <div><dt className="text-ink-muted text-[12px] mb-0.5">{tc.coNotes}</dt><dd className="text-ink-secondary whitespace-pre-line leading-relaxed" dir="auto">{co.notes}</dd></div>}
            </dl>
          </aside>

          {/* Timeline (center — the HubSpot heart) */}
          <section className={`${card} rise`} style={{ ['--d' as string]: '120ms' }}>
            <h2 className={h2}>{tc.coTimeline}</h2>
            {activities.length === 0 ? (
              <p className="text-ink-muted text-[14px]">{tc.coNoTimeline}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {activities.map((a) => (
                  <div key={a.id} className="flex gap-3">
                    <span className="text-[11px] font-bold uppercase text-brand-ink/80 w-16 shrink-0 pt-0.5">{(tc[`at_${a.type}` as keyof typeof tc] as string) ?? a.type}</span>
                    <div className="min-w-0 flex-1 border-s border-border ps-3">
                      <p className="text-[14px] text-ink whitespace-pre-line" dir="auto">{a.body}</p>
                      <span className="text-[11px] text-ink-muted">
                        {nameOf(a.contact_id) ? `${nameOf(a.contact_id)} · ` : ''}{formatDate(a.created_at, locale)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Associations (end side) */}
          <aside className="flex flex-col gap-4">
            <div className={`${card} rise`} style={{ ['--d' as string]: '180ms' }}>
              <h2 className={h2}>{tc.coContactsAt} <span className="text-ink-muted font-semibold">{contacts.length}</span></h2>
              <div className="flex flex-col">
                {contacts.length === 0 && <p className="text-ink-muted text-[13px]">—</p>}
                {contacts.map((p) => (
                  <Link key={p.id} href={`${base}/crm/${p.id}`} className="flex items-center justify-between gap-2 py-2 border-t first:border-t-0 border-border group">
                    <span className="min-w-0">
                      <span className="block text-[13.5px] font-semibold text-ink truncate group-hover:text-brand-ink" dir="auto">{p.full_name}</span>
                      {p.role_title && <span className="block text-[11.5px] text-ink-muted truncate" dir="auto">{p.role_title}</span>}
                    </span>
                    <span className="text-[12px] font-bold tabular-nums text-brand-ink shrink-0">{p.score}</span>
                  </Link>
                ))}
              </div>
            </div>

            <div className={`${card} rise`} style={{ ['--d' as string]: '240ms' }}>
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

            {tasks.length > 0 && (
              <div className={`${card} rise`} style={{ ['--d' as string]: '300ms' }}>
                <h2 className={h2}>{tc.coOpenTasks} <span className="text-ink-muted font-semibold">{tasks.length}</span></h2>
                <div className="flex flex-col">
                  {tasks.map((tk) => (
                    <div key={tk.id} className="py-2 border-t first:border-t-0 border-border">
                      <span className="block text-[13.5px] text-ink truncate" dir="auto">{tk.title}</span>
                      <span className="block text-[11.5px] text-ink-muted" dir="auto">{[nameOf(tk.contact_id), tk.due_date].filter(Boolean).join(' · ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
