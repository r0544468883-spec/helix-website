import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict, plural } from '@/lib/i18n';
import { scoreTier, scoreSignals } from '@/lib/crm-score';
import { needsTouch } from '@/lib/crm-status';
import { statusDays, daysBetweenIso, todayInIsrael } from '@/lib/crm-dates';
import { getWorkspace, listAccessibleWorkspaces, canWrite, isAdminRole } from '@/lib/crm-workspace';
import { createAdminClient } from '@/lib/supabase/admin';
import { googleConfigured } from '@/lib/crm-google';
import CrmAddContact from '@/components/CrmAddContact';
import CrmDealBoard from '@/components/CrmDealBoard';
import CrmContactList, { type ListContact } from '@/components/CrmContactList';
import CrmWorkspaceSwitcher from '@/components/CrmWorkspaceSwitcher';
import CrmNewWorkspaceForm from '@/components/CrmNewWorkspaceForm';
import CrmContactDrawer, { type DrawerContact } from '@/components/CrmContactDrawer';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<{ c?: string; invite?: string }>;

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

// How long ago a contact was added, in Israeli calendar days: added at 23:30 on the
// 3rd is three days old on the 6th, whatever zone the server runs in.
function daysAgoInIsrael(iso: string, locale: string): string {
  const days = Math.max(0, daysBetweenIso(todayInIsrael(new Date(iso)), todayInIsrael()));
  const rtf = new Intl.RelativeTimeFormat(locale === 'en' ? 'en' : 'he', { numeric: 'auto' });
  if (days < 60) return rtf.format(-days, 'day');
  return rtf.format(-Math.floor(days / 30), 'month');
}

