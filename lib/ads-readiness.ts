// Ad-readiness interpreter — the brain behind Free Scan "בדיקה A" (Marketing Readiness).
// PURE (no I/O): takes the tracker/tool/Lighthouse signals that lib/readiness-extras.ts
// already extracts from ONE page fetch, and interprets them through an ADS lens — is this
// business paying for traffic it can't measure, retarget, or convert? Same detection-only
// discipline as the OPS skills: it flags gaps and estimates risk, it never changes anything.
//
// The wedge logic: a pixel/ad-tag present WITHOUT conversion tracking = spending blind. That
// gap is the "aha" and the CTA into HELIX OPS.

import type { ReadinessExtras } from './readiness-extras';

export type AdSignalStatus = 'ok' | 'warn' | 'bad';

export type AdSignal = {
  key: string;
  label: string; // Hebrew, RTL report
  status: AdSignalStatus;
  detail: string;
  fix: string; // what OPS would do
  gated?: boolean; // true = only revealed after email (the money line)
};

export type AdWasteBand = 'none' | 'low' | 'medium' | 'high';

export type AdReadinessResult = {
  runsAds: boolean; // do we see ad infrastructure at all?
  score: number; // 0..100 readiness
  wasteBand: AdWasteBand; // qualitative risk (gated detail carries the ₪ range)
  wasteNote: string; // gated: the persuasive money line
  signals: AdSignal[];
  summary: string; // one-line ungated teaser
};

function has(extras: ReadinessExtras, name: string): boolean {
  return extras.trackers.some((t) => t.name === name && t.found);
}
function hasTool(extras: ReadinessExtras, name: string): boolean {
  return extras.convTools.some((t) => t.name === name && t.found);
}

