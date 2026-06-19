'use client';

import { useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle, Loader2 } from 'lucide-react';

const RocketLottie = dynamic(() => import('../RocketLottie'), { ssr: false });

type Status = 'idle' | 'loading' | 'success' | 'error';

export default function LeadForm() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!agreed || status === 'loading') return;

    setStatus('loading');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      setStatus(data.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="lead-section" id="contact">
      <div className="container">
        <div className="lead-card">
          {/* Lottie — left */}
          <div className="lead-lottie-wrap" aria-hidden="true">
            <RocketLottie />
          </div>

          {/* Form — right */}
          <div className="lead-form-wrap">
            <p className="lead-eyebrow">דברו איתנו</p>
            <h2 className="lead-title">מוכנים לעבוד יחד?</h2>
            <p className="lead-subtitle">
              שאלה אחת לפני שמתחילים: מה אתם צריכים? שלחו שם ומספר ונחזור אליכם במהרה.
            </p>

            {status === 'success' ? (
              <div className="lead-success">
                <CheckCircle size={40} className="lead-success-icon" />
                <p className="lead-success-title">קיבלנו!</p>
                <p className="lead-success-text">נחזור אליכם בהקדם האפשרי.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="lead-form" noValidate>
                {/* Honeypot */}
                <input type="text" name="company" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

                <div className="lead-field">
                  <label className="lead-label" htmlFor="lead-name">שם מלא</label>
                  <input
                    id="lead-name"
                    type="text"
                    className="lead-input"
                    placeholder="ישראל ישראלי"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={80}
                    autoComplete="name"
                  />
                </div>

                <div className="lead-field">
                  <label className="lead-label" htmlFor="lead-phone">טלפון</label>
                  <input
                    id="lead-phone"
                    type="tel"
                    className="lead-input"
                    placeholder="050-000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                    dir="ltr"
                  />
                </div>

                <div className="lead-checkbox-row">
                  <input
                    id="lead-privacy"
                    type="checkbox"
                    className="lead-checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label htmlFor="lead-privacy" className="lead-checkbox-label">
                    אני מסכים/ה לקבל פנייה חוזרת מ-HELIX
                  </label>
                </div>

                {status === 'error' && (
                  <p className="lead-error">משהו השתבש. נסו שוב או פנו אלינו בוואטסאפ.</p>
                )}

                <button
                  type="submit"
                  className="lead-submit"
                  disabled={!agreed || status === 'loading'}
                >
                  {status === 'loading' ? (
                    <Loader2 size={18} className="lead-spinner" />
                  ) : (
                    'שלחו לנו הודעה'
                  )}
                </button>
                <p className="lead-note">לא מוכרים את המידע שלכם. נחזור תוך 24 שעות בימי עסקים.</p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
