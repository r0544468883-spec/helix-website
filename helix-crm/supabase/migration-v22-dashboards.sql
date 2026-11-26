-- ============================================================================
-- v22 — personal dashboard layouts (the PLUG-style dashboard builder): each
-- user composes their own overview from widgets (add/remove/resize/reorder);
-- the layout is stored here per user per workspace.
-- RUN IN THE *CRM* SUPABASE DASHBOARD (project rymrafskckljgirrejqu) SQL editor.
-- Idempotent. Service-role access only (RLS enabled, no policies) — reads and
-- writes go through server actions that resolve the workspace from the session.
-- ============================================================================

create table if not exists public.crm_dashboards (
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  user_id      uuid not null references public.profiles(id) on delete cascade,
  layout       jsonb not null default '[]'::jsonb,  -- [{ "t": "kpi_contacts", "s": "s" }, …]
  updated_at   timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

alter table public.crm_dashboards enable row level security;
-- No policies on purpose: service-role only.
