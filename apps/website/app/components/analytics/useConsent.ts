'use client';

import { useEffect, useState } from 'react';

/**
 * Cookie-consent state, shared by the banner and every tracking script.
 * We DON'T load any analytics/marketing pixel until consent === 'granted'.
 * This is the strictest (and simplest-to-defend) GDPR/ePrivacy posture:
 * nothing that sets a non-essential cookie runs before the user opts in.
 */
export type ConsentState = 'unknown' | 'granted' | 'denied';

export const CONSENT_KEY = 'helix-cookie-consent';
export const CONSENT_EVENT = 'helix-consent-change';
export const CONSENT_OPEN_EVENT = 'helix-consent-open';

export function getStoredConsent(): ConsentState {
  if (typeof window === 'undefined') return 'unknown';
  const v = window.localStorage.getItem(CONSENT_KEY);
  return v === 'granted' || v === 'denied' ? v : 'unknown';
}

export function setStoredConsent(state: 'granted' | 'denied') {
  window.localStorage.setItem(CONSENT_KEY, state);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: state }));
}

/** Re-open the cookie banner (e.g. from a footer "ניהול עוגיות" link). */
export function openConsentSettings() {
  window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT));
}

export function useConsent(): ConsentState {
  const [consent, setConsent] = useState<ConsentState>('unknown');

  useEffect(() => {
    setConsent(getStoredConsent());
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail === 'granted' || detail === 'denied') setConsent(detail);
    };
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  return consent;
}
