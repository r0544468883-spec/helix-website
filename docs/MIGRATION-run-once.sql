-- ===========================================================================
-- HELIX — Supabase migration. Run ONCE, top to bottom, in the SQL Editor.
--   Supabase → SQL Editor → New query → paste all of this → Run
--
-- Creates the six tables the site needs and locks them down in the same pass.
-- Safe to re-run: every CREATE uses IF NOT EXISTS and the constraint is added
-- conditionally. Nothing here drops or overwrites existing data.
--
-- After it finishes, the last two SELECTs print a verification report.
-- GATE: do not publish NEXT_PUBLIC_SUPABASE_ANON_KEY until they look right.
-- ===========================================================================


-- ─────────────────────────────────────────────────────────────
-- geo_scans.sql
-- ─────────────────────────────────────────────────────────────

-- Run once in Supabase → SQL Editor. Creates the table that stores every
-- /ai-checker scan and lead. Then set SUPABASE_URL + SUPABASE_SERVICE_KEY in Vercel.

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

-- RLS is REQUIRED. This table holds lead PII (name/email/phone) and Supabase's
-- default grants give `anon` full CRUD on public tables — and the site ships a
-- public anon key for the /free-tools/ai-context insert. service_role holds
-- BYPASSRLS, so the server writer in lib/supabase-scans.ts is unaffected.
-- See docs/rls_lockdown.sql for the full lockdown across all four tables.
alter table public.geo_scans enable row level security;
revoke all on public.geo_scans from anon, authenticated, public;



-- ─────────────────────────────────────────────────────────────
-- content_leads.sql
-- ─────────────────────────────────────────────────────────────

-- Leads captured by the free content tool's email gate (/free-tools/content).
-- Run once in the Supabase SQL editor. Mirrors docs/geo_scans.sql.

create table if not exists public.content_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text default 'content',
  created_at timestamptz default now()
);

create index if not exists content_leads_email_idx on public.content_leads (email);
create index if not exists content_leads_created_at_idx on public.content_leads (created_at desc);

-- RLS is REQUIRED — this is the email list. Supabase's default grants give
-- `anon` full CRUD on public tables, and the site ships a public anon key.
-- service_role bypasses RLS, so lib/content-leads.ts is unaffected.
-- See docs/rls_lockdown.sql.
alter table public.content_leads enable row level security;
revoke all on public.content_leads from anon, authenticated, public;



-- ─────────────────────────────────────────────────────────────
-- content_tool_usage.sql
-- ─────────────────────────────────────────────────────────────

-- Free-usage metering for the content tool (/free-tools/content).
-- One row per billable use (build post / write-or-rewrite email). Analysis is free
-- and not recorded. After FREE_LIMIT (4) uses per email → upgrade to HELIX OPS.
-- Run once in the Supabase SQL editor.

create table if not exists public.content_tool_usage (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  mode text not null,            -- 'build' | 'email' | 'analyze'
  created_at timestamptz default now()
);

create index if not exists content_tool_usage_email_idx on public.content_tool_usage (email);

-- RLS is REQUIRED. Without it the public anon key can DELETE from this table,
-- which resets the FREE_LIMIT meter and makes the paid Claude modes free.
-- service_role bypasses RLS, so lib/content-usage.ts is unaffected.
-- See docs/rls_lockdown.sql.
alter table public.content_tool_usage enable row level security;
revoke all on public.content_tool_usage from anon, authenticated, public;



-- ─────────────────────────────────────────────────────────────
-- context_kit_leads.sql
-- ─────────────────────────────────────────────────────────────

-- Run once in Supabase → SQL Editor. Stores leads from the "מאפס ל-AI"
-- org-context questionnaire (/free-tools/ai-context).
--
-- The live site is a STATIC export, so the questionnaire inserts from the
-- BROWSER using the public anon key. That means RLS is required and must
-- allow anon INSERT (but NOT select — keep the leads private).
--
-- After running this, set in Vercel/Firebase env:
--   NEXT_PUBLIC_SUPABASE_URL       = https://<project>.supabase.co
--   NEXT_PUBLIC_SUPABASE_ANON_KEY  = <the anon/public key>

create table if not exists public.context_kit_leads (
  id uuid primary key default gen_random_uuid(),
  website      text,
  occupation   text,
  org_name     text,
  what_you_do  text,
  audience     text,
  offerings    text,
  tone         text,
  terms        text,
  redlines     text,
  ai_uses      text,
  ai_policy    text,
  ai_training  text,
  readiness_score int,
  name         text,
  phone        text,
  email        text,
  source       text,
  created_at   timestamptz not null default now()
);

create index if not exists context_kit_leads_created_idx
  on public.context_kit_leads (created_at desc);

-- RLS: allow anonymous INSERT only. No SELECT/UPDATE/DELETE for anon, so the
-- browser can drop a lead but never read anyone else's.
alter table public.context_kit_leads enable row level security;

