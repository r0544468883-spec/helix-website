# crm-theme Specification

## Purpose

How the CRM looks light or dark. It is light by default and dark by choice. The choice is remembered without a flash of the other theme, every screen stays legible in both, and the legacy STAGE pages stay dark.

## Requirements

### Requirement: The CRM opens light by default

A CRM screen SHALL render in the light theme when the browser holds no saved theme choice, whatever the operating system's colour-scheme setting. Every CRM screen SHALL follow the theme: the home, the contact drawer, the full contact page, automations, team, API keys, email and the command palette.

#### Scenario: First visit

- **WHEN** a signed-in user with no saved theme choice loads `/he/dashboard/crm`
- **THEN** the page background is `#FAFAF8`, text is dark on light, and the HTML the server sent already marks the light theme

#### Scenario: The operating system is set to dark

- **WHEN** the same user loads the page with the operating system in dark mode and no saved choice
- **THEN** the CRM still renders light

#### Scenario: Every screen follows

- **WHEN** a user in the light theme loads any CRM screen: the home, a contact drawer, a full contact page, automations, team or API keys
- **THEN** that screen renders on the light background, with no dark panel, card or input left over from the dark theme

### Requirement: Dark is one switch away and is remembered

The signed-in nav SHALL offer a switch that toggles between light and dark. Switching SHALL change the whole screen within 100ms without a page reload. The choice SHALL be kept in this browser, and every later page load SHALL arrive already in the chosen theme, with no frame of the other one. The switch SHALL say which theme it turns on, in the screen's language.

#### Scenario: Switching to dark

- **WHEN** Eran presses the theme switch on a light CRM screen
- **THEN** within 100ms the whole screen is dark, the URL is unchanged, and nothing reloads

#### Scenario: Reloading keeps the choice

- **WHEN** Eran reloads any CRM page after choosing dark
- **THEN** the HTML the server sends already marks the dark theme, and no light frame appears before the page is dark

#### Scenario: Switching back

- **WHEN** Eran presses the switch on a dark screen
- **THEN** the screen turns light within 100ms, and the next page load is light

#### Scenario: Another browser

- **WHEN** Eran opens the CRM on a second browser where he never chose a theme
- **THEN** it opens light

#### Scenario: Cookies are blocked

- **WHEN** Eran presses the switch in a browser that refuses cookies
- **THEN** the open page still turns dark, and the next page load opens light, with no error shown

#### Scenario: The switch in Hebrew

- **WHEN** the light Hebrew screen is shown
- **THEN** the switch's accessible name is "מצב כהה", and on a dark screen it is "מצב בהיר"

#### Scenario: The switch at 390px

- **WHEN** a signed-in user views a CRM screen on a 390px-wide viewport
- **THEN** the theme switch is visible in the nav without horizontal scrolling and is at least 44px on its smaller side

### Requirement: Every screen is legible in both themes

In both themes, body text, secondary text, muted text, link text and error text SHALL meet a 4.5:1 contrast ratio against every background they sit on. Button text SHALL meet 4.5:1 against its button. The keyboard focus ring SHALL meet 3:1 against the background around it.

#### Scenario: Muted text in the light theme

- **WHEN** the muted text colour renders on the light background, on the light surface and on the light soft surface
- **THEN** each pair measures at least 4.5:1

#### Scenario: A green button's label

- **WHEN** a primary button's label is measured against its green, at rest and hovered, in each theme
- **THEN** all four measurements are at least 4.5:1

#### Scenario: A link and an error in the light theme

- **WHEN** green link text and an error message render on the light background
- **THEN** each measures at least 4.5:1

#### Scenario: The focus ring in the light theme

- **WHEN** a keyboard user tabs to a button on the light background
- **THEN** the focus ring measures at least 3:1 against that background

#### Scenario: Mixed Hebrew and Latin in both themes

- **WHEN** a row showing `רונית בן-דוד` at `Nurit Ltd` with `054-123-4567` is compared between the light and the dark theme
- **THEN** the text reads in the same order and the same alignment in both, and only its colours differ

### Requirement: Overlays and the automation canvas follow the theme

The contact drawer, the phone status list, dialogs and the command palette SHALL use the current theme's surface, border and text colours. The dimming behind an overlay SHALL darken the page in both themes. The automation builder's canvas SHALL render in the current theme.

#### Scenario: The drawer in the light theme

- **WHEN** Eran opens a contact on a light screen
- **THEN** the drawer's panel is a light frosted surface with dark text, and the page behind it dims

#### Scenario: The command palette in the dark theme

- **WHEN** Eran opens the command palette on a dark screen
- **THEN** the palette's panel is dark with light text, the same as today

#### Scenario: The automation canvas

- **WHEN** Eran opens an automation in the dark theme
- **THEN** the canvas, its nodes and its minimap render dark, and in the light theme they render light

### Requirement: The legacy STAGE pages stay dark

The STAGE directory pages, including the sign-in page that still lives in that group, SHALL render in the dark theme whatever the user's theme choice, and SHALL NOT show the theme switch.

#### Scenario: A light-choosing user opens a STAGE page

- **WHEN** a user whose saved choice is light, or who has none, loads `/he/login`
- **THEN** the page renders dark, as it does today, and its nav shows no theme switch

#### Scenario: Back into the CRM

- **WHEN** that user signs in and lands on `/he/dashboard/crm`
- **THEN** the CRM renders light
