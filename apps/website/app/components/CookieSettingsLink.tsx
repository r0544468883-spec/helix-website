'use client';

import { openConsentSettings } from './analytics/useConsent';

/** Footer link that re-opens the cookie-consent banner. */
export default function CookieSettingsLink() {
  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault();
        openConsentSettings();
      }}
    >
      ניהול עוגיות
    </a>
  );
}
