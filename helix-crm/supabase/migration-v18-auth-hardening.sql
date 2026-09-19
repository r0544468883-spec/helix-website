-- ============================================================
-- HELIX CRM — Migration v18 — Auth & RLS hardening
--
-- מריצים ב-Supabase SQL Editor של הפרויקט rymrafskckljgirrejqu, **אחרי**
-- setup-all.sql + migration-v10…v17 + autonomy.sql + pixel-schema.sql.
-- בטוח להרצה חוזרת. שלב 0 עוצר עם הודעה ברורה אם התלויות חסרות, במקום
-- ליפול באמצע.
--
-- הרקע: המפתח הפומבי (sb_publishable_*) מוטמע בכל bundle ולכן ידוע לכולם.
-- כל מדיניות `using (true)` פירושה "העולם", לא "האפליקציה שלי". מדיניות
-- update בלי הגבלת עמודות פירושה שכל משתמש יכול לשנות כל עמודה בשורה שלו,
-- כולל דגלי הרשאה.
-- ============================================================

-- ── 0) בדיקת תלויות — חייב לרוץ אחרי v13–v17 ───────────────────────────
-- v18 נשען על crm_invites (שער ההזמנות), crm_is_member (מדיניות ה-CRM),
-- automation_runs ו-autonomy_settings. הם נוצרים ב-migration-v13 עד v17
-- וב-autonomy.sql — לא ב-setup-all.sql, שמכיל רק את בסיס STAGE.
-- בלי הבדיקה הזו הסקריפט נופל באמצע עם 42P01, ובמקרה הגרוע משאיר
-- handle_new_user שמפנה לטבלה שלא קיימת — כלומר כל הרשמה חדשה נשברת.
do $$
declare missing text[] := '{}';
begin
  if to_regclass('public.crm_invites')      is null then missing := missing || 'crm_invites'::text; end if;
  if to_regclass('public.crm_workspaces')   is null then missing := missing || 'crm_workspaces'::text; end if;
  if to_regclass('public.crm_members')      is null then missing := missing || 'crm_members'::text; end if;
  if to_regclass('public.crm_api_keys')     is null then missing := missing || 'crm_api_keys'::text; end if;
  if to_regclass('public.automation_runs')  is null then missing := missing || 'automation_runs'::text; end if;
  if to_regclass('public.autonomy_settings') is null then missing := missing || 'autonomy_settings'::text; end if;
  if to_regproc('public.crm_is_member')     is null then missing := missing || 'crm_is_member()'::text; end if;

  if array_length(missing, 1) > 0 then
    raise exception E'v18 cannot run: missing %.\nRun in order first: migration-v10 … v17, then autonomy.sql, then pixel-schema.sql. See README.',
      array_to_string(missing, ', ');
  end if;
end $$;

-- ── 1) profiles: לסגור את העמודות הרגישות ──────────────────────────────
-- הטבלה מחזיקה email, is_admin ו-subscribe_token, והמדיניות היא
-- `select using (true)` — כלומר GET /rest/v1/profiles?select=* אחד
-- לא-מאומת מחזיר את כל רשימת המשתמשים.
--
-- הפתרון הוא הרשאות ברמת עמודה ולא ביטול המדיניות: הרבה דפים ציבוריים
-- מצרפים profiles(name, username, avatar_url) כדי להציג שם מחבר, ו-PostgREST
-- מכבד RLS גם על משאב מצורף. ביטול המדיניות היה מוחק שמות מחברים מכל
-- המוצרים, התגובות, הביקורות והקהילה. הרשאות עמודה חוסמות בדיוק את מה
-- שדולף ומשאירות את הצירופים עובדים.
revoke select on public.profiles from anon, authenticated;
grant select (id, username, name, avatar_url, role_title, company, linkedin_url,
              bio, website_url, is_verified, user_type, onboarding_completed,
              interests, created_at)
  on public.profiles to anon, authenticated;
-- email, is_admin: service_role בלבד. שים לב שזה גם אומר ש-?select=* על
-- profiles יחזיר שגיאת הרשאה — זה מכוון, וכל קריאה באפליקציה מפרטת עמודות.

