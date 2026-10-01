'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import type { Dict } from '@/lib/i18n/he';
import { crmUpdateContactDetails } from '@/app/crm-actions';
import { withTimeout, failureText } from '@/lib/use-status-change';
import {
  validateContactDetails, problemText, safeHttpUrl, type ContactDetailsInput, type ContactField,
} from '@/lib/crm-contact-fields';
import { statusKey, isContactStatus } from '@/lib/crm-status';
import type { DrawerContact } from '@/components/CrmContactDrawer';

/** The form as typed. null means the details are showing, not being edited. */
export type DetailsDraft = ContactDetailsInput;

const KNOWN_SOURCES = ['manual', 'api', 'chief', 'import', 'facebook_lead_ads', 'google_contacts'] as const;
type KnownSource = (typeof KNOWN_SOURCES)[number];
const isKnownSource = (s: string): s is KnownSource => (KNOWN_SOURCES as readonly string[]).includes(s);

/** The source as the drawer shows it: a Hebrew name for the CRM's own values, else as stored. */
function shownSource(source: string | null, t: Dict['crm']): string {
  if (!source) return '';
  return isKnownSource(source) ? t[`src_${source}`] : source;
}

/** The form filled from what is stored. A known source shows by its name. */
export function draftFrom(c: DrawerContact, t: Dict['crm']): DetailsDraft {
  return {
    full_name: c.full_name,
    phone: c.phone ?? '',
    email: c.email ?? '',
    company_id: c.company_id ?? '',
    role_title: c.role_title ?? '',
    linkedin_url: c.linkedin_url ?? '',
    source: shownSource(c.source, t),
    notes: c.notes ?? '',
  };
}

/** True when the form holds something the contact doesn't: closing then asks first. */
export function detailsChanged(draft: DetailsDraft | null, c: DrawerContact, t: Dict['crm']): boolean {
  if (!draft) return false;
  const stored = draftFrom(c, t);
  return (Object.keys(stored) as ContactField[]).some((k) => draft[k].trim() !== stored[k].trim());
}

const input = 'w-full bg-bg border border-border rounded-[10px] px-3 py-2 text-[14px] outline-none focus:border-brand min-h-[44px]';

// Form order. Each field's label and how it reads.
const FIELDS: { key: ContactField; dir: 'ltr' | 'auto'; mode?: 'tel' | 'email' | 'url' }[] = [
  { key: 'full_name', dir: 'auto' },
  { key: 'phone', dir: 'ltr', mode: 'tel' },
  { key: 'email', dir: 'ltr', mode: 'email' },
  { key: 'company_id', dir: 'auto' },
  { key: 'role_title', dir: 'auto' },
  { key: 'linkedin_url', dir: 'ltr', mode: 'url' },
  { key: 'source', dir: 'auto' },
  { key: 'notes', dir: 'auto' },
];

/**
 * Who the lead is, under labels: the first region of the drawer's body. Only
 * filled fields are rows; a writer gets one line naming the empty ones, which
 * opens the form on the first of them. "עריכה" turns the rows into one form with
 * one save. An edit is not a touch: no timeline row, last touch unchanged. The
 * rules are lib/crm-contact-fields.ts, run here first and again on the server.
 * See DESIGN.md — Contact details.
 */
