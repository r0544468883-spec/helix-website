-- ===========================================================================
-- HELIX site → SHARED PLUG Supabase (llrzeexnzgknpwcxdxpm).
-- Run ONCE in PLUG's Supabase → SQL Editor → New query → paste → Run.
--
-- SAFE for PLUG: every statement is IF NOT EXISTS and touches only NEW helix
-- tables. It does NOT run the project-wide `alter default privileges` line from
-- the original migration, so PLUG's own tables and future tables are untouched.
-- Nothing here drops or overwrites data.
-- ===========================================================================

-- ── content_leads: the guide/landing + community email list ────────────────
create table if not exists public.content_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text default 'content',
  name text,
  details jsonb,
  created_at timestamptz default now()
);
create index if not exists content_leads_email_idx on public.content_leads (email);
create index if not exists content_leads_created_at_idx on public.content_leads (created_at desc);
alter table public.content_leads enable row level security;
revoke all on public.content_leads from anon, authenticated, public;

-- ── content_tool_usage: free-tool metering ─────────────────────────────────
create table if not exists public.content_tool_usage (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  mode text not null,
  created_at timestamptz default now()
);
create index if not exists content_tool_usage_email_idx on public.content_tool_usage (email);
alter table public.content_tool_usage enable row level security;
revoke all on public.content_tool_usage from anon, authenticated, public;

-- ── geo_scans: /ai-checker scans + leads ───────────────────────────────────
create table if not exists public.geo_scans (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  host text,
  ladder int,
  issues int,
  business_name text,
  has_lead boolean default false,
  name text,
  email text,
  phone text,
  source text,
  created_at timestamptz not null default now()
);
create index if not exists geo_scans_created_idx on public.geo_scans (created_at desc);
create index if not exists geo_scans_host_idx on public.geo_scans (host);
alter table public.geo_scans enable row level security;
revoke all on public.geo_scans from anon, authenticated, public;

-- ── context_kit_leads: browser-side insert (needs anon INSERT only) ─────────
create table if not exists public.context_kit_leads (
  id uuid primary key default gen_random_uuid(),
  website text, occupation text, org_name text, what_you_do text, audience text,
  offerings text, tone text, terms text, redlines text, ai_uses text,
  ai_policy text, ai_training text, readiness_score int,
  name text, phone text, email text, source text,
  created_at timestamptz not null default now()
);
create index if not exists context_kit_leads_created_idx on public.context_kit_leads (created_at desc);
alter table public.context_kit_leads enable row level security;
drop policy if exists "anon insert context leads" on public.context_kit_leads;
create policy "anon insert context leads"
  on public.context_kit_leads for insert to anon with check (true);
grant insert on public.context_kit_leads to anon;
revoke select, update, delete on public.context_kit_leads from anon, authenticated, public;

-- ── helix_referrers / helix_referrals: share-to-earn loop ──────────────────
create table if not exists public.helix_referrers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  ref_code text not null unique,
  points int not null default 0,
  referrals_confirmed int not null default 0,
  coupon_code text,
  coupon_issued_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists helix_referrers_ref_code_idx on public.helix_referrers (ref_code);
create table if not exists public.helix_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_code text not null,
  referred_email text,
  channel text default 'direct',
  status text not null default 'clicked',
  created_at timestamptz default now(),
  confirmed_at timestamptz
);
create index if not exists helix_referrals_code_idx on public.helix_referrals (referrer_code);
create unique index if not exists helix_referrals_unique_signup
  on public.helix_referrals (referrer_code, referred_email)
  where status = 'signed_up' and referred_email is not null;
alter table public.helix_referrers enable row level security;
alter table public.helix_referrals enable row level security;
revoke all on public.helix_referrers from anon, authenticated, public;
revoke all on public.helix_referrals from anon, authenticated, public;

-- ── VERIFY: content_leads must show rls_enabled = true ─────────────────────
select relname as table_name, relrowsecurity as rls_enabled
  from pg_class
 where relnamespace = 'public'::regnamespace
   and relname in ('content_leads','content_tool_usage','geo_scans',
                   'context_kit_leads','helix_referrers','helix_referrals')
 order by relname;
