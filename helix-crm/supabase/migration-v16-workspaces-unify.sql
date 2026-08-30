-- ============================================================
-- HELIX CRM — Migration v16 — Agency → Client hierarchy (white-label)
-- The CRM ALREADY runs on workspaces (crm_workspaces + crm_members, added in v14).
-- This migration adds the AGENCY layer ON TOP of that existing model — it does NOT
-- create a new workspaces table. A parent workspace (the AGENCY) owns child
-- workspaces (its CLIENTS); agency admins inherit access to every client.
-- Run once in the Supabase SQL editor, AFTER v15. Safe to re-run.
-- ============================================================

-- ── 1) Agency columns on the existing crm_workspaces ──
alter table public.crm_workspaces add column if not exists parent_workspace_id uuid references public.crm_workspaces(id) on delete set null;
alter table public.crm_workspaces add column if not exists branding     jsonb default '{}'::jsonb;
alter table public.crm_workspaces add column if not exists report_token text;
alter table public.crm_workspaces add column if not exists plan         text not null default 'solo';
create index if not exists crm_workspaces_parent_idx on public.crm_workspaces(parent_workspace_id);
create unique index if not exists crm_workspaces_report_token_idx on public.crm_workspaces(report_token) where report_token is not null;

-- ── 2) New role: agency_admin (widen the existing crm_members check) ──
alter table public.crm_members drop constraint if exists crm_members_role_check;
alter table public.crm_members add constraint crm_members_role_check
  check (role in ('admin','member','agency_admin'));

-- ── 3) Membership helpers (security definer → no RLS recursion) ──
--    crm_is_agency_admin: caller is admin/agency_admin of THIS workspace's parent.
create or replace function public.crm_is_agency_admin(ws uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.crm_workspaces w
    join public.crm_members m on m.workspace_id = w.parent_workspace_id
    where w.id = ws and m.user_id = auth.uid() and m.role in ('admin','agency_admin')
  );
$$;

--    crm_is_member: direct member OR agency admin of the parent.
create or replace function public.crm_is_member(ws uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.crm_members m where m.workspace_id = ws and m.user_id = auth.uid()
  ) or public.crm_is_agency_admin(ws);
$$;

-- ── 4) Re-point CRM table RLS at crm_is_member (was an inline crm_members lookup).
--    One function now carries agency inheritance to every CRM table at once. ──
do $$
declare tbl text;
begin
  foreach tbl in array array['crm_companies','crm_contacts','crm_deals','crm_activities','crm_tasks'] loop
    execute format('drop policy if exists "members access %1$s" on public.%1$s', tbl);
    execute format('drop policy if exists "owner manages %1$s" on public.%1$s', tbl);
    execute format(
      'create policy "members access %1$s" on public.%1$s for all '
      'using (public.crm_is_member(workspace_id)) '
      'with check (public.crm_is_member(workspace_id))', tbl);
  end loop;
end $$;

-- ── 5) Create a client workspace under an agency (atomic, authorized) ──
create or replace function public.crm_create_client_workspace(agency_id uuid, ws_name text)
returns uuid language plpgsql security definer as $$
declare new_id uuid;
begin
  if not exists (
    select 1 from public.crm_members m
    where m.workspace_id = agency_id and m.user_id = auth.uid() and m.role in ('admin','agency_admin')
  ) then raise exception 'not an agency admin of %', agency_id; end if;
  insert into public.crm_workspaces (name, created_by, parent_workspace_id)
    values (ws_name, auth.uid(), agency_id) returning id into new_id;
  insert into public.crm_members (workspace_id, user_id, role) values (new_id, auth.uid(), 'agency_admin');
  return new_id;
end; $$;

-- ── 6) Effective branding: a client inherits the agency's brand unless it set its own ──
create or replace function public.resolve_branding(ws uuid)
returns jsonb language sql security definer stable as $$
  select coalesce(nullif(child.branding, '{}'::jsonb), parent.branding, '{}'::jsonb)
  from public.crm_workspaces child
  left join public.crm_workspaces parent on parent.id = child.parent_workspace_id
  where child.id = ws;
$$;

-- ── 7) Let agency admins read their client workspaces + memberships ──
do $$ begin
  drop policy if exists "read own workspaces" on public.crm_workspaces;
  create policy "read own workspaces" on public.crm_workspaces for select
    using (public.crm_is_member(id));
exception when others then null; end $$;
