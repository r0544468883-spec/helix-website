'use client';

import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';
import { useConsent } from './useConsent';
import MetaPixel from '../MetaPixel';
import GoogleAds from './GoogleAds';
import LinkedInInsight from './LinkedInInsight';
import TikTokPixel from './TikTokPixel';
import MicrosoftClarity from './MicrosoftClarity';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

/**
 * Single mount-point for every analytics/marketing tag. Nothing renders until
 * the visitor has actively granted cookie consent. Each child is additionally
 * gated on its own env var, so you turn a channel on simply by setting its ID
 * in the environment (see .env.example). Two paths are supported:
 *   • GTM route  — set NEXT_PUBLIC_GTM_ID and manage all tags inside GTM.
 *   • Direct route — set the individual IDs below (GA, Meta, Ads, LinkedIn…).
 * Use one or the other to avoid double-counting.
 */
export default function Analytics() {
  const consent = useConsent();
  if (consent !== 'granted') return null;

  return (
    <>
      {GTM_ID && <GoogleTagManager gtmId={GTM_ID} />}
      {GA_ID && <GoogleAnalytics gaId={GA_ID} />}
      <GoogleAds />
      <MetaPixel />
      <LinkedInInsight />
      <TikTokPixel />
      <MicrosoftClarity />
    </>
  );
}
