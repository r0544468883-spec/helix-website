## Purpose

Lets a workspace see and manage its connections to outside services in one place: which Google account is connected and how, who may change it, and how its access is kept safe, revoked and renewed.

## ADDED Requirements

### Requirement: The Connections screen shows what is connected, and who may change it

The CRM side menu SHALL offer `חיבורים` to every role. The screen SHALL have two sections: Google, and `לידים מפייסבוק (דרך Make)`.

The Google section SHALL show one state:
- `לא מחובר`;
- `מחובר: {account email}`, with the date it was connected;
- `צריך לחבר מחדש`.

Only an `admin` or `agency_admin` SHALL be offered connecting, disconnecting, and creating the Make key. Every other role SHALL see the states only. A request for those actions from any other role's session SHALL be refused with a Hebrew message, and change nothing.

#### Scenario: An admin opens the screen

- **WHEN** Eran, an admin, opens `/he/dashboard/crm/connections` in a workspace with no Google connection
- **THEN** the Google section shows `לא מחובר` and a `חיבור Google` button

#### Scenario: A member opens the screen

- **WHEN** a `member` opens the Connections screen of a workspace connected to `eran@example.com`
- **THEN** it shows `מחובר: eran@example.com` and the date, with no connect, disconnect or key control

#### Scenario: A member calls the connect address directly

- **WHEN** a `member`'s session requests `/api/connections/google/start`
- **THEN** no Google page opens, nothing is stored, and the Connections screen shows a Hebrew message that connecting needs an admin

#### Scenario: Hebrew with an address

- **WHEN** the Google section shows `מחובר: eran@example.com` on `/he/dashboard/crm/connections`
- **THEN** the Hebrew reads right to left and the address reads left to right, without reordering

#### Scenario: The screen at 390px

- **WHEN** the Connections screen renders at 390px wide
- **THEN** both sections and every control are reachable without horizontal scrolling, and every control is at least 44px on its smaller side

### Requirement: Connecting Google asks for read access only, and comes back to the screen

Pressing `חיבור Google` SHALL open Google's consent page asking for:
- the account's email address;
- read-only access to its contacts;
- read-only access to its calendar events.

It SHALL ask for nothing that writes. After the admin allows access, the Connections screen SHALL show `מחובר: {account email}` within 10 seconds.

A workspace SHALL have at most one Google connection. Connecting again SHALL replace the old one and revoke its access at Google.

A return from Google that is declined, fails, or carries a state this admin's browser did not start SHALL store nothing, and SHALL show a Hebrew message on the Connections screen.

#### Scenario: Allowing access

- **WHEN** Eran allows access as `eran@example.com` on Google's consent page
- **THEN** within 10 seconds he is back on the Connections screen, which shows `מחובר: eran@example.com`

#### Scenario: Declining on Google's page

- **WHEN** Eran cancels on Google's consent page
- **THEN** he is back on the Connections screen with a Hebrew message that nothing was connected, and the state stays `לא מחובר`

#### Scenario: A forged return

- **WHEN** a request reaches the Google return address with a state that no admin's browser started
- **THEN** nothing is stored, and the response shows the Hebrew message that nothing was connected

#### Scenario: Connecting a different account

- **WHEN** Eran connects `sales@example.com` while `eran@example.com` is connected
- **THEN** the screen shows `מחובר: sales@example.com`, and `eran@example.com`'s access for this CRM is revoked at Google

### Requirement: The Google token never leaves the server

The token that renews Google access SHALL be stored encrypted at rest. It SHALL NOT appear in any page, action response or log line, or in any database row that the anon or authenticated roles can read. Only server code acting for the workspace that owns it SHALL use it.

#### Scenario: Pages and responses carry no token

- **WHEN** the Connections screen, the import page, a lead drawer and their action responses are loaded for a connected workspace
- **THEN** none of them contains a Google access token or refresh token

#### Scenario: The connections row holds a reference

- **WHEN** the workspace's row in the connections table is read
- **THEN** it holds the account email, the scopes, who connected it and when, and a reference to the encrypted token, not the token itself

### Requirement: Disconnecting revokes access at Google

An admin's `ניתוק` SHALL ask first. On confirmation, the CRM SHALL:
- revoke the token at Google;
- delete the stored token and the connection;
- show `לא מחובר`.

Meetings SHALL stop showing in drawers. Contacts already imported SHALL stay.

If Google cannot be reached to revoke, the connection SHALL still be removed from the CRM. A Hebrew message SHALL then link to the Google account page where access can be removed by hand.

#### Scenario: Disconnecting

- **WHEN** Eran confirms `ניתוק`
- **THEN** within 10 seconds the section shows `לא מחובר`, the next lead drawer shows no meetings block, and imported contacts are still in the list

#### Scenario: Google unreachable while disconnecting

- **WHEN** Eran confirms `ניתוק` while Google's revoke address does not answer
- **THEN** the CRM removes the connection, and a Hebrew message links to Google's account permissions page to finish there

### Requirement: A lapsed connection says so

When Google refuses the stored token, the connection's state SHALL become `צריך לחבר מחדש`. That happens when the account removed the access, when a testing-mode grant expired, or when Google revoked it.

Every place that uses Google SHALL then show a one-line Hebrew notice instead of Google data:
- the drawer's meetings;
- the import page.

For an admin, the notice SHALL link to the Connections screen.

#### Scenario: Access removed in the Google account

- **WHEN** a lead drawer opens after access for this CRM was removed from `eran@example.com`'s Google account
- **THEN** the meetings block shows the Hebrew reconnect notice, and the Connections screen shows `צריך לחבר מחדש`
