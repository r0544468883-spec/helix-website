---
name: project-orchestration
description: Chief-of-Staff planning that turns goals plus recent activity into an executable, dependency-ordered plan. Use when producing a morning plan or evening summary, sequencing tasks across owner agents or departments, prioritizing a backlog by ICE, routing blockers, or standing up an internal issue tracker or kanban board (issues, states, cycles/sprints, sub-tasks, drag-to-reorder). Covers cadence discipline, evidence-only reporting, one next action per owner, and clean-room board mechanics (fractional rank keys, optimistic UI, realtime, activity log). Not for CEO-level strategy (use business-strategy) or code implementation planning (use code-review-ship).
---

# Project Orchestration

## When to use
- Turning a goal plus a stream of recent activity into a concrete plan someone can act on today.
- Running the daily cadence: a morning plan (what to do and why) and an evening summary (what the evidence shows actually happened).
- Sequencing work across multiple owner agents or departments where some tasks block others.
- Prioritizing a messy backlog down to the 5-7 tasks that matter.
- Surfacing and routing blockers to a named owner.
- Building or reviewing an in-house task tracker / kanban board (issues, workflow states, cycles, sub-tasks, drag-and-drop reorder).

Not for: setting company direction and bets (use business-strategy), or planning a specific code change (use code-review-ship).

## Operative rules (always-on; mirrors the registry entry)
- PLAN FORMAT: an ordered list where each task = {owner agent, task, why-now, priority, depends-on}. Dependencies come before dependents.
- Prioritize by ICE (Impact x Confidence x Ease). The top item is the single thing that most moves the current goal.
- CADENCE: produce a morning plan (what to do + why) and an evening summary (report ONLY what the context evidences, no fabrication).
- Surface blockers explicitly and route each to an owner.
- Keep tasks concrete and traceable to a goal; drop busywork that maps to no goal.
- One clear next action per owner.
- Do not over-plan: 5-7 real tasks beat 20 vague ones.

## Deep reference (the on-demand layer)

### The plan object, field by field
Every task line carries five fields. Missing any one makes the task unactionable:

| Field | What it answers | Failure if omitted |
|-------|-----------------|--------------------|
| owner agent | Who does it | Task sits unclaimed |
| task | The single concrete action | Ambiguity, re-planning |
| why-now | Which goal it serves this cycle | Busywork creeps in |
| priority | ICE rank vs the rest | Team does easy-not-important work |
| depends-on | What must finish first | Blocked work started early, stalls |

Write the task as a verb + object the owner can start without a follow-up question. "Draft the checkout A/B test spec" beats "look into checkout".

### ICE scoring in practice
Score each candidate 1-10 on Impact (how much it moves the current goal), Confidence (how sure you are it will), Ease (how cheap and fast). ICE = I x C x E. Rank descending. Two disciplines:
- The single highest ICE item is "the one thing". State it plainly at the top so the owner knows where to start if they only do one thing.
- Break ties toward reversibility and toward unblocking others. A task three others depend on outranks a slightly higher-scoring leaf task.

### Dependency ordering (topological, not chronological)
Sort so that no task appears before something it depends on. Practical method:
1. List every task with its depends-on set.
2. Emit all tasks with no unmet dependencies first (ordered by ICE among themselves).
3. Remove them, repeat until the list is empty.
4. If you hit a cycle (A needs B, B needs A), that is a planning defect. Flag it and propose the smallest split that breaks it.

### Morning plan vs evening summary
The two halves of the cadence have opposite epistemics:
- Morning plan is prospective. It may propose, estimate, and prioritize. Ground every task in a stated goal.
- Evening summary is retrospective and evidence-only. Report what the activity log / diffs / metrics actually show happened. Never write "shipped X" unless the evidence shows X shipped. If something is unconfirmed, mark it "unconfirmed" rather than asserting completion. This mirrors qa-verification's evidence standard: plausible is not the same as confirmed.

Evening summary skeleton: Done (with evidence), In progress, Blocked (owner + what unblocks), Carried to tomorrow.

