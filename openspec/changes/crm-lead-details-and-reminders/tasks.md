## 1. DESIGN.md first

- [x] 1.1 Update `helix-crm/DESIGN.md` before any code. These are additions to the system, not a change of it:
  - **§8 Contact drawer:** the body order becomes details → action row → reminder → deals → timeline, the bare email/phone/LinkedIn lines go, and the header's meta row loses the score chip.
  - **§8, a new "Contact details (`components/CrmContactDetails.tsx`)" block** (design decision 3), with class strings for:
    - the read `<dl>` grid, labels and per-field `dir`;
    - the writer-only "+ הוספה" line;
    - the edit form: Input, Select for company, Primary save, Text cancel;
    - the per-field error line (`text-danger text-[13px]`, `role="alert"`).
  - **§8 "Next step" becomes "Reminder (`components/CrmNextStep.tsx`)":**
    - the brand-tinted "+ תזכורת" empty state;
    - the quick-pick chips, in the header feedback line's chip style;
    - the "מה הלאה?" offer after a logged call or meeting;
    - lucide `Bell`, which also goes on the record row's task line.
  - **§8 CRM home header:** the switcher only with two or more workspaces; otherwise the `h1` is the visible title.
  - **§8 Dropdown / menu:** rows get `min-h-[44px]`, and the switcher holds no add action.
  - **§8 CRM side menu and Drawer deals:** "portaled to `<body>`" becomes "the primitive portals itself".
  - **§9, a new "Overlay stacking" subsection** with design decision 2's table and the `nested` rule.
  - **§9, the Team page's client-workspaces card:** Card + Input + Primary, the client list, and the switch button (Outline).
  - **§15:** delete rows 4 and 5 (the switcher's `window.prompt` / `alert` and its hard-coded Hebrew), which this change fixes.
  - **§17:** the file map gains `CrmContactDetails`, `CrmClientWorkspaces` and `lib/crm-contact-fields.ts`.
  - Bump `Last updated`.

  Verify:
  - Each new block names its file.
  - The §9 table matches design.md decision 2 value for value.
  - `grep -n "window.prompt" helix-crm/DESIGN.md` returns nothing.
  - Done 2026-09-28:
    - §8 has the new drawer order, a Contact details block, the Reminder block (it absorbed two reminder bullets that had drifted into Drawer deals), the home header rule, and switcher rows at 44px.
    - The side menu, status list and lost-deal notes now say the primitive portals itself.
    - §9 has an Overlay stacking subsection, with the table matching decision 2 value for value, and the Team screen's client-workspaces card.
    - §10's Sheet row and closed-state rule are updated, and §17 lists the three new files. §18 gains an overlay checklist line.
    - §15 rows 4 and 5 are deleted. `Last updated` already reads 2026-09-28.
    - Corrected check: the `window.prompt` grep can't return nothing, because §14 rightly lists `window.prompt` as an anti-pattern. The real check is that §15 no longer has a `CrmWorkspaceSwitcher` row: the count is 0.

## 2. Overlays above the top bar (the live bug goes first)

- [x] 2.1 In `helix-crm/lib/motion/`:
  - `Drawer.tsx`, `Sheet.tsx` and `Dialog.tsx` portal into `document.body` once mounted, and render nothing on the server.
  - Their z-indexes follow design.md decision 2: Drawer and Sheet `60/61`, `nested` `70/71`, Dialog `70/71`.
  - `CommandPalette.tsx` moves to `80/81`.
  - A short "Portals and stacking" section goes in `lib/motion/README.md`.

  Verify:
  - `grep -n "zIndex" helix-crm/lib/motion/*.tsx` shows only the table's values.
  - `cd helix-crm && npx tsc --noEmit && npm run build` exits 0.
  - Done 2026-09-28:
    - A new `lib/motion/Portal.tsx` holds `Portal` and the `LAYERS` table.
    - Each primitive is now a thin wrapper, `<Portal><XPanel {...props} /></Portal>`, around its unchanged body. The body mounts only once `<body>` is there, so its open/close effect always finds its elements. Without that, a drawer opened from a `?c=` link, or under reduced motion, could run its whole spring before its panel existed and stay hidden.
    - `CommandPalette` portals too, which design.md decision 1 left at "z-index only". DESIGN.md §9 already says all four portal, and one rule is simpler than an exception.
    - `Scrim` (no consumer in the CRM) takes `LAYERS.base.scrim` as its default.
    - The zIndex grep shows only `LAYERS` values. tsc exits 0, and the build exits 0 (after 2.2).
- [x] 2.2 Update the consumers and the layout:
  - `CrmStatusPath.tsx`, `CrmNavMenu.tsx` and `CrmDrawerDeals.tsx` drop their `createPortal` and `mounted` state. The status list passes `nested` instead of its `z-70` wrapper.
  - `app/[locale]/(crm)/layout.tsx` loses `relative z-10` from both wrappers.

  Verify:
  - `grep -rn "createPortal" helix-crm/components` returns nothing.
  - `grep -n "z-10" "helix-crm/app/[locale]/(crm)/layout.tsx"` returns nothing.
  - tsc and build exit 0.
  - Done 2026-09-28:
    - Both greps return nothing.
    - The footer's wrapper div went with its `relative z-10`.
    - tsc exits 0. `npm run build` exits 0 with no warnings, and `/[locale]/dashboard/crm` is 13.8 kB (first load 146 kB, up from 145 kB).
- [ ] 2.3 In a visible, focused browser window on `http://localhost:3100`, walk the `crm-overlays` delta's 13 scenarios in Hebrew and English at 1440×900 and 390×844. Include the side menu below 1024px, which must still slide in full-height.

  Verify: each scenario is recorded here as passed. If the automation tab can't run animation frames, say so and ask Eran for screenshots of the open drawer at both sizes.
  - Deployed early, 2026-09-28, at Eran's request ("update the firebase"), with tasks 1.1 to 2.2 only. It went out from the uncommitted working tree on `feat/crm-light-theme`, and the `helix-crm` rollout completed.
  - Production, checked in the automation tab (a background tab, so read from the DOM, not seen):
    - `<main>`'s wrapper is `flex-1 flex w-full max-w-[1280px] mx-auto`, with no `z-10`.
    - The nav is `sticky`, `z-50`.
    - The layout's overlays render as direct children of `<body>`: the side menu at 60/61 and ⌘K at 80/81.
    - With `?c=<id>` open, nothing inside `<main>` is `position: fixed`.
    - No console errors, though tracking started after the load.
  - Still open: seeing the contact drawer. In a background tab the page's streamed part never shows or starts, so its drawer never mounted, and screenshots time out. Next: Eran confirms on a visible screen, or the walk happens in a visible window.

## 3. Rules, strings and the server action

- [x] 3.1 Add the shared helpers:
  - New `helix-crm/lib/crm-contact-fields.ts` holds the limits, `validateContactDetails()` and `safeHttpUrl()` (design.md decision 4).
  - In `lib/crm-score.ts`, `scoreSignals()` replaces `scoreReasons()` (decision 5).
  - `lib/crm-dates.ts` gains `addDaysIso()`.

  Verify with a scratch `npx tsx` script, not committed:
  - The spec's invalid inputs are each refused with the right field: empty name, `dana@`, `javascript:alert(1)`, and one character over each limit.
  - `safeHttpUrl('javascript:alert(1)')` is `null`, and `https://www.linkedin.com/in/x` passes.
  - `scoreSignals` on a business email, a phone and `talking` returns `business_email`, `phone`, `status`.
  - `addDaysIso('2026-09-28', 7)` is `'2026-10-05'`.
  - `todayInIsrael` at `2026-09-30T22:30:00Z` is `'2026-10-01'`, so "מחר" is `'2026-10-02'`.
  - tsc passes, and `grep -rn "scoreReasons" helix-crm` returns nothing.
  - Done 2026-09-28: the scratch check passes 34 of 34.
    - Every spec refusal names its field, and each limit accepts exactly its maximum and refuses one more.
    - Limits count code points, so a Hebrew letter is one character.
    - `javascript:` and bare text are not links.
    - The "70" contact scores 70 with the signals business email, phone and status.
    - `declined` adds no status signal (its weight is −20), and `status` is listed only when that status adds points.
    - All the date cases pass, including 01:30 Israel time on 1/10.
    - The grep finds nothing, and tsc exits 0.
- [x] 3.2 In `helix-crm/lib/i18n/he.ts` and `en.ts`, add or change these strings:
  - the details labels, source names, signal names, per-field errors, "עריכה", and the add line;
  - `nextStep*`: "תזכורת", the "more" line as תזכורות, "+ תזכורת", "מה הלאה?", "לא עכשיו", and the three quick picks;
  - the figures line's one and two forms (`'1 contact'` in English);
  - the client-workspaces card, and the switcher's strings moved out of the component.

  Verify:
  - tsc passes, since the `Dict` type keeps he and en in step.
  - `grep -rn "הוסף לקוח\|שם הלקוח החדש" helix-crm/components` returns nothing once 6.1 lands. Record the result there.
  - Done 2026-09-28:
    - The reminder keys keep their `nextStep*` names with new values, and a comment says why.
    - New keys: `nextStepAdd`, `nextStepOffer`, `nextStepNotNow`, `nextStepWhen`, and the three `pick*`.
    - A details block: labels, `src_*`, `scoreSignal_*`, `errUrlInvalid`, `errTooLong`.
    - `figContactsOne` / `figContactsTwo`.
    - A workspaces block for the switcher and the Team screen's card.
    - Existing keys are reused where they already say the thing: `fName`, `fEmail`, `fPhone`, `fRole`, `fNoCompany`, `lastTouchLabel`, `neverTouched`, `hot` / `warm` / `cold`, `errNameRequired`, `errEmailInvalid`, `saveTimeout`.
    - tsc exits 0.
- [x] 3.3 In `helix-crm/app/crm-actions.ts`, add `crmUpdateContactDetails` (decision 4):
  - it checks the workspace and `canWrite`, then validates;
  - it checks that the company belongs to the active workspace;
  - it re-derives `is_business` and rescores through `loadScoreInputs`;
  - it updates `.eq('id').eq('workspace_id')`, where zero rows means `notfound`;
  - it writes no activity and leaves `last_activity_at` alone, then revalidates the home.

  Verify:
  - tsc and build exit 0.
  - Reading the code, confirm: no `crm_activities` insert, no `last_activity_at` in the update, and the workspace filter on the update.
  - Done 2026-09-28:
    - The action returns `{ ok, score }`. A refusal returns `{ error: 'invalid', field, message }`, with the message from `problemText()`, which now lives beside the rules so the form and the server say the same sentence.
    - A company outside the workspace is refused under `company_id`.
    - The update runs `.select('id')`, so zero rows reads as `notfound`.
    - tsc exits 0. Reading the action's body: no `crm_activities`, no `last_activity_at`, and `workspace_id` on both the company check and the update.

## 4. The details region

- [x] 4.1 In `app/[locale]/(crm)/dashboard/crm/page.tsx`:
  - the drawer query adds `company_id, source, notes, last_activity_at, is_business`;
  - on the server, compute the added date and how long ago, last touch, the score signals, the tier and the source label;
  - pass the companies to the drawer.

  Verify: tsc and build exit 0, and the drawer's props type carries the new fields.
  - Done 2026-09-28:
    - `DrawerContact` gains `company_id`, `source`, `notes`, `added {date, ago}`, `lastTouch`, `tier` and `signals`.
    - "Added" formats on Israel's calendar: a formatter with `timeZone: 'Asia/Jerusalem'`, and how long ago counted by `daysBetweenIso(todayInIsrael…)`. That way 3/9 reads "לפני 25 ימים" on 28/9 whatever zone the server runs in.
    - Last touch reuses the home row's `relativeDays()`, so the two say the same thing.
    - `hasOpenDeal` comes from the deals the drawer already loads, so there is no extra query.
    - The drawer takes `companies` from the page, which already loads them for the add-contact sheet.
    - tsc exits 0, and the build exits 0 with group 4.
- [x] 4.2 Build read mode in new `components/CrmContactDetails.tsx` and put it first in the drawer body. `CrmContactDrawer.tsx` drops the bare links and the header's score chip.

  Verify on localhost, in the `crm-contact-drawer` delta's details requirement:
  - "A contact with everything filled"
  - "A contact with only a name and an email"
  - "A viewer sees what is there and nothing to add"
  - "A source the CRM doesn't know"
  - "A stored LinkedIn value that isn't a web address"
  - "Mixed-direction details"
  - "A long Hebrew background at 390px"
  - "The details come first"

  Use only contacts Eran approves. Ask before creating test data.
  - Done 2026-09-28:
    - Read mode is a `<dl>`, and only filled fields become rows. A writer gets the "+ הוספת …" line, which opens the form on the first empty field. A viewer gets rows only.
    - LinkedIn is a link only through `safeHttpUrl()`. The drawer's old LinkedIn line put the stored value straight into an `href`, which this closes.
    - Source shows a Hebrew name for `manual` / `api` / `chief` / `import`, and anything else as stored, left to right.
    - The score row reads number · tier word · signals, all neutral text.
    - The header's score chip is removed.
    - Checked by reading the code: the details come first in the body, the viewer branch has no add line and no edit, and nothing is an `href` without `safeHttpUrl`.
    - The rendered scenarios move to 7.2: they need a signed-in session in a visible window.
- [x] 4.3 Build edit mode:
  - one form, with each error under its field;
  - save through `crmUpdateContactDetails` with the 15s `withTimeout` and an in-flight guard;
  - cancel restores the stored values;
  - an unsaved change feeds the drawer's discard question.

  Verify the edit requirement's scenarios on an approved contact:
  - The network drop: DevTools → Network → Offline, then save.
  - "Supabase unreachable" can't be forced with a signed-in session. Check it by reading the error path, and list it as unverified in 7.2.
  - Check the timeline for no new entry after each save.
  - Done 2026-09-28:
    - One form in form order: name, phone, email, company (the workspace's companies or "ללא חברה"), role, LinkedIn, source, background.
    - Each refusal shows under its own field with `role="alert"` and `aria-describedby`, and focus goes to the first bad field. The rules run before sending; the server's refusal lands under its field the same way.
    - A known source shows by its Hebrew name and goes back as its stored value when left alone.
    - Save has the 15s `withTimeout` and an in-flight guard. On any failure the typed values stay.
    - Cancel returns to the stored rows.
    - The draft lives in the drawer, so closing asks about changed details, and an untouched form closes without asking (`detailsChanged()`).
    - tsc exits 0. The build exits 0, with `/[locale]/dashboard/crm` at 16 kB (first load 149 kB, up from 146).
    - The rendered scenarios move to 7.2.

## 5. The reminder

- [x] 5.1 In `components/CrmNextStep.tsx`:
  - the title "תזכורת" and a `Bell` icon (the home row's task line in `CrmContactList.tsx` gets `Bell` too);
  - the collapsed "+ תזכורת" state;
  - the quick picks, with the chosen chip derived from the draft date;
  - cancel back to the collapsed state;
  - an `offered` mode with "מה הלאה?" and "לא עכשיו".

  Verify these scenarios on an approved contact:
  - "No next step yet", "Opening the form", "In a week", "Cancel" and "Setting a step at 390px".
  - The midnight case rests on the 3.1 check.
  - Done 2026-09-28:
    - The empty state is only the brand-tinted "+ תזכורת", with no heading and no form. The heading reads "תזכורת", or "מה הלאה?" when offered.
    - The form puts the title above a group with the three picks and the date field (`role="group"`, labelled "מתי"). Each pick sets `addDaysIso(todayInIsrael(), 1|3|7)`, and pressing the chosen one again clears it. The chosen pick is derived from the draft's date, so typing a date unmarks it.
    - The title takes focus whenever the form opens. Cancel returns to the button. The offer's cancel reads "לא עכשיו".
    - An untouched form is not dirty, so closing doesn't ask.
    - Done, edit, the "more" line and every hook order are kept.
    - `Bell` replaces `ListChecks` in the drawer row and on the home row's task line.
    - tsc exits 0. The rendered scenarios move to 7.2.
- [x] 5.2 In `CrmContactDrawer.tsx`:
  - set `offerReminder` after a successful `call` or `meeting` log when there is no open task;
  - reset it when the contact changes or the drawer closes.

  Verify every scenario of "Logging a call or meeting offers a reminder". Force "The call fails to save" with DevTools Offline.
  - Done 2026-09-28:
    - `offerReminder` is set only in `saveLog`'s success branch, only for `call` or `meeting`, and only when the contact has no open task. A failed save, a note, WhatsApp and email never set it.
    - It is cleared on a new contact, on close, on "לא עכשיו" and when the reminder saves. A revalidation of the same person keeps it.
    - tsc exits 0. The rendered scenarios move to 7.2.

## 6. Workspaces and the home header

- [x] 6.1 Update the switcher and the home header:
  - `components/CrmWorkspaceSwitcher.tsx` renders nothing below two workspaces, has no add action and no `window.*` pop-ups, uses dictionary strings, and has rows of at least 44px.
  - In `dashboard/crm/page.tsx`, `switcherShown = workspaces.length > 1`, and the figures line goes through `plural()`.

  Verify on localhost:
  - As Eran, with only HELIX: the header shows "HELIX" as its title, there is no switcher, and the line reads "איש קשר אחד".
  - `/en` reads "1 contact".
  - `grep -n "window\." helix-crm/components/CrmWorkspaceSwitcher.tsx` returns nothing.
  - Done 2026-09-28:
    - The switcher returns `null` below two workspaces. It has no create action and no `window.*`, its strings come from the dictionary, and its rows and trigger are 44px.
    - A failed switch now says so in the menu instead of doing nothing.
    - The home computes `switcherShown = workspaces.length > 1`, so one workspace shows its name as the visible `h1`.
    - The figures line goes through `plural()`. Checked in node: "איש קשר אחד | שני אנשי קשר | 3 אנשי קשר | 30 אנשי קשר", and in English "1 contact | 2 contacts | 30 contacts".
    - The `window.` grep returns nothing. The 3.2 grep for the old hard-coded client strings in `components/` returns nothing too.
    - tsc exits 0. The rendered check moves to 7.2.
- [x] 6.2 Add the client-workspaces card:
  - `crmCreateClientWorkspace` adds the `isAdminRole`, no-parent and 1–80 checks, returns dictionary messages, and revalidates the Team page.
  - The Team page renders the new `components/CrmClientWorkspaces.tsx` card when `canAddClients`.

  Verify:
  - Without creating anything, check the card's own scenarios: no clients yet, an empty name, 81 characters, a member, and 390px.
  - Creating a client workspace writes production data, so ask Eran first. With his OK, walk "Adding the first client", "Switching to the new client", "Choosing a client" and "Inside a client workspace", then ask whether to keep the test workspace.
  - Done 2026-09-28:
    - The action refuses a non-admin with the existing `adminRefusal` message.
    - It refuses a name over 80 characters (counted in code points) with `errClientNameLong`, and a create from inside a client workspace with `errClientNested`, checked on the service-role client before anything is written.
    - It returns `errClientFailed` when the insert fails, and revalidates the Team page as well as the home.
    - The card lists the clients, each with an outline "מעבר" button. It says "עוד אין סביבות לקוחות." when there are none.
    - The add control is disabled while the field is empty, and the 80-character check runs before sending, with a message and the name kept.
    - Add has the 15s timeout and an in-flight guard, and success says "הסביבה ״…״ נוספה." and refreshes.
    - The Team page shows the card only when `isAdminRole(role)` and the active workspace has no parent.
    - tsc exits 0. Nothing was created, so the create and switch walks wait for Eran's OK in 7.2.

## 7. Verification

- [x] 7.1 Run the gates:
  - `cd helix-crm && npx tsc --noEmit && npm run build` (both exit 0);
  - `openspec validate crm-lead-details-and-reminders --strict`.
  - Done 2026-09-28: tsc exits 0, and `npm run build` exits 0 with no errors or warnings in the log.
    - `/[locale]/dashboard/crm` is 16.4 kB (first load 149 kB). It was 13.8 / 145 before the change.
    - `/[locale]/dashboard/crm/team` is 4.46 kB (110 kB).
    - `openspec validate --strict` reports the change valid.
- [ ] 7.2 Walk every scenario in the five delta specs under `openspec/changes/crm-lead-details-and-reminders/specs/` at 1440×900 and 390×844, in a visible window:
  - on `http://localhost:3100/he/dashboard/crm`;
  - then on `/en/dashboard/crm`;
  - then on `/he/dashboard/crm/team`.

  Include a viewer session and `prefers-reduced-motion: reduce`. List every scenario that could not be verified, with the reason, instead of skipping it.
- [ ] 7.3 When Eran asks for the deploy, run `firebase deploy --only apphosting:helix-crm` from `helix-crm/`. Then on https://crm.helix.co.il/he/dashboard/crm:
  - the drawer's name, chip and close control are uncovered at 1440×900 and 390×844;
  - there is no switcher, and the line reads "איש קשר אחד";
  - the details show under their labels;
  - "+ תזכורת" opens the form.

  Writes on production need Eran's OK first.
  - Deployed 2026-09-28 from `feat/crm-lead-details-and-table` (`b88f07d`, then `abedce6`, which is the contacts table), and the `helix-crm` rollout completed.
  - Read on production from the server-rendered DOM: no switcher trigger on the page, "HELIX" as the visible `h1`, and the figures read "איש קשר אחד".
  - Still open: the drawer (details, "+ תזכורת", the offer, and the layering at both sizes). It renders only once the page runs in a visible window, which the background automation tab never does.
