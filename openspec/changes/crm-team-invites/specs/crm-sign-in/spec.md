## Purpose

How a person gets into the CRM: the sign-in email the CRM sends, the page its link opens, where a first sign-in lands, and returning to the CRM's public address after signing in.

## ADDED Requirements

### Requirement: The sign-in page sends a link from the CRM to invited and existing addresses

The sign-in page SHALL send a one-time sign-in link to an address that has any of these:
- an account;
- a pending, unexpired invite;
- an allowlist entry.

The email SHALL:
- come from an `@helix.co.il` address through Resend, within 10 seconds of the press;
- be in the page's language.

After sending, the page SHALL say that the link was sent and that it opens on any device.

Any other address SHALL get the existing "not invited" message. No email SHALL be sent, and no account SHALL be created for it.

The limits:
- the per-address limits that invites use apply, one email per 60 seconds and five per hour, counted together with invites;
- one IP address SHALL be allowed at most 10 requests an hour.

#### Scenario: A member asks for a link

- **WHEN** Eran requests a link for his own address on `/he/login`
- **THEN** within 10 seconds he receives a Hebrew email from an `@helix.co.il` address, and the page says the link was sent and can be opened on any device

#### Scenario: An invited person with no account yet

- **WHEN** dana, invited but never signed in, requests a link on `/he/login`
- **THEN** she receives an email whose link signs her in

#### Scenario: An address that is not invited

- **WHEN** someone requests a link for `stranger@example.com`, which has no account, no invite and no allowlist entry
- **THEN** the page shows the "not invited" message, no email is sent, and afterwards no account exists for that address

#### Scenario: Asking again too soon

- **WHEN** Eran requests a second link 20 seconds after the first
- **THEN** no email is sent, and the page says in Hebrew that a link was already sent and he can ask again in under a minute

#### Scenario: Too many requests from one IP address

- **WHEN** an 11th request arrives from the same IP address within one hour
- **THEN** no email is sent, and the page says in Hebrew to try again later

#### Scenario: Resend rejects the email

- **WHEN** the address may sign in and Resend rejects the send
- **THEN** the page says in Hebrew that the email was not sent and to try again

#### Scenario: Supabase is unreachable

- **WHEN** a link is requested while Supabase is unreachable
- **THEN** within 15 seconds the page says in Hebrew that sending failed, and no email is sent

#### Scenario: The connection drops mid-submit

- **WHEN** the connection drops before the server answers
- **THEN** within 15 seconds the form shows a Hebrew error, and the typed address stays in the field

#### Scenario: The address field is empty

- **WHEN** the send button is pressed with the address field empty
- **THEN** nothing is sent, and the form asks for an address

### Requirement: A link from a CRM email signs in on any device after one press

A link from a CRM email SHALL open `/{locale}/auth/confirm` at the CRM's public address. The page SHALL show one `כניסה` button. Sign-in SHALL happen only when that button is pressed, so a mail scanner that opens the link does not use it up.

The press SHALL sign the person in within 5 seconds, in whichever browser and device opened the link, and then open the CRM.

A link that was already used, has expired, or is malformed:
- SHALL show a Hebrew message and a way to request a new link;
- SHALL NOT sign anyone in.

Every response from the confirm page SHALL carry `noindex` and `Referrer-Policy: no-referrer`.

#### Scenario: Opened on another device

- **WHEN** dana opens on her phone a link she requested on her laptop
- **THEN** after she presses `כניסה` she is signed in on the phone and sees the CRM

#### Scenario: A mail scanner opened the link first

- **WHEN** a mail scanner fetches the link before dana opens it
- **THEN** dana's press on `כניסה` still signs her in

#### Scenario: A used link

- **WHEN** dana presses `כניסה` on a link she already signed in with
- **THEN** the page says in Hebrew that the link was already used or has expired, links to the sign-in page, and does not sign her in

#### Scenario: A malformed link

- **WHEN** the confirm page is opened with a missing or malformed code
- **THEN** it shows the same Hebrew message, with no `כניסה` button

#### Scenario: Supabase is unreachable at the press

- **WHEN** dana presses `כניסה` while Supabase is unreachable
- **THEN** within 15 seconds the page says in Hebrew that the sign-in failed and to try again, and the button can be pressed again

#### Scenario: The confirm page is not indexed

- **WHEN** a crawler requests the confirm page
- **THEN** the response carries `noindex` and `Referrer-Policy: no-referrer`

#### Scenario: The Hebrew confirm page

- **WHEN** the confirm page renders at `/he/auth/confirm`
- **THEN** its title, text and button read right to left, and the Latin name `HELIX` inside the Hebrew text keeps its place

#### Scenario: The confirm page at 390px

- **WHEN** the confirm page renders at 390px wide
- **THEN** the button is fully visible without horizontal scrolling and at least 44px tall

### Requirement: A first sign-in lands in the CRM, in the workspace that invited them

A person signing in for the first time with a pending invite SHALL land on the CRM home of the workspace that invited them, holding the invite's role. This SHALL hold whether they came through an email link or through Google. They SHALL NOT be sent to the STAGE onboarding.

#### Scenario: From the invite email

- **WHEN** dana presses `כניסה` on the page her invite email opened
- **THEN** she lands on `/he/dashboard/crm` in Eran's workspace as `member`, and her invite leaves Eran's pending list

#### Scenario: From Google

- **WHEN** dana, invited at her Gmail address, signs in with Google for the first time
- **THEN** she lands on `/he/dashboard/crm` in Eran's workspace, not on `/he/onboarding`

### Requirement: Signing in and out returns to the CRM's public address

Every redirect after a sign-in, a failed sign-in or a sign-out SHALL point at the address the person used, `https://crm.helix.co.il` in production, and never at the server's internal address.

#### Scenario: A failed return from Google or an old email link

- **WHEN** `https://crm.helix.co.il/auth/callback?code=bogus&next=/he` is requested
- **THEN** the response is a redirect whose `Location` starts with `https://crm.helix.co.il/he/login?error=`

#### Scenario: A successful Google sign-in

- **WHEN** Eran completes a Google sign-in
- **THEN** he lands on a page under `https://crm.helix.co.il/he`

#### Scenario: Signing out

- **WHEN** a signed-in person signs out
- **THEN** they land on `https://crm.helix.co.il/he/login`
