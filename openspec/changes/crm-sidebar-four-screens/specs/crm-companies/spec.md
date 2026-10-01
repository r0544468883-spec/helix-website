## Purpose

Gives companies a screen: every company in the workspace with its people, open deals and last activity. A company opens in place to show who works there and what is in play, and a writer can add and rename companies.

## ADDED Requirements

### Requirement: Every company in the workspace is on one screen

The CRM SHALL show a screen at `/{locale}/dashboard/crm/companies`, opened from the side menu's `חברות` and titled `חברות`. It SHALL list every company in the active workspace. Each row SHALL show:
- the company's name;
- how many people in the CRM belong to it: `איש קשר אחד`, `שני אנשי קשר`, `{n} אנשי קשר`, or `אין` for none;
- its open deals: how many, and their total value in ₪. A deal is the company's when it names the company, or when its person belongs to the company;
- its last activity: the most recent last touch among its people, as a relative time, or `טרם`.

Rows SHALL be ordered by last activity, most recent first. Companies with no activity come last, ordered by name. Every value SHALL say what it is: a column header from 768px wide, a label on a phone.

A text field SHALL narrow the list, as the user types, to companies whose name contains the typed text, ignoring case. At most 500 companies SHALL be listed. When there are more, one line SHALL say so. A signed-in person with no workspace who opens the screen SHALL land on the contacts screen's form for creating a workspace.

#### Scenario: A company with people and deals

- **WHEN** `Nurit Ltd.` has 3 people, the latest touched 5 days ago, and 2 open deals worth ₪12,000 together
- **THEN** its row shows `Nurit Ltd.`, `3 אנשי קשר`, 2 open deals with `₪12,000`, and `לפני 5 ימים`, each under its column header at 1440px

#### Scenario: A deal through its person

- **WHEN** a deal names no company and its person belongs to `Nurit Ltd.`
- **THEN** that deal is counted in `Nurit Ltd.`'s open deals

#### Scenario: Ordering

- **WHEN** company `A` was last touched today, `B` 10 days ago, and `C` never
- **THEN** the rows are ordered `A`, `B`, `C`, and `C` shows `טרם`

#### Scenario: One person

- **WHEN** a company has exactly one person
- **THEN** its row reads `איש קשר אחד`, never `1 אנשי קשר`

#### Scenario: Filtering by name

- **WHEN** Eran types `nur` in the filter field
- **THEN** only companies whose name contains `nur` in any case are listed, `Nurit Ltd.` among them

#### Scenario: A filter with no match

- **WHEN** the typed text matches no company
- **THEN** one line says no company matches, and the field keeps the text

#### Scenario: No companies yet

- **WHEN** a workspace has no companies
- **THEN** the screen shows one line saying there are no companies yet, and no column header

#### Scenario: The lookup fails

- **WHEN** the query for companies fails
- **THEN** the screen shows a Hebrew line saying the companies could not be loaded, and no line claims there are none

#### Scenario: Hebrew and Latin names

- **WHEN** the list shows `מאפיית נורית בע״מ` and `Data Vision` on a Hebrew screen
- **THEN** both are right-aligned, the Hebrew name reads right to left with its gershayim in place, and `Data Vision` reads left to right

#### Scenario: The list at 390px

- **WHEN** the screen renders at 390px wide with a 60-character company name
- **THEN** the name truncates with an ellipsis, each value shows with its label, every row is at least 44px tall, and nothing scrolls horizontally

#### Scenario: No workspace

- **WHEN** a signed-in person who belongs to no workspace opens `/he/dashboard/crm/companies`
- **THEN** they are on `/he/dashboard/crm` and see the form for creating a workspace

### Requirement: A company opens in place

Selecting a company's row SHALL expand it in place, below the row, without leaving the screen. Selecting it again SHALL collapse it. The row's control SHALL expose whether it is expanded. Opening one company SHALL NOT close another.

An open company SHALL list:
- its people, each with their status chip, most promising first, as on the contacts list. Selecting a person SHALL open their drawer over the Companies screen;
- its open and won deals, open first, each with its title, stage and value. Selecting a deal that has a person SHALL open that person's drawer.

Lost deals SHALL NOT be listed. A company with no people and no listed deals SHALL say so in Hebrew, and say that a person is linked to a company from their card.

#### Scenario: Opening a company

- **WHEN** Eran selects the `Nurit Ltd.` row
- **THEN** the row expands below itself, it lists `רונית בן-דוד` and `אבי כהן` with their status chips and the deal `אתר` in `הצעה` with `₪8,000`, and the control is exposed as expanded

#### Scenario: Collapsing it

- **WHEN** Eran selects the open `Nurit Ltd.` row again
- **THEN** it collapses and the control is exposed as collapsed

#### Scenario: Two companies open

