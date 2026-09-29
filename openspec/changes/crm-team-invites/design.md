## Context

See proposal.md (Why) for what broke. The constraints that shape the approach:

**Accounts are invite-only in the database.** Since v18, `public.handle_new_user` rejects a new `auth.users` row unless the address has a `crm_invites` row or an `auth_allowlist` row. It does not check `expires_at`. An invite is claimed in `getWorkspace` (`lib/crm-workspace.ts`) on the first CRM page after sign-in, and only when the user has no membership yet. The claim is an exact, lowercase match, and the invite must not be expired.

**Today's email paths:**
- `crmInviteMember` calls `inviteUserByEmail` and ignores its error.
- The sign-in form (`components/MagicLinkForm.tsx`) calls `signInWithOtp` from the browser with `shouldCreateUser: false`. That is PKCE, so its link works only in the browser that asked for it.
- `/auth/callback` reads only `?code=`. Supabase's invite link puts the session after `#`, which the server never receives.

**Origin:** on App Hosting, `new URL(request.url).origin` is `https://0.0.0.0:8080`. Commit `9b0d986` (`lib/public-origin.ts`, on `feat/lead-notifications` only) fixes `/auth/callback` and `/auth/signout`. `git show 9b0d986 | git apply --check` is clean on this branch.

**Layout:** there is no `app/layout.tsx`. A page needs to live under `app/[locale]/`. The middleware passes root `/auth/*` through without a locale, and it guards only `/dashboard`, `/chief`, `/onboarding`, `/submit` and `/profile/edit`. `/login` and `/onboarding` sit in the `(stage)` group (DESIGN.md §15 row 8). The public quote page `app/[locale]/q/[token]` is the precedent for a page outside both groups.

**Resend:**
- `RESEND_API_KEY` is the same Secret Manager secret the website uses, so it is the account where `helix.co.il` is verified.
- The CRM's `RESEND_FROM` is unset. Its code default is Resend's test sender, which only reaches the account owner, so campaigns can't reach anyone else today.
- SDK 6.12: `emails.send` takes `replyTo` and returns `{ data: { id }, error }`, never throwing. `emails.get(id)` returns `last_event`, one of `queued`, `scheduled`, `sent`, `delivered`, `delivery_delayed`, `opened`, `clicked`, `bounced`, `complained`, `failed`, `canceled` or `suppressed`. The API allows 2 requests a second per account.

**Supabase:** supabase-js 2.47 and @supabase/ssr 0.6.1. `auth.admin.generateLink({ type, email })` creates the one-time token and sends nothing. It returns `properties.hashed_token` and `properties.verification_type`. `auth.verifyOtp({ token_hash, type })` exchanges them for a session.

## Goals / Non-Goals

**Goals:**
- One path makes and sends every CRM auth email, invite or sign-in, and reports the outcome truthfully.
- An emailed link signs in on any device, and survives a mail scanner opening it first.
- The Team screen shows what happened to an invite without anyone opening the Resend dashboard.

**Non-Goals:**
- Replacing Google sign-in or `/auth/callback`. Google keeps PKCE through the callback, which only gets the origin fix and loses the onboarding redirect.
- Resend webhooks, a delivery cron, or any Supabase dashboard change.
- Letting one person hold memberships in two workspaces (proposal Non-goals).

## Decisions

### 1. Supabase makes the link; Resend sends the email

`lib/crm-access-link.ts` (`import 'server-only'`) is the only place an auth email is made. It works in these steps:
1. Check the limits (decision 5).
2. Pick the link type (decision 2), then call `generateLink`.
3. Build `https://{public origin}/{locale}/auth/confirm?token_hash={hashed_token}&type={verification_type}`.
4. Render the email (decision 8) and send it through Resend. Every attempt is logged, including one that fails.
5. Return one of:
   - `{ ok: true, emailId }`;
   - `{ error: 'not_invited' | 'too_soon' | 'hourly_limit' | 'ip_limit' | 'send_failed' | 'link_failed', retryInSeconds?, reason? }`.

