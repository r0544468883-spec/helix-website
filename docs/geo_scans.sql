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

-- RLS is REQUIRED. This table holds lead PII (name/email/phone) and Supabase's
-- default grants give `anon` full CRUD on public tables — and the site ships a
-- public anon key for the /free-tools/ai-context insert. service_role holds
-- BYPASSRLS, so the server writer in lib/supabase-scans.ts is unaffected.
-- See docs/rls_lockdown.sql for the full lockdown across all four tables.
alter table public.geo_scans enable row level security;
revoke all on public.geo_scans from anon, authenticated, public;
