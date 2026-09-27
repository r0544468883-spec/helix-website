## 1. Foundations — pure modules and strings, no behaviour change yet

- [x] 1.1 Create `helix-crm/lib/crm-status.ts` with the nine values as a const tuple in funnel order, the `CONTACT_STATUSES` type, the `status → { lifecycle_stage, lead_status }` mapping from design.md decision 1, the `STATUS_SCORE` table from decision 2, and `STATUS_BADGE` / `STATUS_TEXT` class maps from decision 4. Verify `npx tsc --noEmit` is clean and that every one of the nine keys appears in all four maps.
- [x] 1.2 Create `helix-crm/lib/phone-il.ts` exporting `toWhatsAppNumber(raw: string | null | undefined): string | null` per design decision 6. Verify by asserting the six cases in the comms spec's normalisation scenarios: `054-123-4567`, `0541234567`, `+972 54-123-4567`, `03-1234567`, `+1 (415) 555-0123`, `1234`.
- [x] 1.3 Add the nine status labels (`cs_new` … `cs_frozen`) plus drawer and comms strings to `helix-crm/lib/i18n/he.ts` and `en.ts` under `crm`, including the not-found, no-phone, unusable-phone, no-email, required-field, send-failed, provider-unavailable, session-expired, rate-limited and discard-draft messages the specs name. Verify `npx tsc --noEmit` is clean, so the two dictionaries have not drifted.

## 2. Data model

- [ ] 2.1 (BLOCKED: needs the service-role key, which --env-file does not surface locally; run in the Supabase SQL editor) Count the rows the migration will rescore: run the self-contradiction query from design.md (`lead_status = 'unqualified'` with `lifecycle_stage` past `lead`) against Supabase and record the number in this change's design.md as a note. Verify the count is recorded before any DDL runs.
- [x] 2.2 Write `helix-crm/supabase/migration-v19-contact-status.sql`: add `status text not null default 'new'` with the nine-value check constraint, backfill via the ordered CASE from design decision 3, recompute `score` from `STATUS_SCORE` plus the unchanged signal weights, and add an index for ordering. Make it idempotent in the style of v14–v18. Verify by reading it against the spec's three backfill scenarios without running it.
- [ ] 2.3 (BLOCKED: Supabase SQL editor, yours to run) Apply the migration in the Supabase SQL editor, then re-run it a second time. Verify the first run leaves zero contacts with a null status, a contact that was `customer` + `qualified` with score 80 is now `client` with score 80, and the second run changes no row.
- [x] 2.4 Re-point `helix-crm/lib/crm-score.ts` at `status`: `ScoreInput` takes `status` instead of `lifecycle_stage` and `lead_status`, `scoreContact` uses the single `STATUS_SCORE` lookup, `scoreReasons` names the status in Hebrew. Update every call site in the same task — `app/crm-actions.ts`, `lib/chief/crm-client.ts`, `lib/automations/engine.ts`, `app/api/v1/crm/contacts/route.ts`, `app/api/v1/crm/activities/route.ts`. Verify `npx tsc --noEmit` and `npm run build` both exit 0.

## 3. Server actions

- [x] 3.1 Change `crmUpdateContact` in `helix-crm/app/crm-actions.ts` to accept `status` and reject anything outside the nine, writing `status` plus the mapped legacy pair plus the recomputed score in one update. Verify an unknown value returns an error without writing, and a valid one leaves `lifecycle_stage`/`lead_status` matching the mapping table.
- [x] 3.2 Change `crmCreateContact` to accept `status` (defaulting to `new`) and write the mapped pair, and update `components/CrmAddContact.tsx` to offer the nine statuses instead of the five lifecycle values. Verify a contact saved with no status chosen reads `status = new`, `lifecycle_stage = lead`, `lead_status = new`.
- [ ] 3.3 (implemented and type-checked; the two curl POSTs need a live API key against a migrated database) Keep the public API back-compatible in `app/api/v1/crm/contacts/route.ts`: POST accepts `status` and, when absent, derives it from a supplied `lifecycle_stage`/`lead_status` pair; GET returns `status` alongside both legacy fields. Verify with two `curl` POSTs against `/api/v1/crm/contacts` — one sending `status`, one sending only `lifecycle_stage` — that both create a contact whose three fields agree.
- [x] 3.4 Add `status` to the automation condition field list in `helix-crm/lib/automations/types.ts` without removing `lifecycle_stage` or `lead_status`. Verify a stored graph conditioning on `lifecycle_stage == customer` still matches a `client` contact.

## 4. Status in the contact list

