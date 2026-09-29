## Context

See proposal.md (Why) for the four problems. The current state that shapes the approach:

- **Overlays.** `lib/motion` has three overlay primitives, `Drawer`, `Sheet` and `Dialog`, plus `CommandPalette`. Each renders where its consumer puts it. There are seven consumers:
  - Three portal to `<body>` themselves: the status list (`CrmStatusPath`), the side menu (`CrmNavMenu`) and the drawer's lost-deal question (`CrmDrawerDeals`). They do it because the drawer panel and the nav use `backdrop-filter`, which makes an element the containing block of its fixed children.
  - Four don't portal: the contact drawer, its discard question, the add-contact sheet and the board's lost-deal question. They render inside `app/[locale]/(crm)/layout.tsx`'s `relative z-10` wrapper. The drawer asks for `z-60`, but that only counts inside the wrapper's `z-10`. The sticky nav (`z-50`, outside the wrapper) paints over the drawer's top 64px.
  - The `z-10` was copied from the STAGE layout, which lifts its page above floating logos. The CRM has no layer below its page, so the class does nothing there except trap overlays.
- **Stacking today:** Drawer and Sheet scrim `50` / panel `60`, Dialog and ⌘K `60` / `70`. The status list lifts itself with a `z-70` wrapper around its portal.
- **The drawer's data** comes from the CRM home page's server query when `?c=<id>` is set. It already loads the deals and open tasks. It doesn't load `company_id`, `source`, `notes`, `last_activity_at` or `is_business`. The page already loads the workspace's companies for the add-contact sheet.
- **No action edits a contact's fields.** `crmUpdateContact` takes only `status`. `crmCreateContact` shows the conventions a details save must follow:
  - trim, and store empty as `null`;
  - lowercase the email;
  - derive `is_business` with `enrichEmail`;
  - score with `scoreContact`.
- **The score's explanation exists but is unused.** `scoreReasons()` in `lib/crm-score.ts` has hard-coded Hebrew, names only 4 of the 8 signals, and nothing calls it.
- **Client workspaces.** `crmCreateClientWorkspace` lets an `admin` or `agency_admin` of the active workspace create a child, even when the active workspace is itself a client. `listAccessibleWorkspaces` resolves only one level of agency → client, so a grandchild would show up oddly. The switcher's add action uses `window.prompt` / `window.alert` with Hebrew in the component (DESIGN.md §15 rows 4 and 5).

## Goals / Non-Goals

**Goals:**
- No overlay can be trapped under the nav again, whoever builds the next one and wherever they mount it.
- One stacking order, written down, that doesn't depend on mount order.
- Details and the edit form share one rule set on the client and the server, with the server authoritative.
- Every new string goes through `lib/i18n`, including the score signals.

**Non-Goals:**
- No change to the full contact page, the public API, the automation engine or the database schema.
- No shared form library. The edit form follows the drawer's existing controlled-input pattern (`CrmNextStep`, `CrmAddContact`).

## Decisions

### 1. The overlay primitives portal themselves

`Drawer`, `Sheet`, `Dialog` and `CommandPalette` render through `createPortal(…, document.body)` once mounted, and render nothing on the server. That happens in a shared `Portal` wrapper, and each primitive's body mounts inside it, so its spring effects always find their elements. The three consumers that portal today drop their own `createPortal` and `mounted` state. The CRM layout drops `relative z-10` from both wrappers.

Rejected:
- **Only removing `z-10`.** It fixes the reported case but not the `backdrop-filter` trap. An overlay mounted inside the drawer panel or the nav still positions against that element, which is why three consumers already portal.
- **Portaling the four remaining consumers one by one.** That is the pattern that produced this bug: four of seven consumers didn't do it. A rule each consumer must remember fails the next time.
- **Raising the drawer's `z-index`.** No value escapes the parent stacking context.

A closed overlay already renders parked (`visibility: hidden`, `inert`). Rendering nothing on the server still meets `crm-overlays` "A closed overlay is not visible" from the first paint. For a `?c=` link, the drawer's content now enters the DOM at hydration instead of in the HTML. It was invisible until its spring ran either way. Its data is still fetched on the server and passed as props, so this adds no request.

### 2. One stacking order

| Layer | Scrim | Panel |
|---|---|---|
| Nav (sticky top bar) | — | 50 |
| `Drawer`, `Sheet` | 60 | 61 |
| `Dialog`, and a `Drawer` or `Sheet` with `nested` | 70 | 71 |
| `CommandPalette` | 80 | 81 |

