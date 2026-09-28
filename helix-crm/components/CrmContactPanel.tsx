'use client';

import { useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmLogActivity } from '@/app/crm-actions';
import { STATUS_BADGE } from '@/lib/crm-status';
import { useStatusChange } from '@/lib/use-status-change';
import CrmStatusPath from '@/components/CrmStatusPath';
import CrmStatusFeedback from '@/components/CrmStatusFeedback';

const TYPES = ['note', 'email', 'call', 'meeting'] as const;

// The same status path as the drawer, so the product has one status control. This
// used to be a dropdown, and before that two (lifecycle_stage beside lead_status,
// twenty combinations for one person). See DESIGN.md — Status path.
export default function CrmContactPanel({
  locale,
  contactId,
  contactName,
  status,
  readOnly = false,
  t,
}: {
  locale: string;
  contactId: string;
  /** For the next step a freeze offers to set: "לחזור אל {name}". */
  contactName: string;
  status: string;
  /** viewer role: the path without controls, and no activity logger. */
  readOnly?: boolean;
  t: Dict['crm'];
}) {
  const statusCtl = useStatusChange({ locale, contactId, contactName, initial: status, t });
  const [err, setErr] = useState<string | null>(null);
  const [type, setType] = useState<string>('note');
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();

  function log() {
    if (!body.trim()) return;
    startTransition(async () => {
      const res = await crmLogActivity({ locale, contact_id: contactId, type, body });
      if (res?.ok) setBody('');
      else if (res && 'message' in res && res.message) setErr(res.message);
    });
  }

  const st = statusCtl.status;

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="mb-5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-ink-muted">{t.statusLabel}</span>
          <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${STATUS_BADGE[st]}`}>
            {t[`cs_${st}`]}
          </span>
        </div>
        <div className="mt-2">
          <CrmStatusPath locale={locale} status={st} readOnly={readOnly} onChange={statusCtl.change} t={t} />
        </div>
        {!readOnly && <CrmStatusFeedback status={statusCtl} t={t} />}
      </div>

      {!readOnly && <>
      <span className="text-[12px] text-ink-muted">{t.logActivity}</span>
      <div className="flex flex-wrap gap-2 mt-1">
        <select value={type} onChange={(e) => setType(e.target.value)} className="bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand">
          {TYPES.map((ty) => <option key={ty} value={ty}>{t[`at_${ty}` as keyof Dict['crm']] as string}</option>)}
        </select>
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t.activityPlaceholder} dir="auto" className="flex-1 min-w-[180px] bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand" />
        <button onClick={log} disabled={isPending} className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-semibold px-4 py-2 rounded-[10px] text-[14px]">{t.save}</button>
      </div>
      {err && <p role="alert" aria-live="polite" className="text-danger text-[13px] mt-2">{err}</p>}
      </>}
    </div>
  );
}
