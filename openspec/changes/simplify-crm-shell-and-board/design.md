## Context

See `proposal.md` — Why, for the motivation. The constraints that shape the approach:

- **The root layout sits at `app/[locale]/layout.tsx`.** There is no `app/layout.tsx`; everything under `app/` that is not `[locale]` is a route handler (`api/`, `auth/`, `embed/`). That file owns `<html>`, `<body>`, the three Google fonts, and `globals.css`, and it is also where the five directory-chrome components mount. Next.js permits exactly one root layout on a path, so the document shell has to stay at `[locale]` and any grouping happens beneath it.
- **`lib/motion/` is a hand-written, zero-dependency spring engine** with `createSpring`, `SPRINGS`, `VelocityTracker`, `project()` and `rubberband()`, plus `Sheet`, `Drawer`, `Dialog`, `Material`, `Pressable`, `Scrim`, `ResizablePanel`, `CommandPalette` and `useFlip`. Only the last two are imported anywhere.
- **Two latent defects sit directly in this change's path.** `lib/motion/tokens.css` defaults `--hm-surface` to cream and only darkens under `@media (prefers-color-scheme: dark)`, while the CRM is unconditionally dark. `useFlip` captures `getBoundingClientRect().top` and animates `translateY` only, so on a six-column board it animates nothing for the cross-column move it was added to smooth.
- **`crmMoveDeal` already returns `{ ok: true }` or `{ error }`.** The board discards it: `startTransition(() => { void crmMoveDeal(...) })`. The failure path exists on the server and is thrown away on the client.
- **Tailwind v4, no config file.** Tokens live in `@theme` in `app/globals.css`.
- **The board page is `force-dynamic`** and runs three Supabase queries per render; every mutation calls `revalidatePath`.

## Goals / Non-Goals

**Goals:**
- Separate CRM chrome from directory chrome structurally, so the split cannot drift back by someone adding a component to a shared layout.
- Add drag-and-drop and record search without adding a dependency.
- Keep every URL and every STAGE page working.
- Fix the two latent defects in the same pass, since both sit under the surfaces being changed.

**Non-Goals:**
- Any change to `lib/motion/`'s public API. Components consuming it elsewhere must not need edits.
- Server-side search or paging past the existing `limit(200)`.
- Introducing a state manager, a data-fetching library, or a drag library.

## Decisions

### 1. Route groups, not runtime pathname checks

Split `app/[locale]/` into `(crm)/` and `(stage)/`. `app/[locale]/layout.tsx` is reduced to `<html>`, `<body>`, fonts and `globals.css`. `(crm)/layout.tsx` renders `Nav` + `children` + `Footer`. `(stage)/layout.tsx` renders exactly what the layout renders today, ambience included. Route groups do not appear in the URL, so every path is byte-identical.

`app/[locale]/page.tsx` stays outside both groups — it only calls `redirect()` and renders nothing, so it needs no chrome.

*Rejected: sniffing `usePathname()` in the shared layout.* It forces a client boundary at the document root, still ships `CursorTrail` and `FloatingBackground` in the bundle for every CRM page, and turns a structural fact into a runtime conditional that the next person has to remember to update.

*Rejected: a second Next.js app.* The chrome split does not justify a second build, a second deploy target, and a duplicated auth session.

*Rejected: deleting the STAGE pages.* Explicit non-goal in the proposal. `git mv` keeps their history intact so a later deletion is still a clean diff.

### 2. Drag-and-drop on Pointer Events, reusing the existing spring engine

Pointer down on a card captures the pointer, lifts the card to a fixed-position layer following the pointer 1:1, and hit-tests stage columns with `getBoundingClientRect()` on each move. Release commits to the column under the pointer, or springs the card home if there is none.

*Rejected: `dnd-kit` or `react-dnd`.* CLAUDE.md's reuse-before-build rule cuts the other way here: the repo already carries a purpose-built motion layer with `VelocityTracker`, `project()` and `rubberband()` written for exactly this gesture. Adding a drag library means a new dependency, a second animation vocabulary in one component, and a bundle cost for behaviour already implemented.

*Rejected: the HTML5 drag-and-drop API.* No touch support without a polyfill, near-zero control over the drag image, and it cannot hand off to a spring.

Hit-testing by rectangle rather than by column index is what makes RTL work without a special case: `getBoundingClientRect()` is viewport-absolute, so a right-to-left column order needs no arithmetic inversion.

### 3. The chevrons stay

Drag is an enhancement over a working keyboard path, never a replacement. The `‹` and `›` controls remain, gain a visible focus ring, and route through the same optimistic move as a drag. This is what satisfies the keyboard-equivalence requirements in `specs/crm-pipeline/spec.md` and keeps the board usable under ת"י 5568.

### 4. Extend `useFlip` to both axes rather than dropping it

`useFlip` captures `rect.top` and animates `translateY`. Extend it to capture `left` as well and animate `translate(x, y)`; when `dx` is zero the behaviour is identical to today, so its other potential consumers are unaffected.

