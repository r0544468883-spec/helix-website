'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { autoCreate } from '@/app/automations-actions';
import { AUTOMATION_TEMPLATES } from '@/lib/automations/templates';

export default function NewAutomationButton({ locale }: { locale: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  function create(templateKey?: string) {
    start(async () => {
      const res = await autoCreate({ locale, templateKey });
      if (res.ok && res.id) router.push(`/${locale}/dashboard/automations/${res.id}`);
    });
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={pending}
        className="bg-brand hover:bg-brand-hover text-bg font-bold px-4 py-2.5 rounded-[10px] text-[14px] disabled:opacity-50"
      >
        {pending ? '...' : '＋ אוטומציה חדשה'}
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute z-20 mt-2 end-0 w-80 bg-surface border border-border rounded-xl shadow-xl p-1.5">
            <button onClick={() => create()} className="w-full text-start px-3 py-2 rounded-lg hover:bg-white/5 text-[14px] font-semibold">
              קנבאס ריק
            </button>
            <div className="text-[11px] text-ink-muted px-3 py-1.5">או התחל מתבנית</div>
            {AUTOMATION_TEMPLATES.map((t) => (
              <button key={t.key} onClick={() => create(t.key)} className="w-full text-start px-3 py-2 rounded-lg hover:bg-white/5">
                <div className="text-[13px] font-semibold" dir="auto">{t.name}</div>
                <div className="text-[11px] text-ink-muted" dir="auto">{t.desc}</div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
