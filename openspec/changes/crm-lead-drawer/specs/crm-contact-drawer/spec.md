## ADDED Requirements

### Requirement: The header keeps the person and their status in view

The drawer header SHALL show the contact's name with their status chip beside it, their role and company, and how long they have been in their current status. The header SHALL stay at the top of the drawer while its body scrolls. Days in status SHALL count from the most recent recorded status change. For a contact in `ליד חדש` with no recorded change, they SHALL count from the contact's creation. For any other contact with no recorded change, the day count SHALL be omitted rather than guessed. Day counts SHALL use Hebrew number agreement, never a numeral with the wrong noun form.

#### Scenario: Scrolling a long timeline

- **WHEN** Eran scrolls the drawer of a contact with 50 timeline entries down to the last entry
- **THEN** the name, the status chip and the status path are still visible at the top of the drawer

#### Scenario: Days since the last status change

- **WHEN** Eran opens a contact whose status was changed to `בשיחה` 12 days ago
- **THEN** the header shows `12 ימים` beside the `בשיחה` chip

#### Scenario: One day in status

- **WHEN** Eran opens a contact whose status was changed yesterday
- **THEN** the header reads `יום אחד`, and the text `1 ימים` appears nowhere in the header

#### Scenario: A new contact never moved

- **WHEN** Eran opens a contact created 5 days ago that is still `ליד חדש` with no recorded status change
- **THEN** the header shows `5 ימים` beside the `ליד חדש` chip

#### Scenario: A status set before changes were recorded

- **WHEN** Eran opens a contact in `הצעה נשלחה` whose status has no recorded change
- **THEN** the header shows the `הצעה נשלחה` chip and no day count

#### Scenario: A long Hebrew name at 390px

- **WHEN** Eran opens a contact with a 40-character Hebrew name on a 390px-wide viewport
- **THEN** the name truncates with an ellipsis on one line, the status chip stays fully visible beside it, and the close control is at least 44px on each side

## MODIFIED Requirements

### Requirement: The drawer shows status, reachability, money and history

An open contact's drawer SHALL show, without further navigation:
- the contact's name, status, role and company in the header
- the status path
- their email and phone
- the actions for reaching and logging
- their next step
- their deals with value and stage
- their activity timeline, including recorded status changes

Where a contact has none of a given item, the drawer SHALL say so in Hebrew rather than render an empty region. The deals region is the exception. For a user who can write, it SHALL show even when the contact has no deals, as one line holding the region's title and the add-deal action. A read-only user SHALL see no deals region for a contact without deals.

#### Scenario: A contact with deals and history

- **WHEN** Eran opens a contact who has two deals and six logged activities
- **THEN** the drawer shows the status path with the current step marked, both deal titles with their values and stages, and the six activities newest first

#### Scenario: A contact with nothing logged yet

- **WHEN** Eran opens a contact with no deals and no activities
- **THEN** the drawer shows the status path, a Hebrew line stating there is no activity yet, and a deals line holding only its title and "+ עסקה חדשה"

#### Scenario: A viewer opens a contact with no deals

- **WHEN** a user with the viewer role opens a contact with no deals
- **THEN** the drawer shows no deals region, no add-deal action and no reach or logging action, and the status path offers no control

### Requirement: The drawer is dismissable and returns focus

The drawer SHALL close on Escape, on a click outside its panel, and on an explicit close control. On close, keyboard focus SHALL return to the contact-list row that opened it. Closing SHALL ask before discarding unsent text in any open box: email, WhatsApp message, call, meeting, note, next step or new deal. When the status list is open over the drawer, Escape SHALL close the list first and leave the drawer open.

#### Scenario: Escape closes the drawer

- **WHEN** Eran presses Escape with a contact open and no text field focused
- **THEN** the drawer closes and focus is on the list row for that contact

#### Scenario: Clicking the list behind the drawer closes it

- **WHEN** Eran clicks the dimmed area outside the drawer panel
- **THEN** the drawer closes and the URL no longer names a contact

#### Scenario: Closing does not discard an unsent email draft silently

- **WHEN** Eran has typed an email body in the drawer and presses Escape
- **THEN** he is asked in Hebrew whether to discard it before the drawer closes

#### Scenario: Closing does not discard an unsaved note silently

- **WHEN** Eran has typed a note in the drawer and clicks outside the panel
- **THEN** he is asked in Hebrew whether to discard it, and the note is still in its box if he declines

#### Scenario: Escape with the status list open

- **WHEN** Eran presses Escape while the status list is open over the drawer at 390px
- **THEN** the list closes, the drawer stays open, and the contact's status is unchanged

### Requirement: The full contact page remains available

The existing full-page contact route SHALL keep working as a directly linkable page, so that an external link, a bookmark, or a request with JavaScript unavailable still reaches a contact's details. The full page SHALL set the status with the same status path as the drawer and SHALL NOT offer a status dropdown.

#### Scenario: A direct link to the full page

- **WHEN** a signed-in user loads the full contact page URL for a contact in their workspace
- **THEN** the page returns HTTP 200 and renders that contact's name, status, deals and timeline

#### Scenario: The command palette opens a contact

- **WHEN** Eran selects a contact from the command palette
- **THEN** the contact list opens with that contact's drawer open and the URL names the contact, and the CRM does not leave him on a screen with no contact shown

#### Scenario: The full page uses the status path

- **WHEN** a user who can write loads the full contact page
- **THEN** the status is shown and set with the same seven-step path and two exits as the drawer, and no status dropdown is on the page

### Requirement: The drawer works in Hebrew and on a phone

The drawer SHALL render right-to-left in Hebrew with user-entered names and roles following their own text direction, email addresses and phone numbers reading left-to-right, and SHALL be usable at a 390px viewport.

#### Scenario: Mixed-direction contact data

- **WHEN** Eran opens a contact named `רונית בן-דוד` whose role is `Head of Growth` and whose phone is `054-123-4567`
- **THEN** the Hebrew name reads right-to-left, the Latin role and the phone read left-to-right, and the phone's digits are not reordered

#### Scenario: The drawer at 390px

- **WHEN** Eran opens a contact on a 390px-wide viewport
- **THEN** the drawer occupies at most 86% of the viewport width, the status control and every reach and logging action are reachable without horizontal scrolling, and every interactive target is at least 44px on its smaller side

#### Scenario: Reduced motion is honoured

- **WHEN** a contact is opened with the operating system set to reduce motion
- **THEN** the drawer appears in its open position without a sliding animation, and closing it is likewise immediate
