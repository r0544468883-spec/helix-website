'use client';

import { useState, type FormEvent } from 'react';

const phoneDigits = (v: string) => v.replace(/\D/g, '');

/**
 * טופס מינימלי לדף ההצעה למגזר: שם + טלפון בלבד.
 * המגזר סוגר הכל טלפונית, אז אין אימייל ואין חיכוך. אנחנו חוזרים אליהם.
 */
export default function UniqueOfferLeadForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState(''); // honeypot
  const [errors, setErrors] = useState<{ name?: boolean; phone?: boolean }>({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (company) return; // honeypot

    const bad: { name?: boolean; phone?: boolean } = {};
    if (!name.trim()) bad.name = true;
    const digits = phoneDigits(phone);
    if (digits.length !== 10 || digits[0] !== '0') bad.phone = true;
    if (bad.name || bad.phone) {
      setErrors(bad);
      setFormError(bad.phone ? 'מספר הטלפון צריך לכלול 10 ספרות (למשל 0541234567).' : 'נא למלא שם וטלפון.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const res = await fetch('/api/unique-offer-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), company_hp: company }),
      });
      const j = (await res.json()) as { ok: boolean; error?: string };
      if (j.ok) {
        setDone(true);
      } else {
        if (j.error === 'invalid_phone') setErrors({ phone: true });
        setFormError(j.error === 'invalid_phone' ? 'מספר הטלפון צריך לכלול 10 ספרות.' : 'משהו השתבש. נסו שוב.');
      }
    } catch {
      setFormError('תקלת רשת. נסו שוב, או התקשרו אלינו ישירות.');
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="vc-success">
        <h3>קיבלנו את הפרטים</h3>
        <p>תודה. נחזור אליכם טלפונית, בדרך כלל עוד היום או ביום העסקים הבא, ונעשה את הבדיקה עבורכם.</p>
      </div>
    );
  }

  return (
    <form className="vc-form uo-lead-form" onSubmit={onSubmit} noValidate>
      <div className={['vc-field', errors.name ? 'vc-field-error' : ''].filter(Boolean).join(' ')}>
        <label htmlFor="uo-name">שם</label>
        <input id="uo-name" name="name" type="text" autoComplete="name" value={name}
          onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((x) => ({ ...x, name: false })); }}
          aria-invalid={errors.name || undefined} />
      </div>

      <div className={['vc-field', errors.phone ? 'vc-field-error' : ''].filter(Boolean).join(' ')}>
        <label htmlFor="uo-phone">טלפון</label>
        <input id="uo-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" placeholder="05X-XXX-XXXX"
          value={phone}
          onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors((x) => ({ ...x, phone: false })); }}
          aria-invalid={errors.phone || undefined} />
      </div>

      {/* honeypot */}
      <input type="text" name="company_hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="vc-honeypot" value={company} onChange={(e) => setCompany(e.target.value)} />

      {formError && <p className="vc-error vc-error-form">{formError}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'שולח...' : 'שנחזור אליכם'}
      </button>
      <p className="geo-lead-note">נחזור אליכם טלפונית · הבדיקה בחינם · בלי התחייבות</p>
    </form>
  );
}
