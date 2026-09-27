## Purpose

How a CRM overlay (side drawer, bottom sheet, centred dialog) behaves closed and open, in both text directions, so that an overlay that is not open never covers, dims or blocks the screen beneath it.

## ADDED Requirements

### Requirement: A closed overlay is not visible

An overlay that is not open SHALL render no visible pixel inside the viewport, at every viewport width from 390px to 2560px, in both Hebrew (right-to-left) and English (left-to-right), from the first paint of the page onward.

#### Scenario: Hebrew CRM home at a wide desktop width

- **WHEN** a signed-in user loads `/he/dashboard/crm` at 1900px wide with no contact open
- **THEN** no drawer or menu panel is visible anywhere on the page, and every stat, row and board column is shown at full contrast with no dimmed band over it

#### Scenario: English CRM home

- **WHEN** a signed-in user loads `/en/dashboard/crm` at 1440px wide with no contact open
- **THEN** no drawer or menu panel is visible anywhere on the page

#### Scenario: First paint before the page is interactive

- **WHEN** the CRM home is loaded on a throttled connection and captured before its scripts have run
- **THEN** the server-rendered page already shows no drawer or menu panel inside the viewport, so no panel flashes on screen and then slides away

#### Scenario: Phone width

- **WHEN** the CRM home loads at 390px wide in Hebrew
- **THEN** no closed drawer, sheet or menu panel is visible and the page scrolls with no horizontal scrollbar

### Requirement: A closed overlay takes no input

An overlay that is not open SHALL receive no pointer event and no keyboard focus. Every control on the screen beneath SHALL respond to a click, a tap or the Tab key exactly as if the overlay did not exist.

#### Scenario: Clicking a contact row where a panel used to sit

- **WHEN** a user at 1900px wide clicks a contact row anywhere across its width
- **THEN** that contact's drawer opens on the first click

#### Scenario: Tabbing through the home screen

- **WHEN** a keyboard user presses Tab repeatedly from the top of the CRM home with nothing open
- **THEN** focus moves only through visible controls and never lands on a control inside a closed drawer, sheet, menu or dialog

### Requirement: An open overlay enters from its own edge

A side drawer SHALL slide in from, and anchor to, the physical edge its logical side names: `start` is the right edge in Hebrew and the left edge in English. On close it SHALL leave along the same path and end fully outside the viewport.

#### Scenario: Contact drawer in Hebrew

- **WHEN** a user opens a contact on `/he/dashboard/crm`
- **THEN** the drawer enters from the right edge and rests against the right edge

#### Scenario: Contact drawer in English

- **WHEN** a user opens a contact on `/en/dashboard/crm`
- **THEN** the drawer enters from the left edge and rests against the left edge

#### Scenario: Closing returns the drawer fully off screen

- **WHEN** a user presses Escape with the contact drawer open
- **THEN** the drawer leaves toward the edge it came from, no part of it remains in the viewport, and the row that opened it holds focus

#### Scenario: Rapid open and close

- **WHEN** a user opens and closes the "עוד" menu 5 times within 2 seconds
- **THEN** it ends closed, fully off screen, and the page beneath responds to the next click

### Requirement: Reduced motion keeps the same end states

Under `prefers-reduced-motion: reduce`, an overlay SHALL reach the same open and closed positions as with motion, without the slide, and a closed overlay SHALL still be invisible and take no input.

#### Scenario: Opening with reduced motion

- **WHEN** a user with reduced motion enabled opens a contact
- **THEN** the drawer appears at its resting edge immediately, with no slide, and closing removes it immediately
