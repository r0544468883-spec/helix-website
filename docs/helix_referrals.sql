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
