-- Leads captured by the free content tool's email gate (/free-tools/content).
-- Run once in the Supabase SQL editor. Mirrors docs/geo_scans.sql.

create table if not exists public.content_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text default 'content',
  created_at timestamptz default now()
);

create index if not exists content_leads_email_idx on public.content_leads (email);
create index if not exists content_leads_created_at_idx on public.content_leads (created_at desc);
