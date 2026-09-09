-- ============================================================
-- HELIX STAGE — Migration v13
-- HELIX CRM (Phase 1) — פורט מותאם מ-PLUG clients, לעסקים/סטארטאפים
-- אובייקטים בסגנון HubSpot: companies, contacts, deals, activities, tasks
-- הרשמה דרך STAGE · owner_id = משתמש STAGE · RLS per-owner · lead scoring
-- בטוח להרצה חוזרת. הרצה: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

-- 1) חברות (accounts)
create table if not exists public.crm_companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  industry text,
  size text,
  website text,
  notes text,
  lifecycle_stage text not null default 'lead',
  created_at timestamptz not null default now()
);
create index if not exists crm_companies_owner_idx on public.crm_companies (owner_id, created_at desc);

-- 2) אנשי קשר / לידים
create table if not exists public.crm_contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.crm_companies(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  role_title text,
  linkedin_url text,
  source text,                                   -- waitlist / manual / import / sdr / api
  is_business boolean not null default false,
  lifecycle_stage text not null default 'lead',  -- lead|mql|sql|opportunity|customer
  lead_status text not null default 'new',        -- new|contacted|qualified|unqualified
  score integer not null default 0,               -- תעדוף לידים 0..100 (מחושב)
  notes text,
  last_activity_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists crm_contacts_owner_idx on public.crm_contacts (owner_id, score desc, created_at desc);

-- 3) עסקאות (deals) — pipeline
create table if not exists public.crm_deals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  contact_id uuid references public.crm_contacts(id) on delete set null,
  company_id uuid references public.crm_companies(id) on delete set null,
  title text not null,
  value numeric default 0,
  currency text not null default 'ILS',
  stage text not null default 'lead',   -- lead|qualified|meeting|proposal|negotiation|won|lost
  status text not null default 'open',  -- open|won|lost
  close_date date,
  created_at timestamptz not null default now()
);
create index if not exists crm_deals_owner_idx on public.crm_deals (owner_id, created_at desc);

-- 4) יומן פעילות
create table if not exists public.crm_activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  contact_id uuid references public.crm_contacts(id) on delete cascade,
  deal_id uuid references public.crm_deals(id) on delete cascade,
  type text not null default 'note',    -- note|email|call|meeting
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists crm_activities_contact_idx on public.crm_activities (contact_id, created_at desc);

-- 5) משימות
create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  contact_id uuid references public.crm_contacts(id) on delete cascade,
  deal_id uuid references public.crm_deals(id) on delete cascade,
  title text not null,
  due_date date,
  priority text not null default 'medium',  -- low|medium|high
  status text not null default 'open',       -- open|done
  created_at timestamptz not null default now()
);
create index if not exists crm_tasks_owner_idx on public.crm_tasks (owner_id, status, due_date);

-- ---------- RLS: בעל ה-workspace בלבד ----------
do $$
declare tbl text;
begin
  foreach tbl in array array['crm_companies','crm_contacts','crm_deals','crm_activities','crm_tasks'] loop
    execute format('alter table public.%I enable row level security', tbl);
    begin
      execute format('create policy "owner manages %1$s" on public.%1$s for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id)', tbl);
    exception when duplicate_object then null; end;
  end loop;
end $$;
