## Why

On 2026-09-28 Eran opened a lead in the CRM and hit four problems on one screen:
- **The top bar covers the drawer.** It paints over the drawer's top 64px: the lead's name, their status and the close button. That header is what `crm-lead-drawer` was built to show. The cause is the CRM layout, which wraps the page in a `relative z-10` layer. Every drawer, sheet and dialog opened from inside that layer stays under the sticky bar (`z-50`), and the dimmed backdrop leaves the bar clickable. The add-contact sheet and two dialogs are in the same trap.
- **The drawer shows no details about the lead.** Email, phone and LinkedIn appear as bare links and the score as a bare number. The CRM stores more than it shows:
  - where the lead came from;
  - when they arrived;
  - a free-text field, `notes`, that nothing reads or writes.
  
  Nothing about a person can be corrected either, so a wrong phone number stays wrong.
- **"הצעד הבא" doesn't explain itself.** With nothing set, it is a heading over an empty field and a greyed-out save button. In Eran's words: "i dont understand what is the next step".
- **The "HELIX ▾" workspace switcher shows to every admin.** With one workspace it is a menu with a single row, and it replaces the page title. Eran: "we dont need this button". Its "add client" action uses the browser's `prompt()` and `alert()`.

This goes before phase 1 of the redesign (the sidebar) for two reasons: the drawer is where every lead gets worked, and the covered header is live in production. Scope was agreed on 2026-09-28: the switcher, the covering bug, the details and the reminder. The home screen becomes the "Today" change next.

**Surface: `helix-crm/` only.** No database migration, because `notes` and `source` already exist on `crm_contacts`. No change to the public API, and nothing on the marketing site.

## What Changes

- **Every overlay opens above the top bar.**
  - The shared drawer, sheet and dialog render at the top level of the page.
  - They follow one explicit stacking order: the top bar, then drawers and sheets, then dialogs and anything opened from inside a drawer, then ⌘K.
  - The leftover `relative z-10` leaves the CRM layout. It was copied from the STAGE layout, where it lifts the page above floating logos the CRM doesn't have.
  - This fixes the contact drawer, the add-contact sheet, the deal board's lost-deal question and the drawer's discard question.
- **The drawer gets a "פרטים" (details) section**, at the top of its body in place of the bare links.
  - Labelled rows: phone, email, company, role, LinkedIn, source, background (`רקע`, the stored `notes`), date added, last touch and score. The score row shows its tier word and the signals behind it.
  - Only filled rows show. The empty ones collapse into one "+ הוספה" line.
  - The bare score number leaves the header.
- **Details are edited in place.**
  - One "עריכה" turns the rows into fields, and one save stores them all: name, phone, email, company (one the workspace already has), role, LinkedIn, source and background.
  - The score is recalculated. An edit is not a touch and writes no timeline entry.
  - Bad input is refused with a Hebrew message. A LinkedIn value must be an `http(s)` address. A stored value that isn't one renders as plain text, never as a link.
- **"הצעד הבא" becomes "תזכורת".**
  - With none set, the region is one "+ תזכורת" button instead of an open empty form.
  - The due date gets three quick picks beside the date field: מחר, בעוד 3 ימים and בעוד שבוע, counted in Israeli calendar days.
  - The region gets a bell icon, and the "more" line says תזכורות.
- **A logged call or meeting asks "מה הלאה?".** When the person has no open reminder, the reminder form opens right after the call or meeting is saved. "לא עכשיו" closes it with nothing stored.
- **The workspace switcher shows only when there is a choice**, meaning two or more workspaces.
  - With one, the page shows the workspace name as its title.
  - The switcher no longer holds an add action.
- **Adding a client workspace moves to the Team page.**
  - A "סביבות לקוחות" card lists the clients and holds a proper form. It is shown to the admin of a workspace that is not itself a client.
  - A client workspace cannot add clients, and the server refuses that too.
  - Names are capped at 80 characters.
