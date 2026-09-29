There is no migration, so every task can deploy on its own once the build passes. Before every UI task, read `helix-crm/DESIGN.md`, and update it in the same change. Scratch checks live in the session scratchpad and are not committed.

## 1. Rules and the claim

- [x] 1.1 Add the invite rules to `helix-crm/lib/crm-roles.ts` (design decision 3):
  - `canInvite(role)`;
  - `invitableRoles(role)`;
  - `canManageInvite(role, invitedBy, userId)`.

  Verify:
  - a scratch check of the full matrix:
    - `admin` and `agency_admin` invite with every assignable role and manage any invite;
    - `member` invites as `member` or `viewer` only, and manages only invites where `invitedBy` is themselves;
    - `viewer` does neither;
  - tsc exits 0.
  - Done 2026-09-29:
    - `lib/crm-roles.ts` (client-safe) gains `canInvite`, `invitableRoles`, `canManageInvite`, and `offeredInviteRoles` for the form: `OFFERED_ROLES` in order, limited to `invitableRoles`. A member's invite with no recorded sender is not theirs to manage.
    - The scratch check passes 14 of 14: `canInvite` for all four roles, `invitableRoles` and `offeredInviteRoles` for each, and the manage matrix (admin and agency_admin on anyone's, a member on their own and not on another's or an unrecorded one, a viewer never).
    - tsc exits 0.
- [x] 1.2 Add `claimInvite` to `helix-crm/lib/crm-workspace.ts` (design decision 1):
  - by id, it claims only an unexpired invite whose address equals the user's, lowercased;
  - it inserts the membership ignoring a duplicate, deletes the invite, and returns the workspace;
  - `getWorkspace` step 3 (no membership at all) uses the same code.

  Verify:
  - tsc exits 0;
  - reading: a user with no membership still claims their oldest unexpired invite on the first CRM page, exactly as before;
  - the by-id path returns nothing for a mismatched address, an expired invite, or a non-UUID id.
  - Done 2026-09-29:
    - `claimInvite(admin, user, inviteId?)` refuses a non-UUID id before querying. It selects with `eq('email', lowercased)` and `gt('expires_at', now)`, plus `eq('id', …)` when an id is given, or else the oldest by `created_at`, so a mismatched address or an expired invite returns null.
    - It upserts the membership with `ignoreDuplicates` (an existing member keeps their role), deletes the invite, and returns the workspace and the role actually held there.
    - `getWorkspace` step 3 is now `claimInvite(admin, user)`: the same oldest-unexpired rule, for someone with no membership. One difference: a failed membership insert now returns null instead of a workspace the user doesn't belong to.
    - The stale step-4 comment ("create a fresh workspace") now says what happens.
    - tsc exits 0.

## 2. Joining from the invite

- [x] 2.1 Make the invite link carry the invite, and claim it on the press:
  - `sendAccessLink` in `helix-crm/lib/crm-access-link.ts` takes an optional `inviteId`, and appends `&invite={id}` to invite links only. `sendInviteEmail` in `app/crm-actions.ts` passes `inv.id`;
  - `app/[locale]/auth/confirm/page.tsx` and `components/AccessConfirmForm.tsx` carry `invite` as a hidden field, only when it is a UUID;
  - after `verifyOtp`, `confirmAccessLink` in `app/auth-actions.ts` calls `claimInvite`. On success it sets `helix_active_ws` to the invite's workspace and redirects to `/{locale}/dashboard/crm`; otherwise it redirects to `/{locale}/dashboard/crm?invite=unusable`;
  - the CRM home (`app/[locale]/(crm)/dashboard/crm/page.tsx`) shows the Hebrew notice for `invite=unusable`;
  - the strings go in `helix-crm/lib/i18n/{he,en}.ts`.

  Verify:
  - tsc and `npm run build` exit 0;
  - a scratch check that an invite link ends with `&invite=<uuid>` and a sign-in link has no `invite`;
  - on `next start -p 3100`, `/he/auth/confirm?token_hash=<32 hex>&type=invite&invite=<uuid>` renders a hidden `invite` input, and `invite=not-a-uuid` renders none.
  - Done 2026-09-29:
    - The link is built by a new pure `accessLinkUrl` in `lib/crm-access-rules.ts`, used by `sendAccessLink`. It appends `&invite=` only for `kind: 'invite'` with an id. `sendInviteEmail` passes `inv.id`.
    - The confirm page keeps `invite` only when it is a UUID. `AccessConfirmForm` then renders it as a hidden field.
    - After `verifyOtp`, `confirmAccessLink` calls `claimInvite` with the verified user from `verifyOtp`'s own answer:
      - on success it sets `helix_active_ws` (the options are now the shared `ACTIVE_WS_COOKIE_OPTIONS`, also used by `crmSetActiveWorkspace`) and redirects to `/{locale}/dashboard/crm`;
      - otherwise it redirects to `?invite=unusable`.
    - The CRM home shows `crm.inviteUnusable` as a `role=status` notice for that parameter. The no-workspace state gets the same notice in 3.2, where that state is rebuilt.
    - Verified:
      - tsc and `npm run build` exit 0;
      - the scratch check passes 4 of 4: an invite link with the id, a sign-in link without it even when an id is passed, an invite with no id, and encoding;
      - on `next start -p 3100`, a UUID `invite` renders `<input type="hidden" name="invite" value="3f1c…">`, while `invite=not-a-uuid` and a sign-in link render none.