- [x] 4.1 Add `status` to the contacts query and the row type in `helix-crm/app/[locale]/(crm)/dashboard/crm/page.tsx`, passing it through to `CrmContactList`. Verify the page still renders at `/he/dashboard/crm` with no runtime error.
- [x] 4.2 Replace the row's grey lifecycle chip in `helix-crm/components/CrmContactList.tsx` with the coloured status chip, change the score badge to a neutral treatment, and delete the `hot`/`warm`/`cold` word from the row. Verify a list holding all nine statuses shows nine distinguishable chips and that `cold` appears in no row.
- [x] 4.3 Extend the list's client-side filter to match the status's Hebrew label as well as name, company, role and email. Verify typing `הצעה` narrows the list to contacts whose status is `proposal`.

## 5. The drawer

- [x] 5.1 Accept `searchParams` on the CRM home page and, when `c` names a contact in the active workspace, fetch that contact with its deals and activities server-side. Verify a `?c=` naming a contact from another workspace renders the list with the Hebrew not-found notice and HTTP 200, and a malformed id also returns 200 with no drawer.
- [x] 5.2 Create `helix-crm/components/CrmContactDrawer.tsx` over `lib/motion/Drawer.tsx` with `side="start"`, rendering name, role, the editable status control, email, phone, deals and timeline, with the Hebrew empty-state line when there is no activity. Verify at `/he/dashboard/crm?c=<id>` that all six regions render and that a contact with no deals shows no empty deals region.
- [x] 5.3 Turn `CrmContactList` rows into links to `?c=<id>` instead of the full contact page. Verify a click opens the drawer with the list's filter text and scroll position unchanged behind it, and that middle-click still opens a new tab.
- [x] 5.4 Wire dismissal: Escape, scrim click and an explicit close control all clear `c` from the URL, and focus returns to the originating row. Verify the browser back button closes the drawer and that focus lands on the row after Escape.
- [x] 5.5 Move the status control into the drawer with an optimistic update — the chip shows the new value at full opacity before the server confirms, reverts with a Hebrew message on failure, and distinguishes an expired session from a generic failure. Verify by changing a status with the network throttled to offline that the chip reverts and names the failure.
- [x] 5.6 Collapse the two selects in `helix-crm/components/CrmContactPanel.tsx` into the single status control so the full contact page matches the drawer. Verify no screen in the CRM offers `mql`, `sql`, `opportunity` or `customer` as an editable value.

## 6. WhatsApp and email

- [x] 6.1 Add the WhatsApp action to the drawer: a `wa.me` link built from `toWhatsAppNumber` with the message field's text encoded, `target="_blank"` and `rel="noopener noreferrer"`. Hide it and show the Hebrew reason when the phone is missing or unusable. Verify a contact with `054-123-4567` produces `https://wa.me/972541234567?text=…` and one with `1-800-HELIX` offers no action.
- [x] 6.2 Add a `crmLogWhatsApp` server action writing one `whatsapp` activity and refreshing `last_activity_at` and the score, worded as WhatsApp having been opened rather than sent. Verify the timeline gains one entry within 5 seconds and a contact last active 60 days ago gains the 20-point recency bonus.
- [x] 6.3 Add a `sendContactEmail` server action calling Resend directly with `RESEND_FROM`, racing a 15-second timeout, writing the `email` activity only after the provider accepts. Verify a send to a valid address logs one activity and a send with the Resend key unset reports the provider as unavailable and logs nothing.
- [x] 6.4 Add the hourly cap: count `email` activities for the workspace in the trailing hour and refuse the 21st, naming the reset time in Hebrew. Verify the 21st attempt inside an hour is refused and writes no activity.
- [x] 6.5 Add the compose UI to the drawer — subject, body, send — with per-field Hebrew validation that preserves typed values, an in-flight guard so a double press sends once, and the discard prompt when Escape is pressed with a draft. Verify pressing send twice within 300ms produces exactly one email and one activity.

## 7. Design doc

- [x] 7.1 Update `helix-crm/DESIGN.md` in the same commit as the UI work: the nine-status colour palette with exact class strings, the chip pattern and its no-hover rule, the rule that status is the only coloured element in a contact row, the drawer's placement and width, and the `?c=` addressing convention. Add a Known Drift row for anything found deviating, remove any row this change fixes, and bump `Last updated:`. Verify the doc names all nine statuses and that `git diff --name-only` shows `DESIGN.md` alongside the component changes.

## 8. Verification

- [x] 8.1 Run the gates: `cd helix-crm && npx tsc --noEmit` and `npm run build`, both exit 0.
- [ ] 8.2 (BLOCKED: needs a signed-in CRM session; auth is invite-only magic link) On a signed-in session at `http://localhost:3100/he/dashboard/crm`, walk every scenario in `specs/crm-contact-status/spec.md`, `specs/crm-contact-drawer/spec.md` and `specs/crm-contact-comms/spec.md`, including the 390px viewport, the greyscale check, `prefers-reduced-motion: reduce`, and the mixed Hebrew/Latin/numeric rows. Report any scenario that could not be verified and why.
- [x] 8.3 Confirm nothing outside `helix-crm/` changed: `git diff --name-only` lists only paths under `helix-crm/` and `openspec/changes/crm-contact-drawer-and-status/`.
