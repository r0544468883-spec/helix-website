---
name: code-review-ship
description: Plan and review feature or bug implementations so the smallest correct, reversible change ships. Use when planning a code change (files touched, tests, PR title and body, risks), reviewing a diff or pull request, validating Next.js App Router boundaries (Server vs Client Components, Server Actions, caching, middleware, metadata), or checking TypeScript and React patterns before merge. Covers reading surrounding code first, matching existing patterns, naming the specific tests, flagging risky changes (migrations, secrets, auth, money, breaking contracts) for human review, and never claiming a PR was opened or a deploy done. Not for QA verification runs (use qa-verification) or accessibility review (use accessibility-a11y).
---

# Code Review and Ship

## When to use
- Planning a feature or bug fix: deciding which files change, what tests to add, the PR write-up, and the risks.
- Reviewing a diff or pull request for correctness, security, and maintainability.
- Validating Next.js App Router code: Server/Client Component boundaries, Server Actions, data fetching, caching/revalidation, middleware, metadata.
- Checking React and TypeScript patterns before merge.

Not for: running verification commands and separating real from transient failures (use qa-verification), or accessibility conformance (use accessibility-a11y).

## Operative rules (always-on; mirrors the registry entry)
- PLAN = {files touched, the change per file, tests to add/update, PR title + body, risks}.
- Read the surrounding code first; match its patterns, naming, and comment density. Prefer editing existing structures over adding parallel ones.
- TESTS: name specific tests. Unit for logic, integration for wiring, one end-to-end for the user path. A change with runtime surface needs a test that exercises it, not just typecheck.
- RISK FLAGS (call out explicitly, never bury): schema/data migrations, secrets/env, breaking API/contract changes, anything irreversible, anything touching auth or money. Gate these for human review.
- NEVER claim a PR was opened or a deploy done. Those are separate gated actions.
- Verify the change does what it should by reasoning through the affected flow, not by assuming.

## Deep reference (the on-demand layer)

### Smallest correct reversible change
Before writing, ask: what is the minimal diff that makes the behavior correct? Prefer editing an existing function over adding a parallel one. Prefer a reversible change (a flag, an additive column) over a destructive one (a dropped column, a renamed public API). If the correct change is large, split it: land the reversible, low-risk part first behind a flag, then the rest.

### Read-first review method
1. Discover scope. For Next.js, glob for page.tsx, layout.tsx, loading.tsx, error.tsx, not-found.tsx, route.ts, middleware.ts in the touched segments.
2. Read the neighbors, not just the diff. Match the file's existing patterns, naming (lowercase-with-dashes dirs, named exports), and comment density.
3. Trace the affected runtime flow end to end. Reason about what actually executes, do not assume the happy path.
4. Verify each finding against the real code context before reporting it. Remove false positives; style preference is not a finding.

### Next.js App Router review checklist
Server vs Client boundaries:
- 'use client' sits as deep in the tree as possible, only where interactivity or a Web API is needed. A whole page marked client because one button needs onClick is a defect; extract the button.
- Server Components do not import client-only modules. Use the server-only package to catch server code leaking into client bundles.
- Data is fetched in Server Components, not client-side, for initial render.

Data fetching and caching:
- No request waterfalls. Independent fetches use Promise.all; independent sections stream under their own Suspense boundary with a skeleton fallback.
- fetch calls set explicit cache/revalidate. Prefer on-demand revalidatePath/revalidateTag over time-based when the mutation point is known.
- generateStaticParams for known static params; dynamic routes that must be static need it or the whole static build can break.
- Server-side data must not leak secrets to the client payload.

Server Actions:
- Every action validates input server-side (Zod or equivalent), checks authorization (session + role), and handles errors.
- Actions never expose a sensitive operation (delete, payment, role change) without an auth check. An unauthenticated delete action is critical.
- Optimistic updates via useOptimistic where the UX warrants; revalidate the affected path/tag after the mutation.

