## Purpose

One visible next step per person, with an optional due date, set, changed and completed from the open contact. It gives the home work queue something true to say about what happens next with each person.

## ADDED Requirements

### Requirement: The drawer shows the person's next step

The drawer SHALL show the contact's next step: their earliest-due open task, with its due date. It SHALL also say how many other open tasks the contact has. Open tasks with no due date SHALL come after dated ones, and among equals the earliest created SHALL come first. The home row's task line SHALL show the same task. A contact with no open task SHALL show a field to set one to a user who can write, and no next-step region to a user who cannot. An overdue next step SHALL be marked by text, not by colour alone.

#### Scenario: A next step with two more behind it

- **WHEN** Eran opens a contact with three open tasks: one due 1/10, one due 5/10, and one with no due date
- **THEN** the drawer shows the task due 1/10 as the next step and states that 2 more are open, and the contact's home row shows the same task

#### Scenario: No next step yet

- **WHEN** Eran opens a contact with no open task
- **THEN** the drawer shows a field to set the next step and an optional due date

#### Scenario: An overdue next step

- **WHEN** Eran opens a contact whose next step was due 4 days ago
- **THEN** the next step carries the text mark for overdue and its due date, in the same words the home row uses

#### Scenario: A viewer with a next step

- **WHEN** a user with the viewer role opens a contact with an open task
- **THEN** the next step's title and due date are shown with no edit and no done control

#### Scenario: A viewer without a next step

- **WHEN** a user with the viewer role opens a contact with no open task
- **THEN** the drawer shows no next-step region

### Requirement: A next step is set from the open contact

A user who can write SHALL be able to set a next step with a title and an optional due date. It SHALL be stored as an open task of that contact, and SHALL show on the contact's home row within 2 seconds without a reload. A due date in the past SHALL be accepted and shown as overdue. Setting a next step SHALL NOT refresh the contact's last-touch time. The save control SHALL stay disabled while the title is empty. A save with no response within 15 seconds SHALL be treated as failed.

#### Scenario: Setting a dated next step

- **WHEN** Eran sets the next step `לשלוח הצעה` due 30/9
- **THEN** within 2 seconds the drawer shows `לשלוח הצעה` with `עד 30/9`, and the home row's task line shows the same title and date

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
- **THEN** the drawer shows the field to set a new next step, the home row shows no task line, and the newest timeline entry reads `בוצע: לשלוח הצעה`

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
- **THEN** the title field, the date field and the save control are each at least 44px on their smaller side, and nothing scrolls horizontally

#### Scenario: A long Hebrew title

- **WHEN** the next step's title is 80 Hebrew characters on a 390px-wide viewport
- **THEN** the title wraps or truncates within the drawer, the done control stays fully visible, and nothing scrolls horizontally
