'use client';

import { useState, type FormEvent } from 'react';
import { SITE } from '@/lib/site';

type Status = 'idle' | 'submitting' | 'success' | 'error';
type FieldErrors = Partial<Record<'name' | 'email' | 'phone' | 'form', string>>;

const ERROR_MAP: Record<string, FieldErrors> = {
  invalid_name: { name: 'שם הוא שדה חובה' },
  invalid_email: { email: 'אימייל לא תקין' },
  invalid_phone: { phone: 'טלפון לא תקין — נדרש מספר ישראלי (05X-XXX-XXXX)' },
  send_failed: { form: 'משהו נכשל בשליחה. נסה שוב או שלח הודעה ב-WhatsApp.' },
};

export default function RegistrationForm() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submittedName, setSubmittedName] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      company: String(formData.get('company') ?? ''),
    };

    try {
      const res = await fetch('/api/vibe-code-register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setSubmittedName(payload.name.trim());
        setStatus('success');
      } else {
        setErrors(ERROR_MAP[data.error ?? ''] ?? { form: 'משהו השתבש. נסה שוב.' });
        setStatus('error');
      }
    } catch {
      setErrors({ form: 'תקלת רשת. נסה שוב או שלח הודעה ב-WhatsApp.' });
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="vc-success">
        <h3>תודה{submittedName && `, ${submittedName}`}. הרשמתך התקבלה.</h3>
        <p>פרטי הסדנה יגיעו במייל קרוב למועד.</p>
        {SITE.vibeCodeWhatsappGroup && (
          <a
            href={SITE.vibeCodeWhatsappGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
          >
            הצטרפות לקבוצת ה-WhatsApp
          </a>
        )}
      </div>
    );
  }

  const isSubmitting = status === 'submitting';

  return (
    <form className="vc-form" onSubmit={onSubmit} noValidate>
      <div className="vc-field">
        <label htmlFor="name">שם מלא</label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && (
          <p id="name-error" className="vc-error">
            {errors.name}
          </p>
        )}
      </div>

      <div className="vc-field">
        <label htmlFor="email">אימייל</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <p id="email-error" className="vc-error">
            {errors.email}
          </p>
        )}
      </div>

      <div className="vc-field">
        <label htmlFor="phone">טלפון</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          placeholder="05X-XXX-XXXX"
          required
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
        />
        {errors.phone && (
          <p id="phone-error" className="vc-error">
            {errors.phone}
          </p>
        )}
      </div>

      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="vc-honeypot"
      />

      {errors.form && <p className="vc-error vc-error-form">{errors.form}</p>}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'שולח...' : 'אני בפנים'}
      </button>
    </form>
  );
}
