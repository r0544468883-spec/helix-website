-- ============================================================
-- HELIX CRM — Migration v19 — one status per contact
--
-- A contact's state used to live in two overlapping columns: lifecycle_stage
-- (lead|mql|sql|opportunity|customer) and lead_status (new|contacted|qualified|
-- unqualified). Twenty combinations described one person, and two of the values
-- were HubSpot jargon. This adds a single `status` column that is the truth.
--
-- The two old columns are NOT dropped. The public /api/v1/crm routes return them,
-- CHIEF selects them into its context, and stored automation condition graphs
-- reference them by name. From here the application writes them from `status`
-- on every contact write, so they stay truthful; nothing edits them by hand.
--
-- Run once in the Supabase SQL editor, AFTER v18. Safe to re-run.
-- ============================================================

-- ── 1) The column, added nullable so the backfill can find what it has not done ──
--    (a default is set in step 4, once every existing row has a value)
alter table public.crm_contacts add column if not exists status text;

-- ── 2) The closed set of nine values ──
alter table public.crm_contacts drop constraint if exists crm_contacts_status_check;
alter table public.crm_contacts add constraint crm_contacts_status_check
  check (status in ('new','contacted','talking','proposal','signed','paid','client','declined','frozen'));

-- ── 3) Backfill from the legacy pair.
--    Terminal state first: an `unqualified` opportunity is a person who said no,
--    not a live proposal, so it must not resolve to a progress status.
--    `signed`, `paid` and `frozen` are never produced here — the old schema could
--    not express them, and inventing them would be fabricating history.
--    `where status is null` is what makes this idempotent: a second run finds
--    nothing left to fill. ──
update public.crm_contacts set status =
  case
    when lead_status = 'unqualified'                             then 'declined'
    when lifecycle_stage = 'customer'                            then 'client'
    when lifecycle_stage = 'opportunity'                         then 'proposal'
    when lifecycle_stage = 'sql'                                 then 'talking'
    when lifecycle_stage = 'mql'                                 then 'contacted'
    when lifecycle_stage = 'lead' and lead_status = 'qualified'   then 'talking'
    when lifecycle_stage = 'lead' and lead_status = 'contacted'   then 'contacted'
    else 'new'
  end
where status is null;

-- ── 4) Lock it down: every row now has a value ──
alter table public.crm_contacts alter column status set default 'new';
update public.crm_contacts set status = 'new' where status is null;   -- belt and braces
alter table public.crm_contacts alter column status set not null;

-- ── 5) Recompute score from `status`.
--    Mirrors lib/crm-score.ts exactly. The status weights are the SUMS of the two
--    legacy fields each status maps back from — lifecycle (lead 0 · mql 15 · sql 25 ·
--    opportunity 35 · customer 40) plus lead_status (new 0 · contacted 5 ·
--    qualified 15 · unqualified -20) — so a contact whose two old fields AGREED
--    keeps its exact score and the contact list does not reshuffle.
--    Only self-contradictory rows move, which is a correction: (opportunity,
--    unqualified) scored 15 and is now `declined` at -20 before other signals.
--    `is distinct from` keeps this idempotent: a re-run updates zero rows. ──
with computed as (
  select c.id, greatest(0, least(100,
      (case when c.is_business then 25 else 0 end)
    + (case when c.company_id is not null then 10 else 0 end)
    + (case c.status
         when 'new'       then 0
         when 'contacted' then 5
         when 'talking'   then 40
         when 'proposal'  then 50
         when 'signed'    then 50
         when 'paid'      then 55
         when 'client'    then 55
         when 'declined'  then -20
         when 'frozen'    then 5
         else 0 end)
    + (case when coalesce(c.phone, '') <> '' then 5 else 0 end)
    + (case when coalesce(c.linkedin_url, '') <> '' then 5 else 0 end)
    + (case when exists (
          select 1 from public.crm_deals d
          where d.contact_id = c.id and d.status = 'open'
        ) then 20 else 0 end)
    + (case
         when c.last_activity_at is null then 0
         when c.last_activity_at >= now() - interval '7 days'  then 20
         when c.last_activity_at >= now() - interval '30 days' then 10
         else 0 end)
  )) as new_score
  from public.crm_contacts c
)
update public.crm_contacts c
   set score = x.new_score
  from computed x
 where x.id = c.id
   and c.score is distinct from x.new_score;

-- ── 6) Index: the contact list reads one workspace ordered by score, and filtering
--    by status is the next thing it will want ──
create index if not exists crm_contacts_ws_status_score_idx
  on public.crm_contacts (workspace_id, status, score desc);

-- ── 7) Verification — run these after applying, they are not part of the migration
--
--   -- must return 0
--   select count(*) from public.crm_contacts where status is null;
--
--   -- the nine values and how many contacts sit in each
--   select status, count(*) from public.crm_contacts group by status order by 2 desc;
--
--   -- rows whose score moved because the two old fields contradicted each other
--   select count(*) from public.crm_contacts
--    where lead_status = 'unqualified' and lifecycle_stage <> 'lead';
--
-- Rollback: alter table public.crm_contacts drop column if exists status;
--   lifecycle_stage and lead_status are never written by this migration, so the
--   pre-change application resumes on untouched data. Scores recomputed above stay
--   recomputed and self-correct on the next write of each row.
-- ============================================================