`Drawer` and `Sheet` take a `nested` prop for "opened from inside another overlay". The status list uses it, replacing its `z-70` wrapper, which can't wrap a primitive that portals itself. A `Dialog` always sits in the upper tier: every dialog today is a question asked over a page or a drawer.

Rejected: ordering by DOM position with equal z-indexes. The portal order depends on mount order, and a `?c=` load mounts the drawer and its children in one commit.

### 3. Details: one region, read then edit

`components/CrmContactDetails.tsx` is the first region of the drawer's body, in place of the bare email, phone and LinkedIn lines.
- **Read mode** is a `<dl>` (`grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-[13px]`), with labels in `text-ink-muted`. Each value takes its own direction:
  - `dir="ltr"`: phone, email, LinkedIn, and an unknown source;
  - `dir="auto"`: name, role, company and background.
  - Background keeps its line breaks (`whitespace-pre-line`).
- **The empty-fields line** is writer-only. It is a text button that opens edit mode with the first empty field focused.
- **Edit mode** is one form, one save and one cancel, following the add-contact sheet's fields. Company is a `Select` of the workspace's companies plus "none".
- **The header loses the score chip.** The score moves into the details with its tier word and signals.

The `notes` column is labelled `רקע`, not `הערות`. The action row already has `הערה`, which writes a timeline entry, and two things called "note" that behave differently would be read as one. `רקע` says what the field holds: who the lead is and what they need, written once and edited, not logged.

Rejected: HubSpot-style inline editing of one value at a time. It means a save per field, a failure state per field and a focus dance per row, all for a form edited now and then. The drawer's other forms are one form with one save.

### 4. One validation module, the server decides

A client-safe `lib/crm-contact-fields.ts` exports the limits and `validateContactDetails(input) → { ok } | { field, code }`:
- **Limits:** name 120, role 120, source 60, phone 30, email 254, LinkedIn 300, background 2,000.
- **Email:** the invite pattern `^[^\s@]+@[^\s@]+\.[^\s@]+$`.
- **LinkedIn:** `new URL()` with protocol `http:` or `https:`.

The form runs it before sending, so most mistakes show without a round trip. The server runs it again.

`crmUpdateContactDetails` in `app/crm-actions.ts` does, in order:
1. Checks `ctx()` and `canWrite`.
2. Validates.
3. Checks that `company_id`, if given, is a company of the active workspace.
4. Re-derives `is_business` from the email.
5. Rescores. It reads the row with `loadScoreInputs` (status, last touch and open deal) and overlays the edited fields, so the score folds in every signal as `crm-contact-status` requires.
6. Updates `.eq('id').eq('workspace_id')` with `.select('id')`. Zero rows returns `notfound`, which is how a contact from another workspace is refused.
7. Revalidates the CRM home.

It writes no activity and leaves `last_activity_at` alone. A refusal returns `{ error: 'invalid', field, message }`, with the message from the dictionary, and the form puts it under that field.

A `safeHttpUrl()` helper decides whether LinkedIn renders as a link. That covers values that arrived before this change, through the public API. Rejected: cleaning stored values in a migration. Nothing breaks if a bad value stays, as long as it is never a link.

### 5. Score signals, not reasons

`scoreReasons()` is replaced by `scoreSignals(input) → SignalKey[]`, in a fixed order:
- `business_email`
- `company`
- `phone`
- `linkedin`
- `open_deal`
- `status`
- `recent_7` or `recent_30`

The drawer maps each key through the dictionary (`scoreSignal_*`), and the status signal uses the status label. The signals are computed on the server with the drawer's other derived text, so they use one clock.

The number shown is the stored score. The signals are computed at render time, so they can disagree on recency until the next rescore. Every touch, status change and deal event rescores.

Rejected:
- **Rescoring on open.** That is a write on every read.
- **Showing a fresh score beside the stored one.** Two numbers for one person, while the list sorts by the stored one.
- **Showing points per signal.** The per-signal points wouldn't add up to the shown score whenever recency has gone stale.

### 6. "הצעד הבא" becomes "תזכורת" in words, not in code

