## ADDED Requirements

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

## MODIFIED Requirements

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
