'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'error';
type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'form', string>>;

const ERROR_MAP: Record<string, FieldErrors> = {
  invalid_name: { name: 'שם הוא שדה חובה' },
  invalid_email: { email: 'אימייל לא תקין' },
  invalid_phone: { phone: 'טלפון לא תקין — נדרש מספר ישראלי (05X-XXX-XXXX)' },
  invalid_url: { form: 'כתובת האתר חסרה. סרקו אתר קודם.' },
  scan_failed: { form: 'לא הצלחנו לסרוק את האתר שוב. נסו שוב.' },
  send_failed: { form: 'משהו נכשל. נסו שוב או שלחו הודעה ב-WhatsApp.' },
};

type Props = {
  /** The URL that was scanned — sent hidden so the report can be re-run server-side. */
  url: string;
  /** Called with the unlocked full report payload. */
  onUnlock: (report: unknown) => void;
};

export default function GeoLeadForm({ url, onUnlock }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrors({});

    const fd = new FormData(e.currentTarget);
    const payload = {
      url,
      name: String(fd.get('name') ?? ''),
      email: String(fd.get('email') ?? ''),
      phone: String(fd.get('phone') ?? ''),
      company: String(fd.get('company') ?? ''),
    };

    try {
      const res = await fetch('/api/geo-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string; report?: unknown };
      if (data.ok) {
        onUnlock(data.report);
        return;
      }
      setErrors(ERROR_MAP[data.error ?? ''] ?? { form: 'משהו השתבש. נסו שוב.' });
      setStatus('error');
    } catch {
      setErrors({ form: 'תקלת רשת. נסו שוב או שלחו הודעה ב-WhatsApp.' });
      setStatus('error');
    }
  }

  const isSubmitting = status === 'submitting';

  return (
    <form className="vc-form geo-lead-form" onSubmit={onSubmit} noValidate>
      <div className="vc-field">
        <label htmlFor="geo-name">שם מלא</label>
        <input id="geo-name" name="name" type="text" autoComplete="name" required
          aria-invalid={!!errors.name} />
        {errors.name && <p className="vc-error">{errors.name}</p>}
      </div>

      <div className="vc-field">
        <label htmlFor="geo-email">אימייל</label>
        <input id="geo-email" name="email" type="email" autoComplete="email" required
          aria-invalid={!!errors.email} />
        {errors.email && <p className="vc-error">{errors.email}</p>}
      </div>

      <div className="vc-field">
        <label htmlFor="geo-phone">טלפון</label>
        <input id="geo-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel"
          placeholder="05X-XXX-XXXX" required aria-invalid={!!errors.phone} />
        {errors.phone && <p className="vc-error">{errors.phone}</p>}
      </div>

      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="vc-honeypot" />

      {errors.form && <p className="vc-error vc-error-form">{errors.form}</p>}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'פותח את הדוח…' : 'קבלו את האבחון המלא — חינם'}
      </button>
      <p className="geo-lead-note">בלי חוזה · בלי התחייבות · אבחון ראשוני חינם.</p>
    </form>
  );
}
