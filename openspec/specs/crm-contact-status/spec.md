# crm-contact-status Specification

## Purpose

One status per person, set by hand, that answers "where do we stand with them" at a glance from the contact list. It replaces the two overlapping dropdowns a contact carries today and is the only field on a contact row allowed to use colour.

## Requirements

### Requirement: A contact has exactly one status

Every contact SHALL carry exactly one status drawn from a closed set of nine values. Seven are ordered progress states — `new`, `contacted`, `talking`, `proposal`, `signed`, `paid`, `client` — and two are terminal — `declined`, `frozen`. A contact created without an explicit status SHALL be `new`. No other value SHALL be storable.

#### Scenario: A newly created contact starts at new

- **WHEN** Eran saves the add-contact form having chosen no status
- **THEN** the contact is stored with status `new` and its row in the contact list shows the `ליד חדש` chip

#### Scenario: A value outside the nine is rejected at the database

- **WHEN** a write attempts to set a contact's status to `mql`
- **THEN** the database rejects the write with a check-constraint violation, the contact's stored status is unchanged, and no partial update is committed

#### Scenario: One control replaces the two overlapping dropdowns

- **WHEN** Eran opens a contact that previously had `lifecycle_stage = opportunity` and `lead_status = qualified`
- **THEN** he sees exactly one status control showing `הצעה נשלחה`, and no control anywhere in the CRM offers `mql`, `sql`, `opportunity`, `customer`, `new`, `contacted`, `qualified` or `unqualified` as a separately editable field

### Requirement: Each status is visually distinct and never signalled by colour alone

In both the light and the dark theme, each of the nine statuses SHALL render as a chip whose colour treatment differs from all eight others, and every chip SHALL always carry its Hebrew label as text. Each chip's label SHALL measure at least 4.5:1 against the chip's own fill in both themes. `paid` SHALL be the only green chip, `new` the only chip with no fill, and `frozen` the only chip with a dashed border, in both themes. Status SHALL be the only element of a contact-list row that uses colour to carry meaning: the lead score SHALL render as a neutral number and the `hot`/`warm`/`cold` word SHALL NOT appear in a contact-list row.

#### Scenario: Nine statuses are told apart without reading

- **WHEN** a contact list holds at least one contact in each of the nine statuses
- **THEN** each row's status chip is distinguishable from the other eight by its colour treatment alone, and no two of the nine share the same treatment

#### Scenario: A colour-blind operator can still read every status

- **WHEN** the contact list renders with colour perception unavailable, simulated by forcing greyscale
- **THEN** every row's status is still readable from the chip's Hebrew text, and no row's status depends on hue to be identified

#### Scenario: A paying client is not also labelled cold

- **WHEN** a contact with status `paid` has a lead score below 40
- **THEN** the row shows the `שולם` chip as its only coloured element, the score renders as a plain number in a neutral badge, and the word `cold` appears nowhere in that row

#### Scenario: Nine statuses in the light theme

- **WHEN** the contact list shows a contact in each of the nine statuses in the light theme
- **THEN** no two chips share a treatment, `שולם` is the only green chip, `ליד חדש` has no fill, `בהקפאה` has a dashed border, and every label measures at least 4.5:1 against its fill

#### Scenario: A status chip at 390px in the light theme

- **WHEN** the list renders at 390px wide in the light theme with a contact whose status is `הצעה נשלחה`
- **THEN** the chip stays on one line, fully inside the viewport, with its label legible against its pale fill

### Requirement: Changing a status takes one interaction and persists

Eran SHALL be able to change a contact's status from the open contact without navigating to another screen. At a viewport 640px wide or wider, one tap on a step of the status path SHALL change the status to that step, and one tap on an exit control SHALL change it to that exit. Below 640px, one tap SHALL open a list of all nine statuses, a second tap SHALL choose one, and every row in the list SHALL be at least 44px tall. Any status SHALL be reachable from any other, with no required order. The new status SHALL be visible within 100ms of the choosing tap, without dimming or reducing the opacity of the chip or the path while the save is in flight, and SHALL be stored within 2 seconds under normal conditions.

#### Scenario: Status changes from the drawer

- **WHEN** Eran taps the `הצעה נשלחה` step on a contact whose status is `יצרנו קשר`
- **THEN** the chip reads `הצעה נשלחה` and the path marks that step within 100ms at full opacity, and reloading the page 2 seconds later still shows `הצעה נשלחה`

#### Scenario: The contact list reflects the change without a manual refresh

- **WHEN** Eran changes an open contact's status to `חתם`
- **THEN** that contact's row in the list behind the drawer shows the `חתם` chip within 2 seconds, with no page reload by Eran

