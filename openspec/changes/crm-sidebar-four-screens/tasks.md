The order keeps the CRM deployable after every task:
1. shared plumbing, with no visible change;
2. the three new screens, reachable by URL before any menu offers them;
3. the switch of the shell, menus and home;
4. the command bar and the docs.

Before every UI task, read `helix-crm/DESIGN.md`, and update it in the same change. That rule is written into each task below. All commands run in `helix-crm/`. "Locally" means `npm run build && npx next start -p 3100`, signed in at `http://localhost:3100`.

Creating test data in a workspace needs Eran's OK first (a test company, a reminder marked done). Without it, the step is checked in production during 8.3.

## 1. Shared plumbing (no visible change)

- [x] 1.1 Move the `?c=` block of `app/[locale]/(crm)/dashboard/crm/page.tsx` into `lib/crm-drawer.ts` as `loadDrawerContact({ supabase, ws, openId, locale })`, returning `{ contact, missing }` (design decision 4). Its helpers move with it: the UUID check, the workspace check, the date formatters, `relativeDays`, `daysAgoInIsrael`, and the Google meetings flag. The home calls it instead of the inline block.

  Verify:
  - `npx tsc --noEmit` and `npm run build` pass.
  - Locally, `/he/dashboard/crm?c=<a contact id>` opens the same drawer as before, with header, days in status, status path, reminder, deals, quotes and timeline.
  - `?c=not-a-uuid` renders the list with no drawer (HTTP 200).
  - An id from no workspace of yours shows the not-found notice.
  - Done 2026-10-01. `lib/crm-drawer.ts` exports:
    - `loadDrawerContact`, which also loads the workspace's companies when a screen does not pass its own;
    - `dueDayMonth`;
    - `UUID_RE`.

    `relativeDays` and `daysAgoInIsrael` moved to `lib/crm-dates.ts` for every screen to share. The home's inline block is now one call, and its queries and record are unchanged. `tsc` passes. The signed-in checks are listed under 8.3, because local sign-in needs Eran.
- [x] 1.2 Make `components/CrmContactDrawer.tsx` close to its own screen with `router.replace(usePathname(), { scroll: false })`. Return focus to the control that opened it:
  - a capture-phase `click` listener remembers the last `[data-contact-row]` element activated;
  - on close, focus that element if it is still in the page and names the same contact, and otherwise the first `[data-contact-row="<id>"]` (decision 4).

  Verify locally on the contacts list:
  - Escape returns focus to the row;
  - the back button closes the drawer and the URL drops `c`;
  - the scrim closes it;
  - typed note text still asks before discarding.
  - Done 2026-10-01.
    - Closing replaces the URL with `usePathname()`.
    - A capture-phase click listener records the opener. An element marked `data-contact-opener` stands for the `[data-contact-row]` inside it; the deal card uses this in 3.1.
    - On close, focus goes to that element when it is still connected and names the same person, and otherwise to the first one that does.

    The keyboard, back and scrim checks are listed under 8.3.
- [x] 1.3 Two fixes in `app/crm-actions.ts` and the date code:
  - `rev(locale)` in `app/crm-actions.ts` also revalidates `/{locale}/dashboard/crm/companies`, `/deals` and `/tasks` (decision 5).
  - "Overdue" uses `todayInIsrael()` from `lib/crm-dates.ts` in the home rows and in the drawer, in place of the UTC date (decision 8).

  Verify:
  - `npx tsc --noEmit` passes.
  - `grep -n "toISOString().slice(0, 10)" "app/[locale]/(crm)/dashboard/crm/page.tsx" lib/crm-drawer.ts` finds no "today" left.
  - In the scratchpad, `node -e "import('<abs path>/lib/crm-dates.ts').then(m => console.log(m.todayInIsrael(new Date('2026-10-01T21:30:00Z'))))"` prints `2026-10-02`.
  - Done 2026-10-01.
    - `rev()` loops over `''`, `/companies`, `/deals` and `/tasks`.
    - The home rows and the drawer both judge "overdue" against `todayInIsrael()`. Both now get it from `lib/crm-drawer.ts`.
    - The grep finds nothing, and the node check printed `2026-10-02`. It runs with `env -u NODE_OPTIONS`.
    - `tsc` passes.

## 2. Strings

