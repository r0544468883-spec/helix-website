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

Eran SHALL be able to change a contact's status from the open contact without navigating to another screen. The new status SHALL be visible within 100ms of the interaction, without dimming or reducing the opacity of the chip while the save is in flight, and SHALL be stored within 2 seconds under normal conditions.

#### Scenario: Status changes from the drawer

- **WHEN** Eran picks `הצעה נשלחה` on a contact whose status is `יצרנו קשר`
- **THEN** the chip reads `הצעה נשלחה` within 100ms at full opacity, and reloading the page 2 seconds later still shows `הצעה נשלחה`

#### Scenario: The contact list reflects the change without a manual refresh

- **WHEN** Eran changes an open contact's status to `חתם`
- **THEN** that contact's row in the list behind the drawer shows the `חתם` chip within 2 seconds, with no page reload by Eran

### Requirement: A failed status change is reverted and reported

If the status cannot be stored, the previous status SHALL be restored on screen and Eran SHALL be told, in Hebrew, that it did not save. The CRM SHALL NOT display a status that is not stored.

#### Scenario: The database is unreachable mid-change

- **WHEN** Eran changes a status to `שולם` and the write fails because Supabase is unreachable
- **THEN** the chip returns to its previous value within 10 seconds, a Hebrew message states the change did not save, and no `crm_activities` row is written

#### Scenario: The session expired while the drawer was open

- **WHEN** Eran changes a status after his session has expired
- **THEN** the chip returns to its previous value and the message names an expired session rather than a generic failure

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

The lead score SHALL be computed from `status` rather than from the two legacy columns, and SHALL continue to fold in the existing signals — business email, linked company, phone, LinkedIn, an open deal, and activity recency — with the same weights and the same 0..100 clamp.

#### Scenario: Advancing a status raises the score

- **WHEN** a contact with no other signals moves from `new` to `proposal`
- **THEN** their score rises from 0 to 50

#### Scenario: Declining a contact lowers the score

- **WHEN** a contact whose only other signal is a business email (25 points) is set to `declined`
- **THEN** their score is 5, being 25 minus 20, and they sort below every contact still in a progress status

#### Scenario: Logging activity still rescores

- **WHEN** Eran logs a call on a contact whose status is `contacted`
- **THEN** the contact's `last_activity_at` is set to that moment and the score gains the 20 points for activity inside 7 days

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