#### Scenario: Skipping steps

- **WHEN** Eran taps the `שולם` step on a contact in `ליד חדש`
- **THEN** the status becomes `שולם`, the path shows every step before it as passed, and exactly one status change is recorded

#### Scenario: Choosing a status on a phone

- **WHEN** at 390px Eran picks `חתם` in the status list he opened from the path
- **THEN** the list closes, the chip reads `חתם` within 100ms, and the list's rows were each at least 44px tall

### Requirement: A failed status change is reverted and reported

If the status cannot be stored, the previous status SHALL be restored on the chip and the path, and Eran SHALL be told, in Hebrew, that it did not save. The CRM SHALL NOT display a status that is not stored. A change with no response within 15 seconds SHALL be treated as failed.

#### Scenario: The database is unreachable mid-change

- **WHEN** Eran changes a status to `שולם` and the write fails because Supabase is unreachable
- **THEN** the chip returns to its previous value within 10 seconds, a Hebrew message states the change did not save, and no `crm_activities` row is written

#### Scenario: The session expired while the drawer was open

- **WHEN** Eran changes a status after his session has expired
- **THEN** the chip returns to its previous value and the message names an expired session rather than a generic failure

#### Scenario: The network drops mid-change

- **WHEN** Eran taps a step and no response arrives
- **THEN** within 15 seconds the chip and the path return to the previous status and a Hebrew message says the change did not save

### Requirement: The legacy lifecycle columns stay consistent with status

`lifecycle_stage` and `lead_status` SHALL be written from `status` on every contact write and SHALL NOT be independently editable. For any contact, the pair SHALL always be the pair that the contact's current status maps to, so that the public API, CHIEF, and stored automation condition graphs continue to read a truthful value with no change of their own.

#### Scenario: Setting a status rewrites both legacy columns

- **WHEN** a contact's status is set to `paid`
- **THEN** the same contact's `lifecycle_stage` reads `customer` and its `lead_status` reads `qualified`

#### Scenario: A stored automation condition keeps matching

- **WHEN** an automation saved before this change runs a condition `lifecycle_stage == customer` against a contact whose status is `client`
- **THEN** the condition matches, and the automation's run log records the same outcome it recorded before this change

#### Scenario: The public API still sees the legacy fields

- **WHEN** an API-key integration issues `GET /api/v1/crm/contacts` for a contact whose status is `talking`
- **THEN** the response contains `lifecycle_stage: "sql"` and `lead_status: "qualified"` alongside `status: "talking"`, and the integration needs no change to keep working

### Requirement: The lead score follows the status

The lead score SHALL be computed from `status` rather than from the two legacy columns. It SHALL continue to fold in the existing signals with the same weights and the same 0..100 clamp: business email, linked company, phone, LinkedIn, an open deal, and activity recency. Every rescore SHALL fold in every signal, including an open deal, whatever triggered it. Opening a deal, and marking a deal won or lost, SHALL rescore the deal's contact.

#### Scenario: Advancing a status raises the score

- **WHEN** a contact with no other signals moves from `new` to `proposal`
- **THEN** their score rises from 0 to 50

#### Scenario: Declining a contact lowers the score

- **WHEN** a contact whose only other signal is a business email (25 points) is set to `declined`
- **THEN** their score is 5, being 25 minus 20, and they sort below every contact still in a progress status

#### Scenario: Logging activity still rescores

- **WHEN** Eran logs a call on a contact whose status is `contacted`
- **THEN** the contact's `last_activity_at` is set to that moment and the score gains the 20 points for activity inside 7 days

#### Scenario: An open deal survives a status change

- **WHEN** Eran moves a contact that has one open deal from `יצרנו קשר` to `בשיחה`
- **THEN** the contact's new score still includes the 20 points for the open deal

#### Scenario: An open deal survives a logged touch

- **WHEN** Eran logs a call on a contact that has one open deal
- **THEN** the contact's new score still includes the 20 points for the open deal

#### Scenario: Opening a first deal rescores the person

- **WHEN** Eran opens the first deal for a contact in `בשיחה` whose only other signal is a phone number and whose last touch was 45 days ago
- **THEN** within 2 seconds the contact's score is 65: 40 for the status, 5 for the phone and 20 for the open deal

#### Scenario: Losing the last open deal rescores the person

- **WHEN** Eran marks as lost the only open deal of a contact in `בשיחה` whose only other signal is a phone number and whose last touch was 45 days ago
- **THEN** within 2 seconds the contact's score is 45: 40 for the status and 5 for the phone

### Requirement: The backfill leaves every existing contact in a defensible status

