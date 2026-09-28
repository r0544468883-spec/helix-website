## Context

See proposal.md (Why) for the motivation and the specs for the behaviour. These are the facts in the code that shape the approach, all checked on 2026-09-27:

- **Who changes a status after creation.** Only `crmUpdateContact` does, called from the drawer and the full page.
  - `POST /api/v1/crm/contacts` sets a status only when it creates a contact.
  - CHIEF creates contacts as `new`.
  - The automation engine writes `is_business` and `score`, never `status`.
  - So a history row written in that one action sees every status change there is.
- **`crm_activities.type` has no check constraint.** v13 created the column as free text, and `whatsapp` was added later without a migration. New `status` and `task` types need no DDL.
- **v20 role policies.** On `crm_activities`, `crm_tasks` and `crm_deals`, members may insert and update, and only `admin` / `agency_admin` may delete. A viewer only reads.
- **The service-role client is configured in production** (`SUPABASE_SERVICE_ROLE_KEY` in `apphosting.yaml`). `crmCreateContact` already uses it for automations.
- **`hasOpenDeal` is never passed.** `scoreContact` supports it, but none of the four rescoring paths (`crmUpdateContact`, `crmLogActivity`, `/api/v1/crm/activities`, the automation `score` node) passes it. Deal writes (`crmCreateDeal`, `crmMoveDeal`) never rescore anyone.
- **`.hm-material` sets `backdrop-filter`** (`lib/motion/tokens.css`). Inside the drawer panel, a `position: fixed` child is laid out against the panel, not the viewport. `CrmNavMenu` hit this and portals its drawer to `<body>`.
- **The drawer panel is `min(420px, 86vw)` wide with 22px padding.**
  - At 1440px that leaves 376px, so each of seven steps with 4px gaps is about 50px wide.
  - At 390px it leaves 291px, so each step would be about 38px, under the 44px rule.
- **The home queue picks each contact's task ordered by `due_date` only.** Tasks with equal dates tie in an unspecified order, so without a second key the drawer and the home row could name different next steps.
- **`lib/i18n` has no plural helper.** Hebrew day counts need `יום אחד` / `יומיים` / `N ימים`.

## Goals / Non-Goals

**Goals:**
- No database migration: every new thing lives in existing tables and columns.
- One status component, used by the drawer and the full page.
- One server-side path for a status change, which writes the status, its legacy mirror, the score and the history row.
- One rescore helper, so no path can drop a signal again.
- Every new client write races a 15-second timeout and guards against a double press, as the board and the email send already do.

**Non-Goals:**
- No transaction across the status update and its history row. Supabase JS cannot open one without a SQL function, and adding one would be a migration. See Risks.
- No realtime sync between two open tabs. Last write wins, as before.
- No background job of any kind. Nothing here needs a scheduler.

## Decisions

### 1. Status history is a `crm_activities` row of type `status`

`crmUpdateContact` updates `status`, its legacy pair and the score, then inserts one activity: type `status`, the contact, and a body built from an i18n template in the actor's language.
- Hebrew: `{from} ← {to}`. English: `{from} → {to}`.
- The arrow lives in the template because U+2192 is not bidi-mirrored. In a right-to-left line, `→` would point backwards.
- The action returns `{ ok, activityId, previous }` for undo.

Days in status is `now − created_at` of the contact's newest `status` row. If there is none and the status is `new`, it counts from `crm_contacts.created_at`. Otherwise it is omitted. Nothing ever parses a row body.

*Rejected: a `status_changed_at` column.* It is one timestamp, not history, and it needs a migration. A DB trigger would catch every future writer, but decision 1 of `crm-contact-drawer-and-status` already kept status logic in the app rather than in two languages.

*Rejected: a `crm_status_history` table.* A migration, new RLS, and a second timeline source to merge. The timeline already exists.

### 2. A status change is not a touch

