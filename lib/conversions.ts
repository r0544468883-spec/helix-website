/**
 * Cross-network conversion helpers. Call these from a form's success handler
 * (e.g. after /api/lead returns 200) so a single event fires to every platform
 * that's connected. Each call is a no-op if that platform's tag isn't loaded,
 * so it's safe to call unconditionally.
 *
 * CONNECT STEP: once you have a Google Ads conversion "label", pass it below,
 * e.g. trackLead({ adsLabel: 'AbC-D_efG', value: 0 }).
 */

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    gtag?: Gtag;
    fbq?: (...args: unknown[]) => void;
    lintrk?: (action: string, data: Record<string, unknown>) => void;
    ttq?: { track: (event: string, data?: Record<string, unknown>) => void };
  }
}

const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

/** Fire a generic GA4 event (also picked up by GTM if used). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', name, params ?? {});
}

/** Fire a Google Ads conversion. `label` is the per-conversion label from Ads. */
export function trackAdsConversion(label: string, value?: number, currency = 'ILS') {
  if (typeof window === 'undefined' || !ADS_ID) return;
  window.gtag?.('event', 'conversion', {
    send_to: `${ADS_ID}/${label}`,
    ...(value != null ? { value, currency } : {}),
  });
}

/**
 * One call → a "Lead" across GA4 + Meta + LinkedIn + TikTok + (optionally) Ads.
 * Pass `adsLabel` once you've created the conversion action in Google Ads.
 */
export function trackLead(opts?: { value?: number; adsLabel?: string }) {
  const { value, adsLabel } = opts ?? {};
  trackEvent('generate_lead', value != null ? { value, currency: 'ILS' } : undefined);
  if (typeof window !== 'undefined') {
    window.fbq?.('track', 'Lead', value != null ? { value, currency: 'ILS' } : undefined);
    window.lintrk?.('track', { conversion_id: 0 }); // set your LinkedIn conversion_id
    window.ttq?.track('SubmitForm');
  }
  if (adsLabel) trackAdsConversion(adsLabel, value);
}
