-- ============================================================
-- HELIX CRM — Migration v17 — Automations (visual + verbal builder)
-- A per-workspace automation = a node graph (trigger → steps) stored as jsonb.
-- The engine (lib/automations/engine.ts) walks it when a trigger event fires.
-- Run once in the Supabase SQL editor, after v16. Safe to re-run.
-- ============================================================

create table if not exists public.automations (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  name         text not null default 'אוטומציה חדשה',
  trigger      text not null default 'contact.created',  -- event that starts the flow
  graph        jsonb not null default '{"nodes":[],"edges":[]}'::jsonb,
  enabled      boolean not null default false,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists automations_ws_idx on public.automations(workspace_id, enabled);
create index if not exists automations_trigger_idx on public.automations(workspace_id, trigger, enabled);

-- run history — one row per firing, with a step-by-step log for debugging
create table if not exists public.automation_runs (
  id            uuid primary key default gen_random_uuid(),
  automation_id uuid not null references public.automations(id) on delete cascade,
  workspace_id  uuid not null references public.crm_workspaces(id) on delete cascade,
  status        text not null default 'ok',   -- ok | error
  trigger       text,
  log           jsonb not null default '[]'::jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists automation_runs_idx on public.automation_runs(automation_id, created_at desc);

-- RLS: workspace members (+ agency admins via crm_is_member from v16)
alter table public.automations     enable row level security;
alter table public.automation_runs enable row level security;

do $$ begin
  create policy "members manage automations" on public.automations for all
    using (public.crm_is_member(workspace_id)) with check (public.crm_is_member(workspace_id));
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "members read runs" on public.automation_runs for select
    using (public.crm_is_member(workspace_id));
exception when duplicate_object then null; end $$;
