## ADDED Requirements

### Requirement: A call, meeting or note is logged from the open contact

The drawer SHALL offer to log a call, a meeting and a note. Each SHALL open a text box in place. Saving SHALL write one timeline entry of that type carrying the text, SHALL refresh the contact's last-touch time and SHALL rescore the contact. A logged call, meeting or note SHALL count as a touch. The save control SHALL stay disabled while the box is empty. A save with no response within 15 seconds SHALL be treated as failed.

#### Scenario: Logging a call

- **WHEN** Eran saves a call with the text `דיברנו, שולחת הצעה עד חמישי`
- **THEN** the newest timeline entry is a call entry with that text, the box closes, and the contact's home row reads `היום` for last touch

#### Scenario: A logged call clears the needs-a-touch mark

- **WHEN** Eran logs a call on a contact whose last touch was 20 days ago
- **THEN** the contact's row on the home screen no longer carries the needs-a-touch mark

#### Scenario: An empty note cannot be saved

- **WHEN** Eran opens the note box
- **THEN** the save control is disabled until he types text, and no entry can be written from the empty box

#### Scenario: Double-pressing save

- **WHEN** Eran presses save on a call twice within 300ms
- **THEN** exactly one call entry is written

#### Scenario: The save fails

- **WHEN** Eran saves a note and the write fails because Supabase is unreachable
- **THEN** the typed text stays in the box, a Hebrew message says the note was not saved, and no entry is written

#### Scenario: The network drops mid-save

- **WHEN** Eran saves a meeting and no response arrives
- **THEN** within 15 seconds the typed text is still in the box and a Hebrew message says the save did not complete

#### Scenario: A note mixing Hebrew, Latin and numerals

- **WHEN** Eran logs the note `שלחתי את ה-proposal v2 ב-14:30`
- **THEN** the entry reads right-to-left, and `proposal v2` and `14:30` each read in their own order with no character reordered

#### Scenario: A viewer cannot log

- **WHEN** a user with the viewer role opens a contact
- **THEN** no call, meeting, note, WhatsApp or email control is shown

### Requirement: Each way to reach or log waits behind one button

The drawer SHALL show WhatsApp, email, call, meeting and note as one row of buttons. Pressing a button SHALL open that action's box in place, and at most one box SHALL be open at a time. Switching to another box SHALL keep the text already typed in each box until it is sent, saved or discarded. A button whose action is unavailable for this contact SHALL NOT be shown, and the drawer SHALL say why in Hebrew. This happens when there is no phone number, a phone number that cannot be used for WhatsApp, or no email address.

#### Scenario: Opening the email box

- **WHEN** Eran presses the email button on a contact with an email address
- **THEN** the subject and body fields open in place, and no other action's box is open

#### Scenario: Switching boxes keeps the text

- **WHEN** Eran reopens the email box, where he had typed a subject before switching to the note box
- **THEN** the typed subject is still in the email box

#### Scenario: A contact with no phone

- **WHEN** Eran opens a contact whose phone is empty
- **THEN** no WhatsApp button is shown, the other buttons are, and the drawer states in Hebrew that no phone number is stored

#### Scenario: The buttons at 390px

- **WHEN** the drawer is open on a 390px-wide viewport for a contact with a phone and an email
- **THEN** all five buttons are visible on at most two rows without horizontal scrolling, and each is at least 44px on its smaller side