- [x] 2.1 Add to `lib/i18n/he.ts` and `lib/i18n/en.ts` the strings the specs quote.
  - **Menu labels:** `חברות`/`Companies`, `עסקאות`/`Deals`, `תזכורות`/`Reminders`.
  - **Settings:** `הגדרות`/`Settings` and `חזרה ל-CRM`/`Back to CRM`.
  - **Profile menu:** the profile control's name `התפריט שלי`/`My menu`, and the language item `English`/`עברית`.
  - **Companies:**
    - title, `חברה חדשה`, the column heads and phone labels;
    - people counts with agreement (`אין`, `איש קשר אחד`, `שני אנשי קשר`, `{n} אנשי קשר`);
    - open-deals text, the filter placeholder, the no-match and no-companies lines;
    - the nothing-linked line;
    - load-failed and capped lines;
    - name empty, too long, taken, not created and not renamed;
    - rename.
  - **Reminders:**
    - the four group names;
    - the done control's name `סימון '{title}' כבוצע`;
    - empty, load-failed and capped lines;
    - not saved;
    - `ללא איש קשר`.
  - **Deals:** the no-deals line, "a title is needed" and "not saved".

  Verify: `npx tsc --noEmit` passes. `en` is typed as `Dict`, so a key missing in English fails the check.
  - Done 2026-10-01.
    - New keys `nav*`, `settings*`, `profileMenu`, `langOther`, `dealsEmpty`, `co*` and `tk*`.
    - `tkOverdue` is its own key, because the English `taskOverdue` is the lowercase row text.
    - Existing keys reused: `cs_*`, `st_*`, `statusLabel`, `colContact`, `nextStep`, `dealNoContact`, `errDealTitleRequired`, `dealSaveFailed`, `figContacts*`, `wsNew`, `wsMine`, `wsClients`, `clientSwitchFailed`, and `shell.*` and `auth.logout`.
    - `tsc` passes.

## 3. Deals screen (reachable at its URL; no menu offers it yet)

- [x] 3.1 Create `components/CrmAddDeal.tsx`: the header's primary action with the board's inline form (title, value in ₪, optional person). It adds:
  - the empty-title message;
  - a Hebrew "not saved" message that keeps the typed values;
  - a 15-second timeout race;
  - a guard against a double press.

  `CrmDealBoard.tsx` drops its `<h2>`, its add form and its `contacts` prop, and builds card links from `usePathname()` (decision 6). In DESIGN.md §8 "Kanban column & card", the section header moves to the screen header and links follow the current screen.

  Until 6.3 the home keeps its board section. It renders the board's `<h2>` through a temporary `heading` prop, with `CrmAddDeal` beside it, so nothing on the home is lost in between. 6.3 deletes both.

  Verify:
  - `npx tsc --noEmit` passes.
  - Locally the home still shows `צינור עסקאות` with a working `עסקה חדשה`.
  - An empty title asks for one in Hebrew.
  - Done 2026-10-01. `CrmAddDeal`:
    - uses the Primary lg trigger and swaps for the inline form;
    - parses the value with the drawer's `parseDealValue`;
    - shows `errDealTitleRequired`, `errDealValue`, and `saveTimeout` or `dealSaveFailed`;
    - guards against a double press with `inFlight`;
    - closes on Escape and returns focus to the trigger.

    `CrmDealBoard` dropped its header, form and `contacts` prop, and shows `dealsEmpty` with no deals. Card links come from `usePathname()`. The title carries `data-contact-row`, and a card with a person carries `data-contact-opener`.

    The temporary `heading` prop turned out unnecessary: the home renders its own `<h2>` and `CrmAddDeal` above the board until 6.3. DESIGN.md "Kanban column & card" is updated. `tsc` passes. The local signed-in check is in 8.3.
- [x] 3.2 Create `app/[locale]/(crm)/dashboard/crm/deals/page.tsx` and its `loading.tsx` (title row, figures line, six columns). The page has:
  - **Header:** `עסקאות`, with `CrmAddDeal` for a writer.
  - **Read-only:** the notice once, for a viewer.
  - **Money figures:** open, won only with at least one won deal, win rate only with at least one won or lost (crm-deals spec).
  - **The board,** or the no-deals line.
  - **Drawer:** `loadDrawerContact` and `CrmContactDrawer`, with companies.
  - **No workspace:** redirect to `/{locale}/dashboard/crm`.

  Write the Deals screen into DESIGN.md §8 and §6 (container `max-w-[1100px]`).

  Verify locally at 1440px and 390px, in `/he` and `/en`:
  - every crm-deals scenario that needs no new data: viewer, empty, the figures rules against the current deals, 390px stacking;
  - a card opens its person over `/he/dashboard/crm/deals?c=…`, and Escape returns there with focus on the card's title.
  - Done 2026-10-01.
    - The page loads deals (200 newest), the add form's people (200 by score; none for a viewer) and the drawer, in one `Promise.all`.
    - The figures follow the each-waits-for-something rule.
    - The skeleton matches the screen (title row, figures line, six columns).
    - DESIGN.md gains "Deals screen", and its §6 row covers the four screens.
    - `tsc` passes.

    The signed-in checks at 1440px and 390px are listed under 8.3. Local sign-in needs Eran, and `.env.local` has no service-role key, so the workspace and drawer paths that use it can't run locally.