### Blocker routing
A blocker is anything stopping a task that the owner cannot clear alone. For each: name it, name the single owner who can clear it, and name what "cleared" looks like. Do not let a blocker sit inside a task line unremarked; lift it to its own visible item.

### Worked example (morning plan)
Goal: raise trial-to-paid conversion this cycle.
1. [growth agent] Instrument the activation event in the funnel. why-now: every conversion bet needs this baseline. ICE 9x9x7=567. depends-on: none. THE ONE THING.
2. [cro agent] Draft the checkout-friction A/B spec. why-now: checkout is the suspected leak. ICE 8x6x6=288. depends-on: task 1 (needs the funnel numbers).
3. [content agent] Rewrite the pricing-page objection block. why-now: cheap, reversible. ICE 6x7x9=378. depends-on: none.
Blocker: analytics write-access is missing for the growth agent. Owner: platform lead. Cleared when: growth agent can emit events to the warehouse.

Note the ordering: task 3 outranks task 2 on raw ICE and has no dependency, so among the unblocked set it comes right after the one-thing; task 2 waits on task 1.

### Building the tracker (clean-room board mechanics)
When the plan needs a durable home, or the user asks for a task tracker / kanban board, build it from permissive parts (never copy plane, which is AGPL). The capability:
1. Issues: table with title, description, state_id, assignee_id, priority, cycle_id, parent_id (sub-tasks), sort_order, labels JSONB.
2. States/workflow: per-project states (name, group: backlog/unstarted/started/completed/cancelled, color, order). The completed group drives progress %.
3. Board: columns = states, cards = issues. Drag-and-drop with @dnd-kit (MIT). On drop, update state_id + sort_order.
4. Cycles/sprints: cycles table (name, start, end); issues reference a cycle. Burndown = completed vs total over the range.
5. Sub-tasks: parent_id self-reference with a child rollup on the parent.
6. Views: board, list, and a filter (assignee/label/priority/cycle). Persist last view per project.

Baked-in engineering rules:
- Fractional rank keys, not integers. Store a LexoRank-style string or numeric-gap rank so reordering one card is a single-row update. Rebalance lazily only when gaps run out. Never renumber the whole column.
- Optimistic UI via TanStack Query: move the card immediately, reconcile on server response, roll back on error.
- Realtime: subscribe to the issues table (Supabase Realtime) so a teammate's move appears live; dedupe against your own optimistic update.
- Append-only issue_activity log (who changed what, when) for the timeline.
- Multi-tenant RLS: scope projects/issues by tenant_id + membership; policies TO authenticated, never USING(true) for writes.
- Hebrew/RTL: columns and card text right-aligned; drag math is direction-agnostic but verify column order in RTL.
- Sanitize any AI-written issue body through the clean-text utility before save.

## Anti-patterns / common mistakes
- A 20-item plan. Real plans are 5-7 items; length signals you did not prioritize.
- Tasks with no owner or no why-now. Both are required.
- Listing a dependent before its dependency.
- Writing an evening summary from the morning plan (reporting intent as if it were outcome). Report evidence, not the plan.
- Burying a blocker inside a task instead of routing it to an owner.
- Integer sort columns in the board (forces a full renumber on every reorder).
- A board write policy of USING(true) (cross-tenant leak).

## Checklist before returning
- Every task has all five fields (owner, task, why-now, priority, depends-on).
- Dependencies precede dependents; no cycles.
- Tasks ranked by ICE; the one-thing is called out.
- 5-7 tasks, each traceable to a goal.
- Blockers lifted out and routed to a named owner with a clear "cleared" definition.
- Evening summary reports only what the context evidences; unconfirmed items marked as such.
- If a board is involved: fractional rank keys, optimistic + realtime with rollback, append-only activity log, multi-tenant RLS, RTL-checked, no plane code copied.

## Sources
- helix-project-management (installed at plug-nexus-ai-main/.claude/skills/): clean-room issue tracker / kanban capability, fractional rank keys, optimistic UI, realtime, activity log, multi-tenant RLS.
- Registry operative entry "project-orchestration" (ai-kit/skills/registry.ts): plan format, ICE, cadence, evidence-only reporting.
