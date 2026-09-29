## ADDED Requirements

### Requirement: The drawer shows the lead's details under labels

The drawer body SHALL open with a details region titled `פרטים`. The region SHALL show each of these that holds a value as one row with its label:
- phone
- email
- company
- role
- LinkedIn
- source
- background
- date added
- last touch
- score

A field with no value SHALL NOT render as a row. For a user who can write, the empty editable fields SHALL be named together in one line, and pressing that line SHALL open the edit form.

- **Date added** SHALL show the date and how long ago it was, counted in Israeli calendar days.
- **Last touch** SHALL show the same relative time as the contact's home row, or `טרם` when there is none.
- **Score** SHALL show the number, its tier word (`חם` from 70, `פושר` from 40, `קר` below 40) in neutral text, and the signals that add to it, named in Hebrew.
- **Source**: the values `manual`, `api`, `chief` and `import` SHALL show a Hebrew name, and any other value SHALL show as stored.
- **Phone and email** SHALL be links that start a call and a message.
- **LinkedIn** SHALL be a link only when its value is an `http://` or `https://` address, and plain text otherwise.

The header SHALL NOT show the score.

#### Scenario: A contact with everything filled

- **WHEN** Eran opens `דנה כהן`, who has a phone, an email, a company, a role, the source `manual`, a background and a call logged 4 days ago
- **THEN** the details show, each under its label, her phone, email, company, role, `הוזן ידנית` as the source, the background, the date added with how long ago, `לפני 4 ימים` as last touch, and the score row

#### Scenario: The score explained

- **WHEN** Eran opens a contact scored 70 from a business email, a phone and the status `בשיחה`, with no touch
- **THEN** the score row reads 70 with the word `חם` in neutral text and names `מייל עסקי`, `טלפון` and `בשיחה` as its signals, and the drawer header shows no score

#### Scenario: A contact with only a name and an email

- **WHEN** a member opens a contact that has only a name, an email and the source `api`
- **THEN** the details show the email, `API` as the source, the date added and `טרם` as last touch, and one line names phone, company, role, LinkedIn and background as fields to add

#### Scenario: A viewer sees what is there and nothing to add

- **WHEN** a viewer opens the same contact
- **THEN** the details show the same filled rows, with no add line and no edit control

#### Scenario: A source the CRM doesn't know

- **WHEN** Eran opens a contact whose source is `bni-meetup-2026`
- **THEN** the source row shows `bni-meetup-2026` exactly as stored, reading left to right

#### Scenario: A stored LinkedIn value that isn't a web address

- **WHEN** Eran opens a contact whose stored LinkedIn value is `javascript:alert(1)`
- **THEN** the LinkedIn row shows that text with no link, and pressing it opens nothing and runs nothing

#### Scenario: Days since the contact was added

- **WHEN** on 28/9/2026 Eran opens a contact created on 3/9/2026
- **THEN** the added row shows `3.9.2026` and `לפני 25 ימים`

#### Scenario: Mixed-direction details

- **WHEN** Eran opens a contact whose company is `Nurit Ltd.`, whose role is `מנהלת שיווק` and whose email is `dana@nurit.co.il`
- **THEN** the labels and the role read right to left, the company and the email read left to right, and no character is reordered

#### Scenario: A long Hebrew background at 390px

- **WHEN** Eran opens, on a 390px-wide viewport, a contact whose background is 600 Hebrew characters on three lines
- **THEN** the background reads right to left, keeps its three line breaks, wraps within the drawer, and nothing scrolls horizontally

### Requirement: A user who can write edits the lead's details in place

A user who can write SHALL be able to turn the details into a form with one `עריכה` control. One save SHALL store every field:
- name
- phone
- email
- company, chosen from the workspace's companies, or none
- role
- LinkedIn
- source
- background

Within 2 seconds of a save, the drawer header, the details and the contact's home row SHALL show the stored values, and the score SHALL be recalculated from them. Saving details SHALL NOT refresh the contact's last-touch time and SHALL NOT write a timeline entry.

A save SHALL be refused, with nothing stored and a Hebrew message naming the field, when:
- the name is empty;
- the email is not an email address;
- the LinkedIn value is not an `http://` or `https://` address;
- a field is longer than its limit: name 120, role 120, source 60, phone 30, email 254, LinkedIn 300 and background 2,000 characters.

The save control SHALL stay disabled while the name is empty. A save with no response within 15 seconds SHALL be treated as failed. A failed or refused save SHALL keep the typed values in the form. Cancel SHALL restore the stored values. A details save SHALL only ever change a contact in the user's active workspace.

#### Scenario: Correcting a phone number

- **WHEN** Eran saves `דנה כהן`'s details with the phone changed from `054-123-4567` to `052-765-4321`
- **THEN** within 2 seconds the details show `052-765-4321`, the WhatsApp button opens a chat with `972527654321`, and her last touch is unchanged

#### Scenario: Adding a phone raises the score

- **WHEN** Eran saves the details of a contact scored 25 with a phone added where there was none
- **THEN** within 2 seconds the score row and the contact's home row both show 30

#### Scenario: A changed email is read again for business

