-- ============================================================
-- HELIX STAGE — Migration v10
-- מנוע ולידציה: סקר PMF (Sean Ellis "40% test") לכל מוצר
-- בטוח להרצה חוזרת. הרצה: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

create table if not exists public.pmf_responses (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sentiment text not null check (sentiment in ('very', 'somewhat', 'not')),
  benefit text,
  audience text,
  session_hash text,
  created_at timestamptz not null default now()
);
create index if not exists pmf_responses_idx on public.pmf_responses (product_id, created_at desc);

alter table public.pmf_responses enable row level security;

do $$ begin
  create policy "anyone inserts pmf" on public.pmf_responses for insert with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "owners read own pmf" on public.pmf_responses for select using (
    exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())
  );
exception when duplicate_object then null; end $$;
