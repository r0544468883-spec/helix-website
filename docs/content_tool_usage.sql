-- Free-usage metering for the content tool (/free-tools/content).
-- One row per billable use (build post / write-or-rewrite email). Analysis is free
-- and not recorded. After FREE_LIMIT (4) uses per email → upgrade to HELIX OPS.
-- Run once in the Supabase SQL editor.

create table if not exists public.content_tool_usage (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  mode text not null,            -- 'build' | 'email' | 'analyze'
  created_at timestamptz default now()
);

create index if not exists content_tool_usage_email_idx on public.content_tool_usage (email);

-- RLS is REQUIRED. Without it the public anon key can DELETE from this table,
-- which resets the FREE_LIMIT meter and makes the paid Claude modes free.
-- service_role bypasses RLS, so lib/content-usage.ts is unaffected.
-- See docs/rls_lockdown.sql.
alter table public.content_tool_usage enable row level security;
revoke all on public.content_tool_usage from anon, authenticated, public;
