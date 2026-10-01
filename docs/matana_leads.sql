-- לידים מדף מתנת החג (/matana · 3 כתבות תומכות GEO/AEO).
-- טבלה ייעודית עם עמודות מוקלדות, לקריאה וניהול נוחים בדשבורד.
-- להריץ פעם אחת ב-Supabase SQL editor של הפרויקט החי. אידמפוטנטי.

create table if not exists public.matana_leads (
  id uuid primary key default gen_random_uuid(),
  name          text not null,
  phone         text not null,
  email         text not null,
  business      text,
  website       text,
  field         text,        -- תחום העיסוק
  area          text,        -- אזור גיאוגרפי
  audience      text,        -- קהל יעד
  recommend_for text,        -- במה שה-AI ימליץ עליהם
  notes         text,
  marketing_consent boolean default false,
  status        text default 'new',   -- new / in_progress / delivered
  created_at    timestamptz default now()
);

create index if not exists matana_leads_email_idx on public.matana_leads (email);
create index if not exists matana_leads_created_at_idx on public.matana_leads (created_at desc);

-- RLS חובה: זו רשימת לידים. ברירת המחדל של Supabase נותנת ל-anon גישה מלאה,
-- והאתר מפיץ anon key ציבורי. service_role עוקף RLS, כך ש-lib/matana-leads.ts
-- (שעובד עם service key בצד השרת) לא מושפע.
alter table public.matana_leads enable row level security;
revoke all on public.matana_leads from anon, authenticated, public;
