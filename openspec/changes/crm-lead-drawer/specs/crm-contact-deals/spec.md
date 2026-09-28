## Purpose

A person's deals, handled from the person. This covers opening a deal already attached to them, working its stage, title and value in place, winning or losing it, and the prompts where the person's status and their deals meet, so money is recorded where the conversation happens.

## ADDED Requirements

### Requirement: A deal is opened from the contact

A user who can write SHALL be able to open a deal from the open contact with a title and an optional value in shekels. The deal SHALL be stored attached to that contact at the first stage. It SHALL appear in the drawer's deals region and on the deal board within 2 seconds, without a page reload. A save with no response within 15 seconds SHALL be treated as failed.

#### Scenario: Opening a first deal

- **WHEN** Eran saves a new deal titled `בניית אתר` with value `18000` from the drawer of a contact with no deals
- **THEN** within 2 seconds the drawer lists `בניית אתר` with `₪18,000` and the stage `ליד`, and the deal board shows the same deal in its first column under the contact's name

#### Scenario: A title is required

- **WHEN** Eran saves the new-deal form with an empty title
- **THEN** no deal is stored, the form states in Hebrew that a title is required, and the typed value stays in its field

#### Scenario: A value that is not a number

- **WHEN** Eran saves the new-deal form with `18k` in the value field
- **THEN** no deal is stored, the form states in Hebrew that the value must be a number, and the typed title stays in its field

#### Scenario: Double-pressing save

- **WHEN** Eran presses save on the new-deal form twice within 300ms
- **THEN** exactly one deal is stored

#### Scenario: The save fails

- **WHEN** Eran saves a new deal and the write fails because Supabase is unreachable
- **THEN** the form keeps the typed title and value, a Hebrew message says the deal was not saved, and the board shows no new deal

#### Scenario: The network drops mid-save

- **WHEN** Eran saves a new deal and no response arrives
- **THEN** within 15 seconds the form keeps the typed title and value and a Hebrew message says the save did not complete

#### Scenario: A viewer cannot open a deal

- **WHEN** a user with the viewer role opens a contact
- **THEN** no add-deal action is shown

### Requirement: A deal is worked in place

Selecting a deal in the drawer SHALL open it in place. The opened deal SHALL show its stage, title and value as editable, with actions to mark it won or lost. Marking a deal lost SHALL ask first, naming the deal. A change SHALL show within 100ms, be stored within 2 seconds, and be reflected on the deal board without a reload. A change that is not stored SHALL be reverted on screen and reported in Hebrew. A change with no response within 15 seconds SHALL count as not stored. A won or lost deal SHALL stay listed in the drawer with its outcome. A user who cannot write SHALL see each deal's title, value and stage with no control.

#### Scenario: Changing the stage

- **WHEN** Eran changes the deal `בניית אתר` from `ליד` to `הצעה` in the drawer
- **THEN** the deal shows `הצעה` within 100ms, and within 2 seconds the board shows it in the `הצעה` column

#### Scenario: Changing the value

- **WHEN** Eran changes the value of `בניית אתר` from 18000 to 21000
- **THEN** the drawer shows `₪21,000`, and a reload 2 seconds later shows the same

#### Scenario: Losing a deal asks first

- **WHEN** Eran presses the lost action on `בניית אתר`
- **THEN** a confirmation in Hebrew names `בניית אתר`, and the deal is stored as lost only after he confirms

#### Scenario: Winning a deal

- **WHEN** Eran marks `בניית אתר` as won
- **THEN** the drawer shows the deal as won, and within 2 seconds the board shows it in the won column

#### Scenario: A change that fails is reverted

- **WHEN** Eran changes a deal's stage and the write fails because Supabase is unreachable
- **THEN** within 15 seconds the deal shows its previous stage again and a Hebrew message says the change did not save

#### Scenario: A long Hebrew title at 390px

- **WHEN** the drawer shows a deal with a 50-character Hebrew title on a 390px-wide viewport
- **THEN** the title truncates on its line, the value and the stage stay fully visible, and nothing scrolls horizontally

#### Scenario: A title mixing Hebrew, Latin and numerals

- **WHEN** the drawer shows a deal titled `Website v2 לנורית` with value 18000
- **THEN** `Website v2` reads left to right inside the right-to-left title, and the value reads `₪18,000` with its digits in order

#### Scenario: A viewer sees deals without controls

- **WHEN** a user with the viewer role opens a contact with two deals
- **THEN** each deal shows its title, value and stage, and no edit, won or lost control is offered

### Requirement: Status and deals meet at crossing points, and the CRM asks

When a status change or a deal outcome makes the other side likely out of date, the drawer SHALL offer a one-tap follow-up. It SHALL NOT change the other side by itself. The follow-ups are:
- Moving a contact to `הצעה נשלחה` while they have no open deal SHALL offer to open a deal.
- Moving a contact to `חתם` while they have exactly one open deal SHALL offer to mark it won.
- Moving a contact to `חתם` while they have more than one open deal SHALL say how many are open.
- Marking a deal won while its contact is in a status before `חתם` SHALL offer to move the contact to `חתם`.

Ignoring an offer SHALL change nothing.

#### Scenario: A proposal with no deal

- **WHEN** Eran moves a contact with no open deal to `הצעה נשלחה`
- **THEN** the drawer offers to open a deal, and no deal exists unless he accepts

#### Scenario: Accepting the offer to open a deal

- **WHEN** Eran accepts the offer to open a deal
- **THEN** the new-deal form opens in the deals region with the title field focused

#### Scenario: Signed with one open deal

- **WHEN** Eran moves a contact whose one open deal is `בניית אתר` to `חתם`
- **THEN** the drawer asks whether to mark `בניית אתר` as won, and the deal stays open unless he confirms

#### Scenario: Signed with two open deals

- **WHEN** Eran moves a contact with two open deals to `חתם`
- **THEN** the drawer states that 2 deals are open and offers no one-tap won action

#### Scenario: A deal won before the person signed

- **WHEN** Eran marks a deal won for a contact in `בשיחה`
- **THEN** the drawer offers to move the contact to `חתם`, and the status stays `בשיחה` unless he accepts

#### Scenario: A contact already past signed

- **WHEN** Eran marks a deal won for a contact in `לקוח פעיל`
- **THEN** no offer to change the contact's status is shown

#### Scenario: Ignoring an offer

- **WHEN** Eran closes the drawer while an offer is showing
- **THEN** neither the contact's status nor any deal has changed

### Requirement: A deal leads to its person

A deal card on the deal board SHALL open its contact's drawer when selected, provided the deal has a contact. Selecting the card SHALL NOT start a drag, and a drag or a scroll SHALL NOT open a drawer. A deal with no contact SHALL NOT offer to open anything. Selecting a deal in the command palette SHALL open its contact's drawer, or the deal board when the deal has no contact.

#### Scenario: Opening a person from the board

- **WHEN** Eran taps the deal card `בניית אתר` whose contact is `דנה כהן`
- **THEN** within 1 second the drawer for `דנה כהן` is open and the URL names her

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
- **THEN** that deal's contact drawer opens

#### Scenario: The palette opens a deal's person

- **WHEN** Eran selects a deal with a contact in the command palette
- **THEN** the CRM home opens with that contact's drawer open
