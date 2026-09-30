## Why

A workspace in the CRM holds only what its team types in. Its owners' leads arrive elsewhere:
- Facebook Lead Ads forms;
- the Google contacts they have collected for years;
- the meetings in their Google Calendar.

On 2026-09-29 Eran asked for every workspace to connect its own Facebook and Google, cheaply, starting with Facebook Lead Ads, Google Contacts and Google Calendar. Google Ads and Analytics would be welcome if free.

The research ("Facebook & Google Connections", an Artifact of the same day) showed the constraint. No tool skips the provider's approval:
- Meta App Review plus Business Verification, for leads;
- Google verification of "sensitive" scopes, for contacts and calendar: free, about 3 to 5 business days.

Agreed the same day:
- **Facebook leads through Make, now.** Each customer uses their own Make account (free plan) and sends leads into the CRM's existing public API. That needs no approval from us and no code on the customer's side beyond Make.
- **Our own "Connect Google" button** for contacts and calendar, built with Google's official libraries and our own Google app. Our own Facebook connector is the next change, because Meta's review takes longer.
- **Contacts: pick who to import.** Google contacts include family and suppliers, not just clients.
- **Calendar: show meetings in the lead's drawer,** read live from Google. Nothing is copied or logged.
- **One Google connection per workspace,** made by an admin.

**Surface: `helix-crm/` only,** plus these outside it:
- **Google Cloud:** an OAuth client and consent screen, submitted for verification.
- **Make:** customers' own accounts.
- **Supabase:** migration v23, applied by Eran.
- **One new secret:** the Google client secret, created by Eran.
- **The website's privacy policy** (`app/privacy`) needs a paragraph on Google user data before Google's verification. That is a website change, so it is a separate proposal (see Non-goals).

## What Changes

- **A "חיבורים" (Connections) screen** in the CRM side menu. It has two parts: Google, and Facebook leads through Make. Everyone sees what is connected; only an admin connects, disconnects or creates the Make key.
- **Facebook leads through Make:**
  - The screen creates an API key that can only add contacts, shown once.
  - It shows the address to send to and the fields to map, and offers a ready Make scenario file to import.
  - The public contacts API learns three things:
    - an opt-in match on email or phone, so a person who submits twice isn't added twice;
    - a `notes` field, for the form's answers, written to the lead's timeline;
    - running the workspace's "new contact" automations, as a contact typed in the CRM already does.
  - Contacts from Facebook are labeled "Facebook Lead Ads".
- **Connect Google:**
  - An admin connects the business's Google account, allowing read-only access to contacts and calendar events.
  - The screen then shows which account is connected, with "ייבוא אנשי קשר" and "ניתוק".
  - The connection is stored with its token encrypted, and disconnecting revokes it at Google.
- **Import from Google Contacts:** a searchable list with checkboxes, where anyone already in the CRM (same email or phone) is marked and never duplicated. The chosen people become leads (status "חדש", labeled "Google Contacts"). Importing starts no automation: these are existing relationships, not new leads.
- **Meetings in the drawer:** with Google connected, a lead with an email shows their next meeting and the last three. They come from the connected calendar, matched on attendee email, loaded after the drawer opens so it never waits. Each links to the event in Google Calendar.

## Capabilities

### New Capabilities
- `crm-connections`:
  - the Connections screen and its side-menu item;
  - who may connect, disconnect and create keys;
  - how a Google connection is kept, and what happens when it lapses.
- `crm-lead-intake`:
  - Facebook leads through Make;
  - the restricted key;
  - the scenario file;
  - the API's match, notes and automations.
- `crm-google-data`:
  - picking and importing Google contacts without duplicates;
  - the meetings shown in a lead's drawer.

### Modified Capabilities
None. The public API gains optional fields and runs automations. Existing calls keep their responses, so no integration that works today changes (`crm-team-roles`: "The change does not alter what an API key can do").

## Non-goals

- **Our own Facebook connector** (a "Connect Facebook" button). It is the next change, after Meta App Review and Business Verification.
- **Google Ads and Google Analytics.** Both are free in money, but each needs its own approval (an Ads developer token; an Analytics scope) and a decision about what to show. That is a separate change.
- **The privacy-policy paragraph** on helix.co.il that Google's verification requires. It is a website change and gets its own proposal, per this repo's rule. This change lists it as a prerequisite for going public.
- **Each team member connecting their own Google,** continuous two-way sync, logging meetings as touches, and writing to Google (creating events or contacts).
- **Gmail.** A restricted scope, with a yearly paid security assessment.
- **Fixing the CRM's scheduler** (Cloud Scheduler was never wired). Nothing here needs a background job.

## Impact

**Database (`helix-crm/supabase/migration-v23-connections.sql`, applied by Eran):**
- `crm_connections`: one row per workspace and provider, holding the account, the scopes, who connected it, and a status.
- The refresh token lives in Supabase Vault, reached only through service-role functions.

**Server:**
- `lib/crm-google.ts`: OAuth, tokens, and the People and Calendar calls.
- Route handlers `/api/connections/google/start`, `/callback` and `/disconnect`.
- `app/crm-actions.ts`: import, meetings, and the Make key.
- `app/api/v1/crm/contacts/route.ts`: match, notes, automations.

**Dependencies:** Google's official `@googleapis/people`, `@googleapis/calendar` and `google-auth-library` (Apache-2.0), not the full `googleapis` package.

**Config:**
- `apphosting.yaml` gains `GOOGLE_CONNECT_CLIENT_ID`, and the secret `GOOGLE_CONNECT_CLIENT_SECRET`, which Eran creates.
- The OAuth client's redirect addresses are registered for crm.helix.co.il and localhost.

**Screens:**
- `/dashboard/crm/connections` and its import page;
- a meetings block in the lead drawer;
- the side menu.

**Docs:** `helix-crm/DESIGN.md` and `lib/i18n/{he,en}.ts`.

**Deploy:** the CRM's App Hosting backend only. The marketing site is untouched here, and its privacy paragraph is the separate proposal.
