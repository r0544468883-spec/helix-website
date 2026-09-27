import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict } from '@/lib/i18n';
import { scoreTier } from '@/lib/crm-score';
import { needsTouch } from '@/lib/crm-status';
import { getWorkspace, listAccessibleWorkspaces, canWrite } from '@/lib/crm-workspace';
import CrmAddContact from '@/components/CrmAddContact';
import CrmDealBoard from '@/components/CrmDealBoard';
import CrmContactList, { type ListContact } from '@/components/CrmContactList';
import CrmWorkspaceSwitcher from '@/components/CrmWorkspaceSwitcher';
import CrmContactDrawer, { type DrawerContact } from '@/components/CrmContactDrawer';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<{ c?: string }>;

// How many contacts the board loads. Above this the list discloses that it is capped.
const CONTACT_LIMIT = 200;
// A malformed id must not reach Postgres as a uuid comparison.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DAY_MS = 86_400_000;

// Computed here, on the server, so the row text does not differ between server and
// browser clocks. Day granularity: stale by at most one page load.
function relativeDays(iso: string | null, locale: string, never: string): string {
  if (!iso) return never;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  const rtf = new Intl.RelativeTimeFormat(locale === 'en' ? 'en' : 'he', { numeric: 'auto' });
  if (days < 60) return rtf.format(-Math.max(0, days), 'day');
  return rtf.format(-Math.floor(days / 30), 'month');
}

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

  const [{ data: contactsData, count: contactCount }, { data: dealsData }, { data: companiesData }, tasksRes] = await Promise.all([
    supabase.from('crm_contacts').select('id, full_name, email, role_title, status, score, company_id, last_activity_at, created_at, crm_companies(name)', { count: 'exact' }).eq('workspace_id', ws.workspaceId).order('score', { ascending: false }).limit(CONTACT_LIMIT),
    supabase.from('crm_deals').select('id, title, value, currency, stage, status, contact_id, crm_contacts(full_name)').eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(200),
    supabase.from('crm_companies').select('id, name').eq('workspace_id', ws.workspaceId).order('name'),
    // Open tasks, earliest due first. Scoped to the workspace rather than to the loaded
    // contact ids: at today's volume it is the same rows without a 200-id IN list.
    supabase.from('crm_tasks').select('contact_id, title, due_date').eq('workspace_id', ws.workspaceId).eq('status', 'open').not('contact_id', 'is', null).order('due_date', { ascending: true, nullsFirst: false }).limit(1000),
  ]);

  // A failed task lookup costs the task line, never the list.
  if (tasksRes.error) console.error('[crm home] open tasks', tasksRes.error.message);
  const nextTask = new Map<string, { title: string; due_date: string | null }>();
  for (const r of (tasksRes.error ? [] : tasksRes.data ?? []) as { contact_id: string; title: string; due_date: string | null }[]) {
    if (!nextTask.has(r.contact_id)) nextTask.set(r.contact_id, { title: r.title, due_date: r.due_date });
  }
  const todayIso = new Date().toISOString().slice(0, 10);
  const dayMonth = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'he-IL', { day: 'numeric', month: 'numeric' });

  const contacts = (contactsData ?? []).map((c: Record<string, unknown>) => ({
    ...c,
    company: Array.isArray(c.crm_companies) ? (c.crm_companies[0] as { name: string } | undefined)?.name : (c.crm_companies as { name: string } | null)?.name,
  })) as {
    id: string; full_name: string; email: string | null; role_title: string | null;
    status: string; score: number; company?: string;
    last_activity_at: string | null; created_at: string | null;
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
  // One line of figures, not five tiles. With no deals the money figures would all be
  // zero, and a zero reads like a result, so they are left out until there is a deal.
  const figures = [tc.figContacts.replace('{n}', contacts.length.toLocaleString())];
  if (deals.length > 0) {
    figures.push(
      tc.figHot.replace('{n}', hotCount.toLocaleString()),
      tc.figOpen.replace('{v}', openValue.toLocaleString()),
      tc.figWon.replace('{v}', wonValue.toLocaleString()),
    );
    if (won.length + lostCount > 0) figures.push(tc.figWinRate.replace('{p}', String(winRate)));
  }

  const now = Date.now();
  const queue: ListContact[] = contacts.map((c) => {
    const task = nextTask.get(c.id);
    return {
      id: c.id,
      full_name: c.full_name,
      email: c.email,
      role_title: c.role_title,
      status: c.status,
      score: c.score,
      company: c.company,
      lastTouch: relativeDays(c.last_activity_at, locale, tc.neverTouched),
      stale: needsTouch(c.status, c.last_activity_at, c.created_at, now),
      task: task ? {
        title: task.title,
        due: task.due_date ? dayMonth.format(new Date(`${task.due_date}T12:00:00Z`)) : null,
        overdue: !!task.due_date && task.due_date < todayIso,
      } : null,
    };
  });

  // The switcher hides itself for a single-workspace non-admin, so the name has to
  // come from somewhere visible in that case.
  const wsName = workspaces.find((w) => w.id === ws.workspaceId)?.name ?? 'CRM';
  const switcherShown = workspaces.length > 1 || ws.role === 'admin' || ws.role === 'agency_admin';

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16">
      {/* Work first: a compact header, one line of figures, then the people. */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className={switcherShown ? 'sr-only' : 'font-display text-[20px] font-extrabold tracking-tight truncate'} dir="auto">{wsName}</h1>
          <CrmWorkspaceSwitcher
            locale={locale}
            workspaces={workspaces}
            activeId={ws.workspaceId}
            canManage={ws.role === 'admin' || ws.role === 'agency_admin'}
          />
        </div>
        {!readOnly && <CrmAddContact locale={locale} companies={companies} t={tc} />}
      </div>
      <p className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-ink-secondary mt-3 mb-6">
        {figures.map((f, i) => (
          <span key={i} className="whitespace-nowrap">{i > 0 && <span aria-hidden="true" className="text-ink-soft me-2">·</span>}{f}</span>
        ))}
      </p>

      {readOnly && (
        <p role="status" className="text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.readonlyNotice}</p>
      )}

      {drawerMissing && (
        <p role="status" className="text-ink-muted text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.contactNotFound}</p>
      )}

      <div className="mb-12">
        <CrmContactList
          locale={locale}
          contacts={queue}
          capped={(contactCount ?? 0) > CONTACT_LIMIT}
          t={tc}
        />
      </div>

      <div>
        <CrmDealBoard locale={locale} deals={deals} contacts={contacts.map((c) => ({ id: c.id, name: c.full_name }))} readOnly={readOnly} t={tc} />
      </div>

      <CrmContactDrawer locale={locale} contact={drawerContact} readOnly={readOnly} t={tc} />
    </div>
  );
}
