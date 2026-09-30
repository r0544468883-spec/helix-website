## Purpose

Brings a workspace's Facebook Lead Ads leads into the CRM through the customer's own Make account and the CRM's public API: a key that can only add leads, a ready scenario file, and an API that doesn't add the same person twice and records what they wrote.

## ADDED Requirements

### Requirement: The Connections screen prepares Facebook leads through Make

The `לידים מפייסבוק (דרך Make)` section SHALL show numbered Hebrew steps:
1. open a Make account;
2. import the scenario file;
3. connect Facebook inside Make;
4. paste the key;
5. turn the scenario on.

The section SHALL show the address to send to and the fields the scenario sends: `full_name`, `email`, `phone`, `notes`, `source` = `facebook_lead_ads`, `match` = `email_or_phone`. It SHALL offer the scenario file as a download.

For an admin, `יצירת מפתח ל-Make` SHALL create an API key named `Make · Facebook Lead Ads` with the `contacts:write` scope only. The key SHALL be shown once, with a copy control. The scenario file SHALL contain no key.

#### Scenario: Creating the Make key

- **WHEN** Eran presses `יצירת מפתח ל-Make`
- **THEN** a new key named `Make · Facebook Lead Ads` with only `contacts:write` is shown once with a copy control, and after a reload only its prefix is shown

#### Scenario: The Make key cannot read

- **WHEN** the Make key calls `GET /api/v1/crm/contacts`
- **THEN** the response is 403 `insufficient_scope`, naming `contacts:read`

#### Scenario: The scenario file

- **WHEN** the scenario file is downloaded
- **THEN** it passes Make's blueprint schema check, sends to the CRM's contacts address with the fields above, and contains no API key

#### Scenario: A member reads the steps

- **WHEN** a `member` opens the section
- **THEN** the steps, the address and the file are shown, with no key button

#### Scenario: Hebrew steps with an address and fields

- **WHEN** the section renders on `/he/dashboard/crm/connections`
- **THEN** the Hebrew steps read right to left, and the address and field names read left to right in their own blocks

#### Scenario: The section at 390px

- **WHEN** the section renders at 390px wide
- **THEN** the address and the fields wrap or scroll inside their own box, and the page itself does not scroll sideways

### Requirement: The contacts API can match a person instead of adding them twice

A `POST /api/v1/crm/contacts` carrying `match: "email_or_phone"` SHALL look in the key's workspace for an existing contact with:
- the same email, ignoring case; or
- the same phone, compared on digits, with a leading `972` read as `0`.

When one is found, no contact SHALL be created. The response SHALL be 200, with that contact's id and `matched: true`.

Without `match`, the endpoint SHALL behave exactly as today: a new contact and 201.

#### Scenario: The same email twice

- **WHEN** Make sends `dana@example.com` a second time with `match: "email_or_phone"`
- **THEN** the workspace still has one contact for her, and the response is 200 with her id and `matched: true`

#### Scenario: The same phone written differently

- **WHEN** a contact has `052-123-4567` and Make sends `+972 52 123 4567` with `match: "email_or_phone"`
- **THEN** no contact is created, and the response is 200 with the existing id

#### Scenario: No match requested

- **WHEN** an integration sends an existing email without `match`
- **THEN** a second contact is created and the response is 201, as before this change

#### Scenario: Nothing to match on

- **WHEN** Make sends a lead with a name and neither email nor phone, with `match: "email_or_phone"`
- **THEN** a new contact is created and the response is 201

### Requirement: The form's answers reach the lead's timeline

A `notes` value of up to 2,000 characters SHALL be written to the contact's timeline, new or matched, as an entry that counts as a touch. Its line breaks SHALL be kept.

A longer `notes` SHALL be refused with 422 `notes_too_long`, and nothing stored.

#### Scenario: A new lead with answers

- **WHEN** Make sends a new lead whose `notes` is `תקציב: 5,000 ₪` and `מתי: בשבוע הבא` on two lines
- **THEN** the lead's timeline shows both lines as one entry, right to left, and the lead's last touch is now

#### Scenario: A returning lead with answers

- **WHEN** a matched lead's submission carries `notes`
- **THEN** the entry is added to the existing contact's timeline, and no new contact appears

#### Scenario: Notes too long

- **WHEN** Make sends `notes` of 2,001 characters
- **THEN** the response is 422 `notes_too_long`, and no contact or timeline entry is stored

### Requirement: A lead added through the API starts the workspace's new-contact automations

A contact created through `POST /api/v1/crm/contacts` SHALL start the workspace's `contact.created` automations, as a contact created inside the CRM does. A matched submission SHALL start none.

An automation that fails SHALL NOT change the API's response.

#### Scenario: A Facebook lead starts the welcome automation

- **WHEN** Make sends a new lead to a workspace with a `contact.created` automation
- **THEN** the automation runs for that lead, and the response is 201

#### Scenario: A returning lead starts nothing

- **WHEN** Make sends a lead that matches an existing contact
- **THEN** no automation runs

#### Scenario: A failing automation

- **WHEN** the workspace's `contact.created` automation fails
- **THEN** the lead is still created and the response is still 201

### Requirement: Contacts from Facebook and Google say where they came from

A contact whose source is `facebook_lead_ads` SHALL show `Facebook Lead Ads` in the drawer's details. One whose source is `google_contacts` SHALL show `Google Contacts`.

#### Scenario: A lead from Make

- **WHEN** the drawer opens a lead created by the Make scenario
- **THEN** its details show the source `Facebook Lead Ads`
