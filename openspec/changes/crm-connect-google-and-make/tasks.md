Nothing Google-related works in production before 1.2, 1.3 and 1.4. The Make path (group 2) needs no migration. Before every UI task, read `helix-crm/DESIGN.md`, and update it in the same change. Scratch checks live in the session scratchpad and are not committed. `.env.local` has no service-role key, so anything using the admin client is verified in production (7.2).

## 1. Foundations

- [x] 1.1 Write `helix-crm/supabase/migration-v23-connections.sql` (design decision 4):
  - a guard that `supabase_vault` is installed;
  - `crm_connections` with its unique `(workspace_id, provider)` and checks, RLS on, no policy, and privileges revoked from `anon` and `authenticated`;
  - `crm_connection_save`, `crm_connection_token` and `crm_connection_delete` as `security definer`, with `search_path` set to `''` and execute for `service_role` only;
  - a closing self-check of all of it.

  Verify, by reading:
  - every statement reruns safely;
  - no grant reaches `anon` or `authenticated`;
  - the token is only ever in `vault.secrets`.
  - Done 2026-09-30:
    - It guards `supabase_vault` first, so a missing extension stops the run with how to enable it.
    - `crm_connections`: unique `(workspace_id, provider)`, a provider check (`google`), a status check (`active`/`lapsed`), RLS on, no policy, and privileges revoked from `anon` and `authenticated`.
    - `crm_connection_save`:
      - creates the Vault secret, or rotates an existing one, before upserting the row;
      - reuses a secret with the same name left behind by an interrupted delete;
      - refuses an empty token.
    - `crm_connection_token` reads `vault.decrypted_secrets` for that row, and `crm_connection_delete` removes the row and its secret together.
    - All three are `security definer` with `search_path = ''`. Execute is revoked from `public`, `anon` and `authenticated`, and granted to `service_role`.
    - The self-check loops over the table and the three functions.
    - Every statement reruns safely (`if not exists`, `or replace`, idempotent revokes and grants).
- [ ] 1.2 (Eran, Supabase SQL editor, project `rymrafskckljgirrejqu`) Apply v23, then apply it again.

  Verify: both runs finish with no error.
  - 2026-09-30: Eran reports v23 applied. Claude can't query production to confirm it. The file ends in its own self-check, so a run with no error means all of these hold:
    - `crm_connections` exists, with row level security on, no policy, and no read for `anon` or `authenticated`;
    - the three functions exist, and only `service_role` can run them. The box stays open until Eran confirms that the second run also finished with no error.