export default function CrmContactDetails({
  locale,
  contact: c,
  companies,
  readOnly = false,
  draft,
  setDraft,
  t,
}: {
  locale: string;
  contact: DrawerContact;
  companies: { id: string; name: string }[];
  /** viewer role: the rows only, with no add line and no edit control. */
  readOnly?: boolean;
  /** Held by the drawer, so closing can ask before discarding it. */
  draft: DetailsDraft | null;
  setDraft: (d: DetailsDraft | null) => void;
  t: Dict['crm'];
}) {
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // isPending flips a render late, so a double press could slip two saves through.
  const inFlight = useRef(false);
  const fieldRefs = useRef<Partial<Record<ContactField, HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null>>>({});
  const [focusField, setFocusField] = useState<ContactField | null>(null);

  useEffect(() => { setErrors({}); setMsg(null); }, [c.id]);
  useEffect(() => {
    if (!draft || !focusField) return;
    fieldRefs.current[focusField]?.focus();
    setFocusField(null);
  }, [draft, focusField]);

  const labels: Record<ContactField, string> = {
    full_name: t.fName,
    phone: t.fPhone,
    email: t.fEmail,
    company_id: t.detCompany,
    role_title: t.fRole,
    linkedin_url: t.detLinkedIn,
    source: t.detSource,
    notes: t.detNotes,
  };

  // The editable fields with nothing stored, in form order (the name is never empty).
  const empty = FIELDS.map((f) => f.key).filter((k) => k !== 'full_name' && !draftFrom(c, t)[k].trim());

  function startEdit(first: ContactField = 'full_name') {
    setErrors({});
    setMsg(null);
    setDraft(draftFrom(c, t));
    setFocusField(first);
  }

  function cancel() {
    setDraft(null);
    setErrors({});
    setMsg(null);
  }

  function save() {
    if (!draft || inFlight.current) return;
    // A known source shown by its name goes back as the value it was stored as.
    const payload: ContactDetailsInput = {
      ...draft,
      source: draft.source.trim() === shownSource(c.source, t) ? (c.source ?? '') : draft.source,
    };
    const checked = validateContactDetails(payload);
    if (!checked.ok) {
      setErrors(Object.fromEntries(checked.problems.map((p) => [p.field, problemText(p, t, locale)])));
      fieldRefs.current[checked.problems[0].field]?.focus();
      return;
    }
    inFlight.current = true;
    setErrors({});
    setMsg(null);
    startTransition(async () => {
      const res = await withTimeout(crmUpdateContactDetails({ locale, id: c.id, ...payload }));
      inFlight.current = false;
      if (res && 'ok' in res && res.ok) {
        setDraft(null);
        return;
      }
      if (res && 'field' in res && res.field && res.message) {
        setErrors({ [res.field]: res.message });
        return;
      }
      setMsg(res && 'error' in res && res.error === 'timeout' ? t.saveTimeout : failureText(res, t.detSaveFailed, t));
    });
  }

  // ---- the rows ----------------------------------------------------------------
  const rows: { key: string; label: string; value: React.ReactNode }[] = [];
  if (c.phone) rows.push({ key: 'phone', label: labels.phone, value: <a href={`tel:${c.phone}`} dir="ltr" className="text-brand-ink hover:underline">{c.phone}</a> });
  if (c.email) rows.push({ key: 'email', label: labels.email, value: <a href={`mailto:${c.email}`} dir="ltr" className="text-brand-ink hover:underline break-all">{c.email}</a> });
  if (c.company) rows.push({ key: 'company', label: labels.company_id, value: <span dir="auto">{c.company}</span> });
  if (c.role_title) rows.push({ key: 'role', label: labels.role_title, value: <span dir="auto">{c.role_title}</span> });
  if (c.linkedin_url) {
    // Only an http(s) address is ever a link: a stored "javascript:" would run on click.
    const href = safeHttpUrl(c.linkedin_url);
    rows.push({
      key: 'linkedin',
      label: labels.linkedin_url,
      value: href
        ? <a href={href} target="_blank" rel="noopener noreferrer" dir="ltr" className="block truncate text-brand-ink hover:underline">{href.replace(/^https?:\/\/(www\.)?/, '')}</a>
        : <span dir="ltr" className="break-all">{c.linkedin_url}</span>,
    });
  }
  if (c.source) {
    rows.push({
      key: 'source',
      label: labels.source,
      value: isKnownSource(c.source) ? t[`src_${c.source}`] : <span dir="ltr">{c.source}</span>,
    });
  }
  if (c.notes) rows.push({ key: 'notes', label: labels.notes, value: <span dir="auto" className="whitespace-pre-line">{c.notes}</span> });
  if (c.added) rows.push({ key: 'added', label: t.detAdded, value: <><bdi dir="ltr">{c.added.date}</bdi> · {c.added.ago}</> });
  rows.push({ key: 'touch', label: t.lastTouchLabel, value: c.lastTouch });
  const signalText = c.signals
    .map((s) => (s === 'status' ? (isContactStatus(c.status) ? t[statusKey(c.status)] : null) : t[`scoreSignal_${s}`]))
    .filter(Boolean)
    .join(' · ');
  rows.push({
    key: 'score',
    label: t.detScore,
    value: (
      <>
        {/* The tier word is text, never a tier colour: status owns colour (DESIGN.md §3). */}
        <span className="font-mono text-ink">{c.score}</span>
        <span className="text-ink-secondary"> · {t[c.tier]}</span>
        {signalText && <span className="text-ink-muted"> · {signalText}</span>}
      </>
    ),
  });

  return (
    <section aria-label={t.detailsTitle} className="mb-5">
      <div className="flex items-center justify-between gap-2 mb-2">
        <h3 className="font-bold text-[14px]">{t.detailsTitle}</h3>
        {!readOnly && !draft && (
          <button
            type="button"
            onClick={() => startEdit()}
            className="text-ink-secondary hover:text-ink px-3 text-[13px] min-h-[44px]"
          >
            {t.detailsEdit}
          </button>
        )}
      </div>

      {!draft ? (
        <>
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-[13px]">
            {rows.map((r) => (
              <div key={r.key} className="contents">
                <dt className="text-ink-muted whitespace-nowrap">{r.label}</dt>
                <dd className="text-ink min-w-0 break-words">{r.value}</dd>
              </div>
            ))}
          </dl>
          {!readOnly && empty.length > 0 && (
            <button
              type="button"
              onClick={() => startEdit(empty[0])}
              className="block text-start text-[13px] text-ink-secondary hover:text-ink min-h-[44px]"
            >
              {t.detAddLine.replace('{fields}', empty.map((k) => labels[k]).join(', '))}
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col gap-3">
          {FIELDS.map(({ key, dir, mode }) => {
            const err = errors[key];
            const errId = `detail-err-${key}`;
            const common = {
              id: `detail-${key}`,
              'aria-invalid': err ? true : undefined,
              'aria-describedby': err ? errId : undefined,
            };
            return (
              <div key={key}>
                <label htmlFor={`detail-${key}`} className="block text-[12px] text-ink-muted">{labels[key]}</label>
                {key === 'company_id' ? (
                  <select
                    {...common}
                    ref={(el) => { fieldRefs.current[key] = el; }}
                    value={draft.company_id}
                    onChange={(e) => setDraft({ ...draft, company_id: e.target.value })}
                    className={`mt-1 ${input}`}
                  >
                    <option value="">{t.fNoCompany}</option>
                    {companies.map((co) => <option key={co.id} value={co.id}>{co.name}</option>)}
                  </select>
                ) : key === 'notes' ? (
                  <textarea
                    {...common}
                    ref={(el) => { fieldRefs.current[key] = el; }}
                    value={draft.notes}
                    onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
                    placeholder={t.detNotesPlaceholder}
                    dir={dir}
                    rows={4}
                    className={`mt-1 ${input} resize-y`}
                  />
                ) : (
                  <input
                    {...common}
                    ref={(el) => { fieldRefs.current[key] = el; }}
                    value={draft[key]}
                    onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
                    onKeyDown={(e) => { if (e.key === 'Enter') save(); }}
                    placeholder={key === 'linkedin_url' ? 'https://www.linkedin.com/in/…' : undefined}
                    dir={dir}
                    inputMode={mode}
                    type={mode === 'email' ? 'email' : mode === 'tel' ? 'tel' : 'text'}
                    className={`mt-1 ${input}`}
                  />
                )}
                {err && <p id={errId} role="alert" className="text-danger text-[13px] mt-1">{err}</p>}
              </div>
            );
          })}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={save}
              disabled={!draft.full_name.trim() || isPending}
              className="bg-brand hover:bg-brand-hover disabled:opacity-50 text-on-brand font-bold px-4 rounded-[10px] text-[14px] min-h-[44px]"
            >
              {t.save}
            </button>
            <button type="button" onClick={cancel} className="text-ink-secondary hover:text-ink px-3 text-[14px] min-h-[44px]">
              {t.cancel}
            </button>
          </div>
          {msg && <p role="alert" aria-live="polite" className="text-danger text-[13px]">{msg}</p>}
        </div>
      )}
    </section>
  );
}
