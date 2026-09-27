-- ============================================================
-- HELIX CRM — Migration v20 — roles that actually restrict something
--
-- Until now every CRM table had one `for all using (crm_is_member(...))`
-- policy, so `admin` and `member` had identical rights over workspace data:
-- both could delete every contact, deal and activity with a direct API call
-- using the public anon key. The role was only checked when managing the team.
--
-- This splits RLS by verb and adds a read-only `viewer` role:
--
--                  select  insert  update  delete
--   viewer          yes      -       -       -
--   member          yes     yes     yes      -
--   admin           yes     yes     yes     yes
--   agency_admin    yes     yes     yes     yes
--
-- automations: same split (a member still creates and edits, only admins delete).
-- autonomy_settings: every role reads, only admins write — autonomy decides
-- whether an AI agent acts without asking.
-- automation_runs is deliberately untouched (engine log, written via service_role).
--
-- API keys are unaffected: lib/crm-api.ts acts through the service-role client,
-- which bypasses RLS; key permissions come from the scope list.
--
-- Run once in the Supabase SQL editor of rymrafskckljgirrejqu, AFTER v19.
-- Safe to re-run. Rollback block at the foot of the file.
-- ============================================================

-- ── 0) Dependencies ──
do $$
begin
  if to_regproc('public.crm_is_agency_admin') is null
     or to_regclass('public.automations') is null
     or to_regclass('public.autonomy_settings') is null then
    raise exception 'v20 cannot run: run migration-v16, v17, autonomy.sql and v18 first.';
  end if;
end $$;

-- ── 1) One place that decides the caller's effective role in a workspace ──
--    Direct membership wins; otherwise an admin/agency_admin of the parent
--    agency inherits 'agency_admin'. Same precedence as accessRole() in
--    lib/crm-workspace.ts. security definer → no RLS recursion via crm_members.
create or replace function public.crm_role(ws uuid)
returns text language sql security definer stable
set search_path = public, pg_temp as $$
  select coalesce(
    (select m.role from public.crm_members m
      where m.workspace_id = ws and m.user_id = auth.uid()),
    (select 'agency_admin' from public.crm_workspaces w
      join public.crm_members m on m.workspace_id = w.parent_workspace_id
      where w.id = ws and m.user_id = auth.uid()
        and m.role in ('admin','agency_admin') limit 1)
  );
$$;

--    crm_is_member keeps its v16 meaning (direct member OR inheriting agency
--    admin), now expressed through crm_role so the two can never disagree.
--    Redefined rather than dropped: v16–v18 policies still reference it.
create or replace function public.crm_is_member(ws uuid)
returns boolean language sql security definer stable
set search_path = public, pg_temp as $$
  select public.crm_role(ws) is not null;
$$;

revoke execute on function public.crm_role(uuid) from anon;

-- ── 2) Role check constraints: add viewer; invites also gain the agency_admin
--    that v16 forgot to add (inviting one has been rejected since v16) ──
alter table public.crm_members drop constraint if exists crm_members_role_check;
alter table public.crm_members add constraint crm_members_role_check
  check (role in ('admin','member','agency_admin','viewer'));

alter table public.crm_invites drop constraint if exists crm_invites_role_check;
alter table public.crm_invites add constraint crm_invites_role_check
  check (role in ('admin','member','agency_admin','viewer'));

