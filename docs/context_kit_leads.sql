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
