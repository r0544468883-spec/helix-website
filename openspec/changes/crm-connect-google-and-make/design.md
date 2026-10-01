## Context

See proposal.md (Why). The facts in `helix-crm/` that shape the approach:

**The public API** (`app/api/v1/crm/contacts/route.ts`):
- It authenticates a per-workspace key with scopes (`lib/crm-api.ts`) and is rate-limited.
- `POST` inserts a contact with `source` (free text, default `api`).
- It has no duplicate check, no notes, and runs no automations.
- `crmCreateContact` in `app/crm-actions.ts`, by contrast, fires `contact.created` automations through `runAutomationsForContact`.
- The drawer labels only the sources `manual`, `api`, `chief` and `import` (`CrmContactDetails.tsx`).

**Auth and origin:**
- Supabase Auth handles sign-in, Google included, with its own OAuth client. Supabase neither stores nor refreshes provider tokens ([Supabase docs](https://supabase.com/docs/guides/auth/social-login)).
- Route handlers must take their origin from `lib/public-origin.ts`, because App Hosting reports `0.0.0.0:8080`.

**Scheduling and secrets:**
- Cloud Scheduler was never wired, so nothing may depend on a background job.
- Secrets are created by Eran (`firebase apphosting:secrets:set`). Claude cannot read them.

**Local runs:** `.env.local` has no service-role key and an empty Resend key. Anything using the admin client can only be exercised in production.

**Google:**
- Contacts (`contacts.readonly`) and calendar events (`calendar.events.readonly`) are "sensitive" scopes: verification is free, about 3 to 5 business days, and needs a privacy policy on our domain, a verified domain and a demo video.
- While the consent screen is External and "Testing", only listed test users can grant access, and their refresh tokens expire in 7 days ([Google OAuth](https://developers.google.com/identity/protocols/oauth2)).
- Calendar `events.list` `q` searches attendee and organizer emails ([Google Calendar](https://developers.google.com/workspace/calendar/api/v3/reference/events/list)).
- People `getBatchGet` takes at most 200 resource names ([People API](https://developers.google.com/people/api/rest/v1/people/getBatchGet)).

## Goals / Non-Goals

**Goals:**
- A customer gets Facebook leads into the CRM this week without us passing any review.
- Google access is read-only, per workspace, encrypted at rest, revocable, and never blocks a screen.
- Existing API integrations behave exactly as before.

**Non-Goals:**
- A background sync.
- Per-member connections.
- Writing to Google.
- Our own Meta app (proposal Non-goals).

## Decisions

### 1. Facebook leads: the customer's Make account into our API

We ship three things:
- a restricted key: the existing `crm_api_keys`, with scopes `['contacts:write']` and the name `Make · Facebook Lead Ads`;
- a Make scenario file;
- a guide on the Connections screen.

The scenario is Facebook Lead Ads' new-lead trigger, followed by an HTTP call to `POST /api/v1/crm/contacts`. It sends `full_name`, `email`, `phone`, `notes` (the form's answers, one per line), `source: "facebook_lead_ads"` and `match: "email_or_phone"`.

The file is built with Make's own tools during implementation, using the connected Make MCP: its module list and `validate_blueprint_schema`. It carries a placeholder where the customer pastes their key, never a key.

**Rejected:**
- **Our own Meta app now.** App Review plus Business Verification comes first; that is the next change.
- **One Make account of ours for everyone.** Every customer's Facebook would be connected inside our account, and Make's free plan covers 1,000 credits a month in all.
- **Zapier.** Its free plan is smaller, and Make is Eran's choice.

### 2. The contacts API gains three opt-ins, not new defaults

**`match: "email_or_phone"`** looks the person up in the key's workspace:
- first the email, lowercased and equal, in one indexed query;
- only then the phone normalised: digits only, `00972` or `972` read as `0`, compared on the full string.

Phones are stored as they were typed, so the workspace's phones are read a page of 1,000 at a time and compared in code, stopping at the first hit. At an SMB's scale that is a few reads per lead, and it needs no migration. A SQL normaliser was rejected: it would have to match the TypeScript one exactly, with no way to test the two together locally.

A hit returns 200 `{ data: {id, …}, matched: true }` and creates nothing. Without `match`, the endpoint does exactly what it does today, so no integration changes (`crm-team-roles` requirement).

**`notes`** of at most 2,000 characters becomes one timeline entry: `crm_activities` type `note`, owner null. It touches `last_activity_at` and rescores, as the activities API already does. A longer value returns 422 before anything is stored.

**Automations:** after a *new* contact, `runAutomationsForContact(db, workspace, 'contact.created', id)`, best-effort, as in `crmCreateContact`. A failure never changes the response.

The phone normaliser is shared with the Google import (decision 5), in `lib/crm-contact-match.ts`.

**Rejected:**
- **Matching by default.** It changes the response for existing callers.
- **A new endpoint only for Make.** The same key and API already exist.

### 3. Google access: our own OAuth client, read-only, PKCE, per workspace

This is a new Google Cloud OAuth client (Web application) under the existing project. `GOOGLE_CONNECT_CLIENT_ID` is a plain variable, and `GOOGLE_CONNECT_CLIENT_SECRET` is a secret. The redirect addresses are `https://crm.helix.co.il/api/connections/google/callback` and `http://localhost:3100/api/connections/google/callback`.

The scopes are the narrowest that serve the spec: `openid`, `email`, `https://www.googleapis.com/auth/contacts.readonly` and `https://www.googleapis.com/auth/calendar.events.readonly`. The broader `calendar.readonly` is not requested.

**`GET /api/connections/google/start`** (admin, checked with `getWorkspace` and `isAdminRole`):
1. Creates a random `state` and a PKCE verifier.
2. Stores them with the workspace id in an httpOnly, SameSite=Lax cookie that lasts 10 minutes and is signed with HMAC under the Supabase service key (already a runtime secret).
3. Redirects to Google with `access_type=offline` and `prompt=consent`, so a refresh token is always issued.

**`GET /api/connections/google/callback`:**
1. Checks the cookie, the state, and that the user is still an admin of that workspace.
2. Exchanges the code with the verifier.
3. Requires a `refresh_token`, and reads the account email from the ID token.
4. Stores the connection (decision 4), revoking any previous one.
5. Clears the cookie and redirects to `/{locale}/dashboard/crm/connections?google=connected`, with `publicOrigin(request)` for every Location.

Any failure redirects with `?google=failed` and stores nothing.

Two refinements found while building:
- **A half-granted consent is refused.** Google lets the person untick a scope on its consent page. If either data scope is missing, the token is revoked at once and the admin reads `?google=partial`: both are needed.
- **Only a different account's old token is revoked.** When the same account reconnects, Google issues the new refresh token under the same grant, so revoking the old token could revoke the new one. The old token is revoked only when the account changes; otherwise it is simply replaced in Vault.

**Disconnect** is a server action. It revokes the token at `https://oauth2.googleapis.com/revoke` (best-effort, 5 seconds), deletes the Vault secret and the row, and reports whether the revoke reached Google.

**The libraries:** Google's own `google-auth-library`, `@googleapis/people` and `@googleapis/calendar`, all Apache-2.0 and loaded only on the server (`import 'server-only'` in `lib/crm-google.ts`).

**Rejected:**
- **Supabase's Google sign-in with extra scopes.** The token would belong to whoever signed in, not the workspace; Supabase doesn't keep it; and every login would ask for calendar access.
- **The full `googleapis` package.** It is very large, and we need two APIs.
- **`arctic`.** Deprecated in July 2026.
- **A managed platform (Composio, Pipedream, Nango).** Eran chose our own connector: our name on the consent screen and no monthly fee.

### 4. Tokens in Supabase Vault, reached only through service-role functions

Migration v23 adds a table and three functions:
- **`crm_connections`:** `id`, `workspace_id`, `provider` (check `google`), `account_email`, `scopes text[]`, `secret_id uuid`, `status` (`active` | `lapsed`), `connected_by`, `connected_at`, `last_error`, and unique `(workspace_id, provider)`. RLS is on with no policies, and all privileges are revoked from `anon` and `authenticated`.
- **`crm_connection_save(p_workspace, p_provider, p_email, p_scopes, p_token, p_user) returns uuid`:** creates or rotates the Vault secret (`vault.create_secret` / `vault.update_secret`) and upserts the row.
- **`crm_connection_token(p_workspace, p_provider) returns text`:** reads `vault.decrypted_secrets` for that row's `secret_id`.
- **`crm_connection_delete(p_workspace, p_provider)`:** deletes the secret and the row.

All three are `security definer` with `search_path` set to `''`. Only `service_role` may execute them. The migration guards that `supabase_vault` is installed, and self-checks the grants.

The app reads the connection through the admin client after `getWorkspace`. The token never leaves `lib/crm-google.ts`: no action returns it, and no log line prints it. A fresh access token lives only in the request that fetched it.

**Rejected:**
- **A plain token column.** A secret at rest, readable by anyone with table access.
- **Encrypting in the app with a new key.** Another secret to create, rotate and never lose, for what Vault already does.

### 5. Import: list from Google, pick, re-fetch the picked ones on the server

**The import page** (`/dashboard/crm/connections/google/import`, for roles that can write) fetches `people.connections.list`:
- `personFields=names,emailAddresses,phoneNumbers,organizations`;
- pages of 1,000, stopping at 2,000 people;
- a 10-second budget.

It drops entries with no name, email or phone. It marks matches against the workspace's contacts (decision 2's rules, over one query for the workspace's emails and phones) and renders a client list with search and checkboxes.

**The action `crmImportGoogleContacts({ locale, resourceNames })`:**
1. Accepts at most 500 names and refuses more.
2. Re-fetches them with `people.getBatchGet` in chunks of 200, so the server never trusts what the browser sent.
3. Re-checks matches.
4. Inserts the rest with the service role: `source: 'google_contacts'`, `status: 'new'`, the legacy mirror, a score, and `owner_id` the importer. The Google organisation's title goes to `role_title`. Its name is matched to a company in the workspace (trimmed, case-insensitive) or creates one, and is linked through `company_id`.
5. Runs no automation.
6. Returns created and skipped counts.

An in-flight guard and the re-check make a double press harmless.

**Rejected:**
- **Importing everything, or syncing.** Eran chose to pick; Google contacts include family and suppliers.
- **Trusting the browser's rows.** A forged post could write arbitrary contacts under the Google label.

### 6. Meetings: fetched after the drawer opens, never stored

`CrmDrawerMeetings` (client) calls the server action `crmContactMeetings({ locale, contactId })` on mount. The action:
1. Loads the contact's email in the active workspace.
2. Gets an access token (decision 4).
3. Calls `events.list` on `primary` with `q=<email>`, `timeMin = now − 180 days`, `timeMax = now + 180 days`, `singleEvents`, `orderBy=startTime` and `maxResults=100`.
4. Keeps only events whose `attendees[].email` or `organizer.email` equals the email (the spec's "an event that only mentions the address" case).
5. Returns the next event and the last 3, each as the day and the Israel-time hour, the title and `htmlLink`.

The client shows a skeleton line, and gives up at 5 seconds with `לנסות שוב`.

A Google `invalid_grant` marks the connection `lapsed` and returns the reconnect notice (decision 7). A missing email or connection returns its own state without calling Google.

**Rejected:**
- **Server-rendering the meetings into the drawer.** A slow Google would hold up the whole page.
- **Storing events.** Eran chose read-live, and nothing needs a sync job.

### 7. Lapsed and testing-mode grants

Any Google call that gets `invalid_grant` sets `status='lapsed'` and a `last_error`. The Connections screen then shows `צריך לחבר מחדש`, with "reconnect" for an admin, and every Google surface shows the one-line notice.

While the consent screen is still in "Testing", this happens every 7 days for the listed test users. That is expected until Google verifies the app, and the screen's hint says so to an admin.

## Risks / Trade-offs

- [Google's verification needs a privacy-policy paragraph on helix.co.il, a website change] → A separate proposal, and the last task names it. Until verification, only test users connect, and only for 7 days at a time.
- [A customer's Make free plan runs out (1,000 credits a month)] → The guide says so. Leads then wait until the month turns or the customer upgrades Make, and nothing is lost in Facebook.
- [Matching on phone digits merges two people who share a number] → It is opt-in and only merges into an existing lead's timeline. Nothing is overwritten, and the answer names the matched id.
- [A Google account with more than 2,000 contacts] → The list stops at 2,000, and the page says so. Search runs over what was listed. Paging on is a later step if needed.
- [Calendar `q` misses an event whose attendee list is hidden from the connected account] → The event isn't shown. That matches the rule: only meetings this calendar knows the lead attends.
- [The service key doubles as the cookie's HMAC key] → It is a runtime-only secret already. A dedicated key can replace it without a schema change.

## Migration Plan

1. **Eran applies v23** in the Supabase SQL editor, twice. It guards Vault and self-checks.
2. **Eran creates the Google OAuth client** (redirect addresses as in decision 3), puts the consent screen in Testing with the two scopes and himself as a test user, and creates the secret `GOOGLE_CONNECT_CLIENT_SECRET`. Claude adds `GOOGLE_CONNECT_CLIENT_ID` to `apphosting.yaml`.
3. **Deploy the CRM backend** (`firebase deploy --only apphosting:helix-crm`). The website is untouched.
4. **Walk it** with Eran's own Google, a test Make scenario and a test Facebook lead form. Facebook's own "Lead Ads Testing Tool" can submit test leads.
5. **After the website's privacy paragraph ships**, Eran submits the consent screen for verification.

**Rollback:** roll back the App Hosting revision. v23's table stays harmless, and connections simply stop being used.
