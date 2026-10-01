'use client';

import { useRef, useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmSaveBusiness, crmUploadBusinessLogo, crmRemoveBusinessLogo } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';
import {
  validateBusiness, businessProblemText, LOGO_MAX_BYTES,
  type Business, type BusinessInput, type BusinessField, type TextField,
} from '@/lib/crm-business';

const input = 'w-full bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';
const LOGO_ACCEPT = 'image/png,image/jpeg,image/webp';

function toInput(b: Business): BusinessInput {
  return {
    name: b.name, company_number: b.company_number, address: b.address, phone: b.phone, email: b.email,
    website: b.website, default_notes: b.default_notes, vat_exempt: b.vat_exempt, validity_days: String(b.validity_days),
  };
}

// Form order, with how each value reads. Phone, email, website and numbers are left to right.
const TEXT_FIELDS: { key: TextField; dir: 'ltr' | 'auto'; type?: string; mode?: 'tel' | 'email' | 'url' | 'numeric' }[] = [
  { key: 'name', dir: 'auto' },
  { key: 'company_number', dir: 'ltr', mode: 'numeric' },
  { key: 'address', dir: 'auto' },
  { key: 'phone', dir: 'ltr', type: 'tel', mode: 'tel' },
  { key: 'email', dir: 'ltr', type: 'email', mode: 'email' },
  { key: 'website', dir: 'ltr', mode: 'url' },
];

/**
 * פרטי העסק: the document logo and what a quote says about the business. An admin
 * edits; every other role sees the same values with nothing to edit. The logo is
 * the quote's, not the top bar's. See DESIGN.md — Business details.
 */
