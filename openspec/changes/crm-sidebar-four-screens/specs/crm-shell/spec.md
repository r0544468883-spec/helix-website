## MODIFIED Requirements

### Requirement: The nav offers no action that goes nowhere

For a signed-in user on a CRM screen, the nav SHALL show:
- the logo, which opens the contacts screen;
- the settings control;
- the profile control;
- below 1024px wide, the menu button.

It SHALL NOT show any of these:
- a primary button;
- a text link to the CRM;
- its own language switch, theme switch, account-portal link or sign-out (these are in the profile menu).

A signed-out visitor's nav SHALL show the language switch and a sign-in action, and no sign-out. The account-portal item SHALL open https://my.helix.co.il in a new tab and SHALL say so in its accessible name.

#### Scenario: Signed-in nav

- **WHEN** a signed-in user views any CRM screen at 1440px
- **THEN** the nav shows the logo, the settings control and the profile control. It shows no `CRM` link, language switch, theme switch, account-portal link, sign-out or "הכניסה שלי" button

#### Scenario: Signed-out nav

- **WHEN** a signed-out visitor views `/he/login`
- **THEN** the nav shows a sign-in action and no sign-out

#### Scenario: Account portal link

- **WHEN** a user activates `האיזור האישי` in the profile menu
- **THEN** https://my.helix.co.il opens in a new tab, and the item's accessible name says it opens in a new tab

### Requirement: The shell works on a phone

At 390px wide the signed-in nav SHALL fit one row with no horizontal scroll: the menu button, the logo, the settings control and the profile control. The profile control SHALL show the person's initial only below 768px. Every control SHALL be at least 44px on its smaller side, and the footer SHALL stack without cutting any text.

#### Scenario: Nav and footer at 390px

- **WHEN** a signed-in user views the CRM home at 390px wide in Hebrew
- **THEN** the menu button, logo, settings control and profile control fit on one row. Each control is at least 44px, and the footer lines stack right-aligned with nothing cut off

#### Scenario: A long workspace name at 390px

- **WHEN** the active workspace is named `סטודיו לעיצוב פנים ואדריכלות נוף בע״מ` and a CRM screen renders at 390px wide
- **THEN** the profile control shows the person's initial only, the nav stays on one row, and nothing scrolls horizontally

### Requirement: The CRM screens are listed in a side menu on the start edge

Every CRM screen outside Settings SHALL show one menu on the start edge of the page: the right in Hebrew, the left in English. It SHALL list the four CRM screens and nothing else, in this order: `אנשי קשר`, `חברות`, `עסקאות`, `תזכורות`. At 1024px and wider the menu SHALL always be visible. Below 1024px it SHALL open from that same edge, from a menu button in the nav.

The current screen SHALL be marked with `aria-current="page"`:
- a contact's full page and a quote's editor mark `אנשי קשר`;
- a screen reached only from the profile menu or by its direct address marks none of the four. That covers the new-workspace form, autonomy and CHIEF.

#### Scenario: Hebrew desktop

- **WHEN** a signed-in user views `/he/dashboard/crm` at 1440px
- **THEN** the menu is visible on the right side of the page and lists exactly `אנשי קשר`, `חברות`, `עסקאות` and `תזכורות`, in that order. `אנשי קשר` is marked current, and no "עוד" button is shown

#### Scenario: English desktop

- **WHEN** a signed-in user views `/en/dashboard/crm` at 1440px
- **THEN** the menu is visible on the left side of the page and lists `Contacts`, `Companies`, `Deals` and `Reminders`

#### Scenario: Each screen marks itself

- **WHEN** a signed-in user selects `חברות` in the menu
- **THEN** `/he/dashboard/crm/companies` opens, and `חברות` is the only item marked current

#### Scenario: A screen outside the four

- **WHEN** a signed-in user opens `/he/dashboard/crm/workspaces/new`
- **THEN** the menu lists the four screens and marks none of them current

#### Scenario: Phone

- **WHEN** a signed-in user taps the menu button at 390px in Hebrew
- **THEN** the menu slides in from the right, covers the full height of the screen and lists the same four screens. Closing it returns focus to the button

#### Scenario: Autonomy is not offered

- **WHEN** a signed-in admin opens the side menu, on any screen and in Settings
- **THEN** no autonomy entry is listed, and `/he/dashboard/crm/autonomy` still renders when loaded directly

#### Scenario: Business details in the menu

- **WHEN** a signed-in user opens `/he/dashboard/crm/business`
- **THEN** the side menu shows the settings list with `פרטי העסק` marked current, and the four CRM screens are not listed

## ADDED Requirements

### Requirement: Settings holds the screens that set up the workspace

The nav SHALL offer a settings control to every role on every CRM screen. Its accessible name is `הגדרות`, and it opens the business details screen. On every settings screen, the side menu SHALL list, in this order:
- `חזרה ל-CRM` first, which opens the contacts screen;
- `פרטי העסק`;
- `צוות`;
- `אוטומציות`;
- `חיבורים`;
- `API`.

