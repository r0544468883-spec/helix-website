Nothing here is deployable before 1.3: the Team screen and the sign-in path read v22's columns, table and function. Before every UI task, read `helix-crm/DESIGN.md`, and update it in the same change. Scratch checks live in the session scratchpad and are not committed.

## 1. Foundations

- [x] 1.1 Bring in the origin fix, and give server actions the same origin:
  - apply commit `9b0d986` without committing: `git show 9b0d986 | git apply`, from the repo root;
  - add `publicOriginFromHeaders(h: Headers)` to `helix-crm/lib/public-origin.ts`, with the same allowlist and bind-address rules;
  - make `siteOrigin()` in `app/crm-actions.ts`, which the quote link uses, call it.

  Verify:
  - tsc exits 0;
  - `/auth/callback` and `/auth/signout` import `publicOrigin`;
  - a scratch check of `publicOriginFromHeaders`:

    | Headers | Origin |
    |---|---|
    | `x-forwarded-host: crm.helix.co.il` | `https://crm.helix.co.il` |
    | `host: localhost:3100` | `http://localhost:3100` |
    | `host: 0.0.0.0:8080` | `NEXT_PUBLIC_SITE_URL` |
    | `x-forwarded-host: evil.example` | `NEXT_PUBLIC_SITE_URL` |
  - Done 2026-09-29:
    - `git show 9b0d986 | git apply` applied cleanly: `lib/public-origin.ts`, and its use in the callback and sign-out. Nothing is committed.
    - `publicOrigin` and the new `publicOriginFromHeaders` share one `fromHeaders()`. `siteOrigin()` in `crm-actions.ts` now calls it, so the quote link passes the same allowlist.
    - The scratch check passes 9 of 9: the four table rows, a rollout `*.hosted.app` host, a forwarded proto, no headers, the `Request` wrapper on a bind address, and no env with no headers (`''`).
    - tsc exits 0.
- [x] 1.2 Write `helix-crm/supabase/migration-v22-team-invites.sql` (design decisions 2, 5 and 6):
  - `crm_invites` gains `locale` (`he`/`en`, default `he`), `last_attempt_at`, `last_sent_at`, `send_count` (default 0), `last_error`, `email_id`, `delivery` and `delivery_checked_at`;
  - `crm_auth_link_sends` with its two indexes, RLS on and no policy;
  - `public.crm_account_state(p_email text)`, `security definer`, `set search_path = ''`, with execute revoked from `public`, `anon` and `authenticated` and granted to `service_role`;
  - a closing self-check that raises if any piece is missing, if the table has a policy, or if `anon` can execute the function.

  Verify, by reading:
  - every statement reruns safely (`if not exists`, `or replace`, `drop … if exists`);
  - nothing is granted to `anon` or `authenticated`.
  - Done 2026-09-29:
    - Every statement reruns safely: `add column if not exists`, the locale check dropped before it is re-added, `create … if not exists`, `create or replace`, and idempotent revokes and grants.
    - `crm_auth_link_sends` has RLS on, no policy, and `revoke all … from anon, authenticated`.
    - `crm_account_state` is `stable security definer` with `search_path = ''`. Execute is revoked from `public`, `anon` and `authenticated`, and granted to `service_role`. It matches `lower(email)` and prefers a confirmed row.
    - The self-check raises on any of:
      - a missing column;
      - a missing table, RLS off, a policy, or a table privilege for `anon` or `authenticated`;
      - a missing function, `anon` or `authenticated` able to execute it, or `service_role` unable to.
- [x] 1.3 (Eran, in the Supabase SQL editor of project `rymrafskckljgirrejqu`) Apply v22, then apply it a second time.

  Verify:
  - both runs finish with no error;
  - `select public.crm_account_state('<your address>')` returns `active`.
  - Done 2026-09-29: Eran reports the migration ran successfully. Its closing self-check raises on any missing piece, so a clean run means the columns, the locked table and the function are in. The two checks above were not run from here, because production reads are blocked for Claude. 5.2 exercises all three through the app.
- [x] 1.4 Add `RESEND_AUTH_FROM` to `helix-crm/apphosting.yaml` as `HELIX CRM <crm@helix.co.il>`, available at `RUNTIME`, with a comment saying why it is not `RESEND_FROM` (design decision 7).

  Verify:
  - `grep -n RESEND_AUTH_FROM helix-crm/apphosting.yaml` shows it;
  - `grep -c '^RESEND_API_KEY=' helix-crm/.env.local` prints `1`. That is a count only; Claude never prints the value. If it prints `0`, Eran adds the key before 5.2.
  - Done 2026-09-29:
    - `RESEND_AUTH_FROM: "HELIX CRM <crm@helix.co.il>"` sits after `RESEND_API_KEY`, with the reason it isn't `RESEND_FROM`. The YAML parses.
    - Corrected 2026-09-29: `.env.local` has a `RESEND_API_KEY=` line with **no value**, and no `SUPABASE_SERVICE_ROLE_KEY` at all. The first count matched the empty line. So a local run can't send (see 5.2).