-- ── 2) profiles: לחסום הענקה-עצמית של הרשאות ───────────────────────────
-- "users update own profile" מוגבל-שורה אבל עיוור-עמודות, אז
-- PATCH /rest/v1/profiles?id=eq.<self> עם {"is_admin":true} עבד.
-- is_admin הוא השער היחיד לדיוור segment='all'.
revoke update on public.profiles from anon, authenticated;
grant update (name, username, avatar_url, role_title, company, linkedin_url,
              bio, website_url, user_type, onboarding_completed, interests)
  on public.profiles to authenticated;

-- ── 3) subscribe_token הוא הרשאה, לא מזהה ──────────────────────────────
-- /api/subscribe מתרגם אותו לבעלים ומזריק איש קשר עם service_role.
-- מעבירים אותו לטבלה שאין לה שום מדיניות (deny-all לכל מי שאינו service_role).
create table if not exists public.profile_subscribe_tokens (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  token uuid not null default gen_random_uuid(),
  created_at timestamptz not null default now()
);
create unique index if not exists profile_subscribe_tokens_token_idx
  on public.profile_subscribe_tokens (token);
alter table public.profile_subscribe_tokens enable row level security;
-- אין policy במכוון: deny-all ל-anon/authenticated, service_role עוקף.

-- ההעברה מותנית בקיום העמודה, כדי שהרצה חוזרת לא תיפול על 42703 אחרי
-- שהעמודה כבר הוסרה.
do $$ begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name = 'subscribe_token'
  ) then
    insert into public.profile_subscribe_tokens (profile_id, token)
      select id, subscribe_token from public.profiles where subscribe_token is not null
      on conflict (profile_id) do nothing;
    alter table public.profiles drop column subscribe_token;
  end if;
end $$;

-- פרופילים שאין להם עדיין טוקן (נוצרו אחרי ההסרה, או שהעמודה הייתה null)
insert into public.profile_subscribe_tokens (profile_id)
  select id from public.profiles
  on conflict (profile_id) do nothing;

-- טוקן לכל פרופיל חדש
create or replace function public.handle_new_profile_token()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profile_subscribe_tokens (profile_id) values (new.id)
    on conflict (profile_id) do nothing;
  return new;
end; $$;
drop trigger if exists on_profile_created_token on public.profiles;
create trigger on_profile_created_token
  after insert on public.profiles
  for each row execute function public.handle_new_profile_token();

-- ── 4) הרשמה בהזמנה בלבד ────────────────────────────────────────────────
-- shouldCreateUser:false מכסה רק את ה-magic link. OAuth (Google/LinkedIn)
-- יוצר משתמש בכל התחברות מוצלחת, אז נקודת האכיפה שתופסת את שני המסלולים
-- היא הטריגר על auth.users.
create table if not exists public.auth_allowlist (
  email text primary key,
  note text,
  created_at timestamptz not null default now()
);
alter table public.auth_allowlist enable row level security;
-- אין policy: ניהול דרך ה-SQL editor / service_role בלבד.

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

  -- בהזמנה בלבד: הזמנה פתוחה ל-workspace, או allowlist מפורש.
  if not exists (select 1 from public.crm_invites i where lower(i.email) = addr)
     and not exists (select 1 from public.auth_allowlist a where lower(a.email) = addr)
  then
    raise exception 'HELIX CRM: % is not invited', addr
      using errcode = 'insufficient_privilege';
  end if;

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

-- חשוב: להוסיף את עצמך ל-allowlist לפני שמריצים, אחרת אין דרך פנימה.
-- profiles.email הוא nullable אבל auth_allowlist.email הוא PK, אז מסננים.
insert into public.auth_allowlist (email, note)
  select distinct lower(email), 'existing user at v18'
  from public.profiles
  where email is not null and btrim(email) <> ''
  on conflict (email) do nothing;

-- ── 5) crm_invites: תפוגה + תיעוד ה-deny-all ───────────────────────────
alter table public.crm_invites add column if not exists expires_at timestamptz
  not null default (now() + interval '30 days');
-- RLS דלוק בלי אף policy = deny-all ל-anon/authenticated. במכוון: רשימת
-- ההזמנות הממתינות היא מידע רגיש. הכתיבה נעשית עם service_role אחרי בדיקת
-- admin באפליקציה.

-- ── 6) crm_api_keys: להסיר קריאה לכל חבר ───────────────────────────────
-- ה-UI מגביל ניהול מפתחות ל-admin, אבל המדיניות נתנה select על כל השורה
-- לכל חבר, כולל key_hash. האפליקציה אף פעם לא קוראת את הטבלה עם קליינט
-- המשתמש — היא עוברת דרך service_role.
drop policy if exists "members read workspace api keys" on public.crm_api_keys;

