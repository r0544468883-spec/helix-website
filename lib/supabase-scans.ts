// Persists every /ai-checker scan (and lead) to Supabase via the REST API.
// No dependency, no client library. Degrades gracefully: if SUPABASE_URL /
// SUPABASE_SERVICE_KEY are not set, it silently does nothing.
//
// Table (run once in Supabase SQL editor — see docs/geo_scans.sql):
//   create table public.geo_scans (
//     id uuid primary key default gen_random_uuid(),
//     url text not null, host text, ladder int, issues int,
//     business_name text, has_lead boolean default false,
//     name text, email text, phone text,
//     source text, created_at timestamptz default now()
//   );

export interface ScanRecord {
  url: string;
  host?: string;
  ladder?: number;
  issues?: number;
  business_name?: string;
  has_lead?: boolean;
  name?: string;
  email?: string;
  phone?: string;
  source?: 'scan' | 'report';
}

export async function recordScan(entry: ScanRecord): Promise<void> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key) return; // not configured — skip silently
  try {
    await fetch(`${base.replace(/\/$/, '')}/rest/v1/geo_scans`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(entry),
    });
  } catch (err) {
    console.error('recordScan failed', err);
  }
}
