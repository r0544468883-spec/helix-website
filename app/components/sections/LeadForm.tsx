'use client';

import { useState, useId, FormEvent } from 'react';
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

// The source is derived from the page instead of hardcoded. This form also
// renders on /startups, on every /products landing and on 11 /services pages,
// so a fixed "homepage-" label was wrong for almost every lead that came in.
function pageSource(variant: Variant): string {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';
  const slug =
    path
      .replace(/^\/+|\/+$/g, '')
      .replace(/[^a-zA-Z0-9/_-]/g, '')
      .replace(/\/+/g, '-')
      .toLowerCase() || 'home';
  const suffix = `-lead-form-${variant}`;
  // The API cuts source at 80 chars, so the path is trimmed here and the
  // variant survives instead of getting chopped off the end.
  return `${slug.slice(0, 80 - suffix.length)}${suffix}`;
}

export default function LeadForm({
  variant = 'strong',
  accentHue = 0,
  source,
}: {
  variant?: Variant;
  accentHue?: number;
  /** Override for per-section attribution. Default: the page path plus the variant. */
  source?: string;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  // Most pages render this form two or three times. With fixed ids a click on
  // the second form's consent label toggled the FIRST form's checkbox, so the
  // lower form's submit button stayed disabled and nobody could send from it.
  const uid = useId();
  const isSoft = variant === 'soft';
  const { eyebrow, title, subtitle } = copy[variant];

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!agreed || status === 'loading') return;

    // Read the honeypot before the first await; currentTarget is null after it.
    const company = String(new FormData(e.currentTarget).get('company') ?? '');

    setStatus('loading');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, source: source ?? pageSource(variant), company }),
      });
      const data = await res.json();
      setStatus(data.ok ? 'success' : 'error');
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className={`lead-section${isSoft ? ' lead-section--soft' : ''}`} id={isSoft ? 'contact-early' : 'contact'}>
      <div className="container">
        <div className={`lead-card${isSoft ? ' lead-card--soft' : ''}`}>
          {/* Lottie — tinted to the page accent: explicit prop wins, else the
              page-root --lottie-hue var (green base rotated onto the accent). */}
          {isSoft ? (
            <div className="lead-lottie-wrap lead-lottie-wrap--soft" aria-hidden="true"
              style={{ filter: `hue-rotate(${accentHue ? `${accentHue}deg` : 'var(--lottie-hue, 0deg)'})` }}>
              <SearchLottie />
            </div>
          ) : (
            <div className="lead-lottie-wrap" aria-hidden="true"
              style={{ filter: `hue-rotate(${accentHue ? `${accentHue}deg` : 'var(--lottie-hue, 0deg)'})` }}>
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

                <div className={`floating-field ${name ? 'floating-field--filled' : ''}`}>
                  <input
                    id={`${uid}-name`}
                    type="text"
                    className="floating-field__input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={80}
                    autoComplete="name"
                    placeholder=" "
                  />
                  <label className="floating-field__label" htmlFor={`${uid}-name`}>שם מלא</label>
                </div>

                <div className={`floating-field ${phone ? 'floating-field--filled' : ''}`}>
                  <input
                    id={`${uid}-phone`}
                    type="tel"
                    className="floating-field__input"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    autoComplete="tel"
                    dir="ltr"
                    placeholder=" "
                  />
                  <label className="floating-field__label" htmlFor={`${uid}-phone`}>טלפון</label>
                </div>

                <div className="lead-checkbox-row">
                  <input
                    id={`${uid}-privacy`}
                    type="checkbox"
                    className="lead-checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <label htmlFor={`${uid}-privacy`} className="lead-checkbox-label">
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