Applying the migration SHALL assign every existing contact a status derived from its current `(lifecycle_stage, lead_status)` pair, SHALL leave no contact with a null status, and SHALL NOT change the score of any contact whose two legacy fields agreed with each other.

#### Scenario: Every contact has a status after the migration

- **WHEN** the migration is applied to a workspace holding contacts across all twenty legacy combinations
- **THEN** every contact has a non-null status drawn from the nine values, and a count of contacts with a null status returns zero

#### Scenario: A consistent contact keeps its score

- **WHEN** the migration runs over a contact with `lifecycle_stage = customer`, `lead_status = qualified` and score 80
- **THEN** that contact's status is `client` and its score is still 80

#### Scenario: The migration is safe to re-run

- **WHEN** the migration is applied a second time to the same database
- **THEN** it completes without error and no contact's status or score differs from the value it held after the first run

### Requirement: Status renders correctly in Hebrew and at a phone width

Every status chip SHALL render right-to-left in Hebrew with its label intact, SHALL keep Latin and numeric fragments in a mixed row readable left-to-right, and SHALL remain fully visible at a 390px viewport.

#### Scenario: A mixed Hebrew, Latin and numeric row

- **WHEN** the list renders a contact named `דנה כהן` at company `Nurit Ltd` with email `dana@nurit.co.il`, score 72 and status `הצעה נשלחה`
- **THEN** the Hebrew name and chip read right-to-left, the email and the score read left-to-right, and no character of the chip label is clipped or reordered

#### Scenario: A long Hebrew status in a narrow row

- **WHEN** the list renders at 390px wide with a contact whose status is `הצעה נשלחה` and whose name wraps to two lines
- **THEN** the chip stays on one line, remains fully within the viewport, and the row does not scroll horizontally

### Requirement: The status path shows where the person stands

The open contact SHALL show the seven progress statuses as a path in funnel order, starting at the reading-start edge: the right in Hebrew, the left in English.
- The current step SHALL carry its status colour and its label as text.
- Steps before it SHALL render as passed, all in one neutral treatment.
- Steps after it SHALL render as not reached.
- Exactly one step SHALL use a status hue.

`נדחה` and `בהקפאה` SHALL NOT be steps on the path. They SHALL be offered as two separate exit controls. When the contact is `נדחה` or `בהקפאה`, no step SHALL render as current, and the header chip SHALL carry the status.

At a viewport 640px wide or wider, every step SHALL show its label in full and be at least 44px on its smaller side. English uses short labels for the path. Below 640px, the path SHALL render without per-step labels as one control, at least 44px tall, that opens the status list.

A user who cannot write SHALL see the path with no step, exit or list control.

#### Scenario: The path in Hebrew

- **WHEN** Eran opens a contact in `בשיחה` with the interface in Hebrew
- **THEN** `ליד חדש` is the rightmost step, `לקוח פעיל` is the leftmost, `ליד חדש` and `יצרנו קשר` render as passed, `בשיחה` carries its indigo treatment and label, and the four steps after it render as not reached

#### Scenario: The path mirrors in English

- **WHEN** the same contact is opened with the interface in English
- **THEN** the first step is the leftmost, the order runs left to right, and each step shows its short English label

#### Scenario: One colour on the path

- **WHEN** the path renders for a contact in `שולם`
- **THEN** exactly one step uses a status hue, and the five passed steps share one neutral treatment

#### Scenario: Labels at desktop width

- **WHEN** the drawer renders at 1440×900 in Hebrew
- **THEN** every step's label is fully visible with none clipped or overlapping its neighbour, and each step is at least 44px on its smaller side

#### Scenario: Short labels in English

- **WHEN** the drawer renders at 1440×900 in English
- **THEN** every step shows its short English label in full, with none clipped or overlapping its neighbour

#### Scenario: The path at 390px

- **WHEN** Eran opens a contact on a 390px-wide viewport
- **THEN** the path fits the drawer's width without horizontal scrolling, shows no per-step labels, and is one control at least 44px tall

#### Scenario: A declined contact

- **WHEN** Eran opens a contact whose status is `נדחה`
- **THEN** no step on the path is marked current, the header chip reads `נדחה`, and both exit controls and all seven steps are still offered

#### Scenario: A viewer sees the path

- **WHEN** a user with the viewer role opens a contact in `בשיחה`
- **THEN** the path shows `בשיחה` as current and offers no tappable step, no exit control and no list control

### Requirement: A status change can be undone for 8 seconds

After a status change is stored, the drawer SHALL show, for 8 seconds, a line naming the new status with an undo control. Undo SHALL restore the previous status on screen within 100ms, store it within 2 seconds, and remove the timeline entry that the undone change wrote. Only the most recent change SHALL be undoable. A change SHALL NOT be undoable once the 8 seconds pass or the drawer closes.

