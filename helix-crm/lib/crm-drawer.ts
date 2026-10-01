import type { SupabaseClient } from '@supabase/supabase-js';
import { getDict } from '@/lib/i18n';
import { scoreTier, scoreSignals } from '@/lib/crm-score';
import { statusDays, todayInIsrael, relativeDays, daysAgoInIsrael } from '@/lib/crm-dates';
import { isAdminRole, type Role } from '@/lib/crm-roles';
import { createAdminClient } from '@/lib/supabase/admin';
import { googleConfigured } from '@/lib/crm-google';
import type { DrawerContact } from '@/components/CrmContactDrawer';

// A malformed id must not reach Postgres as a uuid comparison.
export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type Company = { id: string; name: string };

/** "30/9": a reminder's due date, from a `date` column. Noon UTC keeps it on its own day. */
export function dueDayMonth(locale: string): (isoDate: string) => string {
  const f = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'he-IL', { day: 'numeric', month: 'numeric' });
  return (isoDate) => f.format(new Date(`${isoDate}T12:00:00Z`));
}

/**
 * The contact drawer's record, for every screen that opens one with ?c=<id>: the
 * contacts list, Deals, Reminders and Companies (crm-sidebar-four-screens). It is
 * rendered on the server so the workspace check lives in one place, and back and
 * forward work for free. `missing` is true for a malformed id or one outside the
 * active workspace: the screen shows its not-found notice and no drawer.
 * `companies` feeds the details form's company field; a screen that has already
 * loaded them passes its own. See DESIGN.md — Overlay state lives in the URL.
 */
export async function loadDrawerContact({ supabase, ws, openId, locale, companies }: {
  supabase: SupabaseClient;
  ws: { workspaceId: string; role: Role };
  openId: string | undefined;
  locale: string;
  companies?: Company[];
}): Promise<{ contact: DrawerContact | null; missing: boolean; companies: Company[] }> {
  if (!openId) return { contact: null, missing: false, companies: companies ?? [] };
  if (!UUID_RE.test(openId)) return { contact: null, missing: true, companies: companies ?? [] };

  const { data: one } = await supabase
    .from('crm_contacts')
    .select('id, full_name, role_title, email, phone, linkedin_url, status, score, created_at, company_id, source, notes, last_activity_at, is_business, crm_companies(name)')
    .eq('id', openId).eq('workspace_id', ws.workspaceId).maybeSingle();
  if (!one) return { contact: null, missing: true, companies: companies ?? [] };

  const [{ data: dls }, { data: acts }, { data: lastMove }, { data: openTasks }, { data: qts }, { data: cos }] = await Promise.all([
    supabase.from('crm_deals').select('id, title, value, stage, status').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }),
    supabase.from('crm_activities').select('id, type, body, created_at').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(50),
    // The newest status change, for "N days in this status". Only rows a signed-in
    // user wrote count: the public API writes activities with no owner and any type.
    supabase.from('crm_activities').select('created_at').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).eq('type', 'status').not('owner_id', 'is', null).order('created_at', { ascending: false }).limit(1).maybeSingle(),
    // The next step and what is behind it, in the home row's order.
    supabase.from('crm_tasks').select('id, title, due_date').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).eq('status', 'open').order('due_date', { ascending: true, nullsFirst: false }).order('created_at', { ascending: true }).limit(50),
    // Before migration v21 there is no table: the error reads as no quotes.
    supabase.from('crm_quotes').select('id, number, status, subject, total, sent_at, last_viewed_at, public_token, locale').eq('contact_id', openId).eq('workspace_id', ws.workspaceId).order('created_at', { ascending: false }).limit(20),
    companies
      ? Promise.resolve({ data: companies })
      : supabase.from('crm_companies').select('id, name').eq('workspace_id', ws.workspaceId).order('name'),
  ]);

  const tc = getDict(locale).crm;
  const fmt = locale === 'en' ? 'en-GB' : 'he-IL';
  const due = dueDayMonth(locale);
  // "3.9.2026": the date a contact was added, on Israel's calendar.
  const addedDate = new Intl.DateTimeFormat(fmt, { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: 'Asia/Jerusalem' });
  // A quote's sent and opened moments, as the Israeli day they fell on.
  const momentDay = new Intl.DateTimeFormat(fmt, { day: 'numeric', month: 'numeric', timeZone: 'Asia/Jerusalem' });
  // Overdue against Israel's day, as on the contacts list and the Reminders screen,
  // so the three agree after midnight in Israel (UTC is a day behind until 03:00).
  const today = todayInIsrael();

  const cRel = one.crm_companies as unknown;
  const contact: DrawerContact = {
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
      due: k.due_date ? due(k.due_date) : null,
      overdue: !!k.due_date && k.due_date < today,
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
  // itself after it opens (crmContactMeetings), so no screen ever waits on Google.
  const admin = googleConfigured() ? createAdminClient() : null;
  if (admin) {
    const { data: conn } = await admin.from('crm_connections').select('status')
      .eq('workspace_id', ws.workspaceId).eq('provider', 'google').maybeSingle();
    if (conn) contact.meetings = { source: conn.status === 'lapsed' ? 'lapsed' : 'active', canManage: isAdminRole(ws.role) };
  }
  return { contact, missing: false, companies: (cos ?? []) as Company[] };
}
