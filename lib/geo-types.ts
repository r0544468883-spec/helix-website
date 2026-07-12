// Shared types for the AI-visibility / GEO checker (/ai-checker).
// Layer B = "can AI find/ingest you" (free, no API keys).
// Layer A = "does AI actually mention/recommend you" (lib/ai-visibility.ts, gated).

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
  /** 0–100. */
  score: number;
  signals: GeoSignal[];
}

export interface BusinessGuess {
  /** Brand/business name best-guess (from title / og:site_name / domain). */
  name: string;
  /** Business category best-guess (from schema / meta / heuristics). */
  category?: string;
  /** Location best-guess (from schema address / NAP heuristics). */
  location?: string;
}

export interface GeoScanResult {
  ok: boolean;
  error?: string;
  url: string;
  finalUrl: string;
  https: boolean;
  /** 1–10 HELIX GEO ladder. */
  ladder: number;
  categories: GeoCategory[];
  /** Count of failing/partial signals across all categories. */
  issuesCount: number;
  business: BusinessGuess;
}
