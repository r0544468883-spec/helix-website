## MODIFIED Requirements

### Requirement: The open contact is addressable in the URL

The identity of the open contact SHALL be carried as a query parameter in the URL of the screen the drawer is open over: the contacts list, Deals, Reminders or Companies. The browser's back button SHALL close the drawer and leave the user on that screen. The address SHALL be copyable, and loading it SHALL reopen the same screen with the same contact's drawer open.

#### Scenario: Back closes the drawer

- **WHEN** Eran opens a contact and then presses the browser back button
- **THEN** the drawer closes, the screen it was open over is shown with its filter and scroll intact, and the URL no longer names a contact

#### Scenario: A copied address reopens the same contact

- **WHEN** Eran copies the URL while a contact is open over the Deals screen and loads it in a new tab
- **THEN** that tab renders the Deals screen with the same contact's drawer already open

#### Scenario: A URL naming a contact in another workspace

- **WHEN** a URL names a contact id that does not belong to the active workspace
- **THEN** the drawer does not open and no contact data from the other workspace is rendered. The screen is shown with a Hebrew notice that the contact was not found

#### Scenario: A malformed contact id

- **WHEN** the URL carries a contact id that is not a valid identifier
- **THEN** the screen renders with no drawer and no server error, returning HTTP 200

#### Scenario: Back on the Reminders screen

- **WHEN** Eran opens a person from the Reminders screen and then presses the browser back button
- **THEN** the drawer closes and the Reminders screen is shown, not the contacts list

### Requirement: The drawer is dismissable and returns focus

The drawer SHALL close on Escape, on a click outside its panel, and on an explicit close control. Closing SHALL leave the user on the screen the drawer was open over. On close, keyboard focus SHALL return to the control that opened it:
- a contact-list row;
- a deal card's title;
- a reminder's person;
- a person inside an open company.

Closing SHALL ask before discarding unsent text in any open box: email, WhatsApp message, call, meeting, note, next step or new deal. When the status list is open over the drawer, Escape SHALL close the list first and leave the drawer open.

#### Scenario: Escape closes the drawer

- **WHEN** Eran presses Escape with a contact open from the contacts list and no text field focused
- **THEN** the drawer closes and focus is on the list row for that contact

#### Scenario: Clicking the list behind the drawer closes it

- **WHEN** Eran clicks the dimmed area outside the drawer panel
- **THEN** the drawer closes and the URL no longer names a contact

#### Scenario: Closing does not discard an unsent email draft silently

- **WHEN** Eran has typed an email body in the drawer and presses Escape
- **THEN** Eran is asked in Hebrew whether to discard it before the drawer closes

#### Scenario: Closing does not discard an unsaved note silently

- **WHEN** Eran has typed a note in the drawer and clicks outside the panel
- **THEN** Eran is asked in Hebrew whether to discard it, and the note is still in its box if the answer is no

#### Scenario: Escape with the status list open

- **WHEN** Eran presses Escape while the status list is open over the drawer at 390px
- **THEN** the list closes, the drawer stays open, and the contact's status is unchanged

#### Scenario: Closing over the Deals screen

- **WHEN** Eran closes, with Escape, a drawer opened from the deal card `בניית אתר`
- **THEN** the Deals screen is shown, not the contacts list, and focus is on that card's title

#### Scenario: Two cards for one person

- **WHEN** a person has two deal cards and Eran closes the drawer opened from the second of them
- **THEN** focus is on the second card's title, not the first

## ADDED Requirements

### Requirement: A person opens over every screen that names them

Selecting a person on the Deals, Reminders or Companies screen SHALL open the same contact drawer as the contacts list does, with the same sections, over that screen. The screen SHALL stay mounted behind the drawer and keep:
- its scroll position;
- its filter text;
- any company that is open.

A change made in the drawer SHALL show on the screen behind it within 2 seconds.

#### Scenario: From a reminder

- **WHEN** Eran selects `דנה כהן` on a row of the Reminders screen
- **THEN** within 1 second the drawer for `דנה כהן` is open over the Reminders screen, showing the status path, the reminder, deals and timeline as it does from the contacts list

#### Scenario: From a company

- **WHEN** Eran selects a person inside an open company on the Companies screen
- **THEN** within 1 second that person's drawer is open over the Companies screen

#### Scenario: The screen keeps its place

- **WHEN** Eran scrolls the Reminders screen to its 30th row and opens a person from that row
- **THEN** the screen behind the drawer keeps that scroll position

#### Scenario: A change shows behind the drawer

- **WHEN** Eran marks a reminder done inside a drawer opened over the Reminders screen
- **THEN** within 2 seconds that reminder's row is gone from the screen behind the drawer

#### Scenario: A deal added in the drawer

- **WHEN** Eran adds a deal in a drawer opened over the Deals screen
- **THEN** within 2 seconds the new card is in the `ליד` column behind the drawer

#### Scenario: From the Companies screen at 390px

- **WHEN** Eran opens a person from the Companies screen at 390px wide in Hebrew
- **THEN** the drawer enters from the right, every control in it is reachable without horizontal scrolling, and closing it returns focus to that person's name