export default function CrmBusinessForm({
  locale,
  initial,
  canEdit,
  t,
}: {
  locale: string;
  initial: Business;
  canEdit: boolean;
  t: Dict['crm'];
}) {
  const [form, setForm] = useState<BusinessInput>(() => toInput(initial));
  const [logo, setLogo] = useState<string | null>(initial.logo_url);
  const [errors, setErrors] = useState<Partial<Record<BusinessField, string>>>({});
  const [msg, setMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [logoMsg, setLogoMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // isPending flips a render late, so a double press could slip two saves through.
  const inFlight = useRef(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const labels: Record<BusinessField, string> = {
    name: t.bizName, company_number: t.bizCompanyNumber, address: t.bizAddress, phone: t.bizPhone,
    email: t.bizEmail, website: t.bizWebsite, default_notes: t.bizNotes, validity_days: t.bizValidity,
  };

  const logoBox = (
    <div className="w-24 h-24 rounded-xl border border-border bg-bg flex items-center justify-center overflow-hidden shrink-0">
      {logo
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={logo} alt={t.bizLogo} className="max-w-full max-h-full object-contain" />
        : <span className="text-[12px] text-ink-muted">{t.bizLogoNone}</span>}
    </div>
  );

  // ---- a role that can't edit: the same values, read-only ----------------------
  if (!canEdit) {
    const rows = [
      ...TEXT_FIELDS.map(({ key, dir }) => ({ key, label: labels[key], value: form[key], dir })),
      { key: 'vat', label: t.bizVatStatus, value: form.vat_exempt ? t.bizVatExempt : t.bizVatLicensed, dir: 'auto' as const },
      { key: 'validity_days', label: t.bizValidity, value: form.validity_days, dir: 'ltr' as const },
      { key: 'default_notes', label: t.bizNotes, value: form.default_notes, dir: 'auto' as const },
    ].filter((r) => r.value);
    return (
      <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-5">
        <div className="flex items-center gap-4">
          {logoBox}
          <p className="text-[13px] text-ink-muted">{t.bizReadonly}</p>
        </div>
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[14px]">
          {rows.map((r) => (
            <div key={r.key} className="contents">
              <dt className="text-ink-muted whitespace-nowrap">{r.label}</dt>
              <dd className="text-ink min-w-0 break-words whitespace-pre-line" dir={r.dir}>{r.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  }

  // ---- the admin's form ------------------------------------------------------------
  function save() {
    if (inFlight.current) return;
    const checked = validateBusiness(form);
    if (!checked.ok) {
      setErrors(Object.fromEntries(checked.problems.map((p) => [p.field, businessProblemText(p, t, locale)])));
      setMsg(null);
      return;
    }
    inFlight.current = true;
    setErrors({});
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmSaveBusiness({ locale, ...form }));
      inFlight.current = false;
      if (res && 'ok' in res && res.ok) { setMsg({ kind: 'ok', text: t.bizSaved }); return; }
      if (res && 'field' in res && res.field && res.message) { setErrors({ [res.field]: res.message }); return; }
      setMsg({ kind: 'err', text: res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.bizSaveFailed, t) });
    });
  }

  function upload(file: File) {
    setLogoMsg(null);
    // The server checks the bytes; these two only save a round trip for the obvious cases.
    if (!LOGO_ACCEPT.split(',').includes(file.type)) { setLogoMsg(t.errBizLogoType); return; }
    if (file.size > LOGO_MAX_BYTES) { setLogoMsg(t.errBizLogoSize); return; }
    const fd = new FormData();
    fd.set('locale', locale);
    fd.set('file', file);
    startTransition(async () => {
      const res = await withTimeout(crmUploadBusinessLogo(fd), 30_000);
      if (res && 'ok' in res && res.ok && 'url' in res) { setLogo(res.url as string); return; }
      setLogoMsg(res && 'error' in res && res.error === 'timeout' ? t.errBizLogoFailed : failureText(res, t.errBizLogoFailed, t));
    });
  }

  function removeLogo() {
    setLogoMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmRemoveBusinessLogo({ locale }));
      if (res && 'ok' in res && res.ok) { setLogo(null); return; }
      setLogoMsg(failureText(res, t.errBizLogoFailed, t));
    });
  }

  const error = (key: BusinessField) => errors[key] && (
    <p id={`biz-err-${key}`} role="alert" className="text-danger text-[13px] mt-1">{errors[key]}</p>
  );
  const described = (key: BusinessField) => errors[key]
    ? { 'aria-invalid': true as const, 'aria-describedby': `biz-err-${key}` }
    : {};

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 flex flex-col gap-5">
      {/* the document logo */}
      <div>
        <p className="text-[12px] text-ink-muted mb-2">{t.bizLogo}</p>
        <div className="flex flex-wrap items-center gap-4">
          {logoBox}
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept={LOGO_ACCEPT}
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ''; }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={isPending}
              className="border border-border hover:border-brand text-ink-secondary hover:text-ink font-semibold px-4 rounded-[10px] text-[14px] min-h-[44px] transition-colors disabled:opacity-50"
            >
              {logo ? t.bizLogoReplace : t.bizLogoUpload}
            </button>
            {logo && (
              <button type="button" onClick={removeLogo} disabled={isPending} className="text-ink-secondary hover:text-ink px-3 text-[14px] min-h-[44px] disabled:opacity-50">
                {t.bizLogoRemove}
              </button>
            )}
          </div>
        </div>
        <p className="text-[12px] text-ink-muted mt-2">{t.bizLogoHint}</p>
        {logoMsg && <p role="alert" className="text-danger text-[13px] mt-1">{logoMsg}</p>}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TEXT_FIELDS.map(({ key, dir, type, mode }) => (
          <div key={key}>
            <label htmlFor={`biz-${key}`} className="block text-[12px] text-ink-muted">{labels[key]}</label>
            <input
              id={`biz-${key}`}
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              dir={dir}
              type={type ?? 'text'}
              inputMode={mode}
              className={`mt-1 ${input}`}
              {...described(key)}
            />
            {error(key)}
          </div>
        ))}
        <div>
          <label htmlFor="biz-vat" className="block text-[12px] text-ink-muted">{t.bizVatStatus}</label>
          <select
            id="biz-vat"
            value={form.vat_exempt ? 'exempt' : 'licensed'}
            onChange={(e) => setForm({ ...form, vat_exempt: e.target.value === 'exempt' })}
            className={`mt-1 ${input}`}
          >
            <option value="licensed">{t.bizVatLicensed}</option>
            <option value="exempt">{t.bizVatExempt}</option>
          </select>
        </div>
        <div>
          <label htmlFor="biz-validity_days" className="block text-[12px] text-ink-muted">{labels.validity_days}</label>
          <input
            id="biz-validity_days"
            value={form.validity_days}
            onChange={(e) => setForm({ ...form, validity_days: e.target.value })}
            dir="ltr"
            inputMode="numeric"
            className={`mt-1 ${input}`}
            {...described('validity_days')}
          />
          {error('validity_days')}
        </div>
        <div className="md:col-span-2">
          <label htmlFor="biz-default_notes" className="block text-[12px] text-ink-muted">{labels.default_notes}</label>
          <textarea
            id="biz-default_notes"
            value={form.default_notes}
            onChange={(e) => setForm({ ...form, default_notes: e.target.value })}
            dir="auto"
            rows={3}
            className={`mt-1 ${input} resize-y`}
            {...described('default_notes')}
          />
          {error('default_notes')}
        </div>
      </div>

      <div>
        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-5 rounded-[10px] text-[14px] min-h-[44px]"
        >
          {t.save}
        </button>
        {msg && (
          <p role={msg.kind === 'err' ? 'alert' : 'status'} aria-live="polite" className={`text-[13px] mt-2 ${msg.kind === 'err' ? 'text-danger' : 'text-ink-secondary'}`}>
            {msg.text}
          </p>
        )}
      </div>
    </div>
  );
}