## 3. Creating a workspace

- [x] 3.1 Add `userCtx()` and `crmCreateWorkspace({ locale, name })` to `helix-crm/app/crm-actions.ts` (design decision 2):
  - an empty name, a name over 80 characters and an 11th own workspace are refused;
  - the membership is inserted as `admin`, and the workspace is deleted if that insert fails;
  - it sets `helix_active_ws`.

  The Hebrew and English messages go in `helix-crm/lib/i18n/{he,en}.ts`.

  Verify:
  - tsc exits 0;
  - reading: every refusal carries a `message`, and no path leaves a workspace without an admin membership.
  - Done 2026-09-29:
    - `userCtx()` needs only a signed-in user.
    - `crmCreateWorkspace` trims the name and refuses, each with a Hebrew/English `message`: an empty name, over 80 characters (`CLIENT_NAME_MAX`), the 11th own workspace (counted by `created_by` with no parent, so client workspaces don't count), and any failed read or write. A missing session answers `auth`, which the form turns into the session line.
    - It inserts the workspace and then the `admin` membership. If the membership fails, it deletes the workspace, so none is ever left without its admin.
    - It sets `helix_active_ws` with the shared options and returns the id.
    - tsc exits 0.
- [x] 3.2 Build `helix-crm/components/CrmNewWorkspaceForm.tsx`:
  - a name field of at most 80 characters and a Primary "יצירת workspace";
  - an in-flight guard and `withTimeout`, keeping the name on failure;
  - `router.push` to `/{locale}/dashboard/crm` and a refresh on success.

  Render it on:
  - the new page `app/[locale]/(crm)/dashboard/crm/workspaces/new/page.tsx`, a Card under a back link;
  - the CRM home's no-workspace state, in place of `setupPending`.

  Add "workspace חדש" (`Plus` icon) to `components/CrmNavMenu.tsx` for every role.

  Update `helix-crm/DESIGN.md`:
  - §8: the new-workspace form and the side-menu item;
  - §9: the no-workspace state;
  - §17: the file map;
  - bump `Last updated`.

  Verify:
  - tsc and `npm run build` exit 0, and the build lists `/[locale]/dashboard/crm/workspaces/new`;
  - the field and button are `min-h-[44px]`, and the name renders `dir="auto"`.
  - Done 2026-09-29:
    - `CrmNewWorkspaceForm` has a label, the name input (`dir=auto`, placeholder "למשל: שם העסק") and Primary lg "יצירת workspace" ("יוצרים..." while pending).
      - The name is checked on the client (required, at most 80 code points) and again on the server.
      - An in-flight ref and `withTimeout` guard the press: a timeout says to refresh and check, and `auth` gets the session line. The name stays on failure.
      - On success it goes to `/{locale}/dashboard/crm` and refreshes.
    - The new page `workspaces/new` is a Card under a back link. The CRM home with no workspace now shows "עוד אין לכם workspace", a line and the form, with the `invite=unusable` notice above it when present.
    - The side menu gains "workspace חדש" (`Plus`) for every role, and ⌘K gains the route.
    - DESIGN.md:
      - §8 gains "New workspace form";
      - the side-menu section lists the item;
      - the §17 file map has the component and the route;
      - `Last updated` is already 2026-09-29.
    - tsc and `npm run build` exit 0, and the build lists `/[locale]/dashboard/crm/workspaces/new`. The input and button are `min-h-[44px]`.

## 4. Members invite

- [x] 4.1 Apply the rules in the invite actions in `helix-crm/app/crm-actions.ts`:
  - `crmInviteMember` uses `canInvite` and `invitableRoles`, and refuses a member re-inviting an address whose pending invite someone else sent;
  - `crmResendInvite` and `crmCancelInvite` use `canManageInvite` against the row;
  - each refusal has a Hebrew and English message in `helix-crm/lib/i18n/{he,en}.ts`.

  Verify:
  - tsc exits 0;
  - reading: no invite path still compares `role !== 'admin'`, and a member's upsert can never write a role outside `invitableRoles`.
  - Done 2026-09-29:
    - `crmInviteMember`:
      - refuses a viewer with the read-only message, and a role outside `invitableRoles` with "חבר יכול להזמין כחבר או כצפייה בלבד…";
      - before the upsert, reads any pending invite for the address and refuses (`errInvitePendingByOther`) unless `canManageInvite` allows it, so a member can't overwrite another sender's invite.
    - `crmResendInvite` and `crmCancelInvite` refuse a viewer, read the row's `invited_by`, and refuse someone else's invite with `errInviteNotYours`. Cancel now reads before it deletes.
    - `crmSetRole` and `crmRemoveMember` use `isAdminRole`, so `agency_admin` manages the team as DESIGN.md §9 says.
    - The three new messages are in both dictionaries.
    - tsc exits 0. `role !== 'admin'` remains only in the two API-key actions, which are outside this change. The upsert's role is the one that passed `invitableRoles`.
- [x] 4.2 Show the Team screen to members:
  - `app/[locale]/(crm)/dashboard/crm/team/page.tsx` passes `canInvite`, the offered roles, a `canManage` flag per invite (from `invited_by`), and `isAdminRole` for the role select and remove;
  - `components/CrmTeamManager.tsx` renders the form for any role but `viewer`, offers only the passed roles, and shows "שליחה שוב" and "ביטול ההזמנה" only where `canManage`.

  Update `helix-crm/DESIGN.md`: §9 Roles, the Team bullet (who invites and with what, who manages which invite). Bump `Last updated`.

  Verify: tsc and `npm run build` exit 0.
  - Done 2026-09-29:
    - The Team page reads `invited_by`. It gives each invite `canManage` (`canManageInvite`), passes `canInvite`, `inviteRoles` (`offeredInviteRoles`) and `isAdmin` (`isAdminRole`), and runs the delivery lookups for any role that can invite.
    - `CrmTeamManager` renders the form when `canInvite`, with its role select from `inviteRoles`, and shows the row controls where `canManage`. The role select and remove stay behind `isAdmin`.
    - The hint and the admin-only line now say what a member can do. DESIGN.md §8's row names the `manage` rule, and §9's Team bullet has the new who-does-what.
    - tsc and `npm run build` exit 0.

## 5. The switcher

- [x] 5.1 In `helix-crm/components/CrmWorkspaceSwitcher.tsx`, give each row (`WsRow`) a role label (design decision 4): `text-[11px] text-ink-muted`, kept visible while the name truncates. The labels come from the existing `roleAdmin`, `roleMember`, `roleViewer` and `roleAgencyAdmin` strings.

  Update `helix-crm/DESIGN.md`: the switcher row's class string. Bump `Last updated`.

  Verify: tsc and `npm run build` exit 0.
  - Done 2026-09-29:
    - `WsRow` takes the role's words (`roleAdmin`, `roleMember`, `roleViewer` or `roleAgencyAdmin`) and shows them in `text-[11px] text-ink-muted font-normal shrink-0 whitespace-nowrap`, after the name. The name gains `min-w-0`, so it truncates while the role stays whole. The client tag is `shrink-0` too.
    - The component's comment describes several workspaces with a role in each.
    - DESIGN.md's Dropdown / menu block has the switcher row and why the role shows.
    - tsc and `npm run build` exit 0.

## 6. Verification

- [x] 6.1 Run the gates:
  - `cd helix-crm && npx tsc --noEmit && npm run build`, both exiting 0;
  - `openspec validate crm-multi-workspace --strict`, valid. The INFO about the `crm-team-invites` delta is expected until that change is archived.
  - Done 2026-09-29:
    - tsc and `npm run build` exit 0, and `openspec validate crm-multi-workspace --strict` says valid, with the expected INFO.
    - The `(crm)` layout neither calls `getWorkspace` nor redirects, so `/dashboard/crm/workspaces/new` is reachable for someone with no workspace.
- [ ] 6.2 When Eran asks for the deploy, run `firebase deploy --only apphosting:helix-crm` from the repo root. Then walk it on https://crm.helix.co.il with Eran, using a second address he controls or his friend's:
  - "workspace חדש" creates a second workspace. Eran lands in it as admin, and the switcher shows both, each with `מנהל`;
  - from the new workspace, he invites the second address as `חבר`. Pressing "כניסה" in that email lands in the new workspace, and the second account's own workspaces stay in its switcher;
  - signed in as that member, the Team screen offers only `חבר` and `צפייה בלבד`, and "שליחה שוב" appears only on invites the member sent;
  - ⌘K in one workspace finds no contact that exists only in the other;
  - `https://crm.helix.co.il/he/dashboard/crm?invite=unusable` shows the notice.

  List every scenario in `specs/crm-workspaces/spec.md` and `specs/crm-team-invites/spec.md` that could not be verified, with the reason.
- [ ] 6.3 Before archiving this change, archive `crm-team-invites`. Then verify that `openspec validate crm-multi-workspace --strict` no longer reports the missing target spec.
