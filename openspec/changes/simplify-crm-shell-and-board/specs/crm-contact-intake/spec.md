## Purpose

Covers creating a contact from the board: presenting the form without disturbing the board behind it, validating what is required, and what the user sees when the save succeeds, fails, or is dismissed with data in it.

## ADDED Requirements

### Requirement: The contact form does not displace the board

Opening the contact form SHALL NOT change the position or size of the board's header, metrics, contact list, or stage columns. The form SHALL be presented as a surface above the board.

#### Scenario: The board is unchanged behind the open form

- **WHEN** the user activates the create-contact action on `/he/dashboard/crm`
- **THEN** the form appears above the board, and the header title, workspace switcher, metric cards, and stage columns each keep the position and width they had before it opened

#### Scenario: The form is dismissible by scrim and Escape

- **WHEN** the form is open with all fields empty and the user presses Escape
- **THEN** the form closes, and keyboard focus returns to the create-contact action that opened it

#### Scenario: The form on a 390px viewport

- **WHEN** the form is opened in a 390px-wide viewport
- **THEN** its fields are stacked in a single column, every field and both action controls are reachable by scrolling within the form, and the page behind it does not scroll horizontally

#### Scenario: The form in Hebrew

- **WHEN** a Hebrew-locale user opens the form
- **THEN** the field labels and placeholders read right-to-left, the name and role fields accept Hebrew text in right-to-left order, and the email and phone fields render their contents left-to-right

### Requirement: A contact cannot be created without a name

The form SHALL require a non-empty name. When the name is missing, the form SHALL state what is missing rather than silently doing nothing.

#### Scenario: Saving with an empty name

- **WHEN** the user activates save with the name field empty
- **THEN** the form stays open, a message in Hebrew states that a name is required, focus moves to the name field, and no contact is created

#### Scenario: Saving with a name of only whitespace

- **WHEN** the user enters three space characters as the name and activates save
- **THEN** the form stays open, the same required-name message is shown, and no contact is created

#### Scenario: An invalid email address is rejected

- **WHEN** the user enters a name and an email address with no `@` sign, then activates save
- **THEN** the form stays open, a message in Hebrew states that the email address is not valid, and no contact is created

### Requirement: A created contact appears without a manual refresh

On a successful save the form SHALL close and the new contact SHALL be visible in the board's contact list without the user reloading the page.

#### Scenario: A contact is created

- **WHEN** the user enters a name and activates save, and the server records the contact
- **THEN** the form closes and the new contact appears in the board's contact list within 2 seconds

#### Scenario: The form is empty when reopened after a success

- **WHEN** the user reopens the form after a successful save
- **THEN** every field is empty and the lifecycle stage is back to its default of `lead`

### Requirement: A failed save keeps the typed values

When a save fails, the form SHALL stay open with the entered values intact and SHALL state that the contact was not saved, so the user does not retype the record.

#### Scenario: The database is unreachable

- **WHEN** the user activates save and the database cannot be reached
- **THEN** the form stays open, every value the user entered is still present in its field, and a message in Hebrew states that the contact was not saved

#### Scenario: The network fails during the save

- **WHEN** the connection drops after save is activated and before a response arrives
- **THEN** within 15 seconds the form reports that the contact was not saved, and the entered values remain in their fields

#### Scenario: Save is activated twice

- **WHEN** the user activates save twice in rapid succession on the same filled form
- **THEN** exactly one contact is created

### Requirement: Dismissing a form with entered data asks first

Closing the form while any field holds a value SHALL require confirmation, so a stray Escape keypress or scrim click does not discard a typed record.

#### Scenario: Escape with entered data

- **WHEN** the user has typed a name and presses Escape
- **THEN** a confirmation asks whether to discard the entry, and the form stays open until the user answers

#### Scenario: Confirming the discard

- **WHEN** the user confirms discarding the entry
- **THEN** the form closes and no contact is created

#### Scenario: Declining the discard

- **WHEN** the user declines discarding the entry
- **THEN** the form stays open with every entered value still in place
