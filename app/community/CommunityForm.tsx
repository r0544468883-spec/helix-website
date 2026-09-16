'use client';

import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'submitting' | 'success' | 'error';

type Props = {
  /** API endpoint the form POSTs to. */
  endpoint: string;
  /** WhatsApp community invite shown on success. Button is hidden when empty. */
  communityUrl?: string;
};

// כל השדות אופציונליים. משאירים פרטים אם רוצים, לא חייבים.
const FIELDS: { name: string; label: string; type: string; autoComplete?: string; inputMode?: 'tel' | 'email' | 'url'; placeholder?: string }[] = [
  { name: 'firstName', label: 'שם פרטי', type: 'text', autoComplete: 'given-name' },
  { name: 'lastName', label: 'שם משפחה', type: 'text', autoComplete: 'family-name' },
  { name: 'business', label: 'שם העסק', type: 'text', autoComplete: 'organization' },
  { name: 'phone', label: 'טלפון', type: 'tel', autoComplete: 'tel', inputMode: 'tel', placeholder: '05X-XXX-XXXX' },
  { name: 'website', label: 'כתובת אתר', type: 'url', autoComplete: 'url', inputMode: 'url', placeholder: 'https://' },
  { name: 'email', label: 'אימייל', type: 'email', autoComplete: 'email', inputMode: 'email' },
  { name: 'field', label: 'תחום עיסוק', type: 'text' },
];

export default function CommunityForm({ endpoint, communityUrl }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState('');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    setFormError('');

    const formData = new FormData(e.currentTarget);
    const payload: Record<string, string> = { company: String(formData.get('company') ?? '') };
    for (const f of FIELDS) payload[f.name] = String(formData.get(f.name) ?? '').trim();
    payload.consent = formData.get('consent') ? 'true' : 'false';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean };
      if (data.ok) {
        setStatus('success');
      } else {
        setFormError('משהו השתבש. נסו שוב, או פשוט הצטרפו ישירות לקהילה.');
        setStatus('error');
      }
    } catch {
      setFormError('תקלת רשת. נסו שוב, או פשוט הצטרפו ישירות לקהילה.');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <div className="vc-success">
        <h3>תודה. אתם בפנים.</h3>
        <p>
          שמרנו את הפרטים, ונהיה בקשר עם עדכונים והטבות. עכשיו הצטרפו לקהילת
          הפרגונים ותתחילו לצמוח יחד עם שאר העסקים.
        </p>
        {communityUrl && (
          <a href={communityUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
            הצטרפות לקהילת הפרגונים
          </a>
        )}
      </div>
    );
  }

  const isSubmitting = status === 'submitting';

  return (
    <form className="vc-form" onSubmit={onSubmit} noValidate>
      {FIELDS.map((f) => (
        <div className="vc-field" key={f.name}>
          <label htmlFor={f.name}>
            {f.label} <span className="vc-optional">(לא חובה)</span>
          </label>
          <input
            id={f.name}
            name={f.name}
            type={f.type}
            autoComplete={f.autoComplete}
            inputMode={f.inputMode}
            placeholder={f.placeholder}
          />
        </div>
      ))}

      <label className="vc-consent">
        <input type="checkbox" name="consent" />
        <span>
          אני מאשר/ת קבלת חומר שיווקי ועדכונים מ-HELIX{' '}
          <span className="muted">(אנחנו לא מספמים, אבל החוק מחייב אותנו לבקש)</span>
        </span>
      </label>

      {/* honeypot נגד בוטים */}
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="vc-honeypot" />

      {formError && <p className="vc-error vc-error-form">{formError}</p>}

      <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
        {isSubmitting ? 'שולח...' : 'שמירת פרטים והצטרפות'}
      </button>
    </form>
  );
}
