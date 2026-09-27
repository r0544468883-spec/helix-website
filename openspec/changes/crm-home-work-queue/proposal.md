## Why

Eran opens the CRM home page to answer one question: who to call now. The page he gets does not answer it, and on desktop it is partly broken. Two overlays that are meant to be closed, the contact drawer and the "עוד" menu, sit on top of the page at 86% opacity. They dim about 40% of the width and swallow clicks, so clicking a contact row in that area does nothing. This was confirmed on crm.helix.co.il on 2026-09-27 at 1900px width. The cause is in `lib/motion/Drawer.tsx`. It works out the text direction from `document`, which the server does not have, so the server anchors the panel to one edge while the browser hides it toward the other. The bug went live with the shell change of the same day, because that change mounted two drawers on the home page.

Around the bug, the page is built for a visitor, not an operator:
- It opens with a marketing headline ("HELIX CHIEF CRM — ניהול לקוחות ולידים") and a sales subtitle.
- Five number tiles come next. With one contact they read 0, ₪0, ₪0 and 0%.
- A contact row shows the name at one edge and the status at the other, with nothing between them.
- Nothing on the page says when a person was last contacted or what the next step is, although `last_activity_at` and open `crm_tasks` rows already hold both.
- The shell still wears the old product. The footer reads "HELIX STAGE — הבמה של הסטארטאפים הישראליים" and links to a stale Vercel address. The nav's primary button is "הכניסה שלי", which leads to the page you are already on.

**Surface: `helix-crm/` only.** No database migration, no API change, and nothing on the marketing site.

## What Changes

- **Closed overlays stop covering the page.** Drawer, Sheet and Dialog in `lib/motion` resolve the direction the same way on the server and the browser. A closed overlay takes no clicks, is not visible and is out of the tab order. This fixes the ghost panels and DESIGN.md §15 row 9.
- **The home page becomes a work queue.**
  - A compact header: the workspace name, the switcher, "עוד" and the one primary action. The marketing H1 and subtitle go.
  - The five tiles become one line of figures under the header. When the workspace has no deals, the line shows only the contact count.
  - The contact list moves to the top of the page.
  - Each row shows the status next to the name, when the contact was last touched ("לפני 3 ימים", "טרם"), and the next open task with its due date when one exists.
  - A row whose contact is in an active status and untouched for 14 days or more is marked as needing a touch. A filter chip narrows the list to those rows.
- **The deal board steps back when empty.** With no deals it collapses to one line with the add-deal action, instead of six empty columns. With deals it renders as it does today, below the list.
- **The shell sheds the STAGE identity.** The footer names HELIX CHIEF CRM, links to helix.co.il and has no STAGE tagline. The redundant "הכניסה שלי" button is removed for a signed-in user. The hardcoded Hebrew in `Nav.tsx` moves into `lib/i18n`, which fixes DESIGN.md §15 row 5 for the nav.
- **A side menu replaces "עוד", autonomy is hidden, Hebrew is right-aligned (Eran's request after the first deploy, 2026-09-27).** The CRM screens move into a menu on the start edge, always visible from 1024px and behind a nav button below it. The autonomy screen leaves every menu like CHIEF. Nothing on a Hebrew screen is left-aligned any more.
- **CHIEF is hidden (Eran's request, 2026-09-27).** CHIEF leaves the nav and the command bar. The `/chief` route and its API stay reachable by direct URL, so bringing it back is one line in each place. The product name HELIX CHIEF CRM is unchanged.

## Capabilities

### New Capabilities
- `crm-overlays`: how a CRM overlay (drawer, sheet, dialog) behaves when closed and when open, in both text directions, so it never covers or blocks the page it belongs to.
- `crm-home`: what the CRM home screen shows and in what order, so it answers "who do I contact next" first.
- `crm-shell`: the chrome around every CRM screen (nav, footer) and what it names and links to.

### Modified Capabilities
None. The only existing main spec, `crm-team-roles`, keeps its requirements. The read-only behaviour for a viewer carries over to the new rows and the collapsed board unchanged.

## Impact

**Motion primitives (`helix-crm/lib/motion/`):** `Drawer.tsx`, `Sheet.tsx`, `Dialog.tsx`. Direction handling and the closed state. The drawer and sheet consumers drop their `inert` / `{open && …}` workarounds once the primitives handle it.

**Home screen:** `app/[locale]/(crm)/dashboard/crm/page.tsx` (layout order, header, figures line, two extra columns fetched: `last_activity_at`, plus each contact's next open task), `components/CrmContactList.tsx` (row layout, last-touch, next task, the needs-a-touch filter) and `components/CrmDealBoard.tsx` (collapsed empty state).

**Shell:** `components/Nav.tsx`, `components/Footer.tsx`, `components/HelixCommandBar.tsx`, `lib/i18n/he.ts`, `lib/i18n/en.ts`.

**Docs:** `helix-crm/DESIGN.md`. §8 gets the new row and figures line, §9 the home layout, and §15 rows 5 and 9 are fixed and removed.

**Data:** read-only use of existing columns. `crm_contacts.last_activity_at` exists. `crm_tasks` (v13) has `contact_id`, `title`, `due_date` and `status`. No migration.

## Non-goals

- **No task management UI.** The row shows the next open task. Creating, completing or editing tasks from the home page is a separate change.
- **No change to scoring**, to the status set or to the list's sort order (score, highest first).
- **No redesign of the contact drawer, the record page or the deal board's populated state.** The board keeps its drag, springs and columns when it has deals.
- **No change to other screens** (automations, email, CHIEF, team, API) beyond the shared nav and footer.
- **No people-by-status kanban.** DESIGN.md §16 keeps that question open.
- **No white-label rework.** The accent override bug (§15 row 7) is left as it is.