drop policy if exists "anon insert context leads" on public.context_kit_leads;
create policy "anon insert context leads"
  on public.context_kit_leads
  for insert
  to anon
  with check (true);

-- A policy alone is not enough: PostgREST still needs the GRANT, and every other
-- privilege must be revoked or the anon key becomes a read credential.
grant insert on public.context_kit_leads to anon;
revoke select, update, delete on public.context_kit_leads from anon, authenticated, public;

-- Bound the payload — this insert arrives straight from a browser, with no
-- server, no CAPTCHA and no rate limit in the path.
alter table public.context_kit_leads
  drop constraint if exists context_kit_leads_len;
alter table public.context_kit_leads
  add constraint context_kit_leads_len check (
    length(coalesce(what_you_do,'')) <= 2000 and
    length(coalesce(offerings,''))   <= 2000 and
    length(coalesce(redlines,''))    <= 2000 and
    length(coalesce(tone,''))        <= 2000 and
    length(coalesce(audience,''))    <= 500  and
    length(coalesce(org_name,''))    <= 200  and
    length(coalesce(website,''))     <= 500  and
    length(coalesce(name,''))        <= 200  and
    length(coalesce(email,''))       <= 320  and
    length(coalesce(phone,''))       <= 40
  );



-- ─────────────────────────────────────────────────────────────
-- helix_referrals.sql
-- ─────────────────────────────────────────────────────────────

-- HELIX self-growth share-to-earn loop (marketing site, Track A).
-- Email-keyed referral loop: a visitor gets a ref_code + share link, earns points
-- when the people they refer sign up, and once they cross a threshold the loop
-- auto-issues them a unique discount coupon for a paid HELIX product.
-- Run once in the Supabase SQL editor. Mirrors docs/content_leads.sql conventions.

-- Referrers: one row per person sharing HELIX, keyed by email.
create table if not exists public.helix_referrers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  ref_code text not null unique,
  points int not null default 0,                 -- points ledger balance
  referrals_confirmed int not null default 0,    -- how many referred people signed up
  coupon_code text,                              -- auto-issued once threshold crossed
  coupon_issued_at timestamptz,
  created_at timestamptz default now()
);

create index if not exists helix_referrers_ref_code_idx on public.helix_referrers (ref_code);

-- Individual referral events (click → signup), attributed to a referrer's code.
create table if not exists public.helix_referrals (
  id uuid primary key default gen_random_uuid(),
  referrer_code text not null,
  referred_email text,
  channel text default 'direct',                 -- direct | whatsapp | linkedin | qr | ...
  status text not null default 'clicked',        -- clicked | signed_up
  created_at timestamptz default now(),
  confirmed_at timestamptz
);

create index if not exists helix_referrals_code_idx on public.helix_referrals (referrer_code);
-- One confirmed signup per (referrer, referred email): prevents double-counting.
create unique index if not exists helix_referrals_unique_signup
  on public.helix_referrals (referrer_code, referred_email)
  where status = 'signed_up' and referred_email is not null;

-- RLS is REQUIRED — this holds emails. Supabase's default grants give `anon`
-- full CRUD on public tables and the site ships a public anon key. service_role
-- bypasses RLS, so lib/referrals.ts (service key) is unaffected. See docs/rls_lockdown.sql.
alter table public.helix_referrers enable row level security;
alter table public.helix_referrals enable row level security;
revoke all on public.helix_referrers from anon, authenticated, public;
revoke all on public.helix_referrals from anon, authenticated, public;



-- ─────────────────────────────────────────────────────────────
-- Root cause: stop NEW tables in this project inheriting anon grants.
-- ─────────────────────────────────────────────────────────────
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- ═════════════════════════════════════════════════════════════
-- VERIFY 1 — every row must show relrowsecurity = true.
-- ═════════════════════════════════════════════════════════════
select relname as table_name, relrowsecurity as rls_enabled
  from pg_class
 where relnamespace = 'public'::regnamespace
   and relname in ('geo_scans','content_leads','content_tool_usage',
                   'context_kit_leads','helix_referrers','helix_referrals')
 order by relname;

-- ═════════════════════════════════════════════════════════════
-- VERIFY 2 — the ONLY row here must be context_kit_leads / anon / INSERT.
-- Anything else means the anon key would be a read credential. Do not
-- publish it until this returns exactly that one row.
-- ═════════════════════════════════════════════════════════════
select table_name, grantee, privilege_type
  from information_schema.role_table_grants
 where table_schema = 'public'
   and grantee in ('anon','authenticated','PUBLIC')
   and table_name in ('geo_scans','content_leads','content_tool_usage',
                      'context_kit_leads','helix_referrers','helix_referrals')
 order by table_name, grantee, privilege_type;
