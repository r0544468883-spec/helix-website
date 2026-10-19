import 'server-only';

// Stores and validates developer API keys as JSON objects in Supabase Storage.
// Same approach as lib/geo-report-store.ts: no client library, just the Storage REST
// API with the service key. Bucket "geo-api-keys" (private), object "<sha256>.json".
//
// We NEVER store the key itself, only the sha256 hash of it (which is also the object
// name). The plaintext key is returned exactly once, at creation.
//
// Degrades gracefully: if SUPABASE_URL / SUPABASE_SERVICE_KEY are not set (or on any
// error), createApiKey returns null, validateApiKey returns null, listApiKeys returns
// [] and touchApiKey is a no-op, so the caller never throws.

import crypto from 'node:crypto';

const BUCKET = 'geo-api-keys';

/** The stored record (object body). Mirrors what createApiKey writes. */
interface StoredKey {
  id: string;
  label: string;
  createdAt: string;
  maxUsdPerRun: number;
  disabled: boolean;
  lastUsedAt: string | null;
}

function env(): { base: string; key: string } | null {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key) return null;
  return { base: base.replace(/\/$/, ''), key };
}

/** sha256 hex of the presented key. Also the object name (<hash>.json). */
function hashKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
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
    console.error('ensureBucket (keys) failed', err);
  }
}

/** Upsert a record to geo-api-keys/<hash>.json. Returns true on success. */
async function putRecord(base: string, key: string, hash: string, record: StoredKey): Promise<boolean> {
  const url = `${base}/storage/v1/object/${BUCKET}/${encodeURIComponent(hash)}.json`;
  const body = JSON.stringify(record);
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
    console.error('putRecord (keys) failed', res.status, await res.text().catch(() => ''));
    return false;
  }
  return true;
}

/** Read and parse one record by its hash. Returns null when missing or on error. */
async function getRecord(base: string, key: string, hash: string): Promise<StoredKey | null> {
  try {
    const url = `${base}/storage/v1/object/${BUCKET}/${encodeURIComponent(hash)}.json`;
    const res = await fetch(url, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as StoredKey;
    if (!json || typeof json !== 'object' || typeof json.id !== 'string') return null;
    return json;
  } catch (err) {
    console.error('getRecord (keys) failed', err);
    return null;
  }
}

/**
 * Generate a new developer key, store ONLY its sha256 hash, and return the plaintext
 * key once. Returns null when unconfigured or on a write failure.
 */
export async function createApiKey(
  label: string,
  maxUsdPerRun = 5,
): Promise<{ key: string; id: string } | null> {
  const cfg = env();
  if (!cfg) return null;
  const { base, key: serviceKey } = cfg;

  // hgk_ prefix + 32 hex chars. The plaintext is returned once and never stored.
  const plaintext = `hgk_${crypto.randomBytes(16).toString('hex')}`;
  const id = crypto.randomBytes(8).toString('hex');
  const record: StoredKey = {
    id,
    label: (label || '').trim() || 'ללא שם',
    createdAt: new Date().toISOString(),
    maxUsdPerRun: typeof maxUsdPerRun === 'number' && maxUsdPerRun > 0 ? maxUsdPerRun : 5,
    disabled: false,
    lastUsedAt: null,
  };

  const ok = await putRecord(base, serviceKey, hashKey(plaintext), record);
  if (!ok) return null;
  return { key: plaintext, id };
}

/**
 * Validate a presented key: sha256 it, load the record, and return its public fields.
 * Returns null when unconfigured, missing, or disabled.
 */
export async function validateApiKey(
  key: string,
): Promise<{ id: string; label: string; maxUsdPerRun: number } | null> {
  const cfg = env();
  if (!cfg) return null;
  if (!key || typeof key !== 'string') return null;
  const rec = await getRecord(cfg.base, cfg.key, hashKey(key.trim()));
  if (!rec || rec.disabled) return null;
  return { id: rec.id, label: rec.label, maxUsdPerRun: rec.maxUsdPerRun };
}

/** A single row for the admin dashboard list. Never includes the hash or the key. */
export interface ApiKeyListItem {
  id: string;
  label: string;
  createdAt: string;
  maxUsdPerRun: number;
  disabled: boolean;
  lastUsedAt: string | null;
}

/** List every stored key (newest first) for the internal admin dashboard. [] when unconfigured. */
export async function listApiKeys(): Promise<ApiKeyListItem[]> {
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
        limit: 200,
        sortBy: { column: 'created_at', order: 'desc' },
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return [];
    const objects = (await res.json()) as Array<{ name?: unknown }>;
    if (!Array.isArray(objects)) return [];

    const hashes = objects
      .map((o) => (typeof o?.name === 'string' ? o.name : ''))
      .filter((n) => n.endsWith('.json'))
      .map((n) => n.slice(0, -'.json'.length))
      .filter(Boolean);

    const loaded = await Promise.all(
      hashes.map(async (hash) => {
        const rec = await getRecord(base, key, hash);
        if (!rec) return null;
        return {
          id: rec.id,
          label: rec.label,
          createdAt: rec.createdAt,
          maxUsdPerRun: rec.maxUsdPerRun,
          disabled: rec.disabled,
          lastUsedAt: rec.lastUsedAt,
        } satisfies ApiKeyListItem;
      }),
    );

    const rows = loaded.filter((r): r is ApiKeyListItem => r !== null);
    // Newest first by createdAt (defensive: the list order is best-effort).
    rows.sort((a, b) => (a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0));
    return rows;
  } catch (err) {
    console.error('listApiKeys failed', err);
    return [];
  }
}

/** Best-effort: stamp lastUsedAt on the key's record. Never throws. */
export async function touchApiKey(key: string): Promise<void> {
  const cfg = env();
  if (!cfg) return;
  if (!key || typeof key !== 'string') return;
  try {
    const hash = hashKey(key.trim());
    const rec = await getRecord(cfg.base, cfg.key, hash);
    if (!rec) return;
    rec.lastUsedAt = new Date().toISOString();
    await putRecord(cfg.base, cfg.key, hash, rec);
  } catch (err) {
    console.error('touchApiKey failed', err);
  }
}
