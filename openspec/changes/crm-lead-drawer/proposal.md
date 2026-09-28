## Why

Eran opens a lead in the contact drawer to do three things: see where the relationship stands, move it forward, and put money on it when money appears. The drawer makes each one harder than it should be. The status sits under the header as a chip beside a nine-option dropdown, so the screen never shows where the person is on the way from `ליד חדש` to `לקוח פעיל`, and it scrolls away with the timeline. The person's deals are read-only rows that disappear when there are none. Opening a deal for them means closing the drawer, scrolling to the board, pressing "+ עסקה חדשה" and finding the person again in a dropdown of up to 200 names. A phone call, the most common touch, can only be logged on the full contact page. Nothing in the product can create a next step, although the home queue already shows one per person. A status change leaves no trace, so the CRM cannot say when someone signed. Tracing the deal path also turned up a scoring bug: an open deal is meant to add 20 points to a person's score, the v19 migration applied that, and every rescore in the app since then drops it again, because no caller passes `hasOpenDeal` to `scoreContact`.

**Surface: `helix-crm/` only.** No database migration, no new API route, no new dependency, and nothing on the marketing site. This change modifies the drawer, status and comms specs that were synced into `openspec/specs/` from `crm-contact-drawer-and-status` on 2026-09-27.

## What Changes

- **The header names the person and where they stand.** The drawer header holds the name with the status chip beside it (the same pairing as the list row), role · company, and how long the person has been in that status. It stays in view while the rest of the drawer scrolls.
- **A clickable status path replaces the dropdown.**
  - The seven progress statuses render as a path from `ליד חדש` to `לקוח פעיל`, starting at the right in Hebrew. Tapping a step moves the person there. A line then offers undo for 8 seconds.
  - Only the current step carries its status colour.
  - `נדחה` and `בהקפאה` are exits beside the path, not steps on it. Declining asks for an optional one-word reason. Freezing asks when to come back and schedules that as the next step.
  - Below 640px the path becomes one control that opens a sheet listing all nine statuses.
  - A viewer sees the path with no controls.
  - The full contact page uses the same path in place of its dropdown, so the product has one status control.
- **Deals are opened and worked from the person.**
  - "+ עסקה חדשה" in the drawer creates a deal already attached to this person.
  - A deal row opens in place to change its stage, title and value, or to mark it won or lost. Lost asks first, as it does on the board.
  - A deal card on the board opens its person's drawer.
  - The command palette opens a contact, or a deal's person, in the drawer instead of the full page, so every way into a person lands where these controls are.
- **Status and deals meet at two points, and the CRM asks rather than moves.**
  - Moving a person to `הצעה נשלחה` with no open deal offers to open one.
  - Moving a person to `חתם` with one open deal offers to mark it won.
  - Marking a deal won while its person is before `חתם` offers to move them there.
  - Nothing moves by itself (DESIGN.md §16).
- **Touches are logged where you work.** Call, meeting and note join WhatsApp and email as a row of buttons in the drawer. Each opens its own box in place, one at a time. Today two compose boxes are always open.
- **Each person has a next step.** The drawer sets the next step with an optional due date, lets Eran change it, and marks it done. It is a `crm_tasks` row, so it shows on the home row's task line with the same overdue mark.
- **Status history.**
  - Every status change writes a timeline row (`יצרנו קשר ← בשיחה`). The header's days-in-status comes from that row.
  - A completed next step writes a row too.
  - Neither is a touch: they do not refresh the last-touch time, the needs-touch mark or the recency part of the score (Eran's decision, 2026-09-27).
- **The score keeps an open deal.** Every rescore counts an open deal again. Opening, winning or losing a deal rescores its person.

## Capabilities

### New Capabilities
- `crm-contact-deals`: a person's deals, worked from the person. Covers:
  - opening a deal already attached to them
  - changing its stage, title and value in place
  - winning or losing it
  - the prompts where status and deals meet
  - the board card and palette entry that open the deal's person
- `crm-next-step`: one visible next step per person, which is set, changed and completed from the open contact and feeds the home queue's task line.

### Modified Capabilities
- `crm-contact-drawer`:
  - The header gains the status chip and days in status, and stays in view.
  - The status control becomes the path.
  - The deals region shows for a writer even when empty.
  - Logging buttons and the next step join the drawer.
  - The command palette opens contacts in the drawer.
- `crm-contact-status`:
  - The status is set on a seven-step path with two exits.
  - A change can be undone for 8 seconds.
  - Each change is recorded on the timeline and is not a touch.
  - Declining and freezing ask a follow-up question.
  - The score counts an open deal on every rescore.
- `crm-contact-comms`:
  - Calls, meetings and notes are logged from the drawer.
  - WhatsApp and email each wait behind a button instead of always-open compose boxes.

## Impact

**Drawer and contact page:**
- `components/CrmContactDrawer.tsx` (restructured: fixed header, scrolling body).
- `components/CrmContactPanel.tsx`: the path replaces the dropdown.
- `app/[locale]/(crm)/dashboard/crm/page.tsx`: the drawer also loads the person's open tasks, their latest status row and their `created_at`.
- `app/[locale]/(crm)/dashboard/crm/[id]/page.tsx`.
- New components for the status path, the drawer's deal rows and the next step.

**Board and palette:**
- `components/CrmDealBoard.tsx`: a card opens its person, and the deal type gains `contact_id`.
- `components/HelixCommandBar.tsx`: contacts and deals open `?c=<id>`.

**Server actions (`app/crm-actions.ts`):**
- A status change writes its history row and returns its id.
- New actions:
  - undo a status change
  - attach a decline reason
  - set and update a next step
  - update a deal's title and value
- Creating and moving a deal rescores its person.
- One shared rescore helper replaces the four places that rescore an existing contact today: two in this file, `app/api/v1/crm/activities/route.ts`, and the automation `score` node in `lib/automations/engine.ts`. The three paths that create a contact stay as they are, because a new contact has no deal yet.

**Data:** no migration.
- `crm_activities.type` has no check constraint, so `status` and `task` rows need none.
- `crm_tasks` has existed since v13, under the v20 role policies: members insert and update, and only admins delete.
- Undoing a status change removes the history row it wrote through the service-role client. That removal is limited to the same user's own `status` row for the same contact, written in the last 60 seconds (design.md, decision 3).

**Public API:** `GET /api/v1/crm/activities` will also return rows of type `status` and `task`. No existing field changes.

**i18n:** `lib/i18n/he.ts` and `en.ts`:
- path labels, with short English ones for the bar
- the undo line, decline reasons and return-date options
- the next step, the logging buttons and the crossing prompts
- `at_status` and `at_task`

**Docs:** `helix-crm/DESIGN.md` §3, §8, §9, §10 and §12 change in the same commits as the code.

## Non-goals

- **No deal page.** A deal opens in place inside its person's drawer. A standalone deal page waits until a deal holds more than a title, a value and a stage.
- **No change to the status set, the deal stages or the score weights.** Nine statuses, six stages plus lost, the same points.
- **No status derived from deals, and no deals derived from status.** The CRM asks at the crossing points and never moves either by itself.
- **No next/previous navigation between contacts in the drawer.** Eran deferred it on 2026-09-27.
- **No task screen and no reminders.** The next step appears in the drawer and on the home row, and nothing notifies. Due-date reminders need the digest job, which does not run yet.
- **No people-by-status kanban.** DESIGN.md §16 keeps that question open.
- **No change to how WhatsApp and email work.** The same deep link, send path and hourly cap apply. Only where their controls sit changes.
- **No redesign of the full contact page** beyond swapping its status dropdown for the shared path.
