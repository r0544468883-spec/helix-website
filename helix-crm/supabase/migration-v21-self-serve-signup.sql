-- ============================================================================
-- v21 — self-serve signup (Ron, 2026-11-26): every community member can use the
-- CRM, so signup is open again. Reverses v18's invite-only gate in
-- handle_new_user: the trigger now only creates the profiles row; it no longer
-- rejects emails that aren't in crm_invites / auth_allowlist. The workspace is
-- provisioned on first dashboard visit (lib/crm-workspace.ts step 4) — a fresh,
-- empty, isolated tenant. Invites still work and still attach the invited email
-- to the inviting workspace (getWorkspace claims them before creating a new one).
-- RUN IN THE *CRM* SUPABASE DASHBOARD (project rymrafskckljgirrejqu) SQL editor.
-- Idempotent.
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  addr text := lower(coalesce(new.email, ''));
begin
  if addr = '' then
    raise exception 'HELIX CRM: an email address is required';
  end if;

  insert into public.profiles (id, email, name, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_-]', '', 'g')) || '-' || substr(md5(random()::text), 1, 4),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
