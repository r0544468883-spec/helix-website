-- ============================================================================
-- migration v22 — invites and sign-in links sent by the CRM (openspec: crm-team-invites)
--
-- The CRM now makes each one-time link with Supabase's admin API and sends the
-- email through Resend itself (lib/crm-access-link.ts), instead of Supabase's
-- mailer. This adds what that needs:
--   1) crm_invites remembers the invite's language, what happened to its last
--      email, and Resend's delivery state for it;
--   2) crm_auth_link_sends logs every send, for the per-address and per-IP limits;
--   3) crm_account_state(email) says whether an address has no account, an
--      account never used (an old Supabase invite), or an active one, so the link
--      type is chosen from the database rather than from Supabase's error text.
--
-- Additive only. Safe to run more than once.
-- Run it in the Supabase SQL editor, then run it a second time to confirm.
-- ============================================================================

-- ── 1) Invites remember what happened to their email ──
alter table public.crm_invites add column if not exists locale text not null default 'he';
alter table public.crm_invites drop constraint if exists crm_invites_locale_check;
alter table public.crm_invites add constraint crm_invites_locale_check check (locale in ('he', 'en'));
alter table public.crm_invites add column if not exists last_attempt_at     timestamptz;
alter table public.crm_invites add column if not exists last_sent_at        timestamptz;
alter table public.crm_invites add column if not exists send_count          int not null default 0;
alter table public.crm_invites add column if not exists last_error          text;         -- null when the last attempt was sent
alter table public.crm_invites add column if not exists email_id            text;         -- Resend's id for the last email sent
alter table public.crm_invites add column if not exists delivery            text;         -- Resend's last_event for that email
alter table public.crm_invites add column if not exists delivery_checked_at timestamptz;

-- ── 2) Every auth email the CRM sends, for its limits ──
--    Only the service role reads or writes it: RLS on, no policy, no grants.
create table if not exists public.crm_auth_link_sends (
  id            bigint generated always as identity primary key,
  email         text not null,                                -- lowercased
  kind          text not null check (kind in ('invite', 'sign_in')),
  ip            text,                                         -- the sign-in form's caller; null for invites
  workspace_id  uuid references public.crm_workspaces(id) on delete cascade,
  created_at    timestamptz not null default now()
);
create index if not exists crm_auth_link_sends_email_idx on public.crm_auth_link_sends (email, created_at desc);
create index if not exists crm_auth_link_sends_ip_idx    on public.crm_auth_link_sends (ip, created_at desc) where ip is not null;
alter table public.crm_auth_link_sends enable row level security;
revoke all on table public.crm_auth_link_sends from anon, authenticated;

-- ── 3) An address's account: 'none', 'invited' (exists, never confirmed) or 'active' ──
create or replace function public.crm_account_state(p_email text)
returns text language sql stable security definer
set search_path = '' as $$
  select coalesce(
    (select case when u.email_confirmed_at is null then 'invited' else 'active' end
       from auth.users u
      where lower(u.email) = lower(btrim(p_email))
      order by u.email_confirmed_at desc nulls last
      limit 1),
    'none');
$$;
revoke execute on function public.crm_account_state(text) from public, anon, authenticated;
grant execute on function public.crm_account_state(text) to service_role;

-- ── Self-check: the columns, the table locked to the service role, the function ──
do $$
begin
  if (select count(*) from information_schema.columns
       where table_schema = 'public' and table_name = 'crm_invites'
         and column_name in ('locale', 'last_attempt_at', 'last_sent_at', 'send_count',
                             'last_error', 'email_id', 'delivery', 'delivery_checked_at')) <> 8 then
    raise exception 'crm_invites is missing some of the v22 columns';
  end if;
  if to_regclass('public.crm_auth_link_sends') is null then
    raise exception 'crm_auth_link_sends is missing';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.crm_auth_link_sends'::regclass) then
    raise exception 'crm_auth_link_sends must have row level security on';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'crm_auth_link_sends') then
    raise exception 'crm_auth_link_sends must have no policy: only the service role touches it';
  end if;
  if has_table_privilege('anon', 'public.crm_auth_link_sends', 'select')
     or has_table_privilege('authenticated', 'public.crm_auth_link_sends', 'select') then
    raise exception 'anon and authenticated must hold no privilege on crm_auth_link_sends';
  end if;
  if to_regprocedure('public.crm_account_state(text)') is null then
    raise exception 'crm_account_state(text) is missing';
  end if;
  if has_function_privilege('anon', 'public.crm_account_state(text)', 'execute')
     or has_function_privilege('authenticated', 'public.crm_account_state(text)', 'execute') then
    raise exception 'crm_account_state must not be executable by anon or authenticated';
  end if;
  if not has_function_privilege('service_role', 'public.crm_account_state(text)', 'execute') then
    raise exception 'service_role must be able to execute crm_account_state';
  end if;
end $$;
