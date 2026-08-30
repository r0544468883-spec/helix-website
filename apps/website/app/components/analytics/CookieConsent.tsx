'use client';

import { useEffect, useState } from 'react';
import {
  CONSENT_OPEN_EVENT,
  getStoredConsent,
  setStoredConsent,
} from './useConsent';

/**
 * RTL Hebrew cookie-consent banner. Shows on first visit (consent unknown) and
 * whenever re-opened via openConsentSettings(). Accept → all pixels load;
 * Reject → nothing non-essential loads. Choice persists in localStorage.
 */
export default function CookieConsent() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (getStoredConsent() === 'unknown') setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener(CONSENT_OPEN_EVENT, reopen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, reopen);
  }, []);

  if (!open) return null;

  const decide = (state: 'granted' | 'denied') => {
    setStoredConsent(state);
    setOpen(false);
  };

  return (
    <div
      className="cookie-consent"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
    >
      <div className="cookie-consent__inner">
        <div className="cookie-consent__text">
          <h2 id="cookie-consent-title" className="cookie-consent__title">
            אנחנו משתמשים בעוגיות
          </h2>
          <p id="cookie-consent-desc" className="cookie-consent__desc">
            אנחנו משתמשים בעוגיות למדידה ולשיפור החוויה שלך באתר (Google
            Analytics, פיקסלים של פרסום ועוד). אפשר לאשר הכל, או להמשיך רק עם
            העוגיות ההכרחיות. לפרטים ראו{' '}
            <a href="/privacy">מדיניות הפרטיות</a>.
          </p>
        </div>
        <div className="cookie-consent__actions">
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--ghost"
            onClick={() => decide('denied')}
          >
            רק הכרחיות
          </button>
          <button
            type="button"
            className="cookie-consent__btn cookie-consent__btn--primary"
            onClick={() => decide('granted')}
          >
            אישור הכל
          </button>
        </div>
      </div>
    </div>
  );
}
