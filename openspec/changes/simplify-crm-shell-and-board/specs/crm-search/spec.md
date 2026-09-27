## Purpose

Covers finding a person or a deal in the CRM: the command palette's index of workspace records alongside routes, and the filter that narrows the contact list already on screen.

## ADDED Requirements

### Requirement: The command palette finds contacts in the active workspace

The command palette SHALL index the contacts of the active workspace alongside navigation destinations. A contact SHALL be matchable by its name, its email address, its company name, and its role title. Selecting a contact SHALL open that contact's record.

#### Scenario: Finding a contact by a fragment of a Hebrew name

- **WHEN** the user opens the command palette and types three consecutive characters that appear in a contact's Hebrew name
- **THEN** that contact is listed as a result within 150 milliseconds of the last keystroke, labelled with its name and its company

#### Scenario: Finding a contact by a fragment of an email address

- **WHEN** the user types the portion of a contact's email address before the `@` sign
- **THEN** that contact is listed as a result

#### Scenario: Opening a contact from the palette

- **WHEN** the user presses Enter on a highlighted contact result
- **THEN** the palette closes and the browser navigates to that contact's record at `/he/dashboard/crm/<contact id>`

#### Scenario: Results are limited to the active workspace

- **WHEN** a user who has access to two workspaces has workspace A active, and types a fragment matching only the name of a contact belonging to workspace B
- **THEN** no contact result is listed, and the contact from workspace B is absent from the palette's data

#### Scenario: Switching workspace changes the index

- **WHEN** the user switches the active workspace from A to B and then opens the palette and types a fragment matching a contact in B
- **THEN** that contact is listed, and contacts belonging only to A are not listed

#### Scenario: A search with no match states so

- **WHEN** the user types a string that matches no route, contact, or deal
- **THEN** the palette displays an explicit empty message in Hebrew stating that nothing matched, and does not display an empty panel with no text

#### Scenario: Record lookup unavailable

- **WHEN** the record index cannot be loaded because the database is unreachable
- **THEN** the palette still opens and still lists and navigates to routes, and it displays a short notice in Hebrew that records could not be loaded

#### Scenario: Mixed Hebrew and Latin query

- **WHEN** the user types a query containing Hebrew characters followed by Latin characters and digits
- **THEN** the query text renders in the input without reordering the Latin characters or the digits, and matching applies to all three character classes

#### Scenario: Palette on a 390px viewport

- **WHEN** the user opens the command palette in a 390px-wide viewport
- **THEN** the palette panel fits inside the viewport with no horizontal scrolling, each result row remains a single tappable target at least 44 pixels tall, and result text that exceeds the width truncates rather than wrapping past the panel edge

### Requirement: The command palette finds open deals in the active workspace

The command palette SHALL index the active workspace's deals whose status is open, matchable by deal title and by the name of the deal's contact. Selecting a deal SHALL open the record of the contact the deal belongs to.

#### Scenario: Finding an open deal by title

- **WHEN** the user types a fragment of an open deal's title
- **THEN** that deal is listed as a result, labelled with its title, its stage, and its value

#### Scenario: Closed deals are not indexed

- **WHEN** the user types a fragment matching the title of a deal whose status is `won` or `lost`
- **THEN** that deal is not listed as a result

#### Scenario: Selecting a deal with no contact

- **WHEN** the user presses Enter on an open deal that has no associated contact
- **THEN** the palette closes and the browser navigates to the board, and no navigation to an undefined record is attempted

### Requirement: The contact list can be narrowed without a new query

The board SHALL provide a filter field above the contact list that narrows the rows already loaded. Narrowing SHALL match against contact name, company name, role title, and email address. Narrowing SHALL NOT issue a network request.

#### Scenario: Typing narrows the visible rows

- **WHEN** the user types a fragment matching 3 of 40 loaded contacts into the filter field
- **THEN** exactly those 3 rows remain visible, and the count of matching contacts is displayed alongside the filter field

#### Scenario: Filtering issues no request

- **WHEN** the user types 8 characters into the filter field
- **THEN** no network request is issued by the page during or after the typing

#### Scenario: Clearing the filter restores the list

- **WHEN** the user clears the filter field after it had narrowed the list
- **THEN** every loaded contact row is visible again, in the original descending score order

#### Scenario: A filter with no match states so

- **WHEN** the user types a fragment matching none of the loaded contacts
- **THEN** the list area displays an explicit message in Hebrew stating that no contact matched the filter, and the message offers to clear the filter

#### Scenario: Filtering by company name

- **WHEN** the user types a fragment of a company name that is attached to 2 loaded contacts
- **THEN** those 2 contact rows remain visible even though the fragment does not appear in either contact's own name

#### Scenario: The 200-contact ceiling is disclosed

- **WHEN** the workspace holds more than 200 contacts and the board renders
- **THEN** the board states, near the filter field, that only the top 200 contacts by score are loaded, so that a user who filters and finds nothing knows the list is capped

#### Scenario: Filter field in Hebrew

- **WHEN** a Hebrew-locale user types Hebrew text into the filter field
- **THEN** the text renders right-to-left with the caret at the inline start of the typed text, and the field's placeholder is Hebrew

#### Scenario: Filter field on a 390px viewport

- **WHEN** the board renders in a 390px-wide viewport
- **THEN** the filter field spans the content width without overflowing it, and the matching count remains visible without wrapping onto a third line