## 4. Reminders screen (reachable at its URL)

- [x] 4.1 Create `app/[locale]/(crm)/dashboard/crm/tasks/page.tsx` and its `loading.tsx`. The page:
  - loads open `crm_tasks` with `crm_contacts(full_name)`, by due date with nulls last and then by creation, limit 501;
  - groups them with `todayInIsrael()` into `באיחור`, `היום`, `בהמשך` and `בלי תאריך`, with counts;
  - formats due dates on the server;
  - shows the capped line past 500, the load-failed line on a query error, and the empty line;
  - handles the drawer and the viewer notice as in 3.2;
  - redirects when there is no workspace.

  Verify: `npx tsc --noEmit` passes. Locally, the groups match the workspace's open reminders and their due dates.
  - Done 2026-10-01.
    - The query matches the drawer's order and loads `limit 501`.
    - Rows are grouped against `todayInIsrael()`, and due dates are formatted with `dueDayMonth`.
    - A query error renders `tkLoadFailed` (`role="alert"`) and never the empty line.
    - The `h1` carries `TASKS_TITLE_ID` and `tabIndex={-1}` for focus.
    - `tsc` passes. The group-against-data check is in 8.3.
- [x] 4.2 Create `components/CrmTaskList.tsx`:
  - **Layout:** rows with labelled values, column heads from `md`, phone labels below it.
  - **Done control:** only for a writer, named `סימון '{title}' כבוצע`. It calls `crmUpdateTask({ done: true })` with optimistic removal (`useOptimistic`) and a 15-second race.
  - **On failure:** the row and its count come back with the message.
  - **`notfound`:** counts as done.
  - **Focus:** moves to the next row's control, else to the `h1`.
  - **Person:** links to `?c=<id>` with `data-contact-row`, or shows `ללא איש קשר`.

  Write the Reminders list into DESIGN.md §8.

  Verify locally:
  - the 390px row layout;
  - a viewer sees no control;
  - keyboard Space on a control.

  Marking a real reminder done needs Eran's OK, or it is checked in 8.3.
  - Done 2026-10-01.
    - **Hiding:** a `hidden` set, not `useOptimistic`, so a successful row stays hidden until the server's list drops it. On a failure it is removed from the set and a message shows inside the row.
    - **`notfound`:** calls `router.refresh()`.
    - **Focus:** moves to the next control, else the previous one, else the `h1`.
    - **Viewers:** for a viewer the 44px column is left out entirely.
    - **Labels:** `md:sr-only` on phones.

    DESIGN.md gains "Reminders list". `tsc` passes. The checks at 390px, with a viewer and with the keyboard are in 8.3.

## 5. Companies screen (reachable at its URL)

- [x] 5.1 Add `crmCreateCompany({ locale, name })` and `crmRenameCompany({ locale, id, name })` to `app/crm-actions.ts` (decision 7). Each:
  - checks `canWrite`;
  - trims the name and requires 1 to 80 characters;
  - checks for a duplicate against the workspace's names, compared trimmed and lower-cased in code and excluding the company itself on rename (design decision 7);
  - writes scoped to the workspace;
  - returns Hebrew messages;
  - calls `rev()`.

  Verify: `npx tsc --noEmit` passes. Then check by reading:
  - a viewer gets `readonlyRefusal`;
  - `nurit ltd.` against `Nurit Ltd.` is refused;
  - a case-only rename of the same company is allowed.
  - Done 2026-10-01.
    - `companyNameProblem` trims the name and counts code points, allowing 1 to 80.
    - `companyNameTaken` returns `null` on a query error, which is reported as not created or not saved.
    - Both actions guard with `canWrite`, scope the write to the workspace and call `rev()`.
    - Create returns `{ ok, id }`. Rename returns `notfound` when the row is not in this workspace.

    Checked by reading:
    - a viewer gets `readonlyRefusal` before any query;
    - `'nurit ltd.'.toLocaleLowerCase()` equals `'Nurit Ltd.'.trim().toLocaleLowerCase()`, so it is refused;
    - a rename passes `exceptId`, so a case-only rename of itself is allowed.

    `tsc` passes.
