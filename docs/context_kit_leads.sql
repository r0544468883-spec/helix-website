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
