## Purpose

The business details a document carries: a logo and the details a client expects to see on a quote. They are set once per workspace on the "פרטי העסק" screen and used on every quote.

## ADDED Requirements

### Requirement: An admin sets the business details

The "פרטי העסק" screen SHALL show, for the active workspace:
- the business name
- the company number
- the address
- the phone
- the email
- the website
- whether the business is an עוסק פטור
- the default validity of a quote in days
- default notes for a quote

A user with the `admin` or `agency_admin` role SHALL be able to edit and save them, and every other role SHALL see them read-only with no edit control. A save SHALL be stored within 2 seconds.

A save SHALL be refused, with nothing stored and a Hebrew message under the field, when:
- the email is not an email address;
- the website is not an `http://` or `https://` address;
- the validity is not a whole number from 1 to 365;
- a field is longer than its limit: name 120, company number 20, address 200, phone 30, email 254, website 300 and notes 1,000 characters.

The validity SHALL default to 14 days. A save with no response within 15 seconds SHALL be treated as failed, and a failed save SHALL keep the typed values.

#### Scenario: An admin saves the details

- **WHEN** Eran saves the business name `HELIX`, the company number `515555555` and the phone `054-123-4567`
- **THEN** within 2 seconds the screen shows them as saved, and a new quote's preview shows them

#### Scenario: A member sees them read-only

- **WHEN** a user with the `member` role opens "פרטי העסק"
- **THEN** the details are shown with no field to edit and no save control

#### Scenario: An email that isn't an address

- **WHEN** Eran saves with the email `office@`
- **THEN** a Hebrew message under the email field says the address isn't valid, the value stays in the field, and nothing is stored

#### Scenario: A website without http

- **WHEN** Eran saves with the website `javascript:alert(1)`
- **THEN** a Hebrew message says the address must start with `https://`, and nothing is stored

#### Scenario: A validity out of range

- **WHEN** Eran saves a default validity of 400 days
- **THEN** a Hebrew message states the range 1 to 365, and nothing is stored

#### Scenario: The save fails

- **WHEN** Eran saves and the write fails because Supabase is unreachable
- **THEN** the typed values stay in the form and a Hebrew message says the details were not saved

#### Scenario: The network drops mid-save

- **WHEN** Eran saves and no response arrives
- **THEN** within 15 seconds the typed values are still in the form and a Hebrew message says the save did not complete

#### Scenario: Mixed Hebrew and Latin

- **WHEN** the business name is `HELIX בע״מ` and the address is `רחוב הרצל 10, Tel Aviv`
- **THEN** the screen and the quote show each in its own direction, with no character reordered

#### Scenario: The screen at 390px

- **WHEN** an admin opens "פרטי העסק" on a 390px-wide viewport
- **THEN** every field and the save control are at least 44px on their smaller side, the phone, email and website read left to right, and nothing scrolls horizontally

### Requirement: The document logo is uploaded once and shown on quotes

An admin SHALL be able to upload a logo for documents as a PNG, JPEG or WebP file of at most 1 MB, see it previewed, replace it and remove it. Any other file type, or a larger file, SHALL be refused with a Hebrew message that names the allowed types or the 1 MB limit, and nothing SHALL be stored. The logo SHALL appear at the top of every quote sent after it is set. The document logo SHALL NOT change the logo in the CRM's top bar. With no logo, a quote SHALL show the business name in its place.

#### Scenario: Uploading a PNG

- **WHEN** Eran uploads a 200 KB PNG logo
- **THEN** within 5 seconds the screen shows the logo, and a new quote's preview shows it at the top

#### Scenario: An SVG is refused

- **WHEN** Eran picks an SVG file
- **THEN** a Hebrew message says only PNG, JPEG or WebP are accepted, and the previous logo stays

#### Scenario: A file over 1 MB

- **WHEN** Eran picks a 2 MB JPEG
- **THEN** a Hebrew message states the 1 MB limit, and nothing is uploaded

#### Scenario: The top bar is untouched

- **WHEN** Eran uploads a document logo
- **THEN** the CRM's top bar still shows the same logo it showed before

#### Scenario: No logo

- **WHEN** a quote is previewed for a workspace with a business name and no logo
- **THEN** the business name is shown where the logo would be

#### Scenario: The upload fails

- **WHEN** Eran uploads a logo and the upload fails because storage is unreachable
- **THEN** a Hebrew message says the logo was not saved, and the previous logo stays
