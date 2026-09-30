-- ============================================================================
-- migration v23 — a workspace's connections to outside services
-- (openspec: crm-connect-google-and-make)
--
-- One row per workspace and provider (today: google). The token that renews
-- access lives in Supabase Vault, encrypted at rest; the row only points at it.
-- Nothing here is reachable by anon or authenticated: the app reads and writes
-- through the service role, after its own membership checks, and the token only
-- through the three functions below.
--
-- Requires the supabase_vault extension (on by default in Supabase projects).
-- Safe to run more than once. Run it in the Supabase SQL editor, then run it a
-- second time to confirm.
-- ============================================================================

-- ── 0) Vault first: the token is stored nowhere else ──
do $$
begin
  if not exists (select 1 from pg_extension where extname = 'supabase_vault') then
    raise exception 'Supabase Vault (supabase_vault) is not installed: enable it under Database → Extensions, then run v23 again.';
  end if;
end $$;

-- ── 1) Connections ──
create table if not exists public.crm_connections (
  id            uuid primary key default gen_random_uuid(),
  workspace_id  uuid not null references public.crm_workspaces(id) on delete cascade,
  provider      text not null check (provider in ('google')),
  account_email text not null,
  scopes        text[] not null default '{}',
  secret_id     uuid not null,                               -- vault.secrets.id: the refresh token
  status        text not null default 'active' check (status in ('active', 'lapsed')),
  last_error    text,                                         -- why it lapsed, never a token
  connected_by  uuid references public.profiles(id) on delete set null,
  connected_at  timestamptz not null default now(),
  unique (workspace_id, provider)
);
alter table public.crm_connections enable row level security;
revoke all on table public.crm_connections from anon, authenticated;

-- ── 2) The token, only through these, only for the service role ──
-- Save: store or rotate the secret, then create or update the row.
create or replace function public.crm_connection_save(
  p_workspace uuid, p_provider text, p_email text, p_scopes text[], p_token text, p_user uuid
) returns uuid language plpgsql volatile security definer set search_path = '' as $$
declare
  v_name   text := 'crm-connection:' || p_workspace::text || ':' || p_provider;
  v_secret uuid;
  v_id     uuid;
begin
  if p_token is null or length(p_token) = 0 then
    raise exception 'crm_connection_save: an empty token';
  end if;
  select c.secret_id into v_secret
    from public.crm_connections c where c.workspace_id = p_workspace and c.provider = p_provider;
  -- A secret left behind by an interrupted delete is reused, not duplicated (names are unique).
  if v_secret is null then
    select s.id into v_secret from vault.secrets s where s.name = v_name;
  end if;
  if v_secret is null then
    v_secret := vault.create_secret(p_token, v_name, 'HELIX CRM connection token');
  else
    perform vault.update_secret(v_secret, p_token, v_name, 'HELIX CRM connection token');
  end if;
  insert into public.crm_connections as c
    (workspace_id, provider, account_email, scopes, secret_id, status, last_error, connected_by, connected_at)
  values
    (p_workspace, p_provider, p_email, coalesce(p_scopes, '{}'), v_secret, 'active', null, p_user, now())
  on conflict (workspace_id, provider) do update
    set account_email = excluded.account_email, scopes = excluded.scopes, secret_id = excluded.secret_id,
        status = 'active', last_error = null, connected_by = excluded.connected_by, connected_at = now()
  returning c.id into v_id;
  return v_id;
end $$;

-- Read: the decrypted token for one workspace's connection, or null.
create or replace function public.crm_connection_token(p_workspace uuid, p_provider text)
returns text language sql stable security definer set search_path = '' as $$
  select d.decrypted_secret
    from public.crm_connections c
    join vault.decrypted_secrets d on d.id = c.secret_id
   where c.workspace_id = p_workspace and c.provider = p_provider
   limit 1;
$$;

-- Delete: the row and its secret together.
create or replace function public.crm_connection_delete(p_workspace uuid, p_provider text)
returns void language plpgsql volatile security definer set search_path = '' as $$
declare
  v_secret uuid;
begin
  delete from public.crm_connections c
   where c.workspace_id = p_workspace and c.provider = p_provider
  returning c.secret_id into v_secret;
  if v_secret is not null then
    delete from vault.secrets s where s.id = v_secret;
  end if;
end $$;

revoke execute on function public.crm_connection_save(uuid, text, text, text[], text, uuid) from public, anon, authenticated;
revoke execute on function public.crm_connection_token(uuid, text) from public, anon, authenticated;
revoke execute on function public.crm_connection_delete(uuid, text) from public, anon, authenticated;
grant execute on function public.crm_connection_save(uuid, text, text, text[], text, uuid) to service_role;
grant execute on function public.crm_connection_token(uuid, text) to service_role;
grant execute on function public.crm_connection_delete(uuid, text) to service_role;

-- ── Self-check: the table locked to the service role, the three functions its only door ──
do $$
declare
  f text;
begin
  if to_regclass('public.crm_connections') is null then
    raise exception 'crm_connections is missing';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.crm_connections'::regclass) then
    raise exception 'crm_connections must have row level security on';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'crm_connections') then
    raise exception 'crm_connections must have no policy: only the service role touches it';
  end if;
  if has_table_privilege('anon', 'public.crm_connections', 'select')
     or has_table_privilege('authenticated', 'public.crm_connections', 'select') then
    raise exception 'anon and authenticated must hold no privilege on crm_connections';
  end if;
  foreach f in array array[
    'public.crm_connection_save(uuid, text, text, text[], text, uuid)',
    'public.crm_connection_token(uuid, text)',
    'public.crm_connection_delete(uuid, text)'
  ] loop
    if to_regprocedure(f) is null then
      raise exception '% is missing', f;
    end if;
    if has_function_privilege('anon', f, 'execute') or has_function_privilege('authenticated', f, 'execute') then
      raise exception '% must not be executable by anon or authenticated', f;
    end if;
    if not has_function_privilege('service_role', f, 'execute') then
      raise exception 'service_role must be able to execute %', f;
    end if;
  end loop;
end $$;
