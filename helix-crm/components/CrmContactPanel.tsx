'use client';

import { useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmUpdateContact, crmLogActivity } from '@/app/crm-actions';
import { CONTACT_STATUSES, STATUS_BADGE, isContactStatus, type ContactStatus } from '@/lib/crm-status';

const TYPES = ['note', 'email', 'call', 'meeting'] as const;

// One status control, not two. It used to be a lifecycle_stage select beside a
// lead_status select — twenty combinations for one person, two of them named mql
// and sql. See DESIGN.md — CRM contact status.
export default function CrmContactPanel({
  locale,
  contactId,
  status,
  readOnly = false,
  t,
}: {
  locale: string;
  contactId: string;
  status: string;
  /** viewer role: the status badge only — no select, no activity logger. */
  readOnly?: boolean;
  t: Dict['crm'];
}) {
  const initial: ContactStatus = isContactStatus(status) ? status : 'new';
  const [st, setSt] = useState<ContactStatus>(initial);
  const [err, setErr] = useState<string | null>(null);
  const [type, setType] = useState<string>('note');
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();

  function changeStatus(next: ContactStatus) {
    const prev = st;
    setSt(next);          // optimistic: the chip reads the new value at full opacity
    setErr(null);
    startTransition(async () => {
      const res = await crmUpdateContact({ locale, id: contactId, status: next });
      if (res && 'error' in res && res.error) {
        setSt(prev);      // not stored, so do not keep showing it
        setErr(res.error === 'auth' ? t.sessionExpired : ('message' in res && res.message) || t.statusFailed);
      }
    });
  }

  function log() {
    if (!body.trim()) return;
    startTransition(async () => {
      const res = await crmLogActivity({ locale, contact_id: contactId, type, body });
      if (res?.ok) setBody('');
      else if (res && 'message' in res && res.message) setErr(res.message);
    });
  }

  const label = (s: ContactStatus) => t[`cs_${s}` as keyof Dict['crm']] as string;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="mb-5">
        <span className="text-[12px] text-ink-muted">{t.statusLabel}</span>
        <div className="flex flex-wrap items-center gap-3 mt-1">
          <span className={`text-[12px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[st]}`}>
            {label(st)}
          </span>
          {!readOnly && <select
            value={st}
            onChange={(e) => { if (isContactStatus(e.target.value)) changeStatus(e.target.value); }}
            aria-label={t.statusLabel}
            className="bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]"
          >
            {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{label(s)}</option>)}
          </select>}
        </div>
        {err && <p role="alert" aria-live="polite" className="text-red-400 text-[13px] mt-2">{err}</p>}
      </div>

      {!readOnly && <>
      <span className="text-[12px] text-ink-muted">{t.logActivity}</span>
      <div className="flex flex-wrap gap-2 mt-1">
        <select value={type} onChange={(e) => setType(e.target.value)} className="bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand">
          {TYPES.map((ty) => <option key={ty} value={ty}>{t[`at_${ty}` as keyof Dict['crm']] as string}</option>)}
        </select>
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t.activityPlaceholder} dir="auto" className="flex-1 min-w-[180px] bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand" />
        <button onClick={log} disabled={isPending} className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-semibold px-4 py-2 rounded-[10px] text-[14px]">{t.save}</button>
      </div>
      </>}
    </div>
  );
}
