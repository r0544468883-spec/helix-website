## Context

See proposal.md (Why). The facts in `helix-crm/` that shape the approach:

**The shell:**
- `app/[locale]/(crm)/layout.tsx` renders `<Nav crmMenu />`, then `CrmSideNav` beside `<main>`.
- `components/Nav.tsx` is a server component shared with `(stage)`. It already reads the user and the active workspace's branding.
- `components/CrmNavMenu.tsx` is a client component. Its active item is decided by path prefix, with `exact` for `/crm`, which also owns `/crm/[id]` and the quote editor.
- The nav's `backdrop-blur` makes it the containing block for `fixed` children (noted in `CrmNavMenu.tsx`). A `fixed inset-0` click-catcher inside the nav would cover only the nav.

**The contacts home** (`dashboard/crm/page.tsx`, 303 lines):
- It loads contacts (capped at 200), deals, companies and open tasks.
- It builds the drawer's contact inline from `?c=`: the contact, deals, activities, the last status move, open tasks, quotes, and whether Google is connected. That is about 90 lines.
- Its figures line counts `contacts.length`, so a workspace with 250 contacts reads "200".
- It judges "overdue" against the UTC date (`new Date().toISOString()`), while `lib/crm-dates.ts` offers `todayInIsrael()`.

**Hard-coded home paths:**
- `CrmContactDrawer` closes with `router.replace('/{locale}/dashboard/crm')` and refocuses the first `[data-contact-row=<id>]`.
- `CrmDealBoard` builds each card's link as `/dashboard/crm?c=<id>`.
- `rev(locale)` in `app/crm-actions.ts` revalidates `/{locale}/dashboard/crm` only.

**The deal board** owns its section header and the add-deal form. An empty title does nothing, and a failed add shows no message.

**Companies:**
- `crm_companies` has no unique constraint on `name`.
- Today only the Google import creates companies, by a case-insensitive `ilike` match.
- A contact picks a company by id from a `<select>`, both in the add-contact form and in the drawer's details.

**Tasks:**
- `crm_tasks` allows many open rows per person. The earliest is shown as the person's `תזכורת` (the on-screen word since 2026-09-28).
- `crmUpdateTask({ done: true })` writes `בוצע: {title}` and leaves `last_activity_at` alone.
- Automations insert tasks too (`lib/automations/engine.ts`).

**Roles:** migration v20 lets `admin`, `agency_admin` and `member` insert and update companies and tasks, and lets `viewer` read them.

**Switching, theme and language:**
- `CrmWorkspaceSwitcher` is an in-page menu. It calls `crmSetActiveWorkspace`, which sets an httpOnly cookie, and then `router.refresh()`.
- `ThemeToggle` writes `THEME_COOKIE` and flips the root class.
- `LocaleSwitcher` swaps the first path segment.

**Loading:** `dashboard/loading.tsx` is a generic skeleton, listed as DESIGN.md Known Drift #6.

## Goals / Non-Goals

**Goals:**
- One drawer, loaded one way, opening over all four screens.
- The shell decides "where am I" from the path alone, with no new state.
- No migration and no moved route, so every existing link keeps working.
- Every new screen keeps the CRM's rules:
  - a control the role can't use is omitted, not disabled;
  - mutations are optimistic, race a 15-second timeout, and say why they failed;
  - dates are computed on the server;
  - one filled action per header.

**Non-Goals:**
- A client data layer (SWR, React Query). Screens stay server-rendered, as today.
- Pagination beyond the stated caps.
- Any change to what the drawer shows.

## Decisions

### 1. Settings is a mode of the side menu, not a new place

`CrmNavMenu` picks one of two lists from the path. These prefixes are settings:
- `/dashboard/crm/business`;
- `/dashboard/crm/team`;
- `/dashboard/crm/connections`;
- `/dashboard/crm/api`;
- `/dashboard/automations`.

On those it renders `חזרה ל-CRM` and the five settings rows. Everywhere else it renders the four screens. The gear is a link to `/dashboard/crm/business`, styled as current while a settings prefix matches.

`/crm` marks `אנשי קשר` current only on `/crm`, `/crm/[id]` and `/crm/quotes/*`. Other paths under `/crm/` that belong to no item mark nothing: `workspaces/new` and `autonomy`.

