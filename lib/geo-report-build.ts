import 'server-only';

// Builds the full GEO report: runs the Layer-B scan, runs the Share-of-Model
// measurement, derives the addressable off-site sources and the IAB "4 Ps"
// roll-up, and returns a single GeoReport object. This object is the exact
// contract the hosted page (/r/<token>) renders, so the shape must stay stable.

import { normalizeUrl, scanSite } from './geo-scan';
import { computeShareOfModel, type ShareOfModelResult } from './share-of-model';
import { buildIsraeliPresence, type IsraeliPresence } from './israeli-geo';

/** A single Layer-B signal, flattened out of its scan category for the report. */
export interface GeoReportSignal {
  key: string;
  label: string;
  status: 'pass' | 'partial' | 'fail';
  detail: string;
  fix?: string;
  /** The scan category this signal belongs to (foundation | structured | ai). */
  category: string;
}

/** An off-site source the AI engines cited that the business can go win. */
export interface AddressableSource {
  domain: string;
  engines: string[];
  /** Short Hebrew next-step, e.g. "לשפר נוכחות ב-example.com". */
  action: string;
}

/** IAB "4 Ps" of AI visibility, each a 0-100 roll-up. */
export interface Iab4P {
  presence: number;
  prominence: number;
  portrayal: number;
  persuasion: number;
}

export interface GeoReport {
  v: 1;
  token: string;
  generatedAt: string;
  host: string;
  business: { name: string; category?: string; location?: string };
  scan: {
    ladder: number;
    issuesCount: number;
    signals: GeoReportSignal[];
  };
  shareOfModel: ShareOfModelResult;
  addressableSources: AddressableSource[];
  iab4p: Iab4P;
  /** Israeli citation-graph layer. Present on every report; `relevant:false` for non-IL. */
  israeli: IsraeliPresence;
}

export interface BuildReportOptions {
  token: string;
  category?: string;
  competitors?: string[];
}

