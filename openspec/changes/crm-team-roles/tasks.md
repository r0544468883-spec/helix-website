## 1. Record the starting state

- [ ] 1.1 Capture the current policy set from Supabase — `select tablename, policyname, cmd from pg_policies where schemaname='public' order by 1,2` — and save the output to `helix-crm/supabase/policy-snapshot-pre-v20.txt`. Verify the file lists one `ALL` policy for each of `crm_companies`, `crm_contacts`, `crm_deals`, `crm_activities` and `crm_tasks`, which is the state the rollback restores.
- [ ] 1.2 Record the current membership counts per role per workspace, so the spec's no-membership-row-changes scenario can be checked after the migration. Verify the counts are written into this change's design.md as a note.

## 2. The migration

- [ ] 2.1 Write the `crm_role(ws)` security-definer helper and the redefined `crm_is_member` into `helix-crm/supabase/migration-v20-role-enforcement.sql` per design decision 1. Verify by reading that `crm_is_member` still returns true for exactly the two cases it returned true for in v16 — a direct member, and an admin or agency_admin of the parent workspace.
- [ ] 2.2 Add the widened check constraints for `crm_members` and `crm_invites` to the same migration, both listing `admin`, `member`, `agency_admin`, `viewer`. Verify the statements drop the old constraint by name before adding the new one, so the migration is re-runnable.
- [ ] 2.3 Add the per-verb policies for `crm_companies`, `crm_contacts`, `crm_deals`, `crm_activities` and `crm_tasks` — select for any role, insert and update for admin/agency_admin/member, delete for admin/agency_admin — dropping the v16 blanket policy by name first. Verify each table ends with exactly four policies and that no `for insert` policy carries a `using` clause.
- [ ] 2.4 Add the per-verb policies for `automations` and the admin-only write policies for `autonomy_settings`, leaving `automation_runs` untouched. Verify `automation_runs` appears nowhere in the migration.
- [ ] 2.5 Append the v16 policy loop verbatim as a commented rollback block at the foot of the migration. Verify the block restores a blanket `for all using (crm_is_member(workspace_id))` on all five original tables.
- [ ] 2.6 Apply the migration in the Supabase SQL editor, then apply it a second time. Verify the second run completes without error and that `pg_policies` returns an identical set to the first run.
- [ ] 2.7 As the workspace admin, confirm read, create, update and delete all still work before any app code is deployed. Verify by creating a throwaway contact, editing it, then deleting it in the SQL editor under the admin's own session. If any of the four fails, run the rollback block and stop.

## 3. Roles in the application

- [ ] 3.1 Add `viewer` to the `Role` union in `helix-crm/lib/crm-workspace.ts`. Verify `npx tsc --noEmit` is clean, which surfaces every switch and comparison that needs to account for the new value.
- [ ] 3.2 Add the viewer role label and the Hebrew refusal messages — read-only account, admin required, invalid role — to `helix-crm/lib/i18n/he.ts` and `en.ts`. Verify `npx tsc --noEmit` is clean so the two dictionaries have not drifted.
- [ ] 3.3 Guard the data-write actions in `helix-crm/app/crm-actions.ts` — contact create and update, deal create and move, activity log — returning a read-only error for a viewer before touching the database. Verify a viewer's call to each returns the error and writes nothing.
- [ ] 3.4 Guard automation deletion in `helix-crm/app/automations-actions.ts` and the autonomy setter in `app/crm-actions.ts` to admin and agency_admin only. Verify a member's attempt at each is refused with the admin-required message while a member's automation edit still succeeds.
- [ ] 3.5 Validate the role argument in `crmInviteMember` and `crmSetRole` against the four assignable values instead of the current `role === 'admin' ? 'admin' : 'member'` collapse, which silently turns any unknown role into `member`. Verify inviting with the role `owner` is refused and creates no invite row.

## 4. Read-only interface

- [ ] 4.1 Offer `viewer` in both role dropdowns in `helix-crm/components/CrmTeamManager.tsx`, for inviting and for changing an existing member's role. Verify inviting a viewer records a pending invite whose role reads `viewer`.
- [ ] 4.2 Pass the role from the CRM pages into the screens that own write controls, and omit the add-contact button, the deal stage controls and the activity logger for a viewer. Verify a viewer's CRM home renders none of the three and that the markup contains no disabled write control.
- [ ] 4.3 Add the Hebrew read-only notice to the CRM home for a viewer, so the missing controls are explained rather than looking broken. Verify the notice renders for a viewer and for no other role.

## 5. Verification

- [ ] 5.1 Run the gates: `cd helix-crm && npx tsc --noEmit` and `npm run build`, both exit 0.
- [ ] 5.2 Prove enforcement is at the database, not the interface: with a viewer's session token and the public anon key, issue a direct insert, a direct update and a direct delete against `crm_contacts` in that workspace, outside the application. Verify all three are refused and no row is created, changed or removed.
- [ ] 5.3 Prove a member cannot destroy data: with a member's session token and the public anon key, issue a direct delete of one contact and a direct delete matching every deal in the workspace. Verify both are refused and the workspace's contact and deal counts are unchanged.
- [ ] 5.4 Confirm API keys are unaffected: call `GET /api/v1/crm/contacts` with a `contacts:read` key and `POST /api/v1/crm/contacts` with a `contacts:write` key. Verify both behave exactly as they did before the migration, regardless of the caller's workspace role.
- [ ] 5.5 Diff the policy set against `policy-snapshot-pre-v20.txt` and confirm the only changes are the intended ones on the seven tables, with nothing lost on any table this change did not name.
- [ ] 5.6 Walk every scenario in `specs/crm-team-roles/spec.md` on a signed-in session, including the 390px team screen and the mixed Hebrew and Latin member row. Report any scenario that could not be verified and why.
- [ ] 5.7 Confirm nothing outside `helix-crm/` changed: `git diff --name-only` lists only paths under `helix-crm/` and `openspec/changes/crm-team-roles/`.