**Rejected:**
- **`inviteUserByEmail` and `signInWithOtp`, Supabase's own mailer.** It gives no delivery id and its templates are English. The invite link lands after `#`, which our server never sees. That is the path that failed.
- **Supabase custom SMTP through Resend.** The templates would live in the dashboard, not in git. There would still be no delivery id. It would need a Resend key pasted into Supabase by Eran. The landing problem would remain, and so would PKCE's same-browser rule for sign-in links.

### 2. The link type follows the account's state, read from the database

v22 adds `public.crm_account_state(p_email text) returns text`. It is `security definer`, with `search_path` pinned to `''`. Only `service_role` may execute it. It returns:
- `none`: no `auth.users` row for the lowercased address;
- `invited`: a row exists with `email_confirmed_at` null (an old Supabase invite that was never used);
- `active`: a confirmed account.

What each state does:

| State | What happens |
|---|---|
| `none` | Send an `invite` link, only when the address has an unexpired invite or an allowlist entry. Otherwise `not_invited`, with no Supabase auth call, so no account is ever attempted for a stranger. The `invite` link creates the account, and the trigger agrees because the invite row exists. |
| `invited` | Send an `invite` link. If Supabase refuses a second invite for that account, fall back to a `magiclink`. The state decides this, not the error text. |
| `active` | Send a `magiclink` link. |

The link always carries the `verification_type` Supabase returns, never our guess.

**Rejected:**
- **Trying `generateLink` and parsing GoTrue's error text.** The strings are unversioned.
- **Looking up `profiles.email`.** It is nullable for pre-v18 users.
- **`auth.admin.listUsers`.** It has no email filter, so it would page through every user.

### 3. The link opens a page, and the press signs in

`app/[locale]/auth/confirm/page.tsx` sits outside both route groups, like the quote page. It gets the document shell only, with no nav and no ⌘K.

The page:
1. Validates `token_hash` against `^[A-Za-z0-9_-]{16,128}$` and `type` against `invite`, `magiclink`, `signup` or `email`.
2. If both are valid, renders one filled "כניסה" button in a `<form>` bound to the server action `confirmAccessLink`. Otherwise it renders the "already used or expired" state with a link to `/{locale}/login`.

The action:
1. Calls `supabase.auth.verifyOtp({ token_hash, type })` through the SSR server client, so the session cookies are written in the action's response.
2. On success, calls `redirect(`/${locale}/dashboard/crm`)`. That navigation happens in the client router, so no origin is computed on the server.
3. On failure, returns a code the page maps to Hebrew. Expired or already used (`otp_expired`, or a 4xx) gets the used-or-expired message; a network failure or 5xx gets "try again".

**Rejected:**
- **A `GET` route handler that verifies on open.** That is the Supabase SSR example. Scanners such as Outlook Safe Links fetch the URL and would use up the one-time token before the person clicks.
- **Reading the `#` part in the browser.** It needs the implicit flow and puts the tokens in page JavaScript.
- **Reusing `/auth/callback`.** A `?code=` exchange needs the PKCE verifier cookie from the browser that asked, which is the same-browser problem.

### 4. The unauthenticated actions get their own file, with limits and nothing else

`app/auth-actions.ts` (`'use server'`) exports exactly two actions:
- `requestSignInLink({ email, locale })`;
- `confirmAccessLink({ token_hash, type, locale })`.

Every export of a `'use server'` file is a public endpoint, so the link-and-send logic is not exported there. It lives in the server-only module from decision 1.

`requestSignInLink`:
1. Validates the address, capped at 254 characters.
2. Reads the IP from the first `x-forwarded-for` entry.
3. Calls the module with `kind: 'sign_in'`.
4. Maps the result to Hebrew with the page's dictionary.

It never says whether an address has an account beyond today's "not invited" message.

### 5. Limits are counted in a table, across invites and sign-ins

v22 adds `crm_auth_link_sends`, with RLS on and no policies:

| Column | Type |
|---|---|
| `id` | bigint identity |
| `email` | lowercased text |
| `kind` | `invite` or `sign_in` |
| `ip` | text, null for invites |
| `workspace_id` | null for sign-ins |
| `created_at` | timestamptz |

