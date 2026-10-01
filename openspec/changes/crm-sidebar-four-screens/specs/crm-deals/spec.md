## Purpose

Gives deals a screen of their own: the pipeline board, the one action that adds a deal, and the money figures. The contacts screen then holds people and the Deals screen holds money.

## ADDED Requirements

### Requirement: Deals have their own screen

The CRM SHALL show the deal board on its own screen at `/{locale}/dashboard/crm/deals`, opened from the side menu's `עסקאות`. The screen's header SHALL hold:
- the title `עסקאות`;
- for a role that may write, one primary action, `עסקה חדשה`.

The board SHALL work as it did on the CRM home: six stage columns, dragging a card between columns, the ‹ › controls, and losing a deal. A viewer SHALL see the board with no add action, no drag and no stage controls, and the read-only notice once under the header. A signed-in person with no workspace who opens the screen SHALL land on the contacts screen's form for creating a workspace.

#### Scenario: Opening Deals

- **WHEN** a member selects `עסקאות` in the side menu
- **THEN** `/he/dashboard/crm/deals` opens with the title `עסקאות`, the `עסקה חדשה` action, and the workspace's open deals in their stage columns

#### Scenario: Moving a deal

- **WHEN** a member drags the card `בניית אתר` from `ליד` to `פגישה`
- **THEN** the card lands in `פגישה` on release and is still there after a reload

#### Scenario: A viewer's Deals screen

- **WHEN** a user with the `viewer` role opens the Deals screen of a workspace with 4 deals
- **THEN** all 4 cards show, no `עסקה חדשה` action, drag handle or ‹ › control is rendered, and the read-only notice appears once under the header

#### Scenario: No workspace

- **WHEN** a signed-in person who belongs to no workspace opens `/he/dashboard/crm/deals`
- **THEN** they are on `/he/dashboard/crm` and see the form for creating a workspace

#### Scenario: Hebrew titles with numerals

- **WHEN** a card titled `אתר + 3 דפי נחיתה` worth 12,000 is shown on `/he/dashboard/crm/deals`
- **THEN** the title reads right to left with the numeral in order, and the value reads `₪12,000`

#### Scenario: English

- **WHEN** a member opens `/en/dashboard/crm/deals`
- **THEN** the title reads `Deals`, the action reads `New deal`, and the side menu is on the left

#### Scenario: Deals at 390px

- **WHEN** the Deals screen renders at 390px wide with deals in all six stages
- **THEN** the columns stack two to a row, the page does not scroll horizontally, the title and the action share the header, and every control is at least 44px on its smaller side

### Requirement: A deal is added from the Deals header

Selecting `עסקה חדשה` SHALL open a form below the header with:
- the deal's title, which is required;
- its value in ₪;
- an optional person.

Saving SHALL, within 2 seconds, add the deal to the `ליד` column and close the form. A save that is not stored SHALL keep the form open with what was typed and say so in Hebrew within 15 seconds.

#### Scenario: Adding a deal

- **WHEN** Eran saves a deal titled `בניית אתר` worth 8,000 for `דנה כהן`
- **THEN** within 2 seconds the card is in the `ליד` column showing `₪8,000` and `דנה כהן`, and the form is closed

#### Scenario: The title is empty

- **WHEN** the save button is pressed with the title empty
- **THEN** no deal is added, and the form asks for a title in Hebrew

#### Scenario: Supabase is unreachable

- **WHEN** the save button is pressed while Supabase is unreachable
- **THEN** within 15 seconds a Hebrew message says the deal was not saved, and the title, value and person are still in the form

#### Scenario: The button pressed twice

- **WHEN** the save button is pressed twice within one second
- **THEN** exactly one deal is added

#### Scenario: The form at 390px

- **WHEN** the add-deal form opens at 390px wide
- **THEN** the title, value and person fields and both buttons are visible without horizontal scrolling, and each button is at least 44px tall

### Requirement: The money figures are one line on the Deals screen, and say nothing false

The Deals screen SHALL show one line of figures under its header. It SHALL show:
- the value of open deals, when at least one deal is open;
- the value won, only when at least one deal is won;
- the win rate, only when at least one deal is won or lost.

With no deals, the line SHALL NOT render. The screen SHALL NOT show a `₪0` or a `0%` figure.

#### Scenario: A workspace with deals

- **WHEN** a workspace has 6 open deals worth ₪48,000, 2 won worth ₪20,000 and 1 lost
- **THEN** one line reads `₪48,000 בצינור`, `₪20,000 נסגרו` and `67% זכייה`, all on one line at 1440px

#### Scenario: Open deals only

- **WHEN** a workspace has 2 open deals worth ₪10,000 and none won or lost
- **THEN** the line reads `₪10,000 בצינור` only, and no `₪0` and no `%` figure appears on the screen

#### Scenario: No deals

- **WHEN** a workspace has 0 deals
- **THEN** no figures line renders, and no `₪0` and no `0%` appears on the screen

#### Scenario: Figures wrap on a phone

- **WHEN** the workspace with deals is shown at 390px wide
- **THEN** the figures wrap onto more lines within the column, no figure is cut off, and each amount keeps its ₪ sign and digits in order

### Requirement: An empty Deals screen shows no empty columns

When the workspace has no deals, the Deals screen SHALL show its header and one line saying there are no deals yet. It SHALL NOT render empty stage columns. The first deal added SHALL bring the columns in without a page reload.

#### Scenario: No deals yet

- **WHEN** a member opens the Deals screen of a workspace with 0 deals
- **THEN** the screen shows `עסקאות`, `עסקה חדשה` and one line saying there are no deals yet, and no stage column is rendered

#### Scenario: Adding the first deal

- **WHEN** the member adds a first deal from that screen
- **THEN** the six columns appear with the deal in `ליד`, without a page reload

#### Scenario: A viewer with no deals

- **WHEN** a viewer opens the Deals screen of a workspace with 0 deals
- **THEN** the screen shows the title and the no-deals line, and no add action
