# crm-team-roles Specification

## Purpose

What each role in a CRM workspace is allowed to do to that workspace's data, enforced at the database rather than only hidden in the interface, so that inviting a teammate does not hand them the ability to delete the pipeline.

## Requirements

### Requirement: A workspace has three assignable roles with distinct rights

A CRM workspace SHALL offer three assignable roles — `admin`, `member` and `viewer` — plus the inherited `agency_admin` granted to an admin of a parent agency workspace. Their rights over workspace data SHALL differ as follows: a viewer may read only; a member may read, create and update; an admin and an agency_admin may additionally delete. Every role SHALL read every record in its workspace.

#### Scenario: A viewer reads the pipeline

- **WHEN** a user whose role is `viewer` opens the CRM home screen
- **THEN** they see the workspace's contacts and deals with the same data an admin sees

#### Scenario: A member creates a contact

- **WHEN** a user whose role is `member` saves a new contact
- **THEN** the contact is stored in that workspace and appears in the contact list

#### Scenario: An agency admin inherits admin rights over a client workspace

- **WHEN** a user who is `admin` of an agency workspace acts inside a client workspace beneath it
- **THEN** they may read, create, update and delete that client workspace's records

### Requirement: A viewer cannot change workspace data, and the database is what stops them

A write attempted by a viewer SHALL be rejected by row-level security, independently of what the interface offered. A viewer SHALL NOT be able to create, update or delete a contact, company, deal, activity or task by any route available to them, including a direct database request made with their own session outside the application.

#### Scenario: A viewer's direct insert is refused

- **WHEN** a viewer issues a direct database insert of a contact into their workspace using their own session token and the public anon key
- **THEN** the insert is refused by row-level security and no row is created

#### Scenario: A viewer's direct update is refused

- **WHEN** a viewer issues a direct database update of an existing deal's stage in their workspace using their own session token
- **THEN** the update is refused and the deal's stored stage is unchanged

#### Scenario: A viewer's direct delete is refused

- **WHEN** a viewer issues a direct database delete of a contact in their workspace using their own session token
- **THEN** the delete is refused and the contact still exists

### Requirement: A member cannot delete workspace data

Deleting a contact, company, deal, activity or task SHALL require `admin` or `agency_admin`. A member's delete SHALL be refused by row-level security, so a member's session cannot be used to remove the workspace's records even through a direct database request.

#### Scenario: A member's direct delete of a contact is refused

- **WHEN** a member issues a direct database delete of a contact in their workspace using their own session token and the public anon key
- **THEN** the delete is refused and the contact still exists

#### Scenario: A member's attempt to empty a table is refused

- **WHEN** a member issues a direct database delete matching every deal in their workspace
- **THEN** no deal is deleted and the workspace's deal count is unchanged

#### Scenario: An admin can still delete

- **WHEN** an admin issues a delete of a contact in their workspace
- **THEN** the contact is deleted and its activities are removed with it

### Requirement: Destructive and agent-behaviour settings are admin-only

Deleting an automation and changing an autonomy setting SHALL require `admin` or `agency_admin`. A member SHALL keep creating and updating automations.

#### Scenario: A member cannot delete an automation

- **WHEN** a member attempts to delete an automation in their workspace
- **THEN** the automation is not deleted and the member is told in Hebrew that the action requires an admin

#### Scenario: A member cannot switch an agent to autopilot

- **WHEN** a member attempts to change an autonomy setting from `advisor` to `autopilot`
- **THEN** the setting is unchanged and the member is told in Hebrew that the action requires an admin

#### Scenario: A member still edits an automation

- **WHEN** a member changes the condition inside an existing automation and saves
- **THEN** the change is stored and the automation runs with the new condition

### Requirement: A restricted user is told why, not shown a failure

Where a user's role forbids an action, the interface SHALL NOT offer the control, and any action attempted anyway SHALL return a Hebrew explanation naming the required role rather than a database error string. No screen SHALL present a control that is certain to be refused.

