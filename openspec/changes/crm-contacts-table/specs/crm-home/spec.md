## MODIFIED Requirements

### Requirement: A row shows who, where they stand, when last touched, and what is next

From a 768px-wide viewport, the contact list SHALL be a table with four column headers, in reading order: `איש קשר`, `סטטוס`, `תזכורת`, `מגע אחרון` (English: Contact, Status, Reminder, Last touch). Below 768px, each contact SHALL be a card showing the same four fields. On the card, the reminder and the last touch SHALL each carry their label, so no value appears without saying what it is. The fields are:
- **Contact:** the name, and under it the role, company and email when there are any.
- **Status:** the status chip, in the column right after the name.
- **Reminder:** the earliest-due open task's title with its due date, or `אין` / `none` when there is no open task. An overdue one SHALL be marked by text.
- **Last touch:** the relative time of the last touch in the screen's language, or `טרם` / `never` when there is no activity, with the needs-a-touch mark under it when it applies.

The list SHALL NOT show the lead score. It SHALL remain ordered by score, highest first, and one line above it SHALL say that the order is by priority, most promising first. Selecting a contact anywhere on its row or card SHALL open its drawer. Each contact SHALL be exactly one keyboard stop. When there are no contacts, no header row SHALL render.

#### Scenario: A contact with recent activity and an open task

- **WHEN** a contact's last activity was 3 days ago and they have an open task "לשלוח הצעת מחיר" due in 2 days
- **THEN** the row shows the name, the status chip under `סטטוס`, "לשלוח הצעת מחיר" with its due date under `תזכורת`, and "לפני 3 ימים" under `מגע אחרון`

#### Scenario: A contact never touched

- **WHEN** a contact has no activity recorded and no open task
- **THEN** the row shows "טרם" under `מגע אחרון` and "אין" under `תזכורת`

#### Scenario: An overdue task

- **WHEN** a contact's earliest open task was due 4 days ago
- **THEN** the reminder is marked overdue with the due date shown, and the mark is carried by text, not by colour alone

#### Scenario: Mixed Hebrew, Latin and numerals

- **WHEN** a row shows the name `רונית בן-דוד`, the company `Nurit Ltd.` and a task `Follow up 2nd proposal`
- **THEN** the Hebrew reads right-to-left, the Latin text and the numeral read in their own order, and no character is reordered

#### Scenario: A long Hebrew name at 390px

- **WHEN** a contact with a 40-character Hebrew name and a 60-character task title is shown at 390px wide
- **THEN** the card shows the name and the reminder truncated with an ellipsis on their own lines, the status chip stays fully visible, and the card is at least 44px tall

#### Scenario: Column headers on a desktop

- **WHEN** a member loads `/he/dashboard/crm` at 1440×900 with 3 contacts
- **THEN** a header row reads, right to left, `איש קשר`, `סטטוס`, `תזכורת`, `מגע אחרון` above the first contact, and each contact's values sit under their headers

#### Scenario: Column headers in English

- **WHEN** a member loads `/en/dashboard/crm` at 1440×900
- **THEN** the header row reads, left to right, Contact, Status, Reminder, Last touch

#### Scenario: Labels on a phone

- **WHEN** the CRM home loads at 390×844 in Hebrew
- **THEN** each contact is a card that reads, for example, "מגע אחרון: היום" and "תזכורת: אין", no header row is shown, and nothing scrolls horizontally

#### Scenario: No number in the list

- **WHEN** a contact whose score is 65 is listed
- **THEN** the number 65 appears nowhere in the list, in the table or on the card

#### Scenario: The order is said, and kept

- **WHEN** the list holds a contact scored 65 and a contact scored 30
- **THEN** the contact scored 65 is above the other, and the line above the list says the order is by priority, most promising first

#### Scenario: Opening a contact from anywhere on its row

- **WHEN** Eran clicks the last-touch cell of a row at 1440×900
- **THEN** that contact's drawer opens and the URL names the contact

#### Scenario: One keyboard stop per contact

- **WHEN** a keyboard user presses Tab through a list of 3 contacts
- **THEN** focus lands exactly 3 times, once on each contact's name, and Enter on a name opens that contact's drawer

#### Scenario: Focus returns to the row

- **WHEN** Eran closes a contact's drawer with Escape
- **THEN** focus is on that contact's name in the list

#### Scenario: No contacts yet

- **WHEN** a member loads the CRM home of a workspace with 0 contacts
- **THEN** the empty-list line shows and no header row renders
