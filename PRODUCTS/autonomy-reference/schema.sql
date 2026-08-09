-- HELIX Autonomy Switch — canonical schema (copy into each product's supabase/)
-- Safe by default: absent row => 'advisor'. Autopilot for outbound/money/tos
-- features additionally requires risk_ack = true (enforced in code, see guard.ts).

create table if not exists autonomy_settings (
  workspace_id  uuid not null,
  feature_key   text not null,
  mode          text not null default 'advisor'
                check (mode in ('advisor','approve','autopilot')),
  risk_ack      boolean not null default false,
  daily_cap     int,
  updated_by    uuid,
  updated_at    timestamptz default now(),
  primary key (workspace_id, feature_key)
);

alter table autonomy_settings enable row level security;

-- Adjust the membership predicate to each product's helper (is_member / owns_site / memberships).
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'autonomy_member') then
    create policy autonomy_member on autonomy_settings for all
      to authenticated
      using  (true)
      with check (true);
  end if;
end $$;

-- Shared action queue for products that don't already have one
-- (SDR reuses approval_queue; OPS reuses performance_decisions — skip this there).
create table if not exists autonomy_actions (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null,
  feature_key   text not null,
  status        text not null default 'pending'
                check (status in ('pending','approved','rejected','executed','failed')),
  summary       text not null,          -- human-readable "what will happen"
  payload       jsonb not null,         -- the concrete action to execute
  result        jsonb,
  created_at    timestamptz default now(),
  decided_at    timestamptz,
  executed_at   timestamptz
);

alter table autonomy_actions enable row level security;
create index if not exists idx_autonomy_actions_ws_status
  on autonomy_actions(workspace_id, status);

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'autonomy_actions_member') then
    create policy autonomy_actions_member on autonomy_actions for all
      to authenticated
      using  (true)
      with check (true);
  end if;
end $$;