**Rejected:**
- **Moving settings under `/dashboard/crm/settings/*` with redirects.** Every link, bookmark, revalidation path and the Google callback's redirect would change, for nothing the user can see.
- **A settings index page of cards.** It adds a click to every setting.
- **A gear dropdown that lists the settings.** Once inside a setting, nothing would show where you are. HubSpot itself swaps the sidebar.
- **Settings as a fifth sidebar item.** Eran asked for exactly four.

### 2. Workspace-wide goes to Settings, personal goes to the profile menu

| Item | Goes to | Because |
|---|---|---|
| פרטי העסק, צוות, חיבורים, API | Settings | they change the workspace for everyone |
| אוטומציות | Settings | set up once, then it runs; not a daily screen |
| workspace חדש, the switcher | profile menu | they are about which workspaces *you* have |
| language, theme | profile menu | personal preferences |
| האיזור האישי, התנתקות | profile menu | the person's account |
| the `CRM` text link | removed | the logo and `אנשי קשר` already open the same screen |

**Rejected:**
- **Automations in the sidebar** (HubSpot keeps workflows in its main nav). That breaks the four.
- **The theme switch in the sidebar's footer,** which DESIGN.md §9 had planned. The sidebar holds exactly the four screens. §9 gets corrected.
- **Keeping the `EN`/`עב` pill in the bar.** It is switched rarely, and HubSpot keeps language among the personal preferences.

### 3. The profile menu is a client component fed by `Nav`

`Nav` already has the user. For a signed-in `crmMenu` render it also calls `listAccessibleWorkspaces` and renders `components/CrmProfileMenu.tsx` with:
- the email;
- the workspaces;
- the active workspace's id and name;
- the theme.

The menu:
- **Rows:** the §8 Dropdown/menu row spec.
- **Workspaces group:** moves out of `CrmWorkspaceSwitcher`, with its `WsRow`, role labels, `crmSetActiveWorkspace` and `router.refresh()`. The header switcher on the home is deleted. `router.refresh()` keeps the path, so a switch on Deals stays on Deals.
- **Language item:** a `<Link>` using `LocaleSwitcher`'s path swap.
- **Theme item:** `ThemeToggle`'s cookie-and-class logic, rendered as a row.
- **Sign-out:** the existing POST form.
- **The portal:** `<a target="_blank" rel="noopener noreferrer">` with `t.shell.portalNewTab` as its name.
- **Closing on an outside click:** a `pointerdown` listener on `document`. A `fixed` click-catcher would be clipped to the nav's box (see Context).
- **Escape:** closes the menu and refocuses the trigger.
- **The initial:** the email's first character, upper-cased.

**Rejected:**
- **A `Dialog` or `Sheet` for the menu.** It is an in-page menu (§9 Overlay stacking) and needs no scrim.
- **A profile photo.** None is stored, and fetching one from Google adds a call to every page.

### 4. One loader for the drawer, used by four pages

The `?c=` block moves out of `dashboard/crm/page.tsx` into `lib/crm-drawer.ts`:

```ts
loadDrawerContact({ supabase, ws, openId, locale })
  → { contact: DrawerContact | null; missing: boolean }
```

The block's helpers move with it: the UUID check, the workspace check, the date formatters, `relativeDays`, `daysAgoInIsrael`, and the Google `meetings` flag. Each of the four pages:
- reads its own `searchParams.c`;
- calls the loader;
- loads `companies (id, name)` for the details form;
- renders `<CrmContactDrawer>` and the not-found notice.

Behaviour stays exactly as it is on the home today.

**The drawer closes to its own screen:** `router.replace(usePathname(), { scroll: false })`.

**Focus goes back to the control that opened it.** Every opener carries `data-contact-row="<id>"`. A capture-phase `click` listener on `document`, installed by the drawer, remembers the last such element activated. On close, the drawer focuses that element if it is still in the page and names the same contact, and otherwise the first `[data-contact-row="<id>"]`. This covers a person with two deal cards. It also covers Safari, which does not focus a link on click.

