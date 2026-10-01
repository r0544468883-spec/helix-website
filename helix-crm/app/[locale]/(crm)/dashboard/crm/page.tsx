import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getDict, plural } from '@/lib/i18n';
import { scoreTier } from '@/lib/crm-score';
import { needsTouch } from '@/lib/crm-status';
import { todayInIsrael, relativeDays } from '@/lib/crm-dates';
import { loadDrawerContact, dueDayMonth } from '@/lib/crm-drawer';
import { getWorkspace, canWrite } from '@/lib/crm-workspace';
import CrmAddContact from '@/components/CrmAddContact';
import CrmContactList, { type ListContact } from '@/components/CrmContactList';
import CrmNewWorkspaceForm from '@/components/CrmNewWorkspaceForm';
import CrmContactDrawer from '@/components/CrmContactDrawer';

export const dynamic = 'force-dynamic';

type Params = Promise<{ locale: string }>;
type Search = Promise<{ c?: string; invite?: string }>;

// How many contacts the list loads. Above this the list discloses that it is capped.
const CONTACT_LIMIT = 200;

/**
 * The contacts screen, the CRM's home: people, most promising first, each with
 * where they stand, when they were last touched and their next reminder. Deals have
 * their own screen since crm-sidebar-four-screens, and the workspace switcher is in
 * the profile menu. See DESIGN.md — CRM home header, Contacts table.
 */
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

  const [{ data: contactsData, count: contactCount }, { data: companiesData }, tasksRes] = await Promise.all([
    supabase.from('crm_contacts').select('id, full_name, email, role_title, status, score, company_id, last_activity_at, created_at, crm_companies(name)', { count: 'exact' }).eq('workspace_id', ws.workspaceId).order('score', { ascending: false }).limit(CONTACT_LIMIT),
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
  // Overdue against Israel's day, as the drawer and the Reminders screen judge it:
  // UTC is a day behind until 03:00 here, and a row must not disagree with them.
  const todayIso = todayInIsrael();
  const dueText = dueDayMonth(locale);

  const contacts = (contactsData ?? []).map((c: Record<string, unknown>) => ({
    ...c,
    company: Array.isArray(c.crm_companies) ? (c.crm_companies[0] as { name: string } | undefined)?.name : (c.crm_companies as { name: string } | null)?.name,
  })) as {
    id: string; full_name: string; email: string | null; role_title: string | null;
    status: string; score: number; company?: string;
    last_activity_at: string | null; created_at: string | null;
  }[];

  const companies = (companiesData ?? []) as { id: string; name: string }[];
  const tc = t.crm;
  const readOnly = !canWrite(ws.role);

  // ?c=<id> opens a contact beside the list. Rendered on the server by the loader
  // every screen shares, so the workspace check lives in one place.
  const drawer = await loadDrawerContact({ supabase, ws, openId, locale, companies });
  const drawerContact = drawer.contact;
  const drawerMissing = drawer.missing;

  // One line of figures about people; the money is on the Deals screen. The count is
  // the workspace's, not the 200 the list loads, and a zero hot count is left out:
  // a zero reads like a result. Hebrew agreement: "איש קשר אחד", "שני אנשי קשר",
  // "30 אנשי קשר", never "1 אנשי קשר".
  const total = contactCount ?? contacts.length;
  const hotCount = contacts.filter((c) => scoreTier(c.score) === 'hot').length;
  const figures = [plural(locale, total, { one: tc.figContactsOne, two: tc.figContactsTwo, other: tc.figContacts })];
  if (hotCount > 0) figures.push(tc.figHot.replace('{n}', hotCount.toLocaleString()));

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
        due: task.due_date ? dueText(task.due_date) : null,
        overdue: !!task.due_date && task.due_date < todayIso,
      } : null,
    };
  });

  return (
    <div className="max-w-[1100px] mx-auto px-5 md:px-10 pt-8 pb-16">
      {/* Work first: a compact header, one line of figures, then the people. */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-[20px] font-extrabold tracking-tight">{tc.navContacts}</h1>
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

      <CrmContactList
        locale={locale}
        contacts={queue}
        capped={(contactCount ?? 0) > CONTACT_LIMIT}
        t={tc}
      />

      <CrmContactDrawer locale={locale} contact={drawerContact} companies={companies} readOnly={readOnly} t={tc} />
    </div>
  );
}
