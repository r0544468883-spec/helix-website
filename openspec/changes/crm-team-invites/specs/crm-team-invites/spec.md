## Purpose

Lets a workspace admin bring people onto the team: an invite email that the CRM sends and can send again, and a Team screen that shows what happened to each invite.

## ADDED Requirements

### Requirement: An invite sends an email from the CRM and reports the outcome

When an admin invites an address, the CRM SHALL save the invite and send the address an email through Resend from an `@helix.co.il` address, within 10 seconds of the press. The Team screen SHALL say whether that email was sent.

When the send fails:
- the invite SHALL stay saved;
- a Hebrew message under the form SHALL say the invite was saved but the email was not sent, with the reason;
- the invite SHALL show `לא נשלחה`.

An invite SHALL be refused, with nothing saved or sent, when:
- the address is empty;
- the address fails the email format check;
- the address belongs to a current member of this workspace.

Inviting an address that already has a pending invite in this workspace SHALL update that invite's role and send again, within the sending limits. It SHALL NOT create a second invite.

#### Scenario: An invite is sent

- **WHEN** Eran invites `dana@example.com` as `member`
- **THEN** within 10 seconds the pending list shows `dana@example.com` with `נשלחה` and the current day and time, and dana receives an email from an `@helix.co.il` address

#### Scenario: Resend rejects the email

- **WHEN** Eran invites an address and Resend rejects the send
- **THEN** the pending list shows the address with `לא נשלחה` and Resend's reason, and a Hebrew message under the form says the invite was saved but the email was not sent

#### Scenario: Supabase is unreachable

- **WHEN** Eran invites an address while Supabase is unreachable
- **THEN** within 15 seconds a Hebrew message says the invite was not saved, the address and role stay in the form, and no email is sent

#### Scenario: The connection drops mid-submit

- **WHEN** the connection drops before the invite action answers
- **THEN** within 15 seconds the form shows a Hebrew message that the invite may not have gone out and to check the pending list, and the address and role stay in the form

#### Scenario: The address field is empty

- **WHEN** Eran presses the invite button with the address field empty
- **THEN** nothing is saved or sent, and the form asks for an address in Hebrew

#### Scenario: A malformed address

- **WHEN** Eran invites `dana@example`
- **THEN** nothing is saved or sent, and the form says in Hebrew that the address is not valid

#### Scenario: The address is already on the team

- **WHEN** Eran invites the address of someone who is already a member of this workspace
- **THEN** nothing is saved or sent, and the form says in Hebrew that this address is already on the team

#### Scenario: Inviting a pending address again

- **WHEN** Eran invites `dana@example.com` as `viewer` while her invite as `member` is pending
- **THEN** the pending list still has one row for her, now `צפייה בלבד`, and a new email is sent

#### Scenario: The invite button pressed twice

- **WHEN** Eran presses the invite button twice within one second for the same address
- **THEN** exactly one pending invite exists for that address and at most one email is sent

### Requirement: An admin can send an invite again

Every pending invite, including an expired one, SHALL offer `שליחה שוב` to an admin. Pressing it SHALL:
- send a new email with a new link;
- set the invite to expire 30 days from that moment;
- update the invite's state on the Team screen.

The CRM SHALL send one address at most one email per 60 seconds and at most five per hour, counting invites and sign-in links together. A send refused by these limits SHALL say in Hebrew when it can be tried again, and SHALL NOT send anything or change the invite.

Only an admin SHALL see `שליחה שוב` and the cancel control. A resend requested from any other role's session SHALL be refused with a Hebrew message, and nothing sent.

#### Scenario: Sending again

- **WHEN** Eran presses `שליחה שוב` on dana's pending invite
- **THEN** within 10 seconds dana receives a new email, the invite shows `נשלחה` with the new time, and its expiry is 30 days from that moment

#### Scenario: Too soon after the last email

- **WHEN** Eran presses `שליחה שוב` 20 seconds after the last email to the same address
- **THEN** no email is sent, the invite is unchanged, and a Hebrew message says it can be sent again in under a minute

#### Scenario: The hourly limit

- **WHEN** Eran presses `שליחה שוב` for a sixth email to the same address within one hour
- **THEN** no email is sent, and a Hebrew message says this address has had five emails in the last hour and to try later

#### Scenario: An expired invite

- **WHEN** the Team screen lists an invite created 31 days ago
- **THEN** it shows `פג תוקף` with its expiry date, and `שליחה שוב` makes it pending for another 30 days and sends a new email

#### Scenario: Resend rejects the second email

- **WHEN** Eran presses `שליחה שוב` and Resend rejects the send
- **THEN** the invite shows `לא נשלחה` and the reason, and `שליחה שוב` stays available

#### Scenario: A member tries to resend

- **WHEN** a `member` opens the Team screen
- **THEN** the pending invites are listed without `שליחה שוב` or cancel controls, and a resend sent from that session is refused with a Hebrew message and sends nothing

### Requirement: The Team screen shows what happened to each invite