#### Scenario: Undo within the window

- **WHEN** Eran presses undo 3 seconds after moving a contact from `בשיחה` to `חתם`
- **THEN** the chip and the path return to `בשיחה` within 100ms, a reload 2 seconds later shows `בשיחה`, and the timeline holds no `בשיחה ← חתם` entry

#### Scenario: The window closes

- **WHEN** 8 seconds pass after a status change with no undo
- **THEN** the undo line is gone and the new status stays stored

#### Scenario: A second change inside the window

- **WHEN** Eran moves a contact from `חתם` to `שולם` 4 seconds after moving it from `בשיחה` to `חתם`
- **THEN** the undo line offers to undo only the second change, and undoing it returns the contact to `חתם`

#### Scenario: Closing the drawer ends the offer

- **WHEN** Eran closes the drawer 2 seconds after a status change
- **THEN** the change stays stored, and reopening the contact shows no undo line

#### Scenario: The undo fails to save

- **WHEN** Eran presses undo and the write fails because Supabase is unreachable
- **THEN** within 15 seconds the chip and path show the new status again, a Hebrew message says the undo did not save, and the timeline entry for the change is still there

### Requirement: A status change is recorded on the timeline and is not a touch

Every stored status change SHALL write one timeline entry naming the previous and the new status, with the arrow pointing in the interface's reading direction. A status change SHALL NOT refresh the contact's last-touch time, SHALL NOT set or clear the needs-a-touch mark, and SHALL NOT change the activity-recency part of the score.

#### Scenario: The timeline shows the move

- **WHEN** Eran moves a contact from `יצרנו קשר` to `בשיחה`
- **THEN** the newest timeline entry reads `יצרנו קשר ← בשיחה` and is timestamped within the last 5 seconds

#### Scenario: The move recorded in English

- **WHEN** Eran moves a contact from `Contacted` to `In conversation` with the interface in English
- **THEN** the newest timeline entry reads `Contacted → In conversation`

#### Scenario: A never-touched contact stays never touched

- **WHEN** Eran moves a contact with no logged touch from `ליד חדש` to `יצרנו קשר`
- **THEN** the contact's row on the home screen still reads `טרם` for last touch

#### Scenario: A stale contact stays stale

- **WHEN** Eran moves a contact whose last touch was 20 days ago to `בשיחה`
- **THEN** the contact's row on the home screen still carries the needs-a-touch mark

#### Scenario: Only the status points move the score

- **WHEN** Eran moves a contact with no other signals, last touched 45 days ago, from `יצרנו קשר` to `בשיחה`
- **THEN** the contact's score is 40, the points for `בשיחה` alone, with nothing added for recency

### Requirement: Leaving the path asks one question and never blocks

Choosing `נדחה` SHALL store the status at once and then offer an optional reason: `מחיר`, `תזמון`, `בחרו במישהו אחר`, `לא מתאים`. A chosen reason SHALL be added to that change's timeline entry.

Choosing `בהקפאה` SHALL store the status at once and then offer when to come back: in 1 month, in 3 months, or on a chosen date. A chosen time SHALL set the contact's next step, titled to get back to the contact and due on that date.

Ignoring either question SHALL leave the status stored with no reason and no next step.

#### Scenario: Declined with a reason

- **WHEN** Eran picks the reason `מחיר` after declining a contact who was `בשיחה`
- **THEN** the status is `נדחה` and the timeline entry reads `בשיחה ← נדחה · מחיר`

#### Scenario: Declined without a reason

- **WHEN** Eran declines a contact and closes the drawer without picking a reason
- **THEN** the status is `נדחה` and its timeline entry names no reason

#### Scenario: Frozen for three months

- **WHEN** on 27/9/2026 Eran picks "בעוד 3 חודשים" after freezing the contact `דנה כהן`
- **THEN** the contact's next step reads `לחזור אל דנה כהן`, is due 27/12/2026, and shows on the contact's home row

#### Scenario: Frozen with no return date

- **WHEN** Eran freezes a contact and closes the drawer without answering
- **THEN** the status is `בהקפאה` and no next step is created

#### Scenario: The reason fails to save

- **WHEN** Eran picks a reason and the write fails because Supabase is unreachable
- **THEN** the status stays `נדחה`, a Hebrew message says the reason was not saved, and the timeline entry names no reason

#### Scenario: The question at 390px

- **WHEN** Eran declines a contact on a 390px-wide viewport
- **THEN** the four reasons wrap within the drawer without horizontal scrolling and each is at least 44px on its smaller side