The history row is inserted directly, not through `crmLogActivity`. So `last_activity_at` is left alone, and with it the home row's last touch, the needs-a-touch rule and the recency part of the score. Eran decided this on 2026-09-27. A completed next step (decision 6) follows the same rule. `crmLogActivity` remains the only path that counts as a touch: call, meeting, note, WhatsApp and email.

### 3. Undo removes the row through the service-role client, scoped to one row

`crmUndoStatus({ locale, contact_id, activity_id, previous })` works in three steps:
1. It checks `canWrite` and restores `previous` through the user's client and RLS. That restore writes no history row and rescores the contact.
2. It deletes the history row through `createAdminClient()`. Every guard sits in the DELETE's own `WHERE`, so no earlier read can be raced:
   - `id = activity_id`
   - `workspace_id` = the session's workspace (never taken from the client)
   - `contact_id = contact_id`
   - `type = 'status'`
   - `owner_id` = the calling user
   - `created_at` within the last 60 seconds
3. If the admin client is missing or the delete removes nothing, it writes the reverse row (`{to} ← {from}`) instead. The timeline stays truthful and only loses its tidiness.

The client allows undo for 8 seconds. The 60-second server window only absorbs slow networks.

*Rejected: always write the reverse row.* A mis-tap then leaves two rows. Days in status also restarts at 0 for a person who has actually been in that status for weeks.

*Rejected: hold the row back until the undo window closes.* The row is lost if the tab dies inside the window, and it needs a flush on close, route change and `pagehide`, which a server action cannot do from `pagehide`.

*Rejected: a narrow RLS policy letting members delete their own recent `status` rows.* It is a migration, and it breaks v20's "four policies per table" verification block. That is a lot of review for a UX nicety.

*Rejected: a confirm dialog instead of undo.* It doubles the taps on every correct move to protect the rare wrong one.

### 4. Leaving the path: a reason edits the row, a return date creates a next step

`crmSetStatusReason({ locale, activity_id, reason })` takes a reason key: `price`, `timing`, `competitor` or `fit`.
- The server maps the key to its label from the dictionary, so free text never enters the body.
- It appends ` · {label}` to the user's own `status` row through the user's client. Members may update, and the guards are the same as in decision 3, without the 60-second limit.

Freezing calls the next-step action from decision 6.
- The title comes from the template `לחזור אל {name}`.
- The due date is computed on the server from `1m`, `3m` or an ISO date.
- Month arithmetic clamps to the month's last day, so 31/1 plus one month is 28/2, not 3/3.

### 5. `CrmStatusPath`: one component, two layouts, one hue

It is shared by the drawer header and `CrmContactPanel`. Props: `status`, `readOnly`, `dict`, `onChange(next)`, and an optional feedback slot the drawer fills with undo and prompts.

- **≥ `sm` (640px):**
  - An ordered row of seven `<button>` steps, `flex-1`, `min-h-[44px]`. Each is a 6px bar with a label under it that may wrap to two lines. English uses the short `csShort_*` labels.
  - The current step's bar is the status hue and its label is `STATUS_TEXT` in semibold. Passed bars share one neutral fill. Bars not yet reached are outlined.
  - The row is a `role="toolbar"` with roving `tabindex`: arrow keys move focus, Enter or Space commits. That gives one tab stop instead of nine.
  - `aria-current="step"` marks the current step.
  - The two exits are quiet text buttons after the path, like the lost action on a deal card.
- **< 640px:** the same bars without labels, wrapped in one button (`min-h-[44px]`) that opens a `Sheet` of nine 44px rows: seven steps, a divider, then the two exits.
  - The sheet goes to `document.body` through `createPortal` after mount, because of `.hm-material` (see Context).
  - While it is open the drawer ignores Escape, so Escape closes the list first.
- **Viewer:** the bars render as a plain `<ol>` with no buttons (omit, never disable).
- **Motion:** colour transitions only (`transition-colors`). Nothing on the path moves spatially.

