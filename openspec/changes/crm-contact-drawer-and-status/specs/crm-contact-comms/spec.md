## Purpose

Reaching a contact from inside the CRM instead of leaving it — a WhatsApp deep link that opens the conversation with the message already written, and a 1:1 email that sends from the verified HELIX sender — with both touches recorded on the contact's timeline so the CRM knows the person was contacted.

## ADDED Requirements

### Requirement: WhatsApp opens with the conversation ready

Where a contact has a usable phone number, the drawer SHALL offer a WhatsApp action that opens WhatsApp addressed to that contact with an optional message already filled in. The CRM SHALL NOT send the message itself; Eran presses send inside WhatsApp.

#### Scenario: Opening WhatsApp for an Israeli mobile number

- **WHEN** Eran uses the WhatsApp action on a contact whose stored phone is `054-123-4567`
- **THEN** WhatsApp opens a conversation addressed to `972541234567` with the drawer's message text pre-filled

#### Scenario: A contact with no phone number

- **WHEN** Eran opens a contact whose phone is empty
- **THEN** the WhatsApp action is not offered, and the drawer states in Hebrew that no phone number is stored

#### Scenario: A phone number that cannot be resolved to a dialable number

- **WHEN** Eran opens a contact whose stored phone is `1-800-HELIX`
- **THEN** the WhatsApp action is not offered and the drawer states in Hebrew that the number cannot be used for WhatsApp, leaving the stored value unchanged

### Requirement: Israeli numbers are normalised to international form

A stored phone number SHALL be converted to digits-only international form before it is used to address WhatsApp. A number beginning with a single `0` SHALL be treated as Israeli and have that `0` replaced with `972`. A number already carrying a country code SHALL keep it. Separators, spaces, parentheses and a leading `+` SHALL be discarded. A number that does not resolve to at least 11 and at most 15 digits SHALL be treated as unusable.

#### Scenario: Local mobile format with separators

- **WHEN** the stored phone is `054-123-4567`
- **THEN** the resolved WhatsApp address is `972541234567`

#### Scenario: Local mobile format without separators

- **WHEN** the stored phone is `0541234567`
- **THEN** the resolved WhatsApp address is `972541234567`

#### Scenario: Already in international form with a plus

- **WHEN** the stored phone is `+972 54-123-4567`
- **THEN** the resolved WhatsApp address is `972541234567`

#### Scenario: An Israeli landline

- **WHEN** the stored phone is `03-1234567`
- **THEN** the resolved WhatsApp address is `97231234567`

#### Scenario: A foreign number keeps its own country code

- **WHEN** the stored phone is `+1 (415) 555-0123`
- **THEN** the resolved WhatsApp address is `14155550123` and no `972` is prepended

#### Scenario: Too few digits to dial

- **WHEN** the stored phone is `1234`
- **THEN** the number is treated as unusable and no WhatsApp address is produced

### Requirement: A WhatsApp touch is recorded

Using the WhatsApp action SHALL write one activity of type `whatsapp` to the contact's timeline and SHALL refresh the contact's last-activity time, so that opening a conversation counts as contact for scoring and follow-up the same way a logged call does. The record SHALL state that WhatsApp was opened, not that a message was delivered.

#### Scenario: The timeline records the outreach

- **WHEN** Eran uses the WhatsApp action on a contact with an empty timeline
- **THEN** the contact's timeline shows one `whatsapp` entry timestamped within the last 5 seconds, and the contact's last-activity time is that moment

#### Scenario: The score reflects the fresh touch

- **WHEN** Eran uses the WhatsApp action on a contact whose previous activity was 60 days ago and whose score was 20
- **THEN** the contact's score rises by the 20 points awarded for activity inside 7 days

#### Scenario: The record does not overstate delivery

- **WHEN** Eran uses the WhatsApp action and then abandons WhatsApp without pressing send
- **THEN** the timeline entry still reads as WhatsApp having been opened and nowhere states that a message was sent, delivered or read

### Requirement: A 1:1 email sends from the verified HELIX sender and lands on the timeline

