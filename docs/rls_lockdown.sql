-- ===========================================================================
-- RLS LOCKDOWN — run ONCE in the Supabase SQL editor.
--
-- WHY THIS EXISTS
-- geo_scans, content_leads and content_tool_usage were created without RLS.
-- That was defensible while the ONLY caller was the server holding the
-- service_role key. It stopped being true: /free-tools/ai-context now inserts
-- straight from the browser with the PUBLIC anon key (lib/context-lead.ts).
--
-- Supabase's default grants give the `anon` role table privileges on the public
-- schema, and RLS is the only thing that restricts rows. So the moment
-- NEXT_PUBLIC_SUPABASE_ANON_KEY ships in a build, anyone who opens devtools on
-- helix.co.il holds a working credential for the WHOLE lead database:
--     GET    /rest/v1/geo_scans?select=*      -> every name / email / phone
--     GET    /rest/v1/content_leads?select=*  -> the entire email list
--     DELETE /rest/v1/content_tool_usage      -> resets the FREE_LIMIT meter
--
-- RUN THIS BEFORE the anon key is set in CI, apphosting.yaml, or anywhere else.
--
-- service_role holds BYPASSRLS, so every server writer keeps working untouched:
-- lib/supabase-scans.ts, lib/content-leads.ts, lib/content-usage.ts.
-- ===========================================================================

-- 1. Rows: deny anon/authenticated entirely. RLS on with no policy = total denial.
alter table public.geo_scans          enable row level security;
alter table public.content_leads      enable row level security;
alter table public.content_tool_usage enable row level security;

-- 2. Grants: RLS filters rows, GRANTs decide reachability. Revoke the PUBLIC
--    pseudo-role too, so a future policy mistake cannot re-open these.
--    These tables already exist, so they keep their current grants forever —
--    nothing auto-remediates this for you.
revoke all on public.geo_scans          from anon, authenticated, public;
revoke all on public.content_leads      from anon, authenticated, public;
revoke all on public.content_tool_usage from anon, authenticated, public;

-- 3. context_kit_leads is the ONE table the browser must write to. Its policy in
--    docs/context_kit_leads.sql is necessary but not sufficient: a policy with no
--    GRANT still yields permission-denied on a recent project.
grant insert on public.context_kit_leads to anon;
revoke select, update, delete on public.context_kit_leads from anon, authenticated, public;

-- 4. Bound the one anon-writable table. The insert comes straight from a browser
--    with no server, no CAPTCHA and no rate limit in the path.
--    If the table already holds rows that would fail, add `not valid` here and
--    `alter table ... validate constraint ...` after cleaning them.
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

-- 5. Root cause: stop NEW tables inheriting anon grants on this project.
alter default privileges in schema public revoke all on tables from anon, authenticated;

-- ---------------------------------------------------------------------------
-- 6. VERIFY — all four rows must show relrowsecurity = true.
select relname, relrowsecurity
  from pg_class
 where relnamespace = 'public'::regnamespace
   and relname in ('geo_scans','content_leads','content_tool_usage','context_kit_leads')
 order by relname;

-- 7. VERIFY — the ONLY row returned must be context_kit_leads / anon / INSERT.
--    GATE: if this returns anything else, do NOT publish the anon key yet.
select table_name, grantee, privilege_type
  from information_schema.role_table_grants
 where table_schema = 'public'
   and grantee in ('anon','authenticated','PUBLIC')
   and table_name in ('geo_scans','content_leads','content_tool_usage','context_kit_leads')
 order by table_name, grantee, privilege_type;