-- ── 3) Per-verb policies on the five CRM data tables + automations ──
--    Each verb written out explicitly. insert has only `with check` — an insert
--    policy with `using` is an error, and a common way to get this wrong.
do $$
declare tbl text;
begin
  foreach tbl in array array['crm_companies','crm_contacts','crm_deals','crm_activities','crm_tasks','automations'] loop
    -- the blanket policies this replaces (v16 names, and v17's for automations)
    execute format('drop policy if exists "members access %1$s" on public.%1$s', tbl);
    execute format('drop policy if exists "owner manages %1$s" on public.%1$s', tbl);
    if tbl = 'automations' then
      execute 'drop policy if exists "members manage automations" on public.automations';
    end if;

    execute format('drop policy if exists "%1$s read" on public.%1$s', tbl);
    execute format('drop policy if exists "%1$s insert" on public.%1$s', tbl);
    execute format('drop policy if exists "%1$s update" on public.%1$s', tbl);
    execute format('drop policy if exists "%1$s delete" on public.%1$s', tbl);

    execute format(
      'create policy "%1$s read" on public.%1$s for select '
      'using (public.crm_role(workspace_id) is not null)', tbl);
    execute format(
      'create policy "%1$s insert" on public.%1$s for insert '
      'with check (public.crm_role(workspace_id) in (''admin'',''agency_admin'',''member''))', tbl);
    execute format(
      'create policy "%1$s update" on public.%1$s for update '
      'using (public.crm_role(workspace_id) in (''admin'',''agency_admin'',''member'')) '
      'with check (public.crm_role(workspace_id) in (''admin'',''agency_admin'',''member''))', tbl);
    execute format(
      'create policy "%1$s delete" on public.%1$s for delete '
      'using (public.crm_role(workspace_id) in (''admin'',''agency_admin''))', tbl);
  end loop;
end $$;

-- ── 4) autonomy_settings: read for every role, write for admins only ──
drop policy if exists autonomy_member on public.autonomy_settings;
drop policy if exists "autonomy_settings read"  on public.autonomy_settings;
drop policy if exists "autonomy_settings write" on public.autonomy_settings;
create policy "autonomy_settings read" on public.autonomy_settings for select
  using (public.crm_role(workspace_id) is not null);
-- `for all` here is fine: select is also granted by the read policy (OR-ed),
-- and insert/update/delete all require an admin.
create policy "autonomy_settings write" on public.autonomy_settings for all
  using (public.crm_role(workspace_id) in ('admin','agency_admin'))
  with check (public.crm_role(workspace_id) in ('admin','agency_admin'));

-- ── 5) Verify: four policies per data table, two on autonomy_settings ──
do $$
declare bad text;
begin
  select string_agg(tablename || '=' || n, ', ') into bad from (
    select tablename, count(*) n from pg_policies
    where schemaname = 'public'
      and tablename in ('crm_companies','crm_contacts','crm_deals','crm_activities','crm_tasks','automations')
    group by tablename having count(*) <> 4
  ) x;
  if bad is not null then raise exception 'v20: unexpected policy count: %', bad; end if;
end $$;

-- ============================================================
-- ROLLBACK (restores the v16/v17/v18 blanket policies). Uncomment and run
-- only if the admin loses access after applying v20. The widened check
-- constraints can stay: a constraint allowing a role nobody holds is inert.
-- ============================================================
-- do $$
-- declare tbl text;
-- begin
--   foreach tbl in array array['crm_companies','crm_contacts','crm_deals','crm_activities','crm_tasks'] loop
--     execute format('drop policy if exists "%1$s read" on public.%1$s', tbl);
--     execute format('drop policy if exists "%1$s insert" on public.%1$s', tbl);
--     execute format('drop policy if exists "%1$s update" on public.%1$s', tbl);
--     execute format('drop policy if exists "%1$s delete" on public.%1$s', tbl);
--     execute format('drop policy if exists "members access %1$s" on public.%1$s', tbl);
--     execute format('drop policy if exists "owner manages %1$s" on public.%1$s', tbl);
--     execute format(
--       'create policy "members access %1$s" on public.%1$s for all '
--       'using (public.crm_is_member(workspace_id)) '
--       'with check (public.crm_is_member(workspace_id))', tbl);
--   end loop;
-- end $$;
-- drop policy if exists "automations read"   on public.automations;
-- drop policy if exists "automations insert" on public.automations;
-- drop policy if exists "automations update" on public.automations;
-- drop policy if exists "automations delete" on public.automations;
-- create policy "members manage automations" on public.automations for all
--   using (public.crm_is_member(workspace_id)) with check (public.crm_is_member(workspace_id));
-- drop policy if exists "autonomy_settings read"  on public.autonomy_settings;
-- drop policy if exists "autonomy_settings write" on public.autonomy_settings;
-- create policy autonomy_member on public.autonomy_settings for all
--   using (public.crm_is_member(workspace_id))
--   with check (public.crm_is_member(workspace_id));
