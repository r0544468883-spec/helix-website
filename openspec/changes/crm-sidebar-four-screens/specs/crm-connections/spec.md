## MODIFIED Requirements

### Requirement: The Connections screen shows what is connected, and who may change it

Settings SHALL offer `חיבורים` to every role, after `אוטומציות` and before `API`. The four-screen side menu SHALL NOT list it. The screen SHALL have two sections: Google, and `לידים מפייסבוק (דרך Make)`.

The Google section SHALL show one of these states:
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
- **THEN** no Google page opens and nothing is stored. The Connections screen shows a Hebrew message that connecting needs an admin

#### Scenario: Hebrew with an address

- **WHEN** the Google section shows `מחובר: eran@example.com` on `/he/dashboard/crm/connections`
- **THEN** the Hebrew reads right to left and the address reads left to right, without reordering

#### Scenario: The screen at 390px

- **WHEN** the Connections screen renders at 390px wide
- **THEN** both sections and every control are reachable without horizontal scrolling, and every control is at least 44px on its smaller side

#### Scenario: Connections in Settings

- **WHEN** a `member` opens the settings control
- **THEN** the settings list shows `חיבורים` between `אוטומציות` and `API`, and the four-screen side menu does not list it

#### Scenario: Back from Google

- **WHEN** an admin finishes connecting Google and the browser returns to `/he/dashboard/crm/connections`
- **THEN** the side menu shows the settings list with `חיבורים` marked current
