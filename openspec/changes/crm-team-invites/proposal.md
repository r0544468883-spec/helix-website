## Why

On 2026-09-29 Eran invited a friend to his workspace from the CRM's Team screen. The friend never got the email, and the Team screen gives Eran no way to send it again or to see what happened. The screen said the invite went out. Checking production the same day showed the friend could not have gotten in even if the email had arrived:
- **Errors are hidden.** The invite action ignores Supabase's answer. A failed send, or an address that already has an account, still reports success, and pressing invite again sends nothing.
- **The invite link can't sign anyone in.** Supabase's invite link returns the login after `#` in the address, which never reaches the server. `/auth/callback` only reads `?code=`, so it treats every invite as a failed login.
- **Every sign-in ends at a dead address.** Every redirect from `/auth/callback` goes to `https://0.0.0.0:8080`. Measured live:
  ```
  GET /auth/callback?code=bogus → 307 https://0.0.0.0:8080/he/login?error=same_browser
  ```
  The fix exists as commit `9b0d986`, but only on `feat/lead-notifications`.
- **Emails depend on Supabase's mailer, which the CRM can't see.** Supabase's own English email and the sign-in email both go through it.

Agreed the same day:
- **The CRM sends its own emails through Resend**, from an `@helix.co.il` address, in Hebrew. Supabase only makes the link.
- **The sign-in page's email moves to the same path.**
- **No copyable WhatsApp link in this change.** A copied sign-in link works like a password: with client workspaces, one workspace's admin could use it to enter another's. A safe join page is its own change.
- **The Team screen shows whether an invite was delivered or bounced.**

**Surface: `helix-crm/` only, plus Resend and Supabase Auth.** The change needs:
- a database migration (v22), which Eran applies in the Supabase SQL editor;
- one new sender variable for Resend. The account and the verified `helix.co.il` domain are the ones the website's forms already use.

No Supabase dashboard setting changes, and nothing on the marketing site changes.

## What Changes

- **An invite sends a Hebrew email from the CRM.**
  - The email names who invited the person, the workspace and the role. It has one button, and replies go to the inviter.
  - The Team screen says whether it was sent. When it wasn't, the invite is still saved, and the screen gives the reason.
- **"שליחה שוב" on every pending invite.**
  - Each press sends a fresh link and extends the invite's expiry by 30 days.
  - One address gets at most one email a minute and five an hour, counting invites and sign-in links together.
- **Each pending invite shows its state:** `נשלחה {when}`, `נמסרה`, `חזרה`, `סומנה כספאם`, `לא נשלחה: {reason}` or `פג תוקף`. The delivery states come from Resend.
- **Inviting again behaves predictably.**
  - Inviting someone already on this team is refused, with a Hebrew message.
  - Inviting a pending address again updates its role and sends again.
- **Removing a member asks first.** Cancelling an invite no longer matches addresses by pattern, so it can't delete a similar address.
- **The sign-in page sends its link through the same path.**
  - The link works on any device, so "open it in the same browser" is gone.
  - An address with no invite and no account still gets "not invited".
  - Asking too often gets "we already sent one, try again in a minute".
- **Links from these emails open `/{locale}/auth/confirm`.** It is a page with one "כניסה" button, which signs the person in and opens the CRM. The press is required because some mail scanners open links before a person does, which would use up a one-time link.
- **A first sign-in lands in the CRM,** from an email link or from Google, never in the STAGE onboarding ("איך תרצו להשתמש בבמה?"). Since v18 every new account is a CRM invitee, and the invite is claimed on that first CRM screen.
- **Sign-in returns to crm.helix.co.il.** Commit `9b0d986`'s public-origin helper comes into this branch, so Google sign-in and sign-out stop redirecting to `0.0.0.0:8080`.
- **The hint under the invite form** stops mentioning STAGE and says what now happens.

## Capabilities

### New Capabilities
- `crm-team-invites`:
  - sending an invite and resending it;
  - what the Team screen shows for each pending invite, including delivery;
  - the invite email;
  - refusing an address that's already on the team;
  - removing a member only after a confirmation.
- `crm-sign-in`:
  - the sign-in email and its limits;
  - the confirm page, whose link works on any device and survives mail scanners;
  - where a first sign-in lands;
  - sign-in returning to the public address.

### Modified Capabilities
None. `crm-team-roles` says "the invited address receives the invitation email". That stays true; the email now comes from the CRM.

## Non-goals

- **A WhatsApp or copyable join link.** See Why.
- **One address in two workspaces.** An address that already belongs to one workspace still can't claim an invite to another, because workspace resolution claims an invite only when there is no membership. The invite stays pending. Warning the inviting admin would reveal another workspace's membership, so that belongs to a change that lets one person hold several memberships.
- **Passwords, LinkedIn, and Supabase's other emails** (password recovery, email change), which the CRM doesn't use.
- **The email campaigns' sender.** `RESEND_FROM` stays as it is. Changing it would start delivering campaigns that today can only reach the Resend account owner.
- **Moving `login` and `onboarding` out of the `(stage)` group.** That is DESIGN.md §15 row 8, still Eran's call.
- **Editing a new member's display name.** They show as their address's first part until they change it, as today.

## Impact

**Database (`helix-crm/supabase/migration-v22-team-invites.sql`, applied by Eran):**
- `crm_invites` gains columns for:
  - the email's language;
  - the last send attempt and the last send that succeeded;
  - a send count;
  - the last error;
  - Resend's email id;
  - the last known delivery state and when it was checked.
- A new `crm_auth_link_sends` log backs the per-address and per-IP limits. RLS is on with no policies, so only the service role reads or writes it.

**Server:**
- A server-only module (not a server action) makes the one-time link with Supabase's admin API, sends the email through Resend, and logs the send.
- `app/crm-actions.ts`: the invite action is rewritten to report the send honestly. A resend action and an invite-cancel action are added, and member removal is split from invite cancelling.
- A new actions file holds the two unauthenticated actions: request a sign-in link, and confirm a link.
- `lib/public-origin.ts` comes from `9b0d986`. `/auth/callback` and `/auth/signout` use it, and the callback drops its onboarding redirect.

**Screens:**
- The Team screen: invite states, "שליחה שוב", the remove confirmation.
- The sign-in form now asks the server.
- A new `/{locale}/auth/confirm` page, outside both route groups like the public quote page.

**Config:**
- `helix-crm/apphosting.yaml` gains `RESEND_AUTH_FROM`.
- `next.config.mjs` marks the confirm page `noindex` and `no-referrer`.

**Docs:** `helix-crm/DESIGN.md` (the pending-invite row, the remove confirmation, the confirm page, the auth email) and `lib/i18n/{he,en}.ts`.

**Deploy:** only the CRM's App Hosting backend (`firebase deploy --only apphosting:helix-crm`). The marketing site's static export and its App Hosting backend are untouched.
