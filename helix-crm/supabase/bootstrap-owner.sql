-- ============================================================
-- HELIX CRM — הקמת המשתמש הראשון (בעלים + admin)
-- מריצים ב-SQL Editor של rymrafskckljgirrejqu, אחרי v18.
-- בטוח להרצה חוזרת. מריצים פעם אחת עכשיו, ופעם שנייה אחרי ההתחברות
-- הראשונה (אז גם is_admin יתפוס — לפני כן הפרופיל עוד לא קיים).
-- ============================================================

-- 1) שער הטריגר: בלי זה handle_new_user ידחה את ההרשמה.
insert into public.auth_allowlist (email, note)
values ('eranlips@gmail.com', 'owner — bootstrap')
on conflict (email) do nothing;

-- 2) workspace + הזמנה בתפקיד admin.
--    getWorkspace תופס את ההזמנה בכניסה הראשונה, יוצר את שורת crm_members
--    ומוחק את ההזמנה. אין יותר הקצאה אוטומטית, אז ההזמנה היא הדרך היחידה.
do $$
declare ws uuid;
begin
  select id into ws from public.crm_workspaces order by created_at limit 1;
  if ws is null then
    insert into public.crm_workspaces (name) values ('HELIX') returning id into ws;
  end if;

  -- אם המשתמש כבר קיים ומחובר, מוסיפים אותו ישירות כ-admin
  if exists (select 1 from public.profiles where lower(email) = 'eranlips@gmail.com') then
    insert into public.crm_members (workspace_id, user_id, role)
    select ws, id, 'admin' from public.profiles where lower(email) = 'eranlips@gmail.com'
    on conflict (workspace_id, user_id) do update set role = 'admin';
  else
    insert into public.crm_invites (workspace_id, email, role)
    values (ws, 'eranlips@gmail.com', 'admin')
    on conflict (workspace_id, email)
      do update set role = 'admin', expires_at = now() + interval '30 days';
  end if;
end $$;

-- 3) הדגל הגלובלי is_admin (שער הדיוור segment='all').
--    מושפע רק אחרי שהפרופיל נוצר, כלומר בהרצה השנייה.
update public.profiles set is_admin = true where lower(email) = 'eranlips@gmail.com';

-- 4) דוח מצב
select
  (select count(*) from public.auth_allowlist where email='eranlips@gmail.com') as allowlisted,
  (select count(*) from public.crm_workspaces)                                  as workspaces,
  (select count(*) from public.crm_invites where lower(email)='eranlips@gmail.com') as pending_invite,
  (select count(*) from public.profiles where lower(email)='eranlips@gmail.com')    as profile,
  (select count(*) from public.crm_members m join public.profiles p on p.id=m.user_id
     where lower(p.email)='eranlips@gmail.com' and m.role='admin')              as admin_membership,
  (select coalesce(bool_or(is_admin),false) from public.profiles
     where lower(email)='eranlips@gmail.com')                                   as global_is_admin;
