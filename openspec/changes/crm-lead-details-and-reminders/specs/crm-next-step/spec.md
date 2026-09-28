## ADDED Requirements

### Requirement: Logging a call or meeting offers a reminder

After a call or a meeting is logged and stored, the drawer SHALL open the reminder form when the contact has no open reminder. The form SHALL open under the line `מה הלאה?`, with its title field focused and a `לא עכשיו` control. `לא עכשיו` SHALL close the form back to the `+ תזכורת` control and store nothing. When the contact already has an open reminder, logging SHALL leave the reminder region as it was. A logged note, a WhatsApp message or an email SHALL NOT open the form, and neither SHALL a call or meeting that failed to save. An offered form with nothing typed in it SHALL NOT count as unsaved text when the drawer closes.

#### Scenario: After a call

- **WHEN** Eran saves a call on a contact with no open reminder
- **THEN** the reminder form opens under `מה הלאה?` with an empty title field that has focus, and no task is stored

#### Scenario: Setting the offered reminder

- **WHEN** Eran saves the offered form with the title `לשלוח הצעה` and `בעוד 3 ימים` picked
- **THEN** within 2 seconds the reminder `לשלוח הצעה` shows with its due date, and the contact's home row shows the same

#### Scenario: Not now

- **WHEN** Eran presses `לא עכשיו` on the offered form
- **THEN** the region shows the `+ תזכורת` control and no task is stored

#### Scenario: A reminder is already open

- **WHEN** Eran saves a meeting on a contact whose reminder `להתקשר` is open
- **THEN** `להתקשר` stays shown with its done control, and no form opens

#### Scenario: After a note

- **WHEN** Eran saves a note on a contact with no open reminder
- **THEN** no reminder form opens

#### Scenario: The call fails to save

- **WHEN** Eran saves a call and the write fails because Supabase is unreachable
- **THEN** no reminder form opens, and the call box keeps its text with a Hebrew message

#### Scenario: Closing with the offer untouched

- **WHEN** Eran closes the drawer while the offered form is open with nothing typed
- **THEN** the drawer closes without asking and no task is stored

#### Scenario: The offer at 390px

- **WHEN** the form opens after a call on a 390px-wide viewport
- **THEN** `מה הלאה?`, the title field, the three quick picks and the save and `לא עכשיו` controls fit the drawer's width, each control is at least 44px on its smaller side, and nothing scrolls horizontally

## MODIFIED Requirements

### Requirement: The drawer shows the person's next step

The drawer SHALL show the contact's next step in a region titled `תזכורת`: their earliest-due open task, with its due date. It SHALL also say how many other open reminders the contact has. Open tasks with no due date SHALL come after dated ones, and among equals the earliest created SHALL come first. The home row's task line SHALL show the same task.

A contact with no open task SHALL show a user who can write a single `+ תזכורת` control, which opens the form to set one. It SHALL NOT show an empty form or a disabled save control. A user who cannot write SHALL see no reminder region for a contact with no open task. An overdue next step SHALL be marked by text, not by colour alone.

#### Scenario: A next step with two more behind it

- **WHEN** Eran opens a contact with three open tasks: one due 1/10, one due 5/10, and one with no due date
- **THEN** the drawer shows the task due 1/10 under `תזכורת` and the line `ועוד שתי תזכורות פתוחות`, and the contact's home row shows the same task

#### Scenario: No next step yet

- **WHEN** Eran opens a contact with no open task
- **THEN** the drawer shows one `+ תזכורת` control, and no title field, date field or save control until he presses it

#### Scenario: Opening the form

- **WHEN** Eran presses `+ תזכורת`
- **THEN** a title field with focus, the quick picks `מחר`, `בעוד 3 ימים` and `בעוד שבוע`, a date field, save and cancel appear in place of the control

#### Scenario: An overdue next step

- **WHEN** Eran opens a contact whose next step was due 4 days ago
- **THEN** the next step carries the text mark for overdue and its due date, in the same words the home row uses

#### Scenario: A viewer with a next step

- **WHEN** a user with the viewer role opens a contact with an open task
- **THEN** the next step's title and due date are shown with no edit and no done control

#### Scenario: A viewer without a next step

- **WHEN** a user with the viewer role opens a contact with no open task
- **THEN** the drawer shows no reminder region

### Requirement: A next step is set from the open contact

A user who can write SHALL be able to set a next step with a title and an optional due date. The due date SHALL be set either in the date field or with one of three quick picks: `מחר`, `בעוד 3 ימים` and `בעוד שבוע`. They set it 1, 3 or 7 days after today's date in Israel. A picked quick pick SHALL be marked as chosen and SHALL fill the date field.