*Rejected: chevrons.* They need direction-aware `clip-path`. Segments mirror for free under `flex` in RTL.

*Rejected: a rainbow of passed steps, each in its own hue.* Six hues fight the chip. DESIGN.md §3 makes status the one carrier of colour, and a single hue on the path keeps that true.

*Rejected: a radiogroup.* Arrow keys would commit a status (and write a history row) on every press.

### 6. The next step is the earliest open `crm_tasks` row

The ordering is `due_date asc nulls last, created_at asc`. The home query gains the second key so the drawer and the row always agree.
- `crmSetNextStep({ locale, contact_id, title, due_date? })` inserts an open task.
- `crmUpdateTask({ locale, id, title?, due_date?, done? })` updates one. `done: true` sets `status = 'done'` and inserts a `task` activity (`בוצע: {title}`) directly, with no touch (decision 2).
- The drawer receives the contact's open tasks: the first is shown, the rest are counted.

*Rejected: a `next_step` column on `crm_contacts`.* A migration, and it would hide the tasks that automations already create and the home row already shows.

### 7. One rescore helper, server-only

`lib/crm-rescore.ts` exports two functions. Both take `client` as a parameter, because the automation engine runs on the admin client.
- **`loadScoreInputs(client, workspaceId, contactId)`** reads the scoring fields and whether an open deal exists (`crm_deals`, `status = 'open'`, limit 1), both in parallel. Callers that also change the contact compute `scoreContact({ ...inputs, ...change })` and store the score in the same update as the change, so a status and its legacy mirror still move in one statement. These are `crmUpdateContact`, `crmUndoStatus`, `crmLogActivity` and `/api/v1/crm/activities`.
- **`rescoreContact(client, workspaceId, contactId)`** loads, computes and stores the score alone. It serves writes that change a deal rather than the person (`crmCreateDeal`, `crmMoveDeal`) and the automation `score` node.
- The three creation paths keep calling `scoreContact` directly: a new contact has no deal.

*Rejected: a trigger that recomputes the score.* It would put the points table in SQL and TypeScript again, which v19's design rejected for the same reason.

*Rejected: querying deals inside `scoreContact`.* It is a pure function that client components import. It stays free of I/O.

### 8. Crossing prompts are client-side, after a successful save

The drawer already holds the contact's deals with their `status`. After a status save succeeds, it checks:
- `proposal` with no open deal: offer to open one.
- `signed` with exactly one open deal: offer to mark it won.
- `signed` with more than one: state the count.

After a deal is marked won while the person is before `signed` in `CONTACT_STATUSES` order, it offers to move them. Accepting calls the same actions as the manual controls. A prompt sits in the header's feedback line under the undo line. It is replaced by the next change and gone when the drawer closes. No server code decides anything.

*Rejected: syncing status and deals on the server.* DESIGN.md §16 rejected a badge that moves by itself.

*Rejected: an automation rule.* Nothing dispatches `contact.updated` today.

### 9. Deals in the drawer reuse the board's actions

- **New deal:** the drawer's form calls `crmCreateDeal` with `contact_id`.
  - It validates before sending: title required, value empty or a finite number ≥ 0.
  - The server validates value the same way, which also closes the board's `Number(x) || 0` hole.
- **Stage and won:** these go through `crmMoveDeal`, optimistically, with the board's 15s race.
- **Lost:** it asks first with the board's `lostAsk` / `lostYes` strings in the same `Dialog`.
- **Title and value:** a new `crmUpdateDeal({ locale, id, title?, value? })`.
- **Layout:** one deal is expanded at a time.

### 10. A deal card leads to its person

