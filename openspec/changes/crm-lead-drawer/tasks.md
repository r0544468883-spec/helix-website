## 1. Score, history and actions on the server (no screen changes; can deploy alone)

- [x] 1.1 Add `helix-crm/lib/crm-rescore.ts` with `loadScoreInputs()` and `rescoreContact()` (design decision 7), and route the four rescoring paths through them: `crmUpdateContact`, `crmLogActivity`, `app/api/v1/crm/activities/route.ts`, and the `score` node in `lib/automations/engine.ts`. Make `crmCreateDeal` (when it has a `contact_id`) and `crmMoveDeal` rescore the deal's contact. Verify:
  - `cd helix-crm && npx tsc --noEmit` passes.
  - A scratch `npx tsx` check prints 65 for `scoreContact({ status: 'talking', phone: 'x', hasOpenDeal: true })` and 45 without the deal.
  - `grep -rn "scoreContact(" helix-crm/app helix-crm/lib` shows each existing-contact rescore computing from `loadScoreInputs()`, plus the three contact-creation paths and the helper.
  - Done 2026-09-28: tsc exits 0; the scratch check printed 65 and 45; grep shows `crm-actions.ts` lines 206 and 260 and `activities/route.ts` line 60 computing from `loadScoreInputs`, the engine calling `rescoreContact`, and the creation paths at lines 179, 78 and 47.