export function analyzeAdReadiness(extras: ReadinessExtras): AdReadinessResult {
  const metaPixel = has(extras, 'Meta Pixel');
  const googleAds = has(extras, 'Google Ads');
  const ga4 = has(extras, 'Google Analytics 4');
  const gtm = has(extras, 'Google Tag Manager');
  const tiktok = has(extras, 'TikTok Pixel');
  const linkedin = has(extras, 'LinkedIn Insight');
  const clarity = has(extras, 'Microsoft Clarity');
  const hotjar = has(extras, 'Hotjar');

  // "Runs ads" = any ad-platform pixel/tag present (intent to advertise on that platform).
  const runsAds = metaPixel || googleAds || tiktok || linkedin;
  const anyBehavior = clarity || hotjar; // behavior analytics
  const anyLeadCapture = hasTool(extras, 'Calendly') || hasTool(extras, 'Typeform') || hasTool(extras, 'HubSpot');

  const signals: AdSignal[] = [];

  // ── ad-platform presence ──
  signals.push(
    metaPixel
      ? { key: 'meta_pixel', label: 'Meta Pixel', status: 'ok', detail: 'מותקן', fix: '' }
      : { key: 'meta_pixel', label: 'Meta Pixel', status: 'warn', detail: 'לא זוהה — אי אפשר לפרסם/למדוד ב-Facebook/Instagram ביעילות', fix: 'OPS מתקין ומאמת פיקסל + אירועים' },
  );
  signals.push(
    googleAds
      ? { key: 'google_ads', label: 'תג Google Ads', status: 'ok', detail: 'זוהה', fix: '' }
      : { key: 'google_ads', label: 'תג Google Ads', status: 'warn', detail: 'לא זוהה מעקב-Google Ads', fix: 'OPS מחבר conversion tracking ל-Google Ads' },
  );

  // ── the money gap: ads without conversion measurement ──
  const hasConversionMeasure = ga4 || googleAds; // proxy for "can attribute a result"
  if (runsAds && !hasConversionMeasure) {
    signals.push({ key: 'conv_tracking', label: 'מעקב-המרות', status: 'bad', detail: 'אתה משלם על מודעות אבל אין מעקב-המרות — אתה מפרסם עיוור', fix: 'OPS מגדיר מעקב-המרות מלא (GA4 + Conversions API) ומחבר לתקצוב', gated: false });
  } else if (!ga4) {
    signals.push({ key: 'ga4', label: 'Google Analytics 4', status: 'warn', detail: 'GA4 לא זוהה — קשה לייחס תוצאות', fix: 'OPS מתקין GA4 + events', gated: false });
  } else {
    signals.push({ key: 'ga4', label: 'Google Analytics 4', status: 'ok', detail: 'מותקן', fix: '' });
  }

  // ── remarketing potential ──
  signals.push(
    metaPixel || googleAds
      ? { key: 'remarketing', label: 'פוטנציאל רימרקטינג', status: 'ok', detail: 'יש בסיס לקהלי-רימרקטינג', fix: '' }
      : { key: 'remarketing', label: 'רימרקטינג', status: 'warn', detail: 'אין פיקסל → אי אפשר לרדוף אחרי מבקרים שלא המירו', fix: 'OPS בונה קהלי-רימרקטינג' },
  );

  // ── tag hygiene ──
  if (gtm) signals.push({ key: 'gtm', label: 'Google Tag Manager', status: 'ok', detail: 'ניהול-תגים תקין', fix: '' });

  // ── behavior + lead capture (landing quality proxy) ──
  signals.push(
    anyBehavior
      ? { key: 'behavior', label: 'ניתוח-התנהגות', status: 'ok', detail: 'יש Hotjar/Clarity', fix: '' }
      : { key: 'behavior', label: 'ניתוח-התנהגות', status: 'warn', detail: 'אין מפות-חום/הקלטות — לא רואים למה מבקרים נוטשים', fix: 'Growth Doctor מחבר ניתוח-התנהגות' },
  );
  if (!anyLeadCapture) {
    signals.push({ key: 'lead_capture', label: 'לכידת-לידים', status: 'warn', detail: 'לא זוהה טופס/קביעת-פגישה (Calendly/Typeform/HubSpot)', fix: 'OPS/Growth Doctor מוסיף לכידת-ליד ברורה' });
  }

  // ── Lighthouse: landing speed/quality ──
  const bp = extras.lighthouse.bestPractices;
  const seo = extras.lighthouse.seo;
  if (typeof bp === 'number' && bp < 70) signals.push({ key: 'landing_quality', label: 'איכות-נחיתה', status: 'bad', detail: `ציון best-practices ${bp} — כסף-מודעות נשפך לדף חלש`, fix: 'Growth Doctor משפר את דף-הנחיתה' });
  if (typeof seo === 'number' && seo < 70) signals.push({ key: 'seo', label: 'SEO', status: 'warn', detail: `ציון SEO ${seo} — תלוי מדי בתנועה בתשלום`, fix: 'HELIX Rank בונה תנועה אורגנית' });

  // ── score + waste band ──
  // Scored 1-10 to match the HELIX ladder used across the other free checks (GEO etc.),
  // not 0-100. Compute on a 100-point basis then map to the 1-10 ladder.
  const bad = signals.filter((s) => s.status === 'bad').length;
  const warn = signals.filter((s) => s.status === 'warn').length;
  const score100 = clamp(0, 100, 100 - bad * 22 - warn * 8);
  const score = clamp(1, 10, Math.round(score100 / 10));

  // Waste risk: spending on ads while blind to conversions is the worst case.
  let wasteBand: AdWasteBand = 'none';
  let wasteNote = 'לא זוהתה תשתית-פרסום פעילה — אין תקציב בסיכון כרגע.';
  if (runsAds) {
    if (!hasConversionMeasure) {
      wasteBand = 'high';
      wasteNote = 'אתה מריץ מודעות בלי מעקב-המרות מלא. בחשבונות במצב הזה נהוג לראות 20%–40% מהתקציב מבוזבז על קליקים שלא ממירים — בלי דרך לדעת אילו. OPS סוגר את הפער.';
    } else if (warn >= 2 || (typeof bp === 'number' && bp < 70)) {
      wasteBand = 'medium';
      wasteNote = 'יש מעקב בסיסי אבל פערים (רימרקטינג/נחיתה/התנהגות). זליגת-תקציב אופיינית 10%–20%. OPS מהדק.';
    } else {
      wasteBand = 'low';
      wasteNote = 'התשתית סבירה. עדיין יש מקום לאופטימיזציה שוטפת (עייפות-קריאייטיב, מונחי-בזבוז) שה-OPS עושה אוטומטית.';
    }
  }

  const summary = runsAds
    ? `זוהתה תשתית-פרסום · ${bad} בעיות קריטיות · ${warn} אזהרות · ציון ${score}/10`
    : `לא זוהתה תשתית-פרסום פעילה · ציון מוכנות ${score}/10`;

  return { runsAds, score, wasteBand, wasteNote, signals, summary };
}

function clamp(lo: number, hi: number, n: number): number {
  return Math.min(hi, Math.max(lo, Math.round(n)));
}
