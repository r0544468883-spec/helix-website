## MODIFIED Requirements

### Requirement: The CRM screens are listed in a side menu on the start edge

Every CRM screen SHALL show one menu listing the CRM screens (contacts, automations, team, business details, API) on the start edge of the page: the right in Hebrew, the left in English. At 1024px and wider the menu SHALL be always visible. Below 1024px it SHALL open from that same edge from a menu button in the nav. The current screen SHALL be marked in the menu with `aria-current="page"`.

#### Scenario: Hebrew desktop

- **WHEN** a signed-in user views `/he/dashboard/crm` at 1440px
- **THEN** the menu is visible on the right side of the page, "אנשי קשר" is marked current, and no "עוד" button is shown

#### Scenario: English desktop

- **WHEN** a signed-in user views `/en/dashboard/crm` at 1440px
- **THEN** the menu is visible on the left side of the page

#### Scenario: Phone

- **WHEN** a signed-in user taps the menu button at 390px in Hebrew
- **THEN** the menu slides in from the right, covers the full height of the screen, and closing it returns focus to the button

#### Scenario: Autonomy is not offered

- **WHEN** a signed-in admin looks at the side menu or types "אוטונומיה" in the command bar
- **THEN** no autonomy entry is offered, and `/he/dashboard/crm/autonomy` still renders when loaded directly

#### Scenario: Business details in the menu

- **WHEN** a signed-in user views the side menu at 1440px in Hebrew
- **THEN** "פרטי העסק" is listed after "צוות" and before "API", selecting it opens `/he/dashboard/crm/business`, and it is marked current there
