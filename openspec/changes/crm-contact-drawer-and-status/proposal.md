## Why

Eran opens the CRM to answer one question about a person — where do we stand, and what do I do next — and the CRM makes him assemble the answer himself. A contact's state is spread across two dropdowns that overlap (`lifecycle_stage` with five values, `lead_status` with four, twenty combinations for one person, two of them named `mql` and `sql`), and the only coloured badge on a row is a `hot/warm/cold` tier computed from a score, so there is no status he can actually set and see at a glance. Answering the question costs a full page navigation away from the list, and once he is there and knows what to do, the CRM cannot do it: there is no WhatsApp anywhere in the product, and the contact's email is a plain `mailto:` link that leaves no trace on the timeline. He is running an Israeli SMB practice where most conversations happen on WhatsApp, so the tool he built for himself is the slowest way to reach anyone.

**Surface: `helix-crm/` only.** No file outside `helix-crm/` changes. No public-site route, no `/app/api/*` route on the marketing site.

This change sits on top of `simplify-crm-shell-and-board`, which introduced the `(crm)` route group, `CrmContactList`, and `lib/crm-tier.ts`. That change must land first.

## What Changes

- **One status per contact.** A new `crm_contacts.status` column becomes the single thing that describes a person: `new → contacted → talking → proposal → signed → paid → client`, plus the terminal states `declined` and `frozen`. Each value has its own colour. The two existing dropdowns collapse into one control.
- **The old columns stay, written automatically.** `lifecycle_stage` and `lead_status` are derived from `status` on every write and never edited by hand again. They are read by the public `/api/v1/crm/*` routes, by CHIEF, and by stored automation condition graphs, so removing them would break contracts outside this change's control.
- **Status owns colour; the score stops competing for it.** The contact row currently shows three signals — a tier-coloured score badge, the word hot/warm/cold, and a grey stage chip. It becomes a neutral score number plus one coloured status chip. The `hot/warm/cold` word is removed from the row (it stays available on the contact page). Without this the same row asserts two contradicting colours, for example a "cold" person who is a paying client.
- **A right-side drawer replaces the round trip.** Clicking a contact in the list opens a drawer over the list, addressed as `?c=<id>` on the CRM home URL, so the browser back button closes it and the link is shareable. The drawer shows the status chip as an editable control, the contact's details, their deals, and their timeline. `/dashboard/crm/[id]` stays as the full page for direct links and as the no-JS fallback.
- **WhatsApp, for the first time in the product.** A button in the drawer opens WhatsApp with the message pre-filled via a `wa.me` deep link, normalising Israeli numbers (`054-123-4567` → `972541234567`). Eran presses send in WhatsApp. No Meta Business account, no template approval, no per-message cost.
- **Email that the CRM remembers.** A compose box in the drawer sends a 1:1 email through Resend on the already-verified `helix.co.il` sender and writes it to the contact's timeline. Send-only: replies arrive in Eran's inbox, not the CRM.
- Both actions log a `crm_activities` row and refresh `last_activity_at`, so reaching out updates the score the same way logging a call does today.
- **BREAKING (internal only):** `crmUpdateContact` stops accepting `lifecycle_stage` and `lead_status` from callers and accepts `status` instead. Both callers are in this repo. The public `/api/v1/crm/contacts` route keeps accepting the old field names.

## Capabilities

### New Capabilities
- `crm-contact-status`: the single status field on a contact — its values, their ordering, their colours, how it is set, and how the legacy columns and the lead score stay consistent with it.
- `crm-contact-drawer`: opening a contact beside the list instead of navigating away — URL addressing, what the drawer shows, keyboard and back-button behaviour, and the full-page fallback.
- `crm-contact-comms`: reaching a contact from inside the CRM — the WhatsApp deep link with Israeli number normalisation, the 1:1 email send, and the activity each leaves behind.

### Modified Capabilities
None. No spec exists under `openspec/specs/` yet; `openspec list --specs` returns an empty set, so there is no durable capability whose requirements this change alters.

## Impact

**Database (`helix-crm/supabase/`)** — new `migration-v19-contact-status.sql`: adds `crm_contacts.status` with a check constraint and a default, backfills it from every existing `(lifecycle_stage, lead_status)` pair, recomputes `score`, and adds an index for ordering by status. No table is dropped and no column is removed.

**Server actions (`helix-crm/app/crm-actions.ts`)** — `crmUpdateContact` switches to `status`; `crmCreateContact` accepts `status`; two new actions for sending the 1:1 email and for logging a WhatsApp touch.

**Scoring (`helix-crm/lib/crm-score.ts`)** — `scoreContact` takes `status` instead of the two old fields. The status→points table is chosen so that a contact's score does not move during the backfill unless the two old fields contradicted each other.

**Public API (`helix-crm/app/api/v1/crm/contacts/route.ts`, `.../activities/route.ts`)** — keeps accepting and returning `lifecycle_stage` and `lead_status` unchanged, and additionally accepts and returns `status`. Existing API-key integrations keep working with no edit.

**CHIEF and automations (`helix-crm/lib/chief/`, `helix-crm/lib/automations/`)** — read the legacy columns, which stay in sync, so both keep working untouched. `status` is added to the automation condition field list so new automations can use it.

**UI (`helix-crm/components/`, `helix-crm/app/[locale]/(crm)/dashboard/crm/`)** — `CrmContactList` rows gain the status chip and lose the tier word; a new drawer component; `CrmContactPanel` collapses two selects into one; new status colour map beside the existing `lib/crm-tier.ts`.

**Design doc (`helix-crm/DESIGN.md`)** — the status colour palette, the chip pattern, and the drawer's placement are system-level additions and ship in the same commit, per the standing design-doc rule.

**i18n (`helix-crm/lib/i18n/he.ts`, `en.ts`)** — nine status labels plus drawer and comms strings, in both dictionaries.

**Dependencies** — none added. Resend is already a dependency; WhatsApp is a URL.

## Non-goals

- **Not the WhatsApp Cloud API.** No sending without Eran pressing send, no delivery receipts, no inbound replies. That needs a verified Meta Business account, approved message templates for anything outside a 24-hour reply window, and per-message fees.
- **Not email threading or an inbox.** Replies go to Eran's mailbox. The CRM does not read mail.
- **Not deriving a contact's status from its deals.** The status is set by hand. Deals are listed in the drawer as money attached to the person and do not move the badge — an explicitly rejected alternative, recorded in design.md.
- **Not a people-by-status board.** The deal board and its drag-and-drop stay exactly as they are. The status is a chip in the list and in the drawer.
- **Not firing automations on a status change.** `contact.updated` exists as a trigger kind but nothing dispatches it today, and wiring it is a separate concern.
- **Not removing `lifecycle_stage` or `lead_status`.** They stop being editable, not stored.
- **Not touching roles or RLS.** Every workspace member can still delete any contact. That is `crm-team-roles`, a separate change, because it edits live Supabase policies and carries a different risk.
- **Not paging past the existing 200-contact cap**, and not touching companies, tasks, CHIEF, the email campaign product, or the API-key screens.
