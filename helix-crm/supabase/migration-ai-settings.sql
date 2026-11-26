-- ============================================================================
-- BYOK AI (bring your own key): each workspace connects its own AI provider
-- (Claude / GPT / Gemini) and the CRM's AI features run on that key.
-- RUN IN THE *CRM* SUPABASE DASHBOARD (project rymrafskckljgirrejqu) SQL editor.
-- Idempotent. The key is server-only: RLS is enabled with NO policies, so only
-- the service-role (server actions) can read it — it never reaches the browser.
-- ============================================================================

create table if not exists public.crm_ai_settings (
  workspace_id uuid primary key references public.crm_workspaces(id) on delete cascade,
  provider     text not null default 'anthropic',  -- anthropic | openai | gemini
  api_key      text not null,
  model        text,                               -- null = provider default
  enabled      boolean not null default true,
  updated_at   timestamptz not null default now()
);

alter table public.crm_ai_settings enable row level security;
-- No policies on purpose: service-role only.
