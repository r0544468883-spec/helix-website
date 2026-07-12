-- Run once in Supabase → SQL Editor. Creates the table that stores every
-- /ai-checker scan and lead. Then set SUPABASE_URL + SUPABASE_SERVICE_KEY in Vercel.

create table if not exists public.geo_scans (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  host text,
  ladder int,
  issues int,
  business_name text,
  has_lead boolean default false,
  name text,
  email text,
  phone text,
  source text,
  created_at timestamptz not null default now()
);

create index if not exists geo_scans_created_idx on public.geo_scans (created_at desc);
create index if not exists geo_scans_host_idx on public.geo_scans (host);

-- The server uses the service-role key (server-only), so RLS is not required for
-- inserts. Enable RLS + policies only if you also read this table from the client.