**Rejected:**
- **A client fetch for the drawer** (an API route plus a fetch hook). §9 says a record overlay is server-rendered, with the workspace check in one place.
- **Parallel or intercepting routes** (`@drawer/(.)…`). They restructure the `(crm)` tree for the same result, and the `?c=` pattern is already specified and tested.

### 5. Revalidation covers the four screens

`rev(locale)` revalidates `/{locale}/dashboard/crm`, `/companies`, `/deals` and `/tasks`. All four pages are `force-dynamic`. Revalidating from an action is what refreshes the screen behind an open drawer, for instance a reminder marked done in the drawer leaving the Reminders list.

**Rejected:** `revalidatePath('/{locale}/dashboard/crm', 'layout')`. No layout file exists at that segment, and an explicit list is easier to reason about and to test.

### 6. Deals: the screen owns the header, the board owns the columns

`components/CrmAddDeal.tsx` is the header's primary action and the inline form below it (§9: "inline expansion over modals"). It keeps the board's fields (title, value, person) and adds what the board never had:
- the Hebrew "a title is needed" message;
- the Hebrew "not saved" message;
- the 15-second race.

`CrmDealBoard` keeps the columns, drag, ‹ ›, lose and the empty line. It drops its `<h2>`, its form and its `contacts` prop, and builds card links from `usePathname()`. The Deals page computes the money figures moved from the home, under the new rule that the won figure needs at least one won deal.

**Rejected:** rendering the board's own header as the screen's header. The `h1` and the one primary action would then live inside a client component built for columns, and Deals would no longer follow the contacts screen's pattern (`CrmAddContact` as the header action).

### 7. Companies: grouped on the server, opened on the client

The page loads three things, all scoped to the workspace:
- `crm_companies`: `id, name`, by name, `limit 501`. The 501st row is only there to say "more".
- `crm_contacts` where `company_id is not null`: `id, full_name, status, score, company_id, last_activity_at`, by score, `limit 2000`.
- `crm_deals` with status `open` or `won`: `id, title, value, stage, status, contact_id, company_id`, `limit 1000`.

On the server, the page groups:
- people by `company_id`;
- a deal under `deal.company_id`, or else under its person's company, de-duplicated;
- last activity as the latest `last_activity_at`, turned into relative text with the home's clock.

`CrmCompanyList` receives finished rows. It filters and expands in memory, like `CrmContactList`. Which companies are open is client state, a `Set` of ids: closing a drawer re-renders the page but keeps the list mounted, so open companies stay open.

**Markup:**
- Each row is an `<li>` holding a full-width `<button aria-expanded aria-controls>` with the four values.
- The column head is decorative (`aria-hidden`). Each value carries its label: `sr-only` from `md`, visible on a phone.
- The panel is a sibling `<div id>`.
- People are `<Link href="?c=<id>" scroll={false} data-contact-row>`.

**Writes:** `crmCreateCompany` and `crmRenameCompany` in `app/crm-actions.ts`.
- **Guard:** `canWrite`, plus a trimmed length of 1 to 80.
- **Duplicates:** checked in code, not with `ilike`. The action loads the workspace's company names (`id, name`) and compares them trimmed and lower-cased, so a change of case alone counts as the same name. A rename excludes the company itself. `ilike` was tried first and dropped during implementation: PostgREST turns `*` in a pattern into a wildcard, and no escape for it reaches Postgres. A workspace has few companies, so loading the names costs little.
- **Scope:** every insert and update is limited to the workspace.
- **Result:** `{ ok } | { error, message }`, with the message in Hebrew.
- **Add:** shows the row once the server answers, since it needs the new id.
- **Rename:** optimistic (`useOptimistic`), and unwinds on failure.
- **Both:** race the 15-second timeout.

**Rejected:**
- **`role="table"`, as on the contacts list.** A row that expands into nested lists is not a table row. A disclosure list is what assistive technology expects.
- **`?co=<id>` in the URL.** It would be a second parameter to keep in step with `?c=`, for state nobody shares.
- **A unique index on `(workspace_id, lower(name))`.** It needs a migration, and it would fail on any duplicates the Google import already made.

### 8. Reminders: grouped on the server by Israel's day

The page loads open `crm_tasks` with `crm_contacts(full_name)`:
- columns `id, title, due_date, created_at, contact_id`;
- ordered by `due_date` ascending with nulls last, then `created_at` ascending;
- `limit 501`.

