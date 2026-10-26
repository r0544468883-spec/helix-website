import 'server-only';

// Builds the full GEO report: runs the Layer-B scan, runs the Share-of-Model
// measurement, derives the addressable off-site sources and the IAB "4 Ps"
// roll-up, and returns a single GeoReport object. This object is the exact
// contract the hosted page (/r/<token>) renders, so the shape must stay stable.

import { normalizeUrl, scanSite } from './geo-scan';
import { loadHistory, appendHistory, loadSession, saveSession } from './geo-report-store';
import {
  computeShareOfModel,
  mergeShareOfModel,
  inferCategory,
  listConfiguredEngineIds,
  type ShareOfModelResult,
} from './share-of-model';
import { buildIsraeliPresence, type IsraeliPresence } from './israeli-geo';
import { buildGeoPlan, draftAnswerPassages, type GeoPlan } from './geo-plan';
import type { BusinessType } from './geo-types';

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
  /** The client's own external properties the scan detected, each flagged whether the
   *  AI engines already cite it. Empty when the site links to no external profiles. */
  ownedProperties: Array<{ url: string; platform: string; cited: boolean }>;
  iab4p: Iab4P;
  /** Israeli citation-graph layer. Present on every report; `relevant:false` for non-IL. */
  israeli: IsraeliPresence;
  /** Auto-generated 90-day action plan, derived from this report's own findings. */
  plan: GeoPlan;
  /** Change versus the previous clean check on this brand. Absent on the first check.
   *  Comparable over time because the measurement is stateless and account-free. */
  trend?: {
    previousDate: string;
    previousShareOfModel: number;
    previousLadder: number;
    /** current − previous, in percentage points (Share of Model). */
    shareOfModelDelta: number;
    /** current − previous (technical-readiness ladder). */
    ladderDelta: number;
  };
  /** Incremental-session status: which engines have been measured for this host and
   *  whether all configured engines are now covered. */
  sessionStatus?: {
    measuredEngines: string[];
    totalEngines: string[];
    complete: boolean;
  };
}