- [ ] 1.3 (Eran, Google Cloud console, the CRM's project) Set up Google:
  - enable the People API and the Google Calendar API;
  - create an OAuth client (Web application) with redirect addresses `https://crm.helix.co.il/api/connections/google/callback` and `http://localhost:3100/api/connections/google/callback`;
  - on the consent screen (External, **Testing**), add the scopes `openid`, `email`, `…/auth/contacts.readonly` and `…/auth/calendar.events.readonly`, and add yourself as a test user;
  - run `firebase apphosting:secrets:set GOOGLE_CONNECT_CLIENT_SECRET --project helix-fc9de` and grant it to the `helix-crm` backend;
  - send Claude the **client id** only.

  Verify: Eran confirms each step, and the secret shows as granted to `helix-crm`.
- [ ] 1.4 Wire the config and the libraries:
  - `helix-crm/apphosting.yaml` gains `GOOGLE_CONNECT_CLIENT_ID` (the value from 1.3) and a `GOOGLE_CONNECT_CLIENT_SECRET` secret reference;
  - `npm install google-auth-library @googleapis/people @googleapis/calendar` inside `helix-crm/`.

  Verify:
  - the YAML parses;
  - `npm ls google-auth-library @googleapis/people @googleapis/calendar` lists all three;
  - tsc and `npm run build` exit 0.

## 2. Facebook leads through Make

- [x] 2.1 Write `helix-crm/lib/crm-contact-match.ts`: pure `normalizeEmail`, `normalizePhone` (digits only, a leading `972` becomes `0`), and `sameContact`.

  Verify with a scratch check:
  - `052-123-4567` equals `+972 52 123 4567`;
  - `Dana@Example.com` equals `dana@example.com`;
  - `052-123-4567` doesn't equal `052-123-4568`;
  - empty values never match;
  - tsc exits 0.
  - Done 2026-09-30:
    - The functions are `normalizeEmail`, `normalizePhone` (digits; `00972` and `972` read as `0`; fewer than 7 digits is not a phone), `matchKeys`, `isKnown` (any of a person's emails or phones) and `sameContact`.
    - The scratch check passes 13 of 13:
      - both international forms, a case-insensitive email, a different last digit, empty values and nulls, and email against phone;
      - a short number rejected, a landline kept, a non-address rejected;
      - several emails and phones against a set, and an unknown person.
    - tsc exits 0.
- [x] 2.2 Extend `POST` in `helix-crm/app/api/v1/crm/contacts/route.ts` (design decision 2):
  - `match: "email_or_phone"` returns 200 with `matched: true` and creates nothing;
  - `notes` of at most 2,000 characters becomes a timeline `note` that touches and rescores; a longer one gets 422 `notes_too_long` before anything is stored;
  - `contact.created` automations run for new contacts only, best-effort.

  Add the labels `Facebook Lead Ads` and `Google Contacts` for `facebook_lead_ads` and `google_contacts` in `components/CrmContactDetails.tsx`, with the strings in `helix-crm/lib/i18n/{he,en}.ts`.

  Verify:
  - tsc exits 0;
  - reading: without `match` and `notes`, the insert and the 201 response are byte-for-byte what they were.
  - Done 2026-09-30:
    - `notes` over 2,000 characters answers 422 `notes_too_long`, and a `match` other than `email_or_phone` answers 422 `invalid_match`, both before anything is stored.
    - With `match`, `findExisting` checks the email first and then the workspace's phones, a page of 1,000 at a time. A hit logs `notes` as a timeline `note` and answers 200 `{ data, matched: true }` in the created-contact shape.
    - A new contact gets its `notes` logged, which touches and rescores as the activities API does. It then runs `contact.created` automations inside a try, exactly as `crmCreateContact` does.
    - `KNOWN_SOURCES` and both dictionaries gain `Facebook Lead Ads` and `Google Contacts`.
    - tsc exits 0.
    - Reading: without `match` and `notes`, the insert payload and the 201 `{ data }` (the same columns, now the `RETURNED` constant) are unchanged. The only addition for such a caller is the automations run, which the spec requires.
- [x] 2.3 Build the Make scenario file `helix-crm/public/integrations/make-facebook-lead-ads.json` with the connected Make tools. Take the module identifiers from Make's module list: Facebook Lead Ads' new-lead trigger, then an HTTP request to the contacts address carrying the fields of design decision 1. Where the key goes, put the placeholder `PASTE_YOUR_HELIX_KEY`.

  Verify:
  - Make's `validate_blueprint_schema` accepts the file;
  - `grep -c "hxk_" helix-crm/public/integrations/make-facebook-lead-ads.json` prints `0` (the CRM's keys start with `hxk_`; the first draft of this check said `hk_`, which misses them).
  - Done 2026-09-30:
    - Built from the modules the connected Make account lists (organization 9083026):
      1. `facebook-lead-ads:NewEvent` (v1, "Watch form filling", instant). It only gives ids, so a second step is needed.
      2. `facebook-lead-ads:GetLeadgen` (v1, with `{{1.leadgenId}}`), which reads what the person filled in.
      3. `http:ActionSendData` (v3): a POST to `https://crm.helix.co.il/api/v1/crm/contacts` with a raw JSON body. It maps Facebook's standard `full_name`, `email` and `phone_number`, sends `notes` "ליד מ-Facebook Lead Ads · טופס {{1.formId}}", `source: facebook_lead_ads` and `match: email_or_phone`, and puts the header `Authorization: Bearer PASTE_YOUR_HELIX_KEY`.
    - Custom questions differ per form, so the guide (3.1) says how to add them to `notes`.
    - `validate_blueprint_schema`: "Blueprint is valid against the schema."
    - `extract_blueprint_components`: the customer supplies a Facebook connection (Make's app, scopes `manage_pages` and `leads_retrieval`) and a webhook. This confirms our side needs no Meta review.
    - The key check prints `0`.

## 3. The Connections screen

- [x] 3.1 Build `app/[locale]/(crm)/dashboard/crm/connections/page.tsx` and its component:
  - the Google section (state, and the admin controls, wired in 4.2);
  - the Make section: numbered steps, the address and the fields in `dir="ltr"` code boxes with copy, the file link, and for an admin `יצירת מפתח ל-Make`;
  - `crmCreateMakeKey` in `app/crm-actions.ts` (admin; scopes `['contacts:write']`; name `Make · Facebook Lead Ads`; shown once);
  - "חיבורים" (lucide `Plug`) in `components/CrmNavMenu.tsx` for every role, and the ⌘K route;
  - the strings in `helix-crm/lib/i18n/{he,en}.ts`.

  Update `helix-crm/DESIGN.md`: §8 gets the Connections screen and its code box, and §17 the file map. Bump `Last updated`.

  Verify:
  - tsc and `npm run build` exit 0, and the build lists `/[locale]/dashboard/crm/connections`;
  - every control is `min-h-[44px]`.
  - Done 2026-09-30:
    - The page reads the workspace's Google row and the newest unrevoked `Make · Facebook Lead Ads` key prefix through the service role. Before v23 the missing table reads as not connected.
    - It formats the date in Israel, checks the two Google env settings, builds the API address from `publicOriginFromHeaders`, and accepts only known `?google=` messages.
    - `CrmConnections`:
      - Google: the state line (the address `dir=ltr`), connect/reconnect for an admin (a plain link to the start route, built in 4.2), import for `canWrite`, a muted admin-only line for others, and one muted line when the server has no Google settings;
      - Make: the five steps, the extra-questions line, the file download, the address and fields in Code boxes with copy (a refused clipboard selects the text), and for an admin `יצירת מפתח ל-Make`, whose key shows once in the API screen's new-key card; the existing key's prefix shows otherwise.
    - `crmCreateMakeKey` wraps `crmCreateApiKey` with the fixed name and `['contacts:write']`, and refreshes the screen.
    - The side menu gains "חיבורים" (`Plug`, before API), and ⌘K gains the route.
    - DESIGN.md:
      - §8 gains "Connections screen" and its Code box;
      - the side-menu list and the §17 map are updated;
      - `Last updated` is 2026-09-30.
    - tsc and `npm run build` exit 0, and the build lists `/[locale]/dashboard/crm/connections`. The controls use `min-h-[44px]`.

## 4. The Google connection

- [x] 4.1 Write `helix-crm/lib/crm-google.ts` (`import 'server-only'`), per design decisions 3, 4 and 7:
  - the OAuth client;
  - the consent URL with PKCE and offline access;
  - the code exchange, requiring a refresh token;
  - saving through `crm_connection_save`;
  - a fresh access token through `crm_connection_token`;
  - marking a connection `lapsed` on `invalid_grant`;
  - revoking;
  - thin People and Calendar calls.

  The signed state cookie's pure sign and verify go in `lib/crm-oauth-state.ts`.

  Verify:
  - tsc exits 0;
  - a scratch check of `lib/crm-oauth-state.ts`: a good cookie verifies, while a changed byte, a different workspace and an expired one don't.
  - Done 2026-09-30:
    - `lib/crm-oauth-state.ts` has `newState` (24 random bytes), `signState` and `verifyState` (HMAC-SHA256 under a key derived from the service key, compared in constant time, with an expiry).
    - `lib/crm-google.ts` (server-only):
      - `consentUrl` (S256 PKCE via `generateCodeVerifierAsync`, `access_type=offline`, `prompt=consent`, the four scopes);
      - `exchangeCode` (10 s): it requires the refresh token and both data scopes, revoking a half-grant, and takes the email from a verified ID token;
      - `saveConnection`, `googleAuth` (a fresh access token in 8 s, lapsing on `invalid_grant`), `markLapsed` and `disconnect` (5 s revoke, then `crm_connection_delete`);
      - the thin calls `listPeople` (pages of 1,000, stopping at 2,000, a 10 s budget), `getPeople` (chunks of 200) and `listEvents` (primary calendar, `q`, single events by start time, up to 100).
    - No export returns the refresh token, and the log lines carry only error messages.
    - Design decision 3 records the two refinements: a half-grant is refused, and only a different account's old token is revoked.
    - The scratch check of the cookie passes 10 of 10: good, a changed byte, another key, a different workspace, a swapped signature, expired, missing, garbage, three parts, and random states.
    - tsc exits 0.
- [x] 4.2 Add the routes and disconnect:
  - `app/api/connections/google/start/route.ts` and `callback/route.ts`, with every redirect through `publicOrigin(request)`;
  - `crmDisconnectGoogle` in `app/crm-actions.ts` (admin);
  - the Google section's `חיבור Google`, `ניתוק` (asks first, in a `Dialog`), the `?google=connected|failed` messages, and the lapsed state with its testing-mode hint.

  Verify:
  - tsc and `npm run build` exit 0;
  - on `next start -p 3100`, a signed-out `/api/connections/google/start` redirects to `/he/login`;
  - `/api/connections/google/callback?state=x&code=y` with no cookie redirects to `…/connections?google=failed`.
  - Done 2026-09-30:
    - `start`: a signed-out visitor goes to `/{locale}/login`; a non-admin gets `?google=admin`; missing Google settings or service key give `?google=failed`. Otherwise it redirects to Google with the signed cookie (httpOnly, SameSite=Lax, `secure` on https, path `/api/connections/google`, 10 minutes).
    - `callback` checks, in order: the cookie verifies and Google's `state` matches (so a forged "access_denied" can't pose as a real one); a Google error; a code; the same user; still an admin of that workspace via `accessRole`. It then exchanges the code (`?google=partial` for a half-grant) and saves the connection. Every exit clears the cookie, and every redirect goes through `publicOrigin`.
    - `crmDisconnectGoogle` (`isAdminRole`) revokes and deletes, reports whether Google confirmed, and refreshes the screen.
    - The screen:
      - a quiet `ניתוק` (admin, connected or lapsed, `ms-auto`) opens a `Dialog`: "לנתק את Google?", its line, Danger fill "ניתוק Google" and "לא עכשיו";
      - after a disconnect it shows "Google נותק.", or, when Google didn't confirm, a line linking to `myaccount.google.com/permissions`;
      - `?google=partial` has its own message.
    - Verified:
      - tsc and `npm run build` exit 0, and the build lists both routes;
      - on `next start -p 3100`:
        - a signed-out `start` gives 307 to `http://localhost:3100/he/login`;
        - the callback with no cookie gives 307 to `…/connections?google=failed` and clears the cookie, even with `error=access_denied`;
        - the Connections page redirects a signed-out visitor to `/he/login`;
        - the scenario file is served as `application/json`.

## 5. Importing Google contacts

- [x] 5.1 Build the import page, per design decision 5:
  - `app/[locale]/(crm)/dashboard/crm/connections/google/import/page.tsx`;
  - `components/CrmGoogleImport.tsx`: search, checkboxes, "select the visible", a counter, and rows `כבר ב-CRM`;
  - `crmImportGoogleContacts` in `app/crm-actions.ts`: at most 500, re-fetched in chunks of 200, matches re-checked, companies found or created, no automations, the counts returned;
  - the strings in `helix-crm/lib/i18n/{he,en}.ts`.

  Update `helix-crm/DESIGN.md` (the import list), and bump `Last updated`.

  Verify:
  - tsc and `npm run build` exit 0;
  - a scratch check of the list's marking over a fixture of 6 Google people against 3 CRM contacts: the email match, the reformatted phone match, the nameless one dropped, and the rest selectable.
  - Done 2026-09-30:
    - `lib/crm-google-map.ts` (pure) turns Google people into rows with `toRow`/`toRows`: no resource or nothing to show means dropped; no name falls back to email then phone; the first organization's name and title are kept; the email is normalised; `known` comes from `isKnown`; the list is sorted by name.
    - `lib/crm-contact-keys.ts` reads a workspace's emails and phones a page of 1,000 at a time.
    - The page:
      - a readonly notice for viewers;
      - `googleAuth`, then the not-connected, lapsed or failed notice (with retry and the Connections link);
      - `listPeople` (a lapse is marked);
      - `toRows` against the workspace, handed to the picker;
      - a text-free `loading.tsx` skeleton, since a loading file gets no locale.
    - `CrmGoogleImport` has search, "select the shown", clear, and label-wide 44px rows. Known rows have no checkbox. A sticky bar holds `ייבוא {n} אנשי קשר`: at 0 it does nothing, over 500 it gets a message, it has a 30 s limit and an in-flight guard, and the result line is followed by a refresh.
    - `crmImportGoogleContacts` (`canWrite`):
      - checks the names' shape and dedupes them, refusing over 500;
      - re-reads the people with `getPeople` (chunks of 200), lapsing on `invalid_grant`, and re-checks matches;
      - finds each company case-insensitively (LIKE characters escaped) or creates it;
      - inserts through the user's session (RLS decides) with status `new` and source `google_contacts`, and no automation;
      - adds each created person to the keys, so the same person twice in one batch is created once;
      - returns `created` and `skipped`.
    - DESIGN.md §8 gains "Google import list", and §17 the component.
    - The scratch check of the rows passes 10 of 10 (6 people plus one without a resource, against 3 contacts): an email match known, a reformatted phone match known, the empty one dropped, a new person offered, the email as a name, company and title kept, a blank company null, the email normalised, and the Hebrew sort.
    - tsc and `npm run build` exit 0, and the build lists `/[locale]/dashboard/crm/connections/google/import`.

## 6. Meetings in the drawer

- [x] 6.1 Build the meetings block, per design decision 6:
  - `crmContactMeetings` in `app/crm-actions.ts`;
  - `components/CrmDrawerMeetings.tsx`, placed after the reminder in `components/CrmContactDrawer.tsx`: a skeleton line, a 5-second limit with `לנסות שוב`, and the states for no connection (no block), no email, none found, lapsed and error;
  - the strings in `helix-crm/lib/i18n/{he,en}.ts`.

  Update `helix-crm/DESIGN.md` (the drawer's meetings block), and bump `Last updated`.

  Verify:
  - tsc and `npm run build` exit 0;
  - a scratch check of the event filter over fixture events: an attendee match kept, an organizer match kept, a description-only mention dropped, and the next and the last 3 picked in order.
  - Done 2026-09-30:
    - `lib/crm-meetings.ts` (pure): `pickMeetings` keeps events where the lead's email (normalised) is an attendee or the organizer, drops cancelled ones, and returns the next one and the last 3, newest first. Days and hours are formatted in Israel time: he `שבת, 3.10`, en `Sat 03/10`, and no hour for an all-day event.
    - `crmContactMeetings` checks the contact in the active workspace, then its email, then `googleAuth`. It calls `listEvents` over 180 days either side, with a 4.5 s limit (the token refresh before it has its own 8 s). The 5 s the spec asks for is the drawer's own timer, so it holds whatever the server is doing. An `invalid_grant` marks the connection lapsed. `MeetingsAnswer` has one member per state, so the drawer's checks narrow it.
    - The CRM home page gives the drawer `meetings` only when Google is configured and the workspace has a connection (`active` or `lapsed`), plus whether the viewer is an admin.
    - `CrmDrawerMeetings`:
      - a skeleton row (role=status);
      - a 5 s `withTimeout`, then "didn't load" with `לנסות שוב`;
      - no block for no connection; lines for no email, none in the window, and lapsed (with the Connections link for an admin);
      - the next row tagged `הבאה`, then `אחרונות` and up to 3 rows. Each row opens its event in a new tab, with an sr-only "open in Google Calendar";
      - a sequence guard drops a late answer.
    - The drawer keys the block by lead and email, so another lead or an edited email loads afresh.
    - DESIGN.md §8 gains "Drawer meetings". §17 gains the component and the six new libraries (`crm-google`, `crm-oauth-state`, `crm-google-map`, `crm-meetings`, `crm-contact-match`, `crm-contact-keys`).
    - The scratch check passes 8 of 8 over 10 fixture events. It covers:
      - an attendee match written in another case, kept;
      - an organizer match, kept;
      - a description-only mention and a cancelled event, both dropped;
      - the next one at `14:00` Israel time;
      - the last 3 newest first, an all-day one among them with no hour;
      - the link kept;
      - an empty email, and another lead, both getting nothing.
    - tsc and `npm run build` exit 0, and the build shows no warnings.

## 7. Verification

- [x] 7.1 Run the gates:
  - `cd helix-crm && npx tsc --noEmit && npm run build`, both exiting 0;
  - `openspec validate crm-connect-google-and-make --strict`.
  - Done 2026-09-30:
    - tsc and `npm run build` exit 0 on the final code, and the build shows no warnings. The build lists `/api/connections/google/start`, `/api/connections/google/callback` and the import page.
    - `openspec validate crm-connect-google-and-make --strict` → "Change 'crm-connect-google-and-make' is valid".
    - Without 1.3's client id, `googleConfigured()` is false. The Connections screen then shows "not configured", and the drawer shows no meetings block. So this code is safe to deploy before Google is set up.
- [ ] 7.2 When Eran asks for the deploy, after 1.2 to 1.4, run `firebase deploy --only apphosting:helix-crm` from the repo root. Then walk it with Eran on https://crm.helix.co.il/he/dashboard/crm/connections:
  - **Google:**
    - connect his account and see `מחובר`;
    - import 3 contacts, with one existing contact marked `כבר ב-CRM`;
    - open a lead with a meeting and see it in the drawer;
    - disconnect and see `לא מחובר`;
    - connect again.
  - **Make:**
    - create the key;
    - import the file into his Make account and connect Facebook;
    - send a test lead with Meta's Lead Ads Testing Tool. It arrives labeled `Facebook Lead Ads`, with its answers on the timeline;
    - send it again. There's still one contact (matched).
  - **With the Make key:** `curl -sI -H "Authorization: Bearer <key>" https://crm.helix.co.il/api/v1/crm/contacts` answers 403. Eran runs this one, since the key is his.

  List every scenario in the three specs that could not be verified, with the reason.
  - 2026-09-30, an early deploy at Eran's request. It came after 1.2 but before 1.3 and 1.4, so Google shows "not configured" and the drawer shows no meetings. `firebase deploy --only apphosting:helix-crm` ended with "Deploy complete!". The signed-out checks on crm.helix.co.il passed 8 of 8:
    - the Connections page and the import page → `/he/login`;
    - Google start → `https://crm.helix.co.il/he/login`;
    - the Google callback with no cookie → `/he/dashboard/crm/connections?google=failed`, clearing `helix_google_oauth`;
    - `/integrations/make-facebook-lead-ads.json` → 200 `application/json`, 3 modules, the key placeholder and no key;
    - `POST /api/v1/crm/contacts` without a key → 401;
    - `/auth/callback` → a Location on crm.helix.co.il, not 0.0.0.0;
    - `/` → `/he`.

    The Make part of the walk can run now. The Google part waits for 1.3, 1.4 and one more deploy.
- [ ] 7.3 Before the Google button goes to customers outside the test list (Eran):
  - a separate website proposal adds a paragraph on Google user data to `app/privacy`;
  - record the demo video Google asks for;
  - submit the consent screen for verification.

  Verify: Google's console shows the app as verified, and a non-test account can connect.
