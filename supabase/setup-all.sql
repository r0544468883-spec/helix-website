-- ============================================================
-- HELIX STAGE — הקמה מלאה (בסיס + כל התוספות) בבלוק אחד
-- בטוח להרצה חוזרת. הדבק הכל ב-Supabase → SQL Editor → Run
-- ============================================================

-- ---------- טבלאות ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  username text unique not null,
  avatar_url text,
  role_title text,
  company text,
  linkedin_url text,
  is_verified boolean not null default false,
  user_type text not null default 'consumer' check (user_type in ('consumer', 'maker')),
  onboarding_completed boolean not null default false,
  interests integer[] not null default '{}',
  bio text,
  website_url text,
  is_admin boolean not null default false,
  subscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text unique not null,
  tagline text not null,
  description text,
  logo_url text,
  website_url text,
  video_url text,
  screenshots text[] not null default '{}',
  alternative_to text[] not null default '{}',
  beta_enabled boolean not null default false,
  beta_whatsapp_url text,
  beta_note text,
  landing_enabled boolean not null default false,
  landing_headline text,
  landing_subheadline text,
  landing_cta text,
  status text not null default 'live' check (status in ('pre_launch', 'beta', 'live')),
  created_at timestamptz not null default now()
);

create table if not exists public.launches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  launch_date date not null,
  featured boolean not null default false,
  votes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists launches_date_idx on public.launches (launch_date desc, votes_count desc);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  launch_id uuid not null references public.launches(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, launch_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  launch_id uuid not null references public.launches(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id serial primary key,
  slug text unique not null,
  name_he text not null,
  name_en text not null
);

create table if not exists public.product_categories (
  product_id uuid not null references public.products(id) on delete cascade,
  category_id integer not null references public.categories(id) on delete cascade,
  primary key (product_id, category_id)
);

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  email text not null,
  user_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (product_id, email)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  locale text not null default 'he',
  name text,
  unsubscribed_at timestamptz,
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table if not exists public.email_templates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  subject text not null,
  body_html text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.email_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  subject text not null,
  body_html text not null,
  from_name text,
  from_email text,
  segment text not null default 'all',
  product_id uuid references public.products(id) on delete set null,
  locale_filter text,
  status text not null default 'draft',
  tag_filter text,
  scheduled_at timestamptz,
  sent_at timestamptz,
  recipients integer not null default 0,
  opens integer not null default 0,
  clicks integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists email_campaigns_owner_idx on public.email_campaigns (owner_id, created_at desc);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  name text,
  tags text[] not null default '{}',
  source text,
  unsubscribed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (owner_id, email)
);
create index if not exists contacts_owner_idx on public.contacts (owner_id, created_at desc);

create table if not exists public.email_sends (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.email_campaigns(id) on delete cascade,
  email text not null,
  token uuid not null default gen_random_uuid(),
  opened_at timestamptz,
  clicked_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists email_sends_campaign_idx on public.email_sends (campaign_id);
create index if not exists email_sends_token_idx on public.email_sends (token);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  pros text,
  cons text,
  body text,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists reviews_product_idx on public.reviews (product_id, created_at desc);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  type text not null default 'build_in_public' check (type in ('build_in_public', 'show_il')),
  body text not null,
  topic text,
  votes_count integer not null default 0,
  comments_count integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists posts_created_idx on public.posts (created_at desc);

create table if not exists public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists post_comments_post_idx on public.post_comments (post_id, created_at);

create table if not exists public.post_votes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists public.product_views (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  event text not null default 'view',
  source text,
  surface text,
  session_hash text,
  created_at timestamptz not null default now()
);
create index if not exists product_views_idx on public.product_views (product_id, created_at desc);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('hiring', 'open_to_work', 'collab')),
  product_id uuid references public.products(id) on delete set null,
  role_title text,
  body text not null,
  contact_email text,
  created_at timestamptz not null default now()
);
create index if not exists listings_created_idx on public.listings (created_at desc);

-- ---------- טריגר: יצירת פרופיל אוטומטית בהרשמה ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, username, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    lower(regexp_replace(split_part(new.email, '@', 1), '[^a-zA-Z0-9_-]', '', 'g')) || '-' || substr(md5(random()::text), 1, 4),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- טריגרים: ספירת הצבעות ותגובות ----------
create or replace function public.bump_votes_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.launches set votes_count = votes_count + 1 where id = new.launch_id;
    return new;
  else
    update public.launches set votes_count = greatest(votes_count - 1, 0) where id = old.launch_id;
    return old;
  end if;
end;
$$;

drop trigger if exists on_vote_change on public.votes;
create trigger on_vote_change
  after insert or delete on public.votes
  for each row execute function public.bump_votes_count();

