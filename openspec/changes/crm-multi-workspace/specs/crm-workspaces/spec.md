## Purpose

Lets one person belong to several CRM workspaces with a different role in each: create a workspace of their own, join someone else's from an invite, and move between them without one workspace's records ever showing in another.

## ADDED Requirements

### Requirement: Anyone signed in can create a workspace of their own

The side menu SHALL offer `workspace חדש` to every signed-in person, in every workspace and whatever their role. It SHALL open a form that asks for the workspace's name, 1 to 80 characters. Creating the workspace SHALL, within 5 seconds of the press:
- make the person its admin;
- open its CRM home, empty;
- add it to the person's switcher.

A person SHALL be able to create at most 10 workspaces. An eleventh SHALL be refused with a Hebrew message, and nothing created.

A signed-in person who belongs to no workspace SHALL be offered the same form in place of the notice that asks them to request an invite.

#### Scenario: A member creates her own workspace

- **WHEN** Dana, a `member` of Eran's workspace, creates a workspace named `הסטודיו של דנה`
- **THEN** within 5 seconds she is on the new workspace's empty CRM home as its admin, the switcher lists both workspaces, and Eran's workspace and her role in it are unchanged

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
- **THEN** within 15 seconds a Hebrew message says the workspace was not created, the name stays in the field, and no workspace exists

#### Scenario: The button pressed twice

- **WHEN** the create button is pressed twice within one second
- **THEN** exactly one workspace is created

#### Scenario: A long Hebrew name

- **WHEN** the workspace is named `סטודיו לעיצוב פנים ואדריכלות נוף בע״מ`
- **THEN** the form, the switcher row and the CRM home's heading show it right to left, and each either wraps or truncates without pushing anything off screen

#### Scenario: The form at 390px

- **WHEN** the create form renders at 390px wide
- **THEN** the name field and the create button are visible without horizontal scrolling, and the button is at least 44px tall

### Requirement: An invite joins another workspace even when the person already has one

This applies when the person presses `כניסה` on the page their invite email opened, and the invite is still pending, unexpired, and addressed to the address that is signing in. Within 5 seconds the CRM SHALL:
- add the person to the inviting workspace, with the invite's role;
- remove the invite from that workspace's pending list;
- open the inviting workspace's CRM home, whichever workspace the person was in before.

The person's other workspaces, and their roles there, SHALL stay as they were. A person who is already a member of the inviting workspace SHALL keep their current role, and the invite SHALL be removed.

An invite that was cancelled, has expired, or is addressed to someone else SHALL join nothing. The person SHALL still be signed in, SHALL land on the CRM home of a workspace they already belong to, and SHALL see a Hebrew notice that the invite could not be used.

#### Scenario: Joining while already in a workspace of her own

- **WHEN** Dana, admin of her own workspace, presses `כניסה` from Eran's invite as `member`
- **THEN** she lands on Eran's workspace's CRM home as `member`, her own workspace stays in the switcher as `מנהל`, and the invite leaves Eran's pending list

#### Scenario: Joining with no workspace yet

- **WHEN** someone with no account presses `כניסה` from an invite as `viewer`
- **THEN** they land on the inviting workspace's CRM home as `viewer`, with no write controls

#### Scenario: A cancelled invite

- **WHEN** Dana presses `כניסה` from an invite that Eran has since cancelled
- **THEN** she is signed in, lands on her own workspace, sees a Hebrew notice that the invite is no longer valid, and is not added to Eran's workspace

#### Scenario: A link edited to point at another address's invite

- **WHEN** the invite reference in a confirm link is changed to an invite addressed to someone else
- **THEN** the person signs in only as themselves, joins nothing, and sees the Hebrew notice that the invite could not be used

#### Scenario: Already a member of the inviting workspace

- **WHEN** Dana, already a `member` of Eran's workspace, presses `כניסה` from an older pending invite to it as `viewer`
- **THEN** she stays a `member`, and the invite leaves the pending list

### Requirement: The switcher shows the role held in each workspace

For a person with two or more workspaces, each row of the switcher SHALL show the workspace's name and the person's role there:
- `מנהל`;
- `חבר`;
- `צפייה בלבד`;
- `מנהל סוכנות` for a client workspace reached through an agency.

Switching SHALL change both what the person sees and what they may do, to that workspace's records and that workspace's role.

#### Scenario: Two workspaces, two roles

- **WHEN** Dana, `admin` of her own workspace and `member` of Eran's, opens the switcher
- **THEN** her own workspace's row shows `מנהל` and Eran's shows `חבר`

#### Scenario: Switching changes what she may do

- **WHEN** Dana switches from her own workspace to Eran's
- **THEN** the Team screen no longer offers changing anyone's role or removing anyone, which it offered in her own workspace

#### Scenario: The switcher at 390px

- **WHEN** the switcher opens at 390px wide with a workspace named `סטודיו לעיצוב פנים ואדריכלות נוף בע״מ`
- **THEN** the name truncates, the role label stays fully visible, and every row is at least 44px tall

### Requirement: One workspace's records never show in another

A person in several workspaces SHALL see only the active workspace's contacts, companies, deals, tasks, activities, quotes and team. Every action they take SHALL apply to the active workspace only.

#### Scenario: Search stays inside the active workspace

- **WHEN** Dana, in her own workspace, searches ⌘K for the name of a contact that exists only in Eran's workspace
- **THEN** no result appears

#### Scenario: A contact link from the other workspace

- **WHEN** Dana, active in her own workspace, opens the address of a contact drawer from Eran's workspace
- **THEN** the drawer says the contact was not found in this workspace, and shows none of its details
