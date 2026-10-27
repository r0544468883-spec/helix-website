// Shared types for the AI-visibility / GEO checker (/ai-checker).
// Layer B = "can AI find/ingest you" (free, no API keys).
// Layer A = "does AI actually mention/recommend you" (lib/ai-visibility.ts, gated).

import type { OwnedLink } from './geo-scan';

export type SignalStatus = 'pass' | 'partial' | 'fail';

export interface GeoSignal {
  key: string;
  /** Plain-Hebrew label, no jargon in the public teaser. */
  label: string;
  status: SignalStatus;
  /** Short human explanation of what we found. */
  detail: string;
  /** What to fix (only surfaced in the gated full report). */
  fix?: string;
  /** Relative weight inside its category. */
  weight: number;
}

export type CategoryKey = 'foundation' | 'structured' | 'ai';

export interface GeoCategory {
  key: CategoryKey;
  label: string;
  /** 0-100. */
  score: number;
  signals: GeoSignal[];
}

/** What KIND of business this is. Decides whether the buyer is choosing a provider,
 *  a product, a local business, a store, or a person, which in turn decides what the
 *  category-level questions look like. A consulting firm must never be measured with
 *  "tool X vs tool Y" questions (it can't appear in them); a SaaS tool should be.
 *  Optional everywhere: when unset the generator stays generic (provider-or-product). */
export type BusinessType = 'service' | 'product' | 'local' | 'ecommerce' | 'personal';

/** Operator-facing dropdown options (value = stable key, label = Hebrew). */
export const BUSINESS_TYPE_OPTIONS: ReadonlyArray<{ value: BusinessType; label: string }> = [
  { value: 'service', label: 'שירות / ייעוץ / נותן שירות' },
  { value: 'product', label: 'מוצר / כלי / תוכנה' },
  { value: 'local', label: 'עסק מקומי (אזור שירות)' },
  { value: 'ecommerce', label: 'חנות / מסחר אלקטרוני' },
  { value: 'personal', label: 'מותג אישי / מומחה / יוצר תוכן' },
];

const BUSINESS_TYPE_SET = new Set<string>(BUSINESS_TYPE_OPTIONS.map((o) => o.value));

/** Narrow an unknown input to a valid BusinessType, or undefined. */
export function asBusinessType(v: unknown): BusinessType | undefined {
  return typeof v === 'string' && BUSINESS_TYPE_SET.has(v) ? (v as BusinessType) : undefined;
}

export interface BusinessGuess {
  /** Brand/business name best-guess (from title / og:site_name / domain). */
  name: string;
  /** Business category best-guess (from schema / meta / heuristics). */
  category?: string;
  /** Location best-guess (from schema address / NAP heuristics). */
  location?: string;
  /** Site's own meta description, when present. Used as real facts for the
   *  accuracy / hallucination check so it compares against actual site content. */
  description?: string;
  /** Operator-chosen business kind. Shapes the question set (provider vs product
   *  vs local vs store vs person). Optional: generator stays generic when unset. */
  businessType?: BusinessType;
  /** Extra brand aliases: founder/team/person names (and operator-entered names), so
   *  the AI naming the PERSON behind a founder-branded business counts as the brand
   *  appearing, instead of reading as "never mentioned". He + En. */
  aliases?: string[];
}

export interface GeoScanResult {
  ok: boolean;
  error?: string;
  url: string;
  finalUrl: string;
  https: boolean;
  /** 1-10 HELIX GEO ladder. */
  ladder: number;
  categories: GeoCategory[];
  /** Count of failing/partial signals across all categories. */
  issuesCount: number;
  business: BusinessGuess;
  /** The client's own external profiles/properties detected on the site, platform-tagged. */
  ownedLinks: OwnedLink[];
  /** Compact digest of the site's real content (title + tagline + H1 + opening text),
   *  used to infer the true business category instead of the schema @type. */
  content?: string;
}
