import { normalizeEmail } from '@/lib/crm-contact-match';

/**
 * A lead's meetings from the connected Google Calendar, as the drawer shows them.
 * Pure: Google's search matches the address anywhere in an event, so only events
 * where the lead is an attendee or the organizer are kept. Cancelled ones are
 * dropped. The next one and the last three are picked, in Israel time.
 * openspec: crm-connect-google-and-make, design decision 6.
 */

export type GEvent = {
  id?: string | null;
  status?: string | null;
  summary?: string | null;
  htmlLink?: string | null;
  start?: { dateTime?: string | null; date?: string | null } | null;
  attendees?: { email?: string | null }[] | null;
  organizer?: { email?: string | null } | null;
};

export type Meeting = {
  id: string;
  title: string;
  /** "יום ו׳, 3.10" / "Fri 3/10" */
  day: string;
  /** "14:00", or null for an all-day event. */
  time: string | null;
  link: string | null;
};

export const PAST_SHOWN = 3;

function startOf(e: GEvent): number | null {
  const raw = e.start?.dateTime ?? (e.start?.date ? `${e.start.date}T00:00:00+03:00` : null);
  if (!raw) return null;
  const t = Date.parse(raw);
  return Number.isNaN(t) ? null : t;
}

function involves(e: GEvent, email: string): boolean {
  if (normalizeEmail(e.organizer?.email) === email) return true;
  return (e.attendees ?? []).some((a) => normalizeEmail(a.email) === email);
}

export function pickMeetings(
  events: GEvent[],
  contactEmail: string,
  now: Date,
  locale: string,
): { next: Meeting | null; past: Meeting[] } {
  const email = normalizeEmail(contactEmail);
  if (!email) return { next: null, past: [] };
  const tag = locale === 'en' ? 'en-GB' : 'he-IL';
  const dayFmt = new Intl.DateTimeFormat(tag, { weekday: 'short', day: 'numeric', month: 'numeric', timeZone: 'Asia/Jerusalem' });
  const timeFmt = new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jerusalem' });

  const kept = events
    .filter((e) => e.status !== 'cancelled' && involves(e, email))
    .map((e) => ({ e, at: startOf(e) }))
    .filter((x): x is { e: GEvent; at: number } => x.at !== null)
    .sort((a, b) => a.at - b.at);

  const toMeeting = ({ e, at }: { e: GEvent; at: number }): Meeting => ({
    id: e.id ?? String(at),
    title: (e.summary ?? '').trim(),
    day: dayFmt.format(new Date(at)),
    time: e.start?.dateTime ? timeFmt.format(new Date(at)) : null,
    link: e.htmlLink ?? null,
  });

  const t = now.getTime();
  const upcoming = kept.find((x) => x.at >= t) ?? null;
  const past = kept.filter((x) => x.at < t).slice(-PAST_SHOWN).reverse();
  return { next: upcoming ? toMeeting(upcoming) : null, past: past.map(toMeeting) };
}