Middleware:
- Scoped with config.matcher to the routes that need it, never running on static assets.
- Returns NextResponse.next() on the pass path; redirect logic is correct and does not loop.

Metadata/SEO:
- generateMetadata for pages with variable content; static metadata export otherwise. Open Graph, canonical, robots, sitemap present where relevant.

Every route segment has its loading, error, and not-found states.

### React + TypeScript patterns
- Functional, declarative components; avoid classes. Prefer interfaces over type aliases for object shapes. Avoid enums; use const maps.
- Descriptive names with auxiliary verbs (isLoading, hasError). Named exports for components. File order: exported component, subcomponents, helpers, static content, types.
- Minimize 'use client', useEffect, and setState; favor Server Components. Wrap client components in Suspense with a fallback. Dynamic-import non-critical components.
- Images: modern format, explicit width/height (avoids CLS), lazy below the fold.
- URL state via nuqs rather than ad hoc useState where the state belongs in the URL.

### Naming the tests (not just "add tests")
Map each behavior to the cheapest test that exercises it:
- Pure logic (a reducer, a price calc, a bidi helper) -> a unit test with the boundary cases.
- Wiring (an action writing to the DB, a route returning a shape) -> an integration test.
- The user-visible path (submit the form, see the confirmation) -> one end-to-end test.
Typecheck and lint are necessary, not sufficient. A change with runtime surface that ships with only tsc green is unverified.

### Risk flags and gating
Call these out at the top of the plan/review, never bury them mid-list. Each gates human review before it applies:
- Schema or data migration (especially on PLUG prod, where db push is hazardous; author idempotent migrations, apply via dashboard SQL editor).
- Secrets or env changes.
- Breaking API or contract changes (a shape other code or the extension depends on).
- Anything irreversible (data deletion, a one-way backfill).
- Anything touching auth or money.
For shared PLUG/extension tables (profiles, applications, jobs), a change on one side may break the other; flag cross-project impact.

### The claim discipline
Planning or reviewing a change is not the same as shipping it. Never write "PR opened", "merged", or "deployed" as if done. Those are separate, gated actions a human or a later step performs. Report the plan or the review; state what still must happen.

## Anti-patterns / common mistakes
- Marking a whole page 'use client' for one interactive child.
- Sequential awaits that create a fetch waterfall instead of Promise.all + Suspense.
- A Server Action with no input validation or no authorization check.
- Middleware with no config.matcher, running on every asset.
- Adding a parallel helper instead of editing the existing one.
- Shipping with only typecheck, no test that exercises the change.
- Burying a migration or an auth change in the middle of a plan.
- Claiming the PR was opened or the change deployed.
- Reporting a review finding without confirming it against the actual code (false positive).

## Checklist before returning
- Plan has all five parts: files, per-file change, named tests, PR title + body, risks.
- Change is the smallest correct reversible one; edits existing structures over adding parallel ones.
- Next.js: client boundaries shallow-to-deep correct, no waterfalls, caching explicit, actions validated + authorized, middleware scoped, metadata present.
- Tests named per behavior; runtime surface is exercised, not just typechecked.
- Every risky change (migration, secrets, breaking contract, auth, money, irreversible) is flagged and gated.
- No claim of a PR opened or a deploy done.
- Findings verified against real code; no false positives.

## Sources
- nextjs-code-review (installed at ~/.claude/skills/): App Router review checklist, Server/Client boundaries, Server Action security, caching/revalidation, middleware matcher, severity-classified findings, verify-before-finalizing.
- nextjs-react-typescript (installed at ~/.claude/skills/): TypeScript/React conventions, interfaces over types, minimize 'use client', Suspense, image optimization, nuqs URL state.
- Registry operative entry "code-review-ship" (ai-kit/skills/registry.ts): plan shape, read-first, named tests, risk gating, no false completion claims.