## 2. Making and sending the link

- [x] 2.1 Write `helix-crm/lib/auth-emails.ts`:
  - `escapeHtml`;
  - `buildAuthEmail({ kind: 'invite' | 'sign_in', locale, link, inviterName?, workspaceName?, roleLabel? })`, returning `{ subject, html, text }` per design decision 8.

  The copy goes in a new `authEmail` block in `helix-crm/lib/i18n/he.ts` and `helix-crm/lib/i18n/en.ts`, in direct Hebrew with no duration promised.

  Verify with a scratch check that renders all four emails (invite and sign-in, Hebrew and English):
  - the Hebrew wrapper has `dir="rtl" lang="he"`, the English one `dir="ltr" lang="en"`;
  - there is no `<img`;
  - the link is the only `href` and appears in the text part;
  - a workspace named `<b>x</b>` comes out escaped;
  - tsc exits 0.
  - Done 2026-09-29:
    - `buildAuthEmail` renders one light, 560px, table-based card. It has the text logo, a heading, a body, a table-cell button (`#10B981` with the dark `#121413` label, as in the app), two notes, the link as text, and a footer.
    - The only `href` is the button's. Names are escaped and flattened to one line, so none can reach the subject header.
    - Every Hebrew paragraph opens with a Hebrew word, and the plain-text lines start with a right-to-left mark.
    - The copy is the new `authEmail` block in both dictionaries.
    - The scratch check passes 33 of 33: direction and language, no `<img`, one `href` equal to the link, the link in the text part, a one-line subject, escaped names, inviter and role named, the RLM, no tracking, and flattened newlines.
    - DESIGN.md §8 gains "Auth emails". tsc exits 0.
- [x] 2.2 Write `helix-crm/lib/crm-access-link.ts` (`import 'server-only'`, never `'use server'`), per design decisions 1, 2 and 5:
  - a pure `decideLimit()` and the two limit queries;
  - the `crm_account_state` call and the type choice;
  - `generateLink`;
  - the link built from `publicOriginFromHeaders`;
  - the Resend send with `replyTo` for invites, checking `{ data, error }`;
  - the log row, with cleanup of rows older than two days;
  - no address in any log line.

  Verify:
  - a scratch check of `decideLimit()`:
    - 59 seconds is refused and 60 is allowed;
    - the 5th send in an hour is allowed and the 6th refused;
    - the 10th request from one IP is allowed and the 11th refused;
  - a scratch check of the type choice:
    - `none` with an invite gives `invite`;
    - `none` with nothing gives `not_invited`, with no Supabase auth call;
    - `invited` gives `invite`;
    - `active` gives `magiclink`;
  - tsc exits 0.
  - Done 2026-09-29:
    - The pure rules live in `lib/crm-access-rules.ts`: `LINK_LIMITS`, `normalizeEmail`, `decideLimit` and `linkTypeFor`. They can be checked without Next, because `'server-only'` only resolves inside Next.
    - `sendAccessLink` (in `lib/crm-access-link.ts`) runs in this order:
      1. reads the limits from the log;
      2. logs the request, so a refused `not_invited` still counts toward the IP limit, and cleans up rows older than two days;
      3. reads `crm_account_state`;
      4. checks joinability (an unexpired invite or the allowlist) only for a sign-in to a non-active account;
      5. calls `generateLink`, only when a link type was chosen;
      6. builds the link from `origin` and the returned `verification_type`;
      7. sends through Resend with `RESEND_AUTH_FROM`, `replyTo` the inviter for invites, and a `kind` tag, checking `{ data, error }` and catching a network throw.
    - It returns `ok` with Resend's id, or a typed error: `too_soon` with seconds, `hourly_limit`, `ip_limit`, `not_invited`, `unavailable`, `link_failed` or `send_failed`, with a reason.
    - The six `console.error` lines carry the kind, the link type and error names and messages, never the recipient's address.
    - The scratch check passes 21 of 21:
      - gap: 59 s refused, 60 s allowed, retry seconds;
      - hourly: the 5th allowed, the 6th refused, the hour window;
      - IP: the 10th allowed, the 11th refused, ignored for invites;
      - the gap wins over the hourly limit;
      - all five link-type cases;
      - address normalisation;
    - tsc exits 0.

