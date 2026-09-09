'use client';

import { useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmCreateContact } from '@/app/crm-actions';

const LIFECYCLE = ['lead', 'mql', 'sql', 'opportunity', 'customer'] as const;

export default function CrmAddContact({
  locale,
  companies,
  t,
}: {
  locale: string;
  companies: { id: string; name: string }[];
  t: Dict['crm'];
}) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ full_name: '', email: '', phone: '', role_title: '', lifecycle_stage: 'lead', company_id: '' });
  const [isPending, startTransition] = useTransition();

  function submit() {
    if (!f.full_name.trim()) return;
    startTransition(async () => {
      const res = await crmCreateContact({ locale, ...f, company_id: f.company_id || undefined });
      if (res?.ok) {
        setF({ full_name: '', email: '', phone: '', role_title: '', lifecycle_stage: 'lead', company_id: '' });
        setOpen(false);
      }
    });
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="bg-brand hover:bg-brand-hover text-bg font-bold px-5 py-2.5 rounded-[10px] transition-colors">
        + {t.addContact}
      </button>
    );
  }

  return (
    <div className="w-full bg-surface border border-border rounded-2xl p-5 mt-2">
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} placeholder={t.fName} dir="auto" className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand" />
        <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder={t.fEmail} dir="ltr" className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand" />
        <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder={t.fPhone} dir="ltr" className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand" />
        <input value={f.role_title} onChange={(e) => setF({ ...f, role_title: e.target.value })} placeholder={t.fRole} dir="auto" className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand" />
        <select value={f.lifecycle_stage} onChange={(e) => setF({ ...f, lifecycle_stage: e.target.value })} className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand">
          {LIFECYCLE.map((s) => <option key={s} value={s}>{t[`ls_${s}` as keyof Dict['crm']] as string}</option>)}
        </select>
        <select value={f.company_id} onChange={(e) => setF({ ...f, company_id: e.target.value })} className="bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand">
          <option value="">{t.fNoCompany}</option>
          {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={submit} disabled={isPending} className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-semibold px-5 py-2 rounded-[10px]">{t.save}</button>
        <button onClick={() => setOpen(false)} className="border border-border text-ink-secondary hover:text-ink px-5 py-2 rounded-[10px]">{t.cancel}</button>
      </div>
    </div>
  );
}
