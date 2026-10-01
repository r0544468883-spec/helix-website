## MODIFIED Requirements

### Requirement: A deal leads to its person

A deal card on the Deals screen SHALL open its contact's drawer over the Deals screen when selected, provided the deal has a contact. Selecting the card SHALL NOT start a drag, and a drag or a scroll SHALL NOT open a drawer. A deal with no contact SHALL NOT offer to open anything. Selecting a deal in the command palette SHALL:
- open its contact's drawer over the contacts screen, when the deal has a contact;
- open the Deals screen, when it has none.

#### Scenario: Opening a person from the board

- **WHEN** Eran taps the deal card `בניית אתר` whose contact is `דנה כהן`
- **THEN** within 1 second the drawer for `דנה כהן` is open over the Deals screen, and the URL names that person

#### Scenario: A drag does not open the drawer

- **WHEN** Eran drags a deal card to another column
- **THEN** the deal moves to that column and no drawer opens

#### Scenario: Scrolling the board does not open the drawer

- **WHEN** Eran swipes vertically across a deal card on a 390px-wide viewport
- **THEN** the board scrolls and no drawer opens

#### Scenario: A deal with no contact

- **WHEN** Eran taps a deal card that has no contact
- **THEN** no drawer opens and the card stays where it was

#### Scenario: Opening a person by keyboard

- **WHEN** Eran moves focus to a deal card's title with Tab and presses Enter
- **THEN** that deal's contact drawer opens over the Deals screen

#### Scenario: The palette opens a deal's person

- **WHEN** Eran selects a deal with a contact in the command palette
- **THEN** the CRM home opens with that contact's drawer open

#### Scenario: The palette opens a deal with no person

- **WHEN** Eran selects a deal with no contact in the command palette
- **THEN** the Deals screen opens
