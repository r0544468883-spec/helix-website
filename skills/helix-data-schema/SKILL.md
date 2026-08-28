---
name: helix-data-schema
description: HELIX/PLUG shared Supabase schema and data conventions for agents that read or write the database (profiles, applications, jobs, extension sync tables, storage). Use whenever an agent queries, inserts, or updates PLUG/HELIX data, generates SQL, maps fields between the web app and the Chrome extension, or uploads files to storage. Covers the cross-app shared tables, source tags, and known storage-key sanitization rules.
---

# HELIX / PLUG Data Schema

Source of truth: `plug-nexus-ai-main/src/integrations/supabase/types.ts` (generated). This skill summarizes the **cross-app shared** tables agents touch most. Prod Supabase ref `llrzeexnzgknpwcxdxpm`. If a column here disagrees with `types.ts`, `types.ts` wins — regenerate this skill from it.

## Hard conventions
- **Extension writes:** `applications.apply_method` / a `source` tag = `'extension'`; jobs upserted by the extension use `external_source` / `external_id` (see extension repo `mapPlatformProfile()`).
- **`profiles` is shared bidirectionally** between web app and extension. Do not rename or drop columns without updating both.
- **Never `supabase db push` on PLUG** (remote migration history is empty / Lovable-managed). Apply migrations via dashboard SQL editor, authored idempotently.
- **Storage keys must be ASCII.** Hebrew/space filenames throw `Invalid key`. Sanitize before upload:
  `name.replace(/[^\x00-\x7F]/g,'').replace(/\s+/g,'_')`. Buckets that must exist: `resumes`, `avatars`, `profile-videos`.
- IDs are `uuid` text. `created_at`/`updated_at` are ISO timestamps. `*_id` are FKs.

## Core shared tables

### `profiles` (job-seeker + recruiter, shared web↔extension)
Key columns: `id`, `user_id` (FK target for most user refs), `email`, `full_name`, `phone`, `bio`, `about_me`, `avatar_url`, `intro_video_url`, `linkedin_url`, `github_url`, `portfolio_url`, `cv_data` (Json), `portfolio_summary` (Json), `experience_years`, `preferred_fields` (text[]), `preferred_roles` (text[]), `preferred_language`, `preferred_experience_level_id`, `profile_visibility`, `visible_to_hr`, `allow_recruiter_contact`, `active_company_id`, `onboarding_stage`, `theme`, recruiter_* fields (recruiter persona), `total_applications`, `response_rate`, `created_at`, `updated_at`.

### `jobs` (shared; extension upserts external jobs)
Key columns: `id`, `title` (required), `description`, `requirements`, `company_id` (FK companies), `created_by`, `field_id`, `role_id`, `experience_level_id`, `category`, `job_type`, `location`, `latitude`/`longitude`, `hybrid_office_days`, `salary_min`/`salary_max`/`salary_currency`/`salary_period`/`salary_range`, `status`, `source_url`, `is_community_shared`, `shared_by_user_id` (FK profiles.user_id), `ai_summary` (Json), `created_at`, `updated_at`.

### `applications` (candidate↔job; extension writes with source tag)
Key columns: `id`, `candidate_id` (required), `job_id` (required, FK jobs.id), `status`, `current_stage`, `apply_method`, `match_score`, `retention_risk_score`, `blind_mode`, `ai_candidate_summary` (Json), `internal_notes`, `notes`, `last_interaction`, `last_stage_change_at`, `viewed_at`, `stagnation_snoozed_until`, `created_at`, `updated_at`.

### Extension-specific
- `extension_agent_control` — dashboard controls the extension agent (+ version config `latest_version`).
- `job_history` — extension-only browsing history.
- `daily_action_counts` — extension safety-limit counters.

## When an agent writes
1. Read the target row first; do not blind-overwrite `profiles`/`applications`.
2. Direct-to-agent writes MUST persist back to shared state so chiefs don't work on a stale picture.
3. Tag the source (`'extension'` vs app) so sync logic can dedupe.
4. Respect RLS: agents act within a user/workspace scope, never cross-tenant.

There are ~90 tables total (CRM, community, career-site, assessments, etc.). For anything outside the tables above, read `types.ts` directly rather than guessing columns.
