## Purpose

What the CRM home screen shows and in what order, so the first screenful answers "who do I contact next, and what did I last do with them" for the person running the pipeline.

## ADDED Requirements

### Requirement: The home opens on the work, not on a headline

The CRM home SHALL open with a compact header holding the workspace name, the workspace switcher, the "עוד" menu and at most one primary action. It SHALL NOT show a product-name headline or a marketing subtitle. The contact list SHALL begin within the first 360px of the page at a 1440×900 viewport.

#### Scenario: Desktop first screen

- **WHEN** a member loads `/he/dashboard/crm` at 1440×900 with 12 contacts
- **THEN** the header shows the workspace name and "ליד חדש", no "HELIX CHIEF CRM — ניהול לקוחות ולידים" headline is present, and the first contact row is visible without scrolling

#### Scenario: Phone first screen

- **WHEN** a member loads the CRM home at 390×844
- **THEN** the header fits on at most two lines with no horizontal scroll, every header control is at least 44px on its smaller side, and at least the first contact row is visible without scrolling

#### Scenario: A viewer's header

- **WHEN** a user with the `viewer` role loads the CRM home
- **THEN** the header shows no primary action and the read-only notice appears once under it

### Requirement: The pipeline figures are one line, and say nothing false

The home SHALL show the pipeline figures as a single line of text under the header, not as tiles. When the workspace has no deals, the line SHALL show only the contact count and SHALL NOT show value, won or win-rate figures.

#### Scenario: A workspace with deals

- **WHEN** a workspace has 30 contacts, 4 of them hot, and 6 deals worth ₪48,000 open, 2 won worth ₪20,000 and 1 lost
- **THEN** one line reads the contact count, the hot count, ₪48,000 open, ₪20,000 won and a 67% win rate, all on one line at 1440px

#### Scenario: A workspace with contacts and no deals

- **WHEN** a workspace has 1 contact and 0 deals
- **THEN** the line reads the contact count only, and no "₪0" and no "0%" appears on the page

#### Scenario: Figures wrap on a phone

- **WHEN** the workspace with deals is shown at 390px wide
- **THEN** the figures wrap onto additional lines within the column, no figure is cut off, and each amount keeps its ₪ sign and digits in order

### Requirement: A row shows who, where they stand, when last touched, and what is next

Each contact row SHALL show the name with the status chip beside it, not at the far edge of the row. It SHALL show when the contact was last touched as a relative time in the screen's language, or "טרם" / "never" when there is no activity. When the contact has an open task, the row SHALL show the earliest-due open task's title and due date. The list SHALL remain ordered by score, highest first.

#### Scenario: A contact with recent activity and an open task

- **WHEN** a contact's last activity was 3 days ago and they have an open task "לשלוח הצעת מחיר" due in 2 days
- **THEN** the row shows the name, the status chip beside it, "לפני 3 ימים", and "לשלוח הצעת מחיר" with its due date

#### Scenario: A contact never touched

- **WHEN** a contact has no activity recorded
- **THEN** the row shows "טרם" where the last-touch time would be, and no task line

#### Scenario: An overdue task

- **WHEN** a contact's earliest open task was due 4 days ago
- **THEN** the task line is marked overdue with the due date shown, and the mark is carried by text, not by colour alone

#### Scenario: Mixed Hebrew, Latin and numerals

- **WHEN** a row shows the name `רונית בן-דוד`, the company `Nurit Ltd.` and a task `Follow up 2nd proposal`
- **THEN** the Hebrew reads right-to-left, the Latin text and the numeral read in their own order, and no character is reordered

#### Scenario: A long Hebrew name at 390px

- **WHEN** a row with a 40-character Hebrew name and a 60-character task title is shown at 390px wide
- **THEN** the name and task truncate with an ellipsis on their own lines, the status chip stays fully visible, and the row is at least 44px tall

### Requirement: Contacts that need a touch are marked and filterable

A contact in an active status (`new`, `contacted`, `talking`, `proposal`, `signed`) whose last activity is 14 or more days ago, or who has no activity and was created 14 or more days ago, SHALL be marked as needing a touch. A filter chip SHALL narrow the list to those contacts and show how many there are. Contacts in `paid`, `client`, `declined` or `frozen` SHALL never be marked.

#### Scenario: A stale open conversation

- **WHEN** a contact in `talking` was last touched 15 days ago
- **THEN** the row carries the needs-a-touch mark

#### Scenario: A quiet active client

- **WHEN** a contact in `client` was last touched 60 days ago
- **THEN** the row carries no needs-a-touch mark

#### Scenario: Exactly on the threshold

- **WHEN** a contact in `new` was last touched exactly 14 days ago
- **THEN** the row carries the needs-a-touch mark, and a contact touched 13 days ago does not

#### Scenario: Using the filter

- **WHEN** 3 of 20 contacts need a touch and the user presses the chip reading "צריך מגע (3)"
- **THEN** the list shows exactly those 3 rows, and pressing the chip again shows all 20

#### Scenario: Nothing needs a touch

- **WHEN** no contact meets the rule
- **THEN** no needs-a-touch chip is shown

#### Scenario: The filter combined with the text filter

- **WHEN** the needs-a-touch filter is on and the user types a name that matches one of the 3 rows
- **THEN** the list shows that one row and the count line reads it as 1 of the 3

### Requirement: An empty deal board does not take the screen

When the workspace has no deals, the deal board SHALL collapse to one line holding the section title and, for a role that may write, the add-deal action. It SHALL NOT render empty stage columns. With one or more deals it SHALL render below the contact list with the same behaviour as before this change.

#### Scenario: No deals

- **WHEN** a member loads the home of a workspace with 0 deals
- **THEN** the pipeline section is a single line with "צינור עסקאות" and "+ עסקה חדשה", and no stage column is rendered

#### Scenario: Adding the first deal

- **WHEN** the member adds a first deal from that line
- **THEN** the full board appears with that deal in its stage column, without a page reload

#### Scenario: A viewer with no deals

- **WHEN** a viewer loads a workspace with 0 deals
- **THEN** the section shows only its title and no add-deal action

### Requirement: The home screen degrades honestly when data is missing

If the next-task lookup fails, the list SHALL still render every contact with name, status and last-touch, and SHALL omit only the task line. It SHALL NOT show an error in place of the list.

#### Scenario: Task lookup fails

- **WHEN** the query for open tasks returns an error while the contacts query succeeds
- **THEN** every contact row renders without a task line and no error text replaces the list
