-- ============================================================
-- HELIX STAGE — Migration v11
-- Waitlist עם referral / דלג-בתור: קוד הפניה + מי הפנה
-- בטוח להרצה חוזרת. הרצה: Supabase Dashboard -> SQL Editor -> Run
-- ============================================================

alter table public.waitlist_signups
  add column if not exists ref_code text,
  add column if not exists referred_by text;

create index if not exists waitlist_ref_code_idx on public.waitlist_signups (ref_code);
create index if not exists waitlist_referred_by_idx on public.waitlist_signups (product_id, referred_by);