The current one SHALL be marked with `aria-current="page"`. A page reached from a settings screen SHALL keep that screen marked: an automation's own page marks `אוטומציות`, and the Google import page marks `חיבורים`.

The settings screens SHALL keep their addresses:
- `/dashboard/crm/business`;
- `/dashboard/crm/team`;
- `/dashboard/automations`;
- `/dashboard/crm/connections`;
- `/dashboard/crm/api`.

Moving a screen into Settings SHALL NOT change who may open it or what each role may do on it.

#### Scenario: Opening Settings

- **WHEN** a signed-in member selects the settings control on `/he/dashboard/crm`
- **THEN** `/he/dashboard/crm/business` opens. The side menu shows `חזרה ל-CRM`, then `פרטי העסק`, `צוות`, `אוטומציות`, `חיבורים` and `API`, with `פרטי העסק` marked current

#### Scenario: Leaving Settings

- **WHEN** the user selects `חזרה ל-CRM`
- **THEN** the contacts screen opens and the side menu lists the four CRM screens again

#### Scenario: An automation's own page

- **WHEN** a member opens one automation from the automations screen
- **THEN** the side menu still shows the settings list, with `אוטומציות` marked current

#### Scenario: An old address

- **WHEN** a saved link to `/he/dashboard/crm/team` is loaded
- **THEN** the Team screen renders with the settings list in the side menu and `צוות` marked current

#### Scenario: A viewer in Settings

- **WHEN** a user with the `viewer` role selects the settings control
- **THEN** the business details screen opens with the details shown and no control that saves them, as before this change

#### Scenario: Settings in English

- **WHEN** a signed-in user opens `/en/dashboard/crm/business`
- **THEN** the side menu on the left reads `Back to CRM`, `Business details`, `Team`, `Automations`, `Connections` and `API`, and the settings control's accessible name is `Settings`

#### Scenario: Settings on a phone

- **WHEN** a user on a settings screen taps the menu button at 390px in Hebrew
- **THEN** the menu slides in from the right with `חזרה ל-CRM` and the five settings screens. Each row is at least 44px tall, and closing it returns focus to the button

### Requirement: The profile menu holds the person's own controls

For a signed-in user on a CRM screen, the nav SHALL show a profile control at the end of its row, with the accessible name `התפריט שלי`. The control SHALL show:
- the first letter of the person's email address;
- from 768px wide, the active workspace's name, cut short with an ellipsis when it does not fit.

Opening it SHALL show, in this order:
- the signed-in email address, as text;
- the workspaces group, only when the person can reach two or more workspaces;
- `workspace חדש`, for every role;
- the language item, which opens the same screen in the other language. It reads `English` on a Hebrew screen and `עברית` on an English one;
- the theme item, named for what it turns on: `מצב כהה` or `מצב בהיר`;
- `האיזור האישי`, which opens https://my.helix.co.il in a new tab;
- `התנתקות`.

The menu SHALL close on Escape, on a click anywhere outside it and after an item is chosen. Escape SHALL return focus to the profile control. Every row SHALL be at least 44px tall.

#### Scenario: One workspace

- **WHEN** Eran, admin of HELIX and of no other workspace, opens the profile menu
- **THEN** it shows the email address, `workspace חדש`, `English`, `מצב כהה`, `האיזור האישי` and `התנתקות`, in that order, and no workspaces group

#### Scenario: Two workspaces

- **WHEN** an admin who can reach HELIX and `מאפיית נורית` opens the profile menu
- **THEN** a workspaces group between the email address and `workspace חדש` lists both, each with the role held there, and the active one is marked

#### Scenario: Switching language

- **WHEN** a user on `/he/dashboard/crm/tasks` chooses `English`
- **THEN** `/en/dashboard/crm/tasks` opens

#### Scenario: Switching theme

- **WHEN** a user in the light theme chooses `מצב כהה`
- **THEN** the page turns dark at once and is still dark on the next page load

#### Scenario: Signing out

- **WHEN** a user chooses `התנתקות`
- **THEN** the session ends and the sign-in page opens

#### Scenario: Escape

- **WHEN** the profile menu is open and the user presses Escape
- **THEN** the menu closes and focus is on the profile control

#### Scenario: A click outside

- **WHEN** the profile menu is open and the user clicks a contact row on the screen beneath
- **THEN** the menu closes

#### Scenario: An address in a Hebrew menu

- **WHEN** the profile menu shows `eran@helix.co.il` on a Hebrew screen
- **THEN** the address reads left to right, and every Hebrew item is right-aligned and reads right to left

#### Scenario: The profile menu in English

- **WHEN** a user opens the profile menu on `/en/dashboard/crm`
- **THEN** every item is in English except the language item, which reads `עברית`

#### Scenario: The profile menu at 390px

- **WHEN** the profile menu opens at 390px wide
- **THEN** the open menu fits within the viewport, every row is at least 44px tall, and nothing scrolls horizontally
