// Calendar dates for next steps. crm_tasks.due_date is a `date`, so these work in
// "YYYY-MM-DD" strings and never in local Date objects that carry a timezone.

/** A real calendar date in "YYYY-MM-DD", as a date input sends it. 2026-02-30 is not one. */
export function isIsoDate(v: unknown): v is string {
  if (typeof v !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(`${v}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === v;
}

/** Today in Israel, where the people using this live. UTC is a day behind until 03:00. */
export function todayInIsrael(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(now);
}

/**
 * Whole calendar days from `from` to `to`, both "YYYY-MM-DD". Calendar days, not
 * 24-hour periods: a change made yesterday at 18:00 is one day old this morning.
 */
export function daysBetweenIso(from: string, to: string): number {
  return Math.round((utcDay(to) - utcDay(from)) / 86_400_000);
}

function utcDay(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

/**
 * Days a contact has been in its status, in Israeli calendar days: from its newest
 * recorded status change, or from creation for a `new` contact never moved. null
 * when neither applies — a status set before changes were recorded has no honest
 * count, so none is shown.
 */
export function statusDays(status: string, lastMoveAt: string | null, createdAt: string | null, now: Date = new Date()): number | null {
  const since = lastMoveAt ?? (status === 'new' ? createdAt : null);
  if (!since) return null;
  const at = new Date(since);
  if (Number.isNaN(at.getTime())) return null;
  return Math.max(0, daysBetweenIso(todayInIsrael(at), todayInIsrael(now)));
}

const DAY_MS = 86_400_000;

/**
 * "לפני 3 ימים" / "3 days ago", or `never` when there is no time. Computed on the
 * server, so a row's text does not differ between server and browser clocks. Day
 * granularity: stale by at most one page load. Used by every screen that shows a
 * last touch (the contacts list, the drawer, Companies).
 */
export function relativeDays(iso: string | null, locale: string, never: string): string {
  if (!iso) return never;
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / DAY_MS);
  const rtf = new Intl.RelativeTimeFormat(locale === 'en' ? 'en' : 'he', { numeric: 'auto' });
  if (days < 60) return rtf.format(-Math.max(0, days), 'day');
  return rtf.format(-Math.floor(days / 30), 'month');
}

/**
 * How long ago a contact was added, in Israeli calendar days: added at 23:30 on the
 * 3rd is three days old on the 6th, whatever zone the server runs in.
 */
export function daysAgoInIsrael(iso: string, locale: string): string {
  const days = Math.max(0, daysBetweenIso(todayInIsrael(new Date(iso)), todayInIsrael()));
  const rtf = new Intl.RelativeTimeFormat(locale === 'en' ? 'en' : 'he', { numeric: 'auto' });
  if (days < 60) return rtf.format(-days, 'day');
  return rtf.format(-Math.floor(days / 30), 'month');
}

/** Calendar days later: 30/9 plus one is 1/10. The reminder's quick picks count from todayInIsrael(). */
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

/** Calendar months later, clamped to the month's last day: 31/1 plus a month is 28/2, not 3/3. */
export function addMonthsIso(iso: string, months: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const index = m - 1 + months;
  const year = y + Math.floor(index / 12);
  const month = ((index % 12) + 12) % 12;
  const last = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(Math.min(d, last)).padStart(2, '0')}`;
}