It groups with `todayInIsrael()` and formats due dates on the server.

**Done** calls `crmUpdateTask({ done: true })`, as the drawer does. The timeline entry, the no-touch rule and the next reminder taking its place on the home row all follow from that.
- **Optimistic removal** (`useOptimistic`), raced against 15 seconds.
- **On failure** the row comes back with the message.
- **`notfound`** means the reminder was already done elsewhere. It counts as success: the row stays gone, and the action's `.eq('status','open')` guarantees a single timeline entry.
- **Focus** then moves to the next row's control, or else to the `h1` (`tabIndex={-1}`).

**One clock everywhere:** the contacts row and the drawer switch from the UTC date to `todayInIsrael()` for "overdue", so all three surfaces agree after midnight in Israel.

**Rejected:**
- **Grouping on the client.** That would add a second clock beside the server's.
- **Undo after done** (proposal Non-goals). Reopening needs a new action and a compensating timeline entry.

### 9. Loading states

Each new screen gets its own `loading.tsx` in its real shape:
- Companies and Reminders: title row, then rows;
- Deals: title row, figures line, six columns.

This follows §18. `dashboard/loading.tsx` stays for the other screens, and Known Drift #6 stays open.

### 10. Labels and icons

**Labels:** `תזכורות` / `Reminders` for the fourth item, matching `nextStep: 'תזכורת'` and the contacts list's `תזכורת` column. The route and the capability stay `tasks`, after the `crm_tasks` table.

**Icons:**

| Item | lucide icon |
|---|---|
| Contacts | `Contact` |
| Companies | `Building2` |
| Deals | `Handshake` |
| Reminders | `Bell` (the contacts list's reminder icon) |
| Business details | `Store` (moves off `Building2`, so no two items share one) |
| Team | `Users` |
| Automations | `Workflow` |
| Connections | `Plug` |
| API | `KeyRound` |
| Gear | `Settings` |
| `חזרה ל-CRM` | `ArrowLeft` with `rtl:rotate-180`, so it points right in Hebrew |

All of these are in lucide-react 0.469.0.

### 11. Archive order

This change modifies or removes requirements that unarchived changes add or rewrite:

| Capability | Comes from |
|---|---|
| `crm-shell` side menu | `crm-quotes` |
| `crm-home` header and figures | `crm-lead-details-and-reminders` |
| `crm-client-workspaces` | `crm-lead-details-and-reminders` |
| `crm-workspaces` | `crm-multi-workspace`, itself after `crm-team-invites` |
| `crm-connections` | `crm-connect-google-and-make` |

It is archived after all of them. Archived before them, those changes would rewrite requirements this change replaces or removes, or fail outright. `openspec validate --strict` reports the three target specs that don't exist yet as INFO today.

## Risks / Trade-offs

- [Two clicks to a setting instead of one] → The gear opens the first setting and the list stays in the menu. The command bar still finds every screen by name.
- [A query added to every CRM page: the workspaces list for the profile menu] → It is one indexed query that the home already made.
- [Two writers create the same company name in the same second] → Rare, harmless, and fixable by rename. A unique index needs a migration (Decision 7).
- [More than 2,000 people linked to companies undercounts them] → Far from today's volume, where the home lists 200 contacts. The limit is noted in DESIGN.md.
- [Reminders past the 500th are not listed] → A line says so, and the ones shown are the nearest due.
- [Safari does not focus a link on click, so focus return could miss] → The capture-phase opener record (Decision 4).
- [People used to Team and API in the sidebar look for them there] → The gear, the "חזרה ל-CRM" round trip, and the command bar.
- [A task with no person (`contact_id` null)] → It is listed as `ללא איש קשר` with no link. Every code path that writes tasks today sets a person.

## Migration Plan

- No data migration.
- The tasks keep the build deployable after each step:
  1. the shared loader (no visible change);
  2. the three new screens, reachable by URL before the menu changes;
  3. the switch of the shell and the menus;
  4. clean-up.
- Deploy: `firebase deploy --only apphosting:helix-crm --project helix-fc9de` from the repo root. The marketing site and its static export are not touched.
- Rollback: redeploy the previous commit. Nothing stored changes shape.
