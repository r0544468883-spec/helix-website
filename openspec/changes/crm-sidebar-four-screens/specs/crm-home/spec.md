## MODIFIED Requirements

### Requirement: The home opens on the work, not on a headline

The CRM home is the contacts screen. It SHALL open with a compact header holding the title `אנשי קשר` and at most one primary action. The header SHALL NOT hold:
- the workspace's name or the workspace switcher (both are in the profile menu);
- an overflow ("עוד") control;
- a product-name headline or a marketing subtitle.

The home SHALL NOT show the deal board, which is on the Deals screen. The contact list SHALL begin within the first 360px of the page at a 1440×900 viewport.

#### Scenario: Desktop first screen

- **WHEN** a member loads `/he/dashboard/crm` at 1440×900 with 12 contacts
- **THEN** the header shows `אנשי קשר` and "ליד חדש", no "HELIX CHIEF CRM — ניהול לקוחות ולידים" headline is present, and the first contact row is visible without scrolling

#### Scenario: Phone first screen

- **WHEN** a member loads the CRM home at 390×844
- **THEN** the header fits on one line with no horizontal scroll. Every header control is at least 44px on its smaller side, and at least the first contact row is visible without scrolling

#### Scenario: A viewer's header

- **WHEN** a user with the `viewer` role loads the CRM home
- **THEN** the header shows `אנשי קשר` and no primary action, and the read-only notice appears once under it

#### Scenario: One workspace, as its admin

- **WHEN** Eran, admin of HELIX and of no other workspace, loads `/he/dashboard/crm`
- **THEN** the header's visible title is `אנשי קשר`, no workspace control is in the header, and the profile control names `HELIX`

#### Scenario: Two workspaces

- **WHEN** an admin who can reach HELIX and the client workspace `מאפיית נורית` loads the CRM home
- **THEN** the header shows `אנשי קשר` and no workspace switcher, and the profile control names the active workspace

#### Scenario: A long Hebrew workspace name at 390px

- **WHEN** a single-workspace member whose workspace name is 50 Hebrew characters loads the CRM home at 390×844
- **THEN** the header shows `אנשי קשר` and "ליד חדש" on one line. The workspace name is not in the header, and nothing scrolls horizontally

#### Scenario: No deal board on the home

- **WHEN** a member loads the CRM home of a workspace with 6 deals
- **THEN** no deal board and no "צינור עסקאות" section is on the page, and the side menu offers `עסקאות`

#### Scenario: English header

- **WHEN** a member loads `/en/dashboard/crm`
- **THEN** the header reads `Contacts` and the primary action is in English

## REMOVED Requirements

### Requirement: The pipeline figures are one line, and say nothing false

**Reason**: The money figures moved to the Deals screen with the board (`crm-deals`: "The money figures are one line on the Deals screen, and say nothing false"). The contacts screen counts people only: see "The contact figures are one line" below.
**Migration**: Nothing to migrate. Open value, won value and win rate are on `/{locale}/dashboard/crm/deals`, and the contact count stays on the home.

### Requirement: An empty deal board does not take the screen

**Reason**: The deal board left the home for the Deals screen. The same rule, no empty columns and one line instead, now belongs to that screen (`crm-deals`: "An empty Deals screen shows no empty columns").
**Migration**: Nothing to migrate. The board, its empty line and its add action are on `/{locale}/dashboard/crm/deals`.

## ADDED Requirements

### Requirement: The contact figures are one line

The contacts screen SHALL show one line of figures under its header:
- the number of contacts in the workspace, counted in full even when the list shows only the first 200;
- the number of hot contacts, only when at least one is hot.

The contact count SHALL use Hebrew number agreement: `איש קשר אחד` for one, `שני אנשי קשר` for two, and `{n} אנשי קשר` from three. In English it SHALL read `1 contact` for one and `{n} contacts` otherwise. No money figure SHALL appear on the contacts screen.

#### Scenario: Contacts and hot contacts

- **WHEN** a workspace has 30 contacts, 4 of them hot
- **THEN** the line reads `30 אנשי קשר` and `4 חמים`

#### Scenario: No hot contact

- **WHEN** a workspace has 1 contact and it is not hot
- **THEN** the line reads `איש קשר אחד` only, and no `0 חמים` and no `1 אנשי קשר` appears on the page

#### Scenario: Two contacts

- **WHEN** a workspace has 2 contacts
- **THEN** the line begins `שני אנשי קשר`

#### Scenario: More contacts than the list shows

- **WHEN** a workspace has 250 contacts
- **THEN** the line reads `250 אנשי קשר`, and the list says it shows the first 200

#### Scenario: One contact in English

- **WHEN** a one-contact workspace is loaded at `/en/dashboard/crm`
- **THEN** the line reads `1 contact`

#### Scenario: No money on the contacts screen

- **WHEN** a workspace with open and won deals loads its contacts screen
- **THEN** no ₪ figure and no win rate appear on the page

#### Scenario: Figures at 390px

- **WHEN** the contacts screen of a workspace with hot contacts renders at 390px wide
- **THEN** the figures fit the column, wrapping if they must, with no figure cut off and no horizontal scroll