- **One grammar fix on the same screen:** the figures line reads "איש קשר אחד", not "1 אנשי קשר".

## Capabilities

### New Capabilities
- `crm-client-workspaces`: adding a client workspace from the Team page, who may do it, and what the switcher offers once there is more than one workspace.

### Modified Capabilities
- `crm-overlays`: an open overlay sits above the CRM's top bar, and an overlay opened from inside another sits above the one it came from.
- `crm-contact-drawer`:
  - the drawer's contents: labelled details replace the bare links;
  - new requirements for showing and editing the lead's details;
  - the discard question covers unsaved details and the reminder.
- `crm-next-step`:
  - the region is named "תזכורת" and is one button when empty;
  - quick date picks;
  - the offer after a logged call or meeting.
- `crm-home`:
  - the header shows the switcher only with two or more workspaces;
  - the figures line uses Hebrew number agreement.

## Impact

**Overlays:**
- `lib/motion/Drawer.tsx`, `Sheet.tsx`, `Dialog.tsx` and `CommandPalette.tsx` render through a new shared `Portal.tsx` into `<body>`, and take their place in one stacking order.
- `app/[locale]/(crm)/layout.tsx` loses `relative z-10` on the page and footer wrappers.
- `CrmStatusPath.tsx`, `CrmNavMenu.tsx` and `CrmDrawerDeals.tsx` drop the portals they carry today. The status list's `z-70` wrapper becomes the primitive's nested layer.

**Drawer:**
- New `components/CrmContactDetails.tsx`: the rows and the edit form.
- `CrmContactDrawer.tsx`: the details go in, and the bare links and the header's score chip come out. It also holds the offer after a logged call or meeting.
- `CrmNextStep.tsx`: the label, the collapsed state, the quick picks and the offered form.
- `app/[locale]/(crm)/dashboard/crm/page.tsx`: the drawer query adds `company_id`, `source`, `notes`, `last_activity_at` and `is_business`, and the page passes the companies to the drawer.

**Server:**
- `app/crm-actions.ts` gains `crmUpdateContactDetails`: workspace-scoped, it validates, re-derives `is_business` and rescores.
- `crmCreateClientWorkspace` refuses inside a client workspace and caps the name at 80 characters.

**Libraries:**
- `lib/crm-score.ts`: `scoreReasons()` has hard-coded Hebrew, leaves out company, phone, LinkedIn and 30-day recency, and nothing calls it. It becomes `scoreSignals()`, which returns keys the dictionary names.
- `lib/crm-dates.ts` gains `addDaysIso`.

**Workspaces:**
- `components/CrmWorkspaceSwitcher.tsx` renders only with two or more workspaces and has no add action.
- The Team page gets a new `components/CrmClientWorkspaces.tsx`.

**i18n:** new and renamed strings in `lib/i18n/he.ts` and `en.ts`.

**Docs:** `helix-crm/DESIGN.md`:
- §8: Contact drawer, a new Contact details block, Next step becomes Reminder, CRM home header, and the switcher under Dropdown / menu.
- A stacking-order table for overlays.
- §15 Known Drift gets updates.
- Bump `Last updated`.

## Non-goals

- **The home screen redesign** (a to-do list, a status strip, deals moving off home) is the next change, "Today".
- **The full contact page** (`/dashboard/crm/[id]`) keeps what it shows. The person page is phase 5.
- **Creating a company from the drawer.** The company field picks from existing companies, like the add-contact form. Companies are phase 4.
- **Duplicate detection** when an edited email matches another contact. The database allows duplicates today, and this change doesn't alter that.
- **An edit history.** Details edits write no timeline entry.
- **Firing `contact.updated` automations.** The builder offers that trigger, but nothing fires it today. Wiring it is its own change.
- **Moving the switcher into a sidebar** (phase 1), listing a client workspace's members, and deleting a client workspace.