-- ── 7) listings: לא לפרסם contact_email ────────────────────────────────
-- לוח החיבורים ציבורי במכוון, אז המדיניות נשארת. רק העמודה נסגרת —
-- היא נשלפה בדף הלוח ואף פעם לא הוצגה, ויצירת הקשר עוברת ב-contactListing
-- בצד שרת.
revoke select on public.listings from anon, authenticated;
grant select (id, user_id, type, role_title, body, product_id, created_at)
  on public.listings to anon, authenticated;

-- ── 8) autonomy_settings: להצמיד ל-crm_is_member ────────────────────────
-- החיפוש הישיר ב-crm_members לא הכיר ב-agency_admin, אז מנהל סוכנות בתוך
-- workspace של לקוח נכשל סגור עם שגיאת שמירה גנרית.
drop policy if exists autonomy_member on public.autonomy_settings;
create policy autonomy_member on public.autonomy_settings for all
  using (public.crm_is_member(workspace_id))
  with check (public.crm_is_member(workspace_id));
do $$ begin
  alter table public.autonomy_settings
    add constraint autonomy_settings_workspace_fk
    foreign key (workspace_id) references public.crm_workspaces(id) on delete cascade
    not valid;
exception when duplicate_object then null; end $$;

-- ── 9) automation_runs: policy ל-insert ────────────────────────────────
drop policy if exists "members write runs" on public.automation_runs;
create policy "members write runs" on public.automation_runs
  for insert with check (public.crm_is_member(workspace_id));

-- ── 10) security definer בלי search_path ───────────────────────────────
alter function public.crm_is_agency_admin(uuid) set search_path = public, pg_temp;
alter function public.crm_is_member(uuid)       set search_path = public, pg_temp;
alter function public.crm_create_client_workspace(uuid, text) set search_path = public, pg_temp;
-- resolve_branding הוא RPC security definer בלי שומר חברות, חשוף ב-/rest/v1/rpc,
-- וגם קוד מת (getActiveBranding ממשת אותו ב-TypeScript).
drop function if exists public.resolve_branding(uuid);

-- report_token: עמודת bearer-token לא ממומשת בתוך שורה שחברים קוראים.
alter table public.crm_workspaces drop column if exists report_token;

-- ── 11) pixel_visitors: מפתח מורכב ─────────────────────────────────────
-- visitor_id לבדו כ-PK אפשר לכל אחד שיודע visitor_id (ערך לא-סודי
-- מ-localStorage) להעביר את השורה ל-workspace שלו ולדרוס contact_email,
-- consent, signals ו-first_seen. אותו דבר קרה גם בטעות כשדפדפן אחד ביקר
-- בשני אתרים עם הפיקסל.
do $$ begin
  if exists (
    select 1 from pg_constraint
    where conrelid = 'public.pixel_visitors'::regclass and contype = 'p'
      and array_length(conkey, 1) = 1
  ) then
    alter table public.pixel_visitors drop constraint pixel_visitors_pkey;
    alter table public.pixel_visitors add primary key (workspace_id, visitor_id);
  end if;
exception when undefined_table then null; end $$;

-- ── 12) טבלאות עם with check (true) ────────────────────────────────────
-- ה-check לא הגביל אף עמודה, אז אפשר היה לזייף attribution.
drop policy if exists "anyone joins waitlist" on public.waitlist_signups;
create policy "anyone joins waitlist" on public.waitlist_signups
  for insert with check (user_id is null or user_id = auth.uid());

drop policy if exists "anyone inserts views" on public.product_views;
create policy "anyone inserts views" on public.product_views
  for insert with check (true);

-- ── 13) product-logos: להצמיד העלאות לתיקייה של המשתמש ─────────────────
drop policy if exists "authenticated upload logos" on storage.objects;
create policy "authenticated upload logos" on storage.objects
  for insert with check (
    bucket_id = 'product-logos'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
update storage.buckets
  set file_size_limit = 5 * 1024 * 1024,
      allowed_mime_types = array['image/png','image/jpeg','image/webp','image/svg+xml']
  where id = 'product-logos';

-- ── בדיקה ───────────────────────────────────────────────────────────────
-- צריך להחזיר אפס שורות:
--   select tablename, policyname from pg_policies
--   where schemaname='public' and qual = 'true' and cmd = 'SELECT'
--     and tablename in ('profiles','listings');
