## Purpose

The chrome around every CRM screen, the top nav and the footer, and what it names and links to, so the user always knows they are inside HELIX CHIEF CRM and not the retired STAGE product.

## ADDED Requirements

### Requirement: The shell names the CRM, not STAGE

The footer on every CRM screen SHALL name HELIX CHIEF CRM and SHALL link to https://helix.co.il. No CRM screen SHALL show the words "HELIX STAGE" or the STAGE tagline.

#### Scenario: Footer on the CRM home

- **WHEN** a signed-in user scrolls to the bottom of `/he/dashboard/crm`
- **THEN** the footer reads HELIX CHIEF CRM, its HELIX link opens https://helix.co.il, and "HELIX STAGE" and "הבמה של הסטארטאפים" appear nowhere on the page

#### Scenario: Footer in English

- **WHEN** a signed-in user views `/en/dashboard/crm`
- **THEN** the footer text is in English and names HELIX CHIEF CRM

### Requirement: The nav offers no action that goes nowhere

For a signed-in user, the nav SHALL NOT show a primary button that links to the CRM home. It SHALL show the CRM link, the language switch and sign-out. The link to the account portal SHALL show that it opens a new tab.

#### Scenario: Signed-in nav

- **WHEN** a signed-in user views any CRM screen at 1440px
- **THEN** the nav shows CRM, the account-portal link, the language switch and sign-out, and no "הכניסה שלי" button

#### Scenario: Signed-out nav

- **WHEN** a signed-out visitor views `/he/login`
- **THEN** the nav shows a sign-in action and no sign-out

#### Scenario: Account portal link

- **WHEN** a user activates the account-portal link
- **THEN** https://my.helix.co.il opens in a new tab, and the link's accessible name says it opens in a new tab

### Requirement: CHIEF is not offered in navigation

No CRM navigation surface (the nav, the command bar, the "עוד" menu) SHALL link to CHIEF. The CHIEF screen SHALL remain reachable by its direct address for anyone who already has it.

#### Scenario: Nav without CHIEF

- **WHEN** a signed-in user views any CRM screen at 1440px
- **THEN** the nav shows no CHIEF link

#### Scenario: Command bar search

- **WHEN** a user opens the command bar and types "CHIEF"
- **THEN** no CHIEF screen is offered as a result

#### Scenario: Direct address still works

- **WHEN** a signed-in user loads `/he/chief` directly
- **THEN** the CHIEF screen renders as before

### Requirement: The shell speaks the screen's language

Every nav and footer label SHALL come from the active locale. None SHALL be fixed Hebrew on an English screen.

#### Scenario: English screen

- **WHEN** a user views `/en/dashboard/crm`
- **THEN** every nav and footer label is in English, including the account-portal link and sign-out

### Requirement: The shell works on a phone

At 390px wide the nav SHALL fit one row with no horizontal scroll. Every control SHALL be at least 44px on its smaller side, and the footer SHALL stack without cutting any text.

#### Scenario: Nav and footer at 390px

- **WHEN** a signed-in user views the CRM home at 390px wide in Hebrew
- **THEN** the logo, language switch and sign-out fit on one row, each control is at least 44px, and the footer lines stack right-aligned with nothing cut off
