-- איזור אישי ללקוחות (client portal) — גישה בקוד בלבד, בלי מייל.
-- *** רץ בפרויקט POLICYHUB (ה-CRM): rymrafskckljgirrejqu.supabase.co ***
-- להריץ פעם אחת ב-SQL Editor של Supabase (דאשבורד), לא דרך supabase db push.
--
-- מודל: כל לקוח = שורה עם slug + hash של קוד הגישה, ומקושר (רך) לאיש הקשר
-- ב-crm_contacts. הקבצים שלו יושבים ב-Storage bucket פרטי client-files, תחת
-- תיקייה בשם ה-slug (שטוח): client-files/<slug>/<filename>.
-- האימות והחתימה על קישורי ההורדה נעשים בצד שרת עם CRM service key בלבד.

create table if not exists public.portal_clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,                 -- שם הלקוח לתצוגה ("משרד יוסי ראובן")
  slug text not null unique,          -- תיקיית ה-Storage ("brilliant-loan")
  access_code_hash text not null,     -- sha256(PORTAL_CODE_SALT + ':' + code)
  crm_contact_id uuid,                -- קישור רך ל-crm_contacts.id (POLICYHUB), אופציונלי
  created_at timestamptz default now()
);

create index if not exists portal_clients_code_idx on public.portal_clients (access_code_hash);

-- RLS: אין גישה אנונימית. כל הקריאה עוברת דרך השרת עם service key (עוקף RLS),
-- אז מפעילים RLS בלי policies = חסום לכל לקוח צד-לקוח. הגנה בעומק.
alter table public.portal_clients enable row level security;

-- ===== Storage bucket (פרטי) =====
insert into storage.buckets (id, name, public)
values ('client-files', 'client-files', false)
on conflict (id) do nothing;

-- דוגמה לזריעת לקוח ראשון (את ה-hash מפיקים עם scripts/portal-hash.mjs):
--   insert into public.portal_clients (name, slug, access_code_hash)
--   values ('משרד הייעוץ של יוסי ראובן', 'brilliant-loan', '<HASH-מהסקריפט>');
