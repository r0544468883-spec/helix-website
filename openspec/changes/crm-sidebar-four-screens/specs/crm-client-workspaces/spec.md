## MODIFIED Requirements

### Requirement: The switcher offers the workspaces and nothing else

When the user can reach two or more workspaces, the profile menu SHALL hold the switcher. It is a group listing those workspaces: the user's own first, then client workspaces under their own heading. Choosing one SHALL make it the active workspace and keep the user on the screen they were on, now showing that workspace. The group SHALL NOT hold an action that creates a workspace. `workspace חדש` is a separate item of the profile menu, outside the group. Each row SHALL be at least 44px tall.

#### Scenario: Choosing a client

- **WHEN** Eran picks `מאפיית נורית` in the switcher
- **THEN** within 2 seconds the screen shows that workspace's records and the profile control names it

#### Scenario: Nothing to create in the switcher

- **WHEN** Eran opens the profile menu
- **THEN** the workspaces group lists HELIX and `מאפיית נורית` and holds no control that creates a workspace. `workspace חדש` sits below the group, apart from it

#### Scenario: The switcher at 390px

- **WHEN** Eran opens the profile menu on a 390px-wide viewport
- **THEN** each row is at least 44px tall, the open menu fits within the viewport, and nothing scrolls horizontally

#### Scenario: Switching on another screen

- **WHEN** Eran picks `מאפיית נורית` while on `/he/dashboard/crm/deals`
- **THEN** within 2 seconds the Deals screen shows `מאפיית נורית`'s deals and the address is still `/he/dashboard/crm/deals`

#### Scenario: The switch fails

- **WHEN** Eran picks `מאפיית נורית` while Supabase is unreachable
- **THEN** within 15 seconds the menu shows a Hebrew message that the switch did not work, and the screen still shows HELIX