The step SHALL be stored as an open task of that contact, and SHALL show on the contact's home row within 2 seconds without a reload. A due date in the past SHALL be accepted and shown as overdue. Setting a next step SHALL NOT refresh the contact's last-touch time. The save control SHALL stay disabled while the title is empty. Cancel SHALL close the form back to the `+ תזכורת` control and store nothing. A save with no response within 15 seconds SHALL be treated as failed.

#### Scenario: Setting a dated next step

- **WHEN** Eran sets the next step `לשלוח הצעה` due 30/9
- **THEN** within 2 seconds the drawer shows `לשלוח הצעה` with `עד 30/9`, and the home row's task line shows the same title and date

#### Scenario: Tomorrow, just after midnight in Israel

- **WHEN** at 01:30 Israel time on 1/10/2026 Eran picks `מחר`
- **THEN** the date field shows 2/10/2026

#### Scenario: In a week

- **WHEN** on 28/9/2026 Eran picks `בעוד שבוע`
- **THEN** the date field shows 5/10/2026 and `בעוד שבוע` is marked as chosen

#### Scenario: An empty title

- **WHEN** Eran clears the title field of a new next step
- **THEN** the save control is disabled and nothing can be stored

#### Scenario: Double-pressing save

- **WHEN** Eran presses save on a new next step twice within 300ms
- **THEN** exactly one open task is stored

#### Scenario: The save fails

- **WHEN** Eran saves a next step and the write fails because Supabase is unreachable
- **THEN** the typed title and date stay in the form and a Hebrew message says the step was not saved

#### Scenario: The network drops mid-save

- **WHEN** Eran saves a next step and no response arrives
- **THEN** within 15 seconds the typed title and date are still in the form and a Hebrew message says the save did not complete

#### Scenario: Cancel

- **WHEN** Eran presses cancel with the title `להתקשר` typed
- **THEN** the region shows the `+ תזכורת` control again and no task is stored

#### Scenario: Setting a step is not a touch

- **WHEN** Eran sets a next step on a contact whose last touch was 20 days ago
- **THEN** the contact's home row still carries the needs-a-touch mark and its last-touch time is unchanged

### Requirement: A next step is changed or completed

A user who can write SHALL be able to change a next step's title and due date, and mark it done. A change SHALL show in the drawer and on the home row within 2 seconds. A step marked done SHALL leave the drawer and the home row within 2 seconds and SHALL write one timeline entry naming it as done. The contact's next open task, if any, SHALL take its place. Completing a step SHALL NOT refresh the contact's last-touch time. A change or completion that is not stored SHALL be reverted on screen and reported in Hebrew.

#### Scenario: Rescheduling

- **WHEN** Eran changes the due date of `לשלוח הצעה` from 30/9 to 2/10
- **THEN** within 2 seconds the drawer and the home row both show `עד 2/10`

#### Scenario: Completing the only step

- **WHEN** Eran marks `לשלוח הצעה` done on a contact with no other open task
- **THEN** the drawer shows the `+ תזכורת` control, the home row shows no task line, and the newest timeline entry reads `בוצע: לשלוח הצעה`

#### Scenario: Completing with more steps open

- **WHEN** Eran marks the next step done on a contact with 2 more open tasks
- **THEN** the earliest-due of the remaining tasks becomes the next step in the drawer and on the home row

#### Scenario: The completion fails

- **WHEN** Eran marks a step done and the write fails because Supabase is unreachable
- **THEN** within 15 seconds the step is shown as open again and a Hebrew message says it was not saved

#### Scenario: Completing a step is not a touch

- **WHEN** Eran marks a step done on a contact whose last touch was 20 days ago
- **THEN** the contact's home row keeps its last-touch time and its needs-a-touch mark

### Requirement: The next step works in Hebrew and on a phone

The next step SHALL render right-to-left in Hebrew, keep Latin and numeric fragments in their own order, and be usable at a 390px viewport.

#### Scenario: A title mixing Hebrew, Latin and numerals

- **WHEN** the next step is titled `לשלוח proposal v2 עד 14:00`
- **THEN** the Hebrew reads right-to-left, and `proposal v2` and `14:00` each read in their own order

#### Scenario: Setting a step at 390px

- **WHEN** Eran sets a next step on a 390px-wide viewport
- **THEN** the title field, the three quick picks, the date field and the save and cancel controls are each at least 44px on their smaller side, the quick picks wrap within the drawer, and nothing scrolls horizontally

#### Scenario: A long Hebrew title

- **WHEN** the next step's title is 80 Hebrew characters on a 390px-wide viewport
- **THEN** the title wraps or truncates within the drawer, the done control stays fully visible, and nothing scrolls horizontally