It is indexed on `(email, created_at desc)` and `(ip, created_at desc)`.

Before a send, one query reads the address's rows from the last hour, and one reads the IP's. The rules:
- **Per address:** refuse when the newest row is under 60 seconds old (`too_soon`, with `retryInSeconds`) or when there are 5 rows (`hourly_limit`).
- **Per IP, sign-in only:** refuse at 10 rows in the hour (`ip_limit`).

Every attempt that passes the check is logged, even one Resend rejects. Rows older than two days are deleted by the same insert path.

Check-then-insert can race, which allows at most one extra email. That is accepted.

**Rejected:**
- **In-memory counters.** App Hosting runs several instances.
- **Advisory locks.** Too much for this volume.
- **Supabase's email rate limit.** It doesn't apply: `generateLink` sends nothing.

### 6. Delivery state is looked up when the Team screen opens

v22 adds these `crm_invites` columns:
- `locale`: `he` or `en`, default `he`;
- `last_attempt_at` and `last_sent_at`;
- `send_count`, default 0;
- `last_error`;
- `email_id`: Resend's id;
- `delivery`: the last known `last_event`;
- `delivery_checked_at`.

The Team page's server render, for an admin only, picks up to 3 invites that match all of these:
- `email_id` is set;
- `delivery` is not settled;
- the last check was over 60 seconds ago.

It takes the oldest check first, calls `emails.get` one invite at a time, and stops when 3 seconds have passed or on a 429. It writes back `delivery` and `delivery_checked_at`.

Settled states: `delivered`, `opened`, `clicked`, `bounced`, `suppressed`, `complained`, `failed`, `canceled`.

What each state shows (spec: The Team screen shows what happened to each invite):

| Resend `last_event` | Shown |
|---|---|
| `queued`, `scheduled`, `sent` | `נשלחה {d.m HH:mm}` |
| `delivered`, `opened`, `clicked` | `נמסרה` |
| `delivery_delayed` | `מתעכבת` |
| `bounced`, `suppressed` | `חזרה` + "כנראה שהכתובת שגויה" |
| `complained` | `סומנה כספאם` |
| `failed`, `canceled`, or a set `last_error` | `לא נשלחה: {reason}` |
| no `email_id`, no `last_error` (made before v22) | `הוזמנה {d.m}` |

`פג תוקף {d.m}` wins over all of these once `expires_at` has passed.

**Rejected:**
- **Resend webhooks.** They need a public route, a signing secret and dashboard setup. They are the right upgrade if volume grows.
- **A cron.** Cloud Scheduler has never been wired for this backend.

### 7. A sender of its own, so campaigns don't switch on

The new variable `RESEND_AUTH_FROM` is set in `apphosting.yaml` to `HELIX CRM <crm@helix.co.il>`, which is also the code default. An invite sets `replyTo` to the inviter's address. A sign-in email has no reply-to.

**Rejected:** setting `RESEND_FROM`. Campaigns read it, and they would start reaching real recipients as a side effect.

### 8. The email is built in code, in Hebrew and English

`lib/auth-emails.ts` returns `{ subject, html, text }` for `invite` and `sign_in`, in `he` and `en`. The HTML:
- a light, single-column table layout, `max-width:560px`, with inline styles only;
- `dir` and `lang` on the wrapper;
- the text logo `HELIX` followed by an emerald `.`;
- one table-cell "bulletproof" button, at least 44px tall;
- no images, no tracking pixel, and no link rewriting, which is unlike `lib/email.ts`'s campaign wrapper.

The workspace name and the inviter's name are user input, so every interpolated value goes through `escapeHtml`. The copy follows `docs/VOICE.md`: direct Hebrew, and no duration promised for the link (decision 12).

### 9. The invite actions

**`crmInviteMember` (admin):**
1. Validates the input.
2. Refuses a current member of this workspace, matched by `crm_members` joined to `profiles` on the lowercased address.
3. Upserts the invite on `(workspace_id, email)` with `role`, `invited_by`, `locale` and `expires_at = now() + 30 days`.
4. Sends with `kind: 'invite'`.
5. Records the attempt on the row.

