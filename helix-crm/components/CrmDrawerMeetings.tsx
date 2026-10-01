'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Dict } from '@/lib/i18n/he';
import type { Meeting } from '@/lib/crm-meetings';
import { crmContactMeetings, type MeetingsAnswer } from '@/app/crm-actions';
import { withTimeout } from '@/lib/use-status-change';

type View = { state: 'loading' } | MeetingsAnswer;

const MEETINGS_TIMEOUT_MS = 5_000;

/**
 * A lead's meetings from the workspace's Google Calendar, after the reminder. It
 * loads after the drawer opens, so the drawer never waits: 5 seconds, then "didn't
 * load" with a retry. Nothing is stored; each meeting links to its event. The drawer
 * keys it by lead and email, so another lead (or a changed email) loads afresh.
 * See DESIGN.md §8 — Drawer meetings. openspec: crm-connect-google-and-make, decision 6.
 */
export default function CrmDrawerMeetings({
  locale,
  contactId,
  hasEmail,
  source,
  canManage,
  t,
}: {
  locale: string;
  contactId: string;
  hasEmail: boolean;
  source: 'active' | 'lapsed';
  canManage: boolean;
  t: Dict['crm'];
}) {
  const [view, setView] = useState<View>({ state: 'loading' });
  const seq = useRef(0);

  const load = useCallback(() => {
    const mine = ++seq.current;
    setView({ state: 'loading' });
    withTimeout(crmContactMeetings({ locale, contactId }), MEETINGS_TIMEOUT_MS)
      .then((res) => {
        if (mine !== seq.current) return;             // a retry started meanwhile
        setView('state' in res ? res : { state: 'error' });
      })
      .catch(() => { if (mine === seq.current) setView({ state: 'error' }); });
  }, [locale, contactId]);

  useEffect(() => {
    if (source === 'active' && hasEmail) load();
  }, [source, hasEmail, load]);

  const shell = (body: React.ReactNode) => (
    <section aria-label={t.mtTitle} className="mb-6">
      <h3 className="font-bold text-[14px] mb-2">{t.mtTitle}</h3>
      {body}
    </section>
  );

  if (source === 'lapsed' || view.state === 'lapsed') {
    return shell(
      <p className="text-ink-muted text-[13px]">
        {t.mtLapsed}
        {canManage && <> <Link href={`/${locale}/dashboard/crm/connections`} className="text-brand-ink hover:underline font-semibold">{t.gToConnections}</Link></>}
      </p>,
    );
  }
  if (!hasEmail || view.state === 'no_email') return shell(<p className="text-ink-muted text-[13px]">{t.mtNoEmail}</p>);
  // No connection (or the lead is gone): no block at all.
  if (view.state === 'none') return null;
  if (view.state === 'loading') {
    return shell(
      <div role="status" className="h-11 bg-bg border border-border rounded-xl animate-pulse">
        <span className="sr-only">{t.mtLoading}</span>
      </div>,
    );
  }
  if (view.state === 'error') {
    return shell(
      <p role="alert" className="text-ink-muted text-[13px] flex flex-wrap items-center gap-x-2">
        {t.mtFailed}
        <button type="button" onClick={load} className="text-ink-secondary hover:text-ink font-semibold px-1 min-h-[44px]">{t.gImpRetry}</button>
      </p>,
    );
  }
  if (!view.next && view.past.length === 0) return shell(<p className="text-ink-muted text-[13px]">{t.mtNone}</p>);

  return shell(
    <div className="flex flex-col gap-2">
      {view.next && <MeetingRow m={view.next} tag={t.mtNext} t={t} />}
      {view.past.length > 0 && <p className="text-[12px] text-ink-muted mt-1">{t.mtPast}</p>}
      {view.past.map((m) => <MeetingRow key={m.id} m={m} t={t} />)}
    </div>,
  );
}

/** One meeting: [tag] day · hour, then the title. The whole row opens the event. */
function MeetingRow({ m, tag, t }: { m: Meeting; tag?: string; t: Dict['crm'] }) {
  const body = (
    <>
      {tag && <span className="text-[12px] text-ink-muted shrink-0">{tag}</span>}
      <span className="text-[12px] text-ink-secondary shrink-0 whitespace-nowrap">
        {m.day} · {m.time ?? t.mtAllDay}
      </span>
      <span className={`text-[13px] truncate flex-1 min-w-0 ${tag ? 'font-semibold' : ''}`} dir="auto">{m.title}</span>
    </>
  );
  const row = 'flex items-center gap-2 bg-bg border border-border rounded-xl p-2.5 min-h-[44px] text-start';
  if (!m.link) return <div className={row}>{body}</div>;
  return (
    <a href={m.link} target="_blank" rel="noopener noreferrer" className={`${row} hover:border-brand transition-colors`}>
      {body}
      <span className="sr-only">{t.mtOpen}</span>
    </a>
  );
}
