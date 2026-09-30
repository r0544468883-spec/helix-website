## Purpose

Uses a workspace's connected Google account inside the CRM: pick Google contacts to become leads without duplicates, and see a lead's meetings from Google Calendar in their drawer, read live and never stored.

## ADDED Requirements

### Requirement: Google contacts are picked, not imported wholesale

With Google connected, `ייבוא אנשי קשר` on the Connections screen SHALL be offered to every role that can write, and SHALL open the import page. The page SHALL list up to 2,000 of the account's contacts: name, email, phone and company, sorted by name, with a search box.

A contact already in the workspace SHALL be marked `כבר ב-CRM` and SHALL NOT be selectable. A match is the same email, ignoring case, or the same phone, compared on digits with a leading `972` read as `0`. A Google contact with no name, no email and no phone SHALL NOT be listed.

`ייבוא {N} אנשי קשר` SHALL:
- import the chosen contacts, at most 500 at a time, within 30 seconds;
- create each as a lead with status `חדש` and source `google_contacts`;
- then show `יובאו {N}` and, when any were skipped as already in the CRM, how many.

#### Scenario: Importing three contacts

- **WHEN** Dana, a `member`, imports 3 picked Google contacts with `ייבוא 3 אנשי קשר`
- **THEN** within 30 seconds the workspace has 3 new leads with status `חדש` and source `Google Contacts`, and the page says `יובאו 3`

#### Scenario: A contact already in the CRM

- **WHEN** the list includes a Google contact whose email is already a lead's
- **THEN** that row shows `כבר ב-CRM` and has no checkbox

#### Scenario: Picking more than 500

- **WHEN** 501 contacts are picked
- **THEN** nothing is imported, and a Hebrew message says to import at most 500 at a time

#### Scenario: The import button pressed twice

- **WHEN** the import button is pressed twice within one second
- **THEN** each picked contact is created once

#### Scenario: Google unreachable

- **WHEN** the import page opens while Google does not answer within 10 seconds
- **THEN** the page says in Hebrew that the contacts could not be loaded, offers to try again, and nothing is imported

#### Scenario: A viewer

- **WHEN** a `viewer` opens the Connections screen of a connected workspace
- **THEN** no `ייבוא אנשי קשר` control is shown, and an import sent from that session is refused with a Hebrew message

#### Scenario: Mixed Hebrew and Latin names

- **WHEN** the list shows `דנה כהן · Studio Dana` with `dana@example.com`
- **THEN** the Hebrew reads right to left, the Latin company name and the address keep their order, and nothing is reordered

#### Scenario: The list at 390px

- **WHEN** the import page renders at 390px wide with 200 contacts
- **THEN** each row's name, its `כבר ב-CRM` mark or checkbox, and the import button are visible without horizontal scrolling, and each checkbox's target is at least 44px

### Requirement: Imported contacts start no automations

Contacts created by the Google import SHALL NOT start `contact.created` automations. They are existing relationships, not new leads.

#### Scenario: A welcome automation is on

- **WHEN** 10 Google contacts are imported into a workspace with a `contact.created` welcome email
- **THEN** no welcome email is sent to any of them

### Requirement: A lead's meetings show in their drawer, read live

With Google connected, the drawer of a lead who has an email SHALL show a `פגישות` block:
- the next meeting: the day, the hour in Israel time, and the title;
- up to 3 meetings from the last 180 days.

It SHALL cover only events on the connected calendar in which the lead's email is an attendee or the organizer. An event that merely mentions the address in its text SHALL NOT be shown. Each meeting SHALL link to the event in Google Calendar, opening in a new tab.

The block SHALL load after the drawer opens, and the drawer SHALL be usable without waiting for it. If Google hasn't answered in 5 seconds, the block SHALL say the meetings didn't load and offer to try again. Nothing from the calendar SHALL be stored.

With no Google connection there SHALL be no block. For a lead without an email, the block SHALL say there is no email to find meetings with.

#### Scenario: A next meeting

- **WHEN** Eran opens Dana's drawer while the connected calendar has an event on 3 October 2026 at 14:00 Israel time with `dana@example.com` as an attendee
- **THEN** the block shows that meeting's day, `14:00` and its title, linking to the event in Google Calendar

#### Scenario: No meetings

- **WHEN** the lead has no events in the window
- **THEN** the block says in Hebrew that there are no meetings with them in the last 180 days or the coming ones

#### Scenario: The address only in the description

- **WHEN** an event's description mentions `dana@example.com` but she is not an attendee or the organizer
- **THEN** that event is not shown

#### Scenario: Google is slow

- **WHEN** Google takes longer than 5 seconds
- **THEN** the drawer's other sections are usable at once, and after 5 seconds the block says the meetings didn't load, with `לנסות שוב`

#### Scenario: A lead without an email

- **WHEN** the drawer opens a lead with no email
- **THEN** the block says there is no email to find meetings with

#### Scenario: An English title in the Hebrew drawer

- **WHEN** the next meeting is titled `Q4 planning with Dana`
- **THEN** the title keeps its order inside the right-to-left block

#### Scenario: The block at 390px

- **WHEN** the drawer renders at 390px wide with a next meeting and 3 past ones
- **THEN** each meeting's day, hour and title are visible without horizontal scrolling, and each link's target is at least 44px tall
