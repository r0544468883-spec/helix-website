'use client';

import { useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmUpdateContact, crmLogActivity } from '@/app/crm-actions';

const LIFECYCLE = ['lead', 'mql', 'sql', 'opportunity', 'customer'] as const;
const LEAD_STATUS = ['new', 'contacted', 'qualified', 'unqualified'] as const;
const TYPES = ['note', 'email', 'call', 'meeting'] as const;

export default function CrmContactPanel({
  locale,
  contactId,
  lifecycle,
  leadStatus,
  t,
}: {
  locale: string;
  contactId: string;
  lifecycle: string;
  leadStatus: string;
  t: Dict['crm'];
}) {
  const [lc, setLc] = useState(lifecycle);
  const [ls, setLs] = useState(leadStatus);
  const [type, setType] = useState<string>('note');
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();

  function updateStage(next: { lifecycle_stage?: string; lead_status?: string }) {
    startTransition(() => { void crmUpdateContact({ locale, id: contactId, ...next }); });
  }
  function log() {
    if (!body.trim()) return;
    startTransition(async () => {
      const res = await crmLogActivity({ locale, contact_id: contactId, type, body });
      if (res?.ok) setBody('');
    });
  }

  return (
    <div className="bg-surface border border-border rounded-2xl p-5">
      <div className="grid sm:grid-cols-2 gap-3 mb-5">
        <label className="block">
          <span className="text-[12px] text-ink-muted">{t.lifecycleLabel}</span>
          <select value={lc} onChange={(e) => { setLc(e.target.value); updateStage({ lifecycle_stage: e.target.value }); }} className="w-full mt-1 bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand">
            {LIFECYCLE.map((s) => <option key={s} value={s}>{t[`ls_${s}` as keyof Dict['crm']] as string}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[12px] text-ink-muted">{t.leadStatusLabel}</span>
          <select value={ls} onChange={(e) => { setLs(e.target.value); updateStage({ lead_status: e.target.value }); }} className="w-full mt-1 bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand">
            {LEAD_STATUS.map((s) => <option key={s} value={s}>{t[`lsx_${s}` as keyof Dict['crm']] as string}</option>)}
          </select>
        </label>
      </div>

      <span className="text-[12px] text-ink-muted">{t.logActivity}</span>
      <div className="flex flex-wrap gap-2 mt-1">
        <select value={type} onChange={(e) => setType(e.target.value)} className="bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand">
          {TYPES.map((ty) => <option key={ty} value={ty}>{t[`at_${ty}` as keyof Dict['crm']] as string}</option>)}
        </select>
        <input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t.activityPlaceholder} dir="auto" className="flex-1 min-w-[180px] bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand" />
        <button onClick={log} disabled={isPending} className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-semibold px-4 py-2 rounded-[10px] text-[14px]">{t.save}</button>
      </div>
    </div>
  );
}
