## MODIFIED Requirements

### Requirement: Anyone signed in can create a workspace of their own

The profile menu SHALL offer `workspace חדש` to every signed-in person, in every workspace and whatever their role. The side menu SHALL NOT list it. It SHALL open a form that asks for the workspace's name, 1 to 80 characters. Creating the workspace SHALL, within 5 seconds of the press:
- make the person its admin;
- open its CRM home, empty;
- add it to the workspaces group of the person's profile menu.

A person SHALL be able to create at most 10 workspaces. An eleventh SHALL be refused with a Hebrew message, and nothing created.

A signed-in person who belongs to no workspace SHALL be offered the same form in place of the notice that asks them to request an invite.

#### Scenario: A member creates her own workspace

- **WHEN** Dana, a `member` of Eran's workspace, creates a workspace named `הסטודיו של דנה`
- **THEN** within 5 seconds Dana is on the new workspace's empty CRM home as its admin. The profile menu's workspaces group lists both workspaces, and Eran's workspace and Dana's role in it are unchanged

#### Scenario: The name is empty

- **WHEN** the create button is pressed with the name field empty
- **THEN** no workspace is created, and the form asks for a name in Hebrew

#### Scenario: The name is too long

- **WHEN** the create button is pressed with an 81-character name
- **THEN** no workspace is created, and the form says in Hebrew that the name can be at most 80 characters

#### Scenario: The eleventh workspace

- **WHEN** a person who has already created 10 workspaces creates another
- **THEN** no workspace is created, and a Hebrew message says the limit is 10

#### Scenario: No workspace at all

- **WHEN** a signed-in person who belongs to no workspace opens `/he/dashboard/crm`
- **THEN** they see the create form, not the notice asking for an invite

#### Scenario: Supabase is unreachable

- **WHEN** the create button is pressed while Supabase is unreachable
- **THEN** within 15 seconds a Hebrew message says the workspace was not created. The name stays in the field, and no workspace exists

#### Scenario: The button pressed twice

- **WHEN** the create button is pressed twice within one second
- **THEN** exactly one workspace is created

#### Scenario: A long Hebrew name

- **WHEN** the workspace is named `סטודיו לעיצוב פנים ואדריכלות נוף בע״מ`
- **THEN** the form, the workspaces group row and the profile control show it right to left. Each wraps or is cut short with an ellipsis, without pushing anything off screen

#### Scenario: The form at 390px

- **WHEN** the create form renders at 390px wide
- **THEN** the name field and the create button are visible without horizontal scrolling, and the button is at least 44px tall

#### Scenario: Offered from the profile menu

- **WHEN** a `viewer` opens the profile menu on the Reminders screen
- **THEN** `workspace חדש` is offered and opens the create form, and the side menu does not list it
