'use client';

import { useState, type FormEvent } from 'react';

const phoneDigits = (v: string) => v.replace(/\D/g, '');

// קישור "הוסיפו ליומן" (Google Calendar). 1.12.2026 17:00 שעון ישראל = 15:00 UTC.
const CAL_URL =
  'https://calendar.google.com/calendar/render?action=TEMPLATE' +
  '&text=' + encodeURIComponent('ערב הכרה לבעלי עסקים · HELIX') +
  '&dates=20261201T150000Z/20261201T190000Z' +
  '&details=' + encodeURIComponent('הרצאה של רון קלי על שיווק ובינה מלאכותית, ייעוץ אישי וכיבוד. המיקום המדויק יישלח לנרשמים לפני האירוע.') +
  '&location=' + encodeURIComponent('צפון (המיקום המדויק יישלח לנרשמים)');

/**
 * טופס הרשמה לאירוע ההכרה: שם + טלפון + כמות מגיעים.
 * חיכוך נמוך, מתאים גם למי שמעדיף אחר כך שיחה טלפונית לאישור.
 */
export default function UniqueOfferLeadForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [guests, setGuests] = useState('1');
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
        body: JSON.stringify({ name: name.trim(), phone: phone.trim(), guests, company_hp: company }),
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
        <h3>המקום שלכם שמור</h3>
        <p>
          תודה. נשלח לכם את כל הפרטים, ונתקשר רק כדי לוודא מקום ולשלוח את הכתובת המדויקת. שיחה
          קצרה, בלי מכירות.
        </p>
        <a className="uo-cal-link" href={CAL_URL} target="_blank" rel="noopener noreferrer">
          הוסיפו ליומן
        </a>
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

      <div className="vc-field">
        <label htmlFor="uo-guests">כמה מגיעים?</label>
        <select id="uo-guests" name="guests" value={guests} onChange={(e) => setGuests(e.target.value)}>
          {['1', '2', '3', '4', '5+'].map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* honeypot */}
      <input type="text" name="company_hp" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="vc-honeypot" value={company} onChange={(e) => setCompany(e.target.value)} />

      {formError && <p className="vc-error vc-error-form">{formError}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'שומר מקום...' : 'שריינו לי מקום'}
      </button>
      <p className="geo-lead-note">כניסה חינם · מספר המקומות מוגבל · נתקשר רק לאישור, בלי מכירות</p>
    </form>
  );
}