export interface BuildReportOptions {
  token: string;
  category?: string;
  /** Operator-chosen business kind. Shapes the question set so a service firm is not
   *  measured with tool-comparison questions it can never appear in. Optional. */
  businessType?: BusinessType;
  competitors?: string[];
  /** Service-area cities for a LOCAL business, e.g. ["תל אביב", "רמת גן"]. Localizes
   *  the engines' live web search (the runs rotate across the cities) so a city-bound
   *  business is measured the way searchers across its area see it. All optional:
   *  falls back to the scan's location guess, or a neutral search, when omitted. */
  locations?: string[];
  /** Country for the search localization, free-form or ISO (e.g. "ישראל" / "IL").
   *  Optional; defaults to IL for Israeli sites and otherwise stays unset. */
  country?: string;
  /** When true, spend extra LLM calls to auto-draft answer passages onto the plan.
   *  Opt-in and costed; see draftAnswerPassages in lib/geo-plan.ts. */
  draftPassages?: boolean;
  /** When true, ignore any existing measurement session and start fresh (new questions,
   *  re-measure every engine). Used by the admin's "new report" after a session completed. */
  fresh?: boolean;
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

/** Cross-reference the client's own detected external properties with the sources the AI
 *  engines cited. An owned link counts as "cited" when any cited-source domain equals the
 *  owned link's hostname or is a subdomain of it. */
function deriveOwnedProperties(
  owned: Array<{ url: string; platform: string }>,
  som: ShareOfModelResult,
): Array<{ url: string; platform: string; cited: boolean }> {
  const citedDomains = readCitedSources(som)
    .map((src) => toDomain(src.domain || src.url || ''))
    .filter((d): d is string => !!d);
  return owned.map((link) => {
    const hostname = toDomain(link.url);
    const cited =
      !!hostname &&
      citedDomains.some((d) => d === hostname || d.endsWith(`.${hostname}`));
    return { url: link.url, platform: link.platform, cited };
  });
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
  // Only engines that actually returned data. A failed engine (0 runs, e.g. out of
  // credit) must not count as a measured 0 and drag every axis down.
  const engines = (som.engines ?? []).filter(
    (e) => (e as { measuredRuns?: number }).measuredRuns !== 0,
  );
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

  // Business category: a manual override wins; otherwise INFER the real category from
  // the site's content, because the scan's guess is the schema.org @type (often a
  // useless "Person"/"Organization") which made the question generator invent a wrong
  // field and measure the wrong thing. Fall back to the schema guess only if inference
  // fails. Service-area cities + country unlock local measurement.
  const category =
    opts.category?.trim() ||
    (await inferCategory(scan.business.name, host, scan.content)) ||
    scan.business.category;
  const cities = (opts.locations ?? []).map((c) => c.trim()).filter(Boolean);
  const country = opts.country?.trim() || undefined;
  // Human display location for the report hero: the cities, else the country, else
  // whatever the scan guessed.
  const displayLocation =
    cities.length > 0 ? cities.join(', ') : country || scan.business.location;
  const business = {
    ...scan.business,
    category,
    location: displayLocation,
    businessType: opts.businessType,
  };

  // Supply real site facts so the per-engine accuracy/hallucination check can run
  // (compares each engine's brand description to these facts). Kept conservative.
  // Prefer the site's real meta description as facts; fall back to name + category.
  // A substantial description lets the accuracy check actually judge hallucinations;
  // a thin one makes it report "not checked" instead of a false "אי-דיוקים".
  const facts = {
    url: norm.url,
    description: [business.description, business.name, business.category]
      .filter(Boolean)
      .join('. '),
  };
  // Incremental "session": reuse a fresh (<1 week), same-category session for this
  // host and measure ONLY the engines that failed before, merging into what we have.
  // This is how a report completes across several runs when free-tier engines flake
  // under load — without ever re-measuring (or re-paying for) an engine that returned.
  const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
  const configuredIds = listConfiguredEngineIds();
  const prior = opts.fresh ? null : await loadSession(host);
  const priorFresh =
    !!prior &&
    prior.category === category &&
    (prior.businessType ?? undefined) === (opts.businessType ?? undefined) &&
    Date.now() - new Date(prior.createdAt).getTime() < SESSION_TTL_MS;

  let shareOfModel: ShareOfModelResult;
  let sessionCreatedAt = new Date().toISOString();
  if (priorFresh && prior) {
    sessionCreatedAt = prior.createdAt;
    const measuredIds = new Set(prior.result.engines.filter((e) => e.measuredRuns > 0).map((e) => e.id));
    const missingIds = configuredIds.filter((id) => !measuredIds.has(id));
    if (missingIds.length === 0) {
      // Session already complete: reuse it, spend nothing.
      shareOfModel = prior.result;
    } else {
      const fresh = await computeShareOfModel(business, host, {
        competitorsSeed: opts.competitors,
        facts,
        location: { country, cities },
        onlyEngineIds: new Set(missingIds),
        fixedQuestions: prior.result.questions,
      });
      shareOfModel = mergeShareOfModel(prior.result, fresh);
    }
  } else {
    shareOfModel = await computeShareOfModel(business, host, {
      competitorsSeed: opts.competitors,
      facts,
      location: { country, cities },
    });
  }

  // Persist the (merged) session for the next partial run.
  await saveSession(host, {
    v: 1,
    createdAt: sessionCreatedAt,
    host,
    category,
    businessType: opts.businessType,
    country,
    cities,
    result: shareOfModel,
  });

  // Session status for the admin: which engines are measured, and is it complete.
  const measuredNow = shareOfModel.engines.filter((e) => e.measuredRuns > 0).map((e) => e.id);
  const sessionStatus = {
    measuredEngines: measuredNow,
    totalEngines: configuredIds,
    complete: configuredIds.length > 0 && configuredIds.every((id) => measuredNow.includes(id)),
  };

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

  // Build the report object first, then derive the plan from it (buildGeoPlan reads
  // only fields already on the report). The plan field is populated right after.
  const report: GeoReport = {
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
    ownedProperties: deriveOwnedProperties(scan.ownedLinks, shareOfModel),
    iab4p: deriveIab4p(shareOfModel),
    israeli,
    plan: { waves: [], note: '' },
    sessionStatus,
  };
  report.plan = buildGeoPlan(report);

  // Optional, paid: auto-draft answer passages onto the plan's wave-2 answer items.
  // Only when explicitly requested, so the default report stays $0 beyond the scan + SoM.
  if (opts.draftPassages) {
    const drafts = await draftAnswerPassages(report.plan, {
      name: business.name,
      category: business.category,
    });
    for (const wave of report.plan.waves) {
      for (const item of wave.items) {
        const d = drafts[item.id];
        if (d) item.draft = d;
      }
    }
  }

  // Trend vs. the previous clean check on this brand, then record this one for next
  // time. Comparable because every check is stateless and account-free, so changes
  // reflect the brand's real movement, not drift in how we measure. Best-effort.
  try {
    const history = await loadHistory(host);
    const prev = history.length > 0 ? history[history.length - 1] : null;
    if (prev) {
      report.trend = {
        previousDate: prev.date,
        previousShareOfModel: prev.shareOfModel,
        previousLadder: prev.ladder,
        shareOfModelDelta:
          Math.round((shareOfModel.overallShareOfModel - prev.shareOfModel) * 10) / 10,
        ladderDelta: scan.ladder - prev.ladder,
      };
    }
    await appendHistory(host, {
      date: report.generatedAt,
      token: report.token,
      shareOfModel: shareOfModel.overallShareOfModel,
      ladder: scan.ladder,
      presenceLabel: shareOfModel.presence?.label,
      rateLow: shareOfModel.presence?.rateLow,
      rateHigh: shareOfModel.presence?.rateHigh,
    });
  } catch (err) {
    console.error('trend tracking failed', err);
  }

  return report;
}