## 3. Invites on the Team screen

- [x] 3.1 Rework the invite actions in `helix-crm/app/crm-actions.ts`, per design decision 9:
  - `crmInviteMember` refuses a current member, upserts with `locale` and `expires_at`, sends, and records the attempt on the row;
  - add `crmResendInvite({ locale, id })` and `crmCancelInvite({ locale, id })`;
  - `crmRemoveMember` handles members only.

  The Hebrew and English messages go in `helix-crm/lib/i18n/he.ts` and `en.ts`: already on the team, invite saved but not sent with the reason, too soon, hourly limit, not removed.

  Verify:
  - tsc exits 0;
  - reading: no path reports a sent email after a failed send;
  - `grep -n "ilike" helix-crm/app/crm-actions.ts` finds nothing in the invite code.
  - Done 2026-09-29:
    - `crmInviteMember` validates in this order: empty, format through `normalizeEmail`, role, already on this team (members' profile emails, compared lowercased). It then upserts the invite with `locale` and `expires_at` +30 days, returning the row, and sends through `sendInviteEmail`.
    - It answers `{ ok, sent: true }` with "ההזמנה נשלחה ל-…", or `{ ok, sent: false }` with the too-soon, hourly or "saved but not sent: reason" message.
    - `sendInviteEmail` records the outcome on the row. A send leaves `last_sent_at`, `send_count`+1, `email_id`, `delivery: 'sent'` and a renewed expiry. A failure leaves `last_error` (`unavailable`, `link` or `send: …`) and a renewed expiry. A send the limits refused changes nothing.
    - New actions:
      - `crmResendInvite({ locale, id })`, scoped by id and workspace;
      - `crmCancelInvite({ locale, id })`, deleting by id and workspace.
    - `crmRemoveMember` takes `userId` only, refuses self-removal, and reports a failed delete. Every refusal carries a Hebrew `message`.
    - `inviteUserByEmail` is gone from the code. `lib/crm-invite-state.ts` starts with `inviteErrorCode` and `inviteReasonText`. The pending row's cancel button already calls `crmCancelInvite`.
    - tsc exits 0, and `ilike` count in `crm-actions.ts` is 0.
- [x] 3.2 Write `helix-crm/lib/crm-invite-state.ts`:
  - a pure `inviteState(row, now)`, returning the state key, the Hebrew or English text and whether it is danger, per the design decision 6 table, with expiry taking precedence;
  - `refreshDeliveries(admin, workspaceId)`: at most 3 invites, one at a time, 3 seconds in total, stopping on a 429.

  The Team page's invite query reads the new columns and calls `refreshDeliveries` for an admin.

  Verify:
  - a scratch check of `inviteState` for every `last_event`, an expired row, a failed row and a pre-v22 row;
  - tsc exits 0.
  - Done 2026-09-29:
    - `inviteState(row, now, locale, t)` is pure and client-safe. The precedence is expired, then a failed last attempt, then Resend's event, then `הוזמנה {d.m}` for an invite the CRM never sent. Times are Israeli: `נשלחה 29.9 14:05`, `Sent 29/09 14:05`. Only `חזרה`, `סומנה כספאם` and `לא נשלחה` are danger.
    - `refreshDeliveries` lives in its own server-only `lib/crm-invite-delivery.ts`, not in the state module, so the Resend SDK can't reach a client bundle through it. It looks up at most 3 unsettled invites, least recently checked first and each at most once a minute. It goes one at a time within a 3-second budget, stops on a 429, and never throws.
    - The Team page runs it for an admin, reads the new columns ordered by `created_at`, and passes each invite's state to `CrmTeamManager` (`TeamInvite`).
    - The scratch check passes 21 of 21: every `last_event` (queued, scheduled, sent, delivered, opened, clicked, delivery_delayed, bounced, suppressed, complained, failed, canceled), both failed-attempt reasons, expiry winning, a pre-v22 row, the English format, and the error codes.
    - tsc exits 0.
- [x] 3.3 Rebuild the pending list and the invite form in `helix-crm/components/CrmTeamManager.tsx`:
  - a state line on each pending row, plus "שליחה שוב" and "ביטול ההזמנה";
  - the form's result line: sent, saved but not sent, refused, and the timeout message;
  - an in-flight guard and `withTimeout`;
  - member removal confirmed in a `lib/motion/Dialog`;
  - the new hint text in `helix-crm/lib/i18n/{he,en}.ts`, replacing the STAGE line.

  Update `helix-crm/DESIGN.md`: the Team screen block (pending-invite row class strings, the state colors, the result line, the remove question), and bump `Last updated`.

  Verify:
  - tsc and `npm run build` exit 0;
  - every new control is `min-h-[44px]`;
  - the address spans are `dir="ltr"`.
  - Done 2026-09-29:
    - The invite form:
      - an empty field says "כתבו כתובת מייל." without calling the server;
      - the result line is `role=status` for sent or too soon, and `role=alert` in danger for refused or saved-but-not-sent (`crmInviteMember` now returns `reason` with `sent: false`);
      - a 15-second timeout says to check the pending list, and keeps the address and the role;
      - a saved invite clears the field;
      - the new hint replaces the STAGE line.
    - Pending rows show the server-computed state (danger only for the three failures), with "שליחה שוב" (Secondary) and "ביטול ההזמנה" (quiet) for an admin, and the outcome under the row. When any invite is `נמסרה`, a spam hint shows under the list.
    - Every action runs one at a time (an in-flight ref) through `withTimeout`.
    - Remove opens a `Dialog`: "להסיר את {name} מהצוות?" with the name in `dir=auto`, Danger fill "הסרה מהצוות" and "לא עכשיו". Remove and role failures show under the members list.
    - DESIGN.md:
      - §8 gains "Pending invite row and invite form";
      - §9 Roles' Team bullet points to it and names what only an admin sees;
      - `Last updated` is 2026-09-29.
    - tsc and `npm run build` exit 0, and the build lists `/[locale]/dashboard/crm/team`. 8 `min-h-[44px]` controls, and 3 `dir="ltr"` address spots (the input, the member email, the invite email).

## 4. Sign-in

- [x] 4.1 Move the sign-in email to the server:
  - write `helix-crm/app/auth-actions.ts` (`'use server'`) with exactly `requestSignInLink` and `confirmAccessLink`, per design decisions 3 and 4;
  - `helix-crm/components/MagicLinkForm.tsx` calls `requestSignInLink` through `withTimeout`, with the states sent, not invited, too soon, limit, failed and timeout;
  - the new and changed strings go in `helix-crm/lib/i18n/{he,en}.ts`. `auth.magicSent` drops "open it in the same browser" and says any device works.

  Verify:
  - tsc exits 0;
  - `helix-crm/app/auth-actions.ts` exports two functions;
  - `MagicLinkForm.tsx` no longer imports `@/lib/supabase/client`.
  - Done 2026-09-29:
    - `app/auth-actions.ts` exports exactly two async functions, plus two types:
      - `requestSignInLink` normalises the address, takes the IP from the first `x-forwarded-for` hop (a courtesy limit, as the comment says), calls `sendAccessLink` with `kind: 'sign_in'`, and maps each outcome to the page's words: not invited, too soon with seconds, limit, or send failed;
      - `confirmAccessLink(prev, formData)` is shaped for `useActionState`. It checks the code's shape, calls `verifyOtp` through the SSR client (cookies written in the action), and redirects to `/{locale}/dashboard/crm`. A 4xx is used or expired; anything else is failed.
    - The shape check (`isAccessLinkShape`, `LINK_TYPES`) lives in `lib/crm-access-rules.ts`, so it isn't a third public endpoint.
    - `MagicLinkForm` calls the action through `withTimeout`, with an in-flight guard and the server's message on failure. Its timeout line, the new `auth.magicSent` ("any device") and the other new strings are in both dictionaries. The address stays on failure.
    - tsc exits 0, with 2 exported async functions and no `@/lib/supabase/client` import.
- [x] 4.2 Build the confirm page `helix-crm/app/[locale]/auth/confirm/page.tsx`, outside both route groups, per design decision 3:
  - validation of the code and the type;
  - one "כניסה" button in a form bound to `confirmAccessLink`, with a pending state;
  - the used-or-expired state, linking to `/{locale}/login`;
  - metadata robots `noindex`;
  - in `helix-crm/next.config.mjs`, headers for `/:locale/auth/confirm`: `X-Robots-Tag: noindex, nofollow` and `Referrer-Policy: no-referrer`.

  Update `helix-crm/DESIGN.md`: §9 gets "A page opened from an email link", plus the route tree and the §17 file map. Bump `Last updated`.

  Verify:
  - tsc and `npm run build` exit 0, and the build lists `/[locale]/auth/confirm`;
  - on `next start -p 3100`, `curl -si 'http://localhost:3100/he/auth/confirm?token_hash=x&type=bad'` shows both headers, the Hebrew used-or-expired text, and no button.
  - Done 2026-09-29:
    - The page (outside both groups, `force-dynamic`, metadata robots `noindex, nofollow`) checks the code's shape with `isAccessLinkShape`. A well-formed link renders `AccessConfirmForm`: one Primary "כניסה" in a `useActionState` form with hidden fields, pending "נכנסים...", and a failure line. Anything else renders `AccessLinkUsed`: the used-or-expired line, a hint, and Secondary "לדף הכניסה".
    - `confirmAccessLink` gives Supabase 12 seconds before answering "try again".
    - `next.config.mjs` adds `X-Robots-Tag: noindex, nofollow` and `Referrer-Policy: no-referrer` for `/:locale/auth/confirm`.
    - DESIGN.md §9 gets "A page opened from an email link" and the route-tree row. §17 lists the page, the two components, `auth-actions.ts`, the callback and sign-out, and the six new `lib/` files.
    - Verified:
      - tsc exits 0, and `npm run build` exits 0, listing `/[locale]/auth/confirm`.
      - On `next start -p 3100`:
        - `?token_hash=x&type=bad` answers 200 with both headers and a `noindex, nofollow` robots meta, on `<html lang="he" dir="rtl">`, with the used-or-expired text and 0 submit buttons;
        - a well-formed code shows one "כניסה" button and the text;
        - `/en/auth/confirm` is in English;
        - `/auth/callback?code=bogus` redirects to `http://localhost:3100/he/login?error=same_browser`, not `0.0.0.0`.
      - Supabase answers a made-up code with `403 otp_expired`, which the action maps to "used".
- [x] 4.3 In `helix-crm/app/auth/callback/route.ts`, drop the `onboarding_completed` redirect and keep `next` (design decision 10).

  Verify:
  - tsc exits 0;
  - `grep -n onboarding helix-crm/app/auth/callback/route.ts` finds nothing.
  - Done 2026-09-29:
    - The profile lookup and the `/onboarding` redirect are gone. After the code exchange the callback redirects to `${origin}${next}`: `/he` by default, which redirects to `/he/dashboard/crm`, where `getWorkspace` claims the invite. A Hebrew comment says why.
    - tsc exits 0, and `grep -n onboarding` finds nothing.

## 5. Verification

- [x] 5.1 Run the gates:
  - `cd helix-crm && npx tsc --noEmit && npm run build`, both exiting 0;
  - `openspec validate crm-team-invites --strict`.
  - Done 2026-09-29:
    - tsc and `npm run build` exit 0, and `openspec validate crm-team-invites --strict` says the change is valid.
    - Run again after one hardening: for an `invited` account (an old Supabase invite never used), a refused second `invite` link falls back to `magiclink`. The state decides, not the error text, and design decision 2 says so.
- [ ] 5.2 Walk the change on `http://localhost:3100`, after 1.3, and only with Eran's OK, because it sends real email:
  - request a sign-in link for Eran's own address. It arrives from `crm@helix.co.il`, opens on his phone, and "כניסה" lands in the CRM;
  - request again within 60 seconds and get the too-soon message;
  - open a malformed confirm link;
  - `curl -sI 'http://localhost:3100/auth/callback?code=bogus&next=/he'` has a `Location` starting with `http://localhost:3100/he/login?error=`;
  - on the Team screen at 390×844, the pending list and the remove question.

  List every scenario in `specs/crm-team-invites/spec.md` and `specs/crm-sign-in/spec.md` that could not be verified, with the reason. "Supabase unreachable" and "Resend rejects" are among them unless they can be forced locally.
  - Not run locally, 2026-09-29: `.env.local` has no service-role key and an empty Resend key.
    - Calling the built `requestSignInLink` action on `next start -p 3100` (a `Next-Action` POST) answered "המייל לא נשלח" for every valid address, because `createAdminClient()` returns null without the key. A malformed address got "כתובת המייל לא תקינה".
    - Claude can't fetch those secrets. After Eran's go-ahead ("now you can update"), the same calls run against production in 5.3, which has both secrets.
- [ ] 5.3 When Eran asks for the deploy, run `firebase deploy --only apphosting:helix-crm` from the repo root, after 1.3. Then:
  - `curl -sI 'https://crm.helix.co.il/auth/callback?code=bogus&next=/he'` has a `Location` starting with `https://crm.helix.co.il/he/login?error=`;
  - `curl -sI https://crm.helix.co.il/he/auth/confirm` carries `noindex` and `Referrer-Policy: no-referrer`;
  - Eran presses "שליחה שוב" on his friend's invite at https://crm.helix.co.il/he/dashboard/crm/team. On reopening the screen a minute later it shows `נמסרה` or `חזרה`;
  - the friend signs in from the email, lands on `/he/dashboard/crm` in Eran's workspace, and the invite leaves the pending list.
