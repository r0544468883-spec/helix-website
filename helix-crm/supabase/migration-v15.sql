-- v15: CRM API — מפתחות מאובטחים per-workspace לגישה חיצונית (Phase 4)
-- הרץ אחרי migration-v14. דורש SUPABASE_SERVICE_ROLE_KEY (כבר בשימוש ב-STAGE).
--
-- אבטחת מידע מוסדרת:
--  • המפתח הגולמי (hxk_live_…) לעולם לא נשמר — נשמר רק SHA-256 שלו (key_hash).
--  • המפתח מוצג פעם אחת בלבד בעת יצירה. אין דרך לשחזר אותו.
--  • scopes מגבילים כל מפתח (contacts:read / contacts:write / deals:read / deals:write / activities:write).
--  • ניתן לבטל (revoked_at) בכל רגע. בידוד מלא לפי workspace_id.

create table if not exists public.crm_api_keys (
  id           uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.crm_workspaces(id) on delete cascade,
  name         text not null,                       -- שם ידידותי ("Zapier", "האתר שלנו")
  key_hash     text not null unique,                -- SHA-256 hex של המפתח הגולמי
  prefix       text not null,                       -- תחילית לתצוגה בלבד (hxk_live_ab…)
  scopes       text[] not null default '{}',        -- הרשאות המפתח
  created_by   uuid references public.profiles(id) on delete set null,
  last_used_at timestamptz,
  revoked_at   timestamptz,
  created_at   timestamptz not null default now()
);

create index if not exists crm_api_keys_ws   on public.crm_api_keys(workspace_id);
create index if not exists crm_api_keys_hash on public.crm_api_keys(key_hash);

alter table public.crm_api_keys enable row level security;

-- חברי ה-workspace רואים את המפתחות שלהם (ללא המפתח הגולמי — הוא לא נשמר).
-- יצירה/ביטול נעשים דרך service_role לאחר בדיקת admin באפליקציה.
do $$ begin
  begin
    create policy "members read workspace api keys" on public.crm_api_keys
      for select using (
        exists (
          select 1 from public.crm_members m
          where m.workspace_id = crm_api_keys.workspace_id
            and m.user_id = auth.uid()
        )
      );
  exception when duplicate_object then null; end;
end $$;

-- שורות שנוצרות דרך ה-API אין להן "בעלים" אנושי — workspace_id הוא גבול האבטחה.
alter table public.crm_contacts   alter column owner_id drop not null;
alter table public.crm_companies  alter column owner_id drop not null;
alter table public.crm_deals      alter column owner_id drop not null;
alter table public.crm_activities alter column owner_id drop not null;
