# crm-contact-drawer Specification

## Purpose

Opening a person beside the list instead of navigating away from it, so Eran can read a contact's status, deals and timeline and act on them without losing his place in the list or his scroll position.

## Requirements

### Requirement: A contact opens beside the list, not instead of it

Selecting a contact in the CRM contact list SHALL open a drawer over the list on the reading-start side of the screen — the right edge in Hebrew — while the list stays mounted behind it. Opening a contact SHALL NOT discard the list's scroll position or an active list filter.

#### Scenario: The list survives opening a contact

- **WHEN** Eran scrolls the contact list to the 40th row, types a filter, and selects a contact
- **THEN** the drawer opens over the list, and the list behind it still shows the same filter text and the same scroll position

#### Scenario: The drawer is on the right in Hebrew

- **WHEN** Eran opens a contact with the interface language set to Hebrew
- **THEN** the drawer enters from the right edge of the viewport and its panel is anchored to that edge

#### Scenario: The drawer mirrors in English

- **WHEN** the same contact is opened with the interface language set to English
- **THEN** the drawer enters from the left edge, which is the reading-start side in that direction

### Requirement: The open contact is addressable in the URL

The identity of the open contact SHALL be carried in the CRM home URL as a query parameter, so that the browser's back button closes the drawer and the address can be copied and reopened.

#### Scenario: Back closes the drawer

- **WHEN** Eran opens a contact and then presses the browser back button
- **THEN** the drawer closes, the contact list is shown with its filter and scroll intact, and the URL no longer names a contact

#### Scenario: A copied address reopens the same contact

- **WHEN** Eran copies the URL while a contact is open and loads it in a new tab
- **THEN** that tab renders the contact list with the same contact's drawer already open

#### Scenario: A URL naming a contact in another workspace

- **WHEN** a URL names a contact id that does not belong to the active workspace
- **THEN** the drawer does not open, no contact data from the other workspace is rendered, and the contact list is shown with a Hebrew notice that the contact was not found

#### Scenario: A malformed contact id

- **WHEN** the URL carries a contact id that is not a valid identifier
- **THEN** the page renders the contact list with no drawer and no server error, returning HTTP 200

### Requirement: The drawer shows status, reachability, money and history

An open contact's drawer SHALL show, without further navigation: the contact's name and role, an editable status control, their email and phone, their deals with value and stage, and their activity timeline. Where a contact has none of a given item, the drawer SHALL say so in Hebrew rather than render an empty region.

#### Scenario: A contact with deals and history

- **WHEN** Eran opens a contact who has two deals and six logged activities
- **THEN** the drawer shows the editable status chip, both deal titles with their values and stages, and the six activities newest first

#### Scenario: A contact with nothing logged yet

- **WHEN** Eran opens a contact with no deals and no activities
- **THEN** the drawer shows the status control and a Hebrew line stating there is no activity yet, and shows no empty deals region

### Requirement: The drawer is dismissable and returns focus

The drawer SHALL close on Escape, on a click outside its panel, and on an explicit close control. On close, keyboard focus SHALL return to the contact-list row that opened it.

#### Scenario: Escape closes the drawer

- **WHEN** Eran presses Escape with a contact open and no text field focused
- **THEN** the drawer closes and focus is on the list row for that contact

#### Scenario: Clicking the list behind the drawer closes it

- **WHEN** Eran clicks the dimmed area outside the drawer panel
- **THEN** the drawer closes and the URL no longer names a contact

#### Scenario: Closing does not discard an unsent email draft silently

- **WHEN** Eran has typed an email body in the drawer and presses Escape
- **THEN** he is asked in Hebrew whether to discard it before the drawer closes

### Requirement: The full contact page remains available

The existing full-page contact route SHALL keep working as a directly linkable page, so that an external link, a bookmark, or a request with JavaScript unavailable still reaches a contact's details.

#### Scenario: A direct link to the full page

- **WHEN** a signed-in user loads the full contact page URL for a contact in their workspace
- **THEN** the page returns HTTP 200 and renders that contact's name, status, deals and timeline

#### Scenario: The command palette opens a contact

- **WHEN** Eran selects a contact from the command palette
- **THEN** he reaches that contact's details, and the CRM does not leave him on a screen with no contact shown

### Requirement: The drawer works in Hebrew and on a phone

The drawer SHALL render right-to-left in Hebrew with user-entered names and roles following their own text direction, email addresses and phone numbers reading left-to-right, and SHALL be usable at a 390px viewport.

#### Scenario: Mixed-direction contact data

- **WHEN** Eran opens a contact named `רונית בן-דוד` whose role is `Head of Growth` and whose phone is `054-123-4567`
- **THEN** the Hebrew name reads right-to-left, the Latin role and the phone read left-to-right, and the phone's digits are not reordered

#### Scenario: The drawer at 390px

- **WHEN** Eran opens a contact on a 390px-wide viewport
- **THEN** the drawer occupies at most 86% of the viewport width, the status control and both action buttons are reachable without horizontal scrolling, and every interactive target is at least 44px on its smaller side

#### Scenario: Reduced motion is honoured

- **WHEN** a contact is opened with the operating system set to reduce motion
- **THEN** the drawer appears in its open position without a sliding animation, and closing it is likewise immediate