create or replace function public.bump_comments_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    update public.launches set comments_count = comments_count + 1 where id = new.launch_id;
    return new;
  else
    update public.launches set comments_count = greatest(comments_count - 1, 0) where id = old.launch_id;
    return old;
  end if;
end;
$$;

drop trigger if exists on_comment_change on public.comments;
create trigger on_comment_change
  after insert or delete on public.comments
  for each row execute function public.bump_comments_count();

-- ---------- Row Level Security ----------
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.launches enable row level security;
alter table public.votes enable row level security;
alter table public.comments enable row level security;
alter table public.categories enable row level security;
alter table public.product_categories enable row level security;
alter table public.waitlist_signups enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.reviews enable row level security;
alter table public.posts enable row level security;
alter table public.post_comments enable row level security;
alter table public.post_votes enable row level security;
alter table public.product_views enable row level security;
alter table public.listings enable row level security;
alter table public.email_templates enable row level security;
alter table public.email_campaigns enable row level security;
alter table public.email_sends enable row level security;
alter table public.contacts enable row level security;

-- profiles
drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public" on public.profiles for select using (true);
drop policy if exists "users update own profile" on public.profiles;
create policy "users update own profile" on public.profiles for update using (auth.uid() = id);

-- products
drop policy if exists "products are public" on public.products;
create policy "products are public" on public.products for select using (true);
drop policy if exists "owners insert products" on public.products;
create policy "owners insert products" on public.products for insert with check (auth.uid() = owner_id);
drop policy if exists "owners update products" on public.products;
create policy "owners update products" on public.products for update using (auth.uid() = owner_id);
drop policy if exists "owners delete products" on public.products;
create policy "owners delete products" on public.products for delete using (auth.uid() = owner_id);

-- launches
drop policy if exists "launches are public" on public.launches;
create policy "launches are public" on public.launches for select using (true);
drop policy if exists "owners insert launches" on public.launches;
create policy "owners insert launches" on public.launches for insert with check (
  exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())
);

-- votes
drop policy if exists "votes are public" on public.votes;
create policy "votes are public" on public.votes for select using (true);
drop policy if exists "users insert own votes" on public.votes;
create policy "users insert own votes" on public.votes for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own votes" on public.votes;
create policy "users delete own votes" on public.votes for delete using (auth.uid() = user_id);

-- comments
drop policy if exists "comments are public" on public.comments;
create policy "comments are public" on public.comments for select using (true);
drop policy if exists "users insert own comments" on public.comments;
create policy "users insert own comments" on public.comments for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own comments" on public.comments;
create policy "users delete own comments" on public.comments for delete using (auth.uid() = user_id);

-- categories
drop policy if exists "categories are public" on public.categories;
create policy "categories are public" on public.categories for select using (true);

-- product_categories
drop policy if exists "product_categories are public" on public.product_categories;
create policy "product_categories are public" on public.product_categories for select using (true);
drop policy if exists "owners tag products" on public.product_categories;
create policy "owners tag products" on public.product_categories for insert with check (
  exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())
);
drop policy if exists "owners untag products" on public.product_categories;
create policy "owners untag products" on public.product_categories for delete using (
  exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())
);

-- waitlist
drop policy if exists "anyone joins waitlist" on public.waitlist_signups;
create policy "anyone joins waitlist" on public.waitlist_signups for insert with check (true);
drop policy if exists "owners read own waitlist" on public.waitlist_signups;
create policy "owners read own waitlist" on public.waitlist_signups for select using (
  exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())
);

-- newsletter
drop policy if exists "anyone subscribes" on public.newsletter_subscribers;
create policy "anyone subscribes" on public.newsletter_subscribers for insert with check (true);

-- reviews
drop policy if exists "reviews are public" on public.reviews;
create policy "reviews are public" on public.reviews for select using (true);
drop policy if exists "users insert own reviews" on public.reviews;
create policy "users insert own reviews" on public.reviews for insert with check (auth.uid() = user_id);
drop policy if exists "users update own reviews" on public.reviews;
create policy "users update own reviews" on public.reviews for update using (auth.uid() = user_id);
drop policy if exists "users delete own reviews" on public.reviews;
create policy "users delete own reviews" on public.reviews for delete using (auth.uid() = user_id);

-- posts
drop policy if exists "posts are public" on public.posts;
create policy "posts are public" on public.posts for select using (true);
drop policy if exists "users insert own posts" on public.posts;
create policy "users insert own posts" on public.posts for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own posts" on public.posts;
create policy "users delete own posts" on public.posts for delete using (auth.uid() = user_id);

