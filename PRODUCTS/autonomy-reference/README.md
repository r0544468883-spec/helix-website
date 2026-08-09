# Autonomy Switch — reference module (copy-in)

Canonical implementation of the 3-mode `advisor / approve / autopilot` switch.
Spec: `../AUTONOMY-SWITCH-SPEC.md`. This is the `@helix/channels`-style pattern —
copy the files into each product until a shared package is wired.

## Files
- `schema.sql` — `autonomy_settings` (+ optional `autonomy_actions` queue).
- `types.ts` — modes, risk classes, feature-key → risk map, `Degradation`.
- `resolve.ts` — `resolveMode()` (fail-safe, downgrade-only) + legacy adapters.
- `guard.ts` — `gate()` + `runAction()` (the universal executor choke point).
- `degradation.ts` — `sweep()` proactive loop (Von rule 3).

## Install per product (5 steps)
1. Copy `schema.sql` → `supabase/`, adjust the RLS predicate to the product's
   membership helper (`is_member` / `owns_site` / `memberships`). Run it.
2. Copy `types.ts`, `resolve.ts`, `guard.ts`, `degradation.ts` → `lib/autonomy/`.
3. Implement one `AutonomyStore` (a ~10-line Supabase query for the settings row).
4. In each executor feature, replace the direct write with:
   ```ts
   const mode = await resolveMode(store, workspaceId, 'sdr.outreach');
   await runAction(mode, { featureKey: 'sdr.outreach', summary, payload }, {
     display: showCard, enqueue: enqueueApproval, execute: sendNow,
   });
   ```
5. Add a settings UI row per feature_key (advisor / approve / autopilot + a
   risk_ack checkbox that only appears for outbound|money|tos features).

## Migrating a product that already has a switch
Don't rip out the old column yet. Expose the canonical mode via an adapter
(`fromOpsPerformance` / `fromSdrTrust` / `fromExtensionMode`) so shipped code
keeps working, then move to `autonomy_settings` when convenient.

## Invariants (do not break)
- Absent settings row ⇒ `advisor`. Autopilot is never implicit.
- `outbound | money | tos` autopilot requires `risk_ack`; otherwise downgraded
  to `approve` inside `resolveMode` — features never re-check this themselves.
- Every "act" goes through `runAction`. No feature writes to an external system
  outside the guard. This is what makes the switch trustworthy.