It returns one of:
- `{ ok: true, sent: true }`;
- `{ ok: true, sent: false, message }`;
- a refusal with a Hebrew `message`.

The row is written before the link because the trigger needs it for a new account.

**`crmResendInvite({ id })` (admin):**
1. Loads the invite within the workspace.
2. Sets `expires_at` 30 days out, only when the limits let the send go ahead.
3. Sends and records.

**`crmCancelInvite({ id })`:** deletes by id and workspace. `crmRemoveMember` loses its email branch. That branch used `ilike`, where `_` is a wildcard.

**The client side:**
- All three actions go through the existing `withTimeout` of 15 seconds.
- There is an in-flight guard, and a result line under the form.
- The member removal confirmation is a `lib/motion/Dialog`.

### 10. A first sign-in goes to the CRM

`confirmAccessLink` always lands on `/{locale}/dashboard/crm`, where `getWorkspace` claims the invite. `/auth/callback` keeps `next` but drops the `onboarding_completed` redirect.

Since v18 every new account is an invitee. The STAGE onboarding asks "consumer or maker", which applies to none of them. The onboarding page stays reachable at its URL.

### 11. The origin fix comes in as it is

Cherry-pick `9b0d986`. Nothing else in the diff changes: `lib/public-origin.ts`, and its use in the callback and sign-out.

The confirm page's links are built from the same helper. It gets a small `publicOriginFromHeaders(h: Headers)` sibling for server actions, which is the same logic without a `Request`.

The invite email's origin comes from the admin's request and passes through the helper's allowlist. A link made on `localhost` opens on `localhost`, and a link made on crm.helix.co.il opens there.

### 12. What the copy does not promise

A link's lifetime is Supabase's project setting "Email OTP Expiration", which this change doesn't set. So neither the emails nor the screens state a duration. They say the link signs in once, and how to get a new one.

## Risks / Trade-offs

- [The email lands in spam; `נמסרה` only means the receiving server accepted it] → The email is plain and personal, from a verified domain, with no tracking. The Team screen's hint says to check spam when an invite shows `נמסרה`.
- [Resend quotas are shared with the website's lead forms] → Auth mail is a handful a day, and lookups are capped at 3 per screen open.
- [An `invite` link creates the account before the email goes out, so a failed send leaves an unconfirmed account] → It can't sign in without a link. The next send finds state `invited` and makes a fresh invite link.
- [Old Supabase links in someone's inbox] → An old PKCE sign-in link still lands on `/auth/callback` and, with the origin fix, works in the browser that asked for it. An old invite link still fails, because the session sits after `#`. The fix is `שליחה שוב` or the sign-in page.
- ["Not invited" lets someone probe which addresses may sign in] → That was already true. The IP limit caps probing at 10 an hour per address.
- [Opening someone else's link replaces the current session] → By design. The link's holder is the person it was sent to.
- [HTML injection through a workspace or inviter name] → `escapeHtml` on every interpolated value, and a scratch check that renders `<b>`-bearing names as text.
- [An invite to someone who already belongs to another workspace stays pending forever] → A known limit (proposal Non-goals). It is visible as a pending row, not hidden.

## Migration Plan

1. **Eran applies `helix-crm/supabase/migration-v22-team-invites.sql`** in the Supabase SQL editor, then applies it again. It is additive:
   - new nullable columns, and defaults on `crm_invites`;
   - one table;
   - one function.

   It closes with a self-check: the function exists and only `service_role` can execute it, the table has RLS with zero policies, and the new columns exist.
2. **Deploy the CRM backend only:** `firebase deploy --only apphosting:helix-crm`. The marketing site's static export and its App Hosting backend are untouched.
3. **Walk it in production.** Eran presses `שליחה שוב` on his friend's invite and watches the state move to `נמסרה`. The friend signs in from the email.

**Rollback:** roll back to the previous App Hosting revision. v22 can stay: the old code ignores the new columns, the table and the function.

## Open Questions

- **The project's "Email OTP Expiration" value.** It decides how long a link works. No spec or task depends on it (decision 12).
- **The sender's local part.** `crm@` can be changed through `RESEND_AUTH_FROM` without a code change.
