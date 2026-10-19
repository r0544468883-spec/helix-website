import 'server-only';

// Stores and fetches a generated GEO report as a JSON object in Supabase Storage.
// No client library, just the Storage REST API with the service key.
// Bucket "geo-reports" (private), object "<token>.json".
//
// Degrades gracefully: if SUPABASE_URL / SUPABASE_SERVICE_KEY are not set (or on any
// error), saveReport is a no-op and loadReport returns null, so the caller never throws.

import type { GeoReport } from './geo-report-build';

const BUCKET = 'geo-reports';

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
    console.error('ensureBucket failed', err);
  }
}

/** Upload the report JSON (upsert) to geo-reports/<token>.json. No-op if unconfigured. */
export async function saveReport(token: string, report: GeoReport): Promise<void> {
  const cfg = env();
  if (!cfg) return;
  const { base, key } = cfg;
  try {
    const url = `${base}/storage/v1/object/${BUCKET}/${encodeURIComponent(token)}.json`;
    const body = JSON.stringify(report);
    const headers = {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
      'x-upsert': 'true',
    };
    let res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(8000) });
    // First write to a fresh project: the bucket may not exist yet. Create and retry once.
    if (!res.ok && (res.status === 400 || res.status === 404)) {
      await ensureBucket(base, key);
      res = await fetch(url, { method: 'POST', headers, body, signal: AbortSignal.timeout(8000) });
    }
    if (!res.ok) {
      console.error('saveReport failed', res.status, await res.text().catch(() => ''));
    }
  } catch (err) {
    console.error('saveReport failed', err);
  }
}

/** A single row for the admin dashboard list. */
export interface ReportListItem {
  token: string;
  brand: string;
  score: number;
  date: string;
}

/** List stored reports (newest first) for the internal admin dashboard.
 *  Lists the objects in the bucket, loads each JSON, and maps it to a row.
 *  Objects that fail to load are skipped. Returns [] when unconfigured. */
export async function listReports(): Promise<ReportListItem[]> {
  const cfg = env();
  if (!cfg) return [];
  const { base, key } = cfg;
  try {
    const res = await fetch(`${base}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prefix: '',
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const objects = (await res.json()) as Array<{ name?: unknown }>;
    if (!Array.isArray(objects)) return [];

    const tokens = objects
      .map((o) => (typeof o?.name === 'string' ? o.name : ''))
      .filter((n) => n.endsWith('.json'))
      .map((n) => n.slice(0, -'.json'.length))
      .filter(Boolean);

    const loaded = await Promise.all(
      tokens.map(async (token) => {
        const report = await loadReport(token);
        if (!report) return null;
        return {
          token,
          brand: report.business.name,
          score: report.shareOfModel.overallShareOfModel,
          date: report.generatedAt,
        } satisfies ReportListItem;
      }),
    );

    const rows = loaded.filter((r): r is ReportListItem => r !== null);
    // Newest first by generatedAt (defensive: the list order is best-effort).
    rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
    return rows;
  } catch (err) {
    console.error('listReports failed', err);
    return [];
  }
}

/** Read and parse the report JSON. Returns null when unconfigured, missing, or on error. */
export async function loadReport(token: string): Promise<GeoReport | null> {
  const cfg = env();
  if (!cfg) return null;
  const { base, key } = cfg;
  try {
    const url = `${base}/storage/v1/object/${BUCKET}/${encodeURIComponent(token)}.json`;
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as GeoReport;
    if (!json || typeof json !== 'object' || json.v !== 1) return null;
    return json;
  } catch (err) {
    console.error('loadReport failed', err);
    return null;
  }
}
