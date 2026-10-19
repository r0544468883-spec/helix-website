import 'server-only';

// Anonymous view-analytics for the hosted GEO report.
// Each view/progress/leave event is stored as a tiny JSON object in Supabase Storage,
// bucket "geo-events", object "<token>/<ts>-<rand>.json". No database, no raw IP.
//
// Privacy: we never store a raw IP (the API route hashes it before it gets here),
// and the per-visitor id is a random value kept in the browser's localStorage, not PII.
//
// Degrades gracefully: if SUPABASE_URL / SUPABASE_SERVICE_KEY are not set (or on any
// error), recordEvent is a no-op and reportStats returns a zeroed object, so the
// caller never throws.

const BUCKET = 'geo-events';

/** Ordered sections of the report, front to back. Used to pick the furthest reached. */
export const SECTION_ORDER = [
  'hero',
  'scorecard',
  'engines',
  'heatmap',
  'competitors',
  'sources',
  'plan',
] as const;

export type SectionKey = (typeof SECTION_ORDER)[number];

export type EventType = 'view' | 'progress' | 'leave';

export interface ReportEvent {
  type: EventType;
  visitorId: string;
  ipHash?: string;
  section?: string;
  maxScrollPct?: number;
  dwellMs?: number;
  ts: string;
}

export interface ReportStats {
  views: number;
  uniqueVisitors: number;
  firstView: string | null;
  lastView: string | null;
  avgDwellMs: number;
  maxSectionReached: string | null;
  sectionReach: Record<string, number>;
  likelyShared: boolean;
}

function emptyStats(): ReportStats {
  return {
    views: 0,
    uniqueVisitors: 0,
    firstView: null,
    lastView: null,
    avgDwellMs: 0,
    maxSectionReached: null,
    sectionReach: {},
    likelyShared: false,
  };
}

function env(): { base: string; key: string } | null {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key) return null;
  return { base: base.replace(/\/$/, ''), key };
}

/** Create the private bucket if it does not already exist. Best-effort, never throws. */
async function ensureBucket(base: string, key: string): Promise<void> {
  try {
    await fetch(`${base}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
      signal: AbortSignal.timeout(5000),
    });
    // A 400/409 ("already exists") is expected and fine, we ignore the response.
  } catch (err) {
    console.error('ensureBucket (geo-events) failed', err);
  }
}

/** A sane token: the same short hex/slug shape the report links use. */
function sanitizeToken(token: string): string {
  return (token || '').replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 80);
}

/** Store a single event as geo-events/<token>/<ts>-<rand>.json. No-op if unconfigured. */
export async function recordEvent(token: string, ev: ReportEvent): Promise<void> {
  const cfg = env();
  if (!cfg) return;
  const safeToken = sanitizeToken(token);
  if (!safeToken) return;
  const { base, key } = cfg;
  try {
    const rand = Math.random().toString(36).slice(2, 10);
    const stamp = Date.now().toString(36);
    const name = `${safeToken}/${stamp}-${rand}.json`;
    const url = `${base}/storage/v1/object/${BUCKET}/${name}`;
    const body = JSON.stringify(ev);
    const headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    };
    let res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(6000) });
    // First write to a fresh project: the bucket may not exist yet. Create and retry once.
    if (!res.ok && (res.status === 400 || res.status === 404)) {
      await ensureBucket(base, key);
      res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(6000) });
    }
    if (!res.ok) {
      console.error('recordEvent failed', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('recordEvent failed', err);
  }
}

/** List object names under geo-events/<token>/. Best-effort, returns []. */
async function listEventObjects(base: string, key: string, safeToken: string): Promise<string[]> {
  const names: string[] = [];
  const headers = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  // Page through the listing (1000 per page) so busy reports aren't truncated.
  for (let offset = 0; offset < 10000; offset += 1000) {
    const res = await fetch(`${base}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        prefix: `${safeToken}/`,
        limit: 1000,
        offset,
        sortBy: { column: 'created_at', order: 'asc' },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) break;
    const objects = (await res.json()) as Array<{ name?: unknown }>;
    if (!Array.isArray(objects) || objects.length === 0) break;
    for (const o of objects) {
      const n = typeof o?.name === 'string' ? o.name : '';
      if (n.endsWith('.json')) names.push(`${safeToken}/${n}`);
    }
    if (objects.length < 1000) break;
  }
  return names;
}

/** Load one event JSON. Returns null on any error. */
async function loadEvent(base: string, key: string, name: string): Promise<ReportEvent | null> {
  try {
    const url = `${base}/storage/v1/object/${BUCKET}/${name}`;
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as ReportEvent;
    if (!json || typeof json !== 'object' || typeof json.visitorId !== 'string') return null;
    return json;
  } catch {
    return null;
  }
}

function sectionIndex(section: string | undefined): number {
  if (!section) return -1;
  return (SECTION_ORDER as readonly string[]).indexOf(section);
}

/** Aggregate all events for a token into view statistics. Zeroed when unconfigured. */
export async function reportStats(token: string): Promise<ReportStats> {
  const cfg = env();
  if (!cfg) return emptyStats();
  const safeToken = sanitizeToken(token);
  if (!safeToken) return emptyStats();
  const { base, key } = cfg;

  try {
    const names = await listEventObjects(base, key, safeToken);
    if (names.length === 0) return emptyStats();

    const loaded = await Promise.all(names.map((n) => loadEvent(base, key, n)));
    const events = loaded.filter((e): e is ReportEvent => e !== null);
    if (events.length === 0) return emptyStats();

    const visitors = new Set<string>();
    const sectionReach: Record<string, number> = {};
    let views = 0;
    let firstView: string | null = null;
    let lastView: string | null = null;
    let dwellSum = 0;
    let dwellCount = 0;
    let furthestIdx = -1;
    let maxSectionReached: string | null = null;

    for (const ev of events) {
      if (ev.visitorId) visitors.add(ev.visitorId);

      if (ev.type === 'view') {
        views += 1;
        if (ev.ts) {
          if (!firstView || ev.ts < firstView) firstView = ev.ts;
          if (!lastView || ev.ts > lastView) lastView = ev.ts;
        }
      }

      if (ev.type === 'leave' && typeof ev.dwellMs === 'number' && ev.dwellMs >= 0) {
        dwellSum += ev.dwellMs;
        dwellCount += 1;
      }

      if (ev.section) {
        sectionReach[ev.section] = (sectionReach[ev.section] ?? 0) + 1;
        const idx = sectionIndex(ev.section);
        if (idx > furthestIdx) {
          furthestIdx = idx;
          maxSectionReached = ev.section;
        }
      }
    }

    const uniqueVisitors = visitors.size;
    return {
      views,
      uniqueVisitors,
      firstView,
      lastView,
      avgDwellMs: dwellCount > 0 ? Math.round(dwellSum / dwellCount) : 0,
      maxSectionReached,
      sectionReach,
      likelyShared: uniqueVisitors > 1,
    };
  } catch (err) {
    console.error('reportStats failed', err);
    return emptyStats();
  }
}
