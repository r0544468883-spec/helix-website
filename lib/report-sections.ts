// Shared, client-safe constants for the hosted GEO report analytics.
// Kept in its own module (NO 'server-only') so both the client beacon
// (app/r/[token]/track.tsx) and the server aggregator (lib/report-events.ts)
// can import it without pulling server-only code into the client bundle.

/** Ordered sections of the report, front to back. Used to pick the furthest reached. */
export const SECTION_ORDER = [
  'hero',
  'scorecard',
  'engines',
  'heatmap',
  'competitors',
  'sources',
  'properties',
  'israeli',
  'plan',
  'plan90',
  'developer',
] as const;

export type SectionKey = (typeof SECTION_ORDER)[number];
