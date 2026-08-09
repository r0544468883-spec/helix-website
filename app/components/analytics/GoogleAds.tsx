'use client';

import Script from 'next/script';

/**
 * Google Ads global site tag (gtag). Conversion ID format: AW-XXXXXXXXXX.
 * Shares the same dataLayer/gtag as GA4 (that's by design). Fire a specific
 * conversion from a form's success handler with trackAdsConversion() in
 * lib/conversions.ts.
 */
const AW_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;

export default function GoogleAds() {
  if (!AW_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${AW_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-ads" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${AW_ID}');`}
      </Script>
    </>
  );
}