- [x] 5.2 Create `app/[locale]/(crm)/dashboard/crm/companies/page.tsx` and its `loading.tsx`. The page:
  - runs the three workspace-scoped queries of decision 7;
  - groups people and deals by company on the server, counting a deal through its person when it names no company;
  - computes last activity, with relative text on the server;
  - orders by last activity, then by name;
  - shows the capped line past 500 and the load-failed line;
  - handles the drawer and the viewer notice;
  - redirects when there is no workspace.

  Verify: `npx tsc --noEmit` passes. Locally, the counts for a company match its people and open deals in the contacts list and on the board.
  - Done 2026-10-01.
    - The three queries run in one `Promise.all`: companies `limit 501`, people with a company `limit 2000`, and open or won deals `limit 1000`.
    - A failure in any of them shows `coLoadFailed` in place of the list, so a failed lookup never reads as zero.
    - Grouping and counts happen on the server: people with `plural`, deals with `plural` plus `{v}`, last activity with `relativeDays`, and amounts with `toLocaleString('en-US')`.
    - Rows are ordered by activity, then by name with `Intl.Collator`.
    - The drawer reuses the company list unless it is capped.
    - `tsc` passes. Checking the counts against real data is in 8.3.
- [x] 5.3 Create `components/CrmCompanyList.tsx`:
  - **Filter:** a text field matching names, ignoring case.
  - **Rows:** each is an `<li>` with a full-width disclosure button (`aria-expanded`, `aria-controls`), and several can be open.
  - **Labels:** values carry an `sr-only` label from `md` and a visible one on phones.
  - **The open panel:**
    - people with status chips, linking to `?c=` with `data-contact-row`;
    - open and won deals, open first, where a deal with a person opens that person;
    - the nothing-linked line;
    - for a writer, rename (optimistic, with a 15-second race and the message on failure).

  Also create `components/CrmAddCompany.tsx`: the header action and inline form, with the messages and a double-press guard. Write the Companies list, the panel and the add/rename forms into DESIGN.md §8.

  Verify locally at 1440px and 390px:
  - filter, open and close, two open at once;
  - a person opens over Companies, and Escape leaves the company open with focus on the person's name;
  - a viewer sees no add or rename.

  Adding a company needs Eran's OK, or it is checked in 8.3.
  - Done 2026-10-01.
    - **The list:** a filter (`toLocaleLowerCase` contains), a decorative head, and a full-width disclosure `<button>` per row. Several rows can be open at once.
    - **The panel:** people as `?c=` links with status chips, open and won deals (a deal links to its person's drawer when it has one), and the nothing-linked line.
    - **Rename:** shown at once, reverted on failure, raced against 15 seconds. Escape cancels.
    - **`CrmAddCompany`:** a header action and inline form that checks for an empty or too-long name in the browser. The server checks for a taken name. Double presses are guarded.
    - **Open rows** use `border-border-strong`, not brand.

    DESIGN.md gains "Companies list". `tsc` passes. The interaction checks at 1440px and 390px are in 8.3.

## 6. The switch: shell, menus and home

- [x] 6.1 Create `components/CrmProfileMenu.tsx` (decision 3), fed by `Nav.tsx`, which also calls `listAccessibleWorkspaces`. The menu:
  - **Trigger:** the initial, and the workspace name from `md` with an ellipsis.
  - **Items:** the email; the workspaces group from `CrmWorkspaceSwitcher` (rows, role labels, switch with `router.refresh()`, failure message); `workspace חדש`; the language link; the theme row; the portal link (new tab, named for it); the sign-out form.
  - **Closing:** an outside `pointerdown` on `document` closes it; Escape closes it and refocuses the trigger.
  - **Rows:** at least 44px.

  `Nav.tsx`, signed in with `crmMenu`, shows the gear (link to `/dashboard/crm/business`, named `הגדרות`) and the profile control. It drops the `CRM` link, the portal link, `LocaleSwitcher`, `ThemeToggle` and sign-out. Signed-out and `(stage)` navs stay as they are.

  Write the gear and the profile menu into DESIGN.md §8 "Dropdown / menu" and §9 "Nav". Correct the "theme moves into the sidebar's footer" note.

  Verify locally:
  - every crm-shell profile-menu scenario: one and two workspaces, language, theme, Escape, outside click, 390px;
  - a switch stays on the screen.
  - Done 2026-10-01.
    - **`Nav`**, signed in with `crmMenu`, loads branding, `getWorkspace` and `listAccessibleWorkspaces` together. Without the service role it falls back to reading the active workspace's name as the user.
    - **`CrmProfileMenu`:**
      - items in the order the spec gives;
      - the email in `<bdi dir="ltr">`;
      - the switch raced against 15 seconds, guarded by an in-flight ref instead of dimming, and showing `clientSwitchFailed` on failure;
      - outside press caught with `pointerdown` on `document`, and Escape refocuses the trigger;
      - the theme item uses the new `applyTheme()` in `lib/use-theme.ts`;
      - an `aria-label` of "התפריט שלי, {workspace}", so the visible name stays inside the accessible one.
    - **Removed:** `ThemeToggle.tsx` had no user left and was deleted (`git rm`). `LocaleSwitcher` stays for the signed-out nav.
    - **DESIGN.md:** "Profile menu", "Dropdown / menu" (the switcher's new home) and §9 Nav are rewritten.
    - `tsc` passes. The checks with a signed-in session are in 8.3.
- [x] 6.2 Rewrite `components/CrmNavMenu.tsx` (decision 1).
  - **Lists:** the four screens (`Contact`, `Building2`, `Handshake`, `Bell`) or, on a settings prefix, `חזרה ל-CRM` plus the five settings rows. Business details' icon changes to `Store`.
  - **Current item:** `אנשי קשר` only on `/crm`, `/crm/[id]` and `/crm/quotes/*`, and nothing on `workspaces/new` or `autonomy`.
  - **`nav` aria-labels:** for the main list and for Settings.
  - **Phone:** the drawer shows the same list.

  Rewrite DESIGN.md §8 "CRM side menu" and "Header: one primary action", where occasional screens now live in Settings.

  Verify locally at 1440px and 390px, `/he` and `/en`:
  - every crm-shell side-menu and Settings scenario;
  - an automation's page marks `אוטומציות`;
  - `/he/dashboard/crm/connections/google/import` marks `חיבורים`;
  - `/he/dashboard/crm/workspaces/new` marks nothing.
  - Done 2026-10-01, together with 6.1 in one rewrite of the file.
    - `SCREENS` and `SETTINGS` tables, with `isSettingsPath()` and `currentScreen()`:
      - a contact page is `/crm/<uuid>`;
      - quotes belong to contacts;
      - `workspaces/new` and `autonomy` mark nothing.
    - `CrmSettingsButton` is the gear, and reads as current in Settings.
    - The `nav` is named `navMain` or `settings`, and so is the phone drawer's `h2`.
    - DESIGN.md "CRM side menu" is rewritten, with a new "Settings control" and "Header: one primary action" updated.
    - `tsc` passes. The checks at 1440px and 390px with a session are in 8.3.
- [x] 6.3 Change the contacts home:
  - **Header:** a visible `h1` `אנשי קשר` plus `CrmAddContact`. Remove `CrmWorkspaceSwitcher` from it, and delete the component once nothing imports it.
  - **Figures:** the exact contact count from `count: 'exact'`, plus `{n} חמים` only when above 0. No money figures.
  - **Board:** remove `CrmDealBoard` and the deals query, and delete the temporary `heading` prop from 3.1.

  Update DESIGN.md §8 "CRM home header" and §9 "Workspace screen".

  Verify locally:
  - the crm-home scenarios: header, viewer, one and two workspaces, no board, figures with agreement, and the 250-contact line if a workspace has one;
  - `grep -rn CrmWorkspaceSwitcher app components` finds nothing.
  - Done 2026-10-01.
    - **Header:** the `h1` reads `navContacts`, beside `CrmAddContact`.
    - **Figures:** the exact count (`count: 'exact'`), and `figHot` only above zero.
    - **Removed from the page:**
      - the deals query, `CrmDealBoard` and `CrmAddDeal`;
      - the `listAccessibleWorkspaces` call and the switcher;
      - `CrmWorkspaceSwitcher.tsx` itself (`git rm`). Its rows live on in `CrmProfileMenu`.
    - **The grep** finds nothing.
    - **DESIGN.md:** "CRM home header", "Figures line" and §9 (now "The four CRM screens") are updated.
    - `tsc` passes. The checks with a session are in 8.3.
- [x] 6.4 In `components/HelixCommandBar.tsx`:
  - `ROUTES` lists `אנשי קשר`, `חברות`, `עסקאות` and `תזכורות` (paths `/dashboard/crm`, `/companies`, `/deals`, `/tasks`), keeping the settings, new-workspace and email entries;
  - a deal with no person opens `/{locale}/dashboard/crm/deals`.

  Verify locally:
  - ⌘K, then type `עסקאות`, opens Deals;
  - a deal with no person opens Deals;
  - a deal with a person opens the home with that person's drawer.
  - Done 2026-10-01.
    - The four screens head `ROUTES`. The old `CRM` entry is now `אנשי קשר`, with the subtitles Contacts, Companies, Deals and Reminders.
    - A deal with no person pushes `/dashboard/crm/deals`. A contact, or a deal's person, still opens the home with `?c=`.
    - `tsc` passes. The ⌘K checks need a session and are in 8.3.
    - The route titles are fixed Hebrew, as they were before this change. That is now a Known Drift row (7.1).

## 7. Docs

- [x] 7.1 Finish `helix-crm/DESIGN.md` for the whole change:
  - §9 "Overlay state lives in the URL": the drawer over four screens, closing to its own screen, and focus to its opener;
  - §16: close "does the deal board stay the primary pipeline?" (it has its own screen, 2026-10-01);
  - §17 file map: every new file and lib;
  - §18 checklist: "a new occasional screen goes in Settings";
  - `Last updated:` set to the day of the change.

  Verify:
  - `grep -n "sidebar's footer\|is in the side menu" helix-crm/DESIGN.md` finds nothing stale;
  - every component created in this change appears in §17.
  - Done 2026-10-01.
    - **§9 "Overlay state lives in the URL":** the drawer over four screens, the shared loader, closing to its own screen, focus back to its opener, and `rev()` covering all four.
    - **§16:** the deal-board question is closed.
    - **§15:** new row 13, for the ⌘K route titles that are fixed Hebrew.
    - **§17:** the new components, `lib/crm-drawer.ts`, `applyTheme` and the new screens. `ThemeToggle` and the switcher are removed from it.
    - **§18:** "a new occasional screen goes in Settings".
    - **Stale references fixed:** the new-workspace form now opens from the profile menu; the in-page menus note; the `CrmWorkspaceSwitcher` mention.
    - **`Last updated`:** 2026-10-01.
    - **The stale-text grep** finds nothing, and every new component appears in DESIGN.md.

## 8. Verification and release

- [x] 8.1 Run `cd helix-crm && npx tsc --noEmit && npm run build`.

  Verify: both finish with no error, and the build lists `/[locale]/dashboard/crm/companies`, `/deals` and `/tasks`.
  - Done 2026-10-01.
    - Both pass with `env -u NODE_OPTIONS`, with no lint warnings. The build lists `/companies`, `/deals` and `/tasks`.
    - On a local `next start -p 3100`:
      - signed out, `/he/dashboard/crm`, `/companies`, `/deals`, `/tasks` and `/team` answer `307` to `/he/login`, and `/en/dashboard/crm/tasks` to `/en/login`;
      - the signed-out nav on `/he/login` has the sign-in link and the `EN` pill, and no gear or profile menu.
    - The built CSS carries the `rtl:` and `ltr:` rotations.
- [ ] 8.2 Deploy, only when Eran asks, with `firebase deploy --only apphosting:helix-crm --project helix-fc9de` from the repo root.

  Verify signed out:
  - `curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" https://crm.helix.co.il/he/dashboard/crm/companies` (and `/deals`, `/tasks`) answers `307` to `https://crm.helix.co.il/he/login`;
  - `/he/dashboard/crm/team` and `/he/dashboard/crm/connections` answer as before.
- [ ] 8.3 Walk through it signed in on https://crm.helix.co.il at 1440px and 390px, in `/he` and `/en`. This is done by Eran, or by Claude in Chrome on Eran's session, with Eran's OK for any test data. It covers:
  - every scenario in this change's specs not already proven locally;
  - in particular: add a company, rename it with a case change, open it, and open a person from it;
  - mark a reminder done and see `בוצע: …` on the person's timeline, with last touch unchanged;
  - add a deal from the Deals header;
  - switch workspace from the profile menu while on Deals.

  Record each scenario as passed, or say which could not be checked and why.
- [ ] 8.4 Archive only after `crm-quotes`, `crm-lead-details-and-reminders`, `crm-team-invites`, then `crm-multi-workspace`, and `crm-connect-google-and-make` (design decision 11).

  Verify: `openspec validate crm-sidebar-four-screens --strict` shows no "target spec does not exist" notes.