function clamp100(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

const bareHost = (h: string) => h.replace(/^www\./, '').toLowerCase();

// share-of-model.ts is owned by another module and its surface is still settling.
// We read the richer fields (citedSources, per-engine sentiment/accuracy) through
// narrow structural casts so this file compiles whether or not they are present
// yet, and lights up automatically once they land, without importing unstable types.
type CitedSourceLike = { domain?: string; url?: string; engines?: unknown };
type EngineExtras = {
  sentiment?: unknown;
  accuracy?: { checked?: unknown; correct?: unknown } | unknown;
};

function readCitedSources(som: ShareOfModelResult): CitedSourceLike[] {
  const maybe = (som as { citedSources?: unknown }).citedSources;
  return Array.isArray(maybe) ? (maybe as CitedSourceLike[]) : [];
}

/** Pull a hostname out of a domain or full URL string. */
function toDomain(raw: string): string | null {
  const s = (raw || '').trim();
  if (!s) return null;
  try {
    const u = s.includes('://') ? new URL(s) : new URL(`https://${s}`);
    return bareHost(u.hostname);
  } catch {
    return null;
  }
}

/** Build the addressable off-site sources: third-party domains the AI cited,
 *  excluding the business's own host, each with a short Hebrew action. */
function deriveAddressableSources(
  som: ShareOfModelResult,
  host: string,
): AddressableSource[] {
  const own = bareHost(host);
  const byDomain = new Map<string, Set<string>>();
  for (const src of readCitedSources(som)) {
    const domain = toDomain(src.domain || src.url || '');
    if (!domain || domain === own || domain.endsWith(`.${own}`)) continue;
    const engines = Array.isArray(src.engines)
      ? src.engines.filter((e): e is string => typeof e === 'string')
      : [];
    const cur = byDomain.get(domain) ?? new Set<string>();
    for (const e of engines) cur.add(e);
    byDomain.set(domain, cur);
  }
  return [...byDomain.entries()].map(([domain, engines]) => ({
    domain,
    engines: [...engines],
    action: `לשפר נוכחות ב-${domain}`,
  }));
}

/** Map a brand-sentiment label onto a 0-100 portrayal axis. */
function sentimentScore(s: unknown): number | null {
  switch (s) {
    case 'positive':
      return 100;
    case 'neutral':
      return 60;
    case 'mixed':
      return 40;
    case 'negative':
      return 0;
    default:
      return null; // 'none' / unknown: nothing to portray
  }
}

/** Roll the Share-of-Model numbers up into the IAB "4 Ps", each 0-100. */
function deriveIab4p(som: ShareOfModelResult): Iab4P {
  const engines = som.engines ?? [];
  const n = engines.length;

  // Presence: how often the brand appears at all (avg appearanceRate), falling
  // back to the overall share-of-model when no per-engine rates exist.
  const presence =
    n > 0
      ? clamp100((engines.reduce((a, e) => a + e.appearanceRate, 0) / n) * 100)
      : clamp100(som.overallShareOfModel);

  // Prominence: from average rank. Position 1 => 100, position 10 => ~0.
  const positioned = engines
    .map((e) => e.avgPosition)
    .filter((p): p is number => typeof p === 'number');
  const prominence =
    positioned.length > 0
      ? clamp100(
          (positioned.reduce((a, p) => a + (1 - (p - 1) / 9), 0) / positioned.length) * 100,
        )
      : 0;

  // Persuasion: how often the brand is actually recommended (top 3).
  const persuasion =
    n > 0
      ? clamp100((engines.reduce((a, e) => a + e.recommendationRate, 0) / n) * 100)
      : 0;

  // Portrayal: how the brand is depicted, from sentiment plus factual accuracy.
  // Each engine contributes a sentiment score and, when facts were checked, an
  // accuracy score. If no engine exposes either, fall back to a neutral blend of
  // presence and persuasion so the axis is never misleading.
  const portrayalParts: number[] = [];
  for (const e of engines) {
    const ex = e as EngineExtras;
    const sent = sentimentScore(ex.sentiment);
    if (sent !== null) portrayalParts.push(sent);
    const acc = ex.accuracy as { checked?: unknown; correct?: unknown } | undefined;
    if (acc && acc.checked === true && typeof acc.correct === 'boolean') {
      portrayalParts.push(acc.correct ? 100 : 0);
    }
  }
  const portrayal =
    portrayalParts.length > 0
      ? clamp100(portrayalParts.reduce((a, p) => a + p, 0) / portrayalParts.length)
      : clamp100((presence + persuasion) / 2);

  return { presence, prominence, portrayal, persuasion };
}

export async function buildGeoReport(
  url: string,
  opts: BuildReportOptions,
): Promise<GeoReport> {
  const norm = normalizeUrl(url);
  if (!norm) throw new Error('invalid_url');
  const { host } = norm;

  const scan = await scanSite(norm.url);

  // Business facts for the measurement: the scan's best guess, with the
  // caller's category override taking precedence when provided.
  const category = opts.category?.trim() || scan.business.category;
  const business = { ...scan.business, category };

  // Supply real site facts so the per-engine accuracy/hallucination check can run
  // (compares each engine's brand description to these facts). Kept conservative.
  const facts = {
    url: norm.url,
    description: [business.name, business.category].filter(Boolean).join(', '),
  };
  const shareOfModel = await computeShareOfModel(business, host, {
    competitorsSeed: opts.competitors,
    facts,
  });

  // Israeli citation-graph layer: cross-reference the engines' cited sources with
  // the curated Israeli source graph. Hebrew signal = Hebrew chars in the business's
  // own name/category (the host .co.il case is handled inside detectIsraeliLocale).
  const hebrewSignal = /[֐-׿]/.test(`${business.name ?? ''} ${business.category ?? ''}`);
  const israeli = buildIsraeliPresence({
    host,
    location: business.location,
    hebrewSignal,
    citedSources: readCitedSources(shareOfModel),
  });

  // Flatten every scan signal, tagging it with its source category.
  const signals: GeoReportSignal[] = [];
  for (const cat of scan.categories) {
    for (const s of cat.signals) {
      signals.push({
        key: s.key,
        label: s.label,
        status: s.status,
        detail: s.detail,
        fix: s.fix,
        category: cat.key,
      });
    }
  }

  return {
    v: 1,
    token: opts.token,
    generatedAt: new Date().toISOString(),
    host,
    business: {
      name: business.name,
      category: business.category,
      location: business.location,
    },
    scan: {
      ladder: scan.ladder,
      issuesCount: scan.issuesCount,
      signals,
    },
    shareOfModel,
    addressableSources: deriveAddressableSources(shareOfModel, host),
    iab4p: deriveIab4p(shareOfModel),
    israeli,
  };
}
