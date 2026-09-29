## MODIFIED Requirements

### Requirement: The nav offers no action that goes nowhere

For a signed-in user, the nav SHALL NOT show a primary button that links to the CRM home. It SHALL show the CRM link, the language switch, the theme switch and sign-out. The link to the account portal SHALL show that it opens a new tab.

#### Scenario: Signed-in nav

- **WHEN** a signed-in user views any CRM screen at 1440px
- **THEN** the nav shows CRM, the account-portal link, the language switch, the theme switch and sign-out, and no "הכניסה שלי" button

#### Scenario: Signed-out nav

- **WHEN** a signed-out visitor views `/he/login`
- **THEN** the nav shows a sign-in action and no sign-out

#### Scenario: Account portal link

- **WHEN** a user activates the account-portal link
- **THEN** https://my.helix.co.il opens in a new tab, and the link's accessible name says it opens in a new tab
