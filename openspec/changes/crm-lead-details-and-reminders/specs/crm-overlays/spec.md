## ADDED Requirements

### Requirement: An open overlay sits above the CRM's top bar

A drawer, sheet or dialog opened from any CRM screen SHALL render above the CRM's sticky top bar. This SHALL hold at every viewport width from 390px to 2560px and in both text directions. No part of an open overlay's panel SHALL be covered by the bar. While an overlay is open, its dimmed backdrop SHALL cover the bar as well as the page. A click on the dimmed bar SHALL act as a click outside the panel and SHALL NOT follow the bar's links.

#### Scenario: The drawer's header is fully visible

- **WHEN** Eran opens a contact on `/he/dashboard/crm` at 1440×900
- **THEN** the contact's name, the status chip and the close control are fully visible at the top of the drawer, and no pixel of the top bar paints over the drawer panel

#### Scenario: The dimmed bar closes the drawer instead of navigating

- **WHEN** Eran clicks the HELIX logo in the dimmed top bar while a contact with no unsaved text is open
- **THEN** the drawer closes and the browser stays on the CRM home

#### Scenario: The add-contact sheet

- **WHEN** a member presses "ליד חדש" at 1440×900
- **THEN** the sheet opens with the top bar dimmed behind it, and the bar's language and theme switches do not respond until the sheet closes

#### Scenario: The lost-deal question on the board

- **WHEN** Eran presses the lose action on a deal card on the CRM home
- **THEN** the question opens above the top bar, and the whole page including the bar is dimmed behind it

#### Scenario: The drawer in English

- **WHEN** Eran opens a contact on `/en/dashboard/crm` at 1440×900
- **THEN** the drawer rests against the left edge, and its name, status chip and close control are fully visible and not covered by the top bar

#### Scenario: The drawer on a phone

- **WHEN** Eran opens a contact at 390×844 in Hebrew
- **THEN** the drawer's name row and its close control, at least 44px on each side, are fully visible at the top of the screen and not covered by the top bar, and nothing scrolls horizontally

#### Scenario: A long Hebrew name under the top edge

- **WHEN** Eran opens a contact whose name is 40 Hebrew characters at 390×844
- **THEN** the name truncates with an ellipsis on one line that is fully visible, and no part of it is hidden under the top bar

#### Scenario: Closing gives the bar back

- **WHEN** Eran closes the drawer with Escape
- **THEN** the top bar is no longer dimmed, and its links respond to the next click

### Requirement: An overlay opened from inside another sits above it

An overlay opened while another is open SHALL render above the one it was opened from, and the lower one SHALL be dimmed behind it. The command palette SHALL render above every other overlay. The order SHALL NOT depend on which overlay was mounted first.

#### Scenario: The discard question over the drawer

- **WHEN** Eran closes a drawer that holds an unsaved note
- **THEN** the discard question appears above the drawer, the drawer is dimmed behind it, and both are above the top bar

#### Scenario: The status list over the drawer on a phone

- **WHEN** Eran opens the status list from the drawer's status path at 390×844
- **THEN** the list is above the drawer, the drawer is dimmed behind it, and no part of the list is covered by the top bar

#### Scenario: The lost-deal question over the drawer

- **WHEN** Eran presses "סימון כאבוד" on a deal inside the drawer
- **THEN** the question naming the deal is above the drawer, and the drawer is dimmed behind it

#### Scenario: The command palette over an open drawer

- **WHEN** Eran presses ⌘K with a contact open
- **THEN** the command palette opens above the drawer, and the drawer is dimmed behind it

#### Scenario: A contact opened from a link, then a question

- **WHEN** Eran presses "סימון כאבוד" on a deal in a drawer that opened from loading `/he/dashboard/crm?c=<id>` directly
- **THEN** the question is above the drawer, exactly as when the drawer was opened from the list
