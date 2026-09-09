-- ============================================================
-- HELIX STAGE — Migration v12
-- העשרת נרשמים: דומיין המייל + סימון עסקי/אישי (מי נרשם באמת)
-- בטוח להרצה חוזרת. הרצה: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

alter table public.waitlist_signups
  add column if not exists email_domain text,
  add column if not exists is_business boolean;

create index if not exists waitlist_business_idx on public.waitlist_signups (product_id, is_business);
