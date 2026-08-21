'use client';

import { useState, FormEvent } from 'react';
import { CheckCircle, Loader2 } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

const PARTNER_TYPES = [
  'יועץ עסקי / יועץ שיווק',
  'סוכנות דיגיטל / שיווק',
  'איש מכירות / פיתוח עסקי',
  'לקוח קיים שרוצה להמליץ',
  'אחר',
];

export default function PartnerApplyForm({ id = 'apply' }: { id?: string }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState(PARTNER_TYPES[0]);
  const [audience, setAudience] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreed || status === 'loading') return;
    setStatus('loading');
    try {
      // מנוע הלידים הקיים מקבל name+phone; מצרפים את פרטי השותף לשדה השם
      const composedName = `שותף: ${name} · ${type}${audience ? ` · ${audience}` : ''}`;
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: composedName, phone }),
      });
      const data = await res.json();
      setStatus(data.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="lead-section" id={id}>
      <div className="container">
        <div className="lead-card">
          <div className="lead-form-wrap" style={{ margin: '0 auto', maxWidth: 560 }}>
            <p className="lead-eyebrow">הרשמה לתכנית השותפים</p>
            <h2 className="lead-title">בוא נתחיל להרוויח יחד</h2>
            <p className="lead-subtitle">
              ממלאים, ואנחנו חוזרים תוך יום עסקים עם כל מה שצריך כדי להתחיל. בלי עלות, בלי חוזה.
            </p>

            {status === 'success' ? (
              <div className="lead-success">
                <CheckCircle size={40} className="lead-success-icon" />
                <p className="lead-success-title">קיבלנו!</p>
                <p className="lead-success-text">ערן או רון יחזרו אליך בהקדם עם הפרטים.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="lead-form" noValidate>
                <input type="text" name="company" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                <div className={`floating-field ${name ? 'floating-field--filled' : ''}`}>
                  <input
                    id={`${id}-name`}
                    type="text"
                    className="floating-field__input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={80}
                    autoComplete="name"
                    placeholder=" "
                  />
                  <label className="floating-field__label" htmlFor={`${id}-name`}>שם מלא</label>
                </div>

                <div className={`floating-field ${phone ? 'floating-field--filled' : ''}`}>
                  <input
                    id={`${id}-phone`}
                    type="tel"
                    className="floating-field__input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                    dir="ltr"
                    placeholder=" "
                  />
                  <label className="floating-field__label" htmlFor={`${id}-phone`}>טלפון</label>
                </div>

                <div className={`floating-field floating-field--filled`}>
                  <select
                    id={`${id}-type`}
                    className="floating-field__input"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ color: '#e5e7eb', backgroundColor: '#0d1512' }}
                  >
                    {PARTNER_TYPES.map((t) => (
                      <option key={t} value={t} style={{ color: '#e5e7eb', backgroundColor: '#0d1512' }}>{t}</option>
                    ))}
                  </select>
                  <label className="floating-field__label" htmlFor={`${id}-type`}>איזה שותף אתה?</label>
                </div>

                <div className={`floating-field ${audience ? 'floating-field--filled' : ''}`}>
                  <input
                    id={`${id}-audience`}
                    type="text"
                    className="floating-field__input"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    maxLength={120}
                    placeholder=" "
                  />
                  <label className="floating-field__label" htmlFor={`${id}-audience`}>כמה לקוחות או איזה קהל יש לך? (לא חובה)</label>
                </div>

                <div className="lead-checkbox-row">
                  <input
                    id={`${id}-privacy`}
                    type="checkbox"
                    className="lead-checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label htmlFor={`${id}-privacy`} className="lead-checkbox-label">
                    אני מסכים/ה שתחזרו אליי לגבי תכנית השותפים
                  </label>
                </div>

                {status === 'error' && (
                  <p className="lead-error">משהו השתבש. נסו שוב או פנו אלינו בוואטסאפ.</p>
                )}

                <button type="submit" className="lead-submit" disabled={!agreed || status === 'loading'}>
                  {status === 'loading' ? <Loader2 size={18} className="lead-spinner" /> : 'שלחו לי פרטים'}
                </button>
                <p className="lead-note">לא מוכרים את המידע שלך. נחזור תוך 24 שעות בימי עסקים.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
