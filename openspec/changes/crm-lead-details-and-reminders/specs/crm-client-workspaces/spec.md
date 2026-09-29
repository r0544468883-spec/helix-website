## Purpose

Lets an agency keep a separate CRM workspace for each client. The agency's admin adds one from the Team page, and moves between the agency's own workspace and its clients' from the CRM home once there is more than one.

## ADDED Requirements

### Requirement: An admin adds a client workspace from the Team page

The Team page SHALL show a `סביבות לקוחות` card to the admin of a workspace that is not itself a client workspace. The card SHALL list that workspace's client workspaces by name, or say in Hebrew that there are none yet. It SHALL hold a name field and an add control.

Adding SHALL create a client workspace under the current one within 2 seconds, list it on the card, and offer a control that switches to it. From then on the CRM home SHALL show the workspace switcher.

The name SHALL be 1 to 80 characters after trimming spaces, and the add control SHALL stay disabled while the field is empty. A longer name SHALL be refused with a Hebrew message stating the limit. An add with no response within 15 seconds SHALL be treated as failed, and a failed or refused add SHALL keep the typed name in the field. No browser pop-up (`prompt`, `alert` or `confirm`) SHALL be used to add a client.

#### Scenario: Adding the first client

- **WHEN** Eran adds `מאפיית נורית` on the Team page of HELIX
- **THEN** within 2 seconds `מאפיית נורית` is listed on the card with a control to switch to it, and the CRM home header shows the switcher

#### Scenario: Switching to the new client

- **WHEN** Eran presses the switch control beside `מאפיית נורית`
- **THEN** the CRM home opens in `מאפיית נורית`, with the switcher naming it and a contact list that holds none of HELIX's contacts

#### Scenario: No clients yet

- **WHEN** Eran loads the Team page of a workspace with no client workspaces
- **THEN** the card says in Hebrew that there are no clients yet, above the name field and the add control

#### Scenario: An empty name

- **WHEN** the name field is empty or holds only spaces
- **THEN** the add control is disabled and no workspace is created

#### Scenario: A name over 80 characters

- **WHEN** Eran adds a name of 81 characters
- **THEN** a Hebrew message states the 80-character limit, the name stays in the field, and no workspace is created

#### Scenario: Double-pressing add

- **WHEN** Eran presses add twice within 300ms
- **THEN** exactly one client workspace is created

#### Scenario: The add fails

- **WHEN** Eran adds a client and the write fails because Supabase is unreachable
- **THEN** the typed name stays in the field and a Hebrew message says the client was not added

#### Scenario: The network drops mid-add

- **WHEN** Eran adds a client and no response arrives
- **THEN** within 15 seconds the typed name is still in the field and a Hebrew message says the add did not complete

#### Scenario: A name mixing Hebrew and Latin

- **WHEN** Eran adds `Nurit Bakery בע״מ`
- **THEN** the card and the switcher show `Nurit Bakery` reading left to right and `בע״מ` reading right to left, with no character reordered

#### Scenario: The card at 390px

- **WHEN** Eran loads the Team page on a 390px-wide viewport
- **THEN** the name field and the add control are each at least 44px on their smaller side, a 60-character client name wraps or truncates within the card, and nothing scrolls horizontally

### Requirement: Only the admin of a top-level workspace can add a client

A member, a viewer, and any user inside a client workspace SHALL NOT see the `סביבות לקוחות` card. The server SHALL refuse a client-workspace create from any of them, and nothing SHALL be created.

#### Scenario: A member loads the Team page

- **WHEN** a member of HELIX loads its Team page
- **THEN** no `סביבות לקוחות` card is shown

#### Scenario: Inside a client workspace

- **WHEN** Eran, switched to `מאפיית נורית`, loads its Team page
- **THEN** no `סביבות לקוחות` card is shown

#### Scenario: A create sent from inside a client workspace

- **WHEN** a client-workspace create is sent while the active workspace is `מאפיית נורית`
- **THEN** it is refused, and no workspace is created under `מאפיית נורית`

#### Scenario: A create sent by a member

- **WHEN** a member's session sends a client-workspace create
- **THEN** it is refused and no workspace is created

### Requirement: The switcher offers the workspaces and nothing else

When the user can reach two or more workspaces, the switcher SHALL list them: the user's own workspaces first, then client workspaces under their own heading. Choosing one SHALL make it the active workspace. The switcher SHALL NOT hold an action that creates a workspace. Each row SHALL be at least 44px tall.

#### Scenario: Choosing a client

- **WHEN** Eran picks `מאפיית נורית` in the switcher
- **THEN** within 2 seconds the CRM home shows that workspace's contacts and the switcher names it

#### Scenario: Nothing to create in the switcher

- **WHEN** Eran opens the switcher
- **THEN** it lists HELIX and `מאפיית נורית` and offers no control that creates a workspace

#### Scenario: The switcher at 390px

- **WHEN** Eran opens the switcher on a 390px-wide viewport
- **THEN** each row is at least 44px tall, the open menu fits within the viewport, and nothing scrolls horizontally
