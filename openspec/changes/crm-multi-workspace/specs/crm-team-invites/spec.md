## MODIFIED Requirements

### Requirement: An invite sends an email from the CRM and reports the outcome

When an admin or a member invites an address, the CRM SHALL save the invite and send the address an email through Resend from an `@helix.co.il` address, within 10 seconds of the press. The Team screen SHALL say whether that email was sent.

Who may invite, and with which role:
- an `admin` or `agency_admin` may invite with any role;
- a `member` SHALL be offered only `חבר` and `צפייה בלבד`, and an invite with any other role from a member's session SHALL be refused with a Hebrew message, with nothing saved or sent;
- a `viewer` SHALL NOT be offered the invite form, and an invite from a viewer's session SHALL be refused with a Hebrew message, with nothing saved or sent.

When the send fails:
- the invite SHALL stay saved;
- a Hebrew message under the form SHALL say the invite was saved but the email was not sent, with the reason;
- the invite SHALL show `לא נשלחה`.

An invite SHALL be refused, with nothing saved or sent, when:
- the address is empty;
- the address fails the email format check;
- the address belongs to a current member of this workspace.

Inviting an address that already has a pending invite in this workspace SHALL update that invite's role and send again, within the sending limits. It SHALL NOT create a second invite. A member SHALL be able to do this only for an invite they sent. A member inviting an address whose pending invite someone else sent SHALL be refused with a Hebrew message, and that invite SHALL be left as it is.

#### Scenario: An invite is sent

- **WHEN** Eran invites `dana@example.com` as `member`
- **THEN** within 10 seconds the pending list shows `dana@example.com` with `נשלחה` and the current day and time, and dana receives an email from an `@helix.co.il` address

#### Scenario: A member invites

- **WHEN** Dana, a `member` of Eran's workspace, invites `yossi@example.com` as `צפייה בלבד`
- **THEN** within 10 seconds the pending list shows `yossi@example.com` as `צפייה בלבד` with `נשלחה`, and yossi receives an email naming Dana as the inviter

#### Scenario: A member tries to invite an admin

- **WHEN** an invite with the role `admin` is sent from a `member`'s session
- **THEN** nothing is saved or sent, and a Hebrew message says a member can invite as `חבר` or `צפייה בלבד` only

#### Scenario: A viewer tries to invite

- **WHEN** an invite is sent from a `viewer`'s session
- **THEN** nothing is saved or sent, and a Hebrew message says the action needs the member or admin role

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

#### Scenario: A member re-invites an address someone else invited

- **WHEN** Dana, a `member`, invites `yossi@example.com` while Eran's invite to it as `admin` is pending
- **THEN** nothing is sent, Eran's invite keeps its role and state, and a Hebrew message says the address already has a pending invite that an admin can send again

#### Scenario: The invite button pressed twice

- **WHEN** Eran presses the invite button twice within one second for the same address
- **THEN** exactly one pending invite exists for that address and at most one email is sent

### Requirement: An admin can send an invite again

Every pending invite, including an expired one, SHALL offer `שליחה שוב` to an admin, and to the member who sent it. Pressing it SHALL:
- send a new email with a new link;
- set the invite to expire 30 days from that moment;
- update the invite's state on the Team screen.

The CRM SHALL send one address at most one email per 60 seconds and at most five per hour, counting invites and sign-in links together. A send refused by these limits SHALL say in Hebrew when it can be tried again, and SHALL NOT send anything or change the invite.

Only an admin, or the member who sent the invite, SHALL see `שליחה שוב` and the cancel control for it. A resend or a cancel of someone else's invite, requested from a member's session, SHALL be refused with a Hebrew message, with nothing sent or changed. A viewer SHALL see neither control, and SHALL be refused the same way.

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

#### Scenario: A member sees controls on her own invites only

- **WHEN** Dana, a `member`, opens the Team screen with one invite she sent and one Eran sent
- **THEN** her invite shows `שליחה שוב` and `ביטול ההזמנה`, Eran's shows neither, and a resend of Eran's invite from her session is refused with a Hebrew message and sends nothing

#### Scenario: A viewer sees no invite controls

- **WHEN** a `viewer` opens the Team screen
- **THEN** the pending invites are listed without `שליחה שוב` or cancel controls, and no invite form is shown