- **WHEN** Eran saves a contact's email changed from `dana@gmail.com` to `dana@nurit.co.il`
- **THEN** within 2 seconds the score is 25 higher and the score row names `מייל עסקי`

#### Scenario: Renaming the contact

- **WHEN** Eran saves the name `דנה כהן-לוי`
- **THEN** within 2 seconds the drawer header and the contact's home row show `דנה כהן-לוי`

#### Scenario: An empty name

- **WHEN** Eran clears the name field
- **THEN** the save control is disabled and nothing can be stored

#### Scenario: An email that isn't an address

- **WHEN** Eran saves with the email `dana@`
- **THEN** a Hebrew message under the email field says the address isn't valid, `dana@` is still in the field, and nothing is stored

#### Scenario: A LinkedIn value that isn't a web address

- **WHEN** Eran saves with the LinkedIn value `javascript:alert(1)`
- **THEN** a Hebrew message says the link must start with `https://`, and nothing is stored

#### Scenario: A background over the limit

- **WHEN** Eran saves a background of 2,001 characters
- **THEN** a Hebrew message states the 2,000-character limit, the text stays in the field, and nothing is stored

#### Scenario: Double-pressing save

- **WHEN** Eran presses save twice within 300ms
- **THEN** the contact is updated once and the timeline has no new entry

#### Scenario: The save fails

- **WHEN** Eran saves and the write fails because Supabase is unreachable
- **THEN** the typed values stay in the form and a Hebrew message says the details were not saved

#### Scenario: The network drops mid-save

- **WHEN** Eran saves and no response arrives
- **THEN** within 15 seconds the typed values are still in the form and a Hebrew message says the save did not complete

#### Scenario: Cancel

- **WHEN** Eran presses cancel after changing the role
- **THEN** the details show the stored role and nothing is stored

#### Scenario: Editing is not a touch

- **WHEN** Eran saves details on a contact last touched 20 days ago
- **THEN** the contact's home row keeps its last-touch time and its needs-a-touch mark

#### Scenario: A contact in another workspace

- **WHEN** a details save names a contact that belongs to a workspace other than the user's active one
- **THEN** nothing is stored and the response says the contact was not found

#### Scenario: A Hebrew name with a Latin part

- **WHEN** Eran saves the name `רונית בן-דוד (Nurit)`
- **THEN** the drawer header shows the Hebrew reading right to left with `(Nurit)` in its own order, and no character is reordered

#### Scenario: The form at 390px

- **WHEN** Eran opens the edit form on a 390px-wide viewport
- **THEN** every field and the save and cancel controls are at least 44px on their smaller side, the phone, email and LinkedIn fields read left to right, and nothing scrolls horizontally

## MODIFIED Requirements

### Requirement: The drawer shows status, reachability, money and history

An open contact's drawer SHALL show, without further navigation:
- the contact's name, status, role and company in the header
- the status path
- their details under labels, email and phone included
- the actions for reaching and logging
- their reminder
- their deals with value and stage
- their activity timeline, including recorded status changes

The details SHALL be the first region of the drawer's body, above the actions. Where a contact has none of a given item, the drawer SHALL say so in Hebrew rather than render an empty region.

The deals and reminder regions are the exceptions. For a user who can write, the deals region SHALL show even when the contact has no deals, as one line holding the region's title and the add-deal action. The reminder region SHALL show as one control that adds a reminder. A read-only user SHALL see no deals region for a contact without deals, and no reminder region for a contact without an open reminder.

#### Scenario: A contact with deals and history

- **WHEN** Eran opens a contact who has two deals and six logged activities
- **THEN** the drawer shows the status path with the current step marked, both deal titles with their values and stages, and the six activities newest first

#### Scenario: A contact with nothing logged yet

- **WHEN** Eran opens a contact with no deals and no activities
- **THEN** the drawer shows the status path, a Hebrew line stating there is no activity yet, the `+ תזכורת` control, and a deals line holding only its title and "+ עסקה חדשה"

#### Scenario: A viewer opens a contact with no deals

- **WHEN** a user with the viewer role opens a contact with no deals
- **THEN** the drawer shows no deals region, no add-deal action and no reach or logging action, and the status path offers no control

#### Scenario: The details come first

- **WHEN** Eran opens a contact with a phone and an email
- **THEN** the details region is the first thing in the drawer's body, above the reach and logging buttons, and no unlabelled email or phone line appears anywhere in the drawer

### Requirement: The drawer is dismissable and returns focus

The drawer SHALL close on Escape, on a click outside its panel, and on an explicit close control. On close, keyboard focus SHALL return to the contact-list row that opened it. Closing SHALL ask before discarding unsent text in any open box: email, WhatsApp message, call, meeting, note, reminder or new deal. It SHALL also ask before discarding unsaved changes to the details. When the status list is open over the drawer, Escape SHALL close the list first and leave the drawer open.

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

#### Scenario: Closing does not discard edited details silently

- **WHEN** Eran presses Escape with the phone changed in the details form and not saved
- **THEN** he is asked in Hebrew whether to discard the change, and the changed phone is still in the form if he declines

#### Scenario: An untouched edit form closes without asking

- **WHEN** Eran presses Escape with the details form open and nothing in it changed
- **THEN** the drawer closes without asking