- The card's title becomes a `<Link href="?c=<contact_id>" scroll={false}>`. That gives keyboard access, middle-click and copy-link.
- A tap elsewhere on the card calls `router.push` for the same URL, but only if the gesture never armed a drag.
- An armed drag sets a flag that a capture-phase click handler uses to cancel the click that follows `pointerup`.
- A vertical swipe is left to the browser by `touch-action: pan-y`. It ends in `pointercancel`, which already clears the drag and produces no click.
- `Deal` gains `contact_id`, which the home query already selects. A deal without one gets no link and no tap handler.
- The command palette pushes `/dashboard/crm?c=<id>` for contacts, and `?c=<contactId>` for deals that have one.

### 11. Five action buttons, per-box drafts, one dirty check

The drawer holds `openBox: 'whatsapp' | 'email' | 'call' | 'meeting' | 'note' | null`, plus one draft string per box. The next-step and new-deal forms carry their own drafts. The existing `dirty` check, which today covers the email box only, becomes "any draft non-empty". So Escape, the scrim and the close control all ask before discarding.

Call, meeting and note save through `crmLogActivity`, which is the touch. The WhatsApp box keeps its message field and deep link, and still logs "WhatsApp opened" on click.

### 12. A plural helper for day counts

`plural(locale, n, forms)` in `lib/i18n` uses `Intl.PluralRules`. Hebrew forms: `zero` (`מהיום`), `one` (`יום אחד`), `two` (`יומיים`), `other` (`{n} ימים`). English forms: `today`, `1 day`, `{n} days`. It is built so the home figures line's `1 אנשי קשר` can use it later. That fix is not in this change.

## Risks / Trade-offs

- **[Risk] A status change can store without its history row** if the insert fails after the update succeeds. The two statements run on one connection under the same RLS, so it is rare. → The action still returns ok, since the stored status is what matters, and logs the failure. Days in status then counts from the previous row. A SQL function would make it atomic, and it is the first thing to add if this ever shows up in logs.
- **[Risk] The undo's delete uses the service-role client from a user action.** → The guards live inside the DELETE's `WHERE`: own row, own workspace (resolved on the server), this contact, type `status`, under 60 seconds. It cannot remove anything else. When it removes nothing, it falls back to the reverse row.
- **[Risk] A future status writer could skip the history row.** Candidates are an API PATCH, an automation action or CHIEF. → Status changes go through one server function (decision 1), and its doc comment says so. A writer that bypasses it breaks days in status for that contact only.
- **[Risk] Short English labels might still clip at 50px.** "Contacted" is the widest. → The label row allows two lines at `text-[11px]`. Task 6.2 checks both languages at 1440×900 before sign-off.
- **[Trade-off] Status and task rows appear in `GET /api/v1/crm/activities`.** Integrations that list activities will see two new `type` values. → No field changes. The values are documented in the route's comment.
- **[Trade-off] Days in status is blank for contacts whose status was last changed before this ships.** → That is intended by the spec ("omitted rather than guessed"). It fills in with the next change.
- **[Trade-off] Rows are written in the actor's language.** A Hebrew row stays Hebrew when the interface switches to English. WhatsApp rows already behave this way.

## Migration Plan

There is no database migration and no change to the build or deploy pipeline. `helix-crm/` deploys on its own App Hosting backend with `firebase deploy --only apphosting:helix-crm`. The marketing site's static Hosting export is unaffected, because it excludes `helix-crm/`.

1. Land the rescore helper and the server actions first (section 1 of tasks.md). They change no screen, so they can deploy alone. From that deploy on, every rescore keeps the open-deal points.
2. Land the UI in the order of tasks.md. Every task leaves the build green.
3. Deploy, then run the production checks in task 6.3.

**Rollback:** redeploy the previous App Hosting revision.
- The `status` and `task` rows written meanwhile stay in `crm_activities`. The old timeline renders them with their raw type name and a readable body.
- They can be removed with one statement if wanted: `delete from crm_activities where type in ('status','task') and created_at > '<deploy time>'`.
- Tasks created as next steps are ordinary `crm_tasks` rows, and the old home row already shows them.
