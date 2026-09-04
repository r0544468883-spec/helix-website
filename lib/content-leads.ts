import 'server-only';

// Persists leads captured by the free tools to Supabase via the REST API, same
// no-dependency, degrade-gracefully pattern as lib/supabase-scans.ts. If
// SUPABASE_URL / SUPABASE_SERVICE_KEY are not set, it silently does nothing.
//
// Table (run once, see docs/content_leads.sql). The name/details columns are optional,
// added later; recordContentLead falls back to a minimal insert if they don't exist yet:
//   create table public.content_leads (
//     id uuid primary key default gen_random_uuid(),
//     email text not null,
//     source text default 'content',
//     name text,               -- optional, run: alter table content_leads add column if not exists name text;
//     details jsonb,           -- optional, run: alter table content_leads add column if not exists details jsonb;
//     created_at timestamptz default now()
//   );

export interface ContentLead {
  email: string;
  source?: string;
  name?: string;
  details?: Record<string, string>;
}

async function insert(base: string, key: string, payload: Record<string, unknown>): Promise<boolean> {
  const res = await fetch(`${base.replace(/\/$/, '')}/rest/v1/content_leads`, {
    method: 'POST',
    headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(5000),
  });
  return res.ok;
}

export async function recordContentLead(entry: ContentLead): Promise<void> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key) return; // not configured, skip silently
  const source = entry.source || 'content';
  try {
    // Try the enriched row (email + source + name + details). If the name/details columns
    // don't exist yet (pre-migration), PostgREST 400s, so fall back to the guaranteed
    // minimal row so the lead is never lost.
    const enriched: Record<string, unknown> = { email: entry.email, source };
    if (entry.name) enriched.name = entry.name;
    if (entry.details && Object.keys(entry.details).length) enriched.details = entry.details;
    const ok = await insert(base, key, enriched);
    if (!ok && (enriched.name || enriched.details)) {
      await insert(base, key, { email: entry.email, source }); // minimal fallback
    }
  } catch (err) {
    console.error('recordContentLead failed', err);
  }
}