- [x] 1.2 Make `crmUpdateContact` insert a `status` activity after the update (design decision 1: i18n template in the actor's locale, `←` in Hebrew and `→` in English) and return `{ ok, activityId, previous }`. It must not touch `last_activity_at`. Add `crmUndoStatus` (decision 3: admin-client delete guarded in the `WHERE`, reverse-row fallback) and `crmSetStatusReason` (decision 4: reason keys mapped to labels on the server). Verify:
  - `npx tsc --noEmit` passes.
  - On `http://localhost:3100/he/dashboard/crm`, changing a status with the existing dropdown adds one timeline entry reading `{from} ← {to}`.
  - That contact's home row keeps its last-touch text.
  - Done 2026-09-28: tsc exits 0. A scratch render of the row text gives `יצרנו קשר ← בשיחה`, `Contacted → In conversation` and `בשיחה ← נדחה · מחיר`, matching the specs. The two browser checks move to 6.2: this machine has no signed-in local session (invite-only magic link).
- [x] 1.3 Add `crmSetNextStep` and `crmUpdateTask` (decision 6: `done` writes a `task` activity `בוצע: {title}` directly, with no touch). Add `crmUpdateDeal` for title and value. Reject a value that is not a finite number ≥ 0 with `invalid`, in both `crmCreateDeal` and `crmUpdateDeal`. Give the home page's open-tasks query `created_at asc` as its second order key. Verify:
  - `npx tsc --noEmit` and `npm run build` both exit 0.
  - Done 2026-09-28: both exit 0.
    - The date helpers moved to `lib/crm-dates.ts` so they can be tested. A scratch check passed: 27/9 plus 3 months gives 27/12; 31/1 plus a month gives 28/2 (29/2 in 2024); 2026-02-30 is rejected; 22:30 UTC on 27/9 is 28/9 in Israel.
    - The stage is now allowlisted in `crmCreateDeal` and `crmMoveDeal`, since the column has no check constraint.
- [x] 1.4 Add every new string to `helix-crm/lib/i18n/he.ts` and `en.ts`:
  - `csShort_*` path labels
  - the undo line
  - decline reasons and freeze return options
  - `לחזור אל {name}`
  - the next step's labels, the five action buttons and the crossing prompts
  - `statusMoved` with its arrow
  - `taskDone`, `at_status` and `at_task`

  Add `plural(locale, n, forms)` to `lib/i18n` (decision 12). Verify:
  - `npx tsc --noEmit` passes, which proves the dictionaries match.
  - A scratch `npx tsx` check prints `מהיום`, `יום אחד`, `יומיים` and `12 ימים` for 0, 1, 2 and 12 in Hebrew, and `1 day` in English.
  - Done 2026-09-28: tsc exits 0; the check printed `מהיום | יום אחד | יומיים | 12 ימים` and `today | 1 day | 2 days | 12 days`. Done before 1.2 and 1.3, which write text from these keys. The decline reason is `בחרו במישהו אחר`, which does not assume the contact is a man; the spec now matches.

## 2. The status path and the header

- [x] 2.1 Before any UI code, write into `helix-crm/DESIGN.md`:
  - §3: exactly one hue on the path; passed steps neutral.
  - §8: the class strings for the status path (steps, bars, labels, exits, the <640px bar button and its sheet rows) and for the header's feedback line (undo, prompt, exit question).
  - §12: the toolbar with roving focus and `aria-current="step"`.

  Bump `Last updated`. Verify the three sections exist in the doc.
  - Done 2026-09-28: grep finds §3 "On the status path, one step carries a hue", §8 "Status path" and "Header feedback line", the §12 "Status path" bullet, and `Last updated: 2026-09-28`. The English short label for `contacted` is "Reached": at 11px, "Contacted" is about 51px, wider than a 50px step.
- [x] 2.2 Build `helix-crm/components/CrmStatusPath.tsx` (decision 5):
  - At ≥`sm`: a toolbar of seven step buttons plus two exit buttons.
  - Below `sm`: one bar button that opens a `Sheet` of nine 44px rows, portaled to `document.body` after mount.
  - For a viewer: a plain `<ol>` with no buttons.

  Verify `npx tsc --noEmit` passes. The visual check comes in 2.4, once the path is wired into the drawer.
  - Done 2026-09-28: tsc exits 0. Also added:
    - `PATH_STATUSES`, `EXIT_STATUSES` and `STATUS_BAR` in `lib/crm-status.ts`.
    - `lib/use-status-change.ts`: the optimistic save, the 15s race, revert with a message, and the 8s undo, shared with 2.6.
    - The sheet sits in a `z-index: 70` wrapper above the drawer (`z-60`), so the drawer dims behind the list.
    - Steps ahead use `bg-border-strong`: `bg-border` is 8% white and does not show on the drawer. DESIGN.md is corrected.
- [x] 2.3 Make the drawer header in `components/CrmContactDrawer.tsx` fixed. It holds the name with its status chip, days in status (via `plural`), and role · company, and the body scrolls under it. In `dashboard/crm/page.tsx`, the drawer also loads the contact's `created_at` and newest `status` row. Verify on `localhost:3100/he/dashboard/crm`:
  - A contact moved 12 days ago shows `12 ימים`, one moved yesterday shows `יום אחד`, a 5-day-old `ליד חדש` shows `5 ימים`, and a status with no recorded change shows no count.
  - Scrolling to the last timeline entry keeps the header visible.
  - A 40-character Hebrew name truncates at 390px with the chip whole.
  - Done 2026-09-28: tsc exits 0. Days are counted in Israeli calendar days (`statusDays()` in `lib/crm-dates.ts`), not 24-hour periods, so a change made yesterday at 18:00 reads `יום אחד` this morning. A scratch check gives 12, 1, 0, 5 and no count for the five header cases. The on-screen checks (the rendered counts, the header staying visible while scrolling, truncation at 390px) move to 6.2.
- [x] 2.4 Put `CrmStatusPath` in the header and remove the chip and dropdown from the body.
  - The feedback line holds an undo for 8 seconds, which resets on contact change and on close.
  - Every status write races 15 seconds, and a failure reverts the change with a Hebrew message.
  - The drawer ignores Escape while the sheet is open.

  Verify at 1440×900:
  - A step tap updates the chip and path at once, and a reload keeps it.
  - Undo within 8 seconds restores the old status and leaves no timeline entry.

  Verify at 390×844:
  - The bar opens the list, and picking `חתם` closes it.
  - Escape with the list open closes only the list.
  - Done 2026-09-28: tsc exits 0, and no status dropdown remains in the drawer.
    - The header is now a column: name, chip and days with the close button; role · company with the neutral score; the path; the feedback line (always mounted as `role="status"`, so it is announced).
    - Every way of closing clears the undo, the back button included.
    - While the list is open, the drawer ignores Escape: both listen on `window`, and the list's handler closes the list.
    - The on-screen checks move to 6.2.
- [x] 2.5 Add the exit questions to the feedback line:
  - Declining offers `מחיר` / `תזמון` / `בחרו במישהו אחר` / `לא מתאים` and calls `crmSetStatusReason`.
  - Freezing offers 1 month / 3 months / a date and calls `crmSetNextStep` titled `לחזור אל {name}`.
  - Ignoring either changes nothing.

  Verify:
  - Declining a `בשיחה` contact with `מחיר` gives the timeline entry `בשיחה ← נדחה · מחיר`.
  - Freezing with 3 months puts a next step due in 3 months on the home row.
  - At 390px the four reasons wrap, each ≥44px.
  - Done 2026-09-28: tsc exits 0.
    - The row text `בשיחה ← נדחה · מחיר` and the 3-month date (27/9 → 27/12) were already checked in 1.2 and 1.3.
    - The question hides when the change wrote no history row, since there is nothing to attach a reason to.
    - A second return-date pick moves the same next step (`crmUpdateTask` now takes `due_in`) instead of creating another.
    - `DECLINE_REASONS` moved to `lib/crm-status.ts` so the server and the drawer share one list.
    - The on-screen checks move to 6.2.
- [x] 2.6 Replace the status dropdown in `components/CrmContactPanel.tsx` with `CrmStatusPath` (undo and exit questions, no deal prompts). Update DESIGN.md §9 Record screen. Verify `/he/dashboard/crm/<id>` has no status `<select>` and a step tap stores the status.
  - Done 2026-09-28: tsc exits 0.
    - The panel's only `<select>` left is the activity type; the status dropdown is gone.
    - The exit questions and undo moved into `useStatusChange`, with `CrmStatusFeedback` rendering the line, so the drawer and the panel share one implementation. The drawer's deal prompts (4.3) slot in as children.
    - The full page passes `contactName` for the freeze step's title.
    - DESIGN.md §9 Record screen is updated.
    - The browser check (a step tap stores the status) moves to 6.2.

## 3. Reaching, logging and the next step

- [x] 3.1 Replace the always-open WhatsApp and email boxes with the five-button row (decision 11):
  - Call, meeting and note save through `crmLogActivity`, with an in-flight guard and a 15s race.
  - Drafts are kept per box, and the dirty check covers every draft.
  - An unavailable action's button is hidden, and the drawer states the Hebrew reason.
  - Add the row and box class strings to DESIGN.md §8.

  Verify at 390×844:
  - The five buttons sit on at most two rows, each ≥44px.
  - A logged call appears in the timeline, and the home row reads `היום`.
  - Email text survives a switch to the note box and back.
  - Clicking outside with a typed note asks before discarding.
  - Done 2026-09-28: tsc exits 0.
    - `crmLogActivity` now returns `failed` when its insert fails; before, it reported success and the drawer would have cleared the text.
    - It also accepts only the five manual types, so a `status` or `task` row can only come from its own action.
    - The discard question now covers any unsaved text (`draftDiscardAsk`), and confirming it clears every draft.
    - DESIGN.md §8 "Drawer action row" is added.
    - The on-screen checks move to 6.2.
- [x] 3.2 Add the next-step region to the drawer:
  - It shows the first open task and says how many more are open (`dashboard/crm/page.tsx` loads the contact's open tasks in the decision 6 order).
  - It lets Eran set a step with a title and an optional date, reschedule it, and mark it done.
  - The overdue mark uses the home row's words.
  - A viewer sees it read-only, or not at all when there is no task.
  - Add the class strings to DESIGN.md §8.

  Verify:
  - Setting `לשלוח הצעה` due 30/9 shows in the drawer and on the home row within 2 seconds.
  - Marking it done leaves `בוצע: לשלוח הצעה` on the timeline and no task line on the home row.
  - Done 2026-09-28: tsc exits 0.
    - New `components/CrmNextStep.tsx`. The due text and overdue flag are computed on the server with the home row's own formula.
    - Done hides the step at once and brings it back with a message on failure.
    - Opening a step to edit is not "unsaved text" until something changes, so closing does not ask for nothing.
    - DESIGN.md §8 "Next step" is added.
    - The on-screen checks move to 6.2.
- [x] 3.3 Render `status` and `task` timeline entries with the `at_status` / `at_task` labels in the drawer and on the full contact page. Verify both surfaces show the labels, never the raw type name.
  - Done 2026-09-28: both timelines look labels up as `at_${type}` (drawer line 467, full page line 94), and the keys from 1.4 resolve to `סטטוס` / `משימה` and `Status` / `Task` (scratch check). No code change was needed.

## 4. Deals from the person

- [x] 4.1 Add the drawer's deals region:
  - A writer always sees the title and "+ עסקה חדשה". A viewer sees nothing when there are no deals.
  - An inline form: title required, value numeric or empty, in-flight guard, 15s race.
  - Add the drawer deal row to DESIGN.md §8.

  Verify:
  - Saving `בניית אתר` / `18000` shows it in the drawer and on the board within 2 seconds, and the contact's score rises by 20.
  - `18k` shows the Hebrew number message and stores nothing.
  - Done 2026-09-28: tsc exits 0.
    - New `components/CrmDrawerDeals.tsx`. The drawer holds the form's open state and draft, so closing asks first and a crossing prompt (4.3) can open it.
    - `parseDealValue` accepts `18000`, `18,000` and `₪18 000`, and rejects `18k`.
    - DESIGN.md §8 "Drawer deals" is added.
    - The on-screen checks move to 6.2.
- [x] 4.2 Make a deal row expand in place, one at a time:
  - A stage select that saves optimistically with the 15s race.
  - Title and value saved through `crmUpdateDeal`.
  - A won action, and a lost action that asks first in the board's `Dialog`.
  - A viewer gets a read-only row.

  Verify:
  - A stage change lands in the board column within 2 seconds.
  - Lost asks first, naming the deal.
  - A 50-character Hebrew title at 390px truncates while its value and stage stay visible.
  - Done 2026-09-28: tsc exits 0.
    - A stage change is optimistic and reverts with a message on failure.
    - The lost `Dialog` is portaled to `<body>`, and the drawer's Escape guard now covers it as well as the status list, so Escape in the confirmation no longer closes the drawer.
    - Won and lost read "נסגרה" / "אבודה" rather than `st_won`'s ✓ glyph.
    - The on-screen checks move to 6.2.
- [x] 4.3 Add the crossing prompts to the feedback line (decision 8):
  - `הצעה נשלחה` with no open deal offers to open one, focusing the new-deal title.
  - `חתם` with one open deal offers to mark it won.
  - `חתם` with more than one states the count.
  - A deal won before `חתם` offers to move the person.

  Verify each of the seven scenarios in `specs/crm-contact-deals/spec.md` under "crossing points" on localhost.
  - Done 2026-09-28: tsc exits 0.
    - The prompts live in the drawer and render as children of `CrmStatusFeedback`. They clear on a new change, on undo, on switching contact and on close.
    - Accepting "move to חתם?" skips the deal prompt for that change, since the deal just won may still read as open until the refresh.
    - A contact in `נדחה` or `בהקפאה` is not past `חתם`, so winning their deal still offers the move.
    - DESIGN.md: the four prompts are listed under the feedback line.
    - The seven scenarios move to 6.2 (browser).
- [x] 4.4 Make a board card lead to its person (decision 10):
  - The title becomes a `Link` to `?c=<contact_id>`.
  - A tap on the card body navigates unless a drag armed, and the click after an armed drag is cancelled.
  - `Deal` gains `contact_id`.
  - In `components/HelixCommandBar.tsx`, contacts and deals push `?c=`.
  - Update DESIGN.md §8 Kanban card and §9 Overlay state.

  Verify:
  - A tap opens the drawer within 1 second.
  - A drag moves the card without opening a drawer.
  - A vertical swipe at 390px scrolls without opening one.
  - Tab to a card title then Enter opens the drawer.
  - Picking a contact in ⌘K opens the home with its drawer.
  - Done 2026-09-28: tsc exits 0.
    - The card title is a `Link` to `?c=`, and a body tap uses `router.push` with `scroll: false`.
    - The click after an armed drag is swallowed in the capture phase, via a flag cleared on the next tick. `pointerdown` ignores the link as it ignores the buttons.
    - The page's deal type carries `contact_id`.
    - ⌘K pushes `?c=` for contacts and deals.
    - DESIGN.md §8 Kanban and §9 Overlay state are updated.
    - The gesture checks move to 6.2.

## 5. Design doc

- [x] 5.1 Finish `helix-crm/DESIGN.md`:
  - §8 Contact drawer rewritten to the new order: fixed header, then action row and box, next step, deals, timeline.
  - §10: the path recolours only, and the phone list is a `Sheet`.
  - §17: the file map gains `CrmStatusPath`, the drawer deals and next-step components, and `lib/crm-rescore.ts`.
  - Bump `Last updated`.

  Verify by reading §8 top to bottom against the rendered drawer at 1440×900: every region, in the same order, with the same class strings.
  - Done 2026-09-28:
    - §8 Contact drawer is rewritten: fixed header (row, meta, path, line), then reach, action row, next step, deals, timeline. It also covers the rule that closing asks for any unsent text, and that Escape belongs to an open overlay.
    - §10 covers the Sheet status list and that the path recolours but never moves. §17 lists the four new components and three new lib files.
    - Checked against the source rather than a render: the drawer's JSX order and the path's class strings match the doc. The rendered comparison at 1440×900 moves to 6.2.

## 6. Verification

- [x] 6.1 Run the gates: `cd helix-crm && npx tsc --noEmit && npm run build`. Both must exit 0.
  - Done 2026-09-28: tsc exit 0, build exit 0, with no errors or warnings in the log. `/[locale]/dashboard/crm` is 13.8 kB (first load 145 kB), up from 9.79 kB / 141 kB.
- [ ] 6.2 On a signed-in session at `http://localhost:3100/he/dashboard/crm`, then `/en/dashboard/crm`, walk every scenario in the five delta specs under `openspec/changes/crm-lead-drawer/specs/` at 1440×900 and 390×844. Include:
  - the English short labels at 1440×900
  - `prefers-reduced-motion: reduce`
  - a viewer session

  Report any scenario that could not be verified rather than skipping it.
  - Pending (2026-09-28): this needs a signed-in session, and the CRM's sign-in is an invite-only magic link. It also carries the browser checks deferred from 1.2, 2.3, 2.4, 2.5, 2.6, 3.1, 3.2, 4.1, 4.2, 4.3, 4.4 and 5.1.
- [ ] 6.3 Deploy with `firebase deploy --only apphosting:helix-crm`. Then on https://crm.helix.co.il/he/dashboard/crm:
  - Open a contact, tap a step and undo it.
  - Open a deal and confirm the score rose by 20.
  - Set a next step and confirm it on the home row.
  - Tap a board card and confirm it opens its person.
