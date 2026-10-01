## Why

The CRM's side menu mixes two kinds of screen. Eran runs his pipeline in it every day, and the menu he opens has seven items: Contacts, Automations, Team, Business details, Connections, API and "workspace חדש". One of them is where the daily work happens. The rest are set up once and then rarely opened.

A sales CRM is organized around four things: people, companies, deals and tasks. Only people have a screen here:
- deals are a board under the contact list;
- companies and tasks are tables with no screen (`crm_companies` and `crm_tasks`, since migration v13);
- there is no way to create a company in the CRM. A lead's company is picked from a list that only the Google contacts import fills.

On 2026-10-01 Eran shared a screenshot of HubSpot's sidebar and asked for the same four items: Contacts, Companies, Deals and Tasks. Everything else moves to Settings or a profile menu, and he left that split to us. In the exploration the same day he chose the first of three options for companies: a company row opens in place and shows its people and deals.

How the rest was split:
- **Settings** (a gear in the top bar) holds what changes the workspace for everyone: Business details, Team, Automations, Connections, API.
- **The profile menu** (the workspace's name in the top bar) holds what is about the person:
  - who is signed in;
  - their workspaces and "workspace חדש";
  - language and theme;
  - the HELIX account link;
  - sign-out.

**Surface: `helix-crm/` only.** No migration, no new API route, no new dependency. The tables exist, and the role policies of migration v20 already let a member write companies and tasks while a viewer reads them.

## What Changes

- **The side menu lists four screens:** אנשי קשר, חברות, עסקאות, משימות. Inside a settings screen the menu shows the settings list instead, under a "חזרה ל-CRM" row.
- **The signed-in CRM top bar holds four controls:**
  - the menu button (phones only);
  - the logo;
  - the settings gear;
  - the profile button.

  The "CRM" link, the account link, the language switch, the theme switch and sign-out leave the bar. All but the "CRM" link move into the profile menu.
- **The workspace switcher moves from the contacts header into the profile menu,** so a person can switch workspaces from any screen.
- **Contacts** (`/dashboard/crm`):
  - it is titled "אנשי קשר";
  - its figures line counts people only;
  - the deal board and the money figures move to Deals.
- **Deals** (`/dashboard/crm/deals`, new):
  - the deal board as it works today;
  - "עסקה חדשה" as the screen's one primary action;
  - the money figures (open, won, win rate).
- **Tasks** (`/dashboard/crm/tasks`, new):
  - every open task in the workspace, grouped as overdue, today, later and no date;
  - a task can be marked done from the list, with the same effects as from the lead's drawer.
- **Companies** (`/dashboard/crm/companies`, new):
  - a list showing each company's people, open deals and last activity, filterable by name;
  - a row expands in place to show that company's people and deals;
  - a writer can add a company and rename one.
- **The lead's drawer opens over all four screens.** It is addressed in that screen's URL and closes back to it.
- **The command bar** lists the new screens. A deal with no person now opens Deals.
- **The settings screens keep their addresses** (`/dashboard/crm/business`, `/team`, `/connections`, `/api`, `/dashboard/automations`), so existing links and the Google sign-in return keep working.

## Capabilities

### New Capabilities
- `crm-companies`: the Companies screen, covering the list, opening a company in place, and adding and renaming a company.
- `crm-deals`: the Deals screen, covering the board on its own screen, its primary action, its money figures and its empty state.
- `crm-tasks`: the Tasks screen, covering every open task grouped by when it is due, and completing a task from the list.

### Modified Capabilities
- `crm-shell`:
  - the side menu lists the four screens and swaps to the settings list in settings;
  - the signed-in nav is the gear and the profile button;
  - the phone row changes to match.
  - New requirements for Settings and for the profile menu.
- `crm-home`:
  - the header is titled "אנשי קשר" and holds no switcher;
  - the figures line counts people only, so "the pipeline figures" is replaced;
  - the deal-board requirement leaves the home for `crm-deals`.
- `crm-contact-drawer`:
  - the drawer opens over Deals, Tasks and Companies too;
  - its URL is the screen it opened over;
  - closing returns focus to the control that opened it.
- `crm-contact-deals`: a deal card opens its person over the Deals screen, and the palette's deal with no person opens Deals.
- `crm-client-workspaces`: the switcher is a group in the profile menu.
- `crm-workspaces`: "workspace חדש" is in the profile menu, not the side menu.
- `crm-connections`: "חיבורים" is in Settings, not the side menu.

The last three capabilities come from changes that are not archived yet: `crm-lead-details-and-reminders`, `crm-multi-workspace` and `crm-connect-google-and-make`. This change also rewrites requirements that `crm-quotes` and `crm-lead-details-and-reminders` modify in `crm-shell` and `crm-home`. So this change is archived after all four.

## Non-goals

- **A search box in the top bar.** It was offered in the exploration and not confirmed. The command bar stays on ⌘K / Ctrl+K.
- **Deleting or merging companies.** Also out of scope:
  - showing a company's other fields (website, industry, size);
  - creating a company from a lead's form;
  - creating companies from email domains, as HubSpot does.
- **On the Tasks screen:**
  - a "new task" button (a task is about a person and is set from their drawer);
  - assignees or a "my tasks" filter (a task has a creator, not an assignee);
  - undo after marking a task done (the drawer has none either).
- **A table view of deals,** and deal filters.
- **Any change inside the settings screens,** or to their addresses.
- **A Home screen.** The logo keeps opening Contacts.
- **CHIEF and autonomy stay hidden** from every menu. The email campaign screens stay reachable from the command bar only, as today.
- **HubSpot's other top-bar items:** notifications, upgrade, the assistant.

## Impact

**Screens:**
- `app/[locale]/(crm)/dashboard/crm/page.tsx` becomes the contacts screen.
- New `dashboard/crm/companies/`, `dashboard/crm/deals/` and `dashboard/crm/tasks/`, each with a `page.tsx` and a `loading.tsx` shaped like it.

**Components:**
- `components/CrmNavMenu.tsx`: the four screens, plus the settings list.
- `components/Nav.tsx`: the gear and the profile button.
- New `components/CrmProfileMenu.tsx`, `CrmCompanyList.tsx`, `CrmTaskList.tsx`, `CrmAddCompany.tsx` and `CrmAddDeal.tsx`.
- `CrmDealBoard.tsx` loses its own header and add form.
- `CrmContactDrawer.tsx` closes to the screen it opened over.
- `CrmWorkspaceSwitcher.tsx` becomes the profile menu's workspaces group.
- `HelixCommandBar.tsx`: the new screens.

**Server:**
- A shared loader for the drawer, lifted out of the contacts page so all four screens use it.
- `app/crm-actions.ts`: `crmCreateCompany` and `crmRenameCompany`, and revalidation that covers the new screens.

**Strings and docs:**
- `lib/i18n/he.ts` and `en.ts`.
- `helix-crm/DESIGN.md`:
  - §6 containers;
  - §8: side menu, header, dropdown/menu, and the new screens;
  - §9 nav;
  - §16, where the deal-board question is closed;
  - §17 file map;
  - §18 checklist.

**Database:** none.

**Deploy:** the CRM's App Hosting backend only (`firebase deploy --only apphosting:helix-crm`). The marketing site and its static export are untouched.