The drawer SHALL let Eran write and send a single email to the open contact from the verified `helix.co.il` sender. A sent email SHALL write one activity of type `email` to the contact's timeline carrying the subject and body, and SHALL refresh the contact's last-activity time.

#### Scenario: A successful send

- **WHEN** Eran writes a subject and body to a contact with a stored email address and sends
- **THEN** the email is accepted by the delivery provider within 15 seconds, the drawer confirms the send in Hebrew, and the timeline shows one `email` entry containing the subject

#### Scenario: A contact with no email address

- **WHEN** Eran opens a contact whose email is empty
- **THEN** the email action is not offered and the drawer states in Hebrew that no email address is stored

#### Scenario: An empty body is refused

- **WHEN** Eran sends with a subject filled in and the body empty
- **THEN** nothing is sent, the drawer states in Hebrew which field is required, and the typed subject remains in the form

#### Scenario: An empty subject is refused

- **WHEN** Eran sends with a body written and the subject empty
- **THEN** nothing is sent, the drawer states in Hebrew which field is required, and the typed body remains in the form

### Requirement: A failed email is reported and never silently logged

If an email is not accepted for delivery, the CRM SHALL tell Eran in Hebrew, SHALL keep everything he typed, and SHALL NOT write an `email` activity. A timeline that shows an email SHALL mean the provider accepted it.

#### Scenario: The delivery provider rejects the send

- **WHEN** the provider rejects the send because the recipient address is invalid
- **THEN** the drawer states in Hebrew that the email was not sent, the subject and body are still in the form, and no `email` activity is written

#### Scenario: The delivery provider is not configured

- **WHEN** Eran sends from a deployment with no delivery provider key configured
- **THEN** the drawer states in Hebrew that email sending is unavailable, no activity is written, and the WhatsApp action still works

#### Scenario: The network drops mid-send

- **WHEN** the connection is lost after Eran presses send and no response arrives
- **THEN** within 15 seconds the drawer states in Hebrew that the send did not complete, the typed subject and body are still present, and no `email` activity is written

#### Scenario: The session expired before sending

- **WHEN** Eran presses send after his session has expired
- **THEN** the drawer states in Hebrew that the session expired, the typed text is preserved, and no email is sent

### Requirement: The 1:1 path cannot be used as a bulk sender

Sending SHALL be rate limited so that the per-contact email path cannot be turned into a campaign tool, which would put the shared `helix.co.il` sending reputation at risk. A repeated press while a send is in flight SHALL NOT produce a second email, and a workspace SHALL be limited to 20 sends per hour through this path.

#### Scenario: Double-pressing send produces one email

- **WHEN** Eran presses send twice within 300ms
- **THEN** exactly one email is sent and exactly one `email` activity is written

#### Scenario: The hourly cap is reached

- **WHEN** Eran attempts a 21st send from the same workspace inside one hour
- **THEN** the send is refused, the drawer states in Hebrew that the hourly limit was reached and when it resets, and no `email` activity is written

### Requirement: Comms controls work in Hebrew and on a phone

The WhatsApp and email controls SHALL render right-to-left in Hebrew, SHALL keep the contact's email address and phone number reading left-to-right, and SHALL be operable at a 390px viewport.

#### Scenario: A Hebrew message body with Latin fragments

- **WHEN** Eran types `היי דנה, לגבי ההצעה על הפרויקט — שלחתי לך מייל ל dana@nurit.co.il` into the WhatsApp message field
- **THEN** the Hebrew reads right-to-left, the email address inside it reads left-to-right, and the text arrives in WhatsApp in that same order

#### Scenario: Both actions reachable at 390px

- **WHEN** the drawer is open on a 390px-wide viewport
- **THEN** the WhatsApp and email controls are both visible without horizontal scrolling and each is at least 44px on its smaller side

#### Scenario: A long Hebrew subject wraps rather than clips

- **WHEN** Eran types a 90-character Hebrew subject at 390px
- **THEN** the field scrolls or wraps its content, the send control stays visible, and the page does not scroll horizontally
