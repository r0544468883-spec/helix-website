## Context

See proposal.md (Why) for the request and what blocks it today. The facts the approach rests on, all in `helix-crm/`:

**Memberships**
- `crm_members` has primary key `(workspace_id, user_id)`.
- `public.crm_role(ws)` (v20) returns the caller's role *in that workspace*. Every RLS policy goes through it.

So one account in several workspaces, with a different role in each, already holds in the database. No migration is needed.

**Workspace resolution (`getWorkspace`, `lib/crm-workspace.ts`)**, in order:
1. The active-workspace cookie (`helix_active_ws`, httpOnly), when `accessRole` confirms access.
2. Otherwise the oldest membership.
3. Only with no membership at all, claim the oldest unexpired invite for the address.
4. Otherwise nothing (the `setupPending` notice).

`listAccessibleWorkspaces` returns every membership, plus an agency's client workspaces. The switcher, which appears with two or more, sets the cookie through `crmSetActiveWorkspace`.

**Invites (crm-team-invites, deployed 2026-09-29)**
- `sendAccessLink` builds `/{locale}/auth/confirm?token_hash=…&type=…`.
- The confirm page's press runs `confirmAccessLink`, which calls `verifyOtp` and redirects to `/{locale}/dashboard/crm`.
- `crmInviteMember`, `crmResendInvite` and `crmCancelInvite` require `role === 'admin'`, stricter than DESIGN.md §9, which gives team management to `admin` and `agency_admin`.

**Creating workspaces:** only `crmCreateClientWorkspace`, from an agency admin's Team screen. `ctx()` fails without a workspace, so a person with none can't reach any action.

## Goals / Non-Goals

**Goals:**
- Joining by invite works whatever workspaces the person already has, and only through the email they were sent.
- A person can create a workspace without holding one.
- A member's invite power stays below an admin's.

**Non-Goals:**
- A migration, or any change to RLS or `crm_role`. Isolation between workspaces is untouched and only re-verified.
- Claiming invites nobody clicked (proposal Non-goals).

## Decisions

### 1. The invite link names its invite; the press claims it

`sendAccessLink` appends `&invite={crm_invites.id}` to an invite's link. The confirm page carries it as a hidden field. After `verifyOtp` succeeds, `confirmAccessLink` calls a new `claimInvite(admin, user, inviteId)` in `lib/crm-workspace.ts`. It claims only when all of these hold:
- the id is a UUID;
- the invite exists and hasn't expired;
- its address equals the signed-in user's, lowercased.

When they hold, it:
1. adds the membership with the invite's role, as an insert that ignores a duplicate, so an existing member keeps their role;
2. deletes the invite;
3. sets `helix_active_ws` to the invite's workspace;
4. redirects to `/{locale}/dashboard/crm`.

When any check fails, it joins nothing and redirects to `/{locale}/dashboard/crm?invite=unusable`. The CRM home shows a Hebrew notice (`role="status"`) for that parameter.

The id is not a credential. Sign-in comes from `verifyOtp` alone, and the claim also requires the verified address to match the invite. An edited id can only point at an invite for the same address, or fail.

**Rejected:**
- **Claiming every pending invite on page load.** That joins workspaces nobody said yes to. Eran chose "clicking the invite joins".
- **An accept banner.** Eran chose against it.
- **Claiming by address alone, without the id.** The page wouldn't know which workspace to open when two invites are pending.

`getWorkspace`'s step 3 keeps claiming for someone with no membership at all. That covers a brand-new invitee who signs in with Google. It is refactored onto the same `claimInvite` logic, so the two paths can't drift.

### 2. Creating a workspace needs a user, not a workspace

The new server action `crmCreateWorkspace({ locale, name })` uses a new `userCtx()`, which checks the signed-in user only.

It refuses:
- an empty name, or one over 80 characters (the same `CLIENT_NAME_MAX` as client workspaces);
- an 11th workspace, counting rows in `crm_workspaces` whose `created_by` is the user and whose `parent_workspace_id` is null.

Otherwise it:
1. inserts the workspace (no parent) with the service role;
2. inserts the membership as `admin`, and deletes the new workspace if that insert fails, so no orphan without an admin is left;
3. sets `helix_active_ws` to the new workspace;
4. returns its id.

The form then goes to `/{locale}/dashboard/crm`. A double press is stopped on the client with an in-flight guard. The server doesn't lock: at this volume a second workspace from a race is harmless, and it counts toward the limit.

**Rejected:**
- **A SQL function doing both inserts atomically.** It needs a migration. The compensation delete covers the failure.
- **Creating one automatically at first sign-in.** Eran chose against it.

### 3. Who may invite, resend and cancel

The rules live in `lib/crm-roles.ts`:
- `canInvite(role)`: every role but `viewer`.
- `invitableRoles(role)`: every assignable role for `admin` or `agency_admin`; `member` and `viewer` for a member.
- `canManageInvite(role, invitedBy, userId)`: `isAdminRole(role)`, or a `member` for whom `invitedBy === userId`.

The actions:
- `crmInviteMember` refuses a role outside `invitableRoles`.
- When a member re-invites an address whose pending invite someone else sent, it refuses and leaves the row untouched. The upsert would otherwise overwrite the role and `invited_by`.
- `crmResendInvite` and `crmCancelInvite` check `canManageInvite` against the row.

The Team page passes, for each invite, whether the viewer may manage it. It passes the offered roles to the form, and `isAdminRole` for the role select and remove. Role changes and removal stay admin-level.

The invite email names the member as the inviter, and replies go to the member.

### 4. The switcher row shows the role

`AccessibleWorkspace.role` already exists. `WsRow` adds a `text-[11px] text-ink-muted` label from the role:

| Role | Label |
|---|---|
| `admin` | `מנהל` |
| `member` | `חבר` |
| `viewer` | `צפייה בלבד` |
| `agency_admin` | `מנהל סוכנות` |

The client tag stays.

### 5. Where the form lives

It is one client component, `CrmNewWorkspaceForm`, rendered in two places:
- on the new page `app/[locale]/(crm)/dashboard/crm/workspaces/new/page.tsx`, a Card under a back link, reached from a new side-menu item "workspace חדש" (`Plus` icon), shown to every role;
- in the CRM home's no-workspace state, in place of `setupPending`.

The other pages that show `setupPending` (team, business, api, the quote editor) keep their notice. They are only reached from the side menu, which now offers the form.

## Risks / Trade-offs

- [A malicious member invites many addresses and burns the shared Resend quota] → Each address is capped at 5 emails an hour, and an admin can remove the member. A per-workspace cap is left for when it's needed.
- [A person removed from every workspace can create their own] → Intended: anyone signed in may have a workspace. Sign-up stays invite-only.
- [The `?invite=unusable` parameter can be typed by hand] → It only shows a notice. It grants and reveals nothing.
- [Two pending invites for one address in different workspaces] → Each email's link names its own invite, so each joins its own workspace.
- [The switcher gets long] → Capped by 10 own workspaces, plus invitations. It already scrolls within its panel.

## Migration Plan

1. **Deploy the CRM backend only:** `firebase deploy --only apphosting:helix-crm`. There is no migration, so nothing runs first.
2. **Rollback:** roll back to the previous App Hosting revision. Memberships and workspaces created meanwhile stay valid under the old code, because the old `getWorkspace` still honours the cookie and memberships.
3. **Archive crm-team-invites before this change.** This change's `crm-team-invites` delta is MODIFIED, and archive refuses it until that capability's main spec exists.
