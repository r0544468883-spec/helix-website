## Purpose

One screen listing every open reminder in the workspace, across all its people and grouped by when it is due, so the day's follow-ups can be seen and closed in one place. A reminder is a row of `crm_tasks`. On screen it is called `תזכורת`, as in the lead's drawer and the contacts list.

## ADDED Requirements

### Requirement: Every open reminder in the workspace is on one screen

The CRM SHALL show a screen at `/{locale}/dashboard/crm/tasks`, opened from the side menu's `תזכורות` and titled `תזכורות`. It SHALL list every open reminder in the active workspace, whoever created it, including those created by automations.

The reminders SHALL be in four groups, in this order:
- `באיחור`: due before today;
- `היום`: due today;
- `בהמשך`: due after today;
- `בלי תאריך`: no due date.

"Today" SHALL be the calendar day in Israel. Each group's heading SHALL show how many reminders it holds, and a group with none SHALL NOT render. Within a group, reminders SHALL be ordered by due date, earliest first, then by when they were created, oldest first.

Each row SHALL show the reminder's title, the person it is about, and its due date. Every value SHALL say what it is: a column header from 768px wide, a label on a phone. At most 500 reminders SHALL be listed, the earliest due first. When there are more, one line SHALL say that only the 500 nearest are shown. A signed-in person with no workspace who opens the screen SHALL land on the contacts screen's form for creating a workspace.

#### Scenario: The four groups

- **WHEN** today in Israel is 1/10 and a workspace has open reminders due 26/9, 1/10 and 5/10, plus one with no date
- **THEN** `באיחור (1)`, `היום (1)`, `בהמשך (1)` and `בלי תאריך (1)` each list one reminder, in that order

#### Scenario: Israel's day, not the server's

- **WHEN** it is 00:30 on 2/10 in Israel (21:30 on 1/10 UTC) and a reminder is due 1/10
- **THEN** the reminder is listed under `באיחור`

#### Scenario: A reminder from an automation

- **WHEN** an automation has created the reminder `מעקב אוטומטי` for `דנה כהן`
- **THEN** the screen lists `מעקב אוטומטי` with `דנה כהן` as its person

#### Scenario: No open reminders

- **WHEN** a workspace has no open reminders
- **THEN** the screen shows one line saying there are no open reminders and that a reminder is set from a person's card, and no group heading

#### Scenario: More than 500

- **WHEN** a workspace has 620 open reminders
- **THEN** 500 are listed, the earliest due first, and one line says only the 500 nearest are shown

#### Scenario: The lookup fails

- **WHEN** the query for open reminders fails
- **THEN** the screen shows a Hebrew line saying the reminders could not be loaded, and no line claims there are none

#### Scenario: Hebrew, Latin and numerals

- **WHEN** a reminder titled `לשלוח הצעה 2 עד יום ה׳` for `John Smith` is listed on a Hebrew screen
- **THEN** the title reads right to left with its numeral in order, and the name reads left to right, both right-aligned

#### Scenario: The screen at 390px

- **WHEN** the screen renders at 390px wide with a 60-character reminder title
- **THEN** the title truncates with an ellipsis on its own line, the person and due date stay fully visible with their labels, every row is at least 44px tall, and nothing scrolls horizontally

#### Scenario: No workspace

- **WHEN** a signed-in person who belongs to no workspace opens `/he/dashboard/crm/tasks`
- **THEN** they are on `/he/dashboard/crm` and see the form for creating a workspace

### Requirement: A reminder is marked done from the list

For a role that may write, each row SHALL offer a control that marks the reminder done. Its accessible name SHALL be `סימון '{title}' כבוצע`. Marking a reminder done SHALL:
- remove the row within 2 seconds and lower its group's count by one;
- have the same effects as marking it done in the person's drawer:
  - one timeline entry `בוצע: {title}` on that person;
  - no change to their last-touch time;
  - their next open reminder, if any, takes its place on the contacts list.

Focus SHALL then move to the next row's control, or to the screen's title when no row is left. A completion that is not stored SHALL put the row back within 15 seconds with a Hebrew message. A viewer SHALL see no done control.

#### Scenario: Marking a reminder done

- **WHEN** Eran marks `לשלוח הצעה` for `דנה כהן` done on the reminders screen
- **THEN** within 2 seconds the row is gone, its group's count is one lower, and the newest entry on `דנה כהן`'s timeline reads `בוצע: לשלוח הצעה`

#### Scenario: The next reminder takes its place

- **WHEN** Eran marks done the earlier of a person's two open reminders
- **THEN** that person's row on the contacts screen shows the other reminder

#### Scenario: Marking done is not a touch

- **WHEN** Eran marks done a reminder of a person last touched 20 days ago
- **THEN** that person's row on the contacts screen keeps its last-touch time and its needs-a-touch mark

#### Scenario: The write fails

- **WHEN** Eran marks a reminder done while Supabase is unreachable
- **THEN** within 15 seconds the row is back in its group with its count restored, and a Hebrew message says it was not saved

#### Scenario: Already done in another tab

- **WHEN** Eran marks done a reminder that was marked done in another tab after this screen loaded
- **THEN** the row leaves the list, and the person's timeline has one `בוצע` entry for it, not two

#### Scenario: By keyboard

- **WHEN** Eran moves focus to a row's done control with Tab and presses Space
- **THEN** the reminder is marked done and focus is on the next row's done control

#### Scenario: A viewer's reminders

- **WHEN** a user with the `viewer` role opens the reminders screen
- **THEN** every row shows its title, person and due date, no done control is rendered, and the read-only notice appears once under the header