The dictionary keys stay `nextStep*`, with new values. Renaming the keys would touch every consumer for no change in behaviour. DESIGN.md and the component's comment say "reminder".
- **The empty state** is the additive brand-tinted button "+ תזכורת", the same treatment as "+ עסקה חדשה".
- **The form** is the existing one, plus three quick-pick chips. They use the header feedback line's chip style, with off `border-border` and on `border-brand text-brand-ink bg-brand/10`.
- **The third pick reads "בעוד שבוע", not "בשבוע הבא".** "בשבוע הבא" could mean next Sunday or seven days from now. "בעוד שבוע" can only mean seven days.
- **The chosen chip is derived**: it is the one whose date equals the draft's due date. Typing a different date in the field unmarks it.
- **Dates** come from `addDaysIso(todayInIsrael(), n)`, a new helper in `lib/crm-dates.ts` that uses the same UTC-noon arithmetic as `addMonthsIso`. It runs on the client at the moment of the pick, in Israel's zone, so 01:30 on 1/10 gives 2/10 for "מחר".
- **The icon** is lucide `Bell`, in the drawer and on the home row's task line, so the same word and mark appear in both places.

### 7. The offer after a logged call or meeting

The drawer holds `offerReminder` state. It becomes true when `crmLogActivity` returns ok for `call` or `meeting` and the contact has no open task. It resets when the contact changes or the drawer closes. `CrmNextStep` gets an `offered` prop: the form opens with the "מה הלאה?" line, its title field focused, and "לא עכשיו" in place of cancel. The existing dirty rule (a non-empty title) already makes an untouched offer free to close.

Rejected:
- **Creating a reminder automatically.** Nothing in the CRM moves by itself (DESIGN.md §8, header feedback line). The CRM asks.
- **Offering after notes, WhatsApp and email.** A note is often a mid-conversation jotting. WhatsApp and email are sent without a known outcome.

### 8. Client workspaces

- **The switcher** returns `null` below two workspaces and loses its add action. Its rows get `min-h-[44px]`. The home computes `switcherShown = workspaces.length > 1`.
- **The Team page** passes the new `CrmClientWorkspaces` card two things:
  - `clients`: the accessible workspaces whose `parentWorkspaceId` is the active one;
  - `canAddClients`: `isAdminRole(role)` and the active workspace has no parent.
- **After an add,** the card lists the new client, with an outline button that calls `crmSetActiveWorkspace` and navigates to the CRM home.
- **`crmCreateClientWorkspace`** adds three checks: `isAdminRole`, an active workspace with no parent, and a name of 1 to 80 characters. It returns dictionary messages and revalidates the Team page too.

"Admin" keeps meaning `admin` or `agency_admin`, as it does for the create action today. Rejected: `admin` only, which would take the ability from an `agency_admin` invited into a top-level workspace.

### 9. The figures line

`plural(locale, n, { one, two, other })`, with the helper `lib/i18n` already exports, and three dictionary keys. English sets `one: '1 contact'`.

## Risks / Trade-offs

- **[A stacking regression somewhere else]** Moving every overlay to `<body>` changes what sits above what. → The only other fixed CRM elements are the `z-10` click-catchers of the switcher and the new-automation menu, which stay below the nav. The STAGE-only floating elements (`z-90`, `z-100`) are never on a CRM screen. The verification task walks every overlay, including the side menu below `lg`.
- **[Styles that depended on the wrapper]** A portaled overlay no longer inherits from `<main>`. → Theme tokens sit on `<html data-theme>` and `dir`/`lang` on `<html>`, so both still reach `<body>`. The drawer passes `dir` itself. The material classes are global.
- **[Stale recency in the signals]** See decision 5. It is accepted, and any touch corrects it.
- **[Two people edit one contact]** The last save wins, with no warning. At today's team size this is accepted and listed as a non-goal.
- **[Keys named `nextStep` hold "תזכורת"]** This could confuse a reader of the code. → A comment in the dictionary, and DESIGN.md's block is titled Reminder with the file name.
- **[Existing grandchild workspaces]** A client created inside a client before this change can't be read from production here (reads are blocked). → Only new creates are refused. Reads and switching are unchanged, so nothing that exists stops working.
- **[Verifying layering in the automation tab]** A hidden automation tab never runs animation frames, so the drawer never slides in and geometry reads zero. That is how this bug passed two production walks. → Verify the layering in a visible, focused window. If that isn't possible, ask Eran for a screenshot at 1440×900 and at 390×844, and say which checks rest on his screenshots.

## Migration Plan

- **No database migration.** `notes` and `source` exist on `crm_contacts`, and no column or policy changes.
- **Deploy** with `firebase deploy --only apphosting:helix-crm` from `helix-crm/`. The marketing site's static Hosting export and its App Hosting backend are untouched, since `helix-crm/` builds and deploys on its own.
- **Rollback** is the previous App Hosting revision. Nothing is written in a new shape: the details save writes existing columns with the values the add form already writes.