-- post_comments
drop policy if exists "post_comments are public" on public.post_comments;
create policy "post_comments are public" on public.post_comments for select using (true);
drop policy if exists "users insert own post_comments" on public.post_comments;
create policy "users insert own post_comments" on public.post_comments for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own post_comments" on public.post_comments;
create policy "users delete own post_comments" on public.post_comments for delete using (auth.uid() = user_id);

-- post_votes
drop policy if exists "post_votes are public" on public.post_votes;
create policy "post_votes are public" on public.post_votes for select using (true);
drop policy if exists "users insert own post_votes" on public.post_votes;
create policy "users insert own post_votes" on public.post_votes for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own post_votes" on public.post_votes;
create policy "users delete own post_votes" on public.post_votes for delete using (auth.uid() = user_id);

-- product_views
drop policy if exists "anyone inserts views" on public.product_views;
create policy "anyone inserts views" on public.product_views for insert with check (true);
drop policy if exists "owners read own views" on public.product_views;
create policy "owners read own views" on public.product_views for select using (
  exists (select 1 from public.products p where p.id = product_id and p.owner_id = auth.uid())
);

-- listings
drop policy if exists "listings are public" on public.listings;
create policy "listings are public" on public.listings for select using (true);
drop policy if exists "users insert own listings" on public.listings;
create policy "users insert own listings" on public.listings for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own listings" on public.listings;
create policy "users delete own listings" on public.listings for delete using (auth.uid() = user_id);

-- email_templates / email_campaigns / email_sends
drop policy if exists "owners manage templates" on public.email_templates;
create policy "owners manage templates" on public.email_templates for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "owners manage campaigns" on public.email_campaigns;
create policy "owners manage campaigns" on public.email_campaigns for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
drop policy if exists "owners read sends" on public.email_sends;
create policy "owners read sends" on public.email_sends for select using (
  exists (select 1 from public.email_campaigns c where c.id = campaign_id and c.owner_id = auth.uid())
);
drop policy if exists "owners manage contacts" on public.contacts;
create policy "owners manage contacts" on public.contacts for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- ---------- טריגרים: מוני פוסטים ----------
create or replace function public.bump_post_votes()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set votes_count = votes_count + 1 where id = new.post_id;
    return new;
  else
    update public.posts set votes_count = greatest(votes_count - 1, 0) where id = old.post_id;
    return old;
  end if;
end; $$;
drop trigger if exists on_post_vote_change on public.post_votes;
create trigger on_post_vote_change
  after insert or delete on public.post_votes
  for each row execute function public.bump_post_votes();

create or replace function public.bump_post_comments()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' then
    update public.posts set comments_count = comments_count + 1 where id = new.post_id;
    return new;
  else
    update public.posts set comments_count = greatest(comments_count - 1, 0) where id = old.post_id;
    return old;
  end if;
end; $$;
drop trigger if exists on_post_comment_change on public.post_comments;
create trigger on_post_comment_change
  after insert or delete on public.post_comments
  for each row execute function public.bump_post_comments();

-- ---------- Storage: לוגואים + סקרינשוטים ----------
insert into storage.buckets (id, name, public)
values ('product-logos', 'product-logos', true)
on conflict (id) do nothing;

drop policy if exists "public read logos" on storage.objects;
create policy "public read logos" on storage.objects
  for select using (bucket_id = 'product-logos');
drop policy if exists "authenticated upload logos" on storage.objects;
create policy "authenticated upload logos" on storage.objects
  for insert with check (bucket_id = 'product-logos' and auth.role() = 'authenticated');

-- ---------- Seed: קטגוריות ----------
insert into public.categories (slug, name_he, name_en) values
  ('ai', 'בינה מלאכותית', 'AI'),
  ('saas', 'SaaS', 'SaaS'),
  ('fintech', 'פינטק', 'Fintech'),
  ('ecommerce', 'איקומרס', 'E-Commerce'),
  ('devtools', 'כלי פיתוח', 'Dev Tools'),
  ('mobile', 'אפליקציות', 'Mobile Apps'),
  ('productivity', 'פרודוקטיביות', 'Productivity'),
  ('marketing', 'שיווק', 'Marketing'),
  ('cyber', 'סייבר', 'Cybersecurity'),
  ('health', 'בריאות', 'Health'),
  ('edtech', 'חינוך', 'EdTech'),
  ('hardware', 'מוצר פיזי', 'Hardware'),
  ('ai-agents', 'סוכני AI', 'AI Agents'),
  ('accounting', 'ראיית חשבון', 'Accounting'),
  ('crm', 'CRM', 'CRM'),
  ('automations', 'אוטומציות', 'Automations')
on conflict (slug) do nothing;
