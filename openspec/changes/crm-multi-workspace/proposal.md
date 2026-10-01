## Why

On 2026-09-29 Eran asked for the CRM to work like Slack or Notion. One person has one account, can belong to several workspaces with a different role in each, and can have a workspace of their own. He also asked that any member, not only an admin, can invite people.

He had just invited a friend. The friend may want his own workspace for his own business and also be a member in Eran's. Today that is impossible, for three reasons:
- **A second invite is never claimed.** Workspace resolution (`getWorkspace`) claims an invite only for someone with no workspace yet. An invite to someone who already belongs to one stays pending forever. The crm-team-invites change listed this as a non-goal.
- **Nobody can create a workspace of their own.** That path was removed on 2026-09-05, when sign-up became invite-only. Only an agency admin can create "client workspaces" under their own.
- **Only an admin can invite.**

The foundation is already there:
- `crm_members` keys a membership on (workspace, user), so one account can hold many.
- The database's `crm_role(workspace)` enforces the role per workspace (v20).
- The workspace switcher and the active-workspace cookie already move a person between workspaces.

This change fills in the missing ways in and out of that model.

Agreed the same day:
- **Own workspace on demand:** a "workspace חדש" item in the side menu. It is not created automatically for every new account.
- **A member invites as member or viewer only.** An admin gives any role. A member resends or cancels only the invites they sent.
- **Clicking the invite email is the "yes".** It adds the person and opens that workspace, even if they already have one.
- **The button lives in the side menu.** The switcher still appears only with two or more workspaces, as Eran asked on 2026-09-28.

**Surface: `helix-crm/` only.** No database migration: every table and function it needs exists. Nothing on the marketing site changes.

## What Changes

- **"workspace חדש" in the side menu** opens a short form: the workspace's name, then "יצירת workspace".
  - The person becomes its admin and lands in it, empty and ready.
  - One person can create up to 10 workspaces.
  - Someone signed in with no workspace at all is offered the same form, instead of the "ask for an invite" notice.
- **An invite joins even when the person already has a workspace.**
  - The invite email's button carries the invite. Pressing "כניסה" adds the person with the invite's role and opens that workspace.
  - Their other workspaces stay in the switcher.
  - An invite that expired, was cancelled, or was sent to another address joins nothing, and the page says so.
- **Any member can invite.**
  - The Team screen shows the invite form to members too, offering only `חבר` and `צפייה בלבד`. Admins keep every role.
  - A member sees "שליחה שוב" and "ביטול ההזמנה" on the invites they sent. An admin sees them on all invites.
  - Changing roles and removing people stay admin-only.
  - A viewer still can't invite.
- **The switcher shows the role you hold in each workspace** (`מנהל` · `חבר` · `צפייה בלבד`), since it now differs from row to row.
- **"Manage the team" follows DESIGN.md §9.** It means `admin` or `agency_admin`, not `admin` only as the code checks today.

## Capabilities

### New Capabilities
- `crm-workspaces`:
  - creating your own workspace, and its limit;
  - joining another workspace from an invite while already in one;
  - landing in the joined or created workspace;
  - the switcher's role labels;
  - the no-workspace screen.

### Modified Capabilities
- `crm-team-invites`:
  - who may invite and with which roles;
  - who may resend or cancel an invite.

  Its main spec is created when the crm-team-invites change is archived, so that change must be archived before this one.

## Non-goals

- **Leaving a workspace yourself.** An admin can remove anyone, as today.
- **Deleting or renaming a workspace.** Renaming stays where it is today, through the branding settings.
- **Accept or decline inside the CRM, for invites never clicked.** They stay pending until the email is used or they expire.
- **Moving data between workspaces, or one person's view across all of them.**
- **Nested client workspaces.** The agency "client workspace" card on the Team screen stays as it is, a separate kind of workspace.
- **Billing, or a cap on members per workspace.**

## Impact

**Server (`helix-crm/app/crm-actions.ts`, `helix-crm/app/auth-actions.ts`, `helix-crm/lib/`):**
- A new `crmCreateWorkspace`. It needs a signed-in user, not a workspace, so it can't use `ctx()`.
- `crmInviteMember`, `crmResendInvite` and `crmCancelInvite` get the member rules.
- The invite link carries the invite's id. `confirmAccessLink` claims that invite for the signed-in address and sets the active workspace.
- A shared helper claims one invite, used both there and by `getWorkspace`'s existing first-claim.

**Screens:**
- A new `/{locale}/dashboard/crm/workspaces/new` page.
- The side menu gains "workspace חדש".
- The CRM home's no-workspace state offers the form.
- The Team screen changes for members.
- The switcher rows show a role label.

**Docs:** `helix-crm/DESIGN.md` (the new page, the side-menu item, the switcher row, the Team screen for members) and `lib/i18n/{he,en}.ts`.

**Deploy:** only the CRM's App Hosting backend. No migration, so nothing for Eran to run first.