For each pending invite, the Team screen SHALL show the address, the role, and exactly one state:
- `נשלחה {day.month hour:minute}`: sent, delivery not known yet;
- `נמסרה`: Resend reports it delivered, opened or clicked;
- `מתעכבת`: Resend reports the delivery is delayed;
- `חזרה`, with a note that the address is probably wrong: Resend reports a bounce;
- `סומנה כספאם`: the recipient marked it as spam;
- `לא נשלחה: {reason}`: the last attempt failed;
- `פג תוקף {day.month}`: the invite expired;
- `הוזמנה {day.month}`: an invite made before this change, never sent by the CRM.

When the screen opens, it SHALL ask Resend about invites whose delivery is not settled yet. It SHALL check each invite at most once a minute, and wait at most 3 seconds in total. If Resend doesn't answer in time, each invite SHALL show its last known state.

`חזרה`, `סומנה כספאם` and `לא נשלחה` SHALL use the danger color. No other state SHALL.

#### Scenario: Delivered

- **WHEN** Eran opens the Team screen after Resend reported dana's email delivered
- **THEN** her invite shows `נמסרה`

#### Scenario: Bounced

- **WHEN** Eran opens the Team screen after the email to `dana@exmaple.com` bounced
- **THEN** the invite shows `חזרה` in the danger color, with a Hebrew note that the address is probably wrong

#### Scenario: Resend's API does not answer

- **WHEN** Eran opens the Team screen while Resend's API does not answer
- **THEN** the screen renders with each invite's last known state, and waiting for Resend adds at most 3 seconds

#### Scenario: An invite from before this change

- **WHEN** the Team screen lists the invite Eran sent on 2026-09-29 through Supabase
- **THEN** it shows `הוזמנה 29.9` and offers `שליחה שוב`

### Requirement: The invite email names who, where and what, in the invite's language

The invite email SHALL be in the language of the screen the admin invited from: Hebrew, right to left, or English, left to right.

It SHALL:
- name the inviter, the workspace and the role;
- have one button that opens the CRM's confirm page at its public address (`https://crm.helix.co.il` in production);
- say that the button signs in once, and that a new one can be requested from the inviter or from the sign-in page;
- include a plain-text version;
- set Reply-To to the inviter's address;
- carry no tracking pixel and no rewritten links.

#### Scenario: A Hebrew invite

- **WHEN** Eran invites from `/he/dashboard/crm/team` into the workspace `HELIX`
- **THEN** the subject and the body are Hebrew and read right to left, the Latin name `HELIX` sits in place without reordering the Hebrew around it, and the button leads to `https://crm.helix.co.il/he/auth/confirm`

#### Scenario: An English invite

- **WHEN** Eran invites from `/en/dashboard/crm/team`
- **THEN** the subject and the body are English, read left to right, and the button leads to `https://crm.helix.co.il/en/auth/confirm`

#### Scenario: Replying to the invite

- **WHEN** dana replies to the invite email
- **THEN** the reply is addressed to Eran's email address

#### Scenario: A long Hebrew workspace name on a phone

- **WHEN** an invite to the workspace `סטודיו לעיצוב פנים ואדריכלות נוף בע״מ` is read in a 390px-wide mail app
- **THEN** the name wraps inside the text column, nothing scrolls sideways, and the button stays whole and at least 44px tall

### Requirement: Removing a member asks first, and cancelling an invite cancels only that invite

Removing a member SHALL ask for confirmation, naming the person, and SHALL take effect only after the admin confirms. Cancelling a pending invite SHALL remove that invite and no other, whatever characters the addresses share.

#### Scenario: Remove asks first

- **WHEN** Eran presses remove on `רונית בן-דוד`
- **THEN** a dialog asks in Hebrew to confirm removing `רונית בן-דוד` from the team, and she stays a member until he confirms

#### Scenario: Removal confirmed

- **WHEN** Eran confirms the removal
- **THEN** within 5 seconds she is no longer listed, and her next CRM page no longer opens this workspace

#### Scenario: Removal fails

- **WHEN** Eran confirms a removal while Supabase is unreachable
- **THEN** within 15 seconds a Hebrew message says the member was not removed, and she is still listed

#### Scenario: Cancelling one of two similar invites

- **WHEN** Eran cancels the invite for `dana_cohen@example.com` while `danaxcohen@example.com` is also pending
- **THEN** only `dana_cohen@example.com` leaves the pending list

### Requirement: The Team screen reads correctly in Hebrew and on a phone

The pending list SHALL render right to left in Hebrew, keep addresses left to right, keep dates and times in their order, and be fully operable at a 390px viewport.

#### Scenario: A mixed-direction invite row

- **WHEN** the pending list shows `dana.cohen@example.com` as `צפייה בלבד` with `נשלחה 29.9 14:05`
- **THEN** the Hebrew labels read right to left, the address reads left to right, and the date and time keep their digit order

#### Scenario: The Team screen at 390px

- **WHEN** the Team screen renders at 390px wide with three members and two pending invites
- **THEN** each invite's address, role, state, `שליחה שוב` and cancel control are visible without horizontal scrolling, and every control is at least 44px on its smaller side
