'use client';

import { useState, FormEvent } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle, Loader2 } from 'lucide-react';

const RocketLottie = dynamic(() => import('../RocketLottie'), { ssr: false });
const SearchLottie = dynamic(() => import('../SearchLottie'), { ssr: false });

type Status = 'idle' | 'loading' | 'success' | 'error';
type Variant = 'soft' | 'strong';

const copy: Record<Variant, { eyebrow: string; title: string; subtitle: string }> = {
  soft: {
    eyebrow: 'שיחת ייעוץ ראשונה',
    title: 'שאלו אותנו כל שאלה',
    subtitle: 'שם ומספר. ערן או רון יחזרו אליכם תוך יום עסקים.',
  },
  strong: {
    eyebrow: 'דברו איתנו',
    title: 'מוכנים לעבוד יחד?',
    subtitle: 'שאלה אחת לפני שמתחילים: מה אתם צריכים? שלחו שם ומספר ונחזור אליכם במהרה.',
  },
};

export default function LeadForm({ variant = 'strong' }: { variant?: Variant }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const isSoft = variant === 'soft';
  const { eyebrow, title, subtitle } = copy[variant];

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
    <section className="lead-section" id={isSoft ? 'contact-early' : 'contact'}>
      <div className="container">
        <div className={`lead-card${isSoft ? ' lead-card--soft' : ''}`}>
          {/* Lottie */}
          {isSoft ? (
            <div className="lead-lottie-wrap lead-lottie-wrap--soft" aria-hidden="true">
              <SearchLottie />
            </div>
          ) : (
            <div className="lead-lottie-wrap" aria-hidden="true">
              <RocketLottie />
            </div>
          )}

          {/* Form */}
          <div className="lead-form-wrap">
            <p className="lead-eyebrow">{eyebrow}</p>
            <h2 className="lead-title">{title}</h2>
            <p className="lead-subtitle">{subtitle}</p>

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
