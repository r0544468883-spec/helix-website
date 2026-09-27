'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmCreateContact } from '@/app/crm-actions';
import { Sheet } from '@/lib/motion/Sheet';
import { CONTACT_STATUSES } from '@/lib/crm-status';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// A server action has no timeout of its own. Without this, a connection that drops
// mid-save leaves the form spinning with no explanation.
const SAVE_TIMEOUT_MS = 15_000;

const EMPTY = { full_name: '', email: '', phone: '', role_title: '', status: 'new', company_id: '' };

// The form used to open as a w-full card wedged into the header's flex row, which
// crushed it between four siblings. It is a Sheet above the board now, so the board
// keeps its layout. See DESIGN.md — CRM Shell / intake.
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
  const [f, setF] = useState(EMPTY);
  const [err, setErr] = useState<string | null>(null);
  const [askDiscard, setAskDiscard] = useState(false);
  const [isPending, startTransition] = useTransition();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  // isPending only flips on the next render, so a double-click can slip two saves
  // through before it is true. This ref closes that window.
  const inFlight = useRef(false);

  const dirty = Object.entries(f).some(([k, v]) =>
    k === 'status' ? v !== 'new' : v.trim() !== ''
  );

  useEffect(() => {
    if (open) nameRef.current?.focus();
  }, [open]);

  function reallyClose() {
    setOpen(false);
    setAskDiscard(false);
    setErr(null);
    triggerRef.current?.focus();
  }

  // Escape and scrim both land here. A form with content asks before discarding.
  function attemptClose() {
    if (dirty) setAskDiscard(true);
    else reallyClose();
  }

  function submit() {
    if (inFlight.current) return;
    if (!f.full_name.trim()) {
      setErr(t.errNameRequired);
      nameRef.current?.focus();
      return;
    }
    if (f.email.trim() && !EMAIL_RE.test(f.email.trim())) {
      setErr(t.errEmailInvalid);
      return;
    }
    setErr(null);
    inFlight.current = true;
    startTransition(async () => {
      try {
        const res = await Promise.race([
          crmCreateContact({ locale, ...f, company_id: f.company_id || undefined }),
          new Promise<{ error: string }>((resolve) =>
            setTimeout(() => resolve({ error: 'timeout' }), SAVE_TIMEOUT_MS)
          ),
        ]);
        if (res && 'ok' in res && res.ok) {
          setF(EMPTY);
          reallyClose();
          return;
        }
        const code = res && 'error' in res ? res.error : 'failed';
        setErr(code === 'auth' ? t.sessionExpired : t.errSaveFailed);
      } catch {
        setErr(t.errSaveFailed);
      } finally {
        inFlight.current = false;
      }
    });
  }

  const field = 'bg-bg border border-border rounded-[10px] px-3 py-2.5 text-[15px] outline-none focus:border-brand';

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="bg-brand hover:bg-brand-hover text-bg font-bold px-5 py-2.5 rounded-[10px] transition-colors min-h-[44px]"
      >
        + {t.addContact}
      </button>

      <Sheet open={open} onClose={attemptClose} maxWidth={560}>
        {askDiscard ? (
          <div className="text-ink">
            <p className="font-bold text-[16px] mb-4">{t.discardAsk}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => { setF(EMPTY); reallyClose(); }}
                className="bg-brand hover:bg-brand-hover text-bg font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.discardYes}
              </button>
              <button
                type="button"
                onClick={() => setAskDiscard(false)}
                className="border border-border text-ink-secondary hover:text-ink px-5 py-2.5 rounded-[10px] min-h-[44px]"
              >
                {t.discardNo}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-ink">
            <h2 className="font-bold text-[16px] mb-4">{t.addContact}</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <input ref={nameRef} value={f.full_name} onChange={(e) => setF({ ...f, full_name: e.target.value })} placeholder={t.fName} dir="auto" className={field} />
              <input value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder={t.fEmail} dir="ltr" inputMode="email" className={field} />
              <input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder={t.fPhone} dir="ltr" inputMode="tel" className={field} />
              <input value={f.role_title} onChange={(e) => setF({ ...f, role_title: e.target.value })} placeholder={t.fRole} dir="auto" className={field} />
              <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })} className={field} aria-label={t.statusLabel}>
                {CONTACT_STATUSES.map((s) => <option key={s} value={s}>{t[`cs_${s}` as keyof Dict['crm']] as string}</option>)}
              </select>
              <select value={f.company_id} onChange={(e) => setF({ ...f, company_id: e.target.value })} className={field}>
                <option value="">{t.fNoCompany}</option>
                {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {err && (
              <p role="alert" aria-live="polite" className="text-red-400 text-[13px] mt-3">{err}</p>
            )}

            <div className="flex gap-2 mt-4">
              <button type="button" onClick={submit} disabled={isPending} className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-bg font-semibold px-5 py-2.5 rounded-[10px] min-h-[44px]">{t.save}</button>
              <button type="button" onClick={attemptClose} className="border border-border text-ink-secondary hover:text-ink px-5 py-2.5 rounded-[10px] min-h-[44px]">{t.cancel}</button>
            </div>
          </div>
        )}
      </Sheet>
    </>
  );
}
