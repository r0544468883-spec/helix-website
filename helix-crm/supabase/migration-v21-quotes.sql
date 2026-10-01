-- ============================================================================
-- migration v21 — price quotes and business details (openspec: crm-quotes)
--
-- A quote is drafted from a lead, numbered and frozen when it is sent, and shown
-- to the client at /{locale}/q/{public_token} with no login. The business details
-- a quote carries live in crm_workspaces.business, apart from branding, which
-- drives the CRM's own top bar.
--
-- Requires v20 (public.crm_role). Safe to run more than once.
-- Run it in the Supabase SQL editor, then run it a second time to confirm.
-- ============================================================================

-- ── 0) v20 first: every policy below is written with crm_role() ──
do $$
begin
  if to_regprocedure('public.crm_role(uuid)') is null then
    raise exception 'Run supabase/migration-v20-role-enforcement.sql first: v21 uses public.crm_role(uuid).';
  end if;
end $$;

-- ── 1) Business details for documents ──
--    name, company_number, address, phone, email, website, vat_exempt,
--    validity_days, default_notes, logo_url. Validated by the app (lib/crm-business.ts).
alter table public.crm_workspaces add column if not exists business jsonb not null default '{}'::jsonb;

-- ── 2) Quotes ──
create table if not exists public.crm_quotes (
  id                uuid primary key default gen_random_uuid(),
  workspace_id      uuid not null references public.crm_workspaces(id) on delete cascade,
  contact_id        uuid references public.crm_contacts(id) on delete set null,
  deal_id           uuid references public.crm_deals(id) on delete set null,
  number            text,                                   -- '2026-004', set when sent
  status            text not null default 'draft' check (status in ('draft', 'sent', 'cancelled')),
  locale            text not null default 'he' check (locale in ('he', 'en')),
  subject           text not null default '',
  items             jsonb not null default '[]'::jsonb,     -- [{description, quantity, unit_price}]
  vat_rate          numeric(4,3) not null default 0.18,     -- 0 for an עוסק פטור; fixed per quote
  subtotal          numeric(12,2) not null default 0,
  vat               numeric(12,2) not null default 0,
  total             numeric(12,2) not null default 0,
  currency          text not null default 'ILS',
  valid_until       date,
  notes             text,
  public_token      text not null,                          -- 32 random bytes, base64url
  business_snapshot jsonb,                                  -- frozen at send
  client_snapshot   jsonb,                                  -- frozen at send
  sent_at           timestamptz,
  first_viewed_at   timestamptz,
  last_viewed_at    timestamptz,
  created_by        uuid references public.profiles(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create unique index if not exists crm_quotes_token_idx  on public.crm_quotes (public_token);
create unique index if not exists crm_quotes_number_idx on public.crm_quotes (workspace_id, number) where number is not null;
create index if not exists crm_quotes_contact_idx       on public.crm_quotes (workspace_id, contact_id, created_at desc);

-- ── 3) Numbering: one row per workspace per year ──
--    RLS on and no policy: only the service role touches it, through the function
--    below, which the send action calls after its own membership check.
create table if not exists public.crm_quote_counters (
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  year         int  not null,
  last_number  int  not null default 0,
  primary key (workspace_id, year)
);
alter table public.crm_quote_counters enable row level security;

--    One atomic statement: two sends at once get consecutive numbers. Not security
--    definer (v18 removed one that had no membership guard); only service_role may
--    execute it, and the action checks membership before calling.
create or replace function public.crm_next_quote_number(p_ws uuid, p_year int)
returns int language sql volatile
set search_path = public, pg_temp as $$
  insert into public.crm_quote_counters as c (workspace_id, year, last_number)
  values (p_ws, p_year, 1)
  on conflict (workspace_id, year) do update set last_number = c.last_number + 1
  returning c.last_number;
$$;
revoke execute on function public.crm_next_quote_number(uuid, int) from public, anon, authenticated;
grant execute on function public.crm_next_quote_number(uuid, int) to service_role;

-- ── 4) Quotes follow v20's roles: every role reads, admin/agency_admin/member
--    write, admin/agency_admin delete. The public page reads by token through the
--    service role, never through these policies. ──
alter table public.crm_quotes enable row level security;
drop policy if exists "crm_quotes read"   on public.crm_quotes;
drop policy if exists "crm_quotes insert" on public.crm_quotes;
drop policy if exists "crm_quotes update" on public.crm_quotes;
drop policy if exists "crm_quotes delete" on public.crm_quotes;
create policy "crm_quotes read" on public.crm_quotes for select
  using (public.crm_role(workspace_id) is not null);
create policy "crm_quotes insert" on public.crm_quotes for insert
  with check (public.crm_role(workspace_id) in ('admin', 'agency_admin', 'member'));
create policy "crm_quotes update" on public.crm_quotes for update
  using (public.crm_role(workspace_id) in ('admin', 'agency_admin', 'member'))
  with check (public.crm_role(workspace_id) in ('admin', 'agency_admin', 'member'));
create policy "crm_quotes delete" on public.crm_quotes for delete
  using (public.crm_role(workspace_id) in ('admin', 'agency_admin'));

-- ── 5) Document logos: public read, written only by the server (service role) ──
insert into storage.buckets (id, name, public)
values ('crm-business', 'crm-business', true)
on conflict (id) do nothing;

-- ── Self-check: four policies on crm_quotes, the bucket public ──
do $$
begin
  if (select count(*) from pg_policies where schemaname = 'public' and tablename = 'crm_quotes') <> 4 then
    raise exception 'crm_quotes should have exactly four policies';
  end if;
  if not exists (select 1 from storage.buckets where id = 'crm-business' and public) then
    raise exception 'the crm-business bucket is missing or not public';
  end if;
end $$;
