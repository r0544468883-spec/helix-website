import 'server-only';

// Persists emails captured by the /free-tools/content email gate to Supabase via the REST
// API, same no-dependency, degrade-gracefully pattern as lib/supabase-scans.ts. If
// SUPABASE_URL / SUPABASE_SERVICE_KEY are not set, it silently does nothing.
//
// Table (run once, see docs/content_leads.sql):
//   create table public.content_leads (
//     id uuid primary key default gen_random_uuid(),
//     email text not null,
//     source text default 'content',
//     created_at timestamptz default now()
//   );

export interface ContentLead {
  email: string;
  source?: string;
}

export async function recordContentLead(entry: ContentLead): Promise<void> {
  const base = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!base || !key) return; // not configured, skip silently
  try {
    await fetch(`${base.replace(/\/$/, '')}/rest/v1/content_leads`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({ email: entry.email, source: entry.source ?? 'content' }),
      // Bounded: awaited on the user-facing critical path in /api/content-lead.
      signal: AbortSignal.timeout(5000),
    });
  } catch (err) {
    console.error('recordContentLead failed', err);
  }
}
