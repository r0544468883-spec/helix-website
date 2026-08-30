-- ============================================================
-- HELIX STAGE — Migration v14
-- CRM צוותי: workspaces + members + invites + תפקידים (admin/member)
-- מעבר מ-owner_id ל-workspace_id בכל טבלאות ה-CRM. RLS מבוסס-חברות (בטוח-מרקורסיה).
-- ⚠️ להריץ אחרי migration-v13. בטוח להרצה חוזרת.
-- ============================================================

-- 1) workspaces (סביבת CRM לצוות)
create table if not exists public.crm_workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'ה-CRM שלי',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- 2) חברי צוות + תפקיד
create table if not exists public.crm_members (
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index if not exists crm_members_user_idx on public.crm_members (user_id);

-- 3) הזמנות (לפי מייל — נתפסות בכניסה)
create table if not exists public.crm_invites (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  email text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  invited_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (workspace_id, email)
);
create index if not exists crm_invites_email_idx on public.crm_invites (lower(email));

-- 4) workspace_id על טבלאות ה-CRM
alter table public.crm_companies  add column if not exists workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_contacts   add column if not exists workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_deals      add column if not exists workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_activities add column if not exists workspace_id uuid references public.crm_workspaces(id) on delete cascade;
alter table public.crm_tasks      add column if not exists workspace_id uuid references public.crm_workspaces(id) on delete cascade;

-- 5) Backfill: workspace לכל owner קיים + חברות admin + עדכון workspace_id
do $$
declare o uuid; ws uuid;
begin
  for o in (
    select owner_id from public.crm_contacts where owner_id is not null
    union select owner_id from public.crm_companies where owner_id is not null
    union select owner_id from public.crm_deals where owner_id is not null
  ) loop
    select id into ws from public.crm_workspaces where created_by = o limit 1;
    if ws is null then
      insert into public.crm_workspaces (created_by) values (o) returning id into ws;
    end if;
    insert into public.crm_members (workspace_id, user_id, role) values (ws, o, 'admin') on conflict do nothing;
    update public.crm_companies  set workspace_id = ws where owner_id = o and workspace_id is null;
    update public.crm_contacts   set workspace_id = ws where owner_id = o and workspace_id is null;
    update public.crm_deals      set workspace_id = ws where owner_id = o and workspace_id is null;
    update public.crm_activities set workspace_id = ws where owner_id = o and workspace_id is null;
    update public.crm_tasks      set workspace_id = ws where owner_id = o and workspace_id is null;
  end loop;
end $$;

-- 6) RLS על טבלאות ה-CRM: גישה לחברי ה-workspace (מפנה ל-crm_members — לא רקורסיבי)
do $$
declare tbl text;
begin
  foreach tbl in array array['crm_companies','crm_contacts','crm_deals','crm_activities','crm_tasks'] loop
    execute format('drop policy if exists "owner manages %1$s" on public.%1$s', tbl);
    begin
      execute format(
        'create policy "members access %1$s" on public.%1$s for all '
        'using (exists (select 1 from public.crm_members m where m.workspace_id = %1$s.workspace_id and m.user_id = auth.uid())) '
        'with check (exists (select 1 from public.crm_members m where m.workspace_id = %1$s.workspace_id and m.user_id = auth.uid()))',
        tbl);
    exception when duplicate_object then null; end;
  end loop;
end $$;

-- 7) RLS ל-workspaces/members/invites (כתיבה נעשית בשרת עם service_role; קריאה מוגבלת)
alter table public.crm_workspaces enable row level security;
alter table public.crm_members enable row level security;
alter table public.crm_invites enable row level security;

do $$ begin
  -- קריאה: חבר קורא את ה-workspaces שלו (מפנה ל-crm_members — לא רקורסיבי)
  create policy "read own workspaces" on public.crm_workspaces for select
    using (exists (select 1 from public.crm_members m where m.workspace_id = id and m.user_id = auth.uid()));
exception when duplicate_object then null; end $$;
do $$ begin
  -- קריאה: חבר קורא את שורת החברות שלו עצמו (לא רקורסיבי)
  create policy "read own membership" on public.crm_members for select using (user_id = auth.uid());
exception when duplicate_object then null; end $$;
