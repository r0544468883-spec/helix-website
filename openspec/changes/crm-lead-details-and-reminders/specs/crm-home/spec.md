## MODIFIED Requirements

### Requirement: The home opens on the work, not on a headline

The CRM home SHALL open with a compact header holding the workspace name and at most one primary action. The workspace switcher SHALL be in the header only when the user can reach two or more workspaces. With one workspace, its name SHALL be the header's visible title, and no switcher control SHALL render. The header SHALL NOT carry an overflow ("עוד") control; occasional screens live in the CRM side menu. It SHALL NOT show a product-name headline or a marketing subtitle. The contact list SHALL begin within the first 360px of the page at a 1440×900 viewport.

#### Scenario: Desktop first screen

- **WHEN** a member loads `/he/dashboard/crm` at 1440×900 with 12 contacts
- **THEN** the header shows the workspace name and "ליד חדש", no "HELIX CHIEF CRM — ניהול לקוחות ולידים" headline is present, and the first contact row is visible without scrolling

#### Scenario: Phone first screen

- **WHEN** a member loads the CRM home at 390×844
- **THEN** the header fits on at most two lines with no horizontal scroll, every header control is at least 44px on its smaller side, and at least the first contact row is visible without scrolling

#### Scenario: A viewer's header

- **WHEN** a user with the `viewer` role loads the CRM home
- **THEN** the header shows no primary action and the read-only notice appears once under it

#### Scenario: One workspace, as its admin

- **WHEN** Eran, admin of HELIX and of no other workspace, loads `/he/dashboard/crm`
- **THEN** the header shows `HELIX` as its visible title, and no workspace menu control is on the page

#### Scenario: Two workspaces

- **WHEN** an admin who can reach HELIX and the client workspace `מאפיית נורית` loads the CRM home
- **THEN** the header shows the switcher naming the active workspace, in place of the plain title

#### Scenario: A long Hebrew workspace name at 390px

- **WHEN** a single-workspace member whose workspace name is 50 Hebrew characters loads the CRM home at 390×844
- **THEN** the title reads right to left and truncates with an ellipsis on one line, "ליד חדש" stays fully visible, and nothing scrolls horizontally

### Requirement: The pipeline figures are one line, and say nothing false

The home SHALL show the pipeline figures as a single line of text under the header, not as tiles. When the workspace has no deals, the line SHALL show only the contact count and SHALL NOT show value, won or win-rate figures. The contact count SHALL use Hebrew number agreement: `איש קשר אחד` for one, `שני אנשי קשר` for two, and `{n} אנשי קשר` from three. In English it SHALL read `1 contact` for one and `{n} contacts` otherwise.

#### Scenario: A workspace with deals

- **WHEN** a workspace has 30 contacts, 4 of them hot, and 6 deals worth ₪48,000 open, 2 won worth ₪20,000 and 1 lost
- **THEN** one line reads the contact count, the hot count, ₪48,000 open, ₪20,000 won and a 67% win rate, all on one line at 1440px

#### Scenario: A workspace with contacts and no deals

- **WHEN** a workspace has 1 contact and 0 deals
- **THEN** the line reads `איש קשר אחד` only, and no "₪0", no "0%" and no `1 אנשי קשר` appears on the page

#### Scenario: Two contacts

- **WHEN** a workspace has 2 contacts and 0 deals
- **THEN** the line reads `שני אנשי קשר`

#### Scenario: One contact in English

- **WHEN** the same one-contact workspace is loaded at `/en/dashboard/crm`
- **THEN** the line reads `1 contact`

#### Scenario: Figures wrap on a phone

- **WHEN** the workspace with deals is shown at 390px wide
- **THEN** the figures wrap onto additional lines within the column, no figure is cut off, and each amount keeps its ₪ sign and digits in order
