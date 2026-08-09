# HELIX Autonomy Switch — Canonical Spec

**Status:** Phase 0 foundation (2026-08-09). Single source of truth for the
"advisor → executor" toggle across every HELIX product.

Inspired by Rattle/Von's methodology: (1) a **context graph** feeds every
decision, (2) the agent **acts, not just advises**, (3) it works **proactively**.
This spec operationalizes rule (2) as a standard, safe, per-feature switch — and
unifies the four different switches we already shipped under different names.

---

## 1. The three modes

Every executor feature runs in exactly one of three modes, **per workspace,
per feature**:

| Mode | Meaning | UX |
|------|---------|-----|
| `advisor` | Detect + display only. Never writes to an external system. | "יש נשירה ב-checkout" |
| `approve` | Draft the action, enqueue it, wait for a human ✓, then execute. (HITL) | notification with Approve/Reject |
| `autopilot` | Execute autonomously, log it, notify **after**. | "מצאתי X — עשיתי Y" |

**Safe default: `advisor`.** A workspace with no row for a feature is treated as
`advisor`. `autopilot` never turns on implicitly.

### Risk gating
Features are classified by blast radius:

- `internal` — writes only to our own DB (e.g. move a CRM deal, build a widget).
- `outbound` — sends to a customer / posts publicly (email, WhatsApp, social).
- `money` — spends money or affects spend (ad budget, paid launch).
- `tos` — gray-area vs a platform's terms (LinkedIn/IG auto-engagement, auto-apply).

For `outbound | money | tos`, `autopilot` requires an explicit, separate
`risk_ack = true` on the settings row. Without it, a request for `autopilot`
**silently downgrades to `approve`** (never to a riskier state). `internal`
features may go straight to `autopilot`.

---

## 2. How it maps onto what we already built

The switch is NOT greenfield. It renames + unifies existing per-product controls:

| Product | Existing control | Maps to |
|---------|-----------------|---------|
| HELIX OPS (ads) | `performance_settings.execution_mode` (brain/connector) × `autonomy` (approve/autopilot) | brain→`advisor`, connector+approve→`approve`, connector+autopilot→`autopilot` |
| HELIX OPS (engagement) | `engagement_actions.status` suggested→approved + kill-switch | suggested-only→`approve`; add `autopilot` |
| SDR-BDR | `workspaces.trust_level` (founder/growth/pro) | founder/growth→`approve`, pro→`autopilot` |
| Rank | `content_schedule.autopilot` + score-gate ≥70 (drafts only, never publishes live) | draft→`approve`; publish-live→new `autopilot` |
| PLUG extension | `job-agent` `mode: review / auto` | review→`approve`, auto→`autopilot` |
| Dashboards / Growth Doctor / STAGE-CRM | none (pure advisor; Growth-Doctor CTAs are fake stubs) | build from scratch, default `advisor` |

Existing tables stay. A thin adapter reads the legacy column and returns the
canonical mode, so we migrate incrementally without breaking shipped code.

---

## 3. Canonical data model

One table, added per product (copy `schema.sql`):

```sql
create table if not exists autonomy_settings (
  workspace_id  uuid not null,
  feature_key   text not null,           -- see per-product FEATURE_KEYS below
  mode          text not null default 'advisor'
                check (mode in ('advisor','approve','autopilot')),
  risk_ack      boolean not null default false,  -- required for outbound/money/tos autopilot
  daily_cap     int,                     -- optional per-feature action ceiling
  updated_by    uuid,
  updated_at    timestamptz default now(),
  primary key (workspace_id, feature_key)
);
```

Products that already have an approval queue (SDR `approval_queue`, OPS
`performance_decisions`) reuse it. Products that don't get the shared
`autonomy_actions` queue from `schema.sql`.

---

## 4. Per-product feature keys

Stable strings so the switch is consistent everywhere:

| Product | feature_key | risk |
|---------|-------------|------|
| OPS | `ops.engagement`, `ops.ads`, `ops.campaign_publish`, `ops.radar_outreach`, `ops.landing_publish` | tos, money, outbound, outbound, internal |
| SDR | `sdr.outreach`, `sdr.inbound_reply`, `sdr.lifecycle`, `sdr.enrich_trigger` | outbound, outbound, outbound, internal |
| Rank | `rank.publish`, `rank.patch`, `rank.edit_page`, `rank.meta_fix` | outbound, outbound, tos*, tos* |
| PLUG | `plug.apply`, `plug.autofill`, `plug.social_engage` | tos, tos, tos |
| Dashboards | `dash.build_widget`, `dash.cross_act` | internal, (delegates) |
| Growth Doctor | `gd.ab_test`, `gd.edit_landing`, `gd.campaign`, `gd.winback` | internal, tos, outbound, outbound |
| STAGE-CRM | `crm.deal_move`, `crm.followup`, `crm.next_step` | internal, outbound, internal |

\* editing a live external site is treated as `tos`-level (needs `risk_ack`).

---

## 5. The proactive layer (Von rule 3)

A shared **degradation detector** pattern every product implements once:
`detect() → { entity, metric, direction, severity }`. The same shape everywhere —
deal / ad / ranking / cohort / application "slipping". Its output feeds the guard:
`advisor` → alert only; `approve` → enqueue a remediation; `autopilot` → remediate
+ notify. See `degradation.ts` in the reference.

---

## 6. Rollout order (checkpointed)

0. **Foundation** (this doc + reference module). ← current
1. Growth Doctor — replace fake CTA stubs with real HITL actions (integrity fix first).
2. Half-switch products — SDR proactive trigger, OPS unify, Rank publish-behind-switch + `edit_page`.
3. No-switch products — Dashboards, STAGE-CRM.
4. Central context graph (Dashboards `metric_points` as hub) + cross-product degradation engine.
5. Update every product marketing page to reflect "now acts, not just advises" + expose the switch UI.

Safe defaults everywhere; autopilot is opt-in per feature; commit locally, push per approved phase.