export default async function CrmPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { locale } = await params;
  const { c: openId, invite: inviteParam } = await searchParams;
  // An invite email's link that joined nothing: cancelled, expired or someone else's.
  const inviteUnusable = inviteParam === 'unusable';
  const t = getDict(locale);
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/${locale}/login`);
  const ws = await getWorkspace(supabase, { id: user.id, email: user.email });
  // No workspace at all: offer one of their own (crm-multi-workspace).
  if (!ws) {
    return (
      <div className="max-w-[640px] mx-auto px-5 md:px-10 pt-16 pb-16">
        {inviteUnusable && (
          <p role="status" className="text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{t.crm.inviteUnusable}</p>
        )}
        <h1 className="font-display text-[clamp(24px,4vw,32px)] font-extrabold tracking-tight">{t.crm.wsNoneTitle}</h1>
        <p className="text-ink-secondary text-[15px] mt-1 mb-6">{t.crm.wsNoneText}</p>
        <div className="bg-surface border border-border rounded-2xl p-5">
          <CrmNewWorkspaceForm locale={locale} t={t.crm} />
        </div>
      </div>
    );
  }

  const [{ data: contactsData, count: contactCount }, { data: dealsData }, { data: companiesData }, tasksRes] = await Promise.all([
    supabase.from('crm_contacts').select('id, full_name, email, role_title, status, score, company_id, last_activity_at, created_at, crm_companies(name)', { count: 'exact' }).eq('workspace_id', ws.workspaceId).order('score', { ascending: false }).limit(CONTACT_LIMIT),
    supabase.from('crm_deals').select('id, title, value, currency, stage, status, contact_id, crm_contacts(full_name)').eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(200),
    supabase.from('crm_companies').select('id, name').eq('workspace_id', ws.workspaceId).order('name'),
    // Open tasks, earliest due first. Scoped to the workspace rather than to the loaded
    // contact ids: at today's volume it is the same rows without a 200-id IN list.
    // Earliest due first, undated last, and the older of two equal ones first: the
    // drawer's next step uses the same order, so the row and the drawer agree.
    supabase.from('crm_tasks').select('contact_id, title, due_date').eq('workspace_id', ws.workspaceId).eq('status', 'open').not('contact_id', 'is', null).order('due_date', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }).limit(1000),
  ]);

  // A failed task lookup costs the task line, never the list.
  if (tasksRes.error) console.error('[crm home] open tasks', tasksRes.error.message);
  const nextTask = new Map<string, { title: string; due_date: string | null }>();
  for (const r of (tasksRes.error ? [] : tasksRes.data ?? []) as { contact_id: string; title: string; due_date: string | null }[]) {
    if (!nextTask.has(r.contact_id)) nextTask.set(r.contact_id, { title: r.title, due_date: r.due_date });
  }
  const todayIso = new Date().toISOString().slice(0, 10);
  const dayMonth = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'he-IL', { day: 'numeric', month: 'numeric' });
  // "3.9.2026": the date a contact was added, on Israel's calendar.
  const addedDate = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'he-IL', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Asia/Jerusalem' });
  // A quote's sent and opened moments, as the Israeli day they fell on.
  const momentDay = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'he-IL', { day: 'numeric', month: 'numeric', timeZone: 'Asia/Jerusalem' });

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
  })) as { id: string; title: string; value: number; currency: string; stage: string; status: string; contact_id: string | null; contactName?: string }[];

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
        .select('id, full_name, role_title, email, phone, linkedin_url, status, score, created_at, company_id, source, notes, last_activity_at, is_business, crm_companies(name)')
        .eq('id', openId).eq('workspace_id', ws.workspaceId).maybeSingle();
      if (!one) {
        drawerMissing = true;
      } else {
        const [{ data: dls }, { data: acts }, { data: lastMove }, { data: openTasks }, { data: qts }] = await Promise.all([
          supabase.from('crm_deals').select('id, title, value, stage, status').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }),
          supabase.from('crm_activities').select('id, type, body, created_at').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(50),
          // The newest status change, for "N days in this status". Only rows a signed-in
          // user wrote count: the public API writes activities with no owner and any type.
          supabase.from('crm_activities').select('created_at').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).eq('type', 'status').not('owner_id', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle(),
          // The next step and what is behind it, in the home row's order.
          supabase.from('crm_tasks').select('id, title, due_date').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).eq('status', 'open').order('due_date', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }).limit(50),
          // Before migration v21 there is no table: the error reads as no quotes.
          supabase.from('crm_quotes').select('id, number, status, subject, total, sent_at, last_viewed_at, public_token, locale').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(20),
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
          // On the server, like the rows' last-touch text, so the two renders agree.
          statusDays: statusDays(one.status as string, (lastMove?.created_at as string | undefined) ?? null, (one.created_at as string) ?? null),
          // Due text and overdue use the home row's own formula, so the two say the same thing.
          tasks: ((openTasks ?? []) as { id: string; title: string; due_date: string | null }[]).map((k) => ({
            id: k.id,
            title: k.title,
            due_date: k.due_date,
            due: k.due_date ? dayMonth.format(new Date(`${k.due_date}T12:00:00Z`)) : null,
            overdue: !!k.due_date && k.due_date < todayIso,
          })),
          deals: (dls ?? []) as DrawerContact['deals'],
          quotes: ((qts ?? []) as {
            id: string; number: string | null; status: string; subject: string | null; total: number | string | null;
            sent_at: string | null; last_viewed_at: string | null; public_token: string; locale: string;
          }[]).map((q) => ({
            id: q.id,
            number: q.number,
            status: q.status === 'sent' || q.status === 'cancelled' ? q.status : 'draft',
            subject: q.subject ?? '',
            total: Number(q.total ?? 0),
            sentOn: q.sent_at ? momentDay.format(new Date(q.sent_at)) : null,
            openedOn: q.last_viewed_at ? momentDay.format(new Date(q.last_viewed_at)) : null,
            token: q.public_token,
            locale: q.locale === 'en' ? 'en' : 'he',
          })),
          activities: (acts ?? []) as DrawerContact['activities'],
          // The details region. Its dates and words are computed here, with the rows'
          // own clock, so the drawer and the list say the same thing.
          company_id: (one.company_id as string) ?? null,
          source: (one.source as string) ?? null,
          notes: (one.notes as string) ?? null,
          added: one.created_at
            ? { date: addedDate.format(new Date(one.created_at as string)), ago: daysAgoInIsrael(one.created_at as string, locale) }
            : null,
          lastTouch: relativeDays((one.last_activity_at as string) ?? null, locale, tc.neverTouched),
          tier: scoreTier(one.score as number),
          signals: scoreSignals({
            is_business: one.is_business as boolean,
            company_id: (one.company_id as string) ?? null,
            status: one.status as string,
            phone: (one.phone as string) ?? null,
            linkedin_url: (one.linkedin_url as string) ?? null,
            last_activity_at: (one.last_activity_at as string) ?? null,
            hasOpenDeal: ((dls ?? []) as { status: string }[]).some((d) => d.status === 'open'),
          }),
          meetings: null,
        };
        // Meetings from Google, when the workspace is connected: loaded by the drawer
        // itself after it opens (crmContactMeetings), so this page never waits on Google.
        const admin = googleConfigured() ? createAdminClient() : null;
        if (admin) {
          const { data: conn } = await admin.from('crm_connections').select('status')
            .eq('workspace_id', ws.workspaceId).eq('provider', 'google').maybeSingle();
          if (conn) drawerContact.meetings = { source: conn.status === 'lapsed' ? 'lapsed' : 'active', canManage: isAdminRole(ws.role) };
        }
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
  // Hebrew agreement: "איש קשר אחד", "שני אנשי קשר", "30 אנשי קשר", never "1 אנשי קשר".
  const figures = [plural(locale, contacts.length, { one: tc.figContactsOne, two: tc.figContactsTwo, other: tc.figContacts })];
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

  // The switcher shows only when there is a choice to make. With one workspace its
  // name is the page's visible title instead (DESIGN.md — CRM home header).
  const wsName = workspaces.find((w) => w.id === ws.workspaceId)?.name ?? 'CRM';
  const switcherShown = workspaces.length > 1;

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16">
      {/* Work first: a compact header, one line of figures, then the people. */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h1 className={switcherShown ? 'sr-only' : 'font-display text-[20px] font-extrabold tracking-tight truncate'} dir="auto">{wsName}</h1>
          <CrmWorkspaceSwitcher locale={locale} workspaces={workspaces} activeId={ws.workspaceId} />
        </div>
        {!readOnly && <CrmAddContact locale={locale} companies={companies} t={tc} />}
      </div>
      <p className="flex flex-wrap gap-x-2 gap-y-1 text-[13px] text-ink-secondary mt-3 mb-6">
        {figures.map((f, i) => (
          <span key={i} className="whitespace-nowrap">{i > 0 && <span aria-hidden="true" className="text-ink-soft me-2">·</span>}{f}</span>
        ))}
      </p>

      {inviteUnusable && (
        <p role="status" className="text-ink-secondary text-[13px] bg-surface border border-border rounded-xl px-4 py-3 mb-6">{tc.inviteUnusable}</p>
      )}

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

      <CrmContactDrawer locale={locale} contact={drawerContact} companies={companies} readOnly={readOnly} t={tc} />
    </div>
  );
}