- **WHEN** Eran opens `Nurit Ltd.` and then `Data Vision`
- **THEN** both stay open

#### Scenario: Opening a person

- **WHEN** Eran selects `רונית בן-דוד` inside the open `Nurit Ltd.`
- **THEN** within 1 second the drawer for `רונית בן-דוד` is open over the Companies screen, and the URL names that person

#### Scenario: Back from the person

- **WHEN** Eran closes that drawer with Escape
- **THEN** `Nurit Ltd.` is still open, and focus is on `רונית בן-דוד`'s name inside it

#### Scenario: A lost deal

- **WHEN** a company has one open deal and one lost deal
- **THEN** the open company lists the open deal only

#### Scenario: Nothing linked yet

- **WHEN** Eran opens a company with no people and no open or won deals
- **THEN** it says in Hebrew that the company has no people or deals yet, and that a person is linked to a company from their card

#### Scenario: By keyboard

- **WHEN** Eran moves focus to a company row with Tab and presses Enter
- **THEN** the company expands, and the next Tab moves focus to its first person

#### Scenario: An open company at 390px

- **WHEN** a company with 5 people opens at 390px wide
- **THEN** each person's row is at least 44px tall, names truncate with an ellipsis, status chips stay whole, and nothing scrolls horizontally

### Requirement: A writer adds a company

For a role that may write, the Companies header SHALL hold one primary action, `חברה חדשה`. It SHALL open a form below the header that asks for the company's name: 1 to 80 characters after surrounding spaces are trimmed. Saving SHALL, within 2 seconds:
- add the company to the list;
- close the form;
- offer the company wherever a person's company is chosen: adding a contact, and a contact's details.

A name that matches an existing company in the workspace, ignoring case and surrounding spaces, SHALL be refused with a Hebrew message, and nothing created. A viewer SHALL NOT see the action.

#### Scenario: Adding a company

- **WHEN** Eran saves the name `Nurit Ltd.`
- **THEN** within 2 seconds `Nurit Ltd.` is in the list with `אין` people, and it is offered in the company choice of the add-contact form

#### Scenario: The name is empty

- **WHEN** the save button is pressed with the name empty or only spaces
- **THEN** no company is created, and the form asks for a name in Hebrew

#### Scenario: The name is too long

- **WHEN** the save button is pressed with an 81-character name
- **THEN** no company is created, and the form says in Hebrew that the name can be at most 80 characters

#### Scenario: The name is taken

- **WHEN** Eran saves `nurit ltd.` while `Nurit Ltd.` exists in the workspace
- **THEN** no company is created, and a Hebrew message says a company by that name already exists

#### Scenario: Supabase is unreachable

- **WHEN** the save button is pressed while Supabase is unreachable
- **THEN** within 15 seconds a Hebrew message says the company was not created, the name stays in the field, and no company exists

#### Scenario: The button pressed twice

- **WHEN** the save button is pressed twice within one second
- **THEN** exactly one company is created

#### Scenario: A viewer's Companies screen

- **WHEN** a user with the `viewer` role opens the Companies screen
- **THEN** no `חברה חדשה` action is rendered, the read-only notice appears once under the header, and companies still open in place

#### Scenario: The form at 390px

- **WHEN** the add-company form opens at 390px wide
- **THEN** the name field and both buttons are visible without horizontal scrolling, and each button is at least 44px tall

### Requirement: A writer renames a company

An open company SHALL offer a role that may write a control that renames it. The new name SHALL follow the rules for adding a company. Only a company other than this one can make a name taken, so a change of case alone is allowed. A rename SHALL show within 2 seconds:
- in the list;
- in the drawer header of each of the company's people;
- in the company choice.

A rename that is not stored SHALL keep the edit open with the typed name, and say so in Hebrew within 15 seconds.

#### Scenario: Fixing a typo

- **WHEN** Eran renames `Nruit` to `Nurit Ltd.`
- **THEN** within 2 seconds the list shows `Nurit Ltd.`, and the drawer of each of its people names `Nurit Ltd.` under their name

#### Scenario: Changing only the case

- **WHEN** Eran renames `nurit ltd.` to `Nurit Ltd.`
- **THEN** the new name is saved and shown

#### Scenario: The new name is taken

- **WHEN** Eran renames `Nruit` to `data vision` while `Data Vision` exists in the workspace
- **THEN** nothing is renamed, and a Hebrew message says a company by that name already exists

#### Scenario: The rename fails

- **WHEN** Eran saves a rename while Supabase is unreachable
- **THEN** within 15 seconds a Hebrew message says the name was not saved, the edit stays open with the typed name, and the list still shows the old name

#### Scenario: A viewer cannot rename

- **WHEN** a user with the `viewer` role opens a company
- **THEN** no rename control is rendered