#### Scenario: A viewer sees no write controls

- **WHEN** a viewer opens the CRM home screen
- **THEN** the add-contact button, the deal stage controls and the activity logger are absent, and the screen states in Hebrew that the account has read-only access

#### Scenario: A refused action explains itself

- **WHEN** a viewer's client issues a contact update anyway, for example from a stale page loaded before their role changed
- **THEN** the response states in Hebrew that the account is read-only, names the role required, and contains no raw database or policy text

#### Scenario: A role change takes effect without re-inviting

- **WHEN** an admin changes a user's role from `member` to `viewer` and that user reloads the CRM
- **THEN** the write controls are gone from their screen and their writes are refused

### Requirement: A viewer can be invited like any other role

The team screen SHALL offer `viewer` wherever it offers `admin` and `member`, both when inviting a new person and when changing an existing member's role. A pending invite SHALL be storable with any assignable role, and claiming it SHALL grant exactly that role.

#### Scenario: Inviting a viewer

- **WHEN** an admin invites an email address with the role `viewer`
- **THEN** a pending invite is recorded with role `viewer` and the invited address receives the invitation email

#### Scenario: Claiming a viewer invite

- **WHEN** the invited person signs in for the first time
- **THEN** they become a member of that workspace with role `viewer`, and their first CRM screen shows no write controls

#### Scenario: An agency admin invite is no longer rejected

- **WHEN** an admin invites an email address with the role `agency_admin`
- **THEN** the pending invite is recorded rather than refused by a check constraint

#### Scenario: An unknown role is refused

- **WHEN** an invite is attempted with the role `owner`
- **THEN** the invite is refused, no pending invite row is created, and the admin is told in Hebrew that the role is not valid

### Requirement: The change does not alter what an API key can do

API key access SHALL be governed by its scopes exactly as it is today. This change SHALL neither widen nor narrow API key permissions, and SHALL NOT make any previously working integration fail.

#### Scenario: A read-scoped key still reads

- **WHEN** an integration calls the contacts endpoint with a key holding `contacts:read`
- **THEN** the workspace's contacts are returned exactly as before this change

#### Scenario: A write-scoped key still writes

- **WHEN** an integration creates a contact with a key holding `contacts:write`
- **THEN** the contact is created, and the outcome is unchanged by any role in the workspace

### Requirement: Existing admins and members keep working after the migration

Applying the migration SHALL leave every current member's role intact and SHALL NOT lock an admin out of their own workspace. No role SHALL lose read access, and no member SHALL lose the ability to create or update records.

#### Scenario: No membership row changes

- **WHEN** the migration is applied to a workspace with one admin and two members
- **THEN** all three membership rows carry the same role they carried before, and a count of members per role is unchanged

#### Scenario: The admin retains full access

- **WHEN** the workspace admin loads the CRM after the migration
- **THEN** they can read, create, update and delete records in that workspace

#### Scenario: The migration is safe to re-run

- **WHEN** the migration is applied a second time
- **THEN** it completes without error and the set of policies on each CRM table is identical to the set after the first run

### Requirement: Role state is legible in Hebrew and on a phone

The team screen SHALL render right-to-left in Hebrew, SHALL keep invited email addresses reading left-to-right, and SHALL be operable at a 390px viewport.

#### Scenario: A mixed-direction member row

- **WHEN** the team screen lists a member named `רונית בן-דוד` with the email `ronit@nurit.co.il` and the role `viewer`
- **THEN** the Hebrew name and the role label read right-to-left, the email reads left-to-right, and no character is reordered

#### Scenario: The team screen at 390px

- **WHEN** the team screen renders at 390px wide with three members and two pending invites
- **THEN** the invite form, each role control and each remove control are reachable without horizontal scrolling, and every interactive target is at least 44px on its smaller side