*Rejected: leaving `useFlip` vertical and animating the board by hand.* It would leave a hook in the tree whose documented purpose ("when a list reorders, rows FLOW to their new positions") is false for the only board that uses it, and the next person to reach for it on a horizontal layout hits the same dead end.

### 5. Override the motion tokens in the CRM, do not edit the shared file

`lib/motion/tokens.css` documents itself as accent-agnostic and per-product overridable. Import it once from `app/globals.css` and override `--hm-surface`, `--hm-surface-solid`, `--hm-border`, `--hm-shadow`, `--hm-scrim` and `--hm-accent` at `:root`, unconditionally, with the CRM's dark values. Drop the per-component `import '@/lib/motion/tokens.css'` from `HelixCommandBar`.

*Rejected: making `tokens.css` dark by default.* It is a shared, product-agnostic file; hard-coding one product's theme into it moves the bug to the next product instead of fixing it.

This fixes the cream-palette defect for every overlay at once, including the command palette that has it in production today.

### 6. `Drawer` for the header overflow, `Sheet` for the contact form

Both primitives exist, handle their own scrim, Escape and focus return, and `Drawer` takes `side: 'start' | 'end'` which already resolves correctly under RTL. On a 390px viewport a drawer and a sheet are both better than a dropdown anchored to a cramped header.

*Rejected: a CSS-only dropdown.* It would need its own focus trap, Escape handling and outside-click logic — all of which `Drawer` already has.

### 7. The palette loads records through a server action, on first open

`HelixCommandBar` mounts in the layout and has no workspace context. On first open it calls a server action that resolves the caller's active workspace server-side and returns a trimmed index of contacts and open deals. The result is held for the session and dropped when the workspace cookie changes.

*Rejected: passing records as props from the layout.* It would serialize up to 200 contacts into the HTML of every CRM page, including pages that never open the palette.

*Rejected: a new `/api/` route.* The proposal excludes new API routes, and a route would have to re-implement the workspace resolution that `getWorkspace()` already does for server actions.

Resolving the workspace inside the action — never from a client-supplied id — is what enforces the cross-workspace isolation scenario in `specs/crm-search/spec.md`.

### 8. The board's footer back-link is removed, not retargeted

The board is the application's home screen; `/[locale]/page.tsx` redirects to it. A "back" link on the home screen has no correct destination, and `Nav` already carries navigation.

### 9. Optimistic moves via `useOptimistic`, with the discarded error re-surfaced

`CrmDealBoard` is already a client component receiving deals as props. Wrap them in `useOptimistic`, apply the pending stage on release, and let `revalidatePath` reconcile. `crmMoveDeal`'s existing `{ error }` return stops being discarded: the board reads it, and on failure `useOptimistic` unwinds to the server value on its own, so the revert requires no manual bookkeeping — only the message does.

## Risks / Trade-offs

- **Touch drag versus page scroll on mobile** → A card that claims the pointer immediately makes the board unscrollable on a phone. Start the drag only after a press of at least 200ms or 8px of movement along the column axis, and apply `touch-action` only once the drag is armed.
- **A 26-directory move produces a large diff that buries the real edits** → Do the move as its own commit using `git mv`, with no content edits in it, so the behavioural commits stay readable and history follows each file.
- **`useOptimistic` fights `revalidatePath` on a `force-dynamic` page** → The reconcile re-runs three queries and can land after the optimistic state clears, producing a flicker. Keep the optimistic overlay alive until the transition settles, and verify a slow-network move end to end rather than a local one.
- **`git subtree` divergence** → `helix-crm/` is a subtree of `r0544468883-spec/helix-crm`. A restructure of this size will conflict with any upstream work on the same paths. Check for upstream commits before starting, and push the result back deliberately rather than letting the next `subtree pull` resolve it.
- **The palette's record index goes stale within a session** → A contact created after the palette's first open will not be findable until the index refreshes. Refresh it on workspace change and after a successful contact creation; accept staleness otherwise rather than re-fetching on every open.
- **Removing ambience is visible to anyone who liked it** → It is a deliberate, reversible change: the components stay on disk and keep rendering on `(stage)`. Restoring them on the CRM is one import.

## Migration Plan

No data migration, no schema change, no deploy-pipeline change. `helix-crm/` continues to build and deploy independently to its own App Hosting backend (`crm.helix.co.il`); the website's static Hosting export, its `apphosting.yaml`, and the root `firebase.json` ignore list are untouched.

Deploy order is a single deploy of the CRM backend. Rollback is a revert of the range and a redeploy — there is no forward-only step, no persisted state written by this change, and no URL that exists only after it.

The one verification that must happen before the behavioural work starts: every path listed in the URL scenario of `specs/crm-shell/spec.md` returns 200 after the route-group move and before anything else changes.

## Open Questions

- Whether the header overflow should also hold the workspace switcher when more than three workspaces are accessible. It affects only the drawer's contents, not the structure, and can be answered after the drawer exists.
