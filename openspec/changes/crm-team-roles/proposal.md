## Why

Eran is about to invite people into his CRM workspace, and the roles he will assign them do not restrict anything. Row-level security on every CRM table is a single `for all using (crm_is_member(workspace_id))` policy, so `admin` and `member` have identical rights over the workspace's data: both can read, edit and delete every contact, company, deal, activity and task. The `role` column is checked in exactly three places — the server actions that invite a member, change a role, and remove a member — which makes `member` mean "a co-admin who cannot manage the team". There is no read-only role to hand someone who should see the pipeline without changing it. The exposure is not a UI slip, because the CRM ships no delete button at all; it is that the Supabase anon key is public by design, so anyone holding a workspace member's session can delete that workspace's entire dataset with a direct API call, and nothing in the product would stop it or record who did it.

**Surface: `helix-crm/` only**, plus one SQL migration applied to the shared Supabase project. No file outside `helix-crm/` changes, and no marketing-site route is touched.

## What Changes

- **A third role, `viewer`.** Read-only: sees contacts, companies, deals, activities and tasks, and cannot create, edit or delete any of them. Invitable from the team screen like the existing two.
- **RLS split by verb instead of one blanket `for all`.** A new `crm_role(ws)` helper resolves the caller's effective role once, including the agency-admin inheritance that already exists, and each CRM table gets separate read, write and delete policies driven by it.

  ```
                     select  insert  update  delete
  viewer               yes      -       -       -
  member               yes     yes     yes      -
  admin                yes     yes     yes     yes
  agency_admin         yes     yes     yes     yes
  ```

- **Deleting workspace data becomes admin-only** on `crm_contacts`, `crm_companies`, `crm_deals`, `crm_activities` and `crm_tasks`. No existing screen loses a button, because no screen ever offered one.
- **BREAKING for members, deliberately:** deleting an automation moves to admin-only, and changing an autonomy setting — the control over whether an AI agent acts without asking — moves to admin-only. A member keeps creating and editing automations. These are the only two capabilities an existing member loses.
- **Server actions refuse writes they know will fail**, returning a Hebrew reason instead of surfacing an opaque database error. RLS stays the enforcement boundary; the action check exists so a viewer is told why, not left staring at a failure.
- **Write controls are hidden from a viewer** rather than rendered and then rejected.
- **Two check constraints are corrected.** `crm_invites.role` still allows only `('admin','member')`, so inviting an `agency_admin` has been impossible since v16 widened `crm_members` without widening `crm_invites`. Both constraints gain `viewer`, and the invites constraint gains the `agency_admin` it should already have had.

## Capabilities

### New Capabilities
- `crm-team-roles`: what each role in a CRM workspace may do to workspace data, how that is enforced rather than merely displayed, and how a restricted user is told why an action is unavailable.

### Modified Capabilities
None. `openspec list --specs` returns an empty set, so there is no durable capability whose requirements this change alters.

## Impact

**Database (`helix-crm/supabase/`)** — new `migration-v20-role-enforcement.sql`: adds the `crm_role(ws)` security-definer helper, redefines `crm_is_member` in terms of it so existing references keep working, replaces the blanket policy on the five CRM tables plus `automations` and `autonomy_settings` with per-verb policies, and widens the `crm_members` and `crm_invites` role check constraints to include `viewer`.

**Workspace resolution (`helix-crm/lib/crm-workspace.ts`)** — the `Role` union gains `viewer`. The existing invite-claim path already inserts whatever role the invite carries, so a viewer invite needs no new code there.

**Server actions (`helix-crm/app/crm-actions.ts`, `app/automations-actions.ts`)** — contact, deal and activity writes gain a role guard; automation deletion and autonomy changes gain an admin guard.

**UI (`helix-crm/components/`)** — the team screen offers `viewer` in both role dropdowns; the add-contact button, the board's stage controls, the activity logger and the automation editor render read-only for a viewer.

**API keys — explicitly unaffected.** `lib/crm-api.ts` authenticates keys and then acts through the service-role client, which bypasses RLS entirely; key permissions come from the existing scope list, which has no delete scope. This change neither widens nor narrows what an API key can do, and that separation is worth stating because it is the one path where RLS is not the boundary.

**i18n (`helix-crm/lib/i18n/he.ts`, `en.ts`)** — the viewer role label and the Hebrew refusal messages, in both dictionaries.

## Non-goals

- **Not per-record ownership.** A member still sees the whole workspace; there is no "only the leads assigned to me". `crm_contacts.owner_id` exists but is the creating user, not an assignment, and turning it into one is a separate change.
- **Not an audit log.** This change stops a member from deleting data. It does not record who changed what. Knowing that would need a history table and is worth its own change.
- **Not per-field permissions**, and not restricting who may read. Every role reads everything in the workspace; the split is on writing.
- **Not touching API key scopes**, the agency/client workspace hierarchy, or invite expiry.
- **Not restoring anything already deleted.** If data was already lost this does not recover it.
- **Not the contact status, drawer or comms work.** That is `crm-contact-drawer-and-status`, a separate change.
